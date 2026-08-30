package com.resqtrace.backend.repository;

import com.resqtrace.backend.entity.CaseStatus;
import com.resqtrace.backend.entity.MissingPerson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MissingPersonRepository extends JpaRepository<MissingPerson, Long> {
    
    Optional<MissingPerson> findByCaseId(String caseId);
    
    Page<MissingPerson> findByCreatedById(Long createdById, Pageable pageable);
    
    Page<MissingPerson> findByStatus(CaseStatus status, Pageable pageable);
    
    Page<MissingPerson> findByFullNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT COUNT(m) FROM MissingPerson m")
    long countTotalCases();

    @Query("SELECT COUNT(m) FROM MissingPerson m WHERE m.status = :status")
    long countByStatus(@Param("status") CaseStatus status);

    @Query(value = "SELECT MAX(CAST(SUBSTRING(case_id, 10) AS INTEGER)) FROM missing_persons WHERE case_id LIKE ?", nativeQuery = true)
    Long findMaxSequenceByPrefix(@Param("prefix") String prefix);

    Optional<MissingPerson> findByIdempotencyKey(String idempotencyKey);
}
