import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-6xl font-bold text-ink-1">403</p>
      <p className="mt-4 text-xl text-ink-2">Brak uprawnień</p>
      <p className="mt-2 text-sm text-ink-3">
        Nie masz roli wymaganej do wyświetlenia tej strony.
      </p>
      <Link
        to="/"
        className="mt-8 text-sm text-primary transition-colors hover:text-ink-1"
      >
        ← Wróć do ofert
      </Link>
    </div>
  )
}
