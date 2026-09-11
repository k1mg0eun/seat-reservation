package com.example.seatreservation.reservation;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService; // Repository 대신 Service 주입

    @PostMapping("/seats/{seatId}/hold")
    public Long holdSeat(
            @PathVariable Long seatId,
            @RequestParam Long userId,
            Instant duration
    ) {
        return reservationService.hold(seatId, userId);
    }
}