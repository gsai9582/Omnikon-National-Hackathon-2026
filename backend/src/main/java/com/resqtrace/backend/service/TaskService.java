package com.resqtrace.backend.service;

import com.resqtrace.backend.dto.SearchTaskRequest;
import com.resqtrace.backend.dto.SearchTaskResponse;
import com.resqtrace.backend.entity.*;
import com.resqtrace.backend.repository.MissingPersonRepository;
import com.resqtrace.backend.repository.ResponderProfileRepository;
import com.resqtrace.backend.repository.SearchTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final SearchTaskRepository searchTaskRepository;
    private final MissingPersonRepository missingPersonRepository;
    private final ResponderProfileRepository responderProfileRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public SearchTaskResponse createTask(SearchTaskRequest request, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.AUTHORITY) {
            throw new AccessDeniedException("Only authorities can create search tasks.");
        }

        MissingPerson mp = missingPersonRepository.findById(request.getMissingPersonId())
                .orElseThrow(() -> new RuntimeException("Case not found"));

        ResponderProfile responder = null;
        if (request.getAssignedResponderId() != null) {
            responder = responderProfileRepository.findById(request.getAssignedResponderId())
                    .orElseThrow(() -> new RuntimeException("Responder not found"));
        }

        SearchTask task = new SearchTask();
        task.setTaskCode(generateTaskCode());
        task.setMissingPerson(mp);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setAssignedResponder(responder);
        task.setPriority(request.getPriority());
        task.setLatitude(request.getLatitude() != null ? request.getLatitude() : mp.getLatitude());
        task.setLongitude(request.getLongitude() != null ? request.getLongitude() : mp.getLongitude());
        task.setSearchRadius(request.getSearchRadius() != null ? request.getSearchRadius() : 2.0);
        task.setStatus(responder != null ? TaskStatus.ASSIGNED : TaskStatus.UNASSIGNED);

        task = searchTaskRepository.save(task);
        
        messagingTemplate.convertAndSend("/topic/tasks", "TASK_CREATED");
        messagingTemplate.convertAndSend("/topic/stats", "STATS_UPDATED");
        if (responder != null) {
            messagingTemplate.convertAndSendToUser(responder.getUser().getEmail(), "/queue/tasks", "NEW_TASK_ASSIGNED");
        }

        return mapToResponse(task);
    }

    private synchronized String generateTaskCode() {
        int currentYear = Year.now().getValue();
        String prefix = "TSK-" + currentYear + "-";
        Long maxSeq = searchTaskRepository.findMaxSequenceByPrefix(prefix);
        long nextSeq = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%04d", nextSeq);
    }

    @Transactional(readOnly = true)
    public List<SearchTaskResponse> getTasks(User currentUser) {
        if (currentUser.getRole() == Role.AUTHORITY || currentUser.getRole() == Role.ADMIN) {
            return searchTaskRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
        } else if (currentUser.getRole() == Role.RESPONDER) {
            ResponderProfile profile = responderProfileRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Responder profile not found"));
            return searchTaskRepository.findByAssignedResponderId(profile.getId()).stream()
                    .map(this::mapToResponse).collect(Collectors.toList());
        } else {
            throw new AccessDeniedException("Unauthorized to view tasks");
        }
    }

    @Transactional(readOnly = true)
    public SearchTaskResponse getTaskById(Long id, User currentUser) {
        SearchTask task = searchTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (currentUser.getRole() == Role.RESPONDER) {
            if (task.getAssignedResponder() == null || !task.getAssignedResponder().getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Unauthorized to view this task");
            }
        } else if (currentUser.getRole() != Role.AUTHORITY && currentUser.getRole() != Role.ADMIN) {
             throw new AccessDeniedException("Unauthorized to view tasks");
        }

        return mapToResponse(task);
    }

    @Transactional
    public SearchTaskResponse updateTaskStatus(Long id, TaskStatus newStatus, User currentUser) {
        SearchTask task = searchTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (currentUser.getRole() == Role.RESPONDER) {
            if (task.getAssignedResponder() == null || !task.getAssignedResponder().getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Unauthorized to update this task");
            }
            // Responders can only transition to IN_PROGRESS, COMPLETED
            if (newStatus != TaskStatus.IN_PROGRESS && newStatus != TaskStatus.COMPLETED) {
                 throw new IllegalArgumentException("Responders can only mark tasks as IN_PROGRESS or COMPLETED");
            }
        } else if (currentUser.getRole() != Role.AUTHORITY && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Unauthorized to update tasks");
        }

        task.setStatus(newStatus);
        task = searchTaskRepository.save(task);
        
        messagingTemplate.convertAndSend("/topic/tasks", "TASK_UPDATED");
        messagingTemplate.convertAndSend("/topic/stats", "STATS_UPDATED");
        if (task.getAssignedResponder() != null) {
            messagingTemplate.convertAndSendToUser(task.getAssignedResponder().getUser().getEmail(), "/queue/tasks", "TASK_UPDATED");
        }
        
        return mapToResponse(task);
    }

    public SearchTaskResponse mapToResponse(SearchTask task) {
        return SearchTaskResponse.builder()
                .id(task.getId())
                .taskCode(task.getTaskCode())
                .missingPersonId(task.getMissingPerson().getId())
                .missingPersonCaseId(task.getMissingPerson().getCaseId())
                .missingPersonName(task.getMissingPerson().getFullName())
                .title(task.getTitle())
                .description(task.getDescription())
                .assignedResponderId(task.getAssignedResponder() != null ? task.getAssignedResponder().getId() : null)
                .assignedResponderName(task.getAssignedResponder() != null ? task.getAssignedResponder().getUser().getName() : null)
                .priority(task.getPriority())
                .latitude(task.getLatitude())
                .longitude(task.getLongitude())
                .searchRadius(task.getSearchRadius())
                .status(task.getStatus())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
