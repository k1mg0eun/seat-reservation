# 좌석 예매 프론트엔드

React + Vite. 백엔드(Spring Boot)는 `../src` 에 있고, 이 앱은 API만 호출한다.

## 실행

```bash
npm install
npm run dev          # http://localhost:5173
```

`/api/*` 요청은 vite dev server가 `http://localhost:8080` 으로 프록시한다 (`vite.config.js`).

백엔드가 아직 없으면 목 데이터로 화면만 확인할 수 있다:

```bash
echo "VITE_USE_MOCK=true" > .env.local
npm run dev
```

## 프론트가 기대하는 API

| 메서드 | 경로 | 응답 |
| --- | --- | --- |
| GET | `/concerts/{concertId}/seats` | `Seat[]` |
| GET | `/reservations/active?userId=` | `ActiveReservation` \| `null` |
| POST | `/seats/{seatId}/hold?userId=` | `reservationId` (number) |
| POST | `/reservations/{id}/confirm?userId=` | 204 |
| POST | `/reservations/{id}/cancel?userId=` | 204 |

```ts
ActiveReservation = {
  id: number
  seatId: number
  seatNo: string
  expiresAt: string                           // ISO-8601
}

Seat = {
  id: number
  seatNo: string                              // "A-12"
  status: 'AVAILABLE' | 'HELD' | 'RESERVED'
  heldBy: number | null
  heldUntil: string | null                    // ISO-8601, 점유 만료 시각
}
```

- 점유 만료 시각은 **백엔드의 `heldUntil` 을 그대로 쓴다.** 프론트는 5분을 하드코딩하지 않고 카운트다운만 한다.
- `GET /reservations/active` 는 그 사용자가 **아직 확정하지 않은 점유**를 돌려준다(없으면 `null`).
  프론트는 마운트 시와 사용자 전환 시 이걸 호출해서 남은 점유 시간을 복구한다.
  이게 없으면 새로고침 한 번에 타이머가 사라지고, 사용자는 좌석을 다시 눌러야 한다.
- **1인 1점유**: 한 사용자는 동시에 한 좌석만 점유할 수 있다. 이미 점유 중인 좌석이 있으면
  `hold` 는 실패해야 한다. 확정(`RESERVED`)된 좌석은 점유로 세지 않으므로, 결제를 마치면
  바로 다음 좌석을 잡을 수 있다.
  프론트에서도 막고 있지만 **화면 가드일 뿐이다.** 동시 요청은 백엔드에서 막아야 한다
  (예: `Seat` 에 `heldBy` 조건을 건 유니크 제약, 또는 점유 전 사용자 단위 검사).
- 실패는 4xx/5xx + 본문에 메시지 문자열이면 그대로 화면에 표시된다.
- 좌석 목록은 3초마다 폴링해서 다른 사용자의 점유가 반영된다.

## 구조

```
src/
  App.jsx                  화면 상태 + 점유/확정/취소 흐름
  api/client.js            API 호출 (규격 정의)
  api/mock.js              백엔드 없이 돌리기 위한 인메모리 목
  components/SeatMap.jsx   좌석 그리드
  components/ReservationPanel.jsx  선택 좌석 + 카운트다운 + 액션
  hooks/useCountdown.js    만료까지 남은 시간
```
