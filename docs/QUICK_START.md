# Advanced Testing Utilities - Quick Start Guide

## 5-Minute Quick Start

### Installation

All utilities are already created in your project:

```
utils/
├── retry.utils.ts          # Retry logic with multiple strategies
├── fallback.locator.ts     # Fallback DOM selectors
├── api.mock.ts             # API mocking and call verification
└── visual.testing.ts       # Screenshot and visual regression testing
```

### Import and Use

```typescript
import { RetryUtils } from '../utils/retry.utils';
import { FallbackLocator } from '../utils/fallback.locator';
import { ApiMock, ApiMockScenarios } from '../utils/api.mock';
import { VisualTesting } from '../utils/visual.testing';
```

---

## Quick Reference

### Retry Logic - Handle Flaky Tests

```typescript
// Exponential backoff (default)
await RetryUtils.executeWithRetry(
  async () => { /* operation */ },
  { maxAttempts: 3, delayMs: 1000 }
);

// Fixed delay
await RetryUtils.executeWithFixedDelay(
  async () => { /* operation */ },
  { maxAttempts: 5, delayMs: 500 }
);

// Wait until condition
await RetryUtils.waitUntil(
  () => page.locator('.loaded').isVisible(),
  { maxAttempts: 10 }
);

// Only retry specific errors
await RetryUtils.executeWithConditionalRetry(
  async () => { /* operation */ },
  error => error.message.includes('timeout'),
  { maxAttempts: 3 }
);
```

### Fallback Locators - Multiple Selector Strategies

```typescript
// Try selectors in order
const locator = await FallbackLocator.findElement(page, [
  '#email',
  '[name="email"]',
  '[placeholder="Email"]'
]);

// Click with fallback
await FallbackLocator.clickWithFallback(page, [
  '.btn-submit',
  '[role="button"]',
  'button'
]);

// Smart locator combining multiple strategies
const smart = FallbackLocator.smartLocator(page, {
  defaultSelector: '#email',
  cssSelectors: ['[name="email"]'],
  texts: ['Email address'],
  roles: [{ role: 'textbox' }]
});
const element = await smart.locator();

// Find input by various attributes
const input = await FallbackLocator.findInput(page, {
  names: ['email'],
  placeholders: ['Enter email'],
  types: ['email']
});

// Wait for visibility
const visible = await FallbackLocator.findVisibleElement(
  page,
  ['#modal', '.dialog'],
  5000
);
```

### API Mocking - Mock Responses

```typescript
const apiMock = new ApiMock();

// Basic mock
await apiMock.mockSuccess(page, '**/api/users', { id: 1, name: 'John' });

// With delay
await apiMock.mockRoute(page, {
  pattern: '**/api/data',
  response: { data: [] },
  status: 200,
  delay: 500
});

// Mock errors
await apiMock.mockNotFound(page, '**/api/missing');
await apiMock.mockUnauthorized(page, '**/api/secure');

// Predefined scenarios
await apiMock.mockRoutes(page, ApiMockScenarios.createLoginMocks());

// Verify calls
expect(apiMock.verifyCalled('**/api/users')).toBe(true);
expect(apiMock.getCallCount('**/api/users')).toBe(1);
expect(apiMock.verifyCalledWithBody('**/api/users', { email: 'test@test.com' })).toBe(true);

// View all calls
console.log(apiMock.getCallLogs());
```

### Visual Testing - Screenshots & Regression

```typescript
// Take screenshot
await VisualTesting.takeScreenshot(page, 'homepage', {
  fullPage: true,
  mask: ['input[type="password"]']
});

// Compare with baseline
const match = await VisualTesting.compareWithBaseline(page, 'homepage');

// Element screenshot
await VisualTesting.takeElementScreenshot(page, '#header', 'header');

// Before/After
const before_after = await VisualTesting.takeBeforeAfterScreenshots(
  page,
  'dialog-interaction',
  async () => { /* setup */ },
  async () => { /* action */ }
);

// Verify element state
await VisualTesting.verifyElementVisible(page, '#submit');
await VisualTesting.verifyElementState(page, 'button', 'enabled');
```

---

## Common Test Patterns

### Pattern 1: Retry with Fallback

```typescript
test('login with retry and fallback', async ({ page }) => {
  await page.goto('/login');

  // Retry clicking with fallback selectors
  await RetryUtils.executeWithRetry(async () => {
    const clicked = await FallbackLocator.clickWithFallback(page, [
      '#login-btn',
      '[data-testid="login"]',
      'button:has-text("Login")'
    ]);
    if (!clicked) throw new Error('Could not click login');
  }, { maxAttempts: 3 });

  await page.waitForURL('/dashboard');
});
```

### Pattern 2: Mock API + Verify

```typescript
test('products loaded from API', async ({ page }) => {
  const apiMock = new ApiMock();

  // Mock the API
  await apiMock.mockSuccess(page, '**/api/products', [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' }
  ]);

  await page.goto('/products');
  await page.waitForSelector('[data-product]');

  // Verify API was called
  expect(apiMock.verifyCalled('**/api/products')).toBe(true);

  // Verify correct number of products displayed
  const count = await page.locator('[data-product]').count();
  expect(count).toBe(2);
});
```

