import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import type { ListingDto } from '../../api/types'

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listings', id],
    queryFn: () => apiFetch<ListingDto>(`/listings/${id}`),
    enabled: id.length > 0,
  })
}
