package com.resqtrace.backend.dto;

import com.resqtrace.backend.entity.CaseStatus;
import com.resqtrace.backend.entity.Gender;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MissingPersonResponse {
    private Long id;
    private String caseId;
    private String fullName;
    private Integer age;
    private Gender gender;
    private String description;
    private LocalDateTime lastSeenDateTime;
    private String lastSeenAddress;
    private Double latitude;
    private Double longitude;
    private String photoUrl;
    private CaseStatus status;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Boolean needsMedicalAttention;
    private Double priorityScore;
    private String priorityCategory;
    private java.util.List<String> priorityExplanation;
}
