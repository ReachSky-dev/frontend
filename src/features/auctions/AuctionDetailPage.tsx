import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError } from '../../api/client'
import type { AuctionDto, AuctionStatus, AuctionType } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { useCancelAuction } from './useCancelAuction'
import { useAuction } from './useAuction'

type BadgeVariant = 'success' | 'warning' | 'error' | 'default'

const statusVariant: Record<AuctionStatus, BadgeVariant> = {
  DRAFT:            'default',
  SCHEDULED:        'warning',
  RUNNING:          'success',
  SOLD:             'success',
  RESERVE_NOT_MET:  'error',
  CANCELLED:        'error',
  SETTLED:          'default',
}

const statusLabel: Record<AuctionStatus, string> = {
  DRAFT:            'Szkic',
  SCHEDULED:        'Zaplanowana',
  RUNNING:          'Trwa',
  SOLD:             'Sprzedana',
  RESERVE_NOT_MET:  'Rez. niespełniona',
  CANCELLED:        'Anulowana',
  SETTLED:          'Rozliczona',
}

const typeLabel: Record<AuctionType, string> = {
  ENGLISH: 'Aukcja angielska',
  DUTCH:   'Aukcja holenderska',
}

// ── Odliczanie ─────────────────────────────────────────────────────────────────
// Służy wyłącznie wyświetleniu pozostałego czasu.
// Status aukcji (RUNNING → SOLD itp.) pochodzi z serwera, nigdy z porównania dat.
function useCountdown(endsAt: string) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(endsAt).getTime() - Date.now()),
  )

  useEffect(() => {
    // Resetuj po zmianie endsAt (np. nowe dane z serwera)
    setRemaining(Math.max(0, new Date(endsAt).getTime() - Date.now()))

    const id = setInterval(() => {
      const ms = Math.max(0, new Date(endsAt).getTime() - Date.now())
      setRemaining(ms)
      if (ms === 0) clearInterval(id)
    }, 1_000)

    return () => clearInterval(id)
  }, [endsAt])

  const h = Math.floor(remaining / 3_600_000)
  const m = Math.floor((remaining % 3_600_000) / 60_000)
  const s = Math.floor((remaining % 60_000) / 1_000)
  return { h, m, s, remaining }
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function AuctionDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-1/2" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// ── Zawartość po załadowaniu aukcji ────────────────────────────────────────────
// Wydzielona, żeby hooki były wywoływane zawsze z defined auction — bez dummy objects.
function AuctionDetail({
  auction,
  refetch,
}: {
  auction: AuctionDto
  refetch: () => void
}) {
  const auth = useAuth()
  const { mutate: cancel, isPending: isCancelling } = useCancelAuction()
  const [cancelError, setCancelError] = useState<string | null>(null)

  const countdown = useCountdown(auction.endsAt)

  // Wymuś refetch dokładnie na granicy kroku cenowego (aukcja holenderska).
  // Cena holenderska jest SCHODKOWA — klient jej nie liczy, backend jest źródłem prawdy.
  // Localnie liczymy tylko czas do następnej granicy, żeby refetch trafił o właściwej chwili.
  useEffect(() => {
    if (auction.type !== 'DUTCH' || auction.status !== 'RUNNING') return
    const { stepSeconds, startsAt } = auction
    if (typeof stepSeconds !== 'number' || stepSeconds <= 0) return

    const elapsedSec = (Date.now() - new Date(startsAt).getTime()) / 1_000
    const nextStepMs = (Math.ceil(elapsedSec / stepSeconds) * stepSeconds - elapsedSec) * 1_000
    const delay = Math.max(nextStepMs, 0) + 200 // 200 ms buforu po skoku

    const id = setTimeout(() => { void refetch() }, delay)
    return () => clearTimeout(id)
  }, [auction, refetch])

  // UWAGA: Widoczność przycisku anulowania to tylko UI — backend waliduje każde żądanie
  // niezależnie od roli i własności po stronie klienta.
  const currentUserId = auth.user?.profile.sub
  const isOwner = auction.sellerId === currentUserId
  const canCancel = isOwner && (auction.status === 'SCHEDULED' || auction.status === 'RUNNING')

  function handleCancel() {
    setCancelError(null)
    cancel(auction.id, {
      onError: (err) => {
        setCancelError(err instanceof ApiError ? err.title : 'Nie udało się anulować aukcji')
      },
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink />

      <div className="mt-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">{typeLabel[auction.type]}</p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-100">Aukcja</h1>
          </div>
          <Badge variant={statusVariant[auction.status]}>{statusLabel[auction.status]}</Badge>
        </div>

        {/* Cena bieżąca — wartość z serwera, odświeżana co 5 s (refetchInterval).
            Cena holenderska jest schodkowa; klient jej nie interpoluje. */}
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-6 text-center">
          <p className="text-sm text-zinc-500">Cena bieżąca</p>
          <p className="mt-2 text-4xl font-bold text-violet-400">
            {formatMoney(auction.currentPriceAmount, auction.currentPriceCurrency)}
          </p>

          {auction.status === 'RUNNING' && countdown.remaining > 0 && (
            <p className="mt-2 text-sm text-zinc-500">
              Koniec za:{' '}
              <span className="font-mono text-zinc-300">
                {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
              </span>
            </p>
          )}

          {auction.type === 'DUTCH' && auction.status === 'RUNNING' &&
           typeof auction.stepSeconds === 'number' && (
            <StepCountdown startsAt={auction.startsAt} stepSeconds={auction.stepSeconds} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoCell label="Start" value={formatDateTime(auction.startsAt)} />
          <InfoCell label="Koniec" value={formatDateTime(auction.endsAt)} />
          {auction.type === 'DUTCH' && typeof auction.decrementAmount === 'number' && (
            <>
              <InfoCell label="Obniżka co" value={`${auction.stepSeconds ?? '?'} s`} />
              <InfoCell
                label="Kwota obniżki"
                value={formatMoney(
                  auction.decrementAmount,
                  auction.decrementCurrency ?? auction.currentPriceCurrency,
                )}
              />
            </>
          )}
        </div>

        {cancelError && <p className="text-sm text-red-400">{cancelError}</p>}

        {canCancel && (
          <div className="flex justify-end">
            <Button
              variant="secondary"
              buttonSize="sm"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? 'Anulowanie…' : 'Anuluj aukcję'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Odliczanie do następnego kroku — wyłącznie wizualne.
function StepCountdown({ startsAt, stepSeconds }: { startsAt: string; stepSeconds: number }) {
  const [msToStep, setMsToStep] = useState(() => {
    const elapsedSec = (Date.now() - new Date(startsAt).getTime()) / 1_000
    return Math.max(0, (Math.ceil(elapsedSec / stepSeconds) * stepSeconds - elapsedSec) * 1_000)
  })

  useEffect(() => {
    const id = setInterval(() => {
      const elapsedSec = (Date.now() - new Date(startsAt).getTime()) / 1_000
      setMsToStep(Math.max(0, (Math.ceil(elapsedSec / stepSeconds) * stepSeconds - elapsedSec) * 1_000))
    }, 500)
    return () => clearInterval(id)
  }, [startsAt, stepSeconds])

  const s = Math.ceil(msToStep / 1_000)
  return (
    <p className="mt-1 text-xs text-zinc-600">
      Następna obniżka za: <span className="font-mono">{s} s</span>
    </p>
  )
}

// ── Główna strona ──────────────────────────────────────────────────────────────
export function AuctionDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: auction, isPending, isError, error, refetch } = useAuction(id)

  if (isPending) return <AuctionDetailSkeleton />

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl">
        <BackLink />
        <div className="mt-6 rounded-lg border border-red-800/50 bg-red-950/30 p-8 text-center">
          <p className="font-medium text-red-400">
            {error instanceof ApiError
              ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
              : 'Błąd ładowania aukcji'}
          </p>
          <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={() => void refetch()}>
            Ponów
          </Button>
        </div>
      </div>
    )
  }

  if (!auction) {
    return (
      <div className="mx-auto max-w-2xl">
        <BackLink />
        <div className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-400">Nie znaleziono aukcji.</p>
        </div>
      </div>
    )
  }

  return <AuctionDetail auction={auction} refetch={() => void refetch()} />
}

function BackLink() {
  return (
    <Link to="/auctions" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
      ← Wróć do aukcji
    </Link>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value}</p>
    </div>
  )
}
