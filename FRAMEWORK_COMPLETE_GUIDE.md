# 📘 Demo WebShop Automation Framework - Complete Guide

**One-stop reference for the entire Playwright + Cucumber BDD automation framework**

---

## 🚀 Quick Start (5 minutes)

```bash
# Install dependencies
npm install

# Start API server (in separate terminal)
npm run api:start

# Run all tests
npm run test                          # Playwright UI tests
npm run bdd                           # Cucumber BDD tests

# Run specific tests
npm run bdd:login                     # Login feature only
npm run bdd:cart                      # Cart feature only
npm run bdd:api                       # API tests only

# Reports
npm run bdd:report                    # Cucumber + Allure report
npm run test:report                   # Playwright report
```

---

## 📊 What's Included

| Component | Coverage | Status |
|-----------|----------|---------|
| **UI Tests** | Login, Cart, Products, Account | ✅ 105+ tests |
| **API Tests** | Auth, Products, Cart | ✅ Full coverage |
| **BDD** | 5 Cucumber scenarios | ✅ Ready |
| **Reports** | Allure + Playwright | ✅ Configured |
| **Mobile Testing** | iOS/Android | ✅ Supported |
| **Multi-User** | Concurrent testing | ✅ Implemented |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│          TEST LAYER (Behavior)              │
├─────────────────────────────────────────────┤
│  • UI Tests (tests/)                        │
│  • API Tests (tests/)                       │
│  • BDD Scenarios (features/, steps/)        │
├─────────────────────────────────────────────┤
│       PAGE OBJECT MODELS (pages/)           │
│  • LoginPage, HomePage, CartPage, etc.      │
├─────────────────────────────────────────────┤
│         SERVICE LAYER (api/services/)       │
│  • LoginService, CartService, etc.          │
├─────────────────────────────────────────────┤
│          CORE EXECUTION (api/core/)         │
│  • Generic Executor, HTTP Methods           │
├─────────────────────────────────────────────┤
│    UTILITIES (utils/)                       │
│  • Web utils, API utils, Common utils       │
└─────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
demo-webshop-automation/
│
├── 📂 pages/                        # Page Object Models
│   ├── base.page.ts                 # Base page with common methods
│   ├── login.page.ts
│   ├── home.page.ts
│   ├── cart.page.ts
│   ├── product.page.ts
│   ├── account.page.ts
│   ├── utils/                       # Page-specific utilities
│   │   └── *.ts
│   └── mobile/                      # Mobile-specific pages
│       ├── base.mobile.page.ts
│       ├── login.mobile.page.ts
│       ├── home.mobile.page.ts
│       ├── checkout.mobile.page.ts
│       ├── components/              # Mobile components (header, footer, etc)
│       └── index.ts
│
├── 📂 api/                          # API layer
│   ├── core/                        # Core API functionality
│   │   ├── executor.ts              # Generic API executor (main)
│   │   ├── methods.ts               # HTTP methods (GET, POST, PUT, etc)
│   │   ├── validator.ts             # Response validators
│   │   └── index.ts
│   ├── services/                    # Business logic layer
│   │   ├── base.service.ts          # Base service
│   │   ├── login.service.ts         # Auth operations
│   │   ├── cart.service.ts          # Cart operations
│   │   ├── multi-user-api.manager.ts # Multi-user API management
│   │   └── index.ts
│   └── utils/                       # API utilities
│       └── *.ts
│
├── 📂 utils/                        # Shared utilities
│   ├── web/                         # Web UI helpers
│   │   ├── element.utils.ts         # Click, fill, select
│   │   ├── wait.utils.ts            # Wait for visibility
│   │   ├── fallback.locator.ts      # Multi-selector fallback
│   │   └── index.ts
│   ├── common/                      # Common helpers
│   │   ├── assertion.utils.ts       # Common assertions
│   │   ├── faker.utils.ts           # Test data generation
│   │   ├── retry.utils.ts           # Retry with backoff
│   │   ├── visual.testing.ts        # Screenshot utilities
│   │   ├── test-data.loader.ts      # Load test data from JSON/files
│   │   ├── user-context.manager.ts  # Manage user sessions
│   │   ├── multi-user-test.helper.ts # Multi-user test utilities
│   │   └── index.ts
│   ├── mobile/                      # Mobile-specific utilities
│   │   └── *.ts
│   ├── test-utils.ts                # General test utilities
│   └── index.ts
│
├── 📂 fixtures/                     # Playwright fixtures (Dependency Injection)
│   ├── fixtures-di.ts               # Main DI fixtures (pages, services, utilities)
│   ├── api-fixtures.ts              # API-specific fixtures
│   ├── mobile.fixtures.ts           # Mobile-specific fixtures
│   ├── multi-user.fixtures.ts       # Multi-user test fixtures
│   ├── service.container.ts         # Service Locator / DI Container
│   ├── test-fixtures.ts             # General test fixtures
│   ├── FIXTURES_GUIDE.md            # How to use fixtures
│   └── index.ts
│
├── 📂 config/                       # Configuration
│   ├── config.ts                    # Base configuration
│   ├── user.ts                      # User configuration
│   ├── device.ts                    # Device configuration
│   ├── constants/                   # Constants
│   │   ├── ui.constants.ts          # UI selectors constants
│   │   ├── api.constants.ts         # API endpoints constants
│   │   └── index.ts
│   └── index.ts
│
├── 📂 tests/                        # Test suites
│   ├── api/                         # API tests
│   │   └── *.spec.ts
│   ├── e2e/                         # UI end-to-end tests
│   │   └── *.spec.ts
│   ├── auth/                        # Auth-related tests
│   │   └── auth.json                # Auth credentials cache
│   ├── mobile/                      # Mobile tests
│   │   └── *.spec.ts
│   └── *.spec.ts                    # Individual test files
│
├── 📂 features/                     # BDD Feature files
│   ├── ui/                          # UI scenarios
│   │   ├── login.feature
│   │   ├── cart.feature
│   │   ├── product_search.feature
│   │   └── *.feature
│   └── api/                         # API scenarios
│       └── *.feature
│
├── 📂 steps/                        # BDD Step definitions
│   ├── hooks.ts                     # Before/After hooks
│   ├── ui/                          # UI step definitions
│   │   ├── login.steps.ts
│   │   ├── cart.steps.ts
│   │   ├── product.steps.ts
│   │   ├── common.steps.ts
│   │   └── *.ts
│   └── api/                         # API step definitions
│       └── *.ts
│
├── 📂 testdata/                     # Test data management
│   ├── users.json                   # Test users
│   ├── products.json                # Product test data
│   ├── cart.json                    # Cart test data
│   ├── api.json                     # API test data
│   ├── api-login.data.ts            # API login data (TypeScript)
│   ├── TEST_DATA_GUIDE.md           # How to use test data
│   ├── QUICK_REFERENCE.md           # Test data quick ref
│   └── *.ts                         # More test data files
│
├── 📂 api-server/                   # Local mock API
│   ├── server.ts                    # Express server
│   └── README.md                    # API server docs
│
├── 📂 docs/                         # Documentation
│   ├── QUICK_START.md
│   ├── FRAMEWORK_ARCHITECTURE.md
│   ├── FRAMEWORK_STRUCTURE.md
│   ├── API_REFERENCE.md
│   ├── ADVANCED_TESTING_GUIDE.md
│   ├── TROUBLESHOOTING_FAQ.md
│   ├── MOBILE_TESTING_GUIDE.md
│   ├── MULTI_USER_TESTING.md
│   └── ... other guides
│
├── 📂 allure-results/               # Allure test results
├── 📂 allure-report/                # Allure report output
├── 📂 playwright-report/            # Playwright report output
├── 📂 test-results/                 # Test results cache
│
├── 📄 playwright.config.ts          # Playwright configuration
├── 📄 cucumber.js                   # Cucumber configuration
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 tsconfig.test.json            # Test TypeScript config
├── 📄 package.json                  # Dependencies
├── 📄 .env.dev                      # Dev environment
├── 📄 .env.api                      # API environment
├── 📄 .gitignore                    # Git ignore
├── 📄 README.md                     # Project overview
└── 📄 FRAMEWORK_COMPLETE_GUIDE.md   # This comprehensive guide
```

---

## 🔧 Key Components Explained

### 1. Page Object Model (POM) Pattern
**Location:** `src/pages/`

```typescript
// pages/login.page.ts
export class LoginPage extends BasePage {
  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="submit"]');
  }
}
```

**Benefits:**
- ✅ Reusable across multiple tests
- ✅ Easy to maintain
- ✅ Centralized selectors

---

### 2. API Service Layer
**Location:** `src/api/services/`

```typescript
// api/services/login.service.ts
export class LoginService extends BaseService {
  async login(email: string, password: string) {
    return this.executor.post('/api/login', { email, password });
  }
}
```

**Benefits:**
- ✅ Business logic encapsulation
- ✅ Reusable across UI and API tests
- ✅ Easy to mock and test

---

### 3. Dependency Injection (DI) with Fixtures
**Location:** `src/fixtures/fixtures-di.ts`

```typescript
// Usage in tests
test('login test', async ({ loginPage, homePage, loginAsValidUser }) => {
  await loginAsValidUser();  // Injected fixture
  await homePage.verifyLoaded();
});
```

**Benefits:**
- ✅ Clean test code
- ✅ Automatic setup/teardown
- ✅ Easy to extend

---

### 4. Utilities Organization
**Location:** `src/utils/`

| Utility | Purpose |
|---------|---------|
| `web/element.utils.ts` | Click, fill, select elements |
| `web/wait.utils.ts` | Wait for elements, visibility |
| `common/assertion.utils.ts` | Common assertions |
| `common/faker.utils.ts` | Generate test data |
| `common/retry.utils.ts` | Retry with backoff || `common/visual.testing.ts` | Screenshot & visual testing |
| `common/test-data.loader.ts` | Load JSON test data |
| `common/user-context.manager.ts` | Manage user sessions |
| `common/multi-user-test.helper.ts` | Multi-user test helpers |

---

### 5. Advanced Dependency Injection
**Location:** `fixtures/`

The framework provides multiple fixture files for different scenarios:

**Main Fixtures** (`fixtures-di.ts`)
```typescript
// Injects all page objects, services, and utilities
test('login', async ({ loginPage, homePage, cartPage, loginService }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'pass');
  await homePage.verify();
});
```

**Multi-User Fixtures** (`multi-user.fixtures.ts`)
```typescript
// Manage multiple concurrent user sessions
test('concurrent users', async ({ multiUserContext }) => {
  const user1 = multiUserContext.users[0];
  const user2 = multiUserContext.users[1];
  // Test concurrent actions
});
```

**Mobile Fixtures** (`mobile.fixtures.ts`)
```typescript
// Mobile-specific pages and configurations
test('mobile login', async ({ mobileLoginPage, mobileHomePage }) => {
  await mobileLoginPage.login('user@example.com', 'pass');
});
```

**Service Container** (`service.container.ts`)
```typescript
// Locator pattern for dependency management
const container = new ServiceContainer(page, baseUrl);
const loginPage = container.getPage(LoginPage, 'loginPage');
const loginService = container.getService(LoginService, 'loginService');
```

---

### 6. Multi-User Testing Support
**Location:** `utils/common/user-context.manager.ts` + `api/services/multi-user-api.manager.ts`

```typescript
// User Context Manager - Track individual user sessions
const userCtx = new UserContextManager();
userCtx.addUser('user1', { email: 'user1@example.com', password: 'pass1' });
userCtx.addUser('user2', { email: 'user2@example.com', password: 'pass2' });

