import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { SetProxyBidRequest } from '../../api/types'

export function useSetProxyBid(auctionId: string) {
  const fetchWithAuth = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SetProxyBidRequest) =>
      fetchWithAuth<void>(`/auctions/${auctionId}/bids/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auctions', auctionId] })
      void queryClient.invalidateQueries({ queryKey: ['bids', auctionId] })
    },
  })
}
