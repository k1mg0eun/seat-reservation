package com.example.seatreservation;

import com.example.seatreservation.seat.Seat;
import com.example.seatreservation.seat.SeatRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class SeatReservationApplication {

	public static void main(String[] args) {
		SpringApplication.run(SeatReservationApplication.class, args);
	}

	@Bean
    CommandLineRunner seedSeats(SeatRepository seatRepository){
		return args -> {
			if(seatRepository.count() > 0){
				return;
			}
            List<Seat> seatList = new ArrayList<>();
			for (char row = 'A'; row <= 'E'; row++){
				for (int num = 1; num <= 8; num++){
					seatList.add(new Seat(1L, row + "-" + num));
				}
			}
			seatRepository.saveAll(seatList);
		};
	}

}
