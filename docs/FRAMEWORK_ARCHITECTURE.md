# Framework Architecture Diagram

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                       TEST LAYER                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Unit Tests      │  │  BDD Tests       │  │  UI Tests        │ │
│  │  (Playwright)    │  │  (Cucumber)      │  │  (Page Objects)  │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘ │
└───────────┼──────────────────────┼──────────────────────┼───────────┘
           │                       │                      │
           └───────────────────────┼──────────────────────┘
                                   ▼
           ┌───────────────────────────────────────┐
           │      SERVICE LAYER (api/services)    │
           │  ┌─────────────┐   ┌─────────────┐   │
           │  │  Login      │   │  Cart       │   │
           │  │  Service    │   │  Service    │   │
           │  └─────┬───────┘   └──────┬──────┘   │
           │        │                  │          │
           │  ┌─────────────────────────────────┐ │
           │  │    Base Service (helpers)       │ │
           │  └──────────────────┬──────────────┘ │
           └─────────────────────┼────────────────┘
                                 ▼
           ┌───────────────────────────────────────┐
           │      CORE LAYER (api/core)            │
           │  ┌─────────────────────────────────┐  │
           │  │     API EXECUTOR                │  │
           │  │  (Generic HTTP call executor)   │  │
           │  └──────────────┬───────────────────┘ │
           │                 │                     │
           │  ┌──────────────┴──────────────────┐  │
           │  │                                 │  │
           │  ▼                                 ▼  │
           │ ┌──────────────┐           ┌──────────┐
           │ │  API METHODS │           │ VALIDATOR│
           │ │ (HTTP ops)   │           │(responses)
           │ └──────────────┘           └──────────┘
           └───────────────────────────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────────┐
        │    Playwright Request Context        │
        │  (baseURL, headers, timeout, etc)    │
        └──────────────────────────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────────┐
        │     HTTP Requests to API Server      │
        │  (GET/POST/PUT/PATCH/DELETE/HEAD)    │
        └──────────────────────────────────────┘
```

---

## Service Creation Flow

```
┌──────────────────────────────────────────────────────────────┐
│ Create New Service (e.g., OrderService)                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Extend BaseApiService                                    │
│     ┌──────────────────────────────────────────────────────┐ │
│     │ class OrderService extends BaseApiService { ... }    │ │
│     └──────────────────────────────────────────────────────┘ │
│                                                               │
│  2. Define Endpoints                                         │
│     ┌──────────────────────────────────────────────────────┐ │
│     │ private endpoints = {                                │ │
│     │   getOrders: '/api/orders',                          │ │
│     │   createOrder: '/api/orders'                         │ │
│     │ }                                                     │ │
│     └──────────────────────────────────────────────────────┘ │
│                                                               │
│  3. Implement Methods using this.methods                    │
│     ┌──────────────────────────────────────────────────────┐ │
│     │ async getOrders(token): ExecutionResponse<Order[]>   │ │
│     │   return this.methods.get(endpoint, {headers})       │ │
│     │                                                       │ │
│     └──────────────────────────────────────────────────────┘ │
│                                                               │
│  4. Export from index.ts                                     │
│     ┌──────────────────────────────────────────────────────┐ │
│     │ export { OrderService, Order } from './order'        │ │
│     └──────────────────────────────────────────────────────┘ │
│                                                               │
│  5. Use in Tests                                             │
│     ┌──────────────────────────────────────────────────────┐ │
│     │ const orders = await orderService.getOrders(token)   │ │
│     │ ResponseValidator.validateSuccessResponse(orders)    │ │
│     └──────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## API Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. TEST INITIATES REQUEST                                       │
│    const response = await loginService.login(email, password)   │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SERVICE PROCESSES                                            │
│    - Build payload {email, password}                            │
│    - Set headers (Content-Type, Auth)                           │
│    - Call methods.post(endpoint, payload, options)              │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. METHODS LAYER                                                │
│    - Validate inputs                                            │
│    - Add authentication headers if needed                       │
│    - Call executor.execute(config)                              │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. EXECUTOR HANDLES EXECUTION                                   │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ RETRY LOGIC (attempt 1/retryAttempts)                 │  │
│    │                                                         │  │
│    │ - Initialize context if needed                         │  │
│    │ - Record start time                                    │  │
│    │ - executeRequest() → HTTP call                         │  │
│    │ - parseResponse() → Extract body                       │  │
│    │ - Calculate duration                                   │  │
│    │ - Return ExecutionResponse                            │  │
│    │                                                         │  │
│    │ On Error (if retryable):                              │  │
│    │ - Delay (exponential backoff)                         │  │
│    │ - Retry (attempt 2, 3, etc)                           │  │
│    └─────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. RESPONSE RETURNED                                            │
│    ExecutionResponse<T> {                                       │
│      status: 200                                                │
│      statusText: 'OK'                                           │
│      headers: {...}                                             │
│      body: { token, userId, email, ... }                        │
│      ok: true                                                   │
│      duration: 142ms                                            │
│    }                                                            │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. VALIDATION IN TEST                                           │
│    - ResponseValidator.validateSuccessResponse(response)        │
│    - ResponseValidator.validateHasKey(response.body, 'token')   │
│    - ResponseValidator.validateExecutionTime(response.duration) │
│    - expect(response.body.token).toBeTruthy()                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Utils Organization

