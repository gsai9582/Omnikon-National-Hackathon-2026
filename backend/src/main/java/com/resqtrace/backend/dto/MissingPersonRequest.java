package com.resqtrace.backend.dto;

import com.resqtrace.backend.entity.CaseStatus;
import com.resqtrace.backend.entity.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MissingPersonRequest {

    private String idempotencyKey;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private Integer age;

    @NotNull(message = "Gender is required")
    private Gender gender;

    private String description;

    private LocalDateTime lastSeenDateTime;

    private String lastSeenAddress;

    private Double latitude;
    private Double longitude;
    
    private Boolean needsMedicalAttention;
}
