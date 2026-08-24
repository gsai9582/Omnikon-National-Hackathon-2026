package com.resqtrace.backend.controller;

import com.resqtrace.backend.dto.MapMarkerDto;
import com.resqtrace.backend.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    @GetMapping("/map")
    public ResponseEntity<List<MapMarkerDto>> getMapData() {
        return ResponseEntity.ok(mapService.getActiveMapMarkers());
    }
}
