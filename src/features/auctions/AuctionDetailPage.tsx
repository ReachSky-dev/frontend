import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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

// ── Lokalna interpolacja ceny holenderskiej ────────────────────────────────────
// UWAGA: klient interpoluje cenę WYŁĄCZNIE dla płynności wyświetlania.
// Backend jest jedynym źródłem prawdy. Wartość z serwera zawsze wygrywa.
// Aukcja odpytywana jest co 5 sekund (useAuction → refetchInterval: 5000).
function useInterpolatedPrice(auction: AuctionDto, dataUpdatedAt: number): number {
  const [price, setPrice] = useState(auction.currentPriceAmount)

  useEffect(() => {
    setPrice(auction.currentPriceAmount)

    const { decrementAmount, stepSeconds } = auction
    if (auction.type !== 'DUTCH' || typeof decrementAmount !== 'number' || typeof stepSeconds !== 'number') {
      return
    }

    const id = setInterval(() => {
      const elapsedMs = Date.now() - dataUpdatedAt
      const steps = Math.floor(elapsedMs / (stepSeconds * 1_000))
      setPrice(Math.max(auction.currentPriceAmount - steps * decrementAmount, 0))
    }, 500)

    return () => clearInterval(id)
  }, [auction, dataUpdatedAt])

  return price
}

// ── Odliczanie do końca aukcji ─────────────────────────────────────────────────
function useCountdown(endsAt: string) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(endsAt).getTime() - Date.now()),
  )
  useEffect(() => {
    if (remaining === 0) return
    const id = setInterval(() => {
      setRemaining(Math.max(0, new Date(endsAt).getTime() - Date.now()))
    }, 1_000)
    return () => clearInterval(id)
  }, [endsAt])

  const h = Math.floor(remaining / 3_600_000)
  const m = Math.floor((remaining % 3_600_000) / 60_000)
  const s = Math.floor((remaining % 60_000) / 1_000)
  return { h, m, s, expired: remaining === 0 }
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

// ── Główna strona ──────────────────────────────────────────────────────────────
export function AuctionDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: auction, isPending, isError, error, refetch, dataUpdatedAt } = useAuction(id)
  const { mutate: cancel, isPending: isCancelling } = useCancelAuction()
  const [cancelError, setCancelError] = useState<string | null>(null)

  const displayPrice = useInterpolatedPrice(
    auction ?? { currentPriceAmount: 0, currentPriceCurrency: 'PLN', id: '', listingId: '', sellerId: '', type: 'ENGLISH', status: 'DRAFT', startsAt: '', endsAt: '', createdAt: '' },
    dataUpdatedAt,
  )
  const countdown = useCountdown(auction?.endsAt ?? new Date().toISOString())

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

  const canCancel = auction.status === 'SCHEDULED' || auction.status === 'RUNNING'

  function handleCancel() {
    setCancelError(null)
    cancel(auction!.id, {
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

        {/* Cena bieżąca */}
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-6 text-center">
          <p className="text-sm text-zinc-500">
            {auction.type === 'DUTCH' ? 'Cena bieżąca (interpolowana)' : 'Cena bieżąca'}
          </p>
          <p className="mt-2 text-4xl font-bold text-violet-400">
            {formatMoney(displayPrice, auction.currentPriceCurrency)}
          </p>
          {auction.status === 'RUNNING' && !countdown.expired && (
            <p className="mt-2 text-sm text-zinc-500">
              Koniec za:{' '}
              <span className="font-mono text-zinc-300">
                {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
              </span>
            </p>
          )}
          {auction.status === 'RUNNING' && countdown.expired && (
            <p className="mt-2 text-sm text-amber-400">Aukcja właśnie się zakończyła — odświeżanie…</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoCell label="Start" value={formatDateTime(auction.startsAt)} />
          <InfoCell label="Koniec" value={formatDateTime(auction.endsAt)} />
          {auction.type === 'DUTCH' && typeof auction.decrementAmount === 'number' && (
            <>
              <InfoCell
                label="Obniżka co"
                value={`${auction.stepSeconds ?? '?'} s`}
              />
              <InfoCell
                label="Kwota obniżki"
                value={formatMoney(auction.decrementAmount, auction.decrementCurrency ?? auction.currentPriceCurrency)}
              />
            </>
          )}
        </div>

        {cancelError && (
          <p className="text-sm text-red-400">{cancelError}</p>
        )}

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
