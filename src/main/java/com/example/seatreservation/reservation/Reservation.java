package com.example.seatreservation.reservation;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "reservation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)

public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long seatId;
    private Long userId;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;

    private Instant createdAt;
    private Instant expiresAt;

    public Reservation(Long seatId, Long userId, Instant createdAt, Instant expiresAt){
        this.seatId = seatId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.status = ReservationStatus.HELD;
    }


    public void confirm(Long userId, Instant now){
        if(!this.userId.equals(userId)){
            throw new IllegalStateException("본인의 예약이 아닙니다.");
        }
        if(this.status != ReservationStatus.HELD){
            throw new IllegalStateException("이미 확정되거나 취소된 예약입니다.");
        }
        if(this.expiresAt.isBefore(now)){
            throw new IllegalStateException("점유 시간이 만료되었습니다.");
        }
        this.status = ReservationStatus.CONFIRMED;
    }

    public void cancel(Long userId){
        if (!this.userId.equals(userId)){
            throw new IllegalStateException("본인의 예약이 아닙니다.");
        }
        if(this.status == ReservationStatus.CANCELED || this.status == ReservationStatus.EXPIRED){
            throw new IllegalStateException("이미 취소되거나 만료된 예약입니다.");
        }
        this.status = ReservationStatus.CANCELED;
    }
}
