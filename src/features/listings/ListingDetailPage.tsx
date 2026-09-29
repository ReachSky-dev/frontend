import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import type { ListingStatus } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { useListing } from './useListing'

type BadgeVariant = 'success' | 'warning' | 'error' | 'default'

const statusVariant: Record<ListingStatus, BadgeVariant> = {
  ACTIVE:    'success',
  INACTIVE:  'default',
  SOLD_OUT:  'error',
}

const statusLabel: Record<ListingStatus, string> = {
  ACTIVE:    'Aktywny',
  INACTIVE:  'Nieaktywny',
  SOLD_OUT:  'Wyprzedany',
}

function ListingDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
    </div>
  )
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const safeId = id ?? ''
  const { data: listing, isLoading, isError, error, refetch } = useListing(safeId)

  if (isLoading) {
    return <ListingDetailSkeleton />
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
          ← Wróć do ofert
        </Link>
        <div className="mt-6 rounded-lg border border-red-800/50 bg-red-950/30 p-8 text-center">
          <p className="font-medium text-red-400">
            {error instanceof ApiError
              ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
              : 'Błąd ładowania oferty'}
          </p>
          <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={() => void refetch()}>
            Ponów
          </Button>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
          ← Wróć do ofert
        </Link>
        <div className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-400">Nie znaleziono oferty.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
        ← Wróć do ofert
      </Link>

      <div className="mt-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-100">{listing.title}</h1>
          <Badge variant={statusVariant[listing.status]}>
            {statusLabel[listing.status]}
          </Badge>
        </div>

        <p className="text-zinc-400">{listing.description}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Dostępne od</p>
            <p className="mt-1 text-sm text-zinc-200">{formatDateTime(listing.availableFrom)}</p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Dostępne do</p>
            <p className="mt-1 text-sm text-zinc-200">{formatDateTime(listing.availableTo)}</p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Cena wywoławcza</p>
            <p className="mt-1 text-sm font-semibold text-violet-400">
              {formatMoney(listing.priceInMinorUnits, listing.currency)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Dostępna liczba miejsc</p>
            <p className="mt-1 text-sm text-zinc-200">{listing.capacity}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
