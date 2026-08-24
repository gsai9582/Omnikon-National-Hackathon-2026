const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:8080/api';

async function runTests() {
    console.log('--- Starting Phase E E2E Tests ---');

    let adminToken = '';
    let responderToken = '';
    let caseId = null;
    let responderProfileId = null;
    let taskId = null;

    // 1. Setup Users
    try {
        const adminRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Admin E',
            email: `admin_e_${Date.now()}@example.com`,
            password: 'password123',
            role: 'ADMIN'
        });
        adminToken = adminRes.data.token;
        console.log('✅ ADMIN Registered.');

        const responderRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Responder E',
            email: `responder_e_${Date.now()}@example.com`,
            password: 'password123',
            role: 'RESPONDER'
        });
        responderToken = responderRes.data.token;
        console.log('✅ RESPONDER Registered.');
    } catch (e) {
        console.error('❌ Setup failed:', e.message);
        return;
    }

    // 2. Responder sets status to AVAILABLE
    try {
        const meRes = await axios.get(`${API_URL}/responders/me`, {
            headers: { Authorization: `Bearer ${responderToken}` }
        });
        responderProfileId = meRes.data.id;
        
        await axios.put(`${API_URL}/responders/${responderProfileId}/availability?availability=AVAILABLE`, null, {
            headers: { Authorization: `Bearer ${responderToken}` }
        });
        console.log('✅ RESPONDER profile initialized and set to AVAILABLE.');
    } catch (e) {
        console.error('❌ Failed to update availability:', e.message);
    }

    // 3. Create Case
    try {
        const formData = new FormData();
        formData.append('caseData', JSON.stringify({
            fullName: 'Task Subject',
            age: 40,
            gender: 'MALE',
            lastSeenAddress: 'Downtown'
        }));
        const res = await axios.post(`${API_URL}/cases`, formData, {
            headers: { ...formData.getHeaders(), Authorization: `Bearer ${adminToken}` }
        });
        caseId = res.data.id;
        console.log(`✅ Case submitted (ID: ${caseId}).`);
    } catch (e) {
        console.error('❌ Failed Case Creation:', e.message);
    }

    // 4. Admin Creates and Assigns Task
    try {
        const res = await axios.post(`${API_URL}/tasks`, {
            missingPersonId: caseId,
            assignedResponderId: responderProfileId,
            title: 'Search Downtown Grid',
            description: 'Check alleyways near downtown.',
            priority: 'HIGH',
            searchRadius: 1.5
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        taskId = res.data.id;
        console.log(`✅ Admin created Task (ID: ${taskId}) and assigned to Responder.`);
    } catch (e) {
        console.error('❌ Failed Task Creation:', e.response?.data || e.message);
    }

    // 5. Responder updates task to IN_PROGRESS and then COMPLETED
    try {
        await axios.put(`${API_URL}/tasks/${taskId}/status?status=IN_PROGRESS`, null, {
            headers: { Authorization: `Bearer ${responderToken}` }
        });
        console.log('✅ RESPONDER successfully updated task to IN_PROGRESS.');

        await axios.put(`${API_URL}/tasks/${taskId}/status?status=COMPLETED`, null, {
            headers: { Authorization: `Bearer ${responderToken}` }
        });
        console.log('✅ RESPONDER successfully updated task to COMPLETED.');
    } catch (e) {
        console.error('❌ Failed Responder Task Update:', e.response?.data || e.message);
    }

    // 6. Verify Stats
    try {
        const res = await axios.get(`${API_URL}/cases/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Dashboard Stats Retrieved:');
        console.log(`   - Available Responders: ${res.data.availableResponders}`);
        console.log(`   - Completed Tasks: ${res.data.completedTasks}`);
    } catch (e) {
        console.error('❌ Failed to fetch stats:', e.message);
    }

    console.log('--- Phase E E2E Tests Completed ---');
}

runTests();
