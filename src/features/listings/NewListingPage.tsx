import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { Button } from '../../components/ui/Button'
import { useCreateListing } from './useCreateListing'

type FormValues = {
  title: string
  description: string
  windowStart: string
  windowEnd: string
  capacity: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function toLocalDateTimeInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function validate(v: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!v.title.trim()) errors.title = 'Tytuł jest wymagany'
  if (!v.windowStart) errors.windowStart = 'Data startu jest wymagana'
  if (!v.windowEnd) errors.windowEnd = 'Data końca jest wymagana'
  if (v.windowStart && new Date(v.windowStart) <= new Date()) {
    errors.windowStart = 'Data startu musi być w przyszłości'
  }
  if (v.windowStart && v.windowEnd && new Date(v.windowEnd) <= new Date(v.windowStart)) {
    errors.windowEnd = 'Data końca musi być późniejsza niż data startu'
  }
  const cap = parseInt(v.capacity, 10)
  if (isNaN(cap) || cap < 1) errors.capacity = 'Pojemność musi być >= 1'
  return errors
}

export function NewListingPage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateListing()
  const minNow = toLocalDateTimeInput(new Date())

  const [values, setValues] = useState<FormValues>({
    title: '',
    description: '',
    windowStart: '',
    windowEnd: '',
    capacity: '1',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)

  function set(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues(prev => ({ ...prev, [field]: e.target.value }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    const errs = validate(values)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    mutate(
      {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        windowStart: new Date(values.windowStart).toISOString(),
        windowEnd: new Date(values.windowEnd).toISOString(),
        capacity: parseInt(values.capacity, 10),
      },
      {
        onSuccess: (listing) => { navigate(`/listings/${listing.id}`) },
        onError: (err) => {
          if (err instanceof ApiError) {
            setServerError(`${err.title}${err.detail ? ` — ${err.detail}` : ''}`)
          } else {
            setServerError('Nieoczekiwany błąd. Spróbuj ponownie.')
          }
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-100">Nowy listing</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {serverError && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <Field label="Tytuł" error={errors.title}>
          <input
            type="text"
            value={values.title}
            onChange={set('title')}
            placeholder="np. Miejsce parkingowe — centrum Warszawy"
            className={inputCls(!!errors.title)}
          />
        </Field>

        <Field label="Opis (opcjonalny)" error={errors.description}>
          <textarea
            value={values.description}
            onChange={set('description')}
            rows={3}
            placeholder="Szczegółowy opis zasobu…"
            className={inputCls(false) + ' resize-none'}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Dostępne od" error={errors.windowStart}>
            <input
              type="datetime-local"
              value={values.windowStart}
              onChange={set('windowStart')}
              min={minNow}
              className={inputCls(!!errors.windowStart)}
            />
          </Field>
          <Field label="Dostępne do" error={errors.windowEnd}>
            <input
              type="datetime-local"
              value={values.windowEnd}
              onChange={set('windowEnd')}
              min={values.windowStart || minNow}
              className={inputCls(!!errors.windowEnd)}
            />
          </Field>
        </div>

        <Field label="Pojemność (liczba miejsc)" error={errors.capacity}>
          <input
            type="number"
            value={values.capacity}
            onChange={set('capacity')}
            min={1}
            step={1}
            className={inputCls(!!errors.capacity)}
          />
        </Field>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            disabled={isPending}
          >
            Anuluj
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Tworzenie…' : 'Utwórz listing'}
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
    hasError
      ? 'border-red-600 focus:ring-red-600'
      : 'border-zinc-700 focus:ring-violet-500',
  ].join(' ')
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm text-zinc-400">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
