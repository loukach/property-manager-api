# Property Manager API

A backend API for managing a Portuguese real estate portfolio. This is a proof-of-concept (POC) implementation.

## Features

- Property management
- Contract tracking
- Document storage
- Dashboard with portfolio metrics

## Technologies Used

- Node.js
- Express.js
- TypeScript
- Supabase (for authentication and database)
- JWT Authentication

## Database Schema

The API uses Supabase with the following tables:
- Users
- Properties
- Contracts
- Documents
- Images

## Setup and Installation

### Prerequisites

- Node.js (v18 or newer)
- Supabase account and project

### Installation Steps

1. Clone the repository
2. Install dependencies:
```
npm install
```

3. Create a Supabase project at https://supabase.com
4. Update the `.env` file with your Supabase credentials (see `.env.example`)

5. Start the server:

For the JavaScript version with Supabase support:
```
npm run demo:supabase
```

For the TypeScript implementation:
```
npm run build:dev
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/logout` - End user session

### Properties
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/:id/images` - Upload property image
- `GET /api/properties/:id/images` - Get property images

### Contracts
- `GET /api/contracts` - List all contracts
- `POST /api/contracts` - Create new contract
- `GET /api/contracts/:id` - Get contract details
- `PUT /api/contracts/:id` - Update contract
- `GET /api/contracts/expiring` - Get contracts expiring within 60 days

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents/property/:propertyId` - Get documents for property
- `GET /api/documents/contract/:contractId` - Get documents for contract
- `GET /api/documents/:id/download` - Download document

### Dashboard
- `GET /api/dashboard/summary` - Get portfolio summary stats

## Environment Variables

Create a `.env` file with the following variables (see `.env.example`):

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_API_KEY=your_supabase_api_key
# SUPABASE_SERVICE_ROLE=your_supabase_service_role_key_for_admin_operations

# JWT Configuration (used by Supabase Auth)
JWT_SECRET=your_jwt_secret_key_replace_in_production
JWT_EXPIRES_IN=24h
```

## Authentication

The API uses Supabase Auth for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your_token_here
```

## Supabase Schema

Required tables in your Supabase project:
- properties
- contracts
- documents
- images

The schema should match the models used in the API. You can use the example Supabase schema in `src/db/supabase-schema.sql`.