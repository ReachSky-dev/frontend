import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import type { AuctionDto } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Countdown } from '../../components/ui/Countdown'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusDot } from '../../components/ui/StatusDot'
import { Table } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import {
  auctionStatusShape,
  auctionStatusLabel,
  auctionTypeLabel,
} from './auctionMeta'
import { useAuctions } from './useAuctions'
import { useCountdown } from './useCountdown'

// ── Komórka czasu — reguła wyświetlania: ─────────────────────────────────────
// RUNNING   → odliczanie pozostałego czasu (Countdown)
// SCHEDULED → data startu (kiedy się zacznie)
// pozostałe → kreska (aukcja zakończona lub w szkicu)
function TimeCell({ auction }: { auction: AuctionDto }) {
  if (auction.status === 'RUNNING') {
    return <RunningTime endsAt={auction.endsAt} />
  }
  if (auction.status === 'SCHEDULED') {
    return (
      <span className="tabular-nums text-ink-2">
        start {formatDateTime(auction.startsAt)}
      </span>
    )
  }
  return <span className="text-ink-3">—</span>
}

function RunningTime({ endsAt }: { endsAt: string }) {
  const { h, m, s } = useCountdown(endsAt)
  return <Countdown h={h} m={m} s={s} />
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function AuctionsSkeleton() {
  return (
    <div>
      <div className="border-b border-line pb-3">
        <div className="flex gap-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-8 border-b border-line py-3 last:border-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  )
}

// ── Strona ────────────────────────────────────────────────────────────────────
export function AuctionsPage() {
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useAuctions()
  const auctions = data ?? []

  // Kolumny zdefiniowane wewnątrz komponentu — pewne zamknięcie nad importami.
  const columns: Column<AuctionDto>[] = [
    {
      key: 'status',
      label: 'Status',
      render: a => (
        <StatusDot
          shape={auctionStatusShape[a.status]}
          label={auctionStatusLabel[a.status]}
        />
      ),
      className: 'w-48',
    },
    {
      key: 'type',
      label: 'Typ',
      // Wartość z API: "ENGLISH" | "DUTCH". Fallback na wartość surową gdy
      // backend zwróci nieznany wariant (nie powinno się zdarzyć).
      render: a => (
        <span className="text-ink-2">
          {auctionTypeLabel[a.type] ?? String(a.type)}
        </span>
      ),
      className: 'w-32',
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
      key: 'time',
      label: 'Kończy się',
      render: a => <TimeCell auction={a} />,
    },
  ]

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
