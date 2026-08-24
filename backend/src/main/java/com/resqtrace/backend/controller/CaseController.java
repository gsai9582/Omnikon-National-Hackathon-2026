package com.resqtrace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resqtrace.backend.dto.DashboardStatsDto;
import com.resqtrace.backend.dto.MissingPersonRequest;
import com.resqtrace.backend.dto.MissingPersonResponse;
import com.resqtrace.backend.entity.CaseStatus;
import com.resqtrace.backend.entity.User;
import com.resqtrace.backend.repository.UserRepository;
import com.resqtrace.backend.service.CaseService;
import com.resqtrace.backend.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<MissingPersonResponse> createCase(
            @RequestPart("caseData") String caseDataJson,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User currentUser = getCurrentUser(userDetails);
        MissingPersonRequest request = objectMapper.readValue(caseDataJson, MissingPersonRequest.class);
        
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (request.getGender() == null) {
            throw new IllegalArgumentException("Gender is required");
        }
        
        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            photoUrl = fileStorageService.storeFile(photo);
        }

        MissingPersonResponse response = caseService.createCase(request, photoUrl, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<MissingPersonResponse>> getCases(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) CaseStatus status,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = getCurrentUser(userDetails);
        return ResponseEntity.ok(caseService.getCases(name, status, pageable, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissingPersonResponse> getCaseById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        return ResponseEntity.ok(caseService.getCaseById(id, currentUser));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<MissingPersonResponse> updateCaseStatus(
            @PathVariable Long id,
            @RequestParam CaseStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getCurrentUser(userDetails);
        return ResponseEntity.ok(caseService.updateCaseStatus(id, status, currentUser));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(caseService.getDashboardStats());
    }
}
