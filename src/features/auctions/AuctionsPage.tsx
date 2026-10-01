import { Link } from 'react-router-dom'
import { ApiError } from '../../api/client'
import type { AuctionStatus, AuctionType } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { useAuctions } from './useAuctions'

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
  ENGLISH: 'Angielska',
  DUTCH:   'Holenderska',
}

function AuctionsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="ml-auto h-5 w-28" />
        </div>
      ))}
    </div>
  )
}

export function AuctionsPage() {
  const { data, isPending, isError, error, refetch } = useAuctions()
  const auctions = data ?? []

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-100">Aukcje</h1>

      {isPending && <AuctionsSkeleton />}

      {isError && (
        <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-8 text-center">
          <p className="font-medium text-red-400">
            {error instanceof ApiError
              ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
              : 'Błąd ładowania aukcji'}
          </p>
          <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={() => void refetch()}>
            Ponów
          </Button>
        </div>
      )}

      {!isPending && !isError && auctions.length === 0 && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-400">Brak aktywnych aukcji.</p>
        </div>
      )}

      {!isPending && !isError && auctions.length > 0 && (
        <div className="space-y-3">
          {auctions.map(auction => (
            <Link
              key={auction.id}
              to={`/auctions/${auction.id}`}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 p-4 transition-colors hover:border-zinc-600"
            >
              <Badge variant={statusVariant[auction.status]}>{statusLabel[auction.status]}</Badge>
              <span className="text-sm text-zinc-500">{typeLabel[auction.type]}</span>
              <span className="font-medium text-zinc-100">
                {formatMoney(auction.currentPriceAmount, auction.currentPriceCurrency)}
              </span>
              <span className="ml-auto text-xs text-zinc-500">
                do {formatDateTime(auction.endsAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
