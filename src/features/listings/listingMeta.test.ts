import { describe, expect, it } from 'vitest'
import { listingStatusLabel, listingStatusShape, listingStatusBadgeVariant } from './listingMeta'
import type { ListingStatus } from '../../api/types'

const ALL_STATUSES: ListingStatus[] = ['DRAFT', 'ACTIVE', 'CLOSED']

describe('listingStatusLabel', () => {
  it('każdy status ma etykietę', () => {
    for (const s of ALL_STATUSES) {
      expect(listingStatusLabel[s]).toBeTruthy()
    }
  })
})

describe('listingStatusShape', () => {
  it('każdy status ma kształt', () => {
    for (const s of ALL_STATUSES) {
      expect(listingStatusShape[s]).toBeTruthy()
    }
  })

  it('ACTIVE → pending (nie live)', () => {
    expect(listingStatusShape.ACTIVE).toBe('pending')
  })

  it('DRAFT → draft', () => {
    expect(listingStatusShape.DRAFT).toBe('draft')
  })

  it('CLOSED → done-ok', () => {
    expect(listingStatusShape.CLOSED).toBe('done-ok')
  })
})

describe('listingStatusBadgeVariant', () => {
  it('każdy status ma wariant', () => {
    for (const s of ALL_STATUSES) {
      expect(listingStatusBadgeVariant[s]).toBeTruthy()
    }
  })

  it('ACTIVE → success', () => {
    expect(listingStatusBadgeVariant.ACTIVE).toBe('success')
  })
})
