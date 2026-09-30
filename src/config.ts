const rc = window.__RUNTIME_CONFIG__

function requireValue(key: keyof RuntimeConfig): string {
  const value = rc?.[key]
  if (!value) {
    throw new Error(
      `[config] Brakująca wartość konfiguracji runtime: "${key}". ` +
      `Upewnij się, że /config.js jest załadowany przed bundlem aplikacji.`,
    )
  }
  return value
}

export const config = {
  apiUrl: requireValue('apiUrl'),
  oidcAuthority: requireValue('oidcAuthority'),
  oidcClientId: requireValue('oidcClientId'),
} as const
