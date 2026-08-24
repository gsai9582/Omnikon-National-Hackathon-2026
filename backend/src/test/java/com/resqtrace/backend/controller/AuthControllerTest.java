package com.resqtrace.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resqtrace.backend.dto.LoginRequest;
import com.resqtrace.backend.dto.RegisterRequest;
import com.resqtrace.backend.entity.Role;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @Order(1)
    void testRegisterUser() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "John Doe",
                "john.doe@example.com",
                "password123",
                Role.CITIZEN
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.role").value("CITIZEN"));
    }

    @Test
    @Order(2)
    void testLoginUser() throws Exception {
        LoginRequest loginRequest = new LoginRequest(
                "john.doe@example.com",
                "password123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.role").value("CITIZEN"));
    }

    @Test
    @Order(3)
    void testGetMeWithoutAuth() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/me"))
                .andReturn();

        int statusCode = result.getResponse().getStatus();
        // Spring Security returns 403 by default for unauthenticated requests
        // when no AuthenticationEntryPoint is configured. Both 401 and 403 are acceptable.
        assertTrue(statusCode == 401 || statusCode == 403,
                "Expected 401 or 403 but got " + statusCode);
    }

    @Test
    @Order(4)
    void testGetMeWithValidToken() throws Exception {
        // First login to get a token
        LoginRequest loginRequest = new LoginRequest(
                "john.doe@example.com",
                "password123"
        );

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("token").asText();

        // Use the token to access /me
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.role").value("CITIZEN"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @Order(5)
    void testGetMeWithInvalidToken() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer invalid.token.here"))
                .andReturn();

        int statusCode = result.getResponse().getStatus();
        assertTrue(statusCode == 401 || statusCode == 403,
                "Expected 401 or 403 but got " + statusCode);
    }
}
