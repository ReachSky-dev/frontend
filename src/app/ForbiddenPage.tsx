import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-6xl font-bold text-zinc-700">403</p>
      <p className="mt-4 text-xl text-zinc-400">Brak uprawnień</p>
      <p className="mt-2 text-sm text-zinc-500">
        Nie masz roli wymaganej do wyświetlenia tej strony.
      </p>
      <Link
        to="/"
        className="mt-8 text-sm text-violet-400 transition-colors hover:text-violet-300"
      >
        ← Wróć do ofert
      </Link>
    </div>
  )
}
