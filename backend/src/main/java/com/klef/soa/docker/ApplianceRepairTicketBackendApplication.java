package com.klef.soa.docker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApplianceRepairTicketBackendApplication {

	public static void main(String[] args) {
	SpringApplication.run(ApplianceRepairTicketBackendApplication.class, args);
	System.out.println("Appliance repair ticket Service is running");
	}

}
