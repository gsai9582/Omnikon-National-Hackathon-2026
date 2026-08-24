package com.resqtrace.backend.repository;

import com.resqtrace.backend.entity.SearchZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SearchZoneRepository extends JpaRepository<SearchZone, Long> {
    Optional<SearchZone> findByMissingPersonId(Long missingPersonId);
}
