// NOTE: Typy pisane ręcznie na potrzeby faz 0–3.
// W fazie 4 zastąpi je generator z OpenAPI backendu (npm run generate-api).
// Po wdrożeniu generatora nie edytuj tego pliku ręcznie.

export type ListingStatus = 'DRAFT' | 'ACTIVE'

export interface ListingDto {
  id: string
  sellerId: string
  title: string
  description: string
  windowStart: string    // ISO-8601 UTC (Instant)
  windowEnd: string      // ISO-8601 UTC (Instant)
  capacity: number
  status: ListingStatus
  createdAt: string
}

export interface PageDto<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number           // bieżąca strona (0-indexed)
  size: number
}

export interface UserDto {
  sub: string
  displayName: string
  email: string
  roles: string[]
}

export interface ProblemDetail {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
}
