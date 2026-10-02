import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusDot } from '../../components/ui/StatusDot'
import { formatDateTime } from '../../lib/datetime'
import { useListing } from './useListing'
import { listingStatusLabel, listingStatusShape } from './listingMeta'

function ListingDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="mt-0.5 text-sm tabular-nums text-ink-1">{value}</dd>
    </div>
  )
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const safeId = id ?? ''
  const { data: listing, isPending, isError, error, refetch } = useListing(safeId)

  // Stan: ładowanie
  if (isPending) return <ListingDetailSkeleton />

  // Stan: błąd
  if (isError) {
    return (
      <div className="mx-auto max-w-2xl">
        <BackLink />
        <div className="mt-6 rounded-lg border border-err/20 bg-err-muted p-8 text-center">
          <p className="font-medium text-err">
            {error instanceof ApiError
              ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
              : 'Nie udało się wczytać oferty.'}
          </p>
          <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={() => void refetch()}>
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    )
  }

  // Stan: nie znaleziono
  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl">
        <BackLink />
        <div className="mt-6 rounded-lg border border-line bg-layer p-12 text-center">
          <p className="text-ink-2">Nie znaleziono oferty.</p>
        </div>
      </div>
    )
  }

  // Stan: dane
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink />

      <div className="mt-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-ink-1">{listing.title}</h1>
          <StatusDot
            shape={listingStatusShape[listing.status]}
            label={listingStatusLabel[listing.status]}
          />
        </div>

        {listing.description && (
          <p className="text-ink-2">{listing.description}</p>
        )}

        <dl className="grid grid-cols-2 gap-6">
          <InfoCell label="Dostępne od"             value={formatDateTime(listing.windowStart)} />
          <InfoCell label="Dostępne do"             value={formatDateTime(listing.windowEnd)} />
          <InfoCell label="Liczba dostępnych miejsc" value={String(listing.capacity)} />
        </dl>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link to="/" className="text-sm text-ink-2 transition-colors hover:text-ink-1">
      ← Wróć do ofert
    </Link>
  )
}
