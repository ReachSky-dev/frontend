/// <reference types="vite/client" />

interface RuntimeConfig {
  apiUrl: string
  oidcAuthority: string
  oidcClientId: string
}

interface Window {
  __RUNTIME_CONFIG__: RuntimeConfig
}
