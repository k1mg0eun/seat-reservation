import { mockApi } from './mock'

/**
 * 백엔드 API 규격 (Spring Boot, vite proxy 를 통해 /api → localhost:8080)
 *
 *  GET  /api/concerts/{concertId}/seats          -> Seat[]
 *  GET  /api/reservations/active?userId=         -> ActiveReservation | null
 *  POST /api/seats/{seatId}/hold?userId=         -> reservationId (number)
 *  POST /api/reservations/{id}/confirm?userId=   -> 204
 *  POST /api/reservations/{id}/cancel?userId=    -> 204
 *
 *  ActiveReservation = {
 *    id: number,
 *    seatId: number,
 *    seatNo: string,
 *    expiresAt: string                            // ISO-8601
 *  }
 *  진행 중인(HELD) 점유가 없으면 null. 새로고침이나 사용자 전환 후에도
 *  남은 점유 시간을 복구하기 위해 필요하다.
 *
 *  Seat = {
 *    id: number,
 *    seatNo: string,                              // "A-12"
 *    status: 'AVAILABLE' | 'HELD' | 'RESERVED',
 *    heldBy: number | null,
 *    heldUntil: string | null                     // ISO-8601, 점유 만료 시각
 *  }
 *
 * 백엔드가 아직 없으면 .env.local 에 VITE_USE_MOCK=true 를 넣고 목 데이터로 돌린다.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `요청 실패 (${res.status})`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

const realApi = {
  getSeats: (concertId) => request(`/concerts/${concertId}/seats`),
  getActiveReservation: (userId) => request(`/reservations/active?userId=${userId}`),
  hold: (seatId, userId) => request(`/seats/${seatId}/hold?userId=${userId}`, { method: 'POST' }),
  confirm: (reservationId, userId) =>
    request(`/reservations/${reservationId}/confirm?userId=${userId}`, { method: 'POST' }),
  cancel: (reservationId, userId) =>
    request(`/reservations/${reservationId}/cancel?userId=${userId}`, { method: 'POST' }),
}

export const api = USE_MOCK ? mockApi : realApi
