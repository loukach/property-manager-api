# Property Manager API

A backend API for managing real estate properties and their related contracts. This is a RESTful API built with Node.js, Express, and Supabase.

## Features

- Property management (create, read, update, delete properties)
- Contract tracking with tenant information
- Document and image storage using Supabase Storage
- Dashboard with portfolio metrics and analytics
- Standardized RESTful API with consistent response formats

## Technologies Used

- Node.js
- Express.js
- JavaScript
- Supabase (for database and storage)
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

To start the development server:
```
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
- `GET /api/contracts/property/:propertyId` - Get contracts for a specific property
- `GET /api/contracts/:id` - Get contract details
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract

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

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

⚠️ **Security Note**: Never commit your actual .env file with real credentials to the repository.

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.