export type StatusDotVariant = 'ok' | 'warn' | 'err' | 'default'

const dotClasses: Record<StatusDotVariant, string> = {
  ok:      'bg-ok',
  warn:    'bg-warn',
  err:     'bg-err',
  default: 'bg-ink-3',
}

type StatusDotProps = {
  variant: StatusDotVariant
  label: string
}

export function StatusDot({ variant, label }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={label}>
      <span className={`size-2 shrink-0 rounded-full ${dotClasses[variant]}`} aria-hidden="true" />
      <span className="text-sm text-ink-2">{label}</span>
    </span>
  )
}
