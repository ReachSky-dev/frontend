import { useAuth } from 'react-oidc-context'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { AuthControl } from '../features/auth/AuthControl'
import { getRealmRoles } from '../features/auth/roles'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { useTheme } from '../lib/theme'

function navClass({ isActive }: { isActive: boolean }) {
  return `text-sm transition-colors ${
    isActive ? 'text-ink-1 font-medium' : 'text-ink-2 hover:text-ink-1'
  }`
}

export function AppLayout() {
  const auth = useAuth()
  const isSeller = getRealmRoles(auth.user).includes('SELLER')
  const { theme } = useTheme()

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink-1">

      {/* ── Nagłówek ─────────────────────────────────────────── */}
      <header className="border-b border-line bg-canvas">
        <div className="mx-auto grid max-w-screen-xl grid-cols-12 items-center gap-4 px-6 py-4">

          {/* Logo — 2 kolumny */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center">
              <img
                src={theme === 'dark'
                  ? '/brand/reachsky-logo-dark.svg'
                  : '/brand/reachsky-logo-light.svg'}
                alt="ReachSky"
                className="h-7 w-auto"
              />
            </Link>
          </div>

          {/* Nawigacja — 7 kolumn */}
          <nav className="col-span-7 flex items-center gap-6">
            <NavLink to="/" end className={navClass}>
              Oferty
            </NavLink>
            <NavLink to="/auctions" className={navClass}>
              Aukcje
            </NavLink>
            <NavLink to="/history" className={navClass}>
              Historia
            </NavLink>
            {auth.isAuthenticated && (
              <NavLink to="/orders" className={navClass}>
                Zamówienia
              </NavLink>
            )}
            {isSeller && (
              <NavLink to="/seller" className={navClass}>
                Panel sprzedawcy
              </NavLink>
            )}
          </nav>

          {/* Konto — 3 kolumny, wyrównane do prawej */}
          <div className="col-span-3 flex items-center justify-end gap-2">
            <ThemeToggle />
            <AuthControl />
          </div>

        </div>
      </header>

      {/* ── Treść ─────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-screen-xl flex-1 px-6 py-8">
        <Outlet />
      </main>

      {/* ── Stopka ────────────────────────────────────────────── */}
      <footer className="border-t border-line py-4 text-center text-xs text-ink-3">
        ReachSky — platforma aukcyjna zasobów nietrwałych
      </footer>

    </div>
  )
}
