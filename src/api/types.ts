// Typy generowane z ../backend/docs/openapi.json przez npm run generate:api
// Nie edytuj ręcznie. Rozjazd naprawiasz po stronie backendu, potem regenerujesz.
//
// Uwaga: springdoc generuje pola rekordów jako opcjonalne (brak `required` w schemach).
// Required<> poniżej odzwierciedla faktyczny kontrakt Javy (pola non-null wg typów).

import type { components } from './generated/schema'

// ── Listings ─────────────────────────────────────────────────────────────────

// ListingResponse: wszystkie pola non-null oprócz description (String bez @NotNull)
type _Listing = components['schemas']['ListingResponse']
export type ListingDto =
  Required<Omit<_Listing, 'description'>> &
  Pick<_Listing, 'description'>

export type ListingStatus        = components['schemas']['ListingStatus']
export type CreateListingRequest = components['schemas']['CreateListingRequest']

// ── Auctions ──────────────────────────────────────────────────────────────────

// AuctionResponse: Dutch-specific fields (decrementAmount, decrementCurrency, stepSeconds)
// są null dla aukcji angielskich — pozostałe pola zawsze obecne.
type _Auction = components['schemas']['AuctionResponse']
export type AuctionDto =
  Required<Omit<_Auction, 'decrementAmount' | 'decrementCurrency' | 'stepSeconds'>> &
  Pick<_Auction, 'decrementAmount' | 'decrementCurrency' | 'stepSeconds'>

export type AuctionType           = components['schemas']['AuctionType']
export type AuctionStatus         = components['schemas']['AuctionStatus']
export type CreateAuctionRequest  = components['schemas']['CreateAuctionRequest']

// ── Identity ──────────────────────────────────────────────────────────────────

// UserProfileResponse: createdAt nullable (MeController przekazuje null)
type _User = components['schemas']['UserProfileResponse']
export type UserDto =
  Required<Omit<_User, 'createdAt'>> &
  Pick<_User, 'createdAt'>

// ── Bids ──────────────────────────────────────────────────────────────────────

// BidResponse: wszystkie pola non-null w praktyce (springdoc generuje jako opcjonalne)
type _Bid = components['schemas']['BidResponse']
export type BidDto = Required<_Bid>

export type PlaceBidRequest    = components['schemas']['PlaceBidRequest']
export type SetProxyBidRequest = components['schemas']['SetProxyBidRequest']

// ── Errors ────────────────────────────────────────────────────────────────────

export type ProblemDetail = components['schemas']['ProblemDetail']
