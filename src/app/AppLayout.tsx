import { useAuth } from 'react-oidc-context'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { AuthControl } from '../features/auth/AuthControl'
import { getRealmRoles } from '../features/auth/roles'

export function AppLayout() {
  const auth = useAuth()
  const isSeller = getRealmRoles(auth.user).includes('SELLER')

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="text-lg font-bold text-zinc-100 transition-colors hover:text-violet-400"
          >
            ReachSky
          </Link>

          <nav className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? 'text-violet-400' : 'text-zinc-400 hover:text-zinc-100'}`
              }
            >
              Oferty
            </NavLink>
            {isSeller && (
              <NavLink
                to="/listings/new"
                className={({ isActive }) =>
                  `text-sm transition-colors ${isActive ? 'text-violet-400' : 'text-zinc-400 hover:text-zinc-100'}`
                }
              >
                Nowy listing
              </NavLink>
            )}
          </nav>

          <AuthControl />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-600">
        ReachSky — platforma aukcyjna zasobów nietrwałych
      </footer>
    </div>
  )
}
