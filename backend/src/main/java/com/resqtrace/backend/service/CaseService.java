package com.resqtrace.backend.service;

import com.resqtrace.backend.dto.DashboardStatsDto;
import com.resqtrace.backend.dto.MissingPersonRequest;
import com.resqtrace.backend.dto.MissingPersonResponse;
import com.resqtrace.backend.entity.CaseStatus;
import com.resqtrace.backend.entity.MissingPerson;
import com.resqtrace.backend.entity.Role;
import com.resqtrace.backend.entity.User;
import com.resqtrace.backend.repository.MissingPersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final MissingPersonRepository missingPersonRepository;
    private final AuditService auditService;
    private final SimilarityService similarityService;
    private final com.resqtrace.backend.repository.SearchZoneRepository searchZoneRepository;
    private final com.resqtrace.backend.repository.ResponderProfileRepository responderProfileRepository;
    private final com.resqtrace.backend.repository.SearchTaskRepository searchTaskRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final AiIntegrationService aiIntegrationService;
    private final FileStorageService fileStorageService;
    private final PriorityScoringService priorityScoringService;

    @Transactional
    public MissingPersonResponse createCase(MissingPersonRequest request, String photoUrl, User currentUser) {
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isEmpty()) {
            java.util.Optional<MissingPerson> existing = missingPersonRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                return mapToResponse(existing.get());
            }
        }

        String caseId = generateCaseId();

        MissingPerson missingPerson = MissingPerson.builder()
                .caseId(caseId)
                .idempotencyKey(request.getIdempotencyKey())
                .fullName(request.getFullName())
                .age(request.getAge())
                .gender(request.getGender())
                .description(request.getDescription())
                .lastSeenDateTime(request.getLastSeenDateTime())
                .lastSeenAddress(request.getLastSeenAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .photoUrl(photoUrl)
                .status(CaseStatus.REPORTED)
                .createdBy(currentUser)
                .needsMedicalAttention(request.getNeedsMedicalAttention() != null ? request.getNeedsMedicalAttention() : false)
                .build();

        missingPerson = missingPersonRepository.save(missingPerson);
        
        com.resqtrace.backend.entity.SearchZone zone = new com.resqtrace.backend.entity.SearchZone();
        zone.setMissingPerson(missingPerson);
        zone.setLatitude(missingPerson.getLatitude());
        zone.setLongitude(missingPerson.getLongitude());
        zone.setPriorityLevel(com.resqtrace.backend.entity.PriorityLevel.HIGH);
        zone.setRadiusKm(2.0); // Prototype default
        searchZoneRepository.save(zone);

        auditService.logAction(missingPerson.getId(), com.resqtrace.backend.entity.AuditAction.CASE_CREATED, currentUser, "Case reported initially.");
        
        similarityService.checkForDuplicates(missingPerson, currentUser);

        // Notify clients
        messagingTemplate.convertAndSend("/topic/cases", "CASE_CREATED");
        messagingTemplate.convertAndSend("/topic/stats", "STATS_UPDATED");
        
        return mapToResponse(missingPerson);
    }

    private synchronized String generateCaseId() {
        int currentYear = Year.now().getValue();
        String prefix = "RQT-" + currentYear + "-";
        
        Long maxSeq = missingPersonRepository.findMaxSequenceByPrefix(prefix);
        long nextSeq = (maxSeq != null ? maxSeq : 0) + 1;
        
        return prefix + String.format("%05d", nextSeq);
    }

    @Transactional(readOnly = true)
    public Page<MissingPersonResponse> getCases(String name, CaseStatus status, Pageable pageable, User currentUser) {
        Page<MissingPerson> cases;
        
        if (currentUser.getRole() == Role.CITIZEN) {
            cases = missingPersonRepository.findByCreatedById(currentUser.getId(), pageable);
        } else {
            if (name != null && !name.isEmpty()) {
                cases = missingPersonRepository.findByFullNameContainingIgnoreCase(name, pageable);
            } else if (status != null) {
                cases = missingPersonRepository.findByStatus(status, pageable);
            } else {
                cases = missingPersonRepository.findAll(pageable);
            }
        }
        
        return cases.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public MissingPersonResponse getCaseById(Long id, User currentUser) {
        MissingPerson mp = missingPersonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));
                
        if (currentUser.getRole() == Role.CITIZEN && !mp.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to view this case.");
        }
        
        return mapToResponse(mp);
    }

    @Transactional
    public MissingPersonResponse updateCaseStatus(Long id, CaseStatus newStatus, User currentUser) {
        if (currentUser.getRole() == Role.CITIZEN) {
            throw new AccessDeniedException("Citizens cannot change case statuses.");
        }
        
        MissingPerson mp = missingPersonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found"));
                
        mp.setStatus(newStatus);
        mp = missingPersonRepository.save(mp);
        
        messagingTemplate.convertAndSend("/topic/cases", "CASE_UPDATED");
        messagingTemplate.convertAndSend("/topic/stats", "STATS_UPDATED");
        
        return mapToResponse(mp);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        return DashboardStatsDto.builder()
                .totalCases(missingPersonRepository.countTotalCases())
                .reported(missingPersonRepository.countByStatus(CaseStatus.REPORTED))
                .underVerification(missingPersonRepository.countByStatus(CaseStatus.UNDER_VERIFICATION))
                .searching(missingPersonRepository.countByStatus(CaseStatus.SEARCHING))
                .found(missingPersonRepository.countByStatus(CaseStatus.FOUND))
                .closed(missingPersonRepository.countByStatus(CaseStatus.CLOSED))
                .availableResponders(responderProfileRepository.countByAvailability(com.resqtrace.backend.entity.ResponderAvailability.AVAILABLE))
                .activeTasks(searchTaskRepository.countActiveTasks())
                .completedTasks(searchTaskRepository.countByStatus(com.resqtrace.backend.entity.TaskStatus.COMPLETED))
                .build();
    }

    public MissingPersonResponse mapToResponse(MissingPerson mp) {
        PriorityScoringService.PriorityResult priority = priorityScoringService.calculatePriority(mp);
        return MissingPersonResponse.builder()
                .id(mp.getId())
                .caseId(mp.getCaseId())
                .fullName(mp.getFullName())
                .age(mp.getAge())
                .gender(mp.getGender())
                .description(mp.getDescription())
                .lastSeenDateTime(mp.getLastSeenDateTime())
                .lastSeenAddress(mp.getLastSeenAddress())
                .latitude(mp.getLatitude())
                .longitude(mp.getLongitude())
                .photoUrl(mp.getPhotoUrl())
                .status(mp.getStatus())
                .createdById(mp.getCreatedBy().getId())
                .createdByName(mp.getCreatedBy().getName())
                .createdAt(mp.getCreatedAt())
                .updatedAt(mp.getUpdatedAt())
                .needsMedicalAttention(mp.getNeedsMedicalAttention())
                .priorityScore(priority.score())
                .priorityCategory(priority.category())
                .priorityExplanation(priority.explanation())
                .build();
    }
}
