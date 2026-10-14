import { useAuth } from 'react-oidc-context'

/**
 * Pasek demonstracyjny — widoczny tylko dla niezalogowanych.
 * Umożliwia szybkie zalogowanie na konto demo kupującego lub sprzedawcy
 * za pomocą login_hint przekazywanego do Keycloaka.
 */
export function DemoBar() {
  const auth = useAuth()

  if (auth.isAuthenticated || auth.isLoading) return null

  function loginAs(hint: 'buyer' | 'seller') {
    void auth.signinRedirect({
      extraQueryParams: { login_hint: hint },
      state: { returnTo: window.location.pathname },
    })
  }

  return (
    <div className="border-b border-line bg-layer px-6 py-2">
      <div className="mx-auto flex max-w-screen-xl items-center gap-4">
        <span className="text-xs text-ink-3">Środowisko demo —</span>
        <button
          onClick={() => loginAs('buyer')}
          className="text-xs text-ink-2 underline underline-offset-2 transition-colors hover:text-ink-1"
        >
          zaloguj jako kupujący
        </button>
        <button
          onClick={() => loginAs('seller')}
          className="text-xs text-ink-2 underline underline-offset-2 transition-colors hover:text-ink-1"
        >
          zaloguj jako sprzedawca
        </button>
      </div>
    </div>
  )
}
