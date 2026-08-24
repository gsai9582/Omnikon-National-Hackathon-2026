package com.resqtrace.backend.dto;

import com.resqtrace.backend.entity.CaseStatus;
import com.resqtrace.backend.entity.PriorityLevel;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MapMarkerDto {
    private Long id;
    private String caseId;
    private String shortName; // Abbreviated or masked name
    private Integer age;
    private String gender;
    private CaseStatus status;
    private Double latitude;
    private Double longitude;
    private Double radiusKm;
    private PriorityLevel priorityLevel;
}
