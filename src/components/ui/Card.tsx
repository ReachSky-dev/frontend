type CardProps = {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border border-zinc-700 bg-zinc-900 p-4 ${className}`}>
      {children}
    </div>
  )
}
