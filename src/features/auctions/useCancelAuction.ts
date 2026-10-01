import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { AuctionDto } from '../../api/types'

export function useCancelAuction() {
  const fetchWithAuth = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth<AuctionDto>(`/auctions/${id}/cancel`, { method: 'POST' }),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['auctions'] })
      void queryClient.invalidateQueries({ queryKey: ['auctions', id] })
    },
  })
}
