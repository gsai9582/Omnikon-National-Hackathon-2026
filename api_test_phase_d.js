const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'http://localhost:8080/api';

async function runTests() {
    console.log('--- Starting Phase D E2E Tests ---');

    let citizenToken = '';
    let testCaseId = null;

    try {
        const citizenRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Citizen Map Tester',
            email: `map_tester_${Date.now()}@example.com`,
            password: 'password123',
            role: 'CITIZEN'
        });
        citizenToken = citizenRes.data.token;
        console.log('✅ CITIZEN Registered.');
    } catch (e) {
        console.error('❌ Setup failed:', e.message);
        return;
    }

    // 1. Submit a case with known coordinates
    try {
        const formData = new FormData();
        formData.append('caseData', JSON.stringify({
            fullName: 'Map Test Subject',
            age: 35,
            gender: 'MALE',
            lastSeenAddress: 'Eiffel Tower',
            latitude: 48.8584,
            longitude: 2.2945
        }));
        const res = await axios.post(`${API_URL}/cases`, formData, {
            headers: { ...formData.getHeaders(), Authorization: `Bearer ${citizenToken}` }
        });
        testCaseId = res.data.id;
        console.log(`✅ Case submitted (ID: ${testCaseId}). Latitude: 48.8584, Longitude: 2.2945`);
    } catch (e) {
        console.error('❌ Failed Case Creation:', e.message);
    }

    // 2. Test Map API
    try {
        const res = await axios.get(`${API_URL}/dashboard/map`, {
            headers: { Authorization: `Bearer ${citizenToken}` }
        });
        
        if (Array.isArray(res.data) && res.data.length > 0) {
            console.log(`✅ Map API successfully returned ${res.data.length} markers.`);
            
            const marker = res.data.find(m => m.id === testCaseId);
            if (marker) {
                console.log(`✅ Marker found in map data.`);
                console.log(`   - ShortName: ${marker.shortName} (Expected masked)`);
                console.log(`   - Lat/Lng: ${marker.latitude}, ${marker.longitude}`);
                console.log(`   - Priority: ${marker.priorityLevel}`);
                console.log(`   - Radius: ${marker.radiusKm}km`);
                
                if (marker.radiusKm === 2.0 && marker.priorityLevel === 'HIGH') {
                    console.log('✅ Prototype search-zone correctly attached.');
                } else {
                    console.error('❌ Search-zone data incorrect.');
                }
            } else {
                console.error('❌ Marker missing from map data.');
            }
        } else {
            console.error('❌ Map API returned empty or invalid data.');
        }
    } catch (e) {
        console.error('❌ Failed Map API Request:', e.response?.data || e.message);
    }

    console.log('--- Phase D E2E Tests Completed ---');
}

runTests();
