package com.resqtrace.backend.dto;

import com.resqtrace.backend.entity.SuggestionStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiMatchResponse {
    private Long id;
    private Long primaryCaseId;
    private String primaryCaseCode;
    private Long candidateCaseId;
    private String candidateCaseCode;
    private Double similarityScore;
    private String confidenceCategory;
    private String thresholdConfig;
    private SuggestionStatus status;
}
