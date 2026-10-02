import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError } from '../../api/client'
import type { AuctionDto } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Countdown } from '../../components/ui/Countdown'
import { PriceDisplay } from '../../components/ui/PriceDisplay'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusDot } from '../../components/ui/StatusDot'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { useCancelAuction } from './useCancelAuction'
import { useAuction } from './useAuction'
import { useCountdown } from './useCountdown'
import {
  auctionStatusLabel,
  auctionStatusShape,
  auctionTypeLabel,
} from './auctionMeta'

// ── Szkielet ładowania ─────────────────────────────────────────────────────────
function AuctionDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-48 rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    </div>
  )
}

// ── Odliczanie do następnego kroku — wyłącznie wizualne ───────────────────────
function StepCountdown({ startsAt, stepSeconds }: { startsAt: string; stepSeconds: number }) {
  const [msToStep, setMsToStep] = useState(() => {
    const elapsed = (Date.now() - new Date(startsAt).getTime()) / 1_000
    return Math.max(0, (Math.ceil(elapsed / stepSeconds) * stepSeconds - elapsed) * 1_000)
  })

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = (Date.now() - new Date(startsAt).getTime()) / 1_000
      setMsToStep(Math.max(0, (Math.ceil(elapsed / stepSeconds) * stepSeconds - elapsed) * 1_000))
    }, 500)
    return () => clearInterval(id)
  }, [startsAt, stepSeconds])

  const s = Math.ceil(msToStep / 1_000)
  return (
    <div className="text-center">
      <p className="text-xs text-ink-3">Następna obniżka za</p>
      <p className="tabular-nums text-xl font-medium text-ink-2">{s} s</p>
    </div>
  )
}

// ── Wykres schodkowy ceny (SVG, bez wygładzania) ───────────────────────────────
// Tylko dla aukcji holenderskiej — wizualizuje mechanizm opadania ceny.
// Ceny obliczane lokalnie z parametrów aukcji; nie pobieramy historii z API.
function PriceChart({
  startsAt,
  endsAt,
  currentPriceAmount,
  decrementAmount,
  stepSeconds,
  currency,
}: {
  startsAt: string
  endsAt: string
  currentPriceAmount: number
  decrementAmount: number
  stepSeconds: number
  currency: string
}) {
  const startMs  = new Date(startsAt).getTime()
  const endMs    = new Date(endsAt).getTime()
  const totalMs  = endMs - startMs
  if (totalMs <= 0) return null

  const nowMs = Math.min(Date.now(), endMs)

  // Odtwórz cenę startową z aktualnej ceny i liczby minionych kroków
  const elapsedSec    = Math.max(0, (nowMs - startMs) / 1_000)
  const stepsDone     = Math.floor(elapsedSec / stepSeconds)
  const initialPrice  = currentPriceAmount + stepsDone * decrementAmount

  // Wygeneruj wszystkie kroki [ { ms, price } ]
  type Step = { ms: number; price: number }
  const steps: Step[] = []
  const stepMs = stepSeconds * 1_000
  let t = startMs
  let p = initialPrice
  while (t < endMs) {
    steps.push({ ms: t, price: p })
    t += stepMs
    p  = Math.max(0, p - decrementAmount)
  }
  steps.push({ ms: endMs, price: steps[steps.length - 1].price })

  const prices  = steps.map(s => s.price)
  const maxP    = Math.max(...prices)
  const minP    = Math.min(...prices)
  const pRange  = maxP - minP || 1

  // SVG viewport
  const W  = 600
  const H  = 80
  const pL = 4; const pR = 4; const pT = 6; const pB = 6
  const cW = W - pL - pR
  const cH = H - pT - pB

  function toX(ms: number)  { return pL + ((ms - startMs) / totalMs) * cW }
  function toY(price: number) { return pT + cH - ((price - minP) / pRange) * cH }

  // Zbuduj punkty polyline — funkcja schodkowa (bez wygładzania)
  const pts: string[] = []
  for (let i = 0; i < steps.length - 1; i++) {
    const curr = steps[i]
    const next = steps[i + 1]
    if (i === 0) pts.push(`${toX(curr.ms).toFixed(1)},${toY(curr.price).toFixed(1)}`)
    // Poziomy odcinek do czasu następnego kroku (cena stała)
    pts.push(`${toX(next.ms).toFixed(1)},${toY(curr.price).toFixed(1)}`)
    // Pionowy spadek do nowej ceny
    pts.push(`${toX(next.ms).toFixed(1)},${toY(next.price).toFixed(1)}`)
  }

  const nowX = toX(nowMs)

  return (
    <div>
      <p className="mb-2 text-xs text-ink-3">Historia ceny</p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: '80px' }}
        aria-label="Wykres schodkowy ceny aukcji holenderskiej"
      >
        {/* Linia schodkowa */}
        <polyline
          points={pts.join(' ')}
          fill="none"
          stroke="var(--color-line-hi)"
          strokeWidth="1.5"
          strokeLinejoin="miter"
        />
        {/* Marker bieżącego czasu */}
        <line
          x1={nowX} y1={pT}
          x2={nowX} y2={pT + cH}
          stroke="var(--color-price)"
          strokeWidth="1"
          strokeDasharray="3,2"
        />
        {/* Etykiety cen (min / max) */}
        <text
          x={pL} y={toY(maxP) - 2}
          fontSize="8" fill="var(--color-ink-3)" dominantBaseline="auto"
        >
          {formatMoney(maxP, currency)}
        </text>
        <text
          x={pL} y={toY(minP) + 10}
          fontSize="8" fill="var(--color-ink-3)"
        >
          {formatMoney(minP, currency)}
        </text>
      </svg>
    </div>
  )
}

