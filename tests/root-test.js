require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testRoot() {
  console.log(`Testing API root at ${API_URL}`);
  
  try {
    const response = await axios.get(`${API_URL}/`);
    console.log('Root endpoint response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error connecting to API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Server might be down.');
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

testRoot().then(success => {
  if (success) {
    console.log("API root test passed!");
  } else {
    console.log("API root test failed!");
  }
});