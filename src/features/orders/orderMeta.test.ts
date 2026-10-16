import { describe, expect, it } from 'vitest'
import { orderStatusLabel, orderStatusShape } from './orderMeta'
import type { OrderStatus } from '../../api/types'

const ALL_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'EXPIRED', 'CANCELLED',
]

describe('orderStatusLabel', () => {
  it('każdy status ma etykietę', () => {
    for (const s of ALL_STATUSES) {
      expect(orderStatusLabel[s]).toBeTruthy()
    }
  })

  it('PENDING_PAYMENT ma etykietę', () => {
    expect(orderStatusLabel.PENDING_PAYMENT).toBeTruthy()
  })
})

describe('orderStatusShape', () => {
  it('każdy status ma kształt', () => {
    for (const s of ALL_STATUSES) {
      expect(orderStatusShape[s]).toBeTruthy()
    }
  })

  it('PENDING_PAYMENT → pending', () => {
    expect(orderStatusShape.PENDING_PAYMENT).toBe('pending')
  })

  it('CONFIRMED → done-ok', () => {
    expect(orderStatusShape.CONFIRMED).toBe('done-ok')
  })

  it('EXPIRED → done-err', () => {
    expect(orderStatusShape.EXPIRED).toBe('done-err')
  })

  it('PAID → live', () => {
    expect(orderStatusShape.PAID).toBe('live')
  })
})
