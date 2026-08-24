package com.resqtrace.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "resqtrace.priority")
public class PriorityConfig {
    private double thresholdHigh = 80.0;
    private double thresholdMedium = 40.0;
    
    private double weightAgeChild = 30.0;
    private int ageChildLimit = 12;
    
    private double weightAgeElderly = 20.0;
    private int ageElderlyLimit = 65;
    
    private double weightMedical = 40.0;
    private double weightHoursMissing = 1.0;
    private int maxHoursCounted = 48;
}