const user1Session = userCtx.getUserContext('user1');

// Multi-User API Manager - API calls for multiple users
const apiManager = new MultiUserApiManager();
await apiManager.loginMultipleUsers([user1Data, user2Data]);
```

---

### 7. Test Data Management
**Location:** `testdata/`

**JSON Files:**
- `users.json` - Test user accounts
- `products.json` - Product data
- `cart.json` - Cart test scenarios
- `api.json` - API test data

**TypeScript Files:**
- `api-login.data.ts` - API login test data
- `TEST_DATA_GUIDE.md` - How to use test data
- `QUICK_REFERENCE.md` - Test data reference

**Loading Test Data:**
```typescript
import { TestDataLoader } from '../utils/common/test-data.loader';

const testData = TestDataLoader.loadUsers();
const products = TestDataLoader.loadProducts();
const apiData = TestDataLoader.loadApiData();
```

---

### 8. Mobile Testing Support
**Location:** `pages/mobile/`, `fixtures/mobile.fixtures.ts`

Mobile page objects include:
- `base.mobile.page.ts` - Base mobile page with mobile gestures
- `login.mobile.page.ts` - Mobile login
- `home.mobile.page.ts` - Mobile home
- `checkout.mobile.page.ts` - Mobile checkout
- `components/` - Mobile-specific components

Mobile gestures supported:
- Tap, double-tap
- Swipe, drag
- Long press
- Mobile keyboard

---

## 4. Utilities Organization
---

## 📝 How to Write Tests

### UI Test Example
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';

test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  
  expect(await page.url()).toContain('/home');
});
```

