import { useQuery } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { AuctionDto } from '../../api/types'

export function useAuctions() {
  const fetchWithAuth = useApiFetch()
  return useQuery({
    queryKey: ['auctions'],
    queryFn: () => fetchWithAuth<AuctionDto[]>('/auctions'),
  })
}
