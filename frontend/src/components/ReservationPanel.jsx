import { useCountdown, formatSeconds } from '../hooks/useCountdown'

export default function ReservationPanel({ reservation, busy, onConfirm, onCancel }) {
  const seconds = useCountdown(reservation?.expiresAt)

  if (!reservation) {
    return (
      <aside className="panel panel--empty">
        좌석을 선택하면 <strong>5분간 임시 점유</strong>됩니다.
        <br />그 안에 결제를 마쳐야 예매가 확정됩니다.
      </aside>
    )
  }

  const expired = seconds === 0

  return (
    <aside className="panel">
      <h2>{reservation.seatNo}</h2>
      <p className="reservation-id">예약번호 #{reservation.id}</p>

      <div className={`timer ${expired ? 'timer--expired' : ''}`}>
        {expired ? '점유 만료' : formatSeconds(seconds)}
      </div>

      <button className="btn btn--primary" disabled={busy || expired} onClick={onConfirm}>
        결제하고 예매 확정
      </button>
      <button className="btn" disabled={busy} onClick={onCancel}>
        점유 취소
      </button>
    </aside>
  )
}
