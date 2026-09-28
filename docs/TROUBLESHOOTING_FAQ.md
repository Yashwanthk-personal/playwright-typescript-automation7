# Advanced Testing Utilities - Troubleshooting & FAQ

## Troubleshooting Guide

### Retry Logic Issues

#### Problem: Tests are retrying forever
**Symptoms:** Tests hang or timeout
**Solution:**
1. Check your `maxAttempts` setting - usually 3-5 is enough
2. Set a `timeout` parameter to prevent infinite waiting
3. Verify your async function can actually succeed - don't retry if fundamentally broken

```typescript
// BAD: May retry forever broken code
await RetryUtils.executeWithRetry(async () => {
  throw new Error('Network is down'); // Will keep retrying
});

// GOOD: Set sensible limits
await RetryUtils.executeWithRetry(
  async () => { /* operation */ },
  { maxAttempts: 3, timeout: 30000 }
);
```

---

#### Problem: Retries not helping - tests still fail
**Symptoms:** Test fails on first attempt and retries don't help
**Solution:**
1. The issue might not be transient - retries won't help permanent failures
2. Use conditional retry to only retry specific errors
3. Log what's happening with `onRetry` callback

```typescript
// GOOD: Only retry on specific errors
await RetryUtils.executeWithConditionalRetry(
  async () => { /* operation */ },
  (error) => {
    // Only retry timeouts, not permanent errors
    return error.message.includes('timeout') || 
           error.message.includes('ECONNRESET');
  },
  { maxAttempts: 3, onRetry: (attempt, error) => {
    console.log(`Retry ${attempt}: ${error.message}`);
  }}
);
```

---

#### Problem: Backoff delay too long/short
**Symptoms:** Tests taking too long or retrying too fast
**Solution:**
1. Adjust `delayMs` parameter
2. Use different backoff strategy (fixed vs exponential vs linear)

```typescript
// Slow exponential: 1s, 1.5s, 2.25s
await RetryUtils.executeWithRetry(async () => { /* ... */ }, 
  { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 1.5 });

// Fast exponential: 100ms, 200ms, 400ms
await RetryUtils.executeWithRetry(async () => { /* ... */ }, 
  { maxAttempts: 3, delayMs: 100, backoffMultiplier: 2 });

// Fixed: 500ms every time
await RetryUtils.executeWithFixedDelay(async () => { /* ... */ },
  { maxAttempts: 3, delayMs: 500 });
```

---

### Fallback Locator Issues

#### Problem: Elements not being found
**Symptoms:** Always gets null, even though element exists
**Solution:**
1. Verify selectors work in browser DevTools console
2. Add more fallback selectors
3. Check if element is inside an iframe
4. Add logging to see which selector is tried

```typescript
// Test selectors individually first
const selector1 = '#email';
const selector2 = '[name="email"]';
const selector3 = '[placeholder="Email"]';

// Try in DevTools: document.querySelector(selector1)
// If null, selector is wrong

// GOOD: Use multiple selectors
const locator = await FallbackLocator.findElement(page, [
  selector1,
  selector2,
  selector3,
  '//input[@type="email"]'  // XPath fallback
]);
```

---

#### Problem: Click/Fill operations failing silently
**Symptoms:** Returns false, no error thrown
**Solution:**
1. Check if element exists and is visible
2. Increase wait timeout before operation
3. Add explicit wait for visibility

```typescript
// GOOD: Wait for visibility first
await FallbackLocator.findVisibleElement(page, ['#submit'], 10000);
const success = await FallbackLocator.clickWithFallback(page, ['#submit']);

// GOOD: Use smart locator with wait
await page.waitForLoadState('networkidle');
await FallbackLocator.clickWithFallback(page, ['button[type="submit"]']);
```

---

#### Problem: Smart locator not finding elements
**Symptoms:** Element exists but smartLocator returns null
**Solution:**
1. Verify at least one selector matches
2. Break down your selector strategies
3. Test each strategy individually first

```typescript
// Debug smart locator
const smart = FallbackLocator.smartLocator(page, {
  cssSelectors: ['#email'],
  texts: ['Email address'],
  roles: [{ role: 'textbox', names: ['Email'] }]
});

// Test each strategy separately first
const bySelector = await page.locator('#email').isVisible();
const byText = await page.getByText('Email address').isVisible();
const byRole = await page.getByRole('textbox', { name: 'Email' }).isVisible();

// Once you know what works, use smartLocator
```

---

