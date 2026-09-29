import { useAuth } from 'react-oidc-context'
import { useLocation } from 'react-router-dom'
import { ForbiddenPage } from '../../app/ForbiddenPage'
import { getRealmRoles } from './roles'

// UWAGA: Widoczność w UI nie jest zabezpieczeniem.
// Backend waliduje każde żądanie niezależnie od stanu frontendu.

type RequireRoleProps = {
  role: string
  children: React.ReactNode
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isLoading) return null

  if (!auth.isAuthenticated) {
    void auth.signinRedirect({ state: location.pathname })
    return null
  }

  if (!getRealmRoles(auth.user).includes(role)) {
    return <ForbiddenPage />
  }

  return <>{children}</>
}
