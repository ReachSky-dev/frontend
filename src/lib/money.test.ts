import { describe, expect, it } from 'vitest'
import { formatMoney } from './money'

describe('formatMoney', () => {
  it('konwertuje grosze na złotówki', () => {
    // 1000 groszy = 10 zł
    expect(formatMoney(1000, 'PLN')).toMatch(/10[,.]00/)
  })

  it('obsługuje kwoty z groszami', () => {
    // 1099 groszy = 10,99 zł
    expect(formatMoney(1099, 'PLN')).toMatch(/10[,.]99/)
  })

  it('zawiera symbol waluty', () => {
    const result = formatMoney(500, 'PLN')
    expect(result).toMatch(/PLN|zł/)
  })

  it('obsługuje EUR', () => {
    const result = formatMoney(1500, 'EUR')
    expect(result).toMatch(/EUR|€/)
    expect(result).toMatch(/15[,.]00/)
  })

  it('zwraca 0,00 dla zerowej kwoty', () => {
    expect(formatMoney(0, 'PLN')).toMatch(/0[,.]00/)
  })
})
