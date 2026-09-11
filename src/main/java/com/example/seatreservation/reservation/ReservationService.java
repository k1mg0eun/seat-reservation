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
}