#### Problem: Flaky locator finding - works sometimes, fails others
**Symptoms:** Test passes sometimes, fails sometimes
**Solution:**
1. Element might be hidden/shown dynamically
2. Use `findVisibleElement` instead of `findElement`
3. Add explicit waits before finding

```typescript
// BAD: May find hidden element
const locator = await FallbackLocator.findElement(page, ['#modal']);

// GOOD: Wait for visibility
const locator = await FallbackLocator.findVisibleElement(
  page, 
  ['#modal'],
  5000 // wait up to 5 seconds
);
```

---

### API Mocking Issues

#### Problem: Mocks not intercepting API calls
**Symptoms:** Real API is called despite mocking setup
**Solution:**
1. URL pattern must match exactly (check protocol, host, path, query)
2. Pattern matching is case-sensitive
3. Order matters - first matching route wins

```typescript
// Correct patterns
await apiMock.mockSuccess(page, '**/api/users', {}); // Any protocol/host
await apiMock.mockSuccess(page, 'https://api.example.com/api/users', {});
await apiMock.mockSuccess(page, '**/users', {}); // Partial path

// Wrong patterns (won't match)
await apiMock.mockSuccess(page, '/api/users', {}); // Missing **
await apiMock.mockSuccess(page, 'api/users', {}); // Missing slashes
```

---

#### Problem: Wrong response being returned
**Symptoms:** Getting unexpected response data
**Solution:**
1. Check URL pattern matches request
2. Verify response format is correct
3. Check if multiple mocks match - first one wins

```typescript
// Set route-specific mocks
await apiMock.mockSuccess(page, '**/api/users?id=1', { id: 1, name: 'John' });
await apiMock.mockSuccess(page, '**/api/users?id=2', { id: 2, name: 'Jane' });

// First matching route wins
// Request to /api/users calls first mock that matches GET pattern
```

---

#### Problem: Call verification failing
**Symptoms:** `verifyCalled()` returns false when API was called
**Solution:**
1. URL pattern in verify must match exactly what was mocked
2. Check if request was actually made
3. Use `getCallLogs()` to debug

```typescript
const apiMock = new ApiMock();

// Setup mock
await apiMock.mockSuccess(page, '**/api/users', { id: 1 });

// Make request somehow
await page.goto('/');

// Verify - pattern must match mock pattern
console.log(apiMock.getCallLogs()); // See what was called

// Correct pattern
expect(apiMock.verifyCalled('**/api/users')).toBe(true);
```

---

#### Problem: Dynamic mocking not working
**Symptoms:** Dynamic response handler not getting called
**Solution:**
1. Async handler might be throwing error
2. Request body parsing might fail
3. Add error handling in handler

```typescript
// GOOD: Safe dynamic handler
await apiMock.mockDynamic(page, '**/api/users', async (request) => {
  try {
    const body = await request.postDataJSON();
    return { success: true, id: body.id };
  } catch (error) {
    console.error('Handler error:', error);
    return { success: false, error: error.message };
  }
});
```

---

#### Problem: Paginated mock not working correctly
**Symptoms:** Getting wrong page of results
**Solution:**
1. Pagination expects `page` and `limit` query params
2. Params are case-sensitive
3. Check actual request params

```typescript
// Setup pagination
await apiMock.mockPaginated(page, '**/api/items', items, 10);

// Correct request format
await page.goto('https://api.example.com/api/items?page=1&limit=10');

// Wrong format (won't paginate)
await page.goto('https://api.example.com/api/items?p=1&l=10');
```

---

### Visual Testing Issues

#### Problem: Screenshots not being saved
**Symptoms:** No files created, path returned is empty
**Solution:**
1. Check data directory exists and has write permissions
2. Screenshot name might contain invalid characters
3. Element might be outside viewport

```typescript
// Use valid names (no special chars except -)
const path = await VisualTesting.takeScreenshot(page, 'login-page'); // Good
const path = await VisualTesting.takeScreenshot(page, 'login/page'); // Bad - contains /

// For elements, ensure they're visible
await page.locator('#element').scrollIntoViewIfNeeded();
const path = await VisualTesting.takeElementScreenshot(page, '#element', 'name');
```

---

#### Problem: Visual regression false positives
**Symptoms:** Screenshots are different but look identical
**Solution:**
1. Mask dynamic elements (timestamps, IDs, random content)
2. Increase threshold tolerance
3. Use appropriate comparison threshold

```typescript
// GOOD: Mask dynamic content
await VisualTesting.takeScreenshot(page, 'page', {
  mask: ['.timestamp', '.user-id', '.random-content'],
  threshold: 0.2  // 20% tolerance
});
```