```
┌────────────────────────────────────────────────────────────────┐
│ UTILS                                                           │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│ │ WEB UTILS    │  │ API UTILS    │  │ COMMON UTILS │         │
│ ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│ │ Element      │  │ (legacy)     │  │ Assertion    │         │
│ │ Wait         │  │              │  │ Faker        │         │
│ │ FallbackLoc  │  │              │  │ Retry        │         │
│ │              │  │              │  │ Visual       │         │
│ │              │  │              │  │ TestData     │         │
│ └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                │
│ Usage:                                                        │
│   ElementUtils.click(locator)                                │
│   WaitUtils.waitForElementToBeVisible(page, locator)         │
│   FallbackLocator.findByRole(page, 'button', ['Submit'])     │
│   AssertionUtils.verifyVisible(locator)                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Module Dependencies

```
┌──────────────────────────────────────────────────────────────┐
│ TESTS                                                         │
│  ├─► config (configuration)                                 │
│  ├─► api (core, services)                                   │
│  ├─► utils (web, common)                                    │
│  └─► fixtures (custom fixtures)                             │
├──────────────────────────────────────────────────────────────┤
│ API MODULE                                                   │
│  ├─► api/core                                              │
│  │    └─► @playwright/test (request)                       │
│  ├─► api/services                                          │
│  │    └─► api/core                                         │
│  └─► api/index (re-exports)                                │
├──────────────────────────────────────────────────────────────┤
│ UTILS MODULE                                                 │
│  ├─► utils/web                                              │
│  │    └─► @playwright/test                                 │
│  ├─► utils/api                                              │
│  ├─► utils/common                                           │
│  │    └─► faker, dotenv, etc                               │
│  └─► utils/index                                            │
├──────────────────────────────────────────────────────────────┤
│ CONFIG MODULE                                                │
│  ├─► dotenv                                                 │
│  └─► environment variables                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Adding a New API Service

```
Step 1: Create Service File
─────────────────────────
📄 api/services/{service-name}.service.ts
   - Extend BaseApiService
   - Define endpoints object
   - Implement methods

Step 2: Export Service
──────────────────────
📄 api/services/index.ts
   - Add export statement

Step 3: Use in Tests
────────────────────
import { {Service}Service } from 'api';

const service = new {Service}Service(executor);
const result = await service.methodName(params);
```

---

## Testing Best Practices

### API Service Testing Pyramid

```
           ▲
          ╱ ╲
         ╱   ╲         Service Integration Tests
        ╱─────╲        └─ Full flow with services
       ╱       ╲
      ╱─────────╲       Method Level Tests
     ╱           ╲      └─ Individual method validation
    ╱─────────────╲
   ╱               ╲     Unit Tests
  ╱─────────────────╲    └─ Executor, validator, core
 ╱___________________╲
```

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { LoginService, ResponseValidator, ApiExecutor } from 'api';

test.describe('Login Service', () => {
  let executor: ApiExecutor;
  let service: LoginService;

  test.beforeEach(async () => {
    executor = new ApiExecutor({ baseUrl: API_URL });
    await executor.init();
    service = new LoginService(executor);
  });

  test.afterEach(async () => {
    await executor.close();
  });

  test('should login successfully', async () => {
    const response = await service.login(email, password);
    
    ResponseValidator.validateSuccessResponse(response);
    expect(response.body.token).toBeTruthy();
  });
});
```

---

## Performance Considerations

```
┌────────────────────────────────────────────────────────────────┐
│ API EXECUTOR FEATURES                                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ✓ Automatic Retry                                             │
│   - 3 attempts by default                                     │
│   - Exponential backoff: 1s, 2s, 4s                          │
│   - Only retries network errors                              │
│                                                                │
│ ✓ Timeout Management                                          │
│   - 30s default timeout                                       │
│   - Per-request override support                              │
│                                                                │
│ ✓ Duration Tracking                                           │
│   - Each response includes duration ms                        │
│   - Can validate against SLOs                                │
│                                                                │
│ ✓ Connection Pooling                                          │
│   - Reusable APIRequestContext                               │
│   - Single context per executor                              │
│   - Close() disposes of connections                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

