package com.resqtrace.backend.service;

import com.resqtrace.backend.config.PriorityConfig;
import com.resqtrace.backend.entity.MissingPerson;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

class PriorityScoringServiceTest {

    private PriorityScoringService priorityScoringService;
    private PriorityConfig config;

    @BeforeEach
    void setUp() {
        config = new PriorityConfig();
        // Use defaults: high=80, med=40, child=30 (<=12), elderly=20 (>=65), medical=40, hours=1 (max 48)
        priorityScoringService = new PriorityScoringService(config);
    }

    @Test
    void testLowPriority_HealthyAdult_JustMissing() {
        MissingPerson person = new MissingPerson();
        person.setAge(30);
        person.setNeedsMedicalAttention(false);
        person.setLastSeenDateTime(LocalDateTime.now().minusHours(5));

        var result = priorityScoringService.calculatePriority(person);

        assertEquals(5.0, result.score());
        assertEquals("LOW", result.category());
        assertTrue(result.explanation().get(0).contains("Missing for 5 hours"));
    }

    @Test
    void testHighPriority_ChildWithMedicalNeeds() {
        MissingPerson person = new MissingPerson();
        person.setAge(8); // +30
        person.setNeedsMedicalAttention(true); // +40
        person.setLastSeenDateTime(LocalDateTime.now().minusHours(15)); // +15

        var result = priorityScoringService.calculatePriority(person);

        assertEquals(85.0, result.score());
        assertEquals("HIGH", result.category());
        assertEquals(3, result.explanation().size());
    }

    @Test
    void testMediumPriority_Elderly_MissingLongTime() {
        MissingPerson person = new MissingPerson();
        person.setAge(70); // +20
        person.setNeedsMedicalAttention(false);
        person.setLastSeenDateTime(LocalDateTime.now().minusHours(50)); // +48 (capped)

        var result = priorityScoringService.calculatePriority(person);

        assertEquals(68.0, result.score());
        assertEquals("MEDIUM", result.category());
    }
}
