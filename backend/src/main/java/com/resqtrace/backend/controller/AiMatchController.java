package com.resqtrace.backend.controller;

import com.resqtrace.backend.dto.AiMatchResponse;
import com.resqtrace.backend.entity.AiMatchSuggestion;
import com.resqtrace.backend.entity.SuggestionStatus;
import com.resqtrace.backend.repository.AiMatchSuggestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai-matches")
@RequiredArgsConstructor
public class AiMatchController {

    private final AiMatchSuggestionRepository aiMatchSuggestionRepository;

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN')")
    public ResponseEntity<List<AiMatchResponse>> getPendingMatches() {
        List<AiMatchResponse> pending = aiMatchSuggestionRepository.findByStatus(SuggestionStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN')")
    public ResponseEntity<AiMatchResponse> acceptMatch(@PathVariable Long id) {
        AiMatchSuggestion suggestion = aiMatchSuggestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Suggestion not found"));
        
        suggestion.setStatus(SuggestionStatus.ACCEPTED);
        // Accepting forwards it to verification, but doesn't automatically merge identities per rules.
        aiMatchSuggestionRepository.save(suggestion);
        
        return ResponseEntity.ok(mapToResponse(suggestion));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'ADMIN')")
    public ResponseEntity<AiMatchResponse> rejectMatch(@PathVariable Long id) {
        AiMatchSuggestion suggestion = aiMatchSuggestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Suggestion not found"));
        
        suggestion.setStatus(SuggestionStatus.REJECTED);
        aiMatchSuggestionRepository.save(suggestion);
        
        return ResponseEntity.ok(mapToResponse(suggestion));
    }

    private AiMatchResponse mapToResponse(AiMatchSuggestion s) {
        return AiMatchResponse.builder()
                .id(s.getId())
                .primaryCaseId(s.getPrimaryCase().getId())
                .primaryCaseCode(s.getPrimaryCase().getCaseId())
                .candidateCaseId(s.getCandidateCase().getId())
                .candidateCaseCode(s.getCandidateCase().getCaseId())
                .similarityScore(s.getSimilarityScore())
                .confidenceCategory(s.getConfidenceCategory())
                .thresholdConfig(s.getThresholdConfig())
                .status(s.getStatus())
                .build();
    }
}
