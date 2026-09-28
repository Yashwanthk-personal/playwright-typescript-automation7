# Advanced Testing Utilities Guide

## Overview

This guide covers four advanced testing utilities:

1. **Retry Logic** - Handle flaky tests with exponential backoff
2. **Fallback Locators** - Multiple selector strategies with fallback
3. **API Mocking** - Mock API responses for testing
4. **Visual Testing** - Screenshot-based testing and comparisons

---

## 1. Retry Logic (`utils/retry.utils.ts`)

Handle transient failures and flaky tests with intelligent retry strategies.

### Basic Usage

```typescript
import { RetryUtils } from '../utils/retry.utils';

// Retry with exponential backoff (default)
const result = await RetryUtils.executeWithRetry(
  async () => {
    // Your async operation
    return await fetchData();
  },
  {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 1.5
  }
);

// Retry with fixed delay
const result = await RetryUtils.executeWithFixedDelay(
  async () => { /* ... */ },
  { maxAttempts: 5, delayMs: 500 }
);

// Retry with linear backoff
const result = await RetryUtils.executeWithLinearBackoff(
  async () => { /* ... */ },
  { maxAttempts: 3, delayMs: 100, incrementMs: 50 }
);

// Retry with jitter (prevents thundering herd)
const result = await RetryUtils.executeWithJitter(
  async () => { /* ... */ },
  { maxAttempts: 5, delayMs: 1000 }
);
```

### Retry Strategies

**Exponential Backoff**: Delays grow exponentially
- Attempt 1: wait 1s
- Attempt 2: wait 1.5s
- Attempt 3: wait 2.25s

**Fixed Delay**: Same delay between retries
- All attempts: wait 500ms

**Linear Backoff**: Delays grow linearly
- Attempt 1: wait 100ms
- Attempt 2: wait 150ms
- Attempt 3: wait 200ms

**Jitter**: Add randomness to prevent synchronized failures
- Reduces thundering herd problem
- Useful for multiple clients retrying simultaneously

### Wait Until Condition

```typescript
// Retry until condition is true
await RetryUtils.waitUntil(
  async () => {
    const count = await page.locator('.item').count();
    return count > 5;
  },
  { maxAttempts: 10, delayMs: 500 }
);
```

### Conditional Retry

```typescript
// Retry only on specific errors
await RetryUtils.executeWithConditionalRetry(
  async () => { /* ... */ },
  error => error.message.includes('Timeout'),
  { maxAttempts: 5, delayMs: 1000 }
);
```

### Retry Callbacks

```typescript
// Get notified on each retry
await RetryUtils.executeWithRetry(
  async () => { /* ... */ },
  {
    maxAttempts: 3,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`);
    }
  }
);
```

### Safe Execution

```typescript
// Execute without throwing on failure
const result = await RetryUtils.tryExecute(
  async () => { /* ... */ }
);

// Returns null if fails, doesn't throw
```

### Sequential Retry

```typescript
// Retry multiple functions in sequence
const results = await RetryUtils.executeSequentialWithRetry(
  [
    async () => { /* operation 1 */ },
    async () => { /* operation 2 */ },
    async () => { /* operation 3 */ }
  ],
  { maxAttempts: 3 }
);
```

---

## 2. Fallback Locators (`utils/fallback.locator.ts`)

Try multiple selector strategies to find elements.

### Basic Usage

```typescript
import { FallbackLocator } from '../utils/fallback.locator';

// Try multiple selectors
const locator = await FallbackLocator.findElement(page, [
  '#email',
  '[name="email"]',
  '[placeholder="Email"]'
]);

// Click with fallback
const success = await FallbackLocator.clickWithFallback(page, [
  '.btn-login',
  '[role="button"]',
  'button:has-text("Login")'
]);

// Fill with fallback
const filled = await FallbackLocator.fillWithFallback(
  page,
  ['#password', '[name="password"]'],
  'myPassword123'
);
```

### Find by Different Strategies

```typescript
// Find by text
const locator = await FallbackLocator.findByText(page, [
  'Log in',
  'Sign in',
  'Login'
]);

