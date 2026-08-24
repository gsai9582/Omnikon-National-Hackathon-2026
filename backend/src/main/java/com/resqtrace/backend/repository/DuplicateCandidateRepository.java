package com.resqtrace.backend.repository;

import com.resqtrace.backend.entity.DuplicateCandidate;
import com.resqtrace.backend.entity.DuplicateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DuplicateCandidateRepository extends JpaRepository<DuplicateCandidate, Long> {
    List<DuplicateCandidate> findByStatus(DuplicateStatus status);
}
