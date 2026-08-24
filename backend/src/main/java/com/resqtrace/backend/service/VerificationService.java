package com.resqtrace.backend.service;

import com.resqtrace.backend.dto.MissingPersonResponse;
import com.resqtrace.backend.entity.*;
import com.resqtrace.backend.repository.DuplicateCandidateRepository;
import com.resqtrace.backend.repository.MissingPersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final MissingPersonRepository missingPersonRepository;
    private final DuplicateCandidateRepository duplicateCandidateRepository;
    private final AuditService auditService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final CaseService caseService; // For mapToResponse, wait, I can just copy mapToResponse or move it. Better to avoid circular dependency. Let's return the entity.

    @Transactional
    public MissingPerson verifyCase(Long id, User currentUser) {
        if (currentUser.getRole() == Role.CITIZEN) {
            throw new AccessDeniedException("Unauthorized");
        }
        
        MissingPerson mp = missingPersonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));
                
        if (mp.getStatus() == CaseStatus.REPORTED || mp.getStatus() == CaseStatus.UNDER_VERIFICATION) {
            mp.setStatus(CaseStatus.VERIFIED);
            auditService.logAction(mp.getId(), AuditAction.CASE_VERIFIED, currentUser, "Case manually verified.");
        
            messagingTemplate.convertAndSend("/topic/cases", "CASE_VERIFIED");
            messagingTemplate.convertAndSend("/topic/stats", "STATS_UPDATED");
            return missingPersonRepository.save(mp);
        } else {
            throw new IllegalStateException("Invalid status transition to VERIFIED from " + mp.getStatus());
        }
    }

    @Transactional
    public MissingPerson rejectCase(Long id, User currentUser) {
        if (currentUser.getRole() == Role.CITIZEN) {
            throw new AccessDeniedException("Unauthorized");
        }
        
        MissingPerson mp = missingPersonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));
                
        mp.setStatus(CaseStatus.CLOSED);
        missingPersonRepository.save(mp);
        auditService.logAction(mp.getId(), AuditAction.CASE_REJECTED, currentUser, "Case rejected (e.g. invalid report).");
        return mp;
    }

    @Transactional
    public DuplicateCandidate confirmDuplicate(Long candidateId, User currentUser) {
        if (currentUser.getRole() == Role.CITIZEN) {
            throw new AccessDeniedException("Unauthorized");
        }

        DuplicateCandidate candidate = duplicateCandidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        if (candidate.getStatus() != DuplicateStatus.PENDING) {
            throw new IllegalStateException("Candidate is not pending");
        }

        candidate.setStatus(DuplicateStatus.CONFIRMED);
        candidate.setReviewedBy(currentUser);
        candidate.setReviewedAt(LocalDateTime.now());
        duplicateCandidateRepository.save(candidate);

        // Merge logic
        MissingPerson mergedCase = candidate.getCandidateCase();
        MissingPerson primaryCase = candidate.getPrimaryCase();
        
        mergedCase.setStatus(CaseStatus.MERGED);
        mergedCase.setMergedInto(primaryCase);
        missingPersonRepository.save(mergedCase);

        auditService.logAction(mergedCase.getId(), AuditAction.CASES_MERGED, currentUser, 
                "Merged into case " + primaryCase.getCaseId());
        auditService.logAction(primaryCase.getId(), AuditAction.DUPLICATE_CONFIRMED, currentUser, 
                "Confirmed duplicate " + mergedCase.getCaseId() + " merged into this case.");

        return candidate;
    }

    @Transactional
    public DuplicateCandidate rejectDuplicate(Long candidateId, User currentUser) {
        if (currentUser.getRole() == Role.CITIZEN) {
            throw new AccessDeniedException("Unauthorized");
        }

        DuplicateCandidate candidate = duplicateCandidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        if (candidate.getStatus() != DuplicateStatus.PENDING) {
            throw new IllegalStateException("Candidate is not pending");
        }

        candidate.setStatus(DuplicateStatus.REJECTED);
        candidate.setReviewedBy(currentUser);
        candidate.setReviewedAt(LocalDateTime.now());
        duplicateCandidateRepository.save(candidate);

        auditService.logAction(candidate.getCandidateCase().getId(), AuditAction.DUPLICATE_REJECTED, currentUser, 
                "Rejected as duplicate of " + candidate.getPrimaryCase().getCaseId());
        
        return candidate;
    }
}
