package com.example.seatreservation.reservation;

import com.example.seatreservation.seat.Seat;
import com.example.seatreservation.seat.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final SeatRepository seatRepository;

    @Value("${reservation.hold-duration}")
    private Duration holdDuration;

    @Transactional
    public Long hold(Long seatId, Long userId){

        Seat seat = seatRepository.findById(seatId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 좌석입니다."));

        Instant now = Instant.now();
        seat.hold(userId, now, holdDuration);

        Reservation reservation = new Reservation(seatId, userId, now, now.plus(holdDuration));
        return reservationRepository.save(reservation).getId();

    }

    @Transactional
    public void confirm(Long reservationId, Long userId){
        // 예약 id로 예약을 읽는다. 없으면 예외.
        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        // 그 예약에게 "이 userId가 지금 확정한다"고 시킨다.
        Instant now = Instant.now();
        reservation.confirm(userId, now);

        // 예약에 적힌 seatId로 좌석을 읽는다.
        Seat seat = seatRepository.findById(reservation.getSeatId()).orElseThrow(() -> new IllegalStateException("예약에 연결된 좌석이 없습니다."));

        // 좌석에게 "확정됐다"고 시킨다.
        seat.confirm(userId);

    }

    @Transactional
    public void cancel(Long reservationId, Long userId){
        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));
        reservation.cancel(userId);

        Seat seat = seatRepository.findById(reservation.getSeatId()).orElseThrow(() -> new IllegalStateException("예약에 연결된 자석이 없습니다"));
        seat.release();
    }
}
