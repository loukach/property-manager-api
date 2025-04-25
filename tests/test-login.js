require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const email = process.env.TEST_USER_EMAIL || 'admin@example.com';
const password = process.env.TEST_USER_PASSWORD || 'admin123';

async function testLogin() {
  console.log(`Testing login with email: ${email}`);
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });
    
    console.log('Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('JWT token received successfully');
      
      // Test an authenticated endpoint
      try {
        const propertiesResponse = await axios.get(`${API_URL}/api/properties`, {
          headers: { Authorization: `Bearer ${response.data.token}` }
        });
        
        console.log('Successfully accessed properties endpoint');
        console.log(`Found ${propertiesResponse.data.length} properties`);
      } catch (error) {
        console.error('Error accessing properties endpoint:');
        console.error('Status:', error.response?.status);
        console.error('Error data:', error.response?.data);
      }
    }
  } catch (error) {
    console.error('Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Error data:', error.response?.data);
  }
}

testLogin();