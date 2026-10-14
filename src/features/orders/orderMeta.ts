import type { StatusShape } from '../../components/ui/StatusDot'
import type { OrderStatus } from '../../api/types'

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Oczekuje na płatność',
  PAID:            'Opłacone',
  CONFIRMED:       'Potwierdzone',
  EXPIRED:         'Wygasłe',
  CANCELLED:       'Anulowane',
}

export const orderStatusShape: Record<OrderStatus, StatusShape> = {
  PENDING_PAYMENT: 'pending',
  PAID:            'live',
  CONFIRMED:       'done-ok',
  EXPIRED:         'done-err',
  CANCELLED:       'done-err',
}
