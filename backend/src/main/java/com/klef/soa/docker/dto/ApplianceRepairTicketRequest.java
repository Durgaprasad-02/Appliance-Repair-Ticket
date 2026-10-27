package com.klef.soa.docker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplianceRepairTicketRequest {

    @NotBlank(message = "Appliance name is required")
    private String applianceName;

    @NotBlank(message = "Issue description is required")
    private String issueDescription;

    @NotNull(message = "Repair cost is required")
    @PositiveOrZero(message = "Repair cost cannot be negative")
    private Double repairCost;

    @NotNull(message = "Resolved status is required")
    private Boolean resolved;
}