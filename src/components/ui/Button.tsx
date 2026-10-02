type Variant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

// ZMIANA 1: brak koloru marki — primary używa wypełnienia wash + ramki line-hi
const variantClasses: Record<Variant, string> = {
  primary:   'bg-wash border border-line-hi text-ink-1 hover:opacity-90',
  secondary: 'border border-line text-ink-2 hover:border-line-hi hover:text-ink-1',
  ghost:     'text-ink-2 hover:text-ink-1',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2   text-sm',
  lg: 'px-5 py-2.5 text-base',
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  buttonSize?: ButtonSize
}

export function Button({ variant = 'primary', buttonSize = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${sizeClasses[buttonSize]} ${className}`}
      {...props}
    />
  )
}