### API Test Example
```typescript
import { test, expect } from '@playwright/test';
import { LoginService } from '../src/api/services/login.service';

test('API login', async () => {
  const loginService = new LoginService();
  const response = await loginService.login('user@example.com', 'password123');
  
  expect(response.status).toBe(200);
  expect(response.body.token).toBeDefined();
});
```

### BDD Test Example (Feature File)
```gherkin
Feature: User Login
  
  Scenario: Successful login
    Given User is on login page
    When User enters email "user@example.com"
    And User enters password "password123"
    And User clicks login
    Then User should see home page
```

### BDD Step Definitions
```typescript
import { Given, When, Then } from '@cucumber/cucumber';

Given('User is on login page', async function() {
  await this.loginPage.goto();
});

When('User enters email {string}', async function(email) {
  await this.loginPage.fillEmail(email);
});

Then('User should see home page', async function() {
  expect(await this.page.url()).toContain('/home');
});
```

---

## 🧪 Testing Patterns

### Pattern 1: Using Service Container for DI
```typescript
import { test } from '@playwright/test';
import { ServiceContainer } from '../fixtures/service.container';

test('login flow with service container', async ({ page }) => {
  const container = new ServiceContainer(page, 'http://localhost:3000');
  
  // Get page objects from container
  const loginPage = container.getPage(LoginPage, 'login');
  const homePage = container.getPage(HomePage, 'home');
  
  // Get API service
  const loginService = container.getService(LoginService, 'loginService');
  
  // Use them together
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await homePage.verifyLoaded();
});
```

