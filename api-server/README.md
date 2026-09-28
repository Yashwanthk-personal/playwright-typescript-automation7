# Local API Server

This is a simple Express.js API server for testing purposes. It provides authentication endpoints that match typical REST API patterns.

## Quick Start

### Start the API Server

```bash
# Start API server (production)
npm run api:start

# Start API server with auto-reload (development)
npm run api:dev
```

The server will run on `http://localhost:3000`

## Endpoints

### Authentication

#### POST /api/auth/login
Login with email and password

**Request:**
```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "1",
  "email": "testuser@example.com",
  "firstName": "Test",
  "lastName": "User"
}
```

#### POST /api/auth/logout
Logout (currently a no-op)

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### POST /api/auth/register
Register a new user

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User"
}
```

#### GET /api/auth/verify
Verify a JWT token

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true,
  "token": {...decoded token...}
}
```

#### POST /api/auth/refresh
Refresh an expired or expiring token

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "token": "new-token",
  "accessToken": "new-token"
}
```

### Health Check

#### GET /health
Check if API is running

**Response (200):**
```json
{
  "status": "API Server is running"
}
```

## Test Credentials

The following test users are built-in:

1. **User 1:**
   - Email: `testuser@example.com`
   - Password: `password123`

2. **User 2:**
   - Email: `demo@demowebshop.com`
   - Password: `demo`

## Running Tests with API

### Using Cucumber/BDD:
```bash
# Start API server in one terminal
npm run api:start

# In another terminal, run API tests
npm run bdd:api
```

### Direct Playwright tests:
```bash
# Start API server
npm run api:start

# Run tests with API environment
TEST_ENV=api npm run test tests/api-login.spec.ts
```

## Configuration

API server configuration is in `.env.api`:

```env
API_SERVER_PORT=3000
JWT_SECRET=test-secret-key-12345
API_BASE_URL=http://localhost:3000
```

## Error Handling

### 400 Bad Request
Missing required fields (email, password)

### 401 Unauthorized
- Invalid email or password for login
- Invalid or expired token for protected endpoints

### 409 Conflict
Email already exists during registration

## Security Notes

⚠️ **This is a demo/test server only!**

- Tokens are not revoked (no blacklist)
- Passwords stored in plain text (for demo only)
- No rate limiting
- No HTTPS requirement
- JWT secret is hardcoded

**Do NOT use in production!**
