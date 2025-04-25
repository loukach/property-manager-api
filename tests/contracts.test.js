const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000';
let token;

describe('Contracts API Tests', () => {
  // Before tests, login to get token
  // MVP: Authentication disabled
  /*
  beforeAll(async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASSWORD
      });
      token = response.data.token;
      console.log('Login successful, token acquired');
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      // Continue anyway, tests will fail but we'll see which ones
    }
  });
  */

  test('GET /api/contracts - should get all contracts', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/contracts`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBeTruthy();
      console.log(`Found ${response.data.length} contracts`);
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  });


  test('GET /api/contracts/:id - should get a specific contract', async () => {
    // Assuming there's at least one contract with ID 1
    const contractId = 1;
    
    try {
      const response = await axios.get(`${API_URL}/api/contracts/${contractId}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('tenant_name');
      expect(response.data).toHaveProperty('start_date');
      console.log(`Successfully retrieved contract for tenant: ${response.data.tenant_name}`);
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  });
});