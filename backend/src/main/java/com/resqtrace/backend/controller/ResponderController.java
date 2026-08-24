package com.resqtrace.backend.controller;

import com.resqtrace.backend.dto.ResponderProfileDto;
import com.resqtrace.backend.entity.ResponderAvailability;
import com.resqtrace.backend.entity.User;
import com.resqtrace.backend.repository.UserRepository;
import com.resqtrace.backend.service.ResponderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responders")
@RequiredArgsConstructor
public class ResponderController {

    private final ResponderService responderService;
    private final UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<ResponderProfileDto>> getAllResponders(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(responderService.getAllResponders(getCurrentUser(userDetails)));
    }
    
    @GetMapping("/me")
    public ResponseEntity<ResponderProfileDto> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(responderService.getMyProfile(getCurrentUser(userDetails)));
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<ResponderProfileDto> updateAvailability(
            @PathVariable Long id,
            @RequestParam ResponderAvailability availability,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(responderService.updateAvailability(id, availability, getCurrentUser(userDetails)));
    }
}
