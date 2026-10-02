import type { StatusShape } from '../../components/ui/StatusDot'
import type { ListingStatus } from '../../api/types'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'default'

export const listingStatusLabel: Record<ListingStatus, string> = {
  DRAFT:  'Szkic',
  ACTIVE: 'Aktywna',
  CLOSED: 'Zamknięta',
}

// ACTIVE → pending (◌) bo oferta czeka na aukcję, nie "trwa" sama w sobie.
// Bursztyn (live) zarezerwowany wyłącznie dla RUNNING aukcji.
export const listingStatusShape: Record<ListingStatus, StatusShape> = {
  DRAFT:  'draft',
  ACTIVE: 'pending',
  CLOSED: 'done-ok',
}

export const listingStatusBadgeVariant: Record<ListingStatus, BadgeVariant> = {
  DRAFT:  'default',
  ACTIVE: 'success',
  CLOSED: 'default',
}
