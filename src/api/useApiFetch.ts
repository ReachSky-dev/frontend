import { useAuth } from 'react-oidc-context'
import { useNavigate } from 'react-router-dom'
import { ApiError, apiFetch } from './client'

/**
 * Hook zwracający funkcję fetch wzbogaconą o:
 * - nagłówek Authorization: Bearer gdy użytkownik zalogowany,
 * - automatyczne wyczyszczenie sesji i przekierowanie na / przy 401.
 *
 * Token pobierany z kontekstu auth, nie z globalnej zmiennej.
 */
export function useApiFetch() {
  const { user, removeUser } = useAuth()
  const navigate = useNavigate()
  const token = user?.access_token

  return function authenticatedFetch<T>(path: string, init?: RequestInit): Promise<T> {
    return apiFetch<T>(path, init, token).catch((err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        void removeUser()
        navigate('/', { replace: true })
      }
      throw err
    })
  }
}
