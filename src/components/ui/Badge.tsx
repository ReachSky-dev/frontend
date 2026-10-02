type BadgeVariant = 'default' | 'success' | 'warning' | 'error'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-wash    text-ink-2',
  success: 'bg-ok-muted  text-ok',
  warning: 'bg-warn-muted text-warn',
  error:   'bg-err-muted  text-err',
}

type BadgeProps = {
  variant?: BadgeVariant
  children: React.ReactNode
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
