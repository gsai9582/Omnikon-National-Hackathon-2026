package com.resqtrace.backend.repository;

import com.resqtrace.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByCaseIdOrderByTimestampDesc(Long caseId);
}
