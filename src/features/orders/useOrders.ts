import { useQuery } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { OrderDto } from '../../api/types'

export function useOrders(enabled: boolean) {
  const fetchWithAuth = useApiFetch()
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchWithAuth<OrderDto[]>('/orders'),
    enabled,
  })
}