---

#### Problem: Baseline not updating
**Symptoms:** Comparison always fails but `updateBaseline: true`
**Solution:**
1. Baseline directory might not exist
2. Permission issues writing baseline
3. Screenshot path mismatch

```typescript
// Explicitly create baseline
const match = await VisualTesting.compareWithBaseline(
  page,
  'homepage',
  { updateBaseline: true }  // Creates baseline if doesn't exist
);
```

---

#### Problem: Before/After screenshots not capturing correct state
**Symptoms:** Before and after look the same
**Solution:**
1. Ensure afterFn actually changes state
2. Add waits after state change
3. Capture screenshot at correct moment

```typescript
// GOOD: Wait after state change
const result = await VisualTesting.takeBeforeAfterScreenshots(
  page,
  'dialog-open',
  async () => {
    await page.goto('/page');
    await page.waitForLoadState('networkidle');
  },
  async () => {
    await page.click('button[data-action="open"]');
    await page.waitForSelector('.dialog'); // Wait for dialog
  }
);
```

---

#### Problem: Masked elements showing in screenshot
**Symptoms:** Mask not working, content still visible
**Solution:**
1. Selector must match element exactly
2. Mask happens before screenshot - verify selector works
3. Element must be at time of masking

```typescript
// Test mask selector first
const element = await page.locator('input[type="password"]');
const isVisible = await element.isVisible();
console.log('Password field visible:', isVisible);

// If visible, mask should work
await VisualTesting.takeScreenshot(page, 'form', {
  mask: ['input[type="password"]']
});
```

---

## FAQ

### Q: When should I use retry vs error handling?

A: Use retry for **transient failures** (timeouts, temporary network issues). Use error handling for **expected failures** (invalid input, not found).

```typescript
// Retry - transient network issue
await RetryUtils.executeWithRetry(
  () => page.goto('https://unstable-server.com'),
  { maxAttempts: 3 }
);

// Error handling - expected scenario
try {
  await page.click('#delete-button');
  await page.waitForSelector('.delete-confirmation');
} catch (error) {
  console.log('Deletion cancelled or failed');
}
```

---

### Q: How do I combine multiple fallback strategies?

A: Use `smartLocator` which tries CSS, XPath, roles, and text in order.

```typescript
const smart = FallbackLocator.smartLocator(page, {
  defaultSelector: '#email',  // Try first
  cssSelectors: ['[name="email"]', '.email-field'],  // Then these
  texts: ['Email address'],  // Then text matches
  roles: [{ role: 'textbox', names: ['Email'] }]  // Then roles
});

const locator = await smart.locator();
```

---

### Q: Can I mock different responses based on request body?

A: Yes, use `mockConditional` or `mockDynamic`.

```typescript
// Conditional - based on simple check
await apiMock.mockConditional(
  page,
  '**/api/login',
  (request) => request.url().includes('admin=true'),
  { role: 'admin' },  // If condition true
  { role: 'user' }    // If condition false
);

// Dynamic - parse request body
await apiMock.mockDynamic(
  page,
  '**/api/login',
  async (request) => {
    const body = await request.postDataJSON();
    return body.email === 'admin@test.com' 
      ? { role: 'admin' } 
      : { role: 'user' };
  }
);
```

---

### Q: How do I verify an API was NOT called?

A: Check call count is zero.

```typescript
const apiMock = new ApiMock();
await apiMock.mockSuccess(page, '**/api/analytics', {});

// User navigates without triggering analytics
await page.goto('/page');

// Verify analytics not called
expect(apiMock.getCallCount('**/api/analytics')).toBe(0);
```

---

### Q: How do I screenshot an element that's scrolled out of view?

A: Scroll into view first, then screenshot.

```typescript
const selector = '#bottom-content';

// Ensure element is visible
await page.locator(selector).scrollIntoViewIfNeeded();

// Now take screenshot
await VisualTesting.takeElementScreenshot(page, selector, 'name');
```

---

### Q: Can I use visual testing with dynamic content (timestamps)?

A: Yes, mask the dynamic elements.

```typescript
await VisualTesting.takeScreenshot(page, 'page', {
  mask: [
    '.timestamp',       // Hide timestamps
    '.user-id',         // Hide user IDs
    '[data-refresh]'    // Hide refreshed content
  ],
  threshold: 0.1  // Allow 10% difference
});
```

---

### Q: How do I handle flaky tests that are hard to retry?

A: Use fallback locators + retry + explicit waits.

