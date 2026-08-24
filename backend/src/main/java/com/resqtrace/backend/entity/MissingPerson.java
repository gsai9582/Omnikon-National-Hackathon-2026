package com.resqtrace.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "missing_persons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissingPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String caseId;

    @Column(unique = true, length = 100)
    private String idempotencyKey;

    @Column(nullable = false, length = 100)
    private String fullName;

    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime lastSeenDateTime;

    @Column(length = 255)
    private String lastSeenAddress;

    private Double latitude;
    private Double longitude;

    @Column(length = 500)
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CaseStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merged_into_id")
    private MissingPerson mergedInto;

    @Column(columnDefinition = "TEXT")
    private String faceEmbedding;

    @Column(nullable = false)
    @Builder.Default
    private Boolean needsMedicalAttention = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
