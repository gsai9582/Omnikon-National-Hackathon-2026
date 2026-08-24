package com.resqtrace.backend.service;

import com.resqtrace.backend.entity.*;
import com.resqtrace.backend.repository.DuplicateCandidateRepository;
import com.resqtrace.backend.repository.MissingPersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SimilarityService {

    private final MissingPersonRepository missingPersonRepository;
    private final DuplicateCandidateRepository duplicateCandidateRepository;
    private final AuditService auditService;

    @Transactional
    public void checkForDuplicates(MissingPerson newCase, User currentUser) {
        // Prototype logic: Same name or (same age and same address)
        List<MissingPerson> allCases = missingPersonRepository.findAll();
        for (MissingPerson existing : allCases) {
            if (existing.getId().equals(newCase.getId())) {
                continue; // Skip self
            }
            if (existing.getStatus() == CaseStatus.MERGED) {
                continue; // Skip already merged
            }

            boolean isMatch = false;
            String reason = "";
            double score = 0.0;

            if (existing.getFullName().equalsIgnoreCase(newCase.getFullName())) {
                isMatch = true;
                reason = "Exact name match";
                score = 0.9;
            } else if (existing.getAge() != null && newCase.getAge() != null 
                    && Math.abs(existing.getAge() - newCase.getAge()) <= 2
                    && existing.getLastSeenAddress() != null 
                    && existing.getLastSeenAddress().equalsIgnoreCase(newCase.getLastSeenAddress())) {
                isMatch = true;
                reason = "Similar age and same last seen address";
                score = 0.75;
            }

            if (isMatch) {
                DuplicateCandidate candidate = new DuplicateCandidate();
                candidate.setPrimaryCase(existing);
                candidate.setCandidateCase(newCase);
                candidate.setSimilarityScore(score);
                candidate.setReason(reason);
                candidate.setStatus(DuplicateStatus.PENDING);
                duplicateCandidateRepository.save(candidate);

                auditService.logAction(existing.getId(), AuditAction.DUPLICATE_CANDIDATE_CREATED, currentUser, 
                        "Duplicate suggestion generated with Case " + newCase.getCaseId());
                auditService.logAction(newCase.getId(), AuditAction.DUPLICATE_CANDIDATE_CREATED, currentUser, 
                        "Flagged as possible duplicate of Case " + existing.getCaseId());
            }
        }
    }
}
