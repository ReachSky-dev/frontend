import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function LoggedOutPage() {
  const navigate = useNavigate()
  const [seconds, setSeconds] = useState(4)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(interval)
          navigate('/', { replace: true })
          return 0
        }
        return s - 1
      })
    }, 1_000)
    return () => clearInterval(interval)
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas">
      <p className="text-lg font-medium text-ink-1">Wylogowano pomyślnie</p>
      <p className="text-sm text-ink-3">
        Przekierowanie na stronę główną za {seconds} s…
      </p>
    </div>
  )
}