### Pattern 3: Visual + Interaction

```typescript
test('modal visual testing', async ({ page }) => {
  await page.goto('/page');

  // Take screenshot before interaction
  const before = await VisualTesting.takeScreenshot(page, 'modal-before');

  // Interact
  await page.click('[data-action="open-modal"]');
  await page.waitForSelector('.modal');

  // Take screenshot after interaction
  const after = await VisualTesting.takeScreenshot(page, 'modal-after');

  // Compare with baselines
  await VisualTesting.compareWithBaseline(page, 'modal-before');
  await VisualTesting.compareWithBaseline(page, 'modal-after');
});
```

### Pattern 4: Full Test Flow

```typescript
test('complete checkout flow', async ({ page }) => {
  const apiMock = new ApiMock();

  // Setup all mocks
  await apiMock.mockRoutes(page, [
    ...ApiMockScenarios.createProductMocks(),
    ...ApiMockScenarios.createCartMocks(),
    ...ApiMockScenarios.createCheckoutMocks()
  ]);

  await page.goto('/');
  await VisualTesting.takeScreenshot(page, 'homepage');

  // Add to cart with retry
  await RetryUtils.executeWithRetry(async () => {
    await FallbackLocator.clickWithFallback(page, [
      '[data-action="add-to-cart"]',
      '.add-cart-btn'
    ]);
    await page.waitForSelector('[data-cart-count="1"]');
  }, { maxAttempts: 3 });

  // Verify API calls
  expect(apiMock.getCallCount('**/api/cart')).toBeGreaterThan(0);
  await VisualTesting.takeScreenshot(page, 'with-item-in-cart');
});
```

---

## Real-World Examples

### Example 1: Flaky Login Page

```typescript
// Problem: Login button sometimes doesn't respond
// Solution: Retry with fallback selectors and conditional retry

test('login with flaky button', async ({ page }) => {
  await page.goto('/login');

  const credentials = { email: 'test@test.com', password: 'password123' };

  // Fill fields with retry
  await RetryUtils.executeWithRetry(
    async () => {
      await FallbackLocator.fillWithFallback(
        page,
        ['#email', '[name="email"]'],
        credentials.email
      );
    },
    { maxAttempts: 3 }
  );

  // Retry only on network errors
  await RetryUtils.executeWithConditionalRetry(
    async () => {
      await FallbackLocator.clickWithFallback(page, [
        '#login-btn',
        '[role="button"]'
      ]);
    },
    error => error.message.includes('network'),
    { maxAttempts: 3 }
  );

  // Wait for redirect
  await page.waitForURL('/dashboard');
});
```

### Example 2: API Dependency Testing

```typescript
// Problem: Tests fail when API is down
// Solution: Mock external APIs, test in isolation

test('user listing without real API', async ({ page }) => {
  const apiMock = new ApiMock();

  // Mock paginated users
  const users = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@test.com`
  }));

  await apiMock.mockPaginated(page, '**/api/users', users, 10);

  // Mock user detail endpoint
  await apiMock.mockDynamic(page, '**/api/users/:id', async (request) => {
    const id = request.url().split('/').pop();
    return users.find(u => u.id === parseInt(id));
  });

  await page.goto('/users');

  // Verify first page loaded
  expect(apiMock.getCallCount('**/api/users')).toBe(1);

  // Click next page
  await page.click('[data-action="next-page"]');

  // Verify pagination API called
  expect(apiMock.verifyCalledTimes('**/api/users', 2)).toBe(true);
});
```

### Example 3: Dynamic Content Testing

```typescript
// Problem: Screenshots fail due to timestamps and randomness
// Solution: Mask dynamic content before comparison

test('visual regression with masking', async ({ page }) => {
  await page.goto('/dashboard');

  // Mask all dynamic elements
  await VisualTesting.takeScreenshot(page, 'dashboard', {
    mask: [
      '.timestamp',           // Hide time
      '[data-user-id]',      // Hide user IDs
      '.notification-count',  // Hide counts that change
      'img'                   // Hide dynamic images
    ],
    threshold: 0.15,         // 15% tolerance
    fullPage: true
  });

  // Update baseline or compare
  const match = await VisualTesting.compareWithBaseline(page, 'dashboard', {
    updateBaseline: false    // Don't update automatically
  });

  expect(match).toBe(true);
});
```

### Example 4: Resilient Form Interaction

```typescript
// Problem: Form interactions fail intermittently
// Solution: Combine all utilities for robust testing

