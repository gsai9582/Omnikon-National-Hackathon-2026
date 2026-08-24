package com.resqtrace.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resqtrace.backend.entity.AiMatchSuggestion;
import com.resqtrace.backend.entity.MissingPerson;
import com.resqtrace.backend.entity.SuggestionStatus;
import com.resqtrace.backend.repository.AiMatchSuggestionRepository;
import com.resqtrace.backend.repository.MissingPersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiIntegrationService {

    private final MissingPersonRepository missingPersonRepository;
    private final AiMatchSuggestionRepository aiMatchSuggestionRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String AI_URL = "http://localhost:8000/ai";

    @Async
    @Transactional
    public void processNewCasePhoto(MissingPerson newCase, String photoPath) {
        if (photoPath == null || photoPath.isEmpty()) return;
        
        try {
            // Wait a moment for file to be flushed if necessary
            Thread.sleep(1000);
            
            // 1. Get embedding
            File file = new File(photoPath);
            if (!file.exists()) {
                System.out.println("AI Service: Photo file not found at " + photoPath);
                return;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(file));
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> embedResponse = restTemplate.postForEntity(AI_URL + "/face-embedding", requestEntity, Map.class);
            
            if (embedResponse.getStatusCode().is2xxSuccessful() && embedResponse.getBody() != null) {
                List<Double> embedding = (List<Double>) embedResponse.getBody().get("embedding");
                
                // Store embedding
                String embeddingJson = objectMapper.writeValueAsString(embedding);
                newCase.setFaceEmbedding(embeddingJson);
                missingPersonRepository.save(newCase);
                
                // 2. Find matches
                findMatchesForCase(newCase, embedding);
            }
        } catch (Exception e) {
            System.err.println("AI Processing Failed for case " + newCase.getId() + ": " + e.getMessage());
        }
    }
    
    private void findMatchesForCase(MissingPerson targetCase, List<Double> targetEmbedding) {
        try {
            List<MissingPerson> allCases = missingPersonRepository.findAll();
            List<Map<String, Object>> candidates = new ArrayList<>();
            
            for (MissingPerson c : allCases) {
                if (!c.getId().equals(targetCase.getId()) && c.getFaceEmbedding() != null) {
                    List<Double> emb = objectMapper.readValue(c.getFaceEmbedding(), new TypeReference<List<Double>>() {});
                    Map<String, Object> cand = new HashMap<>();
                    cand.put("case_id", c.getId().toString());
                    cand.put("embedding", emb);
                    candidates.add(cand);
                }
            }
            
            if (candidates.isEmpty()) return;
            
            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("target_embedding", targetEmbedding);
            reqBody.put("candidates", candidates);
            
            ResponseEntity<Map> matchResponse = restTemplate.postForEntity(AI_URL + "/find-matches", reqBody, Map.class);
            
            if (matchResponse.getStatusCode().is2xxSuccessful() && matchResponse.getBody() != null) {
                List<Map<String, Object>> matches = (List<Map<String, Object>>) matchResponse.getBody().get("matches");
                String thresholdConfig = (String) matchResponse.getBody().get("threshold_config");
                
                for (Map<String, Object> match : matches) {
                    Long candidateId = Long.parseLong((String) match.get("case_id"));
                    Double score = (Double) match.get("similarity_score");
                    String confidence = (String) match.get("confidence");
                    
                    MissingPerson candidateCase = missingPersonRepository.findById(candidateId).orElse(null);
                    
                    if (candidateCase != null && ("HIGH".equals(confidence) || "MEDIUM".equals(confidence))) {
                        AiMatchSuggestion suggestion = AiMatchSuggestion.builder()
                            .primaryCase(targetCase)
                            .candidateCase(candidateCase)
                            .similarityScore(score)
                            .confidenceCategory(confidence)
                            .thresholdConfig(thresholdConfig)
                            .status(SuggestionStatus.PENDING)
                            .build();
                            
                        aiMatchSuggestionRepository.save(suggestion);
                    }
                }
            }
            
        } catch (Exception e) {
            System.err.println("Failed to find matches: " + e.getMessage());
        }
    }
}
