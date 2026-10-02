/**
 * Wspólne słowniki etykiet i kształtów statusów aukcji.
 * Jedno miejsce — używane w AuctionsPage, AuctionDetailPage i SellerDashboardPage.
 */
import type { StatusShape } from '../../components/ui/StatusDot'
import type { AuctionStatus, AuctionType } from '../../api/types'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'default'

// ── Etykiety statusów ─────────────────────────────────────────────────────────
export const auctionStatusLabel: Record<AuctionStatus, string> = {
  DRAFT:           'Szkic',
  SCHEDULED:       'Zaplanowana',
  RUNNING:         'Trwa',
  SOLD:            'Sprzedana',
  RESERVE_NOT_MET: 'Bez rozstrzygnięcia',
  CANCELLED:       'Anulowana',
  SETTLED:         'Rozliczona',
}

// ── Kształty StatusDot ────────────────────────────────────────────────────────
// Kształt koduje semantykę — czy aukcja jest żywa, oczekująca, czy zakończona.
// RUNNING → live (●) z bursztynem: jedyny stan "żywy" z uwydatnionym kolorem.
export const auctionStatusShape: Record<AuctionStatus, StatusShape> = {
  DRAFT:           'draft',
  SCHEDULED:       'pending',
  RUNNING:         'live',
  SOLD:            'done-ok',
  RESERVE_NOT_MET: 'done-err',
  CANCELLED:       'done-err',
  SETTLED:         'done-ok',
}

// ── Warianty Badge (dla AuctionDetailPage) ────────────────────────────────────
export const auctionStatusBadgeVariant: Record<AuctionStatus, BadgeVariant> = {
  DRAFT:           'default',
  SCHEDULED:       'warning',
  RUNNING:         'success',
  SOLD:            'success',
  RESERVE_NOT_MET: 'error',
  CANCELLED:       'error',
  SETTLED:         'default',
}

// ── Etykiety typów ────────────────────────────────────────────────────────────
export const auctionTypeLabel: Record<AuctionType, string> = {
  ENGLISH: 'Angielska',
  DUTCH:   'Holenderska',
}
