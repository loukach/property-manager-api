const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000';
let token;

describe('Dashboard API Tests', () => {
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

  test('GET /api/dashboard/summary - should get dashboard summary', async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/summary`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalProperties');
      expect(response.data).toHaveProperty('occupiedProperties');
      expect(response.data).toHaveProperty('totalMonthlyRent');
      console.log('Successfully retrieved dashboard summary data');
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  });
});