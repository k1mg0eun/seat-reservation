/** 백엔드 없이 화면을 돌려보기 위한 인메모리 목 구현. 실제 로직은 백엔드에 있다. */
const HOLD_MS = 5 * 60 * 1000
const ROWS = ['A', 'B', 'C', 'D', 'E']
const COLS = 8

let seq = 1
const seats = ROWS.flatMap((row, r) =>
  Array.from({ length: COLS }, (_, c) => ({
    id: r * COLS + c + 1,
    seatNo: `${row}-${c + 1}`,
    status: 'AVAILABLE',
    heldBy: null,
    heldUntil: null,
  })),
)
const reservations = new Map()

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

function expireStaleHolds() {
  const now = Date.now()
  for (const seat of seats) {
    if (seat.status === 'HELD' && new Date(seat.heldUntil).getTime() < now) {
      seat.status = 'AVAILABLE'
      seat.heldBy = null
      seat.heldUntil = null
      dropReservationsFor(seat.id)
    }
  }
}

function dropReservationsFor(seatId) {
  for (const [id, reservation] of reservations) {
    if (reservation.seatId === seatId) reservations.delete(id)
  }
}

function findSeat(seatId) {
  const seat = seats.find((s) => s.id === seatId)
  if (!seat) throw new Error('좌석이 없습니다')
  return seat
}

export const mockApi = {
  async getSeats() {
    await delay()
    expireStaleHolds()
    return seats.map((seat) => ({ ...seat }))
  },

  async getActiveReservation(userId) {
    await delay()
    expireStaleHolds()

    const seat = seats.find((s) => s.status === 'HELD' && s.heldBy === userId)
    if (!seat) return null

    for (const [id, reservation] of reservations) {
      if (reservation.seatId === seat.id && reservation.userId === userId) {
        return { id, seatId: seat.id, seatNo: seat.seatNo, expiresAt: seat.heldUntil }
      }
    }
    return null
  },

  async hold(seatId, userId) {
    await delay()
    expireStaleHolds()
    const seat = findSeat(seatId)

    if (seat.status === 'RESERVED') throw new Error('이미 예매된 좌석입니다.')
    if (seat.status === 'HELD' && seat.heldBy !== userId) {
      throw new Error('다른 사용자가 점유 중인 좌석입니다.')
    }

    // 1인 1점유: 결제 전에 여러 좌석을 잡아두는 것을 막는다.
    // 확정(RESERVED)된 좌석은 세지 않으므로, 결제를 마치면 다음 좌석을 잡을 수 있다.
    const heldElsewhere = seats.find(
      (s) => s.status === 'HELD' && s.heldBy === userId && s.id !== seatId,
    )
    if (heldElsewhere) {
      throw new Error(`이미 ${heldElsewhere.seatNo} 좌석을 점유 중입니다. 결제하거나 취소한 뒤 선택하세요.`)
    }

    seat.status = 'HELD'
    seat.heldBy = userId
    seat.heldUntil = new Date(Date.now() + HOLD_MS).toISOString()

    dropReservationsFor(seatId)
    const reservationId = seq++
    reservations.set(reservationId, { seatId, userId })
    return reservationId
  },

  async confirm(reservationId, userId) {
    await delay()
    expireStaleHolds()
    const reservation = reservations.get(reservationId)
    if (!reservation) throw new Error('예약이 없습니다')

    const seat = findSeat(reservation.seatId)
    if (seat.status !== 'HELD' || seat.heldBy !== userId) {
      throw new Error('점유 시간이 만료되었습니다.')
    }

    seat.status = 'RESERVED'
    seat.heldUntil = null
    return null
  },

  async cancel(reservationId, userId) {
    await delay()
    const reservation = reservations.get(reservationId)
    if (!reservation) throw new Error('예약이 없습니다')
    if (reservation.userId !== userId) throw new Error('본인의 예약이 아닙니다.')

    const seat = findSeat(reservation.seatId)
    seat.status = 'AVAILABLE'
    seat.heldBy = null
    seat.heldUntil = null
    reservations.delete(reservationId)
    return null
  },
}
