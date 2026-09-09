import { useCallback, useEffect, useState } from 'react'
import { api } from './api/client'
import SeatMap from './components/SeatMap'
import ReservationPanel from './components/ReservationPanel'

const CONCERT_ID = 1
const POLL_MS = 3000

export default function App() {
  const [userId, setUserId] = useState(1)
  const [seats, setSeats] = useState([])
  const [reservation, setReservation] = useState(null)
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  const loadSeats = useCallback(async () => {
    try {
      const next = await api.getSeats(CONCERT_ID)
      setSeats(next)
      return next
    } catch (e) {
      setMessage({ type: 'error', text: `좌석을 불러오지 못했습니다: ${e.message}` })
      return []
    }
  }, [])

  // 다른 사용자의 점유/확정이 화면에 반영되도록 주기적으로 새로고침한다.
  useEffect(() => {
    loadSeats()
    const timer = setInterval(loadSeats, POLL_MS)
    return () => clearInterval(timer)
  }, [loadSeats])

  // 점유의 원본은 서버다. 사용자를 바꾸거나 새로고침해도
  // 그 사용자가 진행 중인 점유를 서버에서 다시 읽어와 남은 시간을 이어서 보여준다.
  useEffect(() => {
    let cancelled = false
    setReservation(null)

    api
      .getActiveReservation(userId)
      .then((active) => {
        if (cancelled || !active) return
        setReservation({ ...active, userId })
      })
      .catch((e) => {
        if (!cancelled) {
          setMessage({ type: 'error', text: `예약 정보를 불러오지 못했습니다: ${e.message}` })
        }
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  // 내 점유가 만료되거나 남이 가져갔으면 패널을 정리한다.
  useEffect(() => {
    if (!reservation?.expiresAt) return
    if (reservation.userId !== userId) return
    const seat = seats.find((s) => s.id === reservation.seatId)
    if (!seat || seat.status === 'RESERVED') return

    if (seat.status !== 'HELD' || seat.heldBy !== userId) {
      setReservation(null)
      setMessage({ type: 'error', text: '점유가 해제되었습니다.' })
    } else if (seat.heldUntil !== reservation.expiresAt) {
      setReservation((prev) => ({ ...prev, expiresAt: seat.heldUntil }))
    }
  }, [seats, reservation, userId])

  // 좌석 목록을 먼저 갱신한 뒤 예약 상태를 바꾼다.
  // 순서가 바뀌면 위 정리 이펙트가 낡은 좌석 정보로 실행돼 방금 잡은 점유를 지워버린다.
  async function run(action) {
    if (busy) return
    setBusy(true)
    setMessage(null)
    try {
      await action()
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
      await loadSeats()
    } finally {
      setBusy(false)
    }
  }

  // 점유 만료 전까지는 다른 좌석을 잡을 수 없다 (1인 1점유).
  const activeHold =
    reservation && (!reservation.expiresAt || new Date(reservation.expiresAt) > new Date())
      ? reservation
      : null

  function handleSelect(seat) {
    if (activeHold) {
      if (activeHold.seatId === seat.id) return
      setMessage({
        type: 'error',
        text: `이미 ${activeHold.seatNo} 좌석을 점유 중입니다. 결제하거나 취소한 뒤 선택하세요.`,
      })
      return
    }

    return run(async () => {
      const reservationId = await api.hold(seat.id, userId)
      const next = await loadSeats()
      const held = next.find((s) => s.id === seat.id)
      setReservation({
        id: reservationId,
        userId,
        seatId: seat.id,
        seatNo: seat.seatNo,
        expiresAt: held?.heldUntil ?? null,
      })
    })
  }

  function handleConfirm() {
    const { id, seatNo } = reservation
    return run(async () => {
      await api.confirm(id, userId)
      setReservation(null)
      await loadSeats()
      setMessage({ type: 'info', text: `${seatNo} 예매가 확정되었습니다.` })
    })
  }

  function handleCancel() {
    const { id } = reservation
    return run(async () => {
      await api.cancel(id, userId)
      setReservation(null)
      await loadSeats()
      setMessage({ type: 'info', text: '점유를 취소했습니다.' })
    })
  }

  return (
    <div className="app">
      <header>
        <h1>좌석 예매</h1>
        <label className="user-picker">
          사용자
          <select value={userId} onChange={(e) => setUserId(Number(e.target.value))}>
            {[1, 2, 3].map((id) => (
              <option key={id} value={id}>user {id}</option>
            ))}
          </select>
        </label>
      </header>

      {message && <div className={`message message--${message.type}`}>{message.text}</div>}

      <main>
        <SeatMap
          seats={seats}
          userId={userId}
          selectedSeatId={reservation?.seatId}
          hasActiveHold={Boolean(activeHold)}
          onSelect={handleSelect}
        />
        <ReservationPanel
          reservation={reservation}
          busy={busy}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </main>
    </div>
  )
}
