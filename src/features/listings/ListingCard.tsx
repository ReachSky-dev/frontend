import { Link } from 'react-router-dom'
import type { ListingDto, ListingStatus } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { formatDateTime } from '../../lib/datetime'

type BadgeVariant = 'success' | 'warning' | 'error' | 'default'

const statusVariant: Record<ListingStatus, BadgeVariant> = {
  DRAFT:  'default',
  ACTIVE: 'success',
  CLOSED: 'error',
}

const statusLabel: Record<ListingStatus, string> = {
  DRAFT:  'Szkic',
  ACTIVE: 'Aktywny',
  CLOSED: 'Zamknięte',
}

type ListingCardProps = { listing: ListingDto }

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link to={`/listings/${listing.id}`} className="block transition-opacity hover:opacity-90">
      <Card className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold leading-snug text-zinc-100">{listing.title}</h2>
          <Badge variant={statusVariant[listing.status]}>
            {statusLabel[listing.status]}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm text-zinc-400">{listing.description}</p>

        <div className="mt-auto flex flex-col gap-1 text-xs text-zinc-500">
          <span>Od: {formatDateTime(listing.windowStart)}</span>
          <span>Do: {formatDateTime(listing.windowEnd)}</span>
        </div>

        <div className="flex items-center justify-end">
          <span className="text-xs text-zinc-500">Miejsc: {listing.capacity}</span>
        </div>
      </Card>
    </Link>
  )
}
