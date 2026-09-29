import { useQuery } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { ListingDto } from '../../api/types'

export function useListing(id: string) {
  const fetchWithAuth = useApiFetch()
  return useQuery({
    queryKey: ['listings', id],
    queryFn: () => fetchWithAuth<ListingDto>(`/listings/${id}`),
    enabled: id.length > 0,
  })
}
