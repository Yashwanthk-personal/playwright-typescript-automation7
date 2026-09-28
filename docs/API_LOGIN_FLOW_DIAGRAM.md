# API Login Flow - Architecture Diagram

## Complete Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   API LOGIN TEST FLOW                           │
│                    (BDD + Direct Tests)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    TEST EXECUTION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────┐    │
│  │  BDD (Cucumber)      │         │  Direct (Playwright) │    │
│  ├──────────────────────┤         ├──────────────────────┤    │
│  │ login-api.feature    │         │  api-login.spec.ts   │    │
│  │ (Feature Scenarios)  │         │  (Test Specs)        │    │
│  └──────────────────────┘         └──────────────────────┘    │
│          ↓                                    ↓                 │
│  ┌──────────────────────┐         ┌──────────────────────┐    │
│  │ login-api.steps.ts   │         │   Fixtures           │    │
│  │ (Step Definitions)   │         │ (test setup/teardown)│    │
│  └──────────────────────┘         └──────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Uses
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ApiLoginService                                         │  │
│  │  • login(email, password)                               │  │
│  │  • loginWithPayload(payload)                            │  │
│  │  • logout(token)                                        │  │
│  │  • register(...)                                        │  │
│  │  • verifyToken(token)                                   │  │
│  │  • refreshToken(refreshToken)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓ Uses                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Uses
┌─────────────────────────────────────────────────────────────────┐
│                    HTTP CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ApiClient (api.client.ts)                              │  │
│  │  • get(endpoint, options)                               │  │
│  │  • post(endpoint, options)                              │  │
│  │  • put(endpoint, options)                               │  │
│  │  • patch(endpoint, options)                             │  │
│  │  • delete(endpoint, options)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Uses
┌─────────────────────────────────────────────────────────────────┐
│                  PLAYWRIGHT REQUEST CONTEXT                    │
│            (APIRequestContext from @playwright/test)            │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Sends HTTP
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND API                                  │
│            POST /api/auth/login                                 │
│  Request:  { email, password }                                  │
│  Response: { token, email, userId, ... } or { error, ... }     │
└─────────────────────────────────────────────────────────────────┘
```

## Test Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 TEST DATA SOURCES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐      ┌──────────────────────────────┐   │
│  │  UserConfig      │      │  ApiLoginTestData            │   │
│  │  (user.ts)       │      │  (api-login.data.ts)         │   │
│  ├──────────────────┤      ├──────────────────────────────┤   │
│  │ validUser: {     │      │ validCredentials             │   │
│  │   email: ...     │      │ invalidEmails                │   │
│  │   password: ...  │      │ invalidPasswords             │   │
│  │ }                │      │ sqlInjectionPayloads         │   │
│  └──────────────────┘      │ xssPayloads                  │   │
│                            │ edgeCases                    │   │
│                            │ requiredFieldTests           │   │
│                            │ errorMessages                │   │
│                            │ jwtToken                     │   │
│                            └──────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Used by
┌─────────────────────────────────────────────────────────────────┐
│          TESTS (api-login.spec.ts)                             │
│          STEPS (login-api.steps.ts)                            │
└─────────────────────────────────────────────────────────────────┘
```

## Fixture Dependency Chain

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIXTURES HIERARCHY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  apiClient                                                       │
│     ↓ wraps                                                      │
│  APIRequestContext (Playwright)                                 │
│     ↓ used by                                                    │
│  ┌─────────────────┬──────────────────┬────────────────────┐   │
│  │                 │                  │                    │   │
│  ▼                 ▼                  ▼                    ▼    │
│ apiLoginService  authenticatedApiClient  loginAsValidUser ...  │
│ - login()        - client             - token              │   │
│ - logout()       - token              - response           │   │
│ - register()     - response           - client             │   │
│ - verifyToken()                                            │   │
│ - refreshToken()                                           │   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Test Execution Flow

```
Test Start
   ↓
[Setup Fixtures]
   ├─ Initialize apiClient
   ├─ Create apiLoginService
   └─ Create authenticatedApiClient (if needed)
   ↓
[Execute Test Steps]
   ├─ Given: Setup conditions
   ├─ When: Perform login request
   └─ Then: Validate response
   ↓
[Response Validation]
   ├─ Check Status Code
   ├─ Validate Response Body
   ├─ Verify Token Format
   └─ Validate Fields
   ↓
[Assertions & Expectations]
   ├─ expect(status).toBe(200)
   ├─ expect(token).toBeTruthy()
   └─ ResponseValidator.validate*()
   ↓
[Cleanup Fixtures]
   └─ Close apiClient
   ↓
Test End (Pass/Fail)
```

## Test Coverage Map

