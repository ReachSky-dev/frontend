import { useState } from 'react'
import { ApiError } from '../../api/client'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { ListingCard } from './ListingCard'
import { useListings } from './useListings'

function ListingsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-lg border border-zinc-700 bg-zinc-900 p-4"
        >
          <div className="flex justify-between gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="mt-auto flex flex-col gap-1">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListingsPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, error, refetch } = useListings(page)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-100">Oferty</h1>

      {isLoading && <ListingsSkeleton />}

      {isError && (
        <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-8 text-center">
          <p className="font-medium text-red-400">
            {error instanceof ApiError
              ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
              : 'Błąd ładowania ofert'}
          </p>
          <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={() => void refetch()}>
            Ponów
          </Button>
        </div>
      )}

      {!isLoading && !isError && (data?.content.length ?? 0) === 0 && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-400">Brak aktywnych ofert.</p>
        </div>
      )}

      {!isLoading && !isError && (data?.content.length ?? 0) > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data!.content.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {(data!.totalPages ?? 0) > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                buttonSize="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                ← Poprzednia
              </Button>
              <span className="text-sm text-zinc-400">
                {page + 1} / {data!.totalPages}
              </span>
              <Button
                variant="secondary"
                buttonSize="sm"
                onClick={() => setPage((p) => Math.min(data!.totalPages - 1, p + 1))}
                disabled={page >= data!.totalPages - 1}
              >
                Następna →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
