# Migration Guide: Converting Existing Tests to Use New Fixtures

## BEFORE: Using old fixtures with manual setup

```typescript
import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';

test('old style - manual page object creation', async ({ page }) => {
  // Manual setup - error prone
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);

  // Manual navigation
  await page.goto('http://localhost:80');

  // Manual test logic
  await loginPage.navigateToLogin();
  await loginPage.fillEmail('user@example.com');
  await loginPage.fillPassword('password');

  // No automatic cleanup
});
```

## AFTER: Using new fixtures with dependency injection

```typescript
import { test, expect } from '../fixtures/fixtures';

test('new style - dependency injection', async ({ loginPage, homePage, page }) => {
  // Fixtures automatically injected - no manual creation
  // Better type safety and error handling

  // Navigation (can also use navigateToHome fixture)
  await page.goto('http://localhost:80');

  // Use injected pages
  await loginPage.navigateToLogin();
  await loginPage.fillEmail('user@example.com');
  await loginPage.fillPassword('password');

  // Automatic cleanup after test
});
```

---

## MIGRATION EXAMPLES

### Example 1: Login Test Migration

#### BEFORE
```typescript
import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Login Tests - Old Style', () => {
  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await page.goto('http://localhost:80');
    await loginPage.navigateToLogin();
    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('password');
    await loginPage.submitLogin();
    
    // Manual verification
    await loginPage.verifyUserIsLoggedIn();
  });
});
```

#### AFTER
```typescript
import { test } from '../fixtures/fixtures';

test.describe('Login Tests - New Style', () => {
  test('should login successfully', async ({ 
    loginPage,      // Injected
    navigateToHome  // Injected for navigation
  }) => {
    // navigateToHome automatically navigates
    await loginPage.navigateToLogin();
    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('password');
    await loginPage.submitLogin();
    
    // Verification still same
    await loginPage.verifyUserIsLoggedIn();
  });

  // Super simple with auto-login fixture
  test('should verify user is logged in', async ({ loginAsValidUser, page }) => {
    // User already logged in - loginAsValidUser fixture handles it
    const userLink = page.getByRole('link', { name: 'Tricentis Demo Web Shop' });
    await expect(userLink).toBeVisible();
  });
});
```

---

### Example 2: Cart Test Migration

#### BEFORE
```typescript
test.describe('Cart Tests - Old Style', () => {
  test('should add and remove items', async ({ page }) => {
    const cartPage = new CartPage(page);
    const productPage = new ProductPage(page);

    await page.goto('http://localhost:80/products');
    // ... test logic
  });

  test('should clear cart', async ({ page }) => {
    const cartPage = new CartPage(page);
    
    await page.goto('http://localhost:80/cart');
    // Manually clear logic
    const removeButtons = await page.locator('.remove-btn').all();
    for (const btn of removeButtons) {
      await btn.click();
    }
  });
});
```

#### AFTER
```typescript
test.describe('Cart Tests - New Style', () => {
  test('should add and remove items', async ({ cartPage, productPage, page }) => {
    // Pages automatically injected
    await page.goto('http://localhost:80/products');
    // ... same test logic, better setup
  });

  test('should clear cart', async ({ clearCart, page }) => {
    // clearCart fixture automatically empties cart
    // Test logic here
    await page.goto('http://localhost:80/cart');
  });
});
```

---

### Example 3: API Integration Test Migration

#### BEFORE
```typescript
test.describe('API Tests - Old Style', () => {
  test('should fetch products', async ({ }) => {
    const client = new ApiClient('http://localhost:80');
    await client.init();

    const response = await client.get('/api/products');

    expect(response.status).toBe(200);

    // Manual cleanup
    await client.close();
  });
});
```

#### AFTER
```typescript
test.describe('API Tests - New Style', () => {
  test('should fetch products', async ({ apiClient }) => {
    // API client already initialized by fixture
    const response = await apiClient.execute({
      endpoint: '/api/products',
      method: 'GET'
    });

    expect(response.status).toBe(200);

    // Automatic cleanup handled by fixture
  });
});
```

---

### Example 4: Complex Workflow Migration

