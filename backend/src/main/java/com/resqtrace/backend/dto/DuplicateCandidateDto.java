package com.resqtrace.backend.dto;

import com.resqtrace.backend.entity.DuplicateStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DuplicateCandidateDto {
    private Long id;
    private MissingPersonResponse primaryCase;
    private MissingPersonResponse candidateCase;
    private Double similarityScore;
    private String reason;
    private DuplicateStatus status;
    private LocalDateTime createdAt;
}
