# Property Manager API Tests

This directory contains minimal test scripts for the Property Manager API GET endpoints.

## Setup

1. Make sure your Property Manager API server is running
2. Install test dependencies:

```bash
cd tests
npm install
```

3. Run the setup script to create a .env file (if it doesn't exist):

```bash
npm run setup
```

## Running Tests

Run all tests:

```bash
npm test
```

Run specific test suites:

```bash
npm run test:properties   # Test property endpoints
npm run test:contracts    # Test contract endpoints
npm run test:documents    # Test document endpoints
npm run test:dashboard    # Test dashboard endpoints
```

## Test User

The tests assume there's a test user with the following credentials:
- Email: test@example.com
- Password: password123

You'll need to create this user in your system or modify the .env file to use existing credentials.

## Test Data

The tests assume there's at least one record of each type (property, contract, document) with ID 1.
If your database has different IDs, you may need to adjust the test files accordingly.