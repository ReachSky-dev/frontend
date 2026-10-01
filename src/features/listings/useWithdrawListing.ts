import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { ListingDto } from '../../api/types'

// UWAGA: Endpoint POST /api/listings/{id}/withdraw nie istnieje w bieżącym backendzie.
// Hook gotowy na przyszłość — nie podpinaj go pod UI dopóki backend nie udostępni endpointu.
export function useWithdrawListing() {
  const fetchWithAuth = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth<ListingDto>(`/listings/${id}/withdraw`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['listings'] })
      void queryClient.invalidateQueries({ queryKey: ['listings', id] })
    },
  })
}
