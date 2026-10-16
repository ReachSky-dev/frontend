import { describe, expect, it } from 'vitest'
import {
  auctionStatusLabel,
  auctionStatusShape,
  auctionStatusBadgeVariant,
  auctionTypeLabel,
} from './auctionMeta'
import type { AuctionStatus } from '../../api/types'

const ALL_STATUSES: AuctionStatus[] = [
  'DRAFT', 'SCHEDULED', 'RUNNING', 'SOLD', 'RESERVE_NOT_MET', 'CANCELLED', 'SETTLED',
]

describe('auctionStatusLabel', () => {
  it('każdy status ma etykietę', () => {
    for (const s of ALL_STATUSES) {
      expect(auctionStatusLabel[s]).toBeTruthy()
    }
  })

  it('RUNNING = "Trwa"', () => {
    expect(auctionStatusLabel.RUNNING).toBe('Trwa')
  })

  it('RESERVE_NOT_MET ma etykietę', () => {
    expect(auctionStatusLabel.RESERVE_NOT_MET).toBeTruthy()
  })
})

describe('auctionStatusShape', () => {
  it('każdy status ma kształt', () => {
    for (const s of ALL_STATUSES) {
      expect(auctionStatusShape[s]).toBeTruthy()
    }
  })

  it('RUNNING → live', () => {
    expect(auctionStatusShape.RUNNING).toBe('live')
  })

  it('CANCELLED → done-err', () => {
    expect(auctionStatusShape.CANCELLED).toBe('done-err')
  })

  it('SOLD → done-ok', () => {
    expect(auctionStatusShape.SOLD).toBe('done-ok')
  })

  it('DRAFT → draft', () => {
    expect(auctionStatusShape.DRAFT).toBe('draft')
  })
})

describe('auctionStatusBadgeVariant', () => {
  it('każdy status ma wariant', () => {
    for (const s of ALL_STATUSES) {
      expect(auctionStatusBadgeVariant[s]).toBeTruthy()
    }
  })

  it('RUNNING → success', () => {
    expect(auctionStatusBadgeVariant.RUNNING).toBe('success')
  })

  it('RESERVE_NOT_MET → error', () => {
    expect(auctionStatusBadgeVariant.RESERVE_NOT_MET).toBe('error')
  })
})

describe('auctionTypeLabel', () => {
  it('ENGLISH i DUTCH mają etykiety', () => {
    expect(auctionTypeLabel.ENGLISH).toBeTruthy()
    expect(auctionTypeLabel.DUTCH).toBeTruthy()
  })
})
