# Custom Fixtures with Dependency Injection - Usage Guide

## Overview

This fixture system implements the **Dependency Injection** pattern, providing centralized management of page objects and API clients with automatic lifecycle management.

## Files

- **fixtures.ts** - Main fixtures definition with all custom fixtures
- **service.container.ts** - Service Container (IoC Container) for dependency injection
- **fixtures-example.spec.ts** - Comprehensive examples of fixture usage

## Key Concepts

### Service Container (IoC Container)
The `ServiceContainer` class acts as a central registry for:
- **Page Objects**: Singleton instances of all page classes
- **API Clients**: Managed API client instances
- **Lifecycle Management**: Automatic cleanup after tests

### Dependency Injection Pattern
Instead of manually creating page objects, they are:
1. Created on-demand (lazy initialization)
2. Cached as singletons (reused within a test)
3. Automatically cleaned up after each test
4. Injected directly into test functions

## Usage Examples

### Basic Usage - Individual Page Fixtures

```typescript
import { test } from '../fixtures/fixtures';

test('should login with injected LoginPage', async ({ loginPage, page }) => {
  // loginPage is automatically injected - no manual creation needed
  await page.goto('http://localhost');
  await loginPage.navigateToLogin();
  await loginPage.fillEmail('user@example.com');
  await loginPage.fillPassword('password');
});
```

### Using Service Container

```typescript
import { test } from '../fixtures/fixtures';

test('should access all pages through container', async ({ container }) => {
  // Get all pages from container
  const loginPage = container.getLoginPage();
  const homePage = container.getHomePage();
  const cartPage = container.getCartPage();

  // All pages share the same underlying Playwright page
  expect(loginPage.page).toBe(homePage.page);
});
```

### Using API Client

```typescript
import { test } from '../fixtures/fixtures';

test('should make API calls with injected client', async ({ apiClient }) => {
  // apiClient is already initialized by fixture
  const response = await apiClient.get('/api/products');
  
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});
```

### Combining Multiple Fixtures

```typescript
import { test } from '../fixtures/fixtures';

test('should combine UI and API testing', async ({
  loginPage,
  apiClient,
  cartPage,
  page,
}) => {
  // All fixtures work together
  await page.goto('http://localhost');
  
  // UI interaction
  await loginPage.fillEmail('user@example.com');
  
  // API call
  const productsResponse = await apiClient.get('/api/products');
  
  // More UI interaction
  expect(cartPage).toBeDefined();
});
```

### Using Navigation Utilities

```typescript
import { test } from '../fixtures/fixtures';

// Auto-navigate to home before test
test('should use navigateToHome', async ({ navigateToHome, page }) => {
  // Home page is already loaded
  expect(page.url()).toContain('localhost');
});

// Auto-login before test
test('should use loginAsValidUser', async ({ loginAsValidUser, page }) => {
  // User is already logged in
  const userLink = page.getByRole('link', { name: 'Tricentis Demo Web Shop' });
  await expect(userLink).toBeVisible();
});

// Auto-clear cart before test
test('should use clearCart', async ({ clearCart, page }) => {
  // Cart is already empty
  await page.goto('http://localhost/cart');
});
```

### Authenticated Context

```typescript
import { test } from '../fixtures/fixtures';

test('should have authenticated session', async ({ authenticatedContext, accountPage }) => {
  // Both user session and page objects are ready
  expect(accountPage).toBeDefined();
});
```

## Available Fixtures

### Page Objects
- `loginPage` - LoginPage instance for auth tests
- `homePage` - HomePage instance for home page tests
- `cartPage` - CartPage instance for shopping cart tests
- `productPage` - ProductPage instance for product tests
- `accountPage` - AccountPage instance for account tests

### Services
- `container` - ServiceContainer for all page/API management
- `apiClient` - ApiClient for REST API testing (pre-initialized)

### Navigation Utilities
- `navigateToHome` - Auto-navigate to home page
- `loginAsValidUser` - Auto-login with valid credentials
- `loginAsInvalidUser` - Auto-attempt login with invalid credentials
- `clearCart` - Auto-clear shopping cart
- `authenticatedContext` - Auto-setup authenticated user session

## Benefits of This Approach

1. **Singleton Pattern**: Page objects are created once and reused
2. **Lazy Initialization**: Pages created only when needed
3. **Automatic Cleanup**: Resources cleaned up after each test
4. **Reduced Redundancy**: No need to repeat setup code
5. **Improved Maintainability**: Centralized page and service creation
6. **Better Testability**: Easy to mock or replace implementations
7. **Type Safety**: Full TypeScript support for all fixtures

## Advanced Usage - Accessing Multiple Pages

```typescript
import { test } from '../fixtures/fixtures';

test('should access all pages easily', async ({ container, page }) => {
  const pages = container.getAllPages();
  
  // Now you have all page objects
  pages.loginPage.fillEmail('user@example.com');
  pages.homePage.navigateToHome();
  pages.cartPage.removeItem();
  pages.productPage.addToCart();
  pages.accountPage.viewProfile();
});
```

## Advanced Usage - Custom Service Registration

You can extend the ServiceContainer to add custom services:

```typescript
// In your fixture setup
test('should use custom service', async ({ container, page }) => {
  // Get or cache a custom service
  const customService = container.getPage(MyCustomClass, 'myService');
  
  // Use it in your test
  await customService.doSomething();
});
```

## Running Tests with Fixtures

```bash
# Run all tests using fixtures
npm run test tests/fixtures-example.spec.ts

# Run specific test
npm run test tests/fixtures-example.spec.ts -g "should login with injected LoginPage"

# Run with headed mode
npm run test:headed tests/fixtures-example.spec.ts
```

## Lifecycle

1. **Before Test**: Fixtures setup
   - Container created
   - Page objects initialized on first use
   - API client initialized
   - Navigation utilities execute setup

2. **During Test**: Use fixtures as needed
   - Page objects cached and reused
   - API client ready for calls
   - Automatic type checking

3. **After Test**: Automatic cleanup
   - API clients closed
   - Cache cleared
   - Resources released

## Best Practices

1. **Use container for all pages** - Ensures singleton behavior
2. **Prefer specific fixtures** - Use `loginPage` instead of always using `container.getLoginPage()`
3. **Leverage navigation utilities** - Use fixtures like `loginAsValidUser` instead of manual setup
4. **Combine fixtures** - Use multiple fixtures to reduce test setup code
5. **Let cleanup happen** - Don't call `container.cleanup()` manually, it happens automatically

## Example Test File Structure

```typescript
import { test, expect } from '../fixtures/fixtures';

test.describe('Feature Tests', () => {
  test('should do something', async ({ 
    loginPage,      // Individual page
    apiClient,      // API service
    authenticatedContext  // Setup fixture
  }) => {
    // Test body - all fixtures are ready
  });
});
```

## Troubleshooting

**Q: Page objects are not being reused?**
A: Always use the container or fixture injection. Creating `new LoginPage(page)` manually bypasses the singleton.

**Q: API client not initialized?**
A: The `apiClient` fixture automatically initializes it. Just use the injected client.

**Q: Need to reset a page between tests?**
A: The fixture lifecycle handles this - each test gets fresh instances.

**Q: How to mock a page object?**
A: Extend ServiceContainer with a registration method or create a test-specific fixture override.
