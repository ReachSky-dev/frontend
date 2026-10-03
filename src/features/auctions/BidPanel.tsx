import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError } from '../../api/client'
import type { AuctionDto, BidDto } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { useBidHistory } from './useBidHistory'
import { usePlaceBid } from './usePlaceBid'
import { useSetProxyBid } from './useSetProxyBid'

function inputCls(hasError: boolean) {
  return [
    'w-full rounded border bg-layer px-3 py-2 text-sm text-ink-1 tabular-nums',
    'placeholder:text-ink-3 focus:outline-none focus:ring-1',
    hasError ? 'border-err focus:ring-err' : 'border-line focus:ring-line-hi',
  ].join(' ')
}

// Mapowanie kodów domenowych (ProblemDetail.title) na komunikaty PL
function domainErrorMessage(title: string | undefined, detail: string | undefined): string {
  switch (title) {
    case 'BID_TOO_LOW':
      return `Stawka musi wynosić co najmniej ${detail ?? 'wymaganą kwotę'}.`
    case 'AUCTION_NOT_RUNNING':
      return 'Aukcja już się zakończyła.'
    case 'SELLER_CANNOT_BID':
      return 'Nie możesz licytować własnej oferty.'
    default:
      return detail ?? title ?? 'Nieoczekiwany błąd.'
  }
}

// ── Formularz stawki ──────────────────────────────────────────────────────────
function BidForm({ auction }: { auction: AuctionDto }) {
  const [amount, setAmount] = useState('')
  // Klucz idempotencji: ten sam przy retry po błędzie sieci,
  // nowy po zmianie kwoty, po sukcesie i po błędzie domenowym (409)
  const idempotencyKeyRef = useRef(crypto.randomUUID())
  const [fieldError, setFieldError] = useState<string | null>(null)

  const { mutate: placeBid, isPending } = usePlaceBid(auction.id)

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value)
    idempotencyKeyRef.current = crypto.randomUUID()
    setFieldError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const minor = Math.round(parseFloat(amount) * 100)
    if (!amount || isNaN(minor) || minor <= 0) {
      setFieldError('Podaj kwotę stawki.')
      return
    }

    placeBid(
      {
        body: { amountInMinorUnits: minor, currency: auction.currentPriceCurrency },
        idempotencyKey: idempotencyKeyRef.current,
      },
      {
        onSuccess: () => {
          idempotencyKeyRef.current = crypto.randomUUID()
          setAmount('')
          setFieldError(null)
        },
        onError: err => {
          if (err instanceof ApiError && err.status === 409) {
            // Błąd domenowy — nowy klucz, bo ta stawka jest odrzucona
            idempotencyKeyRef.current = crypto.randomUUID()
            setFieldError(domainErrorMessage(err.title, err.detail))
          } else {
            // Błąd sieci — zachowaj klucz idempotencji (bezpieczny retry)
            setFieldError('Błąd sieci — spróbuj ponownie.')
          }
        },
      },
    )
  }

  const suggestion = formatMoney(auction.currentPriceAmount, auction.currentPriceCurrency)

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder={suggestion}
            min="0.01"
            step="0.01"
            aria-label="Kwota stawki"
            className={inputCls(!!fieldError)}
          />
          {fieldError && <p className="mt-1 text-xs text-err">{fieldError}</p>}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Wysyłanie…' : 'Złóż stawkę'}
        </Button>
      </div>
      <p className="mt-1 text-xs text-ink-3">
        Cena bieżąca: {suggestion}
      </p>
    </form>
  )
}