### Pattern 2: Multi-User Concurrent Testing
```typescript
import { MultiUserApiManager } from '../api/services/multi-user-api.manager';
import { UserContextManager } from '../utils/common/user-context.manager';

test('concurrent shopping by multiple users', async () => {
  const userManager = new UserContextManager();
  const apiManager = new MultiUserApiManager();
  
  // Create multiple user contexts
  const users = [
    { email: 'user1@example.com', password: 'pass1' },
    { email: 'user2@example.com', password: 'pass2' }
  ];
  
  users.forEach(user => userManager.addUser(user.email, user));
  
  // Run API calls concurrently
  const results = await Promise.all([
    apiManager.loginAndAddToCart(users[0]),
    apiManager.loginAndAddToCart(users[1])
  ]);
  
  expect(results[0].cartItems).toBeGreaterThan(0);
  expect(results[1].cartItems).toBeGreaterThan(0);
});
```

### Pattern 3: Loading Test Data from JSON
```typescript
import { TestDataLoader } from '../utils/common/test-data.loader';

test('login with test data from JSON', async ({ loginPage }) => {
  const users = TestDataLoader.loadUsers();
  const validUser = users.find(u => u.role === 'user');
  
  await loginPage.goto();
  await loginPage.login(validUser.email, validUser.password);
});

// testdata/users.json
{
  "users": [
    { "email": "validuser@example.com", "password": "pass123", "role": "user" },
    { "email": "admin@example.com", "password": "admin123", "role": "admin" }
  ]
}
```

### Pattern 4: Mobile Testing with Fixtures
```typescript
import { test as mobileTest } from '../fixtures/mobile.fixtures';

mobileTest('mobile login', async ({ mobileLoginPage, mobileHomePage }) => {
  await mobileLoginPage.goto();
  await mobileLoginPage.login('user@example.com', 'password');
  await mobileHomePage.verifyLoaded();
});
```

