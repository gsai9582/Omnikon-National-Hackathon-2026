const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:8080/api';

async function runTests() {
    console.log('--- Starting Phase C E2E Tests ---');

    let authorityToken = '';
    let citizenToken = '';
    let originalCaseId = null;
    let duplicateCaseId = null;

    try {
        const citizenRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Citizen C',
            email: `citizen_c_${Date.now()}@example.com`,
            password: 'password123',
            role: 'CITIZEN'
        });
        citizenToken = citizenRes.data.token;
        console.log('✅ CITIZEN Registered.');

        const authRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Authority C',
            email: `authority_c_${Date.now()}@example.com`,
            password: 'password123',
            role: 'AUTHORITY'
        });
        authorityToken = authRes.data.token;
        console.log('✅ AUTHORITY Registered.');
    } catch (e) {
        console.error('❌ Setup failed:', e.message);
        return;
    }

    // 1. Submit first case
    try {
        const formData = new FormData();
        formData.append('caseData', JSON.stringify({
            fullName: 'Jane Doe',
            age: 28,
            gender: 'FEMALE',
            lastSeenAddress: 'Central Park'
        }));
        const res = await axios.post(`${API_URL}/cases`, formData, {
            headers: { ...formData.getHeaders(), Authorization: `Bearer ${citizenToken}` }
        });
        originalCaseId = res.data.id;
        console.log(`✅ Case 1 submitted (ID: ${originalCaseId}). Status: ${res.data.status}`);
    } catch (e) {
        console.error('❌ Failed Case 1:', e.message);
    }

    // 2. Submit second case (Exact Duplicate)
    try {
        const formData = new FormData();
        formData.append('caseData', JSON.stringify({
            fullName: 'Jane Doe',
            age: 28,
            gender: 'FEMALE',
            lastSeenAddress: 'Central Park'
        }));
        const res = await axios.post(`${API_URL}/cases`, formData, {
            headers: { ...formData.getHeaders(), Authorization: `Bearer ${citizenToken}` }
        });
        duplicateCaseId = res.data.id;
        console.log(`✅ Case 2 submitted (ID: ${duplicateCaseId}). Status: ${res.data.status}`);
    } catch (e) {
        console.error('❌ Failed Case 2:', e.message);
    }

    // 3. Verify Case 1 logic
    try {
        const res = await axios.post(`${API_URL}/cases/${originalCaseId}/verify`, null, {
            headers: { Authorization: `Bearer ${authorityToken}` }
        });
        if (res.data.status === 'VERIFIED') {
            console.log('✅ Case 1 successfully verified by AUTHORITY.');
        } else {
            console.error('❌ Verification failed, status is:', res.data.status);
        }
    } catch (e) {
        console.error('❌ Failed Verify Case 1:', e.response?.data || e.message);
    }

    // 4. Test Invalid Verification (Citizen trying to verify)
    try {
        await axios.post(`${API_URL}/cases/${duplicateCaseId}/verify`, null, {
            headers: { Authorization: `Bearer ${citizenToken}` }
        });
        console.error('❌ CITIZEN was able to verify a case!');
    } catch (e) {
        if (e.response?.status === 403 || e.response?.status === 401) {
            console.log('✅ CITIZEN correctly prevented from verifying case.');
        } else {
            console.error('❌ Expected 403, got:', e.response?.status);
        }
    }

    // 5. Fetch Pending Duplicates
    let duplicateCandidateId = null;
    try {
        const res = await axios.get(`${API_URL}/duplicates`, {
            headers: { Authorization: `Bearer ${authorityToken}` }
        });
        const candidate = res.data.find(d => d.candidateCase.id === duplicateCaseId);
        if (candidate) {
            duplicateCandidateId = candidate.id;
            console.log(`✅ Duplicate suggestion correctly generated. Score: ${candidate.similarityScore}, Reason: ${candidate.reason}`);
        } else {
            console.error('❌ Duplicate suggestion was NOT generated.');
        }
    } catch (e) {
        console.error('❌ Failed fetching duplicates:', e.response?.data || e.message);
    }

    // 6. Confirm Duplicate (Merge)
    if (duplicateCandidateId) {
        try {
            const res = await axios.post(`${API_URL}/duplicates/${duplicateCandidateId}/confirm`, null, {
                headers: { Authorization: `Bearer ${authorityToken}` }
            });
            if (res.data.status === 'CONFIRMED') {
                console.log('✅ Duplicate confirmed successfully.');
            }
            
            // Check status of duplicate case
            const dupRes = await axios.get(`${API_URL}/cases/${duplicateCaseId}`, {
                headers: { Authorization: `Bearer ${authorityToken}` }
            });
            if (dupRes.data.status === 'MERGED') {
                console.log('✅ Duplicate case status is correctly set to MERGED.');
            } else {
                console.error(`❌ Duplicate case status is ${dupRes.data.status}, expected MERGED.`);
            }
        } catch (e) {
            console.error('❌ Failed to confirm duplicate:', e.response?.data || e.message);
        }
    }

    console.log('--- Phase C E2E Tests Completed ---');
}

runTests();
