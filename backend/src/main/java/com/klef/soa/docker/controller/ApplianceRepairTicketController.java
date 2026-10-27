package com.klef.soa.docker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.klef.soa.docker.dto.ApplianceRepairTicketRequest;
import com.klef.soa.docker.dto.ApplianceRepairTicketResponse;
import com.klef.soa.docker.service.ApplianceRepairTicketService;

@RestController
@RequestMapping("/appliancerepair")
@CrossOrigin("*")
public class ApplianceRepairTicketController {

    @Autowired
    private ApplianceRepairTicketService service;

    @PostMapping("/add")
    public ApplianceRepairTicketResponse addTicket(
            @RequestBody ApplianceRepairTicketRequest request) {
        return service.addTicket(request);
    }

    @GetMapping("/displayall")
    public List<ApplianceRepairTicketResponse> displayAllTickets() {
        return service.displayAllTickets();
    }

    @GetMapping("/displaybyid/{id}")
    public ApplianceRepairTicketResponse displayTicketById(
            @PathVariable Long id) {
        return service.displayTicketById(id);
    }

    @PutMapping("/updatebyid/{id}")
    public ApplianceRepairTicketResponse updateTicketById(
            @PathVariable Long id,
            @RequestBody ApplianceRepairTicketRequest request) {
        return service.updateTicketById(id, request);
    }

    @DeleteMapping("/deletebyid/{id}")
    public String deleteTicketById(
            @PathVariable Long id) {
        return service.deleteTicketById(id);
    }
}