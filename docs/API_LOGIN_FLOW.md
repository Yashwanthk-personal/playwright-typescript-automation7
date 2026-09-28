# API Login Flow - Complete Guide

This document provides a comprehensive guide to the API login testing flow that mirrors the UI login testing structure.

## Overview

The API Login Flow includes:
1. **Feature Files** - BDD scenarios for login
2. **Step Implementations** - Cucumber step definitions
3. **API Services** - Reusable login service client
4. **Test Specifications** - Direct Playwright tests
5. **Test Data** - Comprehensive test data and utilities
6. **API Fixtures** - Custom fixtures for API testing

---

## Architecture

```
API Login Flow
├── features/
│   └── login-api.feature          # BDD Scenarios
├── steps/
│   └── login-api.steps.ts         # Step Implementations
├── utils/
│   ├── api.client.ts              # Core HTTP client (existing)
│   ├── api.login.service.ts       # Login service (NEW)
│   └── api.validation.ts          # Response validation (existing)
├── tests/
│   └── api-login.spec.ts          # Direct tests (NEW)
├── fixtures/
│   ├── fixtures.ts                # UI fixtures (existing)
│   └── api-fixtures.ts            # API fixtures (NEW)
└── testdata/
    └── api-login.data.ts          # Test data (NEW)
```

---

## Files Created

### 1. Feature File - `features/login-api.feature`

**Purpose**: Define BDD scenarios for API login

**Contains**:
- Successful login scenarios
- Failed login scenarios (invalid credentials, empty fields)
- Response format validation
- Edge cases

**Usage**:
```bash
npx cucumber-js features/login-api.feature
```

**Sample Scenarios**:
- Successful API login with valid credentials
- Unsuccessful login with invalid email
- Unsuccessful login with invalid password
- Login with empty credentials
- Response format validation

---

### 2. Step Implementations - `steps/login-api.steps.ts`

**Purpose**: Implement BDD step definitions for API login

**Key Functions**:
- `Given('API client is initialized')` - Initialize API client
- `When('I send login request with valid credentials')` - Execute login
- `Then('API response status should be 200')` - Validate response status
- `Then('API response should contain authentication token')` - Token validation
- `Then('API response should have user email')` - Email validation
- `Then('API response token should be valid JWT format')` - JWT format check

**Usage Example**:
```typescript
When('I send login request with valid credentials', async function () {
  loginResponse = await apiLoginService.login(
    UserConfig.validUser.email,
    UserConfig.validUser.password
  );
});
```

---

### 3. API Login Service - `utils/api.login.service.ts`

**Purpose**: Centralized service for login-related API operations

**Key Methods**:

#### `login(email: string, password: string)`
```typescript
const response = await apiLoginService.login('user@example.com', 'password123');
// Returns: { status, headers, body, ok }
```

#### `loginWithPayload(payload: any)`
```typescript
const response = await apiLoginService.loginWithPayload({
  email: 'test@example.com',
  password: 'TestPass123!'
});
```

#### `logout(token: string)`
```typescript
await apiLoginService.logout(authToken);
```

#### `register(email, password, firstName, lastName)`
```typescript
const response = await apiLoginService.register(
  'newuser@example.com',
  'SecurePass123!',
  'John',
  'Doe'
);
```

#### `verifyToken(token: string)`
```typescript
const response = await apiLoginService.verifyToken(authToken);
```

#### `refreshToken(refreshToken: string)`
```typescript
const response = await apiLoginService.refreshToken(oldRefreshToken);
```

**Response Interface**:
```typescript
interface LoginResponse {
  token?: string;
  accessToken?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}
```

---

### 4. API Test Spec - `tests/api-login.spec.ts`

**Purpose**: Direct Playwright tests for API login (no Cucumber)

**Test Categories**:

#### ✅ Successful Login (API-L1 to API-L4)
```typescript
test('API-L1: Should successfully login with valid credentials', async () => {
  const response = await apiLoginService.login(email, password);
  ResponseValidator.validateStatus(response.status, 200);
  expect(response.body.token).toBeTruthy();
});
```

#### ❌ Failed Login - Invalid Credentials (API-L5 to API-L7)
```typescript
test('API-L5: Should fail login with invalid email', async () => {
  const response = await apiLoginService.login('invalid@notexist.com', password);
  expect(response.status).not.toBe(200);
  expect(response.body.error).toBeTruthy();
});
```

#### 🔒 Security Tests (API-L11 to API-L13)
```typescript
test('API-L12: Should reject SQL injection attempts', async () => {
  const response = await apiLoginService.loginWithPayload({
    email: "' OR '1'='1",
    password: "' OR '1'='1"
  });
  expect(response.status).not.toBe(200);
});
```

