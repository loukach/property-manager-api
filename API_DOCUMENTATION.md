# Property Manager API Documentation

## Base URL
```
Production: https://property-manager-api.onrender.com
Development: http://localhost:3000/api
```

## Authentication

### Register
- **POST** `/auth/register`
- Body: `{name, email, password}`
- Returns: User data with JWT token

### Login
- **POST** `/auth/login`
- Body: `{email, password}`
- Returns: User data with JWT token

## Properties

### Get All Properties
- **GET** `/properties`
- Returns: Array of property objects

### Get Property
- **GET** `/properties/:id`
- Returns: Single property object

### Create Property
- **POST** `/properties`
- Body: `{name, address, property_type, status, monthly_rent}`
- Returns: Created property

### Update Property
- **PUT** `/properties/:id`
- Body: `{name, address, property_type, status, monthly_rent}`
- Returns: Updated property

### Delete Property
- **DELETE** `/properties/:id`
- Returns: Success message

### Upload Image
- **POST** `/properties/:id/images`
- Body: form-data with image file
- Returns: Image metadata

## Contracts

### Get All Contracts
- **GET** `/contracts`
- Returns: Array of contract objects

### Get Contract
- **GET** `/contracts/:id`
- Returns: Single contract object

### Create Contract
- **POST** `/contracts`
- Body: `{property_id, tenant_name, start_date, end_date, monthly_rent, status}`
- Returns: Created contract

### Update Contract
- **PUT** `/contracts/:id`
- Body: Contract fields to update
- Returns: Updated contract

### Delete Contract
- **DELETE** `/contracts/:id`
- Returns: Success message

## Documents

### Upload Document
- **POST** `/documents/:entityType/:entityId`
- Body: form-data with document file and metadata
- Returns: Document metadata

### Get Documents
- **GET** `/documents/:entityType/:entityId`
- Returns: Array of document objects

### Delete Document
- **DELETE** `/documents/:documentId`
- Returns: Success message

## Dashboard
- **GET** `/dashboard/summary`
- Returns: Stats on properties, contracts, income