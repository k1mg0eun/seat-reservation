package com.example.seatreservation.seat;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "seat")
@Getter
@NoArgsConstructor

public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long concertId;
    private String seatNo;

    @Enumerated(EnumType.STRING)
    private SeatStatus status;

    private Long heldBy;
    private Instant heldUntil;

    @Version
    private Long version;

    public Seat(Long concertId, String seatNo){
        this.concertId = concertId;
        this.seatNo = seatNo;
        status = SeatStatus.AVAILABLE;
    }
}