```typescript
// Combination approach
await RetryUtils.executeWithRetry(
  async () => {
    // Wait for element to be stable
    await page.waitForLoadState('networkidle');
    
    // Use fallback locators
    const success = await FallbackLocator.clickWithFallback(
      page,
      ['#button', '[role="button"]', 'button']
    );
    
    if (!success) throw new Error('Could not click button');
  },
  { maxAttempts: 3, delayMs: 500 }
);
```

---

### Q: What's the difference between `findElement` and `findVisibleElement`?

A: `findElement` returns first match regardless of visibility. `findVisibleElement` waits for visibility.

```typescript
// Might find hidden element
const locator = await FallbackLocator.findElement(page, ['#hidden']);

// Waits for visibility (better for UI testing)
const locator = await FallbackLocator.findVisibleElement(
  page,
  ['#modal'],
  5000  // wait up to 5 seconds
);
```

---

### Q: How do I debug which selector is actually working?

A: Modify FallbackLocator to add logging, or test selectors in browser console manually.

```typescript
// Test each selector in browser
const selectors = ['#email', '[name="email"]', '[placeholder="Email"]'];

for (const selector of selectors) {
  const element = await page.locator(selector).isVisible();
  console.log(`${selector}: ${element}`);  // Shows which ones match
}

// Then use the working ones
```

---

### Q: Can I take screenshots at different viewport sizes?

A: Yes, either resize page or use multiple Page objects.

```typescript
// Method 1: Resize and screenshot
await page.setViewportSize({ width: 1920, height: 1080 });
await VisualTesting.takeScreenshot(page, 'desktop');

await page.setViewportSize({ width: 375, height: 667 });
await VisualTesting.takeScreenshot(page, 'mobile');

// Method 2: Create separate pages in test
const desktop = await context.newPage({ viewport: { width: 1920, height: 1080 } });
const mobile = await context.newPage({ viewport: { width: 375, height: 667 } });
```

---

### Q: How do I handle dynamic IDs or classes that change?

A: Use data attributes, roles, or text as fallbacks.

```typescript
// BAD: ID changes every page load
const locator = await FallbackLocator.findElement(page, [
  '#button-' + Math.random()  // Won't work!
]);

// GOOD: Use data attributes or text
const locator = await FallbackLocator.smartLocator(page, {
  dataAttributes: [{ key: 'testid', value: 'submit' }],  // Stable
  texts: ['Submit'],  // Text rarely changes
  roles: [{ role: 'button', names: ['Submit'] }]  // Semantic
});
```

---

### Q: Should I retry individual operations or entire tests?

A: Individual operations for targeted retry, entire test for overall resilience.

```typescript
// Retry individual operation
await RetryUtils.executeWithRetry(
  () => page.goto('https://unstable-api.com')
);

// Retry entire test
test.describe('flaky feature', () => {
  test.describe.configure({ retries: 2 });  // Playwright built-in
  
  test('should work despite flakiness', async () => {
    // Test code
  });
});
```

---

## Performance Tips

### General
- Retry limits should be 3-5 max
- Use fixed delay for predictable waits
- Use exponential backoff for unpredictable waits

### Fallback Locators
- Most specific selectors first (IDs, data attrs, then classes, then elements)
- Minimize number of fallback selectors (3-5 typically)
- Cache expensive selectors

### API Mocking
- Setup mocks before navigation
- Use patterns to match multiple URLs when possible
- Don't mock everything - only what tests need

### Visual Testing
- Mask everything that changes
- Use appropriate threshold (0.1-0.2 usually good)
- Screenshot only critical UI areas, not entire pages

---

## Common Patterns

### Robust Click
```typescript
// Combines retry, fallback, and wait
await RetryUtils.executeWithRetry(async () => {
  await page.waitForSelector('button', { state: 'visible' });
  const success = await FallbackLocator.clickWithFallback(page, [
    '#submit',
    '[role="button"]'
  ]);
  if (!success) throw new Error('Click failed');
}, { maxAttempts: 3 });
```

### Robust Form Fill
```typescript
const email = await FallbackLocator.findVisibleElement(page, [
  '#email',
  '[name="email"]'
]);
await email.fill('test@test.com');
```

### Test Isolation with Mocks
```typescript
await apiMock.mockRoutes(page, ApiMockScenarios.createLoginMocks());
// Test doesn't depend on real API
```

### Visual Regression Check
```typescript
await VisualTesting.takeScreenshot(page, 'homepage', {
  mask: VisualTesting.getMaskSelectors('auth')
});
```
