import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InMemoryWebStorage, WebStorageStateStore } from 'oidc-client-ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import App from './App.tsx'
import { config } from './config'
import './index.css'

const queryClient = new QueryClient()

// Tokeny trzymane w pamięci aplikacji, nie w localStorage — per CLAUDE.md
const oidcConfig = {
  authority: config.oidcAuthority,
  client_id: config.oidcClientId,
  redirect_uri: `${window.location.origin}/callback`,
  scope: 'openid profile email',
  userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider {...oidcConfig}>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
