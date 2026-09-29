import { useQuery } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { ListingDto, PageDto } from '../../api/types'

export function useListings(page = 0, size = 12) {
  const fetchWithAuth = useApiFetch()
  return useQuery({
    queryKey: ['listings', page, size],
    queryFn: () => fetchWithAuth<PageDto<ListingDto>>(`/listings?page=${page}&size=${size}`),
  })
}
