package com.example.seatreservation.reservation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService; // Repository 대신 Service 주입

    @PostMapping("/seats/{seatId}/hold")
    public Long holdSeat(@PathVariable Long seatId, @RequestParam Long userId) {
        return reservationService.hold(seatId, userId);
    }

    @PostMapping("/reservations/{reservationId}/confirm")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirm(@PathVariable Long reservationId, @RequestParam Long userId){
        reservationService.confirm(reservationId, userId);
    }
}