test('resilient form submission', async ({ page }) => {
  const apiMock = new ApiMock();

  // Mock form submission
  let submitCount = 0;
  await apiMock.mockDynamic(page, '**/api/form/submit', async (request) => {
    submitCount++;
    return { success: true, submissionId: submitCount };
  });

  await page.goto('/form');

  // Smart form filling with retry and fallback
  const fields = [
    { name: 'email', value: 'test@test.com', selectors: ['#email', '[name="email"]'] },
    { name: 'message', value: 'Test message', selectors: ['#message', '[name="message"]'] }
  ];

  for (const field of fields) {
    await RetryUtils.executeWithRetry(
      async () => {
        const filled = await FallbackLocator.fillWithFallback(
          page,
          field.selectors,
          field.value
        );
        if (!filled) throw new Error(`Could not fill ${field.name}`);
      },
      { maxAttempts: 3, delayMs: 500 }
    );
  }

  // Screenshot before submit
  await VisualTesting.takeScreenshot(page, 'form-filled');

  // Submit with retry
  await RetryUtils.executeWithRetry(
    async () => {
      const clicked = await FallbackLocator.clickWithFallback(page, [
        'button[type="submit"]',
        '[role="button"]',
        'button'
      ]);
      if (!clicked) throw new Error('Could not click submit');

      // Wait for response
      await page.waitForURL('/form/success', { timeout: 10000 });
    },
    { maxAttempts: 3, delayMs: 1000 }
  );

  // Verify
  expect(apiMock.verifyCalled('**/api/form/submit')).toBe(true);
  await VisualTesting.takeScreenshot(page, 'form-success');
});
```

---

## Running Your Tests

```bash
# Run all tests
npm run test

# Run specific test
npm run test login.spec.ts

# Run with verbose output
npm run test:headed

# Run visualization/advanced tests
npm run test tests/advanced-testing.spec.ts

# Run specific test group
npm run test tests/advanced-testing.spec.ts -g "Retry Logic"

# Generate report after tests
npm run test && open playwright-report/index.html
```

---

## Tips for Best Results

### For Retry Logic
1. ✅ Use 3-5 max attempts
2. ✅ Set `timeout` to prevent infinite waits
3. ✅ Use `onRetry` callback for debugging
4. ⚠️ Don't retry permanent failures
5. ✅ Use conditional retry for specific errors

### For Fallback Locators
1. ✅ Order selectors from specific to general
2. ✅ Provide 3-5 different strategies
3. ✅ Use data attributes when available
4. ✅ Fall back to text matching
5. ⚠️ Avoid relying on classes that change

### For API Mocking
1. ✅ Mock all external dependencies
2. ✅ Use pattern matching `**/endpoint`
3. ✅ Verify API calls were made correctly
4. ✅ Use `getCallLogs()` for debugging
5. ⚠️ Don't mock everything - only dependencies

### For Visual Testing
1. ✅ Mask dynamic or sensitive content
2. ✅ Use appropriate threshold (0.1-0.2)
3. ✅ Screenshot only critical areas
4. ✅ Version your baselines
5. ⚠️ Review baseline changes before committing

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Retries not helping | Add `onRetry` callback, check maxAttempts |
| Element not found | Test selectors in browser console, add more fallbacks |
| Mocks not working | Check URL pattern matches request exactly |
| False visual diffs | Mask dynamic elements, increase threshold |
| Tests timeout | Reduce delay, increase maxAttempts intelligently |
| Click fails silently | Use `findVisibleElement`, add explicit waits |
| API calls not verified | Check pattern matches mock setup exactly |
| Screenshots empty | Verify element visibility, check permissions |

---

## Next Steps

1. **Read Full Documentation**
   - [ADVANCED_TESTING_GUIDE.md](ADVANCED_TESTING_GUIDE.md) - Comprehensive usage guide
   - [API_REFERENCE.md](API_REFERENCE.md) - Complete API documentation
   - [TROUBLESHOOTING_FAQ.md](TROUBLESHOOTING_FAQ.md) - Problem solving

2. **Review Test Examples**
   - [tests/advanced-testing.spec.ts](tests/advanced-testing.spec.ts) - 40+ working examples
   - Search for `test('` in your test files to see patterns

3. **Integrate with Your Tests**
   - Add retry logic to flaky tests
   - Replace flakiness with API mocking
   - Add visual regression tests for critical flows

4. **Customize for Your App**
   - Update selector strategies for your UI
   - Configure API mock scenarios for your endpoints
   - Define mask selectors for your dynamic content

---

## Help & Support

- **API Details**: See [API_REFERENCE.md](API_REFERENCE.md)
- **Usage Examples**: See [ADVANCED_TESTING_GUIDE.md](ADVANCED_TESTING_GUIDE.md)
- **Debugging**: See [TROUBLESHOOTING_FAQ.md](TROUBLESHOOTING_FAQ.md)
- **Test Examples**: See [tests/advanced-testing.spec.ts](tests/advanced-testing.spec.ts)

---

## Summary

You now have four powerful utilities:

| Utility | Purpose | Use When |
|---------|---------|----------|
| **RetryUtils** | Handle flaky tests | Tests fail intermittently |
| **FallbackLocator** | Find elements robustly | Selectors are brittle |
| **ApiMock** | Mock API responses | Tests depend on external APIs |
| **VisualTesting** | Visual regression testing | Need to catch UI changes |

Combine them together for maximum test robustness and reliability! 🚀
