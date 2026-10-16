import { describe, expect, it } from 'vitest'
import { formatDateTime } from './datetime'

describe('formatDateTime', () => {
  it('zwraca niepusty string dla daty ISO', () => {
    const result = formatDateTime('2024-06-15T12:00:00Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('zawiera rok w wyniku', () => {
    expect(formatDateTime('2024-06-15T12:00:00Z')).toContain('2024')
  })

  it('nie rzuca dla daty w przeszłości', () => {
    expect(() => formatDateTime('2020-01-01T00:00:00Z')).not.toThrow()
  })

  it('nie rzuca dla daty w przyszłości', () => {
    expect(() => formatDateTime('2030-12-31T23:59:59Z')).not.toThrow()
  })

  it('zawiera rok 2030 dla daty w przyszłości', () => {
    expect(formatDateTime('2030-03-01T08:00:00Z')).toContain('2030')
  })
})
