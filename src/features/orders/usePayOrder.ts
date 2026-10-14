import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '../../api/useApiFetch'
import type { OrderDto } from '../../api/types'

export function usePayOrder() {
  const fetchWithAuth = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) =>
      fetchWithAuth<OrderDto>(`/orders/${orderId}/pay`, { method: 'POST' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