// Find by role
const button = await FallbackLocator.findByRole(page, 'button', [
  'Submit',
  'Send',
  'Continue'
]);

// Find by data attribute
const element = await FallbackLocator.findByDataAttribute(page, [
  { key: 'testid', value: 'login-btn' },
  { key: 'cy', value: 'login-button' }
]);
```

### Smart Locator

```typescript
// Try multiple strategies in order
const smart = FallbackLocator.smartLocator(page, {
  defaultSelector: '#email',
  cssSelectors: ['[name="email"]', '.email-input'],
  xpaths: ['//input[@type="email"]'],
  texts: ['Enter email'],
  roles: [{
    role: 'textbox',
    names: ['Email', 'Email address']
  }]
});

const locator = await smart.locator();
const locatorOrNull = await smart.tryAll();
```

### Find Specific Elements

```typescript
// Find button
const button = await FallbackLocator.findButton(page, [
  'Login',
  'Sign in',
  'Submit'
]);

// Find input field
const input = await FallbackLocator.findInput(page, {
  ids: ['email', 'user-email'],
  names: ['email', 'user_email'],
  placeholders: ['Enter email'],
  labels: ['Email address'],
  selectors: ['.email-input', '[type="email"]']
});
```

### Wait for Visibility

```typescript
// Wait for any of multiple elements
const locator = await FallbackLocator.waitForAny(
  page,
  ['#modal', '.dialog', '[role="dialog"]'],
  10000 // timeout in ms
);

// Wait for all elements
const locators = await FallbackLocator.waitForAll(page, [
  '#email',
  '#password',
  'button[type="submit"]'
]);
```

---

## 3. API Mocking (`utils/api.mock.ts`)

Mock API responses for testing without real backend calls.

### Basic Mocking

```typescript
import { ApiMock, ApiMockScenarios } from '../utils/api.mock';

const apiMock = new ApiMock();

// Mock successful response
await apiMock.mockSuccess(page, '**/api/products', [
  { id: 1, name: 'Product1', price: 99.99 }
]);

// Mock with status code
await apiMock.mockRoute(page, {
  pattern: '**/api/users',
  response: { id: 1, email: 'user@test.com' },
  status: 200,
  delay: 500 // ms
});

// Mock error response
await apiMock.mockError(page, '**/api/error', 'Server Error', 500);

// Mock specific status codes
await apiMock.mockNotFound(page, '**/api/notfound');
await apiMock.mockUnauthorized(page, '**/api/secure');
await apiMock.mockForbidden(page, '**/api/admin');
```

### Paginated Response

```typescript
const items = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));

await apiMock.mockPaginated(
  page,
  '**/api/items',
  items,
  10 // page size
);

// Requests to:
// /api/items?page=1&limit=10 -> returns items 1-10
// /api/items?page=2&limit=10 -> returns items 11-20
```

### Dynamic Response

```typescript
// Response based on request
await apiMock.mockDynamic(
  page,
  '**/api/users',
  async (request) => {
    const body = await request.postDataJSON();
    return { success: true, userId: body.id };
  }
);

// Conditional response
await apiMock.mockConditional(
  page,
  '**/api/data',
  (request) => request.url().includes('valid=true'),
  { data: 'valid' },
  { error: 'Invalid request' }
);
```

### Predefined Scenarios

```typescript
// Use built-in mock scenarios
const loginMocks = ApiMockScenarios.createLoginMocks();
const productMocks = ApiMockScenarios.createProductMocks();
const cartMocks = ApiMockScenarios.createCartMocks();
const checkoutMocks = ApiMockScenarios.createCheckoutMocks();
const errorMocks = ApiMockScenarios.createErrorMocks();

await apiMock.mockRoutes(page, loginMocks);
```

### Verify API Calls

```typescript
// Track all calls
expect(apiMock.getCallCount()).toBeGreaterThan(0);

