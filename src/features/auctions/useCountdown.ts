import { useEffect, useState } from 'react'

/**
 * Odliczanie czasu do podanej daty.
 * Służy wyłącznie wyświetleniu pozostałego czasu — nigdy do
 * wnioskowania o statusie aukcji (status pochodzi z serwera).
 */
export function useCountdown(endsAt: string) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(endsAt).getTime() - Date.now()),
  )

  useEffect(() => {
    setRemaining(Math.max(0, new Date(endsAt).getTime() - Date.now()))

    const id = setInterval(() => {
      const ms = Math.max(0, new Date(endsAt).getTime() - Date.now())
      setRemaining(ms)
      if (ms === 0) clearInterval(id)
    }, 1_000)

    return () => clearInterval(id)
  }, [endsAt])

  const h = Math.floor(remaining / 3_600_000)
  const m = Math.floor((remaining % 3_600_000) / 60_000)
  const s = Math.floor((remaining % 60_000) / 1_000)
  return { h, m, s, remaining }
}
