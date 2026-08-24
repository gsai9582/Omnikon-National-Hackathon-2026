package com.resqtrace.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDto {
    private long totalCases;
    private long reported;
    private long underVerification;
    private long searching;
    private long found;
    private long closed;
    
    // Phase E Fields
    private long availableResponders;
    private long activeTasks;
    private long completedTasks;
}
