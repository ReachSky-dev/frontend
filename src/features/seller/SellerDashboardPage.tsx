import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError } from '../../api/client'
import type { AuctionDto, ListingDto } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusDot } from '../../components/ui/StatusDot'
import { Table } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { useListings } from '../listings/useListings'
import { usePublishListing } from '../listings/usePublishListing'
import { listingStatusLabel, listingStatusShape } from '../listings/listingMeta'
import { useAuctions } from '../auctions/useAuctions'
import { useCancelAuction } from '../auctions/useCancelAuction'
import {
  auctionStatusLabel,
  auctionStatusShape,
  auctionTypeLabel,
} from '../auctions/auctionMeta'

// ── Stany wspólne dla zakładek ─────────────────────────────────────────────────

function TabSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div>
      <div className="border-b border-line pb-3">
        <div className="flex gap-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-8 border-b border-line py-3 last:border-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

function TabError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-err/20 bg-err-muted p-8 text-center">
      <p className="font-medium text-err">
        {error instanceof ApiError
          ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
          : 'Nie udało się wczytać danych.'}
      </p>
      <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={onRetry}>
        Spróbuj ponownie
      </Button>
    </div>
  )
}

function TabEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-line bg-layer p-12 text-center">
      <p className="text-ink-2">{message}</p>
    </div>
  )
}

// ── Zakładka: Oferty ───────────────────────────────────────────────────────────

function ListingsTab({ sellerId }: { sellerId: string }) {
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useListings()
  const { mutate: publish, isPending: isPublishing, variables: publishingId } = usePublishListing()
  const [publishError, setPublishError] = useState<string | null>(null)

  const myListings = (data ?? []).filter(l => l.sellerId === sellerId)

  const columns: Column<ListingDto>[] = [
    {
      key: 'title',
      label: 'Oferta',
      render: l => (
        <span className="font-medium text-ink-1">{l.title}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-40',
      render: l => (
        <StatusDot
          shape={listingStatusShape[l.status]}
          label={listingStatusLabel[l.status]}
        />
      ),
    },
    {
      key: 'window',
      label: 'Okno',
      className: 'w-52',
      render: l => (
        <span className="tabular-nums text-ink-2">
          {formatDateTime(l.windowStart)}
        </span>
      ),
    },
    {
      key: 'action',
      label: '',
      className: 'w-36 text-right',
      render: l => {
        if (l.status === 'DRAFT') {
          return (
            <Button
              variant="secondary"
              buttonSize="sm"
              disabled={isPublishing && publishingId === l.id}
              onClick={e => {
                e.stopPropagation()
                setPublishError(null)
                publish(l.id, {
                  onError: err => {
                    setPublishError(err instanceof ApiError ? err.title : 'Błąd publikacji.')
                  },
                })
              }}
            >
              {isPublishing && publishingId === l.id ? 'Publikowanie…' : 'Opublikuj'}
            </Button>
          )
        }
        if (l.status === 'ACTIVE') {
          return (
            <Link to={`/listings/${l.id}/auctions/new`}>
              <Button variant="primary" buttonSize="sm">Utwórz aukcję</Button>
            </Link>
          )
        }
        return <span className="text-ink-3">—</span>
      },
    },
  ]

  if (isPending) return <TabSkeleton />
  if (isError)   return <TabError error={error} onRetry={() => void refetch()} />
  if (myListings.length === 0) {
    return (
      <>
        <TabEmpty message="Nie masz jeszcze żadnych ofert." />
        <div className="mt-4 flex justify-center">
          <Link to="/listings/new">
            <Button buttonSize="sm">+ Dodaj ofertę</Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <div className="space-y-3">
      {publishError && <p className="text-sm text-err">{publishError}</p>}
      <Table
        columns={columns}
        rows={myListings}
        getKey={l => l.id}
        onRowClick={l => navigate(`/listings/${l.id}`)}
      />
    </div>
  )
}

// ── Zakładka: Aukcje ───────────────────────────────────────────────────────────

function AuctionsTab({ sellerId }: { sellerId: string }) {
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useAuctions()
  const { mutate: cancel, isPending: isCancelling, variables: cancellingId } = useCancelAuction()
  const [cancelError, setCancelError] = useState<string | null>(null)

  const myAuctions = (data ?? []).filter(a => a.sellerId === sellerId)

  const columns: Column<AuctionDto>[] = [
    {
      key: 'type',
      label: 'Typ',
      className: 'w-32',
      render: a => <span className="text-ink-2">{auctionTypeLabel[a.type]}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-52',
      render: a => (
        <StatusDot
          shape={auctionStatusShape[a.status]}
          label={auctionStatusLabel[a.status]}
        />
      ),
    },
    {
      key: 'price',
      label: 'Cena',
      className: 'w-40',
      render: a => (
        <span className="tabular-nums font-medium text-ink-1">
          {formatMoney(a.currentPriceAmount, a.currentPriceCurrency)}
        </span>
      ),
    },
    {
      key: 'ends',
      label: 'Koniec',
      render: a => (
        <span className="tabular-nums text-ink-2">
          {formatDateTime(a.endsAt)}
        </span>
      ),
    },
    {
      key: 'action',
      label: '',
      className: 'w-28 text-right',
      render: a => {
        const cancellable = a.status === 'SCHEDULED' || a.status === 'RUNNING'
        if (!cancellable) return <span className="text-ink-3">—</span>
        return (
          <Button
            variant="secondary"
            buttonSize="sm"
            disabled={isCancelling && cancellingId === a.id}
            onClick={e => {
              e.stopPropagation()
              setCancelError(null)
              cancel(a.id, {
                onError: err => {
                  setCancelError(err instanceof ApiError ? err.title : 'Błąd anulowania.')
                },
              })
            }}
          >
            {isCancelling && cancellingId === a.id ? 'Anulowanie…' : 'Anuluj'}
          </Button>
        )
      },
    },
  ]

  if (isPending) return <TabSkeleton />
  if (isError)   return <TabError error={error} onRetry={() => void refetch()} />
  if (myAuctions.length === 0) {
    return <TabEmpty message="Nie masz jeszcze żadnych aukcji." />
  }

  return (
    <div className="space-y-3">
      {cancelError && <p className="text-sm text-err">{cancelError}</p>}
      <Table
        columns={columns}
        rows={myAuctions}
        getKey={a => a.id}
        onRowClick={a => navigate(`/auctions/${a.id}`)}
      />
    </div>
  )
}

// ── Strona ─────────────────────────────────────────────────────────────────────

type Tab = 'listings' | 'auctions'

export function SellerDashboardPage() {
  const auth = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('listings')
  const sellerId = auth.user?.profile.sub ?? ''

  return (
    <div>
      {/* Nagłówek */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-1">Panel sprzedawcy</h1>
        <Link to="/listings/new">
          <Button buttonSize="sm">+ Dodaj ofertę</Button>
        </Link>
      </div>

      {/* Zakładki */}
      <div className="mb-6 flex gap-1 border-b border-line">
        {(['listings', 'auctions'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'border-ink-1 text-ink-1'
                : 'border-transparent text-ink-3 hover:text-ink-2',
            ].join(' ')}
          >
            {tab === 'listings' ? 'Moje oferty' : 'Moje aukcje'}
          </button>
        ))}
      </div>

      {activeTab === 'listings' && <ListingsTab sellerId={sellerId} />}
      {activeTab === 'auctions' && <AuctionsTab sellerId={sellerId} />}
    </div>
  )
}
