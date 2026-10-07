import { useAuth } from 'react-oidc-context'
import { Button } from '../../components/ui/Button'

function UserMenu() {
  const auth = useAuth()
  const displayName =
    auth.user?.profile.name ??
    auth.user?.profile.preferred_username ??
    'Użytkownik'

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-ink-1">{displayName}</span>
      <Button
        variant="ghost"
        buttonSize="sm"
        onClick={() => void auth.signoutRedirect()}
      >
        Wyloguj
      </Button>
    </div>
  )
}

export function AuthControl() {
  const auth = useAuth()

  if (auth.isLoading) return null

  if (!auth.isAuthenticated) {
    return (
      <Button
        variant="secondary"
        buttonSize="sm"
        onClick={() => void auth.signinRedirect({ state: { returnTo: window.location.pathname } })}
      >
        Zaloguj się
      </Button>
    )
  }

  return <UserMenu />
}
