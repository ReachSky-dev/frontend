import { useQuery } from '@tanstack/react-query'
import { useAuth } from 'react-oidc-context'
import { useApiFetch } from '../../api/useApiFetch'
import type { UserDto } from '../../api/types'

/**
 * Łączy stan OIDC z react-oidc-context z danymi profilu z GET /api/me.
 */
export function useCurrentUser() {
  const auth = useAuth()
  const fetchWithAuth = useApiFetch()

  const query = useQuery({
    queryKey: ['me'],
    queryFn: () => fetchWithAuth<UserDto>('/me'),
    enabled: auth.isAuthenticated,
  })

  return {
    isLoading: auth.isLoading || (auth.isAuthenticated && query.isLoading),
    isAuthenticated: auth.isAuthenticated,
    user: query.data,
    authUser: auth.user,
    error: query.error,
  }
}
