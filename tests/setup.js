// This file creates a .env file for testing if it doesn't exist
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

// Check if .env file exists, if not create it
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file for testing');
  const envContent = `API_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test_password_placeholder`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('.env file created successfully');
} else {
  console.log('.env file already exists');
}