### Pattern 5: User Context Management
```typescript
import { UserContextManager } from '../utils/common/user-context.manager';
import { MultiUserTestHelper } from '../utils/common/multi-user-test.helper';

test('user session management', async ({ page }) => {
  const userCtx = new UserContextManager();
  const testHelper = new MultiUserTestHelper();
  
  // Create and track user
  const user = await userCtx.createUser({
    email: 'test@example.com',
    password: 'pass123'
  });
  
  // Use helper to run actions as this user
  await testHelper.actAsUser(page, user, async () => {
    // All actions in this callback use user's session
  });
});
```

---

## 🔐 Environment Configuration

### `.env.dev` (Development)
```
BASE_URL=http://localhost:3000
API_URL=http://localhost:3001/api
HEADLESS=true
DEBUG=false
```

### `.env.api` (API Server)
```
PORT=3001
JWT_SECRET=your-secret-key
MOCK_DELAY=100
```

### Using Environment Variables
```typescript
// src/config/config.ts
export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3001/api',
  headless: process.env.HEADLESS !== 'false'
};
```

---

## 📊 Running Tests

### Run All Tests
```bash
npm run test                              # All Playwright tests
npm run bdd                               # All BDD tests
npm run test:all                          # Both
```

### Run Specific Feature
```bash
npm run bdd:login                         # Login feature
npm run bdd:cart                          # Cart feature
npm run bdd:search                        # Search feature
```

### Run with Options
```bash
npm run test:headed                       # UI visible
npm run bdd:headed                        # BDD visible
npm run test:report                       # Show report
npm run bdd:report                        # BDD + Allure report
```

### Run Mobile Tests
```bash
npm run test:mobile                       # Mobile tests
npm run test:mobile:headed                # Mobile visible
```

---

## 📈 Generating Reports

### Playwright Report
```bash
npm run test
npm run test:report                       # Opens Playwright report
```

### Allure Report (BDD)
```bash
npm run bdd:report                        # Runs tests + generates Allure report
# Or manually
npm run allure:generate
npm run allure:open
```

---

## � Built-In Guides & Resources

Your framework includes comprehensive guides for specific topics:

### 1. Fixtures Guide
**File:** `fixtures/FIXTURES_GUIDE.md`

Learn about:
- How to use dependency injection fixtures
- Service Container pattern
- Lifecycle management
- Multiple fixture types (main, API, mobile, multi-user)
- Fixture best practices

### 2. Test Data Guide
**File:** `testdata/TEST_DATA_GUIDE.md`

Learn about:
- Using Faker utilities to generate test data
- Loading JSON test data files
- Data-driven testing
- Test data structures
- Security test data (SQL injection, XSS attempts)

### 3. Test Data Quick Reference
**File:** `testdata/QUICK_REFERENCE.md`

Quick lookup for:
- Available test users
- Product test scenarios
- Edge cases
- Common test data patterns

### 4. Migration Guides
**Location:** `fixtures/MIGRATION_GUIDE.md` + `.ts`

Learn about:
- Migrating from old fixture patterns
- Updating tests to use new fixtures
- Best practices for refactoring

---

## 🛠️ Advanced Features in Detail

### Service Container (IoC Pattern)
```typescript
import { ServiceContainer } from '../fixtures/service.container';

const container = new ServiceContainer(page, 'http://localhost:3000');

// Get page objects as singletons
const loginPage = container.getPage(LoginPage, 'login');
const homePage = container.getPage(HomePage, 'home');

// Get API services
const loginService = container.getService(LoginService, 'login');
const cartService = container.getService(CartService, 'cart');

// Automatic cleanup after test
```

### Faker Utils - Generate Test Data
```typescript
import { FakerUtils } from '../utils/common/faker.utils';

// Single values
const email = FakerUtils.email();                    // random@example.com
const password = FakerUtils.strongPassword();       // P@ssw0rd!xyz
const fullName = FakerUtils.fullName('male');       // John Doe
const phone = FakerUtils.phoneNumber();             // +1-555-123-4567

// Complex objects
const user = FakerUtils.userAccount();              // Full user object
const card = {
  number: FakerUtils.creditCard(),
  cvv: FakerUtils.cvv(),
  expiry: FakerUtils.expirationMonth()
};

// Generate multiple items
const users = FakerUtils.sequence(5, () => FakerUtils.userAccount());
```

