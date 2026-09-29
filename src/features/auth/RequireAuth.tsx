import { useAuth } from 'react-oidc-context'
import { useLocation } from 'react-router-dom'

type RequireAuthProps = { children: React.ReactNode }

export function RequireAuth({ children }: RequireAuthProps) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isLoading) return null

  if (!auth.isAuthenticated) {
    void auth.signinRedirect({ state: location.pathname })
    return null
  }

  return <>{children}</>
}
