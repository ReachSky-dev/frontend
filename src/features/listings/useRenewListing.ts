import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { ListingDto } from '../../api/types'

export function useRenewListing() {
  const fetchWithAuth = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth<ListingDto>(`/listings/${id}/renew`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['listings'] })
      void queryClient.invalidateQueries({ queryKey: ['listings', id] })
    },
  })
}
