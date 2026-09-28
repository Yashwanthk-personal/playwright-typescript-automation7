# Framework Structure Guide

## Overview

This document describes the reorganized framework structure for the demo-webshop-automation project. The framework follows a clean, modular architecture supporting both UI and API testing.

---

## Directory Structure

```
demo-webshop-automation/
├── api/
│   ├── core/                      # Core API functionality
│   │   ├── executor.ts            # API Execution Engine - Generic API call executor
│   │   ├── methods.ts             # HTTP Methods - GET, POST, PUT, PATCH, DELETE, HEAD
│   │   ├── validator.ts           # Response Validators - Status, headers, body validation
│   │   └── index.ts               # Core module exports
│   │
│   ├── services/                  # API Services - Business logic layer
│   │   ├── base.service.ts        # Base service for common operations
│   │   ├── login.service.ts       # Authentication operations
│   │   ├── cart.service.ts        # Shopping cart operations
│   │   └── index.ts               # Services module exports
│   │
│   ├── clients/                   # API Clients (deprecated - use executor instead)
│   │
│   └── index.ts                   # API module exports
│
├── utils/
│   ├── web/                       # Web UI utilities
│   │   ├── element.utils.ts       # Element interaction utilities
│   │   ├── wait.utils.ts          # Wait/visibility utilities
│   │   ├── fallback.locator.ts    # Multiple selector fallback strategies
│   │   └── index.ts               # Web utilities exports
│   │
│   ├── api/                       # API utilities
│   │   ├── (legacy files here)
│   │   └── index.ts               # API utilities exports
│   │
│   ├── common/                    # Common utilities
│   │   ├── assertion.utils.ts     # Assertion helpers
│   │   ├── faker.utils.ts         # Fake data generation
│   │   ├── retry.utils.ts         # Retry logic
│   │   ├── visual.testing.ts      # Visual testing utilities
│   │   ├── test-data.loader.ts    # Test data loading
│   │   └── index.ts               # Common utilities exports
│   │
│   └── index.ts                   # Main utils exports
│
├── api-server/                    # Local API server for testing
│   ├── server.ts                  # Express server implementation
│   └── README.md                  # API server documentation
│
├── config/                        # Configuration
│   ├── config.ts                  # Environment configuration
│   └── user.ts                    # User configuration
│
├── pages/                         # Page Object Models (UI testing)
├── steps/                         # Step definitions (BDD)
├── tests/                         # Direct Playwright tests
├── features/                      # Feature files (BDD)
├── fixtures/                      # Custom fixtures
├── testdata/                      # Test data
│
└── package.json
```

---

## Core Components

### 1. API Core (`api/core/`)

**Executor** (`executor.ts`)
- Generic API execution engine
- Handles all HTTP methods
- Includes retry logic with exponential backoff
- Generic error handling

```typescript
import { ApiExecutor } from 'api/core';

const executor = new ApiExecutor({
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  retryAttempts: 3,
});

await executor.init();
const response = await executor.execute({
  endpoint: '/api/auth/login',
  method: 'POST',
  data: { email: 'user@example.com', password: 'password' }
});
await executor.close();
```

**Methods** (`methods.ts`)
- Typed HTTP method wrappers
- GET, POST, PUT, PATCH, DELETE, HEAD

```typescript
import { ApiMethods, ApiExecutor } from 'api/core';

const executor = new ApiExecutor({ baseUrl: 'http://api.example.com' });
const methods = new ApiMethods(executor);

const response = await methods.post('/users', { name: 'John' });
const users = await methods.get('/users');
```

**Validator** (`validator.ts`)
- Response validation utilities
- Status code, headers, body, JSON schema validation
- Execution time validation

```typescript
import { ResponseValidator } from 'api/core';

ResponseValidator.validateStatus(response.status, 200);
ResponseValidator.validateSuccess(response.status);
ResponseValidator.validateHasKey(response.body, 'email');
ResponseValidator.validateExecutionTime(response.duration, 5000);
```

### 2. API Services (`api/services/`)

**Base Service** (`base.service.ts`)
- Common service functionality
- Auth header helpers
- JSON header helpers

**Login Service** (`login.service.ts`)
- Login, register, logout operations
- Token verification and refresh
- Used across all tests

```typescript
import { LoginService, ApiExecutor } from 'api';

const executor = new ApiExecutor({ baseUrl: API_URL });
const loginService = new LoginService(executor);

const response = await loginService.login('user@example.com', 'password');
const token = response.body.token;
```

**Cart Service** (`cart.service.ts`)
- Shopping cart operations
- Add/remove items, checkout
- Extensible for other services

### 3. Utils Web (`utils/web/`)

Web UI testing utilities.

- **element.utils.ts** - Click, type, check, visibility
- **wait.utils.ts** - Wait for elements, page load
- **fallback.locator.ts** - Multiple selector strategies with fallback

### 4. Utils Common (`utils/common/`)

Shared testing utilities.

- **assertion.utils.ts** - Playwright assertions
- **faker.utils.ts** - Fake data generation
- **retry.utils.ts** - Retry logic
- **visual.testing.ts** - Visual testing
- **test-data.loader.ts** - Load test data

---

## Usage Examples

### Example 1: API Test with New Structure

```typescript
import { test, expect } from '@playwright/test';
import { ApiExecutor, ApiMethods, ResponseValidator, LoginService } from 'api';
import { API_BASE_URL } from 'config/config';

test('Login test', async () => {
  const executor = new ApiExecutor({ baseUrl: API_BASE_URL });
  await executor.init();

  const loginService = new LoginService(executor);
  const response = await loginService.login('testuser@example.com', 'password123');

  ResponseValidator.validateSuccessResponse(response);
  expect(response.body.token).toBeDefined();

  await executor.close();
});
```

