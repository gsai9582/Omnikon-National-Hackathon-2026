package com.resqtrace.backend.dto;

import com.resqtrace.backend.entity.PriorityLevel;
import com.resqtrace.backend.entity.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SearchTaskResponse {
    private Long id;
    private String taskCode;
    private Long missingPersonId;
    private String missingPersonCaseId;
    private String missingPersonName;
    private String title;
    private String description;
    private Long assignedResponderId;
    private String assignedResponderName;
    private PriorityLevel priority;
    private Double latitude;
    private Double longitude;
    private Double searchRadius;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
