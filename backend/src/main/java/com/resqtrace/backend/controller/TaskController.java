package com.resqtrace.backend.controller;

import com.resqtrace.backend.dto.SearchTaskRequest;
import com.resqtrace.backend.dto.SearchTaskResponse;
import com.resqtrace.backend.entity.TaskStatus;
import com.resqtrace.backend.entity.User;
import com.resqtrace.backend.repository.UserRepository;
import com.resqtrace.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<SearchTaskResponse> createTask(
            @Valid @RequestBody SearchTaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.createTask(request, getCurrentUser(userDetails)));
    }

    @GetMapping
    public ResponseEntity<List<SearchTaskResponse>> getTasks(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.getTasks(getCurrentUser(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SearchTaskResponse> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.getTaskById(id, getCurrentUser(userDetails)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SearchTaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status, getCurrentUser(userDetails)));
    }
}
