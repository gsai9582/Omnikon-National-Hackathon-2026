package com.resqtrace.backend.service;

import com.resqtrace.backend.dto.MapMarkerDto;
import com.resqtrace.backend.entity.CaseStatus;
import com.resqtrace.backend.entity.MissingPerson;
import com.resqtrace.backend.entity.SearchZone;
import com.resqtrace.backend.repository.MissingPersonRepository;
import com.resqtrace.backend.repository.SearchZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MapService {

    private final MissingPersonRepository missingPersonRepository;
    private final SearchZoneRepository searchZoneRepository;

    @Transactional(readOnly = true)
    public List<MapMarkerDto> getActiveMapMarkers() {
        // Fetch all cases that are NOT closed or merged
        List<MissingPerson> cases = missingPersonRepository.findAll().stream()
                .filter(mp -> mp.getStatus() != CaseStatus.CLOSED && mp.getStatus() != CaseStatus.MERGED)
                .collect(Collectors.toList());

        return cases.stream().map(mp -> {
            Optional<SearchZone> zoneOpt = searchZoneRepository.findByMissingPersonId(mp.getId());
            
            // Mask the name: e.g. "John Doe" -> "J. Doe" or just first name
            String[] nameParts = mp.getFullName().split(" ");
            String shortName = nameParts[0];
            if (nameParts.length > 1) {
                shortName += " " + nameParts[1].charAt(0) + ".";
            }

            return MapMarkerDto.builder()
                    .id(mp.getId())
                    .caseId(mp.getCaseId())
                    .shortName(shortName)
                    .age(mp.getAge())
                    .gender(mp.getGender() != null ? mp.getGender().name() : "UNKNOWN")
                    .status(mp.getStatus())
                    .latitude(mp.getLatitude())
                    .longitude(mp.getLongitude())
                    .radiusKm(zoneOpt.map(SearchZone::getRadiusKm).orElse(0.0))
                    .priorityLevel(zoneOpt.map(SearchZone::getPriorityLevel).orElse(null))
                    .build();
        }).collect(Collectors.toList());
    }
}