### Test Data Loader - Load JSON Data
```typescript
import { TestDataLoader } from '../utils/common/test-data.loader';

// Load from JSON files
const allUsers = TestDataLoader.loadUsers();
const allProducts = TestDataLoader.loadProducts();
const apiData = TestDataLoader.loadApiData();

// Use specific test scenarios
const validUsers = allUsers.validUsers;
const invalidUsers = allUsers.invalidUsers;
const securityTests = allUsers.sqlInjectionAttempts;
```

### Multi-User Testing
```typescript
import { UserContextManager } from '../utils/common/user-context.manager';
import { MultiUserTestHelper } from '../utils/common/multi-user-test.helper';

// Method 1: User Context Manager
const userCtx = new UserContextManager();
userCtx.addUser('user1', { email: 'user1@example.com', password: 'pass1' });
userCtx.addUser('user2', { email: 'user2@example.com', password: 'pass2' });

// Method 2: Multi-User Test Helper
const helper = new MultiUserTestHelper();
await helper.runConcurrentTest(page, users, async (userContext) => {
  // Run test as each user concurrently
});
```

### Visual Testing
```typescript
import { VisualTestUtils } from '../utils/common/visual.testing';

// Full page screenshot
await VisualTestUtils.captureFullPage(page, 'homepage-full');

// Element screenshot
const header = page.locator('header');
await VisualTestUtils.captureElement(header, 'header');

// Screenshot on error
try {
  await action();
} catch (error) {
  await VisualTestUtils.captureFullPage(page, 'error-state');
  throw error;
}
```

### Retry Logic with Backoff
```typescript
import { RetryUtils } from '../utils/common/retry.utils';

await RetryUtils.retry(
  async () => {
    const button = page.locator('[data-testid="submit"]');
    await button.click();
  },
  {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2
  }
);
// Retry: 1s, 2s, 4s delays
```

---

## 📁 Constants & Configuration

### UI Constants
**File:** `config/constants/ui.constants.ts`

```typescript
export const UI_SELECTORS = {
  LOGIN: {
    EMAIL: '[data-testid="email"]',
    PASSWORD: '[data-testid="password"]',
    SUBMIT: '[data-testid="submit"]'
  },
  HOME: {
    HEADER: 'header.main-header',
    PRODUCTS: '.products-grid'
  }
};
```

### API Constants
**File:** `config/constants/api.constants.ts`

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout'
  },
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id) => `/api/products/${id}`
  }
};
```

---

## �🛠️ Common Commands Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run api:start` | Start API server (dev) |
| `npm run api:dev` | API server with auto-reload |
| `npm run test` | Run all Playwright tests |
| `npm run test:headed` | Run tests with UI visible |
| `npm run test:report` | View Playwright report |
| `npm run bdd` | Run BDD tests |
| `npm run bdd:headed` | Run BDD visible |
| `npm run bdd:login` | Run login feature only |
| `npm run bdd:report` | Run BDD + Allure report |
| `npm run test:all` | Run all tests (Playwright + BDD) |

---

## 🔍 Troubleshooting

### Tests Not Finding Elements
- **Issue:** Selectors not matching
- **Solution:** Use `playwright.dev()` to debug, verify selectors in `pages/`

### API Server Not Starting
- **Issue:** Port already in use
- **Solution:** Kill process on port 3001: `npx kill-port 3001`

### BDD Tests Failing
- **Issue:** Steps not matching
- **Solution:** Check step definitions in `steps/`, verify feature file syntax

### Mobile Tests Failing
- **Issue:** Device not supported
- **Solution:** Check `config/device.ts`, ensure device name is valid

### Fixtures Not Injecting
- **Issue:** Variables undefined in tests
- **Solution:** Import from `src/fixtures/fixtures-di.ts`, use correct fixture names

---

## 📚 Test Data Management

### Users (testdata/users.ts)
```typescript
export const testUsers = {
  valid: {
    email: 'user@example.com',
    password: 'password123'
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin123'
  }
};
```

### Using Test Data
```typescript
import { testUsers } from '../testdata/users';

test('login with valid user', async ({ loginPage }) => {
  await loginPage.login(testUsers.valid.email, testUsers.valid.password);
});
```

---

## 🚀 Best Practices

