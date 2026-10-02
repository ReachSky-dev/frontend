import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import type { AuctionDto, AuctionStatus, AuctionType } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusDot } from '../../components/ui/StatusDot'
import type { StatusDotVariant } from '../../components/ui/StatusDot'
import type { Column } from '../../components/ui/Table'
import { Table } from '../../components/ui/Table'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { useAuctions } from './useAuctions'

const statusDotVariant: Record<AuctionStatus, StatusDotVariant> = {
  DRAFT:           'default',
  SCHEDULED:       'warn',
  RUNNING:         'ok',
  SOLD:            'ok',
  RESERVE_NOT_MET: 'err',
  CANCELLED:       'err',
  SETTLED:         'default',
}

const statusLabel: Record<AuctionStatus, string> = {
  DRAFT:           'Szkic',
  SCHEDULED:       'Zaplanowana',
  RUNNING:         'Trwa',
  SOLD:            'Sprzedana',
  RESERVE_NOT_MET: 'Rezerwacja niespełniona',
  CANCELLED:       'Anulowana',
  SETTLED:         'Rozliczona',
}

const typeLabel: Record<AuctionType, string> = {
  ENGLISH: 'Angielska',
  DUTCH:   'Holenderska',
}

const columns: Column<AuctionDto>[] = [
  {
    key: 'status',
    label: 'Status',
    render: a => <StatusDot variant={statusDotVariant[a.status]} label={statusLabel[a.status]} />,
    className: 'w-44',
  },
  {
    key: 'type',
    label: 'Typ',
    render: a => <span className="text-ink-2">{typeLabel[a.type]}</span>,
    className: 'w-36',
  },
  {
    key: 'price',
    label: 'Cena',
    render: a => (
      <span className="tabular-nums font-medium text-ink-1">
        {formatMoney(a.currentPriceAmount, a.currentPriceCurrency)}
      </span>
    ),
    className: 'w-40',
  },
  {
    key: 'endsAt',
    label: 'Kończy się',
    render: a => (
      <span className="tabular-nums text-ink-2">
        {formatDateTime(a.endsAt)}
      </span>
    ),
  },
]

// ── Stany ładowania ──────────────────────────────────────────────────────────

function AuctionsSkeleton() {
  return (
    <div className="space-y-0">
      <div className="border-b border-line pb-3">
        <div className="flex gap-8">
          {[44, 36, 40, 56].map((w, i) => (
            <Skeleton key={i} className={`h-4 w-${w}`} />
          ))}
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-8 border-b border-line py-3 last:border-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  )
}

// ── Strona ───────────────────────────────────────────────────────────────────

export function AuctionsPage() {
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useAuctions()
  const auctions = data ?? []

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink-1">Aukcje</h1>

      {/* Stan: ładowanie */}
      {isPending && <AuctionsSkeleton />}

      {/* Stan: błąd */}
      {isError && (
        <div className="rounded-lg border border-err/20 bg-err-muted p-8 text-center">
          <p className="font-medium text-err">
            {error instanceof ApiError
              ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
              : 'Nie udało się wczytać aukcji.'}
          </p>
          <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={() => void refetch()}>
            Spróbuj ponownie
          </Button>
        </div>
      )}

      {/* Stan: brak danych */}
      {!isPending && !isError && auctions.length === 0 && (
        <div className="rounded-lg border border-line bg-layer p-12 text-center">
          <p className="text-ink-2">Brak aktywnych aukcji.</p>
        </div>
      )}

      {/* Stan: dane */}
      {!isPending && !isError && auctions.length > 0 && (
        <Table
          columns={columns}
          rows={auctions}
          getKey={a => a.id}
          onRowClick={a => navigate(`/auctions/${a.id}`)}
        />
      )}
    </div>
  )
}
