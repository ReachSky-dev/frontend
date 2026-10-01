import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import type { AuctionType, CreateAuctionRequest } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { useCreateAuction } from './useCreateAuction'

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
  // English-specific
  minIncrement: string
  // Dutch-specific
  decrementAmount: string
  stepSeconds: string
  floorAmount: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function validate(v: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!v.startsAt) errors.startsAt = 'Wymagane'
  if (!v.endsAt) errors.endsAt = 'Wymagane'
  if (v.startsAt && new Date(v.startsAt) <= new Date()) errors.startsAt = 'Musi być w przyszłości'
  if (v.startsAt && v.endsAt && new Date(v.endsAt) <= new Date(v.startsAt)) {
    errors.endsAt = 'Musi być późniejsza niż start'
  }
  if (!v.currency.trim()) errors.currency = 'Wymagane'
  const sp = parseFloat(v.startPrice)
  if (isNaN(sp) || sp <= 0) errors.startPrice = 'Musi być > 0'
  const rp = parseFloat(v.reservePrice)
  if (isNaN(rp) || rp <= 0) errors.reservePrice = 'Musi być > 0'
  if (v.type === 'DUTCH') {
    const da = parseFloat(v.decrementAmount)
    if (isNaN(da) || da <= 0) errors.decrementAmount = 'Musi być > 0'
    const ss = parseInt(v.stepSeconds, 10)
    if (isNaN(ss) || ss <= 0) errors.stepSeconds = 'Musi być > 0'
  }
  return errors
}

// Podgląd spadku ceny aukcji holenderskiej — kilka kluczowych punktów czasowych.
// Uwaga: to WYŁĄCZNIE wizualizacja; rzeczywistą cenę wyznacza backend.
function DutchPreview({
  startPrice,
  decrement,
  stepSeconds,
  floor,
  startsAt,
  endsAt,
  currency,
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

  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const totalMs = end.getTime() - start.getTime()
  const stepMs = stepSeconds * 1_000
  const maxSteps = Math.floor(totalMs / stepMs)
  const show = Math.min(maxSteps, 5)

  const points: Array<{ time: string; price: number }> = []
  for (let i = 0; i <= show; i++) {
    const t = new Date(start.getTime() + i * stepMs)
    const price = Math.max(startPrice - i * decrement, floor)
    points.push({ time: formatDateTime(t.toISOString()), price })
  }
  if (maxSteps > show) {
    const t = end
    const steps = Math.floor(totalMs / stepMs)
    const price = Math.max(startPrice - steps * decrement, floor)
    points.push({ time: formatDateTime(t.toISOString()), price })
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
      <p className="mb-3 text-xs font-medium text-zinc-400">Podgląd spadku ceny (orientacyjny)</p>
      <div className="space-y-1">
        {points.map((p, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">{p.time}</span>
            <span className="font-mono text-zinc-200">{formatMoney(p.price, currency)}</span>
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
      endsAt: new Date(values.endsAt).toISOString(),
      currency: values.currency.trim().toUpperCase(),
      startPriceAmount: toMinor(values.startPrice),
      reservePriceAmount: toMinor(values.reservePrice),
      ...(values.minIncrement && { minIncrementAmount: toMinor(values.minIncrement) }),
      ...(values.type === 'DUTCH' && {
        decrementAmount: toMinor(values.decrementAmount),
        stepSeconds: parseInt(values.stepSeconds, 10),
        ...(values.floorAmount && { floorAmount: toMinor(values.floorAmount) }),
      }),
    }

    mutate(body, {
      onSuccess: (auction) => { navigate(`/auctions/${auction.id}`) },
      onError: (err) => {
        setServerError(
          err instanceof ApiError
            ? `${err.title}${err.detail ? ` — ${err.detail}` : ''}`
            : 'Nieoczekiwany błąd',
        )
      },
    })
  }

  const isDutch = values.type === 'DUTCH'
  const currency = values.currency.trim().toUpperCase() || 'PLN'

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-100">Utwórz aukcję</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {serverError && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-400">
            {serverError}
          </div>
        )}

        {/* Typ aukcji */}
        <div className="flex gap-3">
          {(['ENGLISH', 'DUTCH'] as AuctionType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setValues(prev => ({ ...prev, type: t }))}
              className={[
                'flex-1 rounded border py-2 text-sm font-medium transition-colors',
                values.type === t
                  ? 'border-violet-500 bg-violet-600/20 text-violet-300'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500',
              ].join(' ')}
            >
              {t === 'ENGLISH' ? 'Angielska (rosnąca)' : 'Holenderska (malejąca)'}
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
          <Field label="Cena startowa (PLN)" error={errors.startPrice}>
            <input type="number" value={values.startPrice} onChange={set('startPrice')} min="0.01" step="0.01" placeholder="np. 100.00" className={inputCls(!!errors.startPrice)} />
          </Field>
          <Field label="Cena rezerwowa (PLN)" error={errors.reservePrice}>
            <input type="number" value={values.reservePrice} onChange={set('reservePrice')} min="0.01" step="0.01" placeholder="np. 50.00" className={inputCls(!!errors.reservePrice)} />
          </Field>
        </div>

        {/* Angielska: min. podbicie */}
        {!isDutch && (
          <Field label="Min. podbicie (opcjonalne)" error={errors.minIncrement}>
            <input type="number" value={values.minIncrement} onChange={set('minIncrement')} min="0.01" step="0.01" placeholder="np. 5.00" className={inputCls(!!errors.minIncrement)} />
          </Field>
        )}

        {/* Holenderska: parametry spadku */}
        {isDutch && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kwota obniżki (PLN)" error={errors.decrementAmount}>
                <input type="number" value={values.decrementAmount} onChange={set('decrementAmount')} min="0.01" step="0.01" className={inputCls(!!errors.decrementAmount)} />
              </Field>
              <Field label="Krok (sekundy)" error={errors.stepSeconds}>
                <input type="number" value={values.stepSeconds} onChange={set('stepSeconds')} min="1" step="1" className={inputCls(!!errors.stepSeconds)} />
              </Field>
            </div>
            <Field label="Cena minimalna (opcjonalna)" error={errors.floorAmount}>
              <input type="number" value={values.floorAmount} onChange={set('floorAmount')} min="0.01" step="0.01" placeholder="np. 10.00" className={inputCls(!!errors.floorAmount)} />
            </Field>

            {/* Podgląd spadku ceny */}
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
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={isPending}>
            Anuluj
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
    'w-full rounded border bg-zinc-900 px-3 py-2 text-sm text-zinc-100',
    'placeholder:text-zinc-600 focus:outline-none focus:ring-1',
    hasError ? 'border-red-600 focus:ring-red-600' : 'border-zinc-700 focus:ring-violet-500',
  ].join(' ')
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm text-zinc-400">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
