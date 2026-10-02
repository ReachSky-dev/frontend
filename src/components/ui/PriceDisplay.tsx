import { formatMoney } from '../../lib/money'

type PriceDisplayProps = {
  amount: number
  currency: string
  label?: string
}

// Bursztyn (text-price) pojawia się WYŁĄCZNIE w tym komponencie i Countdown.
export function PriceDisplay({ amount, currency, label }: PriceDisplayProps) {
  return (
    <div className="text-center">
      {label && <p className="mb-1 text-sm text-ink-2">{label}</p>}
      <p
        className="tabular-nums font-semibold leading-none tracking-tighter text-price"
        style={{ fontSize: '4rem' }}
      >
        {formatMoney(amount, currency)}
      </p>
    </div>
  )
}
