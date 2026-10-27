package com.klef.soa.docker.service;

import java.util.List;

import com.klef.soa.docker.dto.ApplianceRepairTicketRequest;
import com.klef.soa.docker.dto.ApplianceRepairTicketResponse;

public interface ApplianceRepairTicketService
{
    ApplianceRepairTicketResponse addTicket(
            ApplianceRepairTicketRequest request);

    List<ApplianceRepairTicketResponse> displayAllTickets();

    ApplianceRepairTicketResponse displayTicketById(Long id);

    ApplianceRepairTicketResponse updateTicketById(
            Long id,
            ApplianceRepairTicketRequest request);

    String deleteTicketById(Long id);
}