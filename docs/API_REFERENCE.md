# Advanced Testing Utilities - API Reference

## Table of Contents

1. [RetryUtils](#retryutils)
2. [FallbackLocator](#fallbacklocator)
3. [ApiMock](#apimock)
4. [VisualTesting](#visualtesting)

---

## RetryUtils

### `executeWithRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>`

Execute an async function with exponential backoff retry.

**Parameters:**
- `fn` - The async function to retry
- `options` - Configuration object
  - `maxAttempts?: number` - Default: 3
  - `delayMs?: number` - Initial delay in milliseconds. Default: 1000
  - `backoffMultiplier?: number` - Multiplier for exponential backoff. Default: 2
  - `maxDelayMs?: number` - Maximum delay cap. Default: 30000
  - `timeout?: number` - Overall timeout in milliseconds
  - `onRetry?: (attempt: number, error: Error) => void` - Retry callback

**Returns:** Promise resolving to the function result

**Example:**
```typescript
const data = await RetryUtils.executeWithRetry(
  () => fetchData(),
  { maxAttempts: 5, delayMs: 500 }
);
```

---

### `executeWithLinearBackoff<T>(fn: () => Promise<T>, options?: LinearBackoffOptions): Promise<T>`

Execute with linearly increasing delays (100ms, 150ms, 200ms, ...).

**Parameters:**
- `fn` - The async function to retry
- `options`
  - `maxAttempts?: number` - Default: 3
  - `delayMs?: number` - Initial delay. Default: 100
  - `incrementMs?: number` - Increment per attempt. Default: 50
  - `timeout?: number` - Overall timeout
  - `onRetry?: (attempt: number, error: Error) => void`

**Returns:** Promise resolving to the function result

---

### `executeWithFixedDelay<T>(fn: () => Promise<T>, options?: FixedDelayOptions): Promise<T>`

Execute with fixed delay between retries.

**Parameters:**
- `fn` - The async function to retry
- `options`
  - `maxAttempts?: number` - Default: 3
  - `delayMs?: number` - Delay between attempts. Default: 1000
  - `timeout?: number` - Overall timeout
  - `onRetry?: (attempt: number, error: Error) => void`

**Returns:** Promise resolving to the function result

---

### `executeWithJitter<T>(fn: () => Promise<T>, options?: JitterOptions): Promise<T>`

Execute with random jitter to prevent thundering herd.

Adds random delay: `actual = delay * (0.5 + Math.random())`

**Parameters:**
- `fn` - The async function to retry
- `options`
  - `maxAttempts?: number` - Default: 3
  - `delayMs?: number` - Base delay. Default: 1000
  - `timeout?: number` - Overall timeout
  - `onRetry?: (attempt: number, error: Error) => void`

**Returns:** Promise resolving to the function result

---

### `executeWithCircuitBreaker<T>(fn: () => Promise<T>, options?: CircuitBreakerOptions): Promise<T>`

Execute with circuit breaker pattern - fails fast after threshold.

**Parameters:**
- `fn` - The async function to retry
- `options`
  - `maxAttempts?: number` - Default: 5
  - `failureThreshold?: number` - Fail after N consecutive errors. Default: 3
  - `delayMs?: number` - Delay between attempts. Default: 1000
  - `resetTimeoutMs?: number` - Time to attempt reset. Default: 5000

**Returns:** Promise resolving to the function result

**Throws:** `Error('Circuit breaker open')` when threshold exceeded

---

### `executeWithConditionalRetry<T>(fn: () => Promise<T>, shouldRetry: (error: Error) => boolean, options?: RetryOptions): Promise<T>`

Execute and retry only if a condition is met.

**Parameters:**
- `fn` - The async function to retry
- `shouldRetry` - Function to determine if should retry
- `options` - Same as `executeWithRetry`

**Examples:**
```typescript
// Retry only on timeout
await RetryUtils.executeWithConditionalRetry(
  () => fetchData(),
  error => error.message.includes('timeout'),
  { maxAttempts: 3 }
);

// Retry on specific status codes
await RetryUtils.executeWithConditionalRetry(
  () => apiCall(),
  error => [429, 503].includes(error.status),
  { maxAttempts: 5 }
);
```

---

### `waitUntil(condition: () => Promise<boolean>, options?: WaitOptions): Promise<void>`

Wait until a condition is true, retrying periodically.

**Parameters:**
- `condition` - Function returning boolean
- `options`
  - `maxAttempts?: number` - Default: 10
  - `delayMs?: number` - Poll interval. Default: 500
  - `timeout?: number` - Overall timeout

**Example:**
```typescript
await RetryUtils.waitUntil(
  async () => {
    const count = await page.locator('.item').count();
    return count === 5;
  },
  { maxAttempts: 20 }
);
```

---

### `executeWithJitter<T>(fn: () => Promise<T>, options?: JitterOptions): Promise<T>`

See [executeWithJitter](#executewithjtter) above.

---

### `tryExecute<T>(fn: () => Promise<T>, defaultValue?: T): Promise<T | null>`

Execute without throwing - returns null on failure.

**Parameters:**
- `fn` - The async function to execute
- `defaultValue` - Optional default if function fails

**Returns:** Promise<T | null>

**Example:**
```typescript
const result = await RetryUtils.tryExecute(
  () => maybeFails()
); // Returns null if fails, doesn't throw
```

---

### `executeSequentialWithRetry<T>(fns: Array<() => Promise<T>>, options?: RetryOptions): Promise<T[]>`

Execute multiple functions in sequence with retry on each.

**Parameters:**
- `fns` - Array of async functions
- `options` - Same as `executeWithRetry`

**Returns:** Promise<T[]> - Results in order

**Example:**
```typescript
const results = await RetryUtils.executeSequentialWithRetry(
  [
    () => setup(),
    () => test(),
    () => cleanup()
  ],
  { maxAttempts: 3 }
);
```

---

## FallbackLocator

### `findElement(page: Page, selectors: string[]): Promise<Locator | null>`

Try selectors in order, return first match.

**Parameters:**
- `page` - Playwright Page
- `selectors` - Array of CSS selectors to try

**Returns:** First matching Locator or null

**Example:**
```typescript
const locator = await FallbackLocator.findElement(page, [
  '#email',
  '[name="email"]',
  '[placeholder="Email"]'
]);
```

---

### `findElementOrThrow(page: Page, selectors: string[]): Promise<Locator>`

Find element or throw error if not found.

**Parameters:**
- `page` - Playwright Page
- `selectors` - Array of CSS selectors

**Returns:** Matching Locator

**Throws:** `Error('No element found')`

---

### `findVisibleElement(page: Page, selectors: string[], timeoutMs: number = 5000): Promise<Locator | null>`

Find element and wait for visibility.

**Parameters:**
- `page` - Playwright Page
- `selectors` - Array of CSS selectors
- `timeoutMs` - Wait timeout

**Returns:** Visible Locator or null

---

### `clickWithFallback(page: Page, selectors: string[], options?: ClickOptions): Promise<boolean>`

Click element trying multiple selectors.

**Parameters:**
- `page` - Playwright Page
- `selectors` - Array of CSS selectors to try
- `options` - Playwright click options (button, clickCount, etc.)

**Returns:** true if clicked, false if not found

**Example:**
```typescript
const clicked = await FallbackLocator.clickWithFallback(page, [
  '.btn-login',
  '[role="button"]',
  'button'
]);
```

---

### `fillWithFallback(page: Page, selectors: string[], value: string, options?: FillOptions): Promise<boolean>`

Fill input trying multiple selectors.

**Parameters:**
- `page` - Playwright Page
- `selectors` - Array of CSS selectors
- `value` - Value to fill
- `options` - Playwright fill options (delay, etc.)

**Returns:** true if filled, false if not found

---

### `getTextWithFallback(page: Page, selectors: string[]): Promise<string | null>`

Get text content with fallback selectors.

**Parameters:**
- `page` - Playwright Page
- `selectors` - Array of CSS selectors

**Returns:** Text content or null

---

### `getAttributeWithFallback(page: Page, selectors: string[], attributeName: string): Promise<string | null>`

Get attribute value with fallback.

**Parameters:**
- `page` - Playwright Page
- `selectors` - Array of CSS selectors
- `attributeName` - Attribute name to get

**Returns:** Attribute value or null

---

### `findByText(page: Page, texts: string[]): Promise<Locator | null>`

Find element by text content (case-insensitive).

**Parameters:**
- `page` - Playwright Page
- `texts` - Array of text strings to match

**Returns:** Matching Locator or null

**Example:**
```typescript
const button = await FallbackLocator.findByText(page, [
  'Log in',
  'Sign in',
  'Login'
]);
```

---

### `findByRole(page: Page, role: string, names?: string[]): Promise<Locator | null>`

Find element by accessibility role.

**Parameters:**
- `page` - Playwright Page
- `role` - Role name (button, link, textbox, etc.)
- `names` - Optional array of accessible names

**Returns:** Matching Locator or null

**Example:**
```typescript
const button = await FallbackLocator.findByRole(page, 'button', [
  'Submit',
  'Send'
]);
```

---

### `findByDataAttribute(page: Page, attributes: Array<{key: string, value: string}>): Promise<Locator | null>`

Find by data attributes (data-testid, data-cy, etc.).

**Parameters:**
- `page` - Playwright Page
- `attributes` - Array of {key, value} pairs

**Returns:** Matching Locator or null

**Example:**
```typescript
const element = await FallbackLocator.findByDataAttribute(page, [
  { key: 'testid', value: 'submit-btn' },
  { key: 'cy', value: 'submit' }
]);
```

---

### `smartLocator(page: Page, options: SmartLocatorOptions): SmartLocator`

Combine multiple strategies for robust finding.

**Parameters:**
- `page` - Playwright Page
- `options` - Configuration object
  - `defaultSelector?: string` - Primary selector
  - `cssSelectors?: string[]` - Fallback CSS selectors
  - `xpaths?: string[]` - XPath selectors
  - `texts?: string[]` - Text to match
  - `roles?: Array<{role: string, names?: string[]}>` - Roles and names
  - `dataAttributes?: Array<{key: string, value: string}>` - Data attributes

**Returns:** SmartLocator object with methods:
- `locator(): Promise<Locator>` - Get best match or null
- `tryAll(): Promise<Locator | null>` - Try all strategies
- `waitVisible(timeout): Promise<Locator>` - Wait for visibility

**Example:**
```typescript
const smart = FallbackLocator.smartLocator(page, {
  defaultSelector: '#email',
  cssSelectors: ['[name="email"]'],
  texts: ['Email address'],
  roles: [{ role: 'textbox', names: ['Email'] }]
});

const locator = await smart.locator();
```

---

### `findButton(page: Page, texts: string[]): Promise<Locator | null>`

Find button by text.

**Parameters:**
- `page` - Playwright Page
- `texts` - Array of button texts

**Returns:** Matching Locator or null

---

### `findInput(page: Page, options: FindInputOptions): Promise<Locator | null>`

Find input by various attributes.

**Parameters:**
- `page` - Playwright Page
- `options` - Object with properties:
  - `ids?: string[]`
  - `names?: string[]`
  - `placeholders?: string[]`
  - `labels?: string[]`
  - `selectors?: string[]`
  - `types?: string[]` - Input types (email, password, etc.)

**Returns:** Matching Locator or null

**Example:**
```typescript
const input = await FallbackLocator.findInput(page, {
  names: ['email'],
  placeholders: ['Enter email'],
  types: ['email']
});
```

---

### `waitForAny(page: Page, selectors: string[], timeoutMs?: number): Promise<Locator | null>`

Wait for any of multiple elements to appear.

**Parameters:**
- `page` - Playwright Page
- `selectors` - Array of CSS selectors
- `timeoutMs` - Wait timeout

**Returns:** First element found or null

---

### `waitForAll(page: Page, selectors: string[], timeoutMs?: number): Promise<Locator[]>`

Wait for all elements to appear.

**Parameters:**
- `page` - Playwright Page
- `selectors` - Array of CSS selectors
- `timeoutMs` - Wait timeout

**Returns:** Array of all found Locators

---

## ApiMock

### `mockRoute(page: Page, options: MockRouteOptions): Promise<void>`

Setup a single mock route.

**Parameters:**
- `page` - Playwright Page
- `options`
  - `pattern: string` - URL pattern (e.g., '**/api/users')
  - `response: any` - Response body
  - `status?: number` - HTTP status code (default: 200)
  - `headers?: Record<string, string>` - Response headers
  - `delay?: number` - Response delay in ms

**Example:**
```typescript
await apiMock.mockRoute(page, {
  pattern: '**/api/users',
  response: { id: 1, name: 'John' },
  status: 200,
  delay: 500
});
```

---

### `mockRoutes(page: Page, routes: MockRouteOptions[]): Promise<void>`

Setup multiple mock routes.

**Parameters:**
- `page` - Playwright Page
- `routes` - Array of MockRouteOptions

---

### `mockSuccess(page: Page, pattern: string, response: any, delay?: number): Promise<void>`

Mock successful (200) response.

**Parameters:**
- `page` - Playwright Page
- `pattern` - URL pattern
- `response` - Response body
- `delay` - Optional response delay in ms

---

### `mockError(page: Page, pattern: string, message: string, status: number = 500, delay?: number): Promise<void>`

Mock error response.

**Parameters:**
- `page` - Playwright Page
- `pattern` - URL pattern
- `message` - Error message
- `status` - HTTP status code
- `delay` - Optional response delay

---

### `mockNotFound(page: Page, pattern: string): Promise<void>`

Mock 404 Not Found response.

---

### `mockUnauthorized(page: Page, pattern: string): Promise<void>`

Mock 401 Unauthorized response.

---

### `mockForbidden(page: Page, pattern: string): Promise<void>`

Mock 403 Forbidden response.

---

### `mockPaginated(page: Page, pattern: string, items: any[], pageSize: number): Promise<void>`

Mock paginated response with query parameters.

**Parameters:**
- `page` - Playwright Page
- `pattern` - URL pattern
- `items` - Array of items to paginate
- `pageSize` - Items per page

**Example:**
```typescript
await apiMock.mockPaginated(page, '**/api/items', items, 10);

// Requests:
// /api/items?page=1&limit=10
// /api/items?page=2&limit=10
```

---

### `mockDynamic(page: Page, pattern: string, handler: (request: Request) => Promise<any>): Promise<void>`

Mock with dynamic response based on request.

**Parameters:**
- `page` - Playwright Page
- `pattern` - URL pattern
- `handler` - Async function receiving Request, returns response

**Example:**
```typescript
await apiMock.mockDynamic(page, '**/api/users', async (request) => {
  const body = await request.postDataJSON();
  return { success: true, id: body.id };
});
```

---

### `mockConditional(page: Page, pattern: string, condition: (request: Request) => boolean, onTrue: any, onFalse: any): Promise<void>`

Mock with conditional response.

**Parameters:**
- `page` - Playwright Page
- `pattern` - URL pattern
- `condition` - Function to test request
- `onTrue` - Response if condition is true
- `onFalse` - Response if condition is false

---

### `addResponseInterceptor(handler: (response: any) => any): void`

Add interceptor to modify all responses.

**Parameters:**
- `handler` - Function to modify response

---

### `getCallLog(index: number): CallLog | undefined`

Get specific call log by index.

**Parameters:**
- `index` - Call index

**Returns:** CallLog object with:
- `url: string`
- `method: string`
- `body?: any`
- `timestamp: number`
- `response: any`

---

### `getCallLogs(): CallLog[]`

Get all recorded API calls.

**Returns:** Array of all CallLog objects

---

### `getCallLogsByUrl(pattern: string): CallLog[]`

Get calls matching URL pattern.

**Parameters:**
- `pattern` - URL pattern to match

**Returns:** Filtered CallLog array

---

### `getCallCount(pattern?: string): number`

Get count of API calls.

**Parameters:**
- `pattern` - Optional URL pattern to filter

**Returns:** Number of calls

---

### `verifyCalled(pattern: string): boolean`

Check if endpoint was called.

**Parameters:**
- `pattern` - URL pattern

**Returns:** true if called

---

### `verifyCalledTimes(pattern: string, times: number): boolean`

Check if endpoint was called specific number of times.

**Parameters:**
- `pattern` - URL pattern
- `times` - Expected number of calls

**Returns:** true if called that many times

---

### `verifyCalledWithBody(pattern: string, body: any): boolean`

Check if called with specific request body.

**Parameters:**
- `pattern` - URL pattern
- `body` - Expected request body

**Returns:** true if found matching call

---

## ApiMockScenarios

Static factory class for preset mock scenarios.

### `createLoginMocks(): MockRouteOptions[]`

Returns mocks for login flow:
- `POST /api/auth/login` - Returns: `{ token, user }`
- `POST /api/auth/logout` - Returns: `{ success: true }`
- `GET /api/auth/me` - Returns: `{ id, email, name }`

---

### `createProductMocks(): MockRouteOptions[]`

Returns mocks for product management:
- `GET /api/products` - Returns: Product list (paginated)
- `GET /api/products/:id` - Returns: Single product
- `POST /api/products` - Returns: Created product
- `PUT /api/products/:id` - Returns: Updated product
- `DELETE /api/products/:id` - Returns: `{ success: true }`

---

### `createCartMocks(): MockRouteOptions[]`

Returns mocks for shopping cart:
- `GET /api/cart` - Returns: Cart items
- `POST /api/cart` - Returns: Added item
- `PUT /api/cart/items/:id` - Returns: Updated item
- `DELETE /api/cart/items/:id` - Returns: `{ success: true }`

---

### `createCheckoutMocks(): MockRouteOptions[]`

Returns mocks for checkout flow:
- `POST /api/orders` - Returns: Created order
- `POST /api/orders/:id/payment` - Returns: Payment result
- `GET /api/orders/:id` - Returns: Order details

---

### `createErrorMocks(): MockRouteOptions[]`

Returns mocks for error scenarios:
- Various endpoints returning 4xx and 5xx errors

---

## VisualTesting

### `takeScreenshot(page: Page, name: string, options?: ScreenshotOptions): Promise<string>`

Take page screenshot.

**Parameters:**
- `page` - Playwright Page
- `name` - Screenshot name/identifier
- `options`
  - `fullPage?: boolean` - Full page vs viewport (default: false)
  - `mask?: string[]` - CSS selectors to mask
  - `waitForSelector?: string` - Wait for element before capturing
  - `waitMs?: number` - Wait time in ms
  - `maskColor?: string` - Color for mask (default: '#666')

**Returns:** Path to saved screenshot

**Example:**
```typescript
const path = await VisualTesting.takeScreenshot(page, 'login-page', {
  mask: ['input[type="password"]'],
  waitForSelector: '.page-loaded'
});
```

---

### `takeElementScreenshot(page: Page, selector: string, name: string): Promise<string>`

Take screenshot of specific element.

**Parameters:**
- `page` - Playwright Page
- `selector` - CSS selector of element
- `name` - Screenshot name

**Returns:** Path to saved screenshot

---

### `compareWithBaseline(page: Page, name: string, options?: CompareOptions): Promise<boolean>`

Compare screenshot with baseline.

**Parameters:**
- `page` - Playwright Page
- `name` - Screenshot name
- `options`
  - `threshold?: number` - Match threshold 0-1 (default: 0.2)
  - `updateBaseline?: boolean` - Update baseline if different (default: false)
  - `mask?: string[]` - Elements to mask

**Returns:** true if matches baseline

**Example:**
```typescript
const match = await VisualTesting.compareWithBaseline(page, 'homepage', {
  threshold: 0.15,
  updateBaseline: false
});
```

---

### `takeMultipleScreenshots(page: Page, screenshots: Record<string, string>): Promise<Record<string, string>>`

Take multiple screenshots of elements.

**Parameters:**
- `page` - Playwright Page
- `screenshots` - Object: `{ screenshotName: selector, ... }`

**Returns:** Object with screenshot paths

**Example:**
```typescript
const shots = await VisualTesting.takeMultipleScreenshots(page, {
  header: 'header',
  navigation: 'nav',
  footer: 'footer'
});

// shots.header, shots.navigation, shots.footer
```

---

### `takeInteractionScreenshots(page: Page, name: string, steps: InteractionStep[]): Promise<Record<string, string>>`

Take screenshots during interaction steps.

**Parameters:**
- `page` - Playwright Page
- `name` - Test name
- `steps` - Array of steps:
  - `name: string` - Step name
  - `action: () => Promise<void>` - Action to perform
  - `waitForSelector?: string` - Wait for element after action
  - `waitMs?: number` - Wait time after action

**Returns:** Object with screenshot paths for each step

---

### `verifyPageVisuals(page: Page, name: string): Promise<boolean>`

Verify page visuals against baseline.

**Parameters:**
- `page` - Playwright Page
- `name` - Screenshot name

**Returns:** true if matches baseline

---

### `getMaskSelectors(category: string): string[]`

Get predefined mask selectors.

**Parameters:**
- `category` - 'auth', 'personal', or 'financial'

**Returns:** Array of CSS selectors to mask

**Categories:**
- `'auth'` - Passwords, OTP, tokens
- `'personal'` - Names, emails, phone numbers
- `'financial'` - Credit cards, account numbers, amounts

---

### `takeBeforeAfterScreenshots(page: Page, name: string, beforeFn: () => Promise<void>, afterFn: () => Promise<void>): Promise<{before: string, after: string}>`

Take before and after screenshots around actions.

**Parameters:**
- `page` - Playwright Page
- `name` - Test name
- `beforeFn` - Setup that runs before screenshot
- `afterFn` - Actions that happen between screenshots

**Returns:** Object with `before` and `after` paths

---

### `verifyElementVisible(page: Page, selector: string): Promise<void>`

Assert element is visible.

**Parameters:**
- `page` - Playwright Page
- `selector` - CSS selector

**Throws:** If element not visible

---

### `verifyElementState(page: Page, selector: string, state: 'visible' | 'hidden' | 'enabled' | 'disabled'): Promise<void>`

Assert element state.

**Parameters:**
- `page` - Playwright Page
- `selector` - CSS selector
- `state` - Expected state

**Throws:** If state doesn't match

---

### `getScreenshotDir(): string`

Get screenshots directory path.

**Returns:** Absolute path to screenshots directory

---

### `getBaselineDir(): string`

Get baseline directory path.

**Returns:** Absolute path to baseline directory

---

### `clearOldScreenshots(days: number): void`

Delete screenshots older than specified days.

**Parameters:**
- `days` - Age threshold in days

---

### `generateVisualReport(testName: string): string`

Generate HTML report with screenshot comparisons.

**Parameters:**
- `testName` - Name for the report

**Returns:** Path to generated HTML report

---

## Type Definitions

### RetryOptions
```typescript
{
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  timeout?: number;
  onRetry?: (attempt: number, error: Error) => void;
}
```

### SmartLocatorOptions
```typescript
{
  defaultSelector?: string;
  cssSelectors?: string[];
  xpaths?: string[];
  texts?: string[];
  roles?: Array<{ role: string; names?: string[] }>;
  dataAttributes?: Array<{ key: string; value: string }>;
}
```

### MockRouteOptions
```typescript
{
  pattern: string;
  response: any;
  status?: number;
  headers?: Record<string, string>;
  delay?: number;
}
```

### CallLog
```typescript
{
  url: string;
  method: string;
  body?: any;
  timestamp: number;
  response: any;
}
```

### ScreenshotOptions
```typescript
{
  fullPage?: boolean;
  mask?: string[];
  waitForSelector?: string;
  waitMs?: number;
  maskColor?: string;
}
```

### InteractionStep
```typescript
{
  name: string;
  action: () => Promise<void>;
  waitForSelector?: string;
  waitMs?: number;
}
```
