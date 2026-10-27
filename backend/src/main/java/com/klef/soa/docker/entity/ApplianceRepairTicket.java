package com.klef.soa.docker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "appliance_repair_ticket")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplianceRepairTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String applianceName;

    @Column(nullable = false)
    private String issueDescription;

    @Column(nullable = false)
    private Double repairCost;

    @Column(nullable = false)
    private Boolean resolved;
}