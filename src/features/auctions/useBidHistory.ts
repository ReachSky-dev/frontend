import { useQuery } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { BidDto } from '../../api/types'

export function useBidHistory(auctionId: string) {
  const fetchWithAuth = useApiFetch()
  return useQuery({
    queryKey: ['bids', auctionId],
    queryFn: () => fetchWithAuth<BidDto[]>(`/auctions/${auctionId}/bids`),
    enabled: !!auctionId,
    refetchInterval: 5_000,
  })
}
