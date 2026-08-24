package com.resqtrace.backend.service;

import com.resqtrace.backend.config.PriorityConfig;
import com.resqtrace.backend.entity.MissingPerson;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PriorityScoringService {

    private final PriorityConfig config;

    public PriorityResult calculatePriority(MissingPerson person) {
        double score = 0.0;
        List<String> explanation = new ArrayList<>();

        if (person.getAge() != null) {
            if (person.getAge() <= config.getAgeChildLimit()) {
                score += config.getWeightAgeChild();
                explanation.add(String.format("Vulnerable age (<= %d): +%.1f", config.getAgeChildLimit(), config.getWeightAgeChild()));
            } else if (person.getAge() >= config.getAgeElderlyLimit()) {
                score += config.getWeightAgeElderly();
                explanation.add(String.format("Vulnerable age (>= %d): +%.1f", config.getAgeElderlyLimit(), config.getWeightAgeElderly()));
            }
        }

        if (Boolean.TRUE.equals(person.getNeedsMedicalAttention())) {
            score += config.getWeightMedical();
            explanation.add(String.format("Needs medical attention: +%.1f", config.getWeightMedical()));
        }

        if (person.getLastSeenDateTime() != null) {
            long hoursMissing = Math.max(0, Duration.between(person.getLastSeenDateTime(), LocalDateTime.now()).toHours());
            long countedHours = Math.min(hoursMissing, config.getMaxHoursCounted());
            if (countedHours > 0) {
                double timeScore = countedHours * config.getWeightHoursMissing();
                score += timeScore;
                explanation.add(String.format("Missing for %d hours (capped at %d): +%.1f", hoursMissing, config.getMaxHoursCounted(), timeScore));
            }
        }

        String category;
        if (score >= config.getThresholdHigh()) {
            category = "HIGH";
        } else if (score >= config.getThresholdMedium()) {
            category = "MEDIUM";
        } else {
            category = "LOW";
        }

        return new PriorityResult(score, category, explanation);
    }

    public record PriorityResult(double score, String category, List<String> explanation) {}
}
