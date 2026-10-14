import { describe, expect, it } from 'vitest'
import { parseBidAmount } from './bidValidation'

describe('parseBidAmount', () => {
  it('konwertuje złotówki na grosze', () => {
    expect(parseBidAmount('10')).toBe(1000)
    expect(parseBidAmount('10.99')).toBe(1099)
    expect(parseBidAmount('0.01')).toBe(1)
  })

  it('zwraca null dla pustego stringa', () => {
    expect(parseBidAmount('')).toBeNull()
  })

  it('zwraca null dla wartości nieujemnych lub zerowych', () => {
    expect(parseBidAmount('0')).toBeNull()
    expect(parseBidAmount('-1')).toBeNull()
    expect(parseBidAmount('-0.50')).toBeNull()
  })

  it('zwraca null dla wartości niedziesiętnych', () => {
    // parseFloat('abc') = NaN, parseFloat('') = NaN
    // Przeglądarka z <input type="number"> i tak zwróci '' dla '1abc'
    expect(parseBidAmount('abc')).toBeNull()
    expect(parseBidAmount('NaN')).toBeNull()
  })

  it('poprawnie zaokrągla wartości', () => {
    // 10.999 zł → Math.round(1099.9) = 1100
    expect(parseBidAmount('10.999')).toBe(1100)
  })
})
