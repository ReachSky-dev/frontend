import { describe, expect, it } from 'vitest'
import type { User } from 'oidc-client-ts'
import { getRealmRoles } from './roles'

function makeUser(profileRoles?: string[], accessTokenRoles?: string[]): User {
  const profile: Record<string, unknown> = {}
  if (profileRoles !== undefined) {
    profile['realm_access'] = { roles: profileRoles }
  }

  let access_token: string | undefined
  if (accessTokenRoles !== undefined) {
    const payload = { realm_access: { roles: accessTokenRoles } }
    access_token = `header.${btoa(JSON.stringify(payload))}.sig`
  }

  return { profile, access_token } as unknown as User
}

describe('getRealmRoles', () => {
  it('zwraca [] dla null', () => {
    expect(getRealmRoles(null)).toEqual([])
  })

  it('zwraca [] dla undefined', () => {
    expect(getRealmRoles(undefined)).toEqual([])
  })

  it('wyciąga role z profile.realm_access (ID token)', () => {
    const user = makeUser(['buyer', 'seller'])
    expect(getRealmRoles(user)).toEqual(['buyer', 'seller'])
  })

  it('wyciąga role z access tokena gdy brak w profilu', () => {
    const user = makeUser(undefined, ['seller'])
    expect(getRealmRoles(user)).toEqual(['seller'])
  })

  it('preferuje profil gdy obie opcje dostępne', () => {
    const user = makeUser(['buyer'], ['seller'])
    expect(getRealmRoles(user)).toEqual(['buyer'])
  })

  it('zwraca [] gdy brak realm_access wszędzie', () => {
    const user = makeUser()
    expect(getRealmRoles(user)).toEqual([])
  })

  it('zwraca [] dla zniekształconego access tokena', () => {
    const user = { profile: {}, access_token: 'not.valid.jwt' } as unknown as User
    expect(getRealmRoles(user)).toEqual([])
  })

  it('ignoruje niestring-owe wartości w tablicy ról', () => {
    const payload = { realm_access: { roles: ['buyer', 42, null, 'seller'] } }
    const access_token = `h.${btoa(JSON.stringify(payload))}.s`
    const user = { profile: {}, access_token } as unknown as User
    expect(getRealmRoles(user)).toEqual(['buyer', 'seller'])
  })
})
