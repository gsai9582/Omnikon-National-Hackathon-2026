const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:8080/api';

async function runTests() {
    console.log('--- Starting Phase B E2E Tests ---');

    let citizenToken = '';
    let authorityToken = '';
    let caseIdStr = '';
    let dbId = '';

    // 1. Register/Login as CITIZEN
    try {
        const email = 'citizen_b_' + Date.now() + '@example.com';
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Citizen B',
            email: email,
            password: 'password123',
            role: 'CITIZEN'
        });
        citizenToken = registerRes.data.token;
        console.log('✅ CITIZEN Registered and logged in. Token length:', citizenToken.length);
    } catch (e) {
        console.error('❌ Failed to register CITIZEN:', e.response?.data || e.message);
        return;
    }

    // 2. Register/Login as AUTHORITY
    try {
        const email = 'authority_b_' + Date.now() + '@example.com';
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Authority B',
            email: email,
            password: 'password123',
            role: 'AUTHORITY'
        });
        authorityToken = registerRes.data.token;
        console.log('✅ AUTHORITY Registered and logged in.');
    } catch (e) {
        console.error('❌ Failed to register AUTHORITY:', e.response?.data || e.message);
        return;
    }

    // Create a dummy valid image (a small JPEG with valid magic numbers)
    const validImgPath = path.join(__dirname, 'valid_image.jpg');
    // JPEG magic numbers: FF D8 FF E0 ...
    const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
    fs.writeFileSync(validImgPath, validJpeg);

    // Create a dummy invalid image (a text file renamed to jpg)
    const invalidImgPath = path.join(__dirname, 'invalid_image.jpg');
    fs.writeFileSync(invalidImgPath, 'This is just a text file, not an image.');

    // Create a large file (> 10MB)
    const largeImgPath = path.join(__dirname, 'large_image.jpg');
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 0xFF); // 11MB of FF (matches jpeg start)
    fs.writeFileSync(largeImgPath, largeBuffer);

    // 3. Submit a missing-person report with valid image
    try {
        const formData = new FormData();
        const caseData = {
            fullName: 'John Doe Missing',
            age: 35,
            gender: 'MALE',
            description: 'Wearing a blue jacket',
            lastSeenAddress: '123 Main St',
            latitude: 40.7128,
            longitude: -74.0060
        };
        formData.append('caseData', JSON.stringify(caseData));
        formData.append('photo', fs.createReadStream(validImgPath));

        const res = await axios.post(`${API_URL}/cases`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${citizenToken}`
            }
        });
        caseIdStr = res.data.caseId;
        dbId = res.data.id;
        console.log(`✅ Report submitted. Generated Case ID: ${caseIdStr} (DB ID: ${dbId})`);
        
        // Confirm generated format RQT-YYYY-XXXXX
        if (/^RQT-\d{4}-\d{5}$/.test(caseIdStr)) {
            console.log(`✅ Case ID format is correct: ${caseIdStr}`);
        } else {
            console.error(`❌ Case ID format is INCORRECT: ${caseIdStr}`);
        }
    } catch (e) {
        console.error('❌ Failed to submit valid report:', e.response?.data || e.message);
    }

    // 4. Confirm case exists in case list
    try {
        const res = await axios.get(`${API_URL}/cases`, {
            headers: { Authorization: `Bearer ${citizenToken}` }
        });
        const found = res.data.content.find(c => c.caseId === caseIdStr);
        if (found) {
            console.log('✅ Case found in the case list response.');
        } else {
            console.error('❌ Case NOT found in the case list response.');
        }
    } catch (e) {
        console.error('❌ Failed to fetch case list:', e.response?.data || e.message);
    }

    // 5. Confirm dashboard statistics update
    try {
        const res = await axios.get(`${API_URL}/cases/stats`, {
            headers: { Authorization: `Bearer ${citizenToken}` }
        });
        if (res.data.totalCases > 0 && res.data.reported > 0) {
            console.log('✅ Dashboard stats updated correctly:', res.data);
        } else {
            console.error('❌ Dashboard stats did not update correctly:', res.data);
        }
    } catch (e) {
        console.error('❌ Failed to fetch dashboard stats:', e.response?.data || e.message);
    }

    // 6. Test invalid form input
    try {
        const formData = new FormData();
        const caseData = {
            // Missing fullName
            age: 35,
            gender: 'MALE'
        };
        formData.append('caseData', JSON.stringify(caseData));
        await axios.post(`${API_URL}/cases`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${citizenToken}`
            }
        });
        console.error('❌ Expected invalid input to fail, but it succeeded.');
    } catch (e) {
        if (e.response?.status === 400) {
            console.log('✅ Invalid input correctly rejected with 400 Bad Request.');
        } else {
            console.error(`❌ Expected 400 for invalid input, got ${e.response?.status}:`, e.response?.data);
        }
    }

    // 7. Test invalid file types
    try {
        const formData = new FormData();
        formData.append('caseData', JSON.stringify({ fullName: 'Test', gender: 'MALE' }));
        formData.append('photo', fs.createReadStream(invalidImgPath), { contentType: 'image/jpeg' });
        await axios.post(`${API_URL}/cases`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${citizenToken}`
            }
        });
        console.error('❌ Expected invalid file to fail, but it succeeded.');
    } catch (e) {
        if (e.response?.status === 400) {
            console.log('✅ Invalid file correctly rejected with 400 Bad Request:', e.response.data);
        } else {
            console.error(`❌ Expected 400 for invalid file, got ${e.response?.status}:`, e.response?.data);
        }
    }

    // 8. Test oversized file rejection
    try {
        const formData = new FormData();
        formData.append('caseData', JSON.stringify({ fullName: 'Test', gender: 'MALE' }));
        formData.append('photo', fs.createReadStream(largeImgPath), { contentType: 'image/jpeg' });
        await axios.post(`${API_URL}/cases`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${citizenToken}`
            },
            maxBodyLength: Infinity, // required for axios to send large files
            maxContentLength: Infinity
        });
        console.error('❌ Expected large file to fail, but it succeeded.');
    } catch (e) {
        if (e.response?.status === 413 || e.response?.status === 500) { // Spring sometimes translates max size to 500/413 depending on servlet config timing
            console.log(`✅ Large file correctly rejected with status ${e.response.status}.`);
        } else {
            console.error(`❌ Expected 413 for large file, got ${e.response?.status}:`, e.response?.data);
        }
    }

    // 9. Test authorization rules (CITIZEN update)
    try {
        await axios.put(`${API_URL}/cases/${dbId}/status?status=VERIFIED`, null, {
            headers: { Authorization: `Bearer ${citizenToken}` }
        });
        console.error('❌ Expected CITIZEN status update to fail, but it succeeded.');
    } catch (e) {
        if (e.response?.status === 403) {
            console.log('✅ CITIZEN correctly prevented from updating status (403 Forbidden).');
        } else {
            console.error(`❌ Expected 403 for CITIZEN update, got ${e.response?.status}:`, e.response?.data);
        }
    }

    // 10. Test authorization rules (AUTHORITY update)
    try {
        const res = await axios.put(`${API_URL}/cases/${dbId}/status?status=VERIFIED`, null, {
            headers: { Authorization: `Bearer ${authorityToken}` }
        });
        if (res.data.status === 'VERIFIED') {
            console.log('✅ AUTHORITY successfully updated case status to VERIFIED.');
        } else {
            console.error('❌ AUTHORITY request succeeded but status did not change:', res.data);
        }
    } catch (e) {
        console.error('❌ AUTHORITY failed to update status:', e.response?.data || e.message);
    }

    // Clean up files
    fs.unlinkSync(validImgPath);
    fs.unlinkSync(invalidImgPath);
    fs.unlinkSync(largeImgPath);

    console.log('--- Phase B E2E Tests Completed ---');
}

runTests();
