package com.resqtrace.backend.service;

import com.resqtrace.backend.entity.AuditAction;
import com.resqtrace.backend.entity.AuditLog;
import com.resqtrace.backend.entity.User;
import com.resqtrace.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(Long caseId, AuditAction action, User performedBy, String details) {
        AuditLog log = new AuditLog();
        log.setCaseId(caseId);
        log.setAction(action);
        log.setPerformedBy(performedBy);
        log.setTimestamp(LocalDateTime.now());
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}
