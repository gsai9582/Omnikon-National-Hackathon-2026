package com.resqtrace.backend.dto;

import com.resqtrace.backend.entity.ResponderAvailability;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponderProfileDto {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private ResponderAvailability availability;
    private Double latitude;
    private Double longitude;
}