#### BEFORE
```typescript
test.describe('Shopping Workflow - Old Style', () => {
  test('should complete purchase flow', async ({ page }) => {
    // Manual setup for each page
    const loginPage = new LoginPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkout = new CheckoutPage(page);

    // Manual login
    await page.goto('http://localhost:80');
    await loginPage.navigateToLogin();
    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('password');
    await loginPage.submitLogin();
    await page.waitForURL('http://localhost:80');

    // Test logic with manually created pages
    await productPage.navigateTo('http://localhost:80/products');
    // ... rest of flow
  });
});
```

#### AFTER
```typescript
test.describe('Shopping Workflow - New Style', () => {
  test('should complete purchase flow', async ({
    loginPage,
    productPage,
    cartPage,
    loginAsValidUser,  // This handles login setup
    page,
  }) => {
    // loginAsValidUser fixture handles authentication setup
    // No manual login code needed!

    // All pages ready to use
    await productPage.navigateTo('http://localhost:80/products');
    // ... rest of flow, same test logic but cleaner setup
  });

  // Even simpler with authenticated context
  test('should complete purchase (simplified)', async ({
    authenticatedContext,
    productPage,
    cartPage,
  }) => {
    // Both authentication and pages ready
    // Just focus on test logic
    await productPage.navigateTo('http://localhost:80/products');
  });
});
```

---

### Example 5: Container Usage

#### BEFORE - Had to import each page separately
```typescript
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { CartPage } from '../pages/cart.page';

test('old way - multiple imports', async ({ page }) => {
  const login = new LoginPage(page);
  const home = new HomePage(page);
  const cart = new CartPage(page);
});
```

#### AFTER - Use container for all
```typescript
import { test } from '../fixtures/fixtures';

test('new way - container pattern', async ({ container }) => {
  // All pages from single source
  const pages = container.getAllPages();

  pages.loginPage.navigateToLogin();
  pages.homePage.navigateToHome();
  pages.cartPage.viewCart();

  // Or get individually when needed
  const loginPage = container.getLoginPage();
});
```

---

## STEP-BY-STEP MIGRATION CHECKLIST

To migrate a test file from old to new fixtures:

1. **Change import statement**
   - FROM: `import { test } from '@playwright/test';`
   - TO:   `import { test } from '../fixtures/fixtures';`

2. **Update test function signature**
   - Add injected fixtures as parameters
   - Remove manual page object creation

3. **Replace page creation**
   - FROM: `const loginPage = new LoginPage(page);`
   - TO:   `loginPage` (parameter)

4. **Replace manual setup**
   - FROM: Manual login code
   - TO:   `loginAsValidUser` fixture

5. **Add appropriate fixtures**
   - `loginPage`, `homePage`, `cartPage`, etc.
   - Or use `container` for all

6. **Remove cleanup code**
   - The fixture handles it

7. **Test and verify**
   - Run `npm run test`
   - All tests should pass with same behavior

---

## FIXTURE SELECTION GUIDE

Choose the right fixture based on your needs:

### Simple page access
```typescript
test('test name', async ({ loginPage, cartPage }) => {})
```

### Page access + API
```typescript
test('test name', async ({ loginPage, apiClient }) => {})
```

### Accessing all pages
```typescript
test('test name', async ({ container }) => {
  const pages = container.getAllPages();
})
```

### Pre-login setup
```typescript
test('test name', async ({ loginAsValidUser, homePage }) => {})
```

### Authenticated session
```typescript
test('test name', async ({ authenticatedContext, accountPage }) => {})
```

### Navigation setup
```typescript
test('test name', async ({ navigateToHome, productPage }) => {})
```

### Cart clearing
```typescript
test('test name', async ({ clearCart, cartPage }) => {})
```

---

## Available Fixtures

### Page Object Fixtures
- `loginPage` - LoginPage instance for authentication tests
- `homePage` - HomePage instance for home page operations
- `cartPage` - CartPage instance for shopping cart operations
- `productPage` - ProductPage instance for product browsing
- `accountPage` - AccountPage instance for account operations

### Service Fixtures
- `apiClient` - Initialized API executor for HTTP requests
- `apiLoginService` - Login service for API authentication

### Authentication Fixtures
- `authenticatedApiClient` - Pre-authenticated API client with token
- `loginAsValidUser` - Pre-login with valid credentials
- `loginAsInvalidUser` - Pre-login with invalid credentials

### Utility Fixtures
- `container` - Service container for dependency injection
- `navigateToHome` - Automatic navigation to home page
- `clearCart` - Automatic cart clearing

