import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import type { ListingDto, PageDto } from '../../api/types'

export function useListings(page = 0, size = 12) {
  return useQuery({
    queryKey: ['listings', page, size],
    queryFn: () => apiFetch<PageDto<ListingDto>>(`/listings?page=${page}&size=${size}`),
  })
}