// Track specific endpoint
expect(apiMock.getCallCount('**/api/users')).toBe(1);

// Verify called
expect(apiMock.verifyCalled('**/api/users')).toBe(true);

// Verify called X times
expect(apiMock.verifyCalledTimes('**/api/users', 2)).toBe(true);

// Verify called with specific body
expect(apiMock.verifyCalledWithBody('**/api/users', {
  email: 'test@test.com'
})).toBe(true);

// Get all logs
const logs = apiMock.getCallLogs();
const userLogs = apiMock.getCallLogsByUrl('**/api/users');
```

### Response Interceptors

```typescript
const apiMock = new ApiMock();

// Add interceptor to modify all responses
apiMock.addResponseInterceptor(response => ({
  ...response,
  intercepted: true
}));

await apiMock.mockSuccess(page, '**/api/test', { data: 'value' });
```

---

## 4. Visual Testing (`utils/visual.testing.ts`)

Screenshot-based testing and visual regression detection.

### Basic Screenshots

```typescript
import { VisualTesting } from '../utils/visual.testing';

// Take full page screenshot
const path = await VisualTesting.takeScreenshot(page, 'homepage', {
  fullPage: true
});

// Take viewport screenshot
const path = await VisualTesting.takeScreenshot(page, 'viewport');

// Take element screenshot
const path = await VisualTesting.takeElementScreenshot(
  page,
  '#main-content',
  'main-content'
);
```

### Multiple Screenshots

```typescript
// Take screenshots of multiple elements
const screenshots = await VisualTesting.takeMultipleScreenshots(page, {
  header: 'header',
  navigation: 'nav',
  footer: 'footer',
  mainContent: '#main'
});

// Returns: { header: path, navigation: path, ... }
```

### Before/After Comparison

```typescript
const result = await VisualTesting.takeBeforeAfterScreenshots(
  page,
  'modal-interaction',
  async () => {
    // Before state
    await page.goto('https://example.com');
  },
  async () => {
    // After state
    await page.click('button');
    await page.waitForSelector('.modal');
  }
);

// result.before and result.after contain paths
```

### Interaction Screenshots

```typescript
// Capture screenshots during interaction steps
const screenshots = await VisualTesting.takeInteractionScreenshots(
  page,
  'checkout-flow',
  [
    {
      name: 'initial',
      action: async () => {
        await page.goto('/checkout');
      }
    },
    {
      name: 'shipping-form',
      action: async () => {
        await page.fill('#address', '123 Main St');
      },
      waitForSelector: '#shipping-options'
    },
    {
      name: 'payment',
      action: async () => {
        await page.click('#continue');
      },
      waitMs: 1000
    }
  ]
);
```

### Mask Sensitive Elements

```typescript
// Mask auth elements (passwords, etc.)
await VisualTesting.takeScreenshot(page, 'login-form', {
  mask: ['input[type="password"]', '.otp-code'],
  maskColor: '#999'
});

// Predefined masks
const authMasks = VisualTesting.getMaskSelectors('auth');
const personalMasks = VisualTesting.getMaskSelectors('personal');
const financialMasks = VisualTesting.getMaskSelectors('financial');
```

### Visual Regression Testing

```typescript
// Compare with baseline (creates baseline if doesn't exist)
const match = await VisualTesting.compareWithBaseline(page, 'login-page', {
  threshold: 0.2,
  updateBaseline: false
});

// Verify page visuals
await VisualTesting.verifyPageVisuals(page, 'homepage');
```

### Element State Verification

```typescript
// Verify element is visible
await VisualTesting.verifyElementVisible(page, '#submit-button');

// Verify element state
await VisualTesting.verifyElementState(
  page,
  'button[type="submit"]',
  'enabled'
);

// States: 'visible', 'hidden', 'enabled', 'disabled'
```

### Generate Report

```typescript
// Generate visual comparison report
const reportPath = VisualTesting.generateVisualReport('test-run');

