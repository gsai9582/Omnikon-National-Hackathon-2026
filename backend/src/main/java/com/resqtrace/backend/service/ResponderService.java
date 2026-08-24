package com.resqtrace.backend.service;

import com.resqtrace.backend.dto.ResponderProfileDto;
import com.resqtrace.backend.entity.ResponderAvailability;
import com.resqtrace.backend.entity.ResponderProfile;
import com.resqtrace.backend.entity.Role;
import com.resqtrace.backend.entity.User;
import com.resqtrace.backend.repository.ResponderProfileRepository;
import com.resqtrace.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResponderService {

    private final ResponderProfileRepository responderProfileRepository;
    private final UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ResponderProfile getOrCreateProfile(User user) {
        if (user.getRole() != Role.RESPONDER) {
            throw new IllegalArgumentException("User is not a responder");
        }
        return responderProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    ResponderProfile profile = new ResponderProfile();
                    profile.setUser(user);
                    profile.setAvailability(ResponderAvailability.OFFLINE);
                    return responderProfileRepository.save(profile);
                });
    }

    @Transactional(readOnly = true)
    public List<ResponderProfileDto> getAllResponders(User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.AUTHORITY) {
            throw new AccessDeniedException("Unauthorized");
        }
        return responderProfileRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResponderProfileDto updateAvailability(Long id, ResponderAvailability availability, User currentUser) {
        ResponderProfile profile = responderProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        // Only the responder themselves, or an ADMIN/AUTHORITY can change this
        if (currentUser.getRole() == Role.RESPONDER && !profile.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only update your own availability");
        }
        if (currentUser.getRole() == Role.CITIZEN || currentUser.getRole() == Role.CAMP || currentUser.getRole() == Role.HOSPITAL) {
            throw new AccessDeniedException("Unauthorized");
        }

        profile.setAvailability(availability);
        profile = responderProfileRepository.save(profile);
        
        messagingTemplate.convertAndSend("/topic/responders", "RESPONDER_AVAILABILITY_CHANGED");
        messagingTemplate.convertAndSend("/topic/stats", "STATS_UPDATED");
        
        return mapToDto(profile);
    }
    
    @Transactional
    public ResponderProfileDto getMyProfile(User currentUser) {
        return mapToDto(getOrCreateProfile(currentUser));
    }

    public ResponderProfileDto mapToDto(ResponderProfile profile) {
        return ResponderProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .name(profile.getUser().getName())
                .email(profile.getUser().getEmail())
                .availability(profile.getAvailability())
                .latitude(profile.getLatitude())
                .longitude(profile.getLongitude())
                .build();
    }
}
