package com.klef.soa.docker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplianceRepairTicketResponse {

    private Long id;
    private String applianceName;
    private String issueDescription;
    private Double repairCost;
    private Boolean resolved;
}