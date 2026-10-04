import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import type { AuctionType, CreateAuctionRequest } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { formatMoney } from '../../lib/money'
import { useCreateAuction } from './useCreateAuction'
import { auctionTypeLabel } from './auctionMeta'

// Pomocnik: lokalny format datetime-local dla inputów
function toInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

// Kwoty podawane przez użytkownika w "pełnych jednostkach" (PLN, EUR…)
// Backend oczekuje najmniejszych jednostek waluty (grosze, centy).
function toMinor(s: string): number {
  return Math.round(parseFloat(s) * 100)
}

type FormValues = {
  type: AuctionType
  startsAt: string
  endsAt: string
  currency: string
  startPrice: string
  reservePrice: string
  minIncrement: string
  decrementAmount: string
  stepSeconds: string
  floorAmount: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function validate(v: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!v.startsAt) errors.startsAt = 'Wymagane.'
  if (!v.endsAt)   errors.endsAt   = 'Wymagane.'
  if (v.startsAt && new Date(v.startsAt) <= new Date())
    errors.startsAt = 'Musi być w przyszłości.'
  if (v.startsAt && v.endsAt && new Date(v.endsAt) <= new Date(v.startsAt))
    errors.endsAt = 'Musi być późniejszy niż czas startu.'
  if (!v.currency.trim()) errors.currency = 'Wymagane.'
  const sp = parseFloat(v.startPrice)
  if (isNaN(sp) || sp <= 0)  errors.startPrice   = 'Musi być > 0.'
  const rp = parseFloat(v.reservePrice)
  if (isNaN(rp) || rp <= 0)  errors.reservePrice  = 'Musi być > 0.'
  if (v.type === 'DUTCH') {
    const da = parseFloat(v.decrementAmount)
    if (isNaN(da) || da <= 0) errors.decrementAmount = 'Musi być > 0.'
    const ss = parseInt(v.stepSeconds, 10)
    if (isNaN(ss) || ss <= 0) errors.stepSeconds = 'Musi być > 0.'
    if (v.floorAmount) {
      const fl = parseFloat(v.floorAmount)
      if (!isNaN(fl) && !isNaN(sp) && fl >= sp)
        errors.floorAmount = 'Cena minimalna musi być niższa niż cena startowa.'
    }
  }
  return errors
}

// Podgląd spadku ceny aukcji holenderskiej — kilka kluczowych punktów.
// WYŁĄCZNIE wizualizacja — rzeczywistą cenę wyznacza backend.
function fmtPreviewTime(iso: string, stepSeconds: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(stepSeconds < 60 ? { second: '2-digit' } : {}),
    timeZoneName: 'short',
  }).format(new Date(iso))
}

