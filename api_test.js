const axios = require('axios');
const mysql = require('mysql2/promise');

async function runTests() {
  const baseURL = 'http://localhost:8080/api/auth';
  let token = '';

  console.log('--- Starting API Tests ---');

  try {
    // 1. Registration
    console.log('Testing Registration...');
    const registerRes = await axios.post(`${baseURL}/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'CITIZEN'
    });
    console.log('Registration successful, token:', !!registerRes.data.token);

    // 2. Duplicate email rejected
    console.log('Testing Duplicate Email...');
    try {
      await axios.post(`${baseURL}/register`, {
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'password123',
        role: 'CITIZEN'
      });
      console.error('FAILED: Duplicate email allowed');
    } catch (err) {
      if (err.response.status === 409) {
        console.log('Duplicate email rejected (409) - OK');
      } else {
        console.error('FAILED: Unexpected status for duplicate email', err.response.status);
      }
    }

    // 3. Login
    console.log('Testing Login...');
    const loginRes = await axios.post(`${baseURL}/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    token = loginRes.data.token;
    console.log('Login successful, token:', !!token);

    // 4. GET /api/auth/me works
    console.log('Testing GET /me with valid token...');
    const meRes = await axios.get(`${baseURL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('GET /me successful, user:', meRes.data.name);

    // 5. Invalid JWT rejected
    console.log('Testing GET /me with invalid token...');
    try {
      await axios.get(`${baseURL}/me`, {
        headers: { Authorization: `Bearer INVALID_TOKEN` }
      });
      console.error('FAILED: Invalid token allowed');
    } catch (err) {
      if (err.response.status === 401 || err.response.status === 403) {
        console.log(`Invalid token rejected (${err.response.status}) - OK`);
      } else {
        console.error('FAILED: Unexpected status for invalid token', err.response.status);
      }
    }

    // 6. Check Password Hash in DB
    console.log('Checking Password Hash in DB...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'resqtrace'
    });
    const [rows] = await connection.execute('SELECT password_hash FROM users WHERE email = ?', ['test@example.com']);
    const hash = rows[0].password_hash;
    console.log('Password hash in DB:', hash);
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
      console.log('Password is a BCrypt hash - OK');
    } else {
      console.error('FAILED: Password is not a BCrypt hash');
    }
    await connection.end();

    console.log('--- All Tests Completed Successfully ---');
  } catch (err) {
    console.error('Test failed with error:', err.response ? err.response.data : err.message);
  }
}

// Run after a short delay to allow backend to start completely
setTimeout(runTests, 15000);
