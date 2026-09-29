type BadgeVariant = 'default' | 'success' | 'warning' | 'error'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-zinc-700 text-zinc-300',
  success: 'bg-emerald-900/60 text-emerald-400',
  warning: 'bg-amber-900/60 text-amber-400',
  error:   'bg-red-900/60 text-red-400',
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
