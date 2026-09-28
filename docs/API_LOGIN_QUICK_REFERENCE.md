# API Login Flow - Quick Reference

## Quick Start

### 1️⃣ Run All API Login Tests
```bash
npx playwright test tests/api-login.spec.ts
```

### 2️⃣ Run Specific Test
```bash
npx playwright test tests/api-login.spec.ts -g "API-L1"
```

### 3️⃣ Basic Test Example
```typescript
import { test, expect } from '@playwright/test';
import { ApiLoginService } from '../utils/api.login.service';
import { ApiClient } from '../utils/api.client';
import { UserConfig } from '../config/user';

test('Login example', async () => {
  const apiClient = new ApiClient('http://localhost:80');
  await apiClient.init();
  
  const apiLoginService = new ApiLoginService(apiClient);
  const response = await apiLoginService.login(
    UserConfig.validUser.email,
    UserConfig.validUser.password
  );

  expect(response.status).toBe(200);
  expect(response.body.token).toBeTruthy();
  
  await apiClient.close();
});
```

---

## Using Fixtures

### With apiLoginService Fixture
```typescript
test('Using fixture', async ({ apiLoginService }) => {
  const response = await apiLoginService.login(email, password);
  expect(response.status).toBe(200);
});
```

### With Pre-authenticated Fixture
```typescript
test('Authenticated request', async ({ authenticatedApiClient }) => {
  const { token, response, client } = authenticatedApiClient;
  
  // token is already available
  // Use token for subsequent requests
  const userResponse = await client.get('/api/user/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  expect(userResponse.status).toBe(200);
});
```

---

## Using Test Data

```typescript
import { ApiLoginTestData, generateRandomInvalidCredentials } from '../testdata/api-login.data';

// Valid credentials
const valid = ApiLoginTestData.validCredentials;

// Invalid emails
const invalid = ApiLoginTestData.invalidEmails[0];

// SQL injection payloads
const sqlInjection = ApiLoginTestData.sqlInjectionPayloads[0];

// Generate random credentials
const randomInvalid = generateRandomInvalidCredentials();

// Generate test user
const newUser = generateTestUser('testuser');
```

---

## Common Test Patterns

### ✅ Successful Login
```typescript
test('Successful login', async ({ apiLoginService }) => {
  const response = await apiLoginService.login(email, password);
  
  expect(response.status).toBe(200);
  expect(response.body.token).toBeTruthy();
  expect(response.body.email).toBe(email);
});
```

### ❌ Failed Login
```typescript
test('Failed login', async ({ apiLoginService }) => {
  const response = await apiLoginService.login('invalid@test.com', 'wrongpass');
  
  expect(response.status).not.toBe(200);
  expect(response.body.error || response.body.errors).toBeTruthy();
  expect(response.body.token).toBeFalsy();
});
```

### 🔒 Security Test
```typescript
test('SQL injection prevention', async ({ apiLoginService }) => {
  const response = await apiLoginService.loginWithPayload({
    email: "' OR '1'='1",
    password: "' OR '1'='1"
  });
  
  expect(response.status).not.toBe(200);
  expect(response.body.error).toBeTruthy();
});
```

### 🔑 Token Validation
```typescript
test('Token verification', async ({ apiLoginService }) => {
  // Get token
  const loginResponse = await apiLoginService.login(email, password);
  const token = loginResponse.body.token;
  
  // Verify token
  const verifyResponse = await apiLoginService.verifyToken(token);
  expect(verifyResponse.status).toBe(200);
});
```

---

## Response Validation Helpers

```typescript
import { ResponseValidator } from '../utils/api.validation';

// Validate status code
ResponseValidator.validateStatus(response.status, 200);
ResponseValidator.validateSuccess(response.status); // 2xx

// Validate response body
ResponseValidator.validateHasKey(response.body, 'token');
ResponseValidator.validateHasKeys(response.body, ['email', 'token']);

// Validate property value
ResponseValidator.validatePropertyValue(response.body, 'email', 'user@example.com');

// Validate property exists (not null/undefined)
ResponseValidator.validatePropertyExists(response.body, 'token');

// Validate array
ResponseValidator.validateIsArray(response.body);

// Validate property in array
ResponseValidator.validateArrayContainsObject(response.body, { id: 123 });
```

---

## File Locations Quick Reference

| File | Purpose | Location |
|------|---------|----------|
| Feature file | BDD scenarios | `features/login-api.feature` |
| Steps | Step implementations | `steps/login-api.steps.ts` |
| Service | Login operations | `utils/api.login.service.ts` |
| Test specs | Direct Playwright tests | `tests/api-login.spec.ts` |
| Test data | Test data sets | `testdata/api-login.data.ts` |
| Fixtures | Reusable test fixtures | `fixtures/api-fixtures.ts` |
| Documentation | Full guide | `API_LOGIN_FLOW.md` |
| Diagrams | Architecture diagrams | `API_LOGIN_FLOW_DIAGRAM.md` |

---

## ApiLoginService Methods

