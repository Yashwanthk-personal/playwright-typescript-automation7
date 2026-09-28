# 🏗️ Framework Structure & Architecture Guide

**Complete technical documentation explaining the Demo WebShop Automation Framework structure, design patterns, and component relationships.**

---

## 📋 Table of Contents

1. [Framework Overview](#framework-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Directory Structure](#directory-structure)
5. [Component Responsibilities](#component-responsibilities)
6. [Data Flow & Component Interaction](#data-flow--component-interaction)
7. [Testing Layers](#testing-layers)
8. [Dependency Injection System](#dependency-injection-system)
9. [Configuration Management](#configuration-management)
10. [How to Extend the Framework](#how-to-extend-the-framework)
11. [Best Practices](#best-practices)

---

## Framework Overview

### Purpose
The Demo WebShop Automation Framework is a **production-ready, enterprise-grade** test automation solution built on:
- **Playwright** for cross-browser UI testing
- **Cucumber/BDD** for business-readable test scenarios
- **TypeScript** for type safety and maintainability
- **Service-Oriented Architecture** for API & UI test code reuse

### Key Capabilities
| Capability | Status | Location |
|-----------|--------|----------|
| UI Automation (Desktop) | ✅ Full | `tests/e2e/`, `pages/` |
| API Testing | ✅ Full | `tests/api/`, `api/services/` |
| BDD Scenarios | ✅ Full | `features/`, `steps/` |
| Mobile Testing | ✅ Supported | `pages/mobile/`, `tests/mobile/` |
| Multi-User Testing | ✅ Supported | `utils/common/multi-user-test.helper.ts` |
| Visual Testing | ✅ Supported | `utils/common/visual.testing.ts` |
| Test Reporting | ✅ Full | Playwright + Allure Reports |
| Local Mock API | ✅ Included | `api-server/` |

---

## Technology Stack

```
┌──────────────────────────────────────────┐
│  TESTING FRAMEWORKS & LIBRARIES          │
├──────────────────────────────────────────┤
│  • Playwright 1.40+     → UI Automation  │
│  • Cucumber/JS 9.0+     → BDD Tests      │
│  • TypeScript 5.0+      → Type Safety    │
│  • Node.js 18+          → Runtime        │
├──────────────────────────────────────────┤
│  UTILITIES & HELPERS                     │
├──────────────────────────────────────────┤
│  • Dotenv               → Config Mgmt    │
│  • Faker                → Test Data      │
│  • JSONWebToken (JWT)   → API Auth       │
│  • Express              → Mock Server    │
│  • Nodemon              → Dev Workflow   │
├──────────────────────────────────────────┤
│  REPORTING                               │
├──────────────────────────────────────────┤
│  • Allure Reporter      → Rich Reports   │
│  • HTML Reporter        → Native Reports │
│  • Video/Screenshot     → Evidence       │
└──────────────────────────────────────────┘
```

---

## Architecture & Design Patterns

### 1. **Layered Architecture**

```
┌─────────────────────────────────────────────┐
│  PRESENTATION LAYER (Test Code)             │
│  • UI Tests (tests/e2e/)                    │
│  • API Tests (tests/api/)                   │
│  • BDD Steps (steps/)                       │
│  • Mobile Tests (tests/mobile/)             │
├─────────────────────────────────────────────┤
│  ABSTRACTION LAYER (Page Objects & Service) │
│  • Page Objects (pages/)                    │
│  • Service Layer (api/services/)            │
│  • Fixtures (fixtures/)                     │
├─────────────────────────────────────────────┤
│  UTILITY LAYER                              │
│  • UI Utilities (utils/web/)                │
│  • API Utilities (utils/api/)               │
│  • Common Utilities (utils/common/)         │
│  • Mobile Utilities (utils/mobile/)         │
├─────────────────────────────────────────────┤
│  CORE LAYER                                 │
│  • Executor (api/core/executor.ts)          │
│  • HTTP Methods (api/core/methods.ts)       │
│  • Response Validators (api/core/validator) │
└─────────────────────────────────────────────┘
```

### 2. **Design Patterns Used**

#### ✅ **Page Object Model (POM)**
- Encapsulates UI elements and interactions
- Reduces duplication and maintenance effort
- Location: `pages/`

```typescript
// pages/login.page.ts
export class LoginPage extends BasePage {
  // Locators
  get emailField() { return this.page.locator('[data-testid="email"]'); }
  get submitButton() { return this.page.locator('button[type="submit"]'); }
  
  // Actions
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }
}
```

#### ✅ **Service-Oriented Architecture**
- Business logic separated from UI implementation
- Services can be used by UI tests, API tests, and BDD
- Location: `api/services/`

```typescript
// api/services/login.service.ts
export class LoginService extends BaseService {
  async login(email: string, password: string) {
    const response = await this.executor.post('/api/login', {
      email,
      password
    });
    return response.body;
  }
}
```

#### ✅ **Dependency Injection (DI)**
- Provides loosely-coupled, testable code
- Manages fixtures and test setup/teardown
- Location: `fixtures/`

```typescript
// In a test file
test('user can login', async ({ loginPage, loginAsValidUser }) => {
  await loginAsValidUser();  // Injected fixture
  await loginPage.verifyLoaded();
});
```

#### ✅ **Base Class Pattern**
- Shared functionality in base classes
- Reduces code duplication
- Easy to extend with common methods

```typescript
// pages/base.page.ts - Contains common methods like:
// - fillField()
// - clickElement()
// - waitForElement()
// - takeScreenshot()
// - handleAlerts()
```

#### ✅ **Executor/Generic Handler Pattern**
- Single point for all HTTP requests
- Centralized error handling and validation
- Location: `api/core/executor.ts`

```typescript
// Executor handles:
// - Request construction
// - Response validation
// - Error handling
// - Logging & tracing
// - Retry logic
```

#### ✅ **Test Data Strategy**
- Centralized test data in JSON files
- Faker for dynamic data generation
- Data loaders for easy access

```typescript
// testdata/users.json
{
  "validUser": { "email": "test@example.com", "password": "password123" }
}

// Usage in tests
const user = testDataLoader.loadUser('validUser');
```

---

## Directory Structure

### Root Level Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies & npm scripts |
| `playwright.config.ts` | Playwright configuration & browser settings |
| `cucumber.js` | Cucumber/BDD configuration |
| `tsconfig.json` | TypeScript compiler settings |
| `tsconfig.test.json` | TypeScript settings for tests |
| `.env.dev` | Development environment variables |
| `.env.api` | API environment variables |
| `.gitignore` | Git ignore rules |
| `README.md` | Project overview |
| `FRAMEWORK_COMPLETE_GUIDE.md` | Complete reference guide |
| `FRAMEWORK_STRUCTURE.md` | This file - architecture details |

### `/pages` - Page Object Models

**Purpose:** Encapsulates UI page interactions using the Page Object Pattern

```
pages/
├── base.page.ts              # Base class with common methods
├── login.page.ts             # Login page interactions
├── home.page.ts              # Home page interactions
├── cart.page.ts              # Cart page interactions
├── product.page.ts           # Product listing page
├── account.page.ts           # Account/profile page
├── mobile/                   # Mobile-specific pages
│   ├── base.mobile.page.ts
│   ├── login.mobile.page.ts
│   ├── home.mobile.page.ts
│   ├── checkout.mobile.page.ts
│   ├── components/           # Reusable mobile components
│   │   ├── header.component.ts
│   │   ├── footer.component.ts
│   │   ├── drawer.component.ts
│   │   └── index.ts
│   └── index.ts
└── utils/                    # Page-level utilities
    ├── element-locators.ts   # Common selectors
    ├── page-wait.utils.ts    # Page-specific waits
    └── index.ts
```

**Key Classes:**

**BasePage** - Foundation for all pages
```typescript
export class BasePage {
  constructor(public page: Page) {}
  
  async fillField(locator: string, value: string) { /* ... */ }
  async clickElement(locator: string) { /* ... */ }
  async verifyElementVisible(locator: string) { /* ... */ }
  async waitForPage() { /* ... */ }
  async captureScreenshot(name: string) { /* ... */ }
}
```

**Example Page Class:**
```typescript
export class LoginPage extends BasePage {
  // Locators as getters for reusability
  get emailInput() { return this.page.locator('[data-testid="email"]'); }
  get passwordInput() { return this.page.locator('[data-testid="password"]'); }
  get submitButton() { return this.page.locator('button[type="submit"]'); }
  
  // Methods encapsulating page interactions
  async login(email: string, password: string) {
    await this.fillField(this.emailInput, email);
    await this.fillField(this.passwordInput, password);
    await this.submitButton.click();
  }
}
```

---

### `/api` - API Layer

**Purpose:** Handles all API interactions with service-oriented architecture

```
api/
├── index.ts                  # Exports
├── core/                     # Core API functionality
│   ├── executor.ts           # Generic API request executor
│   ├── methods.ts            # HTTP methods (GET, POST, PUT, etc)
│   ├── validator.ts          # Response validation logic
│   └── index.ts
├── services/                 # Business logic services
│   ├── base.service.ts       # Base service class
│   ├── login.service.ts      # Authentication service
│   ├── cart.service.ts       # Shopping cart service
│   ├── product.service.ts    # Product service
│   ├── multi-user-api.manager.ts  # Multi-user API management
│   └── index.ts
└── utils/                    # API-specific utilities
    ├── request.builder.ts    # Build request objects
    ├── response.handler.ts   # Parse responses
    └── index.ts
```

**Key Components:**

**Executor** - Core API handler
```typescript
// Handles all HTTP requests with:
// - Automatic headers/auth
// - Request logging
// - Response validation
// - Error handling
// - Retry logic
// - Performance metrics

await executor.post('/api/login', payload);
await executor.get('/api/products', { filters });
await executor.put('/api/cart/items', updateData);
```

**Services** - Business logic layer
```typescript
// api/services/login.service.ts
export class LoginService extends BaseService {
  async login(email: string, password: string) {
    const response = await this.executor.post('/api/login', {
      email, password
    });
    // Service logic here (validation, transformation, etc)
    return response.body.token;
  }
  
  async logout() {
    await this.executor.post('/api/logout');
  }
}
```

**Usage Example:**
```typescript
// In tests
const loginService = new LoginService();
const token = await loginService.login('user@example.com', 'password');
```

---

### `/fixtures` - Dependency Injection

**Purpose:** Manages test setup, teardown, and dependency injection

```
fixtures/
├── fixtures-di.ts            # Main DI container & fixture definitions
├── api-fixtures.ts           # API-specific fixtures
├── mobile.fixtures.ts        # Mobile-specific fixtures
├── multi-user.fixtures.ts    # Multi-user test fixtures
├── service.container.ts      # Service locator pattern
├── test-fixtures.ts          # General test utilities
├── FIXTURES_GUIDE.md         # How to use fixtures
└── index.ts
```

**Key Fixtures Provided:**

| Fixture | Returns | Purpose |
|---------|---------|---------|
| `loginPage` | LoginPage | Login page object |
| `homePage` | HomePage | Home page object |
| `cartPage` | CartPage | Cart page object |
| `loginService` | LoginService | Login business logic |
| `loginAsValidUser` | Function | Pre-login fixture |
| `loginAsInvalidUser` | Function | Invalid login fixture |
| `context` | BrowserContext | Browser context |
| `page` | Page | Playwright page object |
| `testUser` | Object | Test user data |

**Usage in Tests:**
```typescript
test('user can add to cart', async ({ 
  loginAsValidUser,  // Fixture: Login before test
  cartPage,          // Fixture: Cart page object
  loginPage          // Fixture: Login page object
}) => {
  await loginAsValidUser();  // Runs login automatically
  
  await loginPage.verifyLoaded();
  await cartPage.addProduct('product-id');
  
  // Setup/teardown handled automatically
});
```

---

### `/utils` - Shared Utilities

**Purpose:** Reusable helper functions organized by domain

```
utils/
├── index.ts                  # Main exports
├── test-utils.ts             # General test utilities
├── web/                      # Web UI helpers
│   ├── element.utils.ts      # Click, fill, select, type
│   ├── wait.utils.ts         # Wait for visibility/presence
│   ├── fallback.locator.ts   # Multi-selector fallback
│   ├── form.utils.ts         # Form interactions
│   ├── table.utils.ts        # Table interactions
│   └── index.ts
├── api/                      # API-specific helpers
│   ├── request.utils.ts      # Build requests
│   ├── response.utils.ts     # Parse responses
│   ├── auth.utils.ts         # Auth helpers
│   └── index.ts
├── common/                   # Cross-cutting utilities
│   ├── assertion.utils.ts    # Assertions & validations
│   ├── faker.utils.ts        # Generate test data (names, emails, etc)
│   ├── retry.utils.ts        # Retry with exponential backoff
│   ├── visual.testing.ts     # Screenshot & visual testing
│   ├── test-data.loader.ts   # Load JSON test data
│   ├── user-context.manager.ts  # Manage user sessions
│   ├── multi-user-test.helper.ts # Multi-user utilities
│   ├── performance.utils.ts  # Performance metrics
│   ├── logger.ts             # Logging utility
│   └── index.ts
└── mobile/                   # Mobile-specific utilities
    ├── gesture.utils.ts      # Touch gestures
    ├── orientation.utils.ts  # Device rotation
    └── index.ts
```

**Example Utilities:**

**Element Utils** - Common element interactions
```typescript
// utils/web/element.utils.ts
export async function clickElement(page: Page, selector: string) {
  await page.click(selector);
}

export async function fillField(page: Page, selector: string, value: string) {
  await page.fill(selector, value);
}

export async function selectFromDropdown(page: Page, selector: string, value: string) {
  await page.selectOption(selector, value);
}
```

**Faker Utils** - Generate test data
```typescript
// utils/common/faker.utils.ts
export function generateEmail() {
  return `test_${Date.now()}@example.com`;
}

export function generatePassword() {
  return `Pass${Math.random().toString(36).substring(7)}@123`;
}

export function generateProductName() {
  return faker.commerce.productName();
}
```

**Test Data Loader** - Load test data from JSON
```typescript
// utils/common/test-data.loader.ts
export class TestDataLoader {
  loadUser(userType: string) {
    // Loads from testdata/users.json
  }
  
  loadProduct(productType: string) {
    // Loads from testdata/products.json
  }
}
```

---

### `/config` - Configuration Management

**Purpose:** Centralized configuration for environments, users, devices, and constants

```
config/
├── config.ts                 # Base configuration
├── user.ts                   # Test user configuration
├── device.ts                 # Device/browser configuration
├── constants/                # Constant values
│   ├── ui.constants.ts       # UI selectors & timeouts
│   ├── api.constants.ts      # API endpoints & headers
│   ├── error.constants.ts    # Error messages
│   └── index.ts
└── index.ts                  # Main exports
```

**Key Configuration Files:**

**config.ts** - Environment & application settings
```typescript
export const config = {
  baseURL: process.env.DEMOWEBSHOP_BASE_URL,
  apiBaseURL: process.env.API_BASE_URL,
  headless: process.env.HEADLESS !== 'false',
  timeout: 60000,
  retries: 3,
  workers: 1
};
```

**user.ts** - Test user credentials
```typescript
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!'
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'WrongPassword'
  }
};
```

**device.ts** - Device configurations for multi-device testing
```typescript
export const devices = {
  desktop: { ...devices['Desktop Chrome'] },
  mobile: { ...devices['Pixel 5'] },
  tablet: { ...devices['iPad Pro'] }
};
```

**Constants** - Static values used across framework
```typescript
// api.constants.ts
export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  PRODUCTS: '/api/products',
  CART: '/api/cart',
  CHECKOUT: '/api/checkout'
};

// ui.constants.ts
export const SELECTORS = {
  LOGIN_EMAIL: '[data-testid="email"]',
  LOGIN_PASSWORD: '[data-testid="password"]',
  LOGIN_SUBMIT: 'button[type="submit"]'
};

export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 30000,
  LONG: 60000
};
```

---

### `/tests` - Test Suites

**Purpose:** Contains all test implementations organized by type

```
tests/
├── e2e/                      # End-to-end UI tests
│   ├── login.spec.ts         # Login tests
│   ├── cart.spec.ts          # Cart tests
│   ├── checkout.spec.ts      # Checkout tests
│   ├── product-search.spec.ts # Search tests
│   └── *.spec.ts
├── api/                      # API tests
│   ├── auth.spec.ts          # Authentication API tests
│   ├── products.spec.ts      # Products API tests
│   ├── cart.spec.ts          # Cart API tests
│   └── *.spec.ts
├── mobile/                   # Mobile-specific tests
│   ├── login.mobile.spec.ts
│   ├── checkout.mobile.spec.ts
│   └── *.mobile.spec.ts
├── auth/                     # Authentication cache
│   └── auth.json             # Stored auth state
├── integration/              # Integration tests
│   └── *.spec.ts
└── performance/              # Performance tests
    └── *.spec.ts
```

**Test File Structure:**

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

test.describe('Login Tests', () => {
  let loginPage: LoginPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.goto('/login');
  });
  
  test('should login with valid credentials', async ({ page }) => {
    await loginPage.login('test@example.com', 'password123');
    expect(page.url()).toContain('/home');
  });
  
  test('should show error with invalid credentials', async () => {
    await loginPage.login('test@example.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
```

---

### `/features` - BDD Feature Files

**Purpose:** Business-readable test scenarios using Gherkin syntax

```
features/
├── ui/                       # UI scenarios
│   ├── login.feature         # Login scenarios
│   ├── cart.feature          # Shopping cart scenarios
│   ├── product_search.feature # Search scenarios
│   ├── checkout.feature      # Checkout scenarios
│   └── *.feature
└── api/                      # API scenarios
    ├── auth.feature          # API authentication
    ├── products.feature      # API product endpoints
    ├── cart.feature          # API cart endpoints
    └── *.feature
```

**Feature File Example:**

```gherkin
# features/ui/login.feature
Feature: User Login Functionality

  Background:
    Given user navigates to login page

  Scenario: Successful login with valid credentials
    When user enters email "test@example.com"
    And user enters password "password123"
    And user clicks login button
    Then user should see home page
    And user profile should show "Test User"

  Scenario: Failed login with invalid credentials
    When user enters email "test@example.com"
    And user enters password "wrongpassword"
    And user clicks login button
    Then error message should be displayed
    And user should remain on login page
```

---

### `/steps` - BDD Step Definitions

**Purpose:** Maps Gherkin steps to code implementation

```
steps/
├── hooks.ts                  # Before/After hooks
├── ui/                       # UI step definitions
│   ├── common.steps.ts       # Common steps (Given, Then)
│   ├── login.steps.ts        # Login-specific steps
│   ├── cart.steps.ts         # Cart-specific steps
│   ├── product.steps.ts      # Product-specific steps
│   ├── checkout.steps.ts     # Checkout-specific steps
│   └── *.steps.ts
└── api/                      # API step definitions
    ├── auth.steps.ts         # Auth API steps
    ├── products.steps.ts     # Products API steps
    ├── cart.steps.ts         # Cart API steps
    └── *.steps.ts
```

**Step Definition Example:**

```typescript
// steps/ui/login.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { LoginPage } from '../../pages/login.page';

let loginPage: LoginPage;

Given('user navigates to login page', async function() {
  loginPage = new LoginPage(this.context.page);
  await loginPage.page.goto('/login');
});

When('user enters email {string}', async function(email: string) {
  await loginPage.fillEmail(email);
});

When('user clicks login button', async function() {
  await loginPage.clickSubmit();
});

Then('user should see home page', async function() {
  expect(this.context.page.url()).toContain('/home');
});
```

---

### `/testdata` - Test Data Management

**Purpose:** Centralized test data in JSON and TypeScript formats

```
testdata/
├── users.json                # Test user credentials
├── products.json             # Product test data
├── cart.json                 # Cart scenarios data
├── api.json                  # API endpoint test data
├── api-login.data.ts         # API login data (TypeScript)
├── common.data.ts            # Common test data
├── TEST_DATA_GUIDE.md        # How to use test data
└── QUICK_REFERENCE.md        # Quick reference
```

**Test Data Examples:**

**JSON Format:**
```json
// testdata/users.json
{
  "validUser": {
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  },
  "adminUser": {
    "email": "admin@example.com",
    "password": "AdminPass123!",
    "role": "admin"
  }
}
```

**TypeScript Format:**
```typescript
// testdata/api-login.data.ts
export const apiLoginData = {
  validCredentials: {
    email: 'test@example.com',
    password: 'TestPassword123!'
  },
  invalidCredentials: {
    email: 'wrong@example.com',
    password: 'WrongPassword'
  }
};
```

---

### `/api-server` - Local Mock API

**Purpose:** Express.js server for testing without external dependencies

```
api-server/
├── server.ts                 # Express server setup
├── routes/                   # API route handlers
│   ├── auth.routes.ts
│   ├── products.routes.ts
│   ├── cart.routes.ts
│   └── *.routes.ts
├── middleware/               # Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── logging.middleware.ts
├── models/                   # Data models
│   ├── user.model.ts
│   ├── product.model.ts
│   └── cart.model.ts
├── controllers/              # Business logic
│   ├── auth.controller.ts
│   ├── products.controller.ts
│   └── cart.controller.ts
└── README.md                 # Server documentation
```

**Starting the Mock API:**
```bash
# Terminal 1
npm run api:start

# Terminal 2
npm run test
```

---

### `/docs` - Documentation

**Purpose:** Additional guides and references

```
docs/
├── QUICK_START.md            # 5-minute quick start
├── FRAMEWORK_ARCHITECTURE.md # High-level architecture
├── FRAMEWORK_STRUCTURE.md    # This file - detailed structure
├── API_REFERENCE.md          # API methods & endpoints
├── ADVANCED_TESTING_GUIDE.md # Advanced patterns
├── MOBILE_TESTING_GUIDE.md   # Mobile-specific guide
├── MULTI_USER_TESTING.md     # Multi-user scenarios
├── TEST_DATA_GUIDE.md        # Test data strategies
├── TROUBLESHOOTING_FAQ.md    # Common issues & fixes
├── PERFORMANCE_TUNING.md     # Optimization tips
└── CONTRIBUTING.md           # Contributing guidelines
```

---

## Component Responsibilities

### Clear Separation of Concerns

```
┌─────────────────────────────────────────────────────┐
│ TESTS (e2e, api, mobile)                            │
│ • Execute test scenarios                            │
│ • Assert expected results                           │
│ ❌ Should NOT contain: UI selectors, business logic │
└─────────────────────────────────────────────────────┘
           ↓ Uses ↓
┌─────────────────────────────────────────────────────┐
│ PAGE OBJECTS (pages/)                               │
│ • Encapsulate UI interactions                       │
│ • Hold UI selectors                                 │
│ • Provide high-level methods                        │
│ ❌ Should NOT contain: business logic, assertions   │
└─────────────────────────────────────────────────────┘
           ↓ Uses ↓
┌─────────────────────────────────────────────────────┐
│ SERVICES (api/services/)                            │
│ • Implement business logic                          │
│ • Coordinate multiple operations                    │
│ • Transform data                                    │
│ ❌ Should NOT contain: UI code, assertions          │
└─────────────────────────────────────────────────────┘
           ↓ Uses ↓
┌─────────────────────────────────────────────────────┐
│ UTILITIES (utils/)                                  │
│ • Provide reusable helper functions                 │
│ • No state management                               │
│ • Pure, composable functions                        │
└─────────────────────────────────────────────────────┘
           ↓ Uses ↓
┌─────────────────────────────────────────────────────┐
│ CORE (api/core/)                                    │
│ • Generic request handling                          │
│ • HTTP method implementations                       │
│ • Response validation                               │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow & Component Interaction

### Example: Login Flow

```
User Test
  │
  ├─> Fixture: loginAsValidUser()
  │     │
  │     ├─> LoginService.login(email, password)
  │     │     │
  │     │     ├─> Executor.post('/api/login', credentials)
  │     │     │     │
  │     │     │     ├─> RequestBuilder.build(request)
  │     │     │     ├─> HTTPClient.post(request)
  │     │     │     ├─> ResponseValidator.validate(response)
  │     │     │     └─> ResponseHandler.parse(response)
  │     │     │
  │     │     └─> Return: { token, user }
  │     │
  │     └─> Store auth state
  │
  └─> Test continues with authenticated context
```

### Data Flow: Add to Cart

```
UI Test
  │
  ├─> LoginPage.login(email, password)
  │     └─> Page interactions via Playwright
  │
  ├─> HomePage.navigateToProduct('product-id')
  │     └─> Page interactions via Playwright
  │
├─> CartPage.addToCart()
  │     │
  │     ├─> API Call via CartService.addItem(itemId)
  │     │     │
  │     │     └─> Executor.post('/api/cart/add', payload)
  │     │
  │     └─> Verify UI updates
  │
└─> Assert: Product visible in cart
```

---

## Testing Layers

### Layer 1: Unit Tests (Utilities & Services)

**Purpose:** Test individual functions in isolation

```typescript
// tests/utils/faker.utils.spec.ts
import { generateEmail, generatePassword } from '../../utils/common/faker.utils';

test('generateEmail should create valid email', () => {
  const email = generateEmail();
  expect(email).toMatch(/^test_\d+@example\.com$/);
});
```

**Coverage:** Utilities, helpers, service methods

---

### Layer 2: API Tests

**Purpose:** Test API endpoints independently

```typescript
// tests/api/auth.spec.ts
import { LoginService } from '../../api/services/login.service';

test('login should return token', async () => {
  const service = new LoginService();
  const response = await service.login('test@example.com', 'password123');
  
  expect(response.token).toBeDefined();
  expect(response.user.email).toBe('test@example.com');
});
```

**Coverage:** API endpoints, services, response handling

---

### Layer 3: Component Tests (Page Objects)

**Purpose:** Test UI page interactions

```typescript
// tests/e2e/login.spec.ts
import { LoginPage } from '../../pages/login.page';

test('login form should display all elements', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/login');
  
  await expect(loginPage.emailField).toBeVisible();
  await expect(loginPage.passwordField).toBeVisible();
  await expect(loginPage.submitButton).toBeVisible();
});
```

**Coverage:** Page visibility, element presence, basic interactions

---

### Layer 4: Integration Tests (E2E)

**Purpose:** Test complete user workflows

```typescript
// tests/e2e/complete-checkout.spec.ts
test('user can complete checkout', async ({ loginAsValidUser, cartPage, checkoutPage }) => {
  await loginAsValidUser();
  await cartPage.addProduct('product-1');
  await cartPage.proceedToCheckout();
  await checkoutPage.fillShippingInfo({...});
  await checkoutPage.completeOrder();
  
  expect(page.url()).toContain('/order-confirmation');
});
```

**Coverage:** Complete user journeys, multiple pages, business scenarios

---

### Layer 5: BDD Tests

**Purpose:** Business-readable scenarios in Gherkin

```gherkin
Feature: Complete Checkout Flow
  
  Scenario: Customer can complete purchase
    Given user is logged in
    When user adds product to cart
    And user proceeds to checkout
    And user fills shipping details
    And user completes payment
    Then user should see order confirmation
    And order should be in user's order history
```

**Coverage:** Business requirements, end-to-end scenarios

---

## Dependency Injection System

### How DI Works

```typescript
// fixtures/fixtures-di.ts
export const fixtures = {
  // Page fixtures
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  
  // Service fixtures
  loginService: async ({}, use) => {
    const service = new LoginService();
    await use(service);
  },
  
  // Setup fixtures
  loginAsValidUser: async ({ page, loginService }, use) => {
    const login = async () => {
      const response = await loginService.login(
        'test@example.com',
        'password123'
      );
      await page.context().addCookies([{
        name: 'auth_token',
        value: response.token,
        url: process.env.DEMOWEBSHOP_BASE_URL
      }]);
    };
    await use(login);
  }
};
```

### Using Fixtures in Tests

```typescript
test('example test', async ({ 
  page,                    // Built-in Playwright fixture
  loginPage,               // Custom page fixture
  loginService,            // Custom service fixture
  loginAsValidUser         // Custom setup fixture
}) => {
  // Fixtures are auto-injected
  await loginAsValidUser();  // Runs setup
  await loginPage.verifyLoaded();
});
```

### Fixture Lifecycle

```
Test Start
  │
  ├─> Setup: Create fixture instances
  │     ├─> loginService = new LoginService()
  │     ├─> loginPage = new LoginPage(page)
  │     └─> loginAsValidUser() setup runs
  │
  ├─> Test Body: Use fixtures
  │     └─> await loginPage.login(...)
  │
  ├─> Test End
  │
  └─> Teardown: Clean up fixtures
        └─> Context cleanup, auth state reset
```

---

## Configuration Management

### Environment Variables

**Development (.env.dev):**
```env
DEMOWEBSHOP_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001
HEADLESS=true
TEST_ENV=dev
LOG_LEVEL=info
```

**API Server (.env.api):**
```env
API_PORT=3001
API_HOST=localhost
API_LOG_LEVEL=debug
ENABLE_MOCK_DATA=true
```

### Loading Configuration

```typescript
// config/config.ts
import * as dotenv from 'dotenv';

const env = process.env.TEST_ENV || 'dev';
dotenv.config({ path: `.env.${env}` });

export const config = {
  baseURL: process.env.DEMOWEBSHOP_BASE_URL,
  apiBaseURL: process.env.API_BASE_URL,
  headless: process.env.HEADLESS !== 'false',
  logLevel: process.env.LOG_LEVEL || 'info'
};
```

### Using Configuration

```typescript
// In page objects
export class LoginPage extends BasePage {
  async navigate() {
    await this.page.goto(`${config.baseURL}/login`);
  }
}

// In services
export class LoginService extends BaseService {
  async login(email: string, password: string) {
    return this.executor.post(`${config.apiBaseURL}/api/login`, {...});
  }
}
```

---

## How to Extend the Framework

### Adding a New Page Object

```typescript
// pages/new-page.page.ts
import { BasePage } from './base.page';
import { Page } from '@playwright/test';

export class NewPage extends BasePage {
  // 1. Define locators
  get pageHeader() {
    return this.page.locator('h1');
  }
  
  get actionButton() {
    return this.page.locator('button.action');
  }
  
  // 2. Define interactions
  async performAction() {
    await this.actionButton.click();
    await this.waitForElement('div.success');
  }
  
  // 3. Define validations
  async verifyPageLoaded() {
    await this.verifyElementVisible(this.pageHeader);
    await expect(this.pageHeader).toHaveText('Expected Title');
  }
}
```

### Adding a New Service

```typescript
// api/services/new.service.ts
import { BaseService } from './base.service';

export class NewService extends BaseService {
  async performOperation(data: any) {
    // Implement business logic
    const response = await this.executor.post('/api/endpoint', data);
    
    // Transform/validate response
    return this.transformResponse(response);
  }
  
  private transformResponse(response: any) {
    // Transform logic here
    return response;
  }
}
```

### Adding a New Test

```typescript
// tests/e2e/new-feature.spec.ts
import { test, expect } from '@playwright/test';
import { NewPage } from '../../pages/new-page.page';

test.describe('New Feature Tests', () => {
  test('should perform action', async ({ page, newPage }) => {
    await newPage.verifyPageLoaded();
    await newPage.performAction();
    
    // Assertions
    expect(page.url()).toContain('expected-url');
  });
});
```

### Adding a New Fixture

```typescript
// fixtures/fixtures-di.ts - Add to defineConfig().use
export const newFixture = async ({ page }, use) => {
  const setupData = await performSetup(page);
  await use(setupData);
  // Cleanup
};

// Usage in tests
test('with new fixture', async ({ newFixture }) => {
  // Use fixture
});
```

### Adding a New Utility

```typescript
// utils/web/new.utils.ts
import { Page } from '@playwright/test';

export async function newHelperFunction(page: Page, ...args: any[]) {
  // Implementation
  return result;
}

export const newUtilityObject = {
  method1: async (page: Page) => { /* ... */ },
  method2: async (page: Page) => { /* ... */ }
};
```

### Adding a New BDD Scenario

```gherkin
# features/ui/new-feature.feature
Feature: New Feature Name
  
  Scenario: Describe what should happen
    Given some precondition
    When user performs action
    Then expected result should occur
```

```typescript
// steps/ui/new-feature.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';

Given('some precondition', async function() {
  // Setup code
});

When('user performs action', async function() {
  // Action code
});

Then('expected result should occur', async function() {
  // Assertion code
});
```

---

## Best Practices

### ✅ DO's

1. **Use Page Objects for UI Code**
   ```typescript
   ✅ GOOD: await loginPage.login(email, password);
   ❌ BAD: await page.fill('[data-testid="email"]', email);
   ```

2. **Keep Services Business Logic**
   ```typescript
   ✅ GOOD: const user = await userService.registerUser(userData);
   ❌ BAD: userService.page.fill('...');
   ```

3. **Utilize Fixtures for Setup**
   ```typescript
   ✅ GOOD: test('test', async ({ loginAsValidUser }) => { ... });
   ❌ BAD: test('test', async ({ page }) => { 
             await page.goto('/login');
             // Manual setup
           });
   ```

4. **Use Constants for Selectors**
   ```typescript
   ✅ GOOD: this.page.locator(SELECTORS.LOGIN_BUTTON);
   ❌ BAD: this.page.locator('button.login-btn.primary.md');
   ```

5. **Centralize Test Data**
   ```typescript
   ✅ GOOD: const user = testDataLoader.loadUser('validUser');
   ❌ BAD: const user = { email: 'test@example.com', ... };
   ```

6. **Use Utilities for Common Operations**
   ```typescript
   ✅ GOOD: await waitForElement(page, selector, 5000);
   ❌ BAD: await page.waitForSelector(selector);
           // Repeated in multiple places
   ```

7. **Organize Tests by Feature**
   ```typescript
   ✅ GOOD: tests/e2e/login.spec.ts, tests/e2e/cart.spec.ts
   ❌ BAD: tests/all-tests.spec.ts
   ```

8. **Use Meaningful Test Names**
   ```typescript
   ✅ GOOD: test('user can add product to cart');
   ❌ BAD: test('test 1');
   ```

### ❌ DON'Ts

1. **Don't Put Assertions in Page Objects**
   ```typescript
   ❌ BAD:
   export class LoginPage {
     async login() {
       await this.submitButton.click();
       expect(this.page.url()).toContain('/home');  // ❌ Assertion
     }
   }
   
   ✅ GOOD:
   export class LoginPage {
     async login() {
       await this.submitButton.click();
     }
     async verifySuccessfulLogin() {
       return this.page.url();  // Return for assertion in test
     }
   }
   ```

2. **Don't Hardcode Values**
   ```typescript
   ❌ BAD: await loginPage.login('hardcoded@email.com', 'pass123');
   ✅ GOOD: await loginPage.login(testUser.email, testUser.password);
   ```

3. **Don't Mix Concerns**
   ```typescript
   ❌ BAD:
   export class UserService {
     async loginAndNavigate(email, password) {
       // API logic
       const token = await this.apiCall('/login', {...});
       // UI logic
       await page.goto('/home');  // ❌ Mixing
     }
   }
   ```

4. **Don't Skip Error Handling**
   ```typescript
   ❌ BAD: const response = await fetch(url);
   ✅ GOOD: try {
             const response = await fetch(url);
             if (!response.ok) throw new Error(...);
           } catch (error) {
             logger.error(error);
           }
   ```

5. **Don't Create Large Test Files**
   ```typescript
   ❌ BAD: tests/all-tests.spec.ts (5000+ lines)
   ✅ GOOD: tests/login.spec.ts, tests/cart.spec.ts, ...
   ```

6. **Don't Use Hard Waits**
   ```typescript
   ❌ BAD: await page.waitForTimeout(5000);
   ✅ GOOD: await page.waitForSelector('[data-testid="element"]');
   ```

---

## Quick Reference: Key Files & Their Purpose

| File/Folder | Purpose | When to Modify |
|-------------|---------|----------------|
| `pages/` | Page Object Models | Add new page interactions |
| `api/services/` | Business logic | Add new API/business operations |
| `tests/` | Test implementations | Write new tests |
| `fixtures/` | Test setup/teardown | Add new fixtures or setup |
| `utils/` | Helper functions | Add common utilities |
| `config/` | Configuration | Change settings/constants |
| `features/` | BDD scenarios | Add new business scenarios |
| `steps/` | BDD implementations | Implement BDD steps |
| `testdata/` | Test data | Add new test data sets |
| `api-server/` | Mock API | Modify mock endpoints |
| `playwright.config.ts` | Browser config | Change browser settings |
| `cucumber.js` | BDD config | Change BDD settings |

---

## Conclusion

This framework provides a **scalable, maintainable, and professional** test automation solution with:

- ✅ Clear separation of concerns
- ✅ Reusable components across UI, API, and BDD testing
- ✅ Centralized configuration and test data
- ✅ Powerful dependency injection system
- ✅ Comprehensive utilities and helpers
- ✅ Professional reporting with Allure
- ✅ Mobile and multi-user testing support
- ✅ Local mock API for independent testing

**Next Steps:**
1. Read [FRAMEWORK_COMPLETE_GUIDE.md](FRAMEWORK_COMPLETE_GUIDE.md) for detailed command reference
2. Check [QUICK_START.md](README.md#quick-start-2-minutes) to start running tests
3. Explore individual component documentation in `/docs` folder
4. Start writing tests following the patterns documented here

---

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Maintained By:** QA Team