```
API Login Tests (api-login.spec.ts)
│
├─ Successful Login Scenarios (API-L1 to API-L4)
│  ├─ Valid credentials login ✓
│  ├─ JWT token format validation ✓
│  ├─ Response fields validation ✓
│  └─ Response headers validation ✓
│
├─ Failed Login Scenarios - Invalid Credentials (API-L5 to API-L7)
│  ├─ Invalid email ✓
│  ├─ Invalid password ✓
│  └─ Both invalid ✓
│
├─ Failed Login Scenarios - Empty Fields (API-L8 to API-L10)
│  ├─ Empty email ✓
│  ├─ Empty password ✓
│  └─ Both empty ✓
│
├─ Login Security Tests (API-L11 to API-L13)
│  ├─ No sensitive data exposure ✓
│  ├─ SQL injection rejection ✓
│  └─ XSS rejection ✓
│
├─ Response Format Tests (API-L14 to API-L15)
│  ├─ Valid JSON response ✓
│  └─ Error response format ✓
│
├─ Edge Cases Tests (API-L16 to API-L18)
│  ├─ Special characters ✓
│  ├─ Unicode characters ✓
│  └─ Very long inputs ✓
│
├─ Token Validation Tests (API-L19 to API-L20)
│  ├─ Valid token verification ✓
│  └─ Invalid token rejection ✓
│
└─ Workflow Tests (API-L21)
   └─ Complete login workflow ✓
```

## Directory Structure

```
demo-webshop-automation/
│
├─ features/
│  ├─ login.feature              (UI Scenarios)
│  ├─ login-api.feature          (API Scenarios) ← NEW
│  ├─ cart.feature
│  └─ product_search.feature
│
├─ steps/
│  ├─ login.steps.ts             (UI Steps)
│  ├─ login-api.steps.ts         (API Steps) ← NEW
│  ├─ common.steps.ts
│  ├─ cart.steps.ts
│  └─ hooks.ts
│
├─ pages/
│  └─ login.page.ts              (UI Page Object)
│
├─ utils/
│  ├─ api.client.ts              (HTTP Client)
│  ├─ api.validation.ts          (Response Validation)
│  ├─ api.login.service.ts       (Login Service) ← NEW
│  └─ ...other utils
│
├─ tests/
│  ├─ login.spec.ts              (UI Tests)
│  ├─ api-login.spec.ts          (API Tests) ← NEW
│  ├─ api.spec.ts
│  └─ ...other tests
│
├─ fixtures/
│  ├─ fixtures.ts                (UI Fixtures)
│  ├─ api-fixtures.ts            (API Fixtures) ← NEW
│  ├─ service.container.ts
│  └─ test-fixtures.ts
│
├─ testdata/
│  ├─ api-login.data.ts          (Test Data) ← NEW
│  └─ ...other data
│
├─ config/
│  ├─ config.ts
│  └─ user.ts
│
├─ API_LOGIN_FLOW.md             (This Documentation) ← NEW
├─ API_LOGIN_FLOW_DIAGRAM.md     (Architecture Diagrams) ← NEW
├─ playwright.config.ts
├─ cucumber.js
├─ package.json
└─ README.md
```

## Request/Response Flow

```
Client Test
   │
   ├─ Create ApiLoginService
   │     │
   │     └─ Initialize with ApiClient
   │           │
   │           └─ Calls login(email, password)
   │
   ├─ Sends HTTP Request
   │     │
   │     └─ POST /api/auth/login
   │           {
   │              "email": "user@example.com",
   │              "password": "Test@123"
   │           }
   │
   └─ Receives HTTP Response
         │
         ├─ Success (200)
         │     {
         │        "token": "eyJ...",
         │        "email": "user@example.com",
         │        "userId": "123",
         │        ...
         │     }
         │
         └─ Failure (400/401/403)
               {
                  "error": "Invalid credentials",
                  "message": "Email or password is incorrect",
                  "statusCode": 401
               }
         │
         └─ Validate Response → Assert → Test Result
```

## Feature Similarity Matrix

| Feature | UI Login | API Login |
|---------|----------|-----------|
| **Test Type** | Selenium/Playwright Browser | Playwright APIRequestContext |
| **Entry Point** | LoginPage.navigateToLogin() | ApiLoginService.login() |
| **Data Flow** | User clicks → Form fills → Submit | HTTP POST → Response body |
| **Validation** | DOM elements, Page title | HTTP status, JSON fields |
| **Fixtures** | LoginPage, HomePage | apiClient, apiLoginService |
| **Error Handling** | UI alerts, error messages | HTTP errors, error JSON |
| **Authentication** | Cookie/Session storage | JWT token in response |
| **Speed** | Slower (browser overhead) | Faster (direct HTTP) |
| **Use Case** | User experience testing | API contract testing |

## Running Different Test Combinations

```
# All API login tests
npx playwright test tests/api-login.spec.ts

# Specific test category
npx playwright test tests/api-login.spec.ts -g "Successful Login"
npx playwright test tests/api-login.spec.ts -g "Security Tests"

# With options
npx playwright test tests/api-login.spec.ts --headed
npx playwright test tests/api-login.spec.ts --debug
npx playwright test tests/api-login.spec.ts --ui

# With reporters
npx playwright test tests/api-login.spec.ts --reporter=html
npx playwright test tests/api-login.spec.ts --reporter=json > report.json

# Parallel execution
npx playwright test tests/api-login.spec.ts --workers=4

# Watch mode
npx playwright test tests/api-login.spec.ts --watch
```
