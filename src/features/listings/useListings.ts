import { useQuery } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { ListingDto } from '../../api/types'

export function useListings() {
  const fetchWithAuth = useApiFetch()
  return useQuery({
    queryKey: ['listings'],
    queryFn: () => fetchWithAuth<ListingDto[]>('/listings'),
  })
}