// ── Automatyczna licytacja proxy ──────────────────────────────────────────────
function ProxyForm({ auction }: { auction: AuctionDto }) {
  const [maxAmount, setMaxAmount] = useState('')
  const [proxyError, setProxyError] = useState<string | null>(null)
  const [proxySuccess, setProxySuccess] = useState(false)

  const { mutate: setProxy, isPending } = useSetProxyBid(auction.id)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const minor = Math.round(parseFloat(maxAmount) * 100)
    if (!maxAmount || isNaN(minor) || minor <= 0) {
      setProxyError('Podaj kwotę maksymalną.')
      return
    }

    setProxy(
      { maxAmountInMinorUnits: minor, currency: auction.currentPriceCurrency },
      {
        onSuccess: () => {
          setMaxAmount('')
          setProxyError(null)
          setProxySuccess(true)
        },
        onError: err => {
          setProxyError(
            err instanceof ApiError
              ? domainErrorMessage(err.title, err.detail)
              : 'Nie udało się ustawić automatycznej licytacji.',
          )
          setProxySuccess(false)
        },
      },
    )
  }

  return (
    <div className="rounded-lg border border-line bg-layer p-4">
      <p className="mb-1 text-sm font-medium text-ink-1">Licytuj za mnie do kwoty</p>
      <p className="mb-3 text-xs text-ink-3">
        System automatycznie podbija Twoją stawkę do podanej kwoty — nie musisz śledzić aukcji.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              value={maxAmount}
              onChange={e => {
                setMaxAmount(e.target.value)
                setProxyError(null)
                setProxySuccess(false)
              }}
              placeholder={formatMoney(auction.currentPriceAmount, auction.currentPriceCurrency)}
              min="0.01"
              step="0.01"
              aria-label="Kwota maksymalna automatycznej licytacji"
              className={inputCls(!!proxyError)}
            />
            {proxyError   && <p className="mt-1 text-xs text-err">{proxyError}</p>}
            {proxySuccess && <p className="mt-1 text-xs text-ok">Automatyczna licytacja ustawiona.</p>}
          </div>
          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? 'Ustawianie…' : 'Ustaw'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// ── Historia stawek ────────────────────────────────────────────────────────────
function BidHistory({ auctionId, currentUserId }: { auctionId: string; currentUserId: string | undefined }) {
  const { data: bids, isPending } = useBidHistory(auctionId)

  if (isPending) return <p className="text-xs text-ink-3">Ładowanie historii…</p>

  const sorted: BidDto[] = bids ? [...bids].reverse() : []

  if (sorted.length === 0) {
    return <p className="text-xs text-ink-3">Brak stawek.</p>
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-ink-3">Historia stawek</p>
      <div className="divide-y divide-line rounded-lg border border-line">
        {sorted.map(bid => {
          const isMine = bid.bidderId === currentUserId
          return (
            <div
              key={bid.id}
              className={`flex items-center justify-between px-4 py-2.5 text-sm${isMine ? ' bg-wash' : ''}`}
            >
              <span className="tabular-nums text-ink-1">
                {formatMoney(bid.amountInMinorUnits, bid.currency)}
              </span>
              <div className="flex items-center gap-3 text-xs text-ink-3">
                {isMine && <span className="text-ok">moja stawka</span>}
                <span className="tabular-nums">{formatDateTime(bid.placedAt)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── CTA dla niezalogowanych ───────────────────────────────────────────────────
function LoginCta() {
  return (
    <div className="rounded-lg border border-line bg-layer p-6 text-center">
      <p className="text-sm text-ink-2">Zaloguj się, żeby złożyć stawkę.</p>
      <Link
        to="/login"
        className="mt-3 inline-block text-sm text-ink-1 underline underline-offset-2 hover:text-ink-2"
      >
        Przejdź do logowania
      </Link>
    </div>
  )
}

// ── BidPanel — punkt wejścia ──────────────────────────────────────────────────
// Renderuje formularz stawki + automatyczną licytację + historię.
// Widoczny tylko dla aukcji angielskiej; formularz — tylko dla RUNNING.
export function BidPanel({ auction }: { auction: AuctionDto }) {
  const auth = useAuth()

  if (auction.type !== 'ENGLISH') return null

  const currentUserId = auth.user?.profile.sub
  const isRunning = auction.status === 'RUNNING'
  const isSeller  = auction.sellerId === currentUserId

  const history = <BidHistory auctionId={auction.id} currentUserId={currentUserId} />

  if (!auth.isAuthenticated) {
    return (
      <div className="space-y-6">
        {isRunning && <LoginCta />}
        {history}
      </div>
    )
  }

  if (isSeller) {
    // Sprzedawca widzi historię, ale nie może licytować
    return history
  }

  return (
    <div className="space-y-6">
      {isRunning && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-ink-1">Złóż stawkę</p>
            <BidForm auction={auction} />
          </div>
          <ProxyForm auction={auction} />
        </div>
      )}
      {history}
    </div>
  )
}
