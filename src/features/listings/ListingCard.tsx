import { Link } from 'react-router-dom'
import type { ListingDto } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { formatDateTime } from '../../lib/datetime'
import { listingStatusBadgeVariant, listingStatusLabel } from './listingMeta'

type ListingCardProps = { listing: ListingDto }

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link to={`/listings/${listing.id}`} className="block transition-opacity hover:opacity-90">
      <Card className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold leading-snug text-ink-1">{listing.title}</h2>
          <Badge variant={listingStatusBadgeVariant[listing.status]}>
            {listingStatusLabel[listing.status]}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm text-ink-2">{listing.description}</p>

        <div className="mt-auto flex flex-col gap-1 text-xs text-ink-3">
          <span>Od: {formatDateTime(listing.windowStart)}</span>
          <span>Do: {formatDateTime(listing.windowEnd)}</span>
        </div>

        <div className="flex items-center justify-end">
          <span className="text-xs text-ink-3">Miejsc: {listing.capacity}</span>
        </div>
      </Card>
    </Link>
  )
}
