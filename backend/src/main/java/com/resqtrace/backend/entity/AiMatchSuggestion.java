package com.resqtrace.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_match_suggestions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMatchSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_case_id", nullable = false)
    private MissingPerson primaryCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_case_id", nullable = false)
    private MissingPerson candidateCase;

    @Column(nullable = false)
    private Double similarityScore;

    @Column(nullable = false, length = 20)
    private String confidenceCategory;

    @Column(length = 50)
    private String thresholdConfig;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SuggestionStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