function DutchPreview({
  startPrice, decrement, stepSeconds, floor, startsAt, endsAt, currency,
}: {
  startPrice: number
  decrement: number
  stepSeconds: number
  floor: number
  startsAt: string
  endsAt: string
  currency: string
}) {
  if (!startPrice || !decrement || !stepSeconds || !startsAt || !endsAt) return null
  if (new Date(endsAt) <= new Date(startsAt)) return null
  // Nie pokazuj podglądu gdy cena minimalna >= startowej — dane są niepoprawne
  if (floor > 0 && floor >= startPrice) return null

  const start    = new Date(startsAt)
  const end      = new Date(endsAt)
  const totalMs  = end.getTime() - start.getTime()
  const stepMs   = stepSeconds * 1_000
  const maxSteps = Math.floor(totalMs / stepMs)
  const show     = Math.min(maxSteps, 5)

  const points: Array<{ time: string; price: number }> = []
  for (let i = 0; i <= show; i++) {
    const t = new Date(start.getTime() + i * stepMs)
    const price = Math.max(startPrice - i * decrement, floor)
    points.push({ time: fmtPreviewTime(t.toISOString(), stepSeconds), price })
  }
  if (maxSteps > show) {
    const steps = Math.floor(totalMs / stepMs)
    points.push({
      time: fmtPreviewTime(end.toISOString(), stepSeconds),
      price: Math.max(startPrice - steps * decrement, floor),
    })
  }

  return (
    <div className="rounded-lg border border-line bg-layer p-4">
      <p className="mb-3 text-xs font-medium text-ink-2">Podgląd ceny holenderskiej</p>
      <div className="space-y-1">
        {points.map((p, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-ink-3">{p.time}</span>
            <span className="tabular-nums text-ink-1">{formatMoney(p.price, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CreateAuctionPage() {
  const { id: listingId = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateAuction()
  const minNow = toInput(new Date())

  const [values, setValues] = useState<FormValues>({
    type: 'ENGLISH',
    startsAt: '',
    endsAt: '',
    currency: 'PLN',
    startPrice: '',
    reservePrice: '',
    minIncrement: '',
    decrementAmount: '',
    stepSeconds: '60',
    floorAmount: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)

  function set(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    const errs = validate(values)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const body: CreateAuctionRequest = {
      listingId,
      type: values.type,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt:   new Date(values.endsAt).toISOString(),
      currency: values.currency.trim().toUpperCase(),
      startPriceAmount:   toMinor(values.startPrice),
      reservePriceAmount: toMinor(values.reservePrice),
      ...(values.minIncrement && { minIncrementAmount: toMinor(values.minIncrement) }),
      ...(values.type === 'DUTCH' && {
        decrementAmount: toMinor(values.decrementAmount),
        stepSeconds:     parseInt(values.stepSeconds, 10),
        ...(values.floorAmount && { floorAmount: toMinor(values.floorAmount) }),
      }),
    }

    mutate(body, {
      onSuccess: auction => { navigate(`/auctions/${auction.id}`) },
      onError: err => {
        setServerError(
          err instanceof ApiError
            ? `${err.title}${err.detail ? ` — ${err.detail}` : ''}`
            : 'Nieoczekiwany błąd.',
        )
      },
    })
  }

  const isDutch = values.type === 'DUTCH'
  const currency = values.currency.trim().toUpperCase() || 'PLN'

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-ink-1">Utwórz aukcję</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {serverError && (
          <div className="rounded-lg border border-err/20 bg-err-muted p-4 text-sm text-err">
            {serverError}
          </div>
        )}

        {/* Typ aukcji — przełącznik bez akcentu marki */}
        <div className="flex gap-3">
          {(['ENGLISH', 'DUTCH'] as AuctionType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setValues(prev => ({ ...prev, type: t }))}
              className={[
                'flex-1 rounded border py-2 text-sm font-medium transition-colors',
                values.type === t
                  ? 'border-line-hi bg-wash text-ink-1'
                  : 'border-line text-ink-2 hover:border-line-hi hover:text-ink-1',
              ].join(' ')}
            >
              {auctionTypeLabel[t]}
              <span className="ml-1 text-xs text-ink-3">
                {t === 'ENGLISH' ? '(cena rośnie)' : '(cena spada)'}
              </span>
            </button>
          ))}
        </div>

        {/* Okno czasowe */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start" error={errors.startsAt}>
            <input type="datetime-local" value={values.startsAt} onChange={set('startsAt')} min={minNow} className={inputCls(!!errors.startsAt)} />
          </Field>
          <Field label="Koniec" error={errors.endsAt}>
            <input type="datetime-local" value={values.endsAt} onChange={set('endsAt')} min={values.startsAt || minNow} className={inputCls(!!errors.endsAt)} />
          </Field>
        </div>

        {/* Waluta i ceny */}
        <Field label="Waluta (ISO 4217)" error={errors.currency}>
          <input type="text" value={values.currency} onChange={set('currency')} placeholder="PLN" maxLength={3} className={inputCls(!!errors.currency)} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={`Cena startowa (${currency})`} error={errors.startPrice}>
            <input type="number" value={values.startPrice} onChange={set('startPrice')} min="0.01" step="0.01" placeholder="np. 100.00" className={inputCls(!!errors.startPrice)} />
          </Field>
          <Field label={`Cena rezerwowa (${currency})`} error={errors.reservePrice}>
            <input type="number" value={values.reservePrice} onChange={set('reservePrice')} min="0.01" step="0.01" placeholder="np. 50.00" className={inputCls(!!errors.reservePrice)} />
          </Field>
        </div>

        {/* Angielska: minimalne podbicie stawki */}
        {!isDutch && (
          <Field label={`Min. podbicie stawki (${currency}, opcjonalne)`} error={errors.minIncrement}>
            <input type="number" value={values.minIncrement} onChange={set('minIncrement')} min="0.01" step="0.01" placeholder="np. 5.00" className={inputCls(!!errors.minIncrement)} />
          </Field>
        )}

        {/* Holenderska: parametry spadku ceny */}
        {isDutch && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label={`Kwota obniżki (${currency})`} error={errors.decrementAmount}>
                <input type="number" value={values.decrementAmount} onChange={set('decrementAmount')} min="0.01" step="0.01" className={inputCls(!!errors.decrementAmount)} />
              </Field>
              <Field label="Krok (sekundy)" error={errors.stepSeconds}>
                <input type="number" value={values.stepSeconds} onChange={set('stepSeconds')} min="1" step="1" className={inputCls(!!errors.stepSeconds)} />
              </Field>
            </div>
            <Field label={`Cena minimalna (${currency}, opcjonalna)`} error={errors.floorAmount}>
              <input type="number" value={values.floorAmount} onChange={set('floorAmount')} min="0.01" step="0.01" placeholder="np. 10.00" className={inputCls(!!errors.floorAmount)} />
            </Field>

            <DutchPreview
              startPrice={toMinor(values.startPrice)}
              decrement={toMinor(values.decrementAmount)}
              stepSeconds={parseInt(values.stepSeconds, 10)}
              floor={values.floorAmount ? toMinor(values.floorAmount) : 0}
              startsAt={values.startsAt}
              endsAt={values.endsAt}
              currency={currency}
            />
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {/* "Wróć" — wraca do poprzedniego widoku, nie anuluje aukcji w systemie */}
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={isPending}>
            Wróć
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Tworzenie…' : 'Utwórz aukcję'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded border bg-layer px-3 py-2 text-sm text-ink-1',
    'placeholder:text-ink-3 focus:outline-none focus:ring-1',
    hasError
      ? 'border-err focus:ring-err'
      : 'border-line focus:ring-line-hi',
  ].join(' ')
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm text-ink-2">{label}</label>
      {children}
      {error && <p className="text-xs text-err">{error}</p>}
    </div>
  )
}
