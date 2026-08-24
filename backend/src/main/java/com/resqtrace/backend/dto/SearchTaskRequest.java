package com.resqtrace.backend.dto;

import com.resqtrace.backend.entity.PriorityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SearchTaskRequest {
    @NotNull(message = "Case ID is required")
    private Long missingPersonId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    private Long assignedResponderId;
    
    @NotNull(message = "Priority is required")
    private PriorityLevel priority;
    
    private Double latitude;
    private Double longitude;
    private Double searchRadius;
}
