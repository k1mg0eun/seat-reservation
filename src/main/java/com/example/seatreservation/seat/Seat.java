package com.example.seatreservation.seat;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.Instant;

import static com.example.seatreservation.seat.SeatStatus.RESERVED;

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

    public void hold(Long userId, Instant now, Duration holdDuration){
        if (status == RESERVED){
            throw new IllegalStateException("이미 예약된 좌석입니다");
        }
        if (status == SeatStatus.HELD && heldUntil.isAfter(now)){
            throw new IllegalStateException("예약 불가능한 좌석입니다.");
        }
        heldBy = userId;
        heldUntil = now.plus(holdDuration);
        this.status = SeatStatus.HELD;
    }

    public void confirm(Long userId){
        if(status != SeatStatus.HELD){
            throw new IllegalStateException("점유 중인 좌석이 아닙니다.");
        }
        if(!heldBy.equals(userId)){
            throw new IllegalStateException("다른 사용자가 점유 중인 좌석입니다.");
        }
        status = SeatStatus.RESERVED;
        heldUntil = null;
    }

    public void release(){
        this.status = SeatStatus.AVAILABLE;
        this.heldBy = null;
        this.heldUntil = null;
    }
}
