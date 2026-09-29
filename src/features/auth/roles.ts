import type { User } from 'oidc-client-ts'

/**
 * Wyciąga role z claim `realm_access.roles` w tokenie Keycloak.
 * Używa unknown + zawężanie typów — bez `any`.
 */
export function getRealmRoles(user: User | null | undefined): string[] {
  if (!user) return []
  const realmAccess = user.profile['realm_access']
  if (typeof realmAccess !== 'object' || realmAccess === null) return []
  const roles = (realmAccess as Record<string, unknown>)['roles']
  if (!Array.isArray(roles)) return []
  return roles.filter((r): r is string => typeof r === 'string')
}
