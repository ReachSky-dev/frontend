import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-6xl font-bold text-ink-1">404</p>
      <p className="mt-4 text-xl text-ink-2">Strona nie istnieje</p>
      <Link
        to="/"
        className="mt-8 text-sm text-primary transition-colors hover:text-ink-1"
      >
        ← Wróć do ofert
      </Link>
    </div>
  )
}
