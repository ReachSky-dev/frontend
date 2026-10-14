import { useAuth } from 'react-oidc-context'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import type { OrderDto } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusDot } from '../../components/ui/StatusDot'
import { Table } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { formatDateTime } from '../../lib/datetime'
import { formatMoney } from '../../lib/money'
import { orderStatusLabel, orderStatusShape } from './orderMeta'
import { useOrders } from './useOrders'
import { usePayOrder } from './usePayOrder'

// ── Szkielet ─────────────────────────────────────────────────────────────────
function OrdersSkeleton() {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-8 border-b border-line py-3 last:border-0">
          {[44, 32, 28, 24, 20].map((w, j) => (
            <Skeleton key={j} className={`h-4 w-${w}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Wiersz tabeli z akcją opłacenia ──────────────────────────────────────────
function PayCell({ order }: { order: OrderDto }) {
  const { mutate, isPending } = usePayOrder()

  if (order.status !== 'PENDING_PAYMENT') return null

  return (
    <Button
      variant="primary"
      buttonSize="sm"
      disabled={isPending}
      onClick={e => {
        e.stopPropagation()
        mutate(order.id)
      }}
    >
      {isPending ? 'Przetwarzanie…' : 'Opłać'}
    </Button>
  )
}

// ── Kolumny tabeli ────────────────────────────────────────────────────────────
function useOrderColumns(): Column<OrderDto>[] {
  return [
    {
      key: 'status',
      label: 'Status',
      className: 'w-52',
      render: o => (
        <StatusDot shape={orderStatusShape[o.status]} label={orderStatusLabel[o.status]} />
      ),
    },
    {
      key: 'amount',
      label: 'Kwota',
      className: 'w-36',
      render: o => (
        <span className="tabular-nums font-medium text-ink-1">
          {formatMoney(o.amountInMinorUnits, o.currency)}
        </span>
      ),
    },
    {
      key: 'deadline',
      label: 'Termin płatności',
      className: 'w-52',
      render: o => (
        <span className="tabular-nums text-ink-2">{formatDateTime(o.paymentDeadline)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Utworzone',
      render: o => (
        <span className="tabular-nums text-ink-2">{formatDateTime(o.createdAt)}</span>
      ),
    },
    {
      key: 'action',
      label: '',
      className: 'w-24 text-right',
      render: o => <PayCell order={o} />,
    },
  ]
}

// ── Strona zamówień ───────────────────────────────────────────────────────────
export function OrdersPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useOrders(auth.isAuthenticated)
  const columns = useOrderColumns()

  if (!auth.isAuthenticated) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-ink-1">Moje zamówienia</h1>
        <div className="rounded-lg border border-line bg-layer p-12 text-center">
          <p className="text-ink-2">Zaloguj się, żeby zobaczyć swoje zamówienia.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink-1">Moje zamówienia</h1>

      {/* Stan: ładowanie */}
      {isPending && <OrdersSkeleton />}

      {/* Stan: błąd */}
      {isError && (
        <div className="rounded-lg border border-err/20 bg-err-muted p-8 text-center">
          <p className="font-medium text-err">
            {error instanceof ApiError
              ? `${error.title}${error.detail ? ` — ${error.detail}` : ''}`
              : 'Nie udało się wczytać zamówień.'}
          </p>
          <Button variant="secondary" buttonSize="sm" className="mt-4" onClick={() => void refetch()}>
            Spróbuj ponownie
          </Button>
        </div>
      )}

      {/* Stan: pusto */}
      {!isPending && !isError && (data ?? []).length === 0 && (
        <div className="rounded-lg border border-line bg-layer p-12 text-center">
          <p className="text-ink-2">Nie masz jeszcze żadnych zamówień.</p>
        </div>
      )}

      {/* Stan: dane */}
      {!isPending && !isError && (data ?? []).length > 0 && (
        <Table
          columns={columns}
          rows={data ?? []}
          getKey={o => o.id}
          onRowClick={o => navigate(`/auctions/${o.auctionId}`)}
        />
      )}
    </div>
  )
}
