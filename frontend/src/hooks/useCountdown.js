import { useEffect, useState } from 'react'

/** 만료 시각(ISO)까지 남은 초를 1초마다 갱신한다. 없거나 지났으면 0. */
export function useCountdown(expiresAt) {
  const remaining = () => {
    if (!expiresAt) return 0
    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
  }

  const [seconds, setSeconds] = useState(remaining)

  useEffect(() => {
    setSeconds(remaining())
    if (!expiresAt) return

    const timer = setInterval(() => setSeconds(remaining()), 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  return seconds
}

export function formatSeconds(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}
