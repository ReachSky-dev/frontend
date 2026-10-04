import type { User } from 'oidc-client-ts'

/**
 * Dekoduje payload JWT bez weryfikacji sygnatury.
 * Weryfikacja podpisu należy do backendu — tu tylko odczytujemy claims po stronie UI.
 */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>
  } catch {
    return {}
  }
}

function extractRoles(obj: unknown): string[] {
  if (typeof obj !== 'object' || obj === null) return []
  const roles = (obj as Record<string, unknown>)['roles']
  if (!Array.isArray(roles)) return []
  return roles.filter((r): r is string => typeof r === 'string')
}

/**
 * Wyciąga role z claim `realm_access.roles` w tokenie Keycloak.
 *
 * Keycloak domyślnie umieszcza realm_access w access tokenie, nie w ID tokenie.
 * Dlatego próbujemy najpierw ID token (user.profile), potem access token jako fallback.
 */
export function getRealmRoles(user: User | null | undefined): string[] {
  if (!user) return []

  // Próba 1: ID token — działa gdy mapper Keycloak dodaje realm_access do ID tokena
  const fromProfile = extractRoles(user.profile['realm_access'])
  if (fromProfile.length > 0) return fromProfile

  // Próba 2: access token — Keycloak zawsze tu umieszcza realm_access
  if (user.access_token) {
    const payload = decodeJwtPayload(user.access_token)
    return extractRoles(payload['realm_access'])
  }

  return []
}