#### 🔑 Token Validation (API-L19 to API-L20)
```typescript
test('API-L19: Should verify token with valid token', async () => {
  const loginResponse = await apiLoginService.login(email, password);
  const token = loginResponse.body.token;
  const verifyResponse = await apiLoginService.verifyToken(token);
  expect(verifyResponse.status).toBe(200);
});
```

**Running Tests**:
```bash
npx playwright test tests/api-login.spec.ts
npx playwright test tests/api-login.spec.ts --headed
npx playwright test tests/api-login.spec.ts -g "Successful Login"
```

---

### 5. Test Data - `testdata/api-login.data.ts`

**Purpose**: Centralized test data for API login scenarios

**Available Data Sets**:

```typescript
// Valid credentials
ApiLoginTestData.validCredentials
// { email: 'rupesh.kumar@qualitrix.com', password: 'Test@123' }

// Invalid emails for testing
ApiLoginTestData.invalidEmails
// ['invalid@example.com', 'notregistered@test.com', ...]

// SQL injection payloads
ApiLoginTestData.sqlInjectionPayloads
// [{ email: "' OR '1'='1", password: "' OR '1'='1" }, ...]

// XSS payloads
ApiLoginTestData.xssPayloads

// Edge cases
ApiLoginTestData.edgeCases
// { emptyEmail: '', veryLongEmail: 'a'.repeat(1000) + '@example.com', ... }
```

**Helper Functions**:

```typescript
// Generate random invalid credentials
const creds = generateRandomInvalidCredentials();
// { email: 'test{random}@fakeemail.com', password: 'RandomPass{random}' }

// Generate test user
const user = generateTestUser('newuser');
// { email: 'newuser{timestamp}@example.com', password: 'TestPass{timestamp}!' }
```

**Usage in Tests**:
```typescript
import { ApiLoginTestData, generateRandomInvalidCredentials } from '../testdata/api-login.data';

test('Test with SQL injection', async () => {
  const payload = ApiLoginTestData.sqlInjectionPayloads[0];
  const response = await apiLoginService.loginWithPayload(payload);
  // ...
});
```

---

### 6. API Fixtures - `fixtures/api-fixtures.ts`

**Purpose**: Reusable fixtures for API testing

**Available Fixtures**:

#### `apiClient`
```typescript
test('Example test', async ({ apiClient }) => {
  const response = await apiClient.get('/api/products');
});
```

#### `apiLoginService`
```typescript
test('Example test', async ({ apiLoginService }) => {
  const response = await apiLoginService.login(email, password);
});
```

#### `authenticatedApiClient`
```typescript
test('Authenticated request', async ({ authenticatedApiClient }) => {
  // Pre-authenticated context with token
  const { client, token, response } = authenticatedApiClient;
  // token is already available
  // response contains user data
});
```

#### `loginAsValidUser`
```typescript
test('With valid user login', async ({ loginAsValidUser }) => {
  const { token, response, client } = loginAsValidUser;
  // Use token for authenticated requests
});
```

#### `loginAsInvalidUser`
```typescript
test('With invalid login attempt', async ({ loginAsInvalidUser }) => {
  const { response, client } = loginAsInvalidUser;
  // Validate error response
});
```

#### `apiRequestWithAuth`
```typescript
test('Request helper with auth', async ({ apiRequestWithAuth, createValidAuthToken }) => {
  const token = await createValidAuthToken;
  const response = await apiRequestWithAuth('/api/profile', 'GET', token);
});
```

#### `apiRequestWithoutAuth`
```typescript
test('Request helper without auth', async ({ apiRequestWithoutAuth }) => {
  const response = await apiRequestWithoutAuth('/api/public', 'GET');
});
```

---

## Comparison: UI vs API Login Flow

| Aspect | UI Flow | API Flow |
|--------|---------|----------|
| **Feature File** | `login.feature` | `login-api.feature` |
| **Steps** | `login.steps.ts` | `login-api.steps.ts` |
| **Page Object** | `LoginPage` | `ApiLoginService` |
| **Test Spec** | `login.spec.ts` | `api-login.spec.ts` |
| **Fixtures** | `fixtures.ts` | `api-fixtures.ts` |
| **Client** | Playwright Browser | Playwright APIRequestContext |
| **Communication** | UI Interactions | HTTP Requests |

---

## Running the Tests

### Run All API Login Tests
```bash
npx playwright test tests/api-login.spec.ts
```

### Run Specific Test Category
```bash
npx playwright test tests/api-login.spec.ts -g "Successful Login"
npx playwright test tests/api-login.spec.ts -g "Security Tests"
npx playwright test tests/api-login.spec.ts -g "Token Validation"
```

### Run with CLI Reports
```bash
npx playwright test tests/api-login.spec.ts --reporter=html
npx playwright test tests/api-login.spec.ts --reporter=json > report.json
npx playwright test tests/api-login.spec.ts --reporter=list
```

### Run Cucumber Features
```bash
# Requires cucumber setup (if configured)
npx cucumber-js features/login-api.feature
```

