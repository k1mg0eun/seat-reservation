package com.example.seatreservation.seat;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor

public class SeatController {
    private final SeatRepository seatRepository;

    @GetMapping("/concerts/{concertId}/seats")
    public List<Seat> seats(@PathVariable Long concertId){
        return seatRepository.findByConcertIdOrderBySeatNo(concertId);
    }
}
