type Variant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:   'bg-violet-600 text-white hover:bg-violet-500',
  secondary: 'border border-zinc-600 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100',
  ghost:     'text-zinc-400 hover:text-zinc-100',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  buttonSize?: ButtonSize
}

export function Button({ variant = 'primary', buttonSize = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center rounded font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[buttonSize]} ${className}`}
      {...props}
    />
  )
}