### Run with Debugging
```bash
npx playwright test tests/api-login.spec.ts --debug
npx playwright test tests/api-login.spec.ts --headed
```

### Run with Coverage
```bash
npx playwright test tests/api-login.spec.ts --reporter=html
npx playwright show-report
```

---

## Test Cases Coverage

### ✅ Positive Tests (Successful Login)
- **API-L1**: Login with valid credentials
- **API-L2**: Validate JWT token format
- **API-L3**: Validate response contains required fields
- **API-L4**: Validate response headers

### ❌ Negative Tests (Failed Login)
- **API-L5**: Invalid email
- **API-L6**: Invalid password
- **API-L7**: Both credentials invalid
- **API-L8**: Empty email
- **API-L9**: Empty password
- **API-L10**: Both fields empty

### 🔒 Security Tests
- **API-L11**: No sensitive data exposure
- **API-L12**: SQL injection rejection
- **API-L13**: XSS rejection

### 📋 Response Format Tests
- **API-L14**: Valid JSON response
- **API-L15**: Error response format

### 🔑 Edge Cases & Token Tests
- **API-L16**: Special characters handling
- **API-L17**: Unicode characters
- **API-L18**: Very long inputs
- **API-L19**: Token verification
- **API-L20**: Invalid token rejection

### 🔄 Workflow Tests
- **API-L21**: Complete login workflow (login → verify → logout)

---

## Best Practices

1. **Use ApiLoginService** for all login API calls
   ```typescript
   // ✓ Good
   const response = await apiLoginService.login(email, password);
   
   // ✗ Avoid
   const response = await apiClient.post('/api/auth/login', { data: {...} });
   ```

2. **Use ResponseValidator** for response validation
   ```typescript
   // ✓ Good
   ResponseValidator.validateStatus(response.status, 200);
   ResponseValidator.validateHasKey(response.body, 'token');
   
   // ✗ Avoid
   expect(response.status === 200);
   ```

3. **Use Test Data** from `ApiLoginTestData`
   ```typescript
   // ✓ Good
   const payload = ApiLoginTestData.sqlInjectionPayloads[0];
   
   // ✗ Avoid
   const payload = { email: "' OR '1'='1", password: "..." };
   ```

4. **Use Fixtures** for setup
   ```typescript
   // ✓ Good
   test('Example', async ({ authenticatedApiClient }) => { ... });
   
   // ✗ Avoid
   test('Example', async () => {
     const token = ...setup...
   });
   ```

5. **Clean organization** - Keep API and UI tests separate
   ```
   tests/
   ├── api-login.spec.ts
   ├── ui-login.spec.ts
   └── integration-login.spec.ts
   ```

---

## Extending the Flow

### Adding New Login Endpoints

1. **Update ApiLoginService** (`utils/api.login.service.ts`)
   ```typescript
   async socialLogin(provider: string, token: string) {
     return this.apiClient.post('/api/auth/social-login', {
       data: { provider, token }
     });
   }
   ```

2. **Add Test Data** (`testdata/api-login.data.ts`)
   ```typescript
   socialLoginProviders: ['google', 'facebook', 'github']
   ```

3. **Add Tests** (`tests/api-login.spec.ts`)
   ```typescript
   test('Should login with social provider', async ({ apiLoginService }) => {
     const response = await apiLoginService.socialLogin('google', 'token123');
   });
   ```

4. **Add Steps** (`steps/login-api.steps.ts`)
   ```typescript
   When('I send social login request', async function () {
     // Implementation
   });
   ```

---

## Troubleshooting

### Test Fails: "API client is not initialized"
```typescript
// Make sure to initialize in setup
apiClient = new ApiClient(APP_BASE_URL);
await apiClient.init();
```

### Test Fails: "Invalid JWT format"
```typescript
// Check token extraction
const token = response.body.token || response.body.accessToken;
// Ensure token is extracted correctly before validation
```

### Test Fails: "ECONNREFUSED"
```bash
# Ensure API server is running
# Check APP_BASE_URL in config
# Verify network connectivity
```

### Test Fails: "Response body is undefined"
```typescript
// Ensure response is parsed as JSON
// Check Content-Type headers
ResponseValidator.validateHasKey(response.body, 'key');
```

---

## Integration with CI/CD

```yaml
# GitHub Actions Example
- name: Run API Login Tests
  run: npx playwright test tests/api-login.spec.ts --reporter=html

- name: Upload Report
  uses: actions/upload-artifact@v2
  with:
    name: playwright-report
    path: playwright-report/
```

---

## Summary

This API Login Flow provides:
- ✅ Complete test coverage for login scenarios
- ✅ Reusable service for login operations
- ✅ Comprehensive test data
- ✅ Custom fixtures for easy setup
- ✅ BDD scenarios with step implementations
- ✅ Security and edge case testing
- ✅ Token validation and management

Use this as a template for implementing similar API flows for other features!
