package com.resqtrace.backend.repository;

import com.resqtrace.backend.entity.ResponderAvailability;
import com.resqtrace.backend.entity.ResponderProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResponderProfileRepository extends JpaRepository<ResponderProfile, Long> {
    Optional<ResponderProfile> findByUserId(Long userId);
    List<ResponderProfile> findByAvailability(ResponderAvailability availability);
    long countByAvailability(ResponderAvailability availability);
}
