const STATUS_LABEL = {
  AVAILABLE: '예매 가능',
  HELD: '점유 중',
  RESERVED: '예매 완료',
}

export default function SeatMap({ seats, userId, selectedSeatId, hasActiveHold, onSelect }) {
  const rows = seats.reduce((acc, seat) => {
    const row = seat.seatNo.split('-')[0]
    ;(acc[row] ??= []).push(seat)
    return acc
  }, {})

  return (
    <div className="seat-map">
      <div className="stage">S T A G E</div>

      {Object.entries(rows).map(([row, rowSeats]) => (
        <div key={row} className="seat-row">
          <span className="row-label">{row}</span>
          {rowSeats.map((seat) => {
            const mine = seat.status === 'HELD' && seat.heldBy === userId
            const takenByOthers = seat.status === 'RESERVED' || (seat.status === 'HELD' && !mine)
            // 이미 점유 중인 좌석이 있으면 다른 좌석은 고를 수 없다 (1인 1점유).
            const disabled = takenByOthers || (hasActiveHold && !mine)

            return (
              <button
                key={seat.id}
                type="button"
                className={[
                  'seat',
                  `seat--${seat.status.toLowerCase()}`,
                  mine ? 'seat--mine' : '',
                  seat.id === selectedSeatId ? 'seat--selected' : '',
                ].join(' ')}
                disabled={disabled}
                title={
                  hasActiveHold && !mine && !takenByOthers
                    ? `${seat.seatNo} · 점유 중인 좌석을 먼저 처리하세요`
                    : `${seat.seatNo} · ${STATUS_LABEL[seat.status]}`
                }
                onClick={() => onSelect(seat)}
              >
                {seat.seatNo.split('-')[1]}
              </button>
            )
          })}
        </div>
      ))}

      <div className="legend">
        <span><i className="swatch swatch--available" />예매 가능</span>
        <span><i className="swatch swatch--held" />점유 중</span>
        <span><i className="swatch swatch--mine" />내 점유</span>
        <span><i className="swatch swatch--reserved" />예매 완료</span>
      </div>
    </div>
  )
}
