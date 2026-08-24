package com.resqtrace.backend.repository;

import com.resqtrace.backend.entity.AiMatchSuggestion;
import com.resqtrace.backend.entity.SuggestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiMatchSuggestionRepository extends JpaRepository<AiMatchSuggestion, Long> {
    List<AiMatchSuggestion> findByStatus(SuggestionStatus status);
}
