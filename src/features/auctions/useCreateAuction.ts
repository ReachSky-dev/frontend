import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { AuctionDto, CreateAuctionRequest } from '../../api/types'

export function useCreateAuction() {
  const fetchWithAuth = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateAuctionRequest) =>
      fetchWithAuth<AuctionDto>('/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auctions'] })
    },
  })
}
