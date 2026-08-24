package com.resqtrace.backend.controller;

import com.resqtrace.backend.dto.DuplicateCandidateDto;
import com.resqtrace.backend.dto.MissingPersonResponse;
import com.resqtrace.backend.entity.DuplicateCandidate;
import com.resqtrace.backend.entity.DuplicateStatus;
import com.resqtrace.backend.entity.MissingPerson;
import com.resqtrace.backend.entity.User;
import com.resqtrace.backend.repository.DuplicateCandidateRepository;
import com.resqtrace.backend.repository.UserRepository;
import com.resqtrace.backend.service.CaseService;
import com.resqtrace.backend.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;
    private final CaseService caseService;
    private final DuplicateCandidateRepository duplicateCandidateRepository;
    private final UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/cases/{id}/verify")
    public ResponseEntity<MissingPersonResponse> verifyCase(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        MissingPerson mp = verificationService.verifyCase(id, currentUser);
        return ResponseEntity.ok(caseService.mapToResponse(mp));
    }

    @PostMapping("/cases/{id}/reject")
    public ResponseEntity<MissingPersonResponse> rejectCase(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        MissingPerson mp = verificationService.rejectCase(id, currentUser);
        return ResponseEntity.ok(caseService.mapToResponse(mp));
    }

    @GetMapping("/duplicates")
    public ResponseEntity<List<DuplicateCandidateDto>> getPendingDuplicates(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        List<DuplicateCandidate> candidates = duplicateCandidateRepository.findByStatus(DuplicateStatus.PENDING);
        List<DuplicateCandidateDto> dtos = candidates.stream().map(c -> DuplicateCandidateDto.builder()
                .id(c.getId())
                .primaryCase(caseService.mapToResponse(c.getPrimaryCase()))
                .candidateCase(caseService.mapToResponse(c.getCandidateCase()))
                .similarityScore(c.getSimilarityScore())
                .reason(c.getReason())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .build()).collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/duplicates/{id}/confirm")
    public ResponseEntity<DuplicateCandidateDto> confirmDuplicate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        DuplicateCandidate c = verificationService.confirmDuplicate(id, currentUser);
        
        DuplicateCandidateDto dto = DuplicateCandidateDto.builder()
                .id(c.getId())
                .primaryCase(caseService.mapToResponse(c.getPrimaryCase()))
                .candidateCase(caseService.mapToResponse(c.getCandidateCase()))
                .similarityScore(c.getSimilarityScore())
                .reason(c.getReason())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .build();
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/duplicates/{id}/reject")
    public ResponseEntity<DuplicateCandidateDto> rejectDuplicate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        DuplicateCandidate c = verificationService.rejectDuplicate(id, currentUser);
        
        DuplicateCandidateDto dto = DuplicateCandidateDto.builder()
                .id(c.getId())
                .primaryCase(caseService.mapToResponse(c.getPrimaryCase()))
                .candidateCase(caseService.mapToResponse(c.getCandidateCase()))
                .similarityScore(c.getSimilarityScore())
                .reason(c.getReason())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .build();
        return ResponseEntity.ok(dto);
    }
}
