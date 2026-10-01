import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError } from '../../api/client'
import type { AuctionDto, AuctionStatus, AuctionType, ListingDto, ListingStatus } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { useListings } from '../listings/useListings'
import { usePublishListing } from '../listings/usePublishListing'
import { useAuctions } from '../auctions/useAuctions'
import { useCancelAuction } from '../auctions/useCancelAuction'

// ── Badge helpers ─────────────────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'error' | 'default'

const listingStatusVariant: Record<ListingStatus, BadgeVariant> = {
  DRAFT:  'default',
  ACTIVE: 'success',
  CLOSED: 'error',
}
const listingStatusLabel: Record<ListingStatus, string> = {
  DRAFT:  'Szkic',
  ACTIVE: 'Aktywny',
  CLOSED: 'Zamknięty',
}
const auctionStatusVariant: Record<AuctionStatus, BadgeVariant> = {
  DRAFT:            'default',
  SCHEDULED:        'warning',
  RUNNING:          'success',
  SOLD:             'success',
  RESERVE_NOT_MET:  'error',
  CANCELLED:        'error',
  SETTLED:          'default',
}
const auctionStatusLabel: Record<AuctionStatus, string> = {
  DRAFT:            'Szkic',
  SCHEDULED:        'Zaplanowana',
  RUNNING:          'Trwa',
  SOLD:             'Sprzedana',
  RESERVE_NOT_MET:  'Rez. niespełniona',
  CANCELLED:        'Anulowana',
  SETTLED:          'Rozliczona',
}
const auctionTypeLabel: Record<AuctionType, string> = {
  ENGLISH: 'Angielska',
  DUTCH:   'Holenderska',
}

// ── Listings tab ──────────────────────────────────────────────────────────────

function ListingsTab({ sellerId }: { sellerId: string }) {
  const { data, isPending, isError, error, refetch } = useListings()
  const { mutate: publish, isPending: isPublishing, variables: publishingId } = usePublishListing()
  const [publishError, setPublishError] = useState<string | null>(null)

  const myListings = (data ?? []).filter(l => l.sellerId === sellerId)

  if (isPending) return <TabSkeleton rows={4} />

  if (isError) return <TabError error={error} onRetry={() => void refetch()} />

  if (myListings.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-12 text-center">
        <p className="text-zinc-400">Nie masz jeszcze żadnych aktywnych listingów.</p>
        <p className="mt-1 text-sm text-zinc-600">
          Szkice są widoczne tylko po opublikowaniu.
        </p>
        <Link to="/listings/new">
          <Button variant="secondary" buttonSize="sm" className="mt-4">
            + Nowy listing
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {publishError && (
        <p className="text-sm text-red-400">{publishError}</p>
      )}
      {myListings.map(listing => (
        <ListingRow
          key={listing.id}
          listing={listing}
          isPublishing={isPublishing && publishingId === listing.id}
          onPublish={() => {
            setPublishError(null)
            publish(listing.id, {
              onError: (err) => {
                setPublishError(err instanceof ApiError ? err.title : 'Błąd publikacji')
              },
            })
          }}
        />
      ))}
    </div>
  )
}

function ListingRow({
  listing,
  isPublishing,
  onPublish,
}: {
  listing: ListingDto
  isPublishing: boolean
  onPublish: () => void
}) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              to={`/listings/${listing.id}`}
              className="truncate font-medium text-zinc-100 hover:text-violet-400"
            >
              {listing.title}
            </Link>
            <Badge variant={listingStatusVariant[listing.status]}>
              {listingStatusLabel[listing.status]}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {formatDateTime(listing.windowStart)} – {formatDateTime(listing.windowEnd)}
            {' · '}Miejsc: {listing.capacity}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {listing.status === 'DRAFT' && (
            <Button variant="secondary" buttonSize="sm" disabled={isPublishing} onClick={onPublish}>
              {isPublishing ? 'Publikowanie…' : 'Publikuj'}
            </Button>
          )}
          {listing.status === 'ACTIVE' && (
            <Link to={`/listings/${listing.id}/auctions/new`}>
              <Button variant="primary" buttonSize="sm">Utwórz aukcję</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Auctions tab ──────────────────────────────────────────────────────────────

function AuctionsTab({ sellerId }: { sellerId: string }) {
  const { data, isPending, isError, error, refetch } = useAuctions()
  const { mutate: cancel, isPending: isCancelling, variables: cancellingId } = useCancelAuction()
  const [cancelError, setCancelError] = useState<string | null>(null)

  const myAuctions = (data ?? []).filter(a => a.sellerId === sellerId)

  if (isPending) return <TabSkeleton rows={4} />

  if (isError) return <TabError error={error} onRetry={() => void refetch()} />

  if (myAuctions.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-12 text-center">
        <p className="text-zinc-400">Nie masz jeszcze żadnych aukcji.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cancelError && <p className="text-sm text-red-400">{cancelError}</p>}
      {myAuctions.map(auction => (
        <AuctionRow
          key={auction.id}
          auction={auction}
          isCancelling={isCancelling && cancellingId === auction.id}
          onCancel={() => {
            setCancelError(null)
            cancel(auction.id, {
              onError: (err) => {
                setCancelError(err instanceof ApiError ? err.title : 'Błąd anulowania')
              },
            })
          }}
        />
      ))}
    </div>
  )
}

function AuctionRow({
  auction,
  isCancelling,
  onCancel,
}: {
  auction: AuctionDto
  isCancelling: boolean
  onCancel: () => void
}) {
  const canCancel = auction.status === 'SCHEDULED' || auction.status === 'RUNNING'

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              to={`/auctions/${auction.id}`}
              className="font-medium text-zinc-100 hover:text-violet-400"
            >
              {auctionTypeLabel[auction.type]}
            </Link>
            <Badge variant={auctionStatusVariant[auction.status]}>
              {auctionStatusLabel[auction.status]}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {formatMoney(auction.currentPriceAmount, auction.currentPriceCurrency)}
            {' · '}do {formatDateTime(auction.endsAt)}
          </p>
        </div>
        {canCancel && (
          <Button
            variant="secondary"
            buttonSize="sm"
            disabled={isCancelling}
            onClick={onCancel}
          >
            {isCancelling ? 'Anulowanie…' : 'Anuluj'}
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function TabSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  )
}

function TabError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-8 text-center">
      <p className="font-medium text-red-400">
        {error instanceof ApiError
          ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
          : 'Błąd ładowania danych'}
      </p>
      <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={onRetry}>
        Ponów
      </Button>
    </div>
  )
}

// ── Dashboard page ────────────────────────────────────────────────────────────

type Tab = 'listings' | 'auctions'

export function SellerDashboardPage() {
  const auth = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('listings')
  const sellerId = auth.user?.profile.sub ?? ''

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-100">Panel sprzedawcy</h1>
        <Link to="/listings/new">
          <Button buttonSize="sm">+ Nowy listing</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-zinc-800">
        {(['listings', 'auctions'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300',
            ].join(' ')}
          >
            {tab === 'listings' ? 'Moje listingi' : 'Moje aukcje'}
          </button>
        ))}
      </div>

      {activeTab === 'listings' && <ListingsTab sellerId={sellerId} />}
      {activeTab === 'auctions' && <AuctionsTab sellerId={sellerId} />}
    </div>
  )
}
