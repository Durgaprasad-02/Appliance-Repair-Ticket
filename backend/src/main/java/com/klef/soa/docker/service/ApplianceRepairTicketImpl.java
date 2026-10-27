package com.klef.soa.docker.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.klef.soa.docker.dto.ApplianceRepairTicketRequest;
import com.klef.soa.docker.dto.ApplianceRepairTicketResponse;
import com.klef.soa.docker.entity.ApplianceRepairTicket;
import com.klef.soa.docker.repository.ApplianceRepairTicketRepository;
import com.klef.soa.docker.service.ApplianceRepairTicketService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplianceRepairTicketImpl implements ApplianceRepairTicketService
{
    private final ApplianceRepairTicketRepository repo;

    @Override
    public ApplianceRepairTicketResponse addTicket(
            ApplianceRepairTicketRequest request)
    {
        ApplianceRepairTicket ticket =
                ApplianceRepairTicket.builder()
                .applianceName(request.getApplianceName())
                .issueDescription(request.getIssueDescription())
                .repairCost(request.getRepairCost())
                .resolved(request.getResolved())
                .build();

        return mapToResponse(repo.save(ticket));
    }

    @Override
    public List<ApplianceRepairTicketResponse> displayAllTickets()
    {
        return repo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ApplianceRepairTicketResponse displayTicketById(Long id)
    {
        return repo.findById(id)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    public ApplianceRepairTicketResponse updateTicketById(
            Long id,
            ApplianceRepairTicketRequest request)
    {
        ApplianceRepairTicket ticket =
                repo.findById(id).orElse(null);

        if(ticket == null)
        {
            return null;
        }

        ticket.setApplianceName(request.getApplianceName());
        ticket.setIssueDescription(request.getIssueDescription());
        ticket.setRepairCost(request.getRepairCost());
        ticket.setResolved(request.getResolved());

        return mapToResponse(repo.save(ticket));
    }

    @Override
    public String deleteTicketById(Long id)
    {
        ApplianceRepairTicket ticket =
                repo.findById(id).orElse(null);

        if(ticket == null)
        {
            return "Ticket not found with id : " + id;
        }

        repo.delete(ticket);

        return "Ticket deleted successfully with id : " + id;
    }

    private ApplianceRepairTicketResponse mapToResponse(
            ApplianceRepairTicket ticket)
    {
        return new ApplianceRepairTicketResponse(
                ticket.getId(),
                ticket.getApplianceName(),
                ticket.getIssueDescription(),
                ticket.getRepairCost(),
                ticket.getResolved()
        );
    }
}