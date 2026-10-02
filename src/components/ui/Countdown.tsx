type CountdownProps = {
  h: number
  m: number
  s: number
  label?: string
}

// Bursztyn (text-price) pojawia się WYŁĄCZNIE tutaj i w PriceDisplay.
export function Countdown({ h, m, s, label }: CountdownProps) {
  return (
    <div className="text-center">
      {label && <p className="mb-0.5 text-xs text-ink-3">{label}</p>}
      <span className="tabular-nums text-xl font-medium text-price">
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  )
}
