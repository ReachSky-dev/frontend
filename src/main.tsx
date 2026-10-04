import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WebStorageStateStore } from 'oidc-client-ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import App from './App.tsx'
import { config } from './config'
import './index.css'

const queryClient = new QueryClient()

// Tokeny w sessionStorage — przeżywają odświeżenie strony, czyszczone przy zamknięciu karty.
// InMemoryWebStorage powodowało wylogowanie przy każdym F5 — niedopuszczalne UX.
const oidcConfig = {
  authority: config.oidcAuthority,
  client_id: config.oidcClientId,
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: `${window.location.origin}/logged-out`,
  scope: 'openid profile email',
  userStore: new WebStorageStateStore({ store: sessionStorage }),
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