### ✅ DO's
- ✅ Use Page Object Model for UI interactions
- ✅ Keep selectors in page files
- ✅ Use fixtures for setup/teardown
- ✅ Separate business logic in services
- ✅ Use test data builders
- ✅ Add descriptive test names
- ✅ Run tests in parallel when possible
- ✅ Generate and review reports

### ❌ DON'Ts
- ❌ Don't hardcode selectors in tests
- ❌ Don't duplicate waits and retries
- ❌ Don't mix concerns (UI + Business logic)
- ❌ Don't skip error handling
- ❌ Don't ignore flaky tests
- ❌ Don't skip reporting

---

## 📖 Extended Documentation

For detailed information, see individual docs:
- **API Setup:** See `docs/API_REFERENCE.md`
- **Advanced Testing:** See `docs/ADVANCED_TESTING_GUIDE.md`
- **Mobile Testing:** See `docs/MOBILE_TESTING_GUIDE.md`
- **Troubleshooting:** See `docs/TROUBLESHOOTING_FAQ.md`
- **Multi-User:** See `docs/MULTI_USER_TESTING.md`

---

## 📞 Support & Debug

### Enable Debug Mode
```bash
DEBUG=pw:api npm run test                 # Debug API calls
PWDEBUG=1 npm run test                    # Playwright Inspector
```

### View API Server Logs
```bash
npm run api:dev                           # Auto-reload with logs
```

### Check Implementation Status
```bash
npm run test -- --list                    # List all tests
npx cucumber-js --dry-run                 # List all scenarios
```

### Run Example Tests
```bash
# Multi-user API examples
npm test -- api-multi-user.examples.spec.ts

# Multi-user UI examples
npm test -- ui-multi-user.examples.spec.ts

# Hybrid (UI+API) examples
npm test -- hybrid-multi-user.examples.spec.ts

# Mobile examples
npm test tests/mobile/

# Refactored DI examples
npm test -- refactored-examples.spec.ts
```

---

## 📖 Specialized Guides in Framework

Beyond this guide, your framework includes specialized reference documents:

### 1. **INDEX.md** - Complete Navigation
Quick reference index for all documentation files and how they connect.

### 2. **MOBILE_STRUCTURE.md** - Mobile Testing Details
In-depth details about:
- Mobile page structure (`pages/mobile/`)
- Mobile tests (`tests/mobile/`)
- Mobile fixtures and device profiles
- 32+ mobile test cases
- Mobile components library

### 3. **RUNNING_MULTI_USER_EXAMPLES.md** - Multi-User Testing
How to run the example test suites:
- API Multi-User Examples (concurrent API calls)
- UI Multi-User Examples (concurrent browser sessions)
- Hybrid Multi-User Examples (combined UI+API)
- Example scenarios with realistic e-commerce flows

### 4. **DI_REFACTORING_GUIDE.md** - Deep Dive into Dependency Injection
Complete guide on:
- DI patterns and principles
- Before/after code examples
- Service Container implementation
- Migration strategies
- Best practices

### 5. **Fixtures Documentation** - How to Use DI Fixtures
Located in `fixtures/FIXTURES_GUIDE.md`:
- Fixture lifecycle management
- Service container patterns
- Best practices for test setup
- Common fixture patterns

### 6. **Test Data Documentation** - Test Data Management
Located in `testdata/TEST_DATA_GUIDE.md`:
- Faker utilities with 30+ generators
- JSON test data files structure
- Data-driven test examples
- Security test data (SQL injection, XSS)

---

## 🧪 Example Test Suites Reference

The framework includes example test files demonstrating patterns:

| File | Purpose | Location |
|------|---------|----------|
| `refactored-examples.spec.ts` | Basics of using DI fixtures | `tests/` |
| `api-multi-user.examples.spec.ts` | Multi-user API testing | `tests/` |
| `ui-multi-user.examples.spec.ts` | Multi-user UI testing | `tests/` |
| `hybrid-multi-user.examples.spec.ts` | Combined UI+API testing | `tests/` |
| `advanced-testing.spec.ts` | Advanced patterns & techniques | `tests/` |
| `mobile/*.spec.ts` | Mobile test examples | `tests/mobile/` |

---

## 🛠️ Common Commands Reference

