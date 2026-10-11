import { useEffect } from 'react'
import { useAuth } from 'react-oidc-context'
import { Link, useNavigate } from 'react-router-dom'

export function CallbackPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.isLoading && !auth.error && auth.isAuthenticated) {
      const state = auth.user?.state as { returnTo?: string } | undefined
      navigate(state?.returnTo ?? '/', { replace: true })
    }
  }, [auth.isLoading, auth.error, auth.isAuthenticated, auth.user, navigate])

  if (auth.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="text-center">
          <p className="text-lg font-medium text-err">Błąd logowania</p>
          <p className="mt-2 text-sm text-ink-3">{auth.error.message}</p>
          <Link
            to="/"
            className="mt-6 inline-block text-sm text-primary transition-colors hover:text-ink-1"
          >
            ← Wróć na stronę główną
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <p className="text-ink-2">Logowanie…</p>
    </div>
  )
}
