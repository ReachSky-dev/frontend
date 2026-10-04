import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { ApiError } from '../../api/client'
import type { AuctionDto } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusDot } from '../../components/ui/StatusDot'
import { Table } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { getRealmRoles } from '../auth/roles'
import { useAuctionHistory } from '../auctions/useAuctionHistory'
import { useWonAuctions } from '../auctions/useWonAuctions'
import { auctionStatusLabel, auctionStatusShape, auctionTypeLabel } from '../auctions/auctionMeta'

// ── Szkielet ładowania ────────────────────────────────────────────────────────
function TabSkeleton() {
  return (
    <div>
      <div className="border-b border-line pb-3">
        <div className="flex gap-8">
          {[28, 24, 32, 20].map((w, i) => (
            <Skeleton key={i} className={`h-4 w-${w}`} />
          ))}
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-8 border-b border-line py-3 last:border-0">
          {[32, 24, 28, 20].map((w, j) => (
            <Skeleton key={j} className={`h-4 w-${w}`} />
          ))}
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

// ── Wspólne kolumny tabeli historii ──────────────────────────────────────────
function useAuctionColumns(currentUserId: string | undefined, isWon?: boolean): Column<AuctionDto>[] {
  const navigate = useNavigate()
  void navigate // zapobieganie unused — navigate używany przez onRowClick, nie tutaj

  return [
    {
      key: 'status',
      label: 'Status',
      className: 'w-44',
      render: a => (
        <StatusDot shape={auctionStatusShape[a.status]} label={auctionStatusLabel[a.status]} />
      ),
    },
    {
      key: 'type',
      label: 'Typ',
      className: 'w-32',
      render: a => <span className="text-ink-2">{auctionTypeLabel[a.type]}</span>,
    },
    {
      key: 'price',
      label: 'Cena końcowa',
      className: 'w-40',
      render: a => (
        <span className="tabular-nums font-medium text-ink-1">
          {formatMoney(a.currentPriceAmount, a.currentPriceCurrency)}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Rola',
      className: 'w-28',
      render: a => {
        if (a.sellerId === currentUserId) return <span className="text-xs text-ink-3">sprzedawca</span>
        if (isWon) return <span className="text-xs text-ok">kupujący</span>
        return <span className="text-xs text-ink-3">—</span>
      },
    },
    {
      key: 'endsAt',
      label: 'Zakończona',
      render: a => (
        <span className="tabular-nums text-ink-2">{formatDateTime(a.endsAt)}</span>
      ),
    },
  ]
}

// ── Zakładka: wszystkie zakończone aukcje ─────────────────────────────────────
function GlobalTab({ currentUserId }: { currentUserId: string | undefined }) {
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useAuctionHistory()
  const columns = useAuctionColumns(currentUserId)

  if (isPending) return <TabSkeleton />
  if (isError)   return <TabError error={error} onRetry={() => void refetch()} />

  const auctions = data ?? []
  if (auctions.length === 0) return <TabEmpty message="Brak zakończonych aukcji." />

  return (
    <Table
      columns={columns}
      rows={auctions}
      getKey={a => a.id}
      onRowClick={a => navigate(`/auctions/${a.id}`)}
    />
  )
}

// ── Zakładka: wygrane aukcje (kupujący) ───────────────────────────────────────
function WonTab({ currentUserId }: { currentUserId: string | undefined }) {
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useWonAuctions(!!currentUserId)
  const columns = useAuctionColumns(currentUserId, true)

  if (isPending) return <TabSkeleton />
  if (isError)   return <TabError error={error} onRetry={() => void refetch()} />

  const auctions = data ?? []
  if (auctions.length === 0) return <TabEmpty message="Nie wygrałeś jeszcze żadnej aukcji." />

  return (
    <Table
      columns={columns}
      rows={auctions}
      getKey={a => a.id}
      onRowClick={a => navigate(`/auctions/${a.id}`)}
    />
  )
}

// ── Zakładka: aukcje sprzedawcy ───────────────────────────────────────────────
function SellerTab({ currentUserId }: { currentUserId: string }) {
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useAuctionHistory()
  const columns = useAuctionColumns(currentUserId)

  if (isPending) return <TabSkeleton />
  if (isError)   return <TabError error={error} onRetry={() => void refetch()} />

  const mine = (data ?? []).filter(a => a.sellerId === currentUserId)
  if (mine.length === 0) return <TabEmpty message="Żadna z Twoich aukcji nie jest jeszcze zakończona." />

  return (
    <Table
      columns={columns}
      rows={mine}
      getKey={a => a.id}
      onRowClick={a => navigate(`/auctions/${a.id}`)}
    />
  )
}

// ── Strona historii ───────────────────────────────────────────────────────────
type Tab = 'global' | 'won' | 'seller'

export function HistoryPage() {
  const auth = useAuth()
  const currentUserId = auth.user?.profile.sub
  const isSeller = getRealmRoles(auth.user).includes('SELLER')

  const tabs: Array<{ id: Tab; label: string; show: boolean }> = [
    { id: 'global', label: 'Wszystkie',      show: true },
    { id: 'won',    label: 'Wygrałem',        show: auth.isAuthenticated },
    { id: 'seller', label: 'Moje sprzedaże', show: isSeller },
  ]

  const visibleTabs = tabs.filter(t => t.show)
  const [activeTab, setActiveTab] = useState<Tab>(visibleTabs[0].id)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink-1">Historia aukcji</h1>

      <div className="mb-6 flex gap-1 border-b border-line">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-ink-1 text-ink-1'
                : 'border-transparent text-ink-3 hover:text-ink-2',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'global' && <GlobalTab currentUserId={currentUserId} />}
      {activeTab === 'won'    && <WonTab currentUserId={currentUserId} />}
      {activeTab === 'seller' && currentUserId && <SellerTab currentUserId={currentUserId} />}
    </div>
  )
}