### Example 2: BDD Test with Service

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { LoginService, ApiExecutor } from 'api';
import { API_BASE_URL } from 'config/config';

let executor: ApiExecutor;
let loginService: LoginService;
let loginResponse: any;

Given('API client is initialized', async function () {
  executor = new ApiExecutor({ baseUrl: API_BASE_URL });
  await executor.init();
  loginService = new LoginService(executor);
});

When('I send login request with valid credentials', async function () {
  loginResponse = await loginService.login(
    'testuser@example.com',
    'password123'
  );
});

Then('API response status should be 200', async function () {
  ResponseValidator.validateStatus(loginResponse.status, 200);
});
```

### Example 3: UI Test with Web Utils

```typescript
import { test } from '@playwright/test';
import { ElementUtils, WaitUtils, FallbackLocator } from 'utils/web';

test('Login UI test', async ({ page }) => {
  await page.goto('http://demowebshop.com');

  // Using ElementUtils
  const emailInput = page.locator('#Email');
  await ElementUtils.type(emailInput, 'user@example.com');

  // Using FallbackLocator for resilient selectors
  const loginBtn = await FallbackLocator.findByRole(page, 'button', ['Login', 'Sign In']);
  if (loginBtn) {
    await loginBtn.click();
  }

  // Using WaitUtils
  await WaitUtils.waitForPageLoad(page);
});
```

---

## API Execution Flow

```
┌─────────────────────────────────────────┐
│          Test Code                      │
├─────────────────────────────────────────┤
│  LoginService                           │
│  ├─ login(email, password)              │
│  └─ calls methods.post()                │
├─────────────────────────────────────────┤
│  ApiMethods                             │
│  ├─ post(endpoint, data, options)       │
│  └─ calls executor.execute()            │
├─────────────────────────────────────────┤
│  ApiExecutor                            │
│  ├─ execute(config)                     │
│  ├─ Retry logic (if needed)             │
│  ├─ executeRequest()                    │
│  └─ parseResponse()                     │
├─────────────────────────────────────────┤
│  Response                               │
│  ├─ status, headers, body, ok, duration │
│  └─ Back to Service                     │
├─────────────────────────────────────────┤
│  ResponseValidator                      │
│  ├─ validateSuccessResponse()           │
│  ├─ validateStatus()                    │
│  └─ Custom assertions                   │
└─────────────────────────────────────────┘
```

---

## Migration Guide

### Updating Imports

**Old (Deprecated):**
```typescript
import { ApiClient } from '../utils/api.client';
import { ApiLoginService } from '../utils/api.login.service';
import { ResponseValidator } from '../utils/api.validation';
```

**New (Recommended):**
```typescript
import { ApiExecutor, LoginService, ResponseValidator } from 'api';
import { ApiExecutor, ApiMethods, ResponseValidator } from 'api/core';
```

### Updating Service Usage

**Old:**
```typescript
const apiClient = new ApiClient(APP_BASE_URL);
await apiClient.init();
const loginService = new ApiLoginService(apiClient);
const response = await loginService.login(email, password);
```

**New:**
```typescript
const executor = new ApiExecutor({ baseUrl: API_URL });
await executor.init();
const loginService = new LoginService(executor);
const response = await loginService.login(email, password);
await executor.close();
```

---

## Benefits of New Structure

1. **Clean Separation** - Core logic, services, and utilities are well-organized
2. **Reusability** - Services can be reused across tests without duplication
3. **Extensibility** - Easy to add new services (OrderService, ProductService, etc.)
4. **Generic Executor** - Can be used for any API without service wrapper
5. **Type Safety** - Full TypeScript support across all modules
6. **Maintenance** - Clear, modular code is easier to maintain
7. **Testing** - Services are easily mockable and testable
8. **Documentation** - Self-documenting code structure

---

## Adding New Services

### Step 1: Create Service Class

```typescript
// api/services/product.service.ts
import { BaseApiService } from './base.service';
import { ApiExecutor, ExecutionResponse } from '../core';

export interface Product {
  id: string;
  name: string;
  price: number;
}

export class ProductService extends BaseApiService {
  private endpoints = {
    getProducts: '/api/products',
    getProduct: '/api/products/:id',
    createProduct: '/api/products',
    updateProduct: '/api/products/:id',
    deleteProduct: '/api/products/:id',
  };

  constructor(executor: ApiExecutor) {
    super(executor);
  }

  async getProducts(): Promise<ExecutionResponse<Product[]>> {
    return this.methods.get<Product[]>(this.endpoints.getProducts);
  }

  async getProduct(id: string): Promise<ExecutionResponse<Product>> {
    const endpoint = this.endpoints.getProduct.replace(':id', id);
    return this.methods.get<Product>(endpoint);
  }

  // Add other methods...
}
```

### Step 2: Export from Services Index

```typescript
// api/services/index.ts
export { ProductService, Product } from './product.service';
```

### Step 3: Use in Tests

```typescript
const executor = new ApiExecutor({ baseUrl: API_URL });
const productService = new ProductService(executor);
const products = await productService.getProducts();
```

---

## Next Steps

1. Update all test files to use new structure
2. Remove deprecated files from utils/
3. Update documentation for specific services
4. Add unit tests for executor and validator
5. Create service-specific test suites