```typescript
// Login
await apiLoginService.login(email, password);

// Login with custom payload
await apiLoginService.loginWithPayload({ email, password });

// Logout (requires token)
await apiLoginService.logout(token);

// Register new user
await apiLoginService.register(email, password, firstName, lastName);

// Verify token
await apiLoginService.verifyToken(token);

// Refresh token
await apiLoginService.refreshToken(refreshToken);

// Get login endpoint URL
apiLoginService.getLoginEndpoint();
```

---

## Test IDs Reference

| ID | Test Name | Category |
|----|-----------|----------|
| API-L1 | Successful login with valid credentials | ✅ Success |
| API-L2 | JWT token format validation | ✅ Success |
| API-L3 | Response fields validation | ✅ Success |
| API-L4 | Response headers validation | ✅ Success |
| API-L5 | Failed login with invalid email | ❌ Negative |
| API-L6 | Failed login with invalid password | ❌ Negative |
| API-L7 | Failed login with both invalid | ❌ Negative |
| API-L8 | Failed login with empty email | ❌ Empty Fields |
| API-L9 | Failed login with empty password | ❌ Empty Fields |
| API-L10 | Failed login with both empty | ❌ Empty Fields |
| API-L11 | No sensitive data exposure | 🔒 Security |
| API-L12 | SQL injection rejection | 🔒 Security |
| API-L13 | XSS rejection | 🔒 Security |
| API-L14 | Valid JSON response | 📋 Format |
| API-L15 | Error response format | 📋 Format |
| API-L16 | Special characters handling | 🔑 Edge Cases |
| API-L17 | Unicode characters handling | 🔑 Edge Cases |
| API-L18 | Very long inputs handling | 🔑 Edge Cases |
| API-L19 | Valid token verification | 🔑 Token |
| API-L20 | Invalid token rejection | 🔑 Token |
| API-L21 | Complete login workflow | 🔄 Workflow |

---

## Running Tests with Different Options

### Debug Mode
```bash
npx playwright test tests/api-login.spec.ts --debug
```

### Headed Mode (see browser)
```bash
npx playwright test tests/api-login.spec.ts --headed
```

### UI Mode
```bash
npx playwright test tests/api-login.spec.ts --ui
```

### Specific Browser
```bash
npx playwright test tests/api-login.spec.ts --project=chromium
npx playwright test tests/api-login.spec.ts --project=firefox
npx playwright test tests/api-login.spec.ts --project=webkit
```

### Parallel Workers
```bash
npx playwright test tests/api-login.spec.ts --workers=4
npx playwright test tests/api-login.spec.ts --workers=1
```

### With Reporter
```bash
npx playwright test tests/api-login.spec.ts --reporter=html
npx playwright test tests/api-login.spec.ts --reporter=json
npx playwright test tests/api-login.spec.ts --reporter=list
npx playwright test tests/api-login.spec.ts --reporter=dot
```

### Watch Mode
```bash
npx playwright test tests/api-login.spec.ts --watch
```

### Show Report
```bash
npx playwright show-report
```

---

## Troubleshooting

### Problem: Test hangs
```
Solution: Set timeout
test.setTimeout(30000);
```

### Problem: "Cannot find token"
```typescript
// Make sure token is extracted correctly
const token = response.body.token || 
              response.body.accessToken || 
              response.body.auth_token;
```

### Problem: "API client not initialized"
```typescript
// Must call init() before using
await apiClient.init();
```

### Problem: "ECONNREFUSED"
```
Solution: Ensure API server is running
Check BASE_URL configuration
```

### Problem: "JWT validation fails"
```typescript
// Verify JWT format
const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
expect(jwtRegex.test(token)).toBe(true);
```

---

## Tips & Tricks

1. **Use `authenticatedApiClient` for quick setup**
   ```typescript
   test('Quick test', async ({ authenticatedApiClient }) => {
     const { token } = authenticatedApiClient;
     // Ready to use token
   });
   ```

2. **Reuse test data**
   ```typescript
   import { ApiLoginTestData } from '../testdata/api-login.data';
   ```

3. **Extract tokens properly**
   ```typescript
   const token = response.body.token || response.body.accessToken;
   ```

4. **Use helpers for validation**
   ```typescript
   ResponseValidator.validateStatus(response.status, 200);
   ```

5. **Organize tests by category**
   ```typescript
   test.describe('Successful Login', () => { ... });
   test.describe('Security Tests', () => { ... });
   ```

---

## Next Steps

1. ✅ Run the tests: `npx playwright test tests/api-login.spec.ts`
2. 📊 View reports: `npx playwright show-report`
3. 📖 Read full docs: [API_LOGIN_FLOW.md](API_LOGIN_FLOW.md)
4. 📐 Check architecture: [API_LOGIN_FLOW_DIAGRAM.md](API_LOGIN_FLOW_DIAGRAM.md)
5. 🔧 Extend for other endpoints

---

## Support

For detailed documentation, see:
- [API_LOGIN_FLOW.md](API_LOGIN_FLOW.md) - Comprehensive guide
- [API_LOGIN_FLOW_DIAGRAM.md](API_LOGIN_FLOW_DIAGRAM.md) - Architecture diagrams
- [tests/api-login.spec.ts](tests/api-login.spec.ts) - Test examples
- [utils/api.login.service.ts](utils/api.login.service.ts) - Service implementation