// Open report in browser
// HTML file with before/after comparisons
```

### Directories

```typescript
// Get screenshot directory
const screenshotDir = VisualTesting.getScreenshotDir();

// Get baseline directory
const baselineDir = VisualTesting.getBaselineDir();

// Clear old screenshots
VisualTesting.clearOldScreenshots(7); // older than 7 days
```

---

## Combined Examples

### Retry + Fallback Locators

```typescript
await RetryUtils.executeWithRetry(
  async () => {
    const success = await FallbackLocator.clickWithFallback(page, [
      '#login-btn',
      '.login-button',
      '[role="button"]'
    ]);
    if (!success) throw new Error('Click failed');
  },
  { maxAttempts: 3, delayMs: 500 }
);
```

### API Mock + Visual Testing

```typescript
const apiMock = new ApiMock();
await apiMock.mockSuccess(page, '**/api/products', products);

// Navigate and capture visual
await page.goto('/products');
await VisualTesting.takeScreenshot(page, 'products-page');

// Verify API was called
expect(apiMock.verifyCalled('**/api/products')).toBe(true);
```

### Full Test Flow

```typescript
test('complete user flow with retries and visuals', async ({ page }) => {
  const apiMock = new ApiMock();

  // Setup mocks
  await apiMock.mockRoutes(page, ApiMockScenarios.createLoginMocks());

  // Navigate with retry
  await RetryUtils.executeWithRetry(async () => {
    await page.goto('/login');
  });

  // Find email field with fallback
  const email = await FallbackLocator.findInput(page, {
    ids: ['email'],
    names: ['email'],
    placeholders: ['Email']
  });

  // Fill and submit
  await email.fill('test@test.com');
  await FallbackLocator.clickWithFallback(page, ['button[type="submit"]']);

  // Take visual
  await VisualTesting.takeScreenshot(page, 'after-login');

  // Verify
  expect(apiMock.verifyCalled('**/api/login')).toBe(true);
});
```

---

## Best Practices

### Retry Logic

1. **Use appropriate backoff strategy** - Exponential for most cases
2. **Set reasonable max attempts** - Usually 3-5 is enough
3. **Add logging** - Use onRetry callback for debugging
4. **Don't retry everything** - Use conditional retry for specific errors
5. **Mind the timeout** - Set total timeout considering retries

### Fallback Locators

1. **Order by specificity** - Most specific selectors first
2. **Provide multiple strategies** - CSS, XPath, text, roles
3. **Use smart locator** - When many strategies needed
4. **Cache results** - Don't query same element multiple times
5. **Log failures** - Help debug selector issues

### API Mocking

1. **Mock all dependencies** - Ensure isolated tests
2. **Verify calls** - Assert APIs are called correctly
3. **Use predefined scenarios** - Reduces boilerplate
4. **Test error paths** - Mock 4xx and 5xx responses
5. **Add delays** - Simulate real timing when needed

### Visual Testing

1. **Mask sensitive data** - Before comparing
2. **Update baselines carefully** - Review changes
3. **Baseline versioning** - Keep historical baselines
4. **Element selection** - Be specific with selectors
5. **Document expected visuals** - In baseline directory

---

## Running Tests

```bash
# Run advanced tests
npm run test tests/advanced-testing.spec.ts

# Run specific group
npm run test tests/advanced-testing.spec.ts -g "Retry Logic"

# With headed mode
npm run test:headed tests/advanced-testing.spec.ts

# Generate report after
npm run test tests/advanced-testing.spec.ts && \
  open test-results/screenshots/report.html
```

---

## Troubleshooting

**Q: Retries aren't working?**
A: Check that your async operation is actually retryable and returns consistent state.

**Q: Fallback locators not finding elements?**
A: Add logging and try selectors individually in browser console.

**Q: API mocks not intercepting?**
A: Ensure URL pattern matches exactly (check query params).

**Q: Screenshots differ strangely?**
A: Check for animations, loading spinners, timestamps - mask them.

**Q: Visual regression false positives?**
A: Use higher threshold or mask dynamic elements.
