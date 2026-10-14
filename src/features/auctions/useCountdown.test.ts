import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('oblicza h/m/s z pozostałego czasu', () => {
    // Aukcja kończy się za 1h 2m 3s od teraz
    const ms = (1 * 3_600 + 2 * 60 + 3) * 1_000
    const endsAt = new Date(Date.now() + ms).toISOString()

    const { result } = renderHook(() => useCountdown(endsAt))

    expect(result.current.h).toBe(1)
    expect(result.current.m).toBe(2)
    expect(result.current.s).toBe(3)
  })

  it('zwraca 0 gdy aukcja już się zakończyła', () => {
    const endsAt = new Date(Date.now() - 5_000).toISOString()

    const { result } = renderHook(() => useCountdown(endsAt))

    expect(result.current.remaining).toBe(0)
    expect(result.current.h).toBe(0)
    expect(result.current.m).toBe(0)
    expect(result.current.s).toBe(0)
  })

  it('odlicza co sekundę', () => {
    const endsAt = new Date(Date.now() + 5_000).toISOString()

    const { result } = renderHook(() => useCountdown(endsAt))
    expect(result.current.s).toBe(5)

    act(() => { vi.advanceTimersByTime(1_000) })
    expect(result.current.s).toBe(4)

    act(() => { vi.advanceTimersByTime(2_000) })
    expect(result.current.s).toBe(2)
  })

  it('zatrzymuje się na 0 po zakończeniu', () => {
    const endsAt = new Date(Date.now() + 2_000).toISOString()

    const { result } = renderHook(() => useCountdown(endsAt))

    act(() => { vi.advanceTimersByTime(10_000) })
    expect(result.current.remaining).toBe(0)
  })
})
