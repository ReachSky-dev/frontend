import { useQuery } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { AuctionDto } from '../../api/types'

export function useAuctionHistory() {
  const fetchWithAuth = useApiFetch()
  return useQuery({
    queryKey: ['auctions', 'history'],
    queryFn: () => fetchWithAuth<AuctionDto[]>('/auctions/history'),
  })
}