### Core Testing Capabilities
1. ✅ **UI Testing** - Playwright tests with full browser support
2. ✅ **API Testing** - Complete REST API validation
3. ✅ **BDD Testing** - Cucumber feature scenarios
4. ✅ **Mobile Testing** - iOS & Android devices
5. ✅ **Multi-User Testing** - Concurrent user sessions

### Page Object & Service Layers
6. ✅ **Page Object Models** - Clean UI abstraction
7. ✅ **Service Layer** - Business logic encapsulation
8. ✅ **API Executor** - Generic HTTP client
9. ✅ **Service Container** - Dependency injection (IoC)
10. ✅ **Mobile Components** - Mobile-specific UI elements

### Fixture System
11. ✅ **Dependency Injection Fixtures** - Main DI fixtures
12. ✅ **API Fixtures** - API-specific setup
13. ✅ **Mobile Fixtures** - Mobile test fixtures
14. ✅ **Multi-User Fixtures** - Concurrent user fixtures
15. ✅ **Migration Guides** - Transition to new patterns

### Test Data & Utilities
16. ✅ **Faker Utils** - Realistic test data generation
17. ✅ **Test Data Loader** - Load from JSON files
18. ✅ **User Context Manager** - Track user sessions
19. ✅ **Multi-User Test Helper** - Run concurrent tests
20. ✅ **Multi-User API Manager** - Concurrent API calls

### Advanced Features
21. ✅ **Visual Testing** - Screenshots & visual comparison
22. ✅ **Retry Logic** - Smart retries with backoff
23. ✅ **Fallback Locators** - Multi-selector strategies
24. ✅ **Assertion Utils** - Reusable assertions
25. ✅ **Configuration Management** - Centralized constants

### Reporting & Debugging
26. ✅ **Allure Reports** - BDD test reports
27. ✅ **Playwright Reports** - Detailed test reports
28. ✅ **Screenshot Capture** - On-demand screenshots
29. ✅ **Inspector Debug** - Interactive debugging
30. ✅ **Console Logging** - Detailed logs

### Documentation & Guides
31. ✅ **Fixtures Guide** - How to use DI fixtures
32. ✅ **Test Data Guide** - Test data management
33. ✅ **Quick References** - Fast lookup guides
34. ✅ **API Reference** - Complete API docs
35. ✅ **Troubleshooting FAQ** - Common issues & solutions

---

## 📋 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Testing** | Playwright | Latest |
| **BDD** | Cucumber.js | 9.0+ |
| **Language** | TypeScript | 4.x+ |
| **Server** | Express.js | 4.x |
| **Reports** | Allure | Latest |
| **Async** | Promises/async-await | Built-in |

---

## 🎯 Quick Feature Reference

### Need to...
- **Generate test data?** → Use `FakerUtils`
- **Load JSON data?** → Use `TestDataLoader`
- **Run concurrent tests?** → Use `MultiUserTestHelper`
- **Take screenshots?** → Use `VisualTestUtils`
- **Retry flaky steps?** → Use `RetryUtils`
- **Use DI pattern?** → Use `fixtures-di.ts`
- **Manage users?** → Use `UserContextManager`
- **Get page objects?** → Use `ServiceContainer`
- **Test APIs?** → Use `LoginService`, `CartService`, etc.
- **Find elements?** → Use `fallback.locator.ts`

---

## ✨ What You Can Do

1. **Full test coverage** - UI, API, BDD, Mobile
2. **Generate realistic data** - Faker with 30+ generators
3. **Load test data** - JSON files with pre-defined scenarios
4. **Run concurrent tests** - Multiple users simultaneously
5. **Mobile testing** - iOS and Android devices
6. **Visual testing** - Screenshots & comparisons
7. **Smart retries** - Backoff strategies for flaky tests
8. **Service injection** - IoC Container pattern
9. **User session management** - Track multi-user interactions
10. **Comprehensive reports** - Allure + Playwright
11. **API + UI combo tests** - Hybrid testing
12. **Debug efficiently** - Inspector + logs
13. **BDD scenarios** - Full Gherkin support
14. **Custom assertions** - Reusable validations
15. **Configuration constants** - Centralized UI/API selectors

---

**Last Updated:** April 2026  
**Framework Version:** 1.0.0  
**Status:** Production Ready ✅
