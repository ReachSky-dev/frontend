import { useQuery } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { AuctionDto } from '../../api/types'

export function useAuction(id: string) {
  const fetchWithAuth = useApiFetch()
  return useQuery({
    queryKey: ['auctions', id],
    queryFn: () => fetchWithAuth<AuctionDto>(`/auctions/${id}`),
    enabled: id.length > 0,
    // Odświeżaj co 5 sekund — wartość z serwera zawsze wygrywa nad lokalną interpolacją.
    refetchInterval: 5_000,
  })
}
