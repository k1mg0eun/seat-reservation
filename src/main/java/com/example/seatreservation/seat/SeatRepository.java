package com.example.seatreservation.seat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByConcertIdOrderBySeatNo(Long concertId);
}
