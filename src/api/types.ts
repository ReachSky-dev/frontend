// NOTE: Typy pisane ręcznie na potrzeby faz 0–3.
// W fazie 4 zastąpi je generator z OpenAPI backendu (npm run generate-api).
// Po wdrożeniu generatora nie edytuj tego pliku ręcznie.

export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT'

export interface ListingDto {
  id: string
  title: string
  description: string
  availableFrom: string    // ISO-8601 UTC (Instant)
  availableTo: string      // ISO-8601 UTC (Instant)
  capacity: number
  priceInMinorUnits: number
  currency: string         // ISO 4217, np. "PLN", "EUR"
  status: ListingStatus
  sellerId: string
}

export interface PageDto<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number           // bieżąca strona (0-indexed)
  size: number
}

export interface ProblemDetail {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
}
