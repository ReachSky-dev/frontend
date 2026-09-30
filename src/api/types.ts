// Typy generowane z ../backend/docs/openapi.json przez npm run generate:api
// Nie edytuj ręcznie. Rozjazd naprawiasz po stronie backendu, potem regenerujesz.
//
// Uwaga: springdoc generuje wszystkie pola jako opcjonalne (brak `required` w schemacie).
// Required<> poniżej odzwierciedla faktyczny kontrakt Javy — pola rekordu są non-null
// zgodnie z ich typami (UUID, Instant, int, enum). Wyjątki opisane przy każdym typie.

import type { components } from './generated/schema'

// ListingResponse — wszystkie pola non-null oprócz description (String bez @NotNull)
type _Listing = components['schemas']['ListingResponse']
export type ListingDto =
  Required<Omit<_Listing, 'description'>> &
  Pick<_Listing, 'description'>

export type ListingStatus = components['schemas']['ListingStatus']

// CreateListingRequest — capacity opcjonalne w schemacie, ale @Min(1) w Javie = zawsze wysyłamy
export type CreateListingRequest = components['schemas']['CreateListingRequest']

// UserProfileResponse — createdAt nullable (MeController przekazuje null)
type _User = components['schemas']['UserProfileResponse']
export type UserDto =
  Required<Omit<_User, 'createdAt'>> &
  Pick<_User, 'createdAt'>

// ProblemDetail — używane tylko przez client.ts przez optional chaining (?.)
export type ProblemDetail = components['schemas']['ProblemDetail']
