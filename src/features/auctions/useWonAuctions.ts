import { useQuery } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { AuctionDto } from '../../api/types'

export function useWonAuctions(enabled: boolean) {
  const fetchWithAuth = useApiFetch()
  return useQuery({
    queryKey: ['auctions', 'won'],
    queryFn: () => fetchWithAuth<AuctionDto[]>('/auctions/won'),
    enabled,
  })
}
