import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { BidDto, PlaceBidRequest } from '../../api/types'

export function usePlaceBid(auctionId: string) {
  const fetchWithAuth = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: PlaceBidRequest; idempotencyKey: string }) =>
      fetchWithAuth<BidDto>(`/auctions/${auctionId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      // Natychmiastowa invalidacja — nie czekamy na refetchInterval
      void queryClient.invalidateQueries({ queryKey: ['auctions', auctionId] })
      void queryClient.invalidateQueries({ queryKey: ['bids', auctionId] })
    },
  })
}