// ── Komórka informacji ─────────────────────────────────────────────────────────
function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="mt-0.5 text-sm tabular-nums text-ink-1">{value}</dd>
    </div>
  )
}

// ── Główna zawartość (po załadowaniu aukcji) ───────────────────────────────────
// Wydzielona, żeby hooki były zawsze wywoływane z defined auction.
function AuctionDetail({ auction, refetch }: { auction: AuctionDto; refetch: () => void }) {
  const auth = useAuth()
  const { mutate: cancel, isPending: isCancelling } = useCancelAuction()
  const [cancelError, setCancelError] = useState<string | null>(null)

  const countdown = useCountdown(auction.endsAt)

  // Wymuś refetch na granicy kroku cenowego (aukcja holenderska).
  // Cena holenderska jest SCHODKOWA — klient jej nie liczy, backend jest źródłem prawdy.
  useEffect(() => {
    if (auction.type !== 'DUTCH' || auction.status !== 'RUNNING') return
    const { stepSeconds, startsAt } = auction
    if (typeof stepSeconds !== 'number' || stepSeconds <= 0) return

    const elapsedSec = (Date.now() - new Date(startsAt).getTime()) / 1_000
    const nextStepMs = (Math.ceil(elapsedSec / stepSeconds) * stepSeconds - elapsedSec) * 1_000
    const delay = Math.max(nextStepMs, 0) + 200 // 200 ms buforu

    const id = setTimeout(() => { void refetch() }, delay)
    return () => clearTimeout(id)
  }, [auction, refetch])

  // UWAGA: Widoczność przycisku anulowania to tylko UI — backend waliduje po stronie serwera.
  const currentUserId = auth.user?.profile.sub
  const isOwner  = auction.sellerId === currentUserId
  const canCancel = isOwner && (auction.status === 'SCHEDULED' || auction.status === 'RUNNING')

  function handleCancel() {
    setCancelError(null)
    cancel(auction.id, {
      onError: err => {
        setCancelError(err instanceof ApiError ? err.title : 'Nie udało się anulować aukcji.')
      },
    })
  }

  const isDutch = auction.type === 'DUTCH'
  const hasDutchData = isDutch
    && typeof auction.decrementAmount === 'number'
    && typeof auction.stepSeconds === 'number'

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink />

      <div className="mt-6 space-y-8">

        {/* Nagłówek */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink-3">{auctionTypeLabel[auction.type]}</p>
            <h1 className="mt-0.5 text-2xl font-semibold text-ink-1">Aukcja</h1>
          </div>
          <StatusDot
            shape={auctionStatusShape[auction.status]}
            label={auctionStatusLabel[auction.status]}
          />
        </div>

        {/* Blok ceny — dominanta ekranu */}
        <div className="rounded-lg border border-line bg-layer p-8 text-center">
          <PriceDisplay
            amount={auction.currentPriceAmount}
            currency={auction.currentPriceCurrency}
            label="Cena bieżąca"
          />

          {/* Odliczania — obok siebie pod ceną */}
          {auction.status === 'RUNNING' && (
            <div className={`mt-6 flex justify-center gap-12 ${hasDutchData ? '' : ''}`}>
              {countdown.remaining > 0 && (
                <Countdown h={countdown.h} m={countdown.m} s={countdown.s} label="Koniec za" />
              )}
              {hasDutchData && (
                <StepCountdown
                  startsAt={auction.startsAt}
                  stepSeconds={auction.stepSeconds!}
                />
              )}
            </div>
          )}
        </div>

        {/* Siatka parametrów */}
        <dl className={`grid gap-6 ${hasDutchData ? 'grid-cols-4' : 'grid-cols-2'}`}>
          <InfoCell label="Start"  value={formatDateTime(auction.startsAt)} />
          <InfoCell label="Koniec" value={formatDateTime(auction.endsAt)} />
          {hasDutchData && (
            <>
              <InfoCell
                label="Obniżka co"
                value={`${auction.stepSeconds} s`}
              />
              <InfoCell
                label="Kwota obniżki"
                value={formatMoney(
                  auction.decrementAmount!,
                  auction.decrementCurrency ?? auction.currentPriceCurrency,
                )}
              />
            </>
          )}
        </dl>

        {/* Wykres schodkowy (tylko holenderska) */}
        {hasDutchData && (
          <PriceChart
            startsAt={auction.startsAt}
            endsAt={auction.endsAt}
            currentPriceAmount={auction.currentPriceAmount}
            decrementAmount={auction.decrementAmount!}
            stepSeconds={auction.stepSeconds!}
            currency={auction.currentPriceCurrency}
          />
        )}

        {cancelError && <p className="text-sm text-err">{cancelError}</p>}

        {canCancel && (
          <div className="flex justify-end">
            <Button variant="secondary" buttonSize="sm" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? 'Anulowanie…' : 'Anuluj aukcję'}
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Strona — cztery stany ──────────────────────────────────────────────────────
export function AuctionDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: auction, isPending, isError, error, refetch } = useAuction(id)

  if (isPending) return <AuctionDetailSkeleton />

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink />
        <div className="mt-6 rounded-lg border border-err/20 bg-err-muted p-8 text-center">
          <p className="font-medium text-err">
            {error instanceof ApiError
              ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
              : 'Nie udało się wczytać aukcji.'}
          </p>
          <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={() => void refetch()}>
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    )
  }

  if (!auction) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink />
        <div className="mt-6 rounded-lg border border-line bg-layer p-12 text-center">
          <p className="text-ink-2">Nie znaleziono aukcji.</p>
        </div>
      </div>
    )
  }

  return <AuctionDetail auction={auction} refetch={() => void refetch()} />
}

function BackLink() {
  return (
    <Link to="/auctions" className="text-sm text-ink-2 transition-colors hover:text-ink-1">
      ← Wróć do aukcji
    </Link>
  )
}
