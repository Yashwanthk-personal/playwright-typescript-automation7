# Multi-User Testing Framework

## Overview

This framework provides comprehensive support for multi-user testing scenarios in both UI (Playwright) and API testing contexts. It enables you to:

- Create and manage multiple concurrent user sessions
- Test simultaneous user interactions
- Verify data consistency across users
- Perform load testing with multiple parallel users
- Combine UI and API testing in hybrid scenarios

## Components

### 1. UserContextManager
Manages individual user contexts and sessions.

**Location:** `utils/common/user-context.manager.ts`

**Key Methods:**

```typescript
// Create single user context
const userContext = UserContextManager.createUserContext(0);

// Create multiple user contexts
const contexts = UserContextManager.createMultipleUserContexts(5);

// Get context by userId
const context = UserContextManager.getUserContext(userId);

// Get context by email
const context = UserContextManager.getUserContextByEmail('user@test.com');

// Update context with auth token
UserContextManager.updateUserContext(userId, { authToken: 'token123' });

// Get all contexts
const allContexts = UserContextManager.getAllContexts();

// Clear all contexts (cleanup)
UserContextManager.clearAllContexts();
```

### 2. Multi-User Fixtures
Provides Playwright test fixtures for multi-user scenarios.

**Location:** `fixtures/multi-user.fixtures.ts`

**Available Fixtures:**

#### Single User Context
```typescript
test('single user test', async ({ userContext }) => {
  console.log(userContext.email); // User email
  console.log(userContext.sessionId); // Unique session ID
});
```

#### Multi-User Context (UI + API)
```typescript
test('ui and api for single user', async ({ multiUserContext }) => {
  const { user, page, loginPage, apiClient } = multiUserContext;
  
  // Use UI
  await loginPage.login(user.email, user.password);
  
  // Use API
  await apiClient.init();
  // const response = await apiClient.execute({...});
});
```

#### Multiple User Contexts
```typescript
test('multiple users', async ({ userContextList }) => {
  // userContextList contains N users (default: 3)
  userContextList.forEach(user => {
    console.log(user.email);
  });
});
```

#### Multiple Multi-User Contexts (Parallel)
```typescript
test('parallel ui and api testing', async ({ multiUserContextList }) => {
  // Run operations in parallel for all users
  await Promise.all(
    multiUserContextList.map(async ctx => {
      await ctx.loginPage.login(ctx.user.email, ctx.user.password);
    })
  );
});
```

#### Dynamic User Session Creation
```typescript
test('create users on demand', async ({ createUserSession }) => {
  // Create single session
  const session1 = await createUserSession();
  
  // Create with specific user
  const session2 = await createUserSession('specific@email.com');
});
```

#### Multiple Dynamic Sessions
```typescript
test('create multiple sessions on demand', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(5);
  
  // Cleanup when done
  sessions.forEach(session => session.page?.close());
});
```

### 3. MultiUserTestHelper
Utility class for common multi-user test operations.

**Location:** `utils/common/multi-user-test.helper.ts`

**Key Methods:**

```typescript
// Execute action on all users in parallel
const results = await MultiUserTestHelper.executeOnMultipleUsers(
  users,
  async (user) => {
    // Your action here
    return someResult;
  }
);

// Login multiple users
const loggedInPages = await MultiUserTestHelper.loginMultipleUsers(
  pagesMap,
  'http://localhost:80'
);

// Add to cart for multiple users
const results = await MultiUserTestHelper.addToCartMultipleUsers(
  pages,
  'Product Name',
  1 // quantity
);

// Verify state consistency across users
const consistency = await MultiUserTestHelper.verifyConsistency(
  users,
  pages,
  '.price',
  '99.99'
);

// Wait for all users to reach a state
await MultiUserTestHelper.waitForAllUsersReady(
  pages,
  '.home-page-category',
  60000
);

// Collect data from multiple users
const data = await MultiUserTestHelper.collectDataFromMultipleUsers(
  pages,
  [
    { selector: '.user-name', name: 'name' },
    { selector: '.user-email', attribute: 'data-email', name: 'email' }
  ]
);

// Get summary of results
const summary = MultiUserTestHelper.getSummary(results, users);
console.log(`Success rate: ${summary.successRate}%`);
```

## Usage Examples

### Example 1: Simple Multi-User Login
```typescript
import { test } from '../fixtures/multi-user.fixtures';

test('multiple users login', async ({ multiUserContextList }) => {
  for (const context of multiUserContextList) {
    const { user, page, loginPage } = context;
    
    await page.goto('http://localhost:80');
    await loginPage.login(user.email, user.password);
  }
});
```

### Example 2: Concurrent Shopping
```typescript
test('concurrent shopping', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(3);
  
  try {
    // Login all users
    await Promise.all(
      sessions.map(s => 
        s.loginPage.login(s.user.email, s.user.password)
      )
    );
    
    // Add products in parallel
    await Promise.all(
      sessions.map(s =>
        s.page.getByText('Add to cart').click()
      )
    );
  } finally {
    sessions.forEach(s => s.page?.close());
  }
});
```

### Example 3: API Calls with Multiple Users
```typescript
test('api calls from multiple users', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(5);
  
  // Initialize all API clients
  await Promise.all(
    sessions.map(s => s.apiClient.init())
  );
  
  // Execute API calls in parallel
  const results = await Promise.allSettled(
    sessions.map(s =>
      s.apiClient.execute({
        endpoint: '/api/products',
        method: 'GET'
      })
    )
  );
});
```

### Example 4: Hybrid UI + API Testing
```typescript
test('ui action triggers api call', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(2);
  
  try {
    // User 1: Add product via UI
    const uiPromise = (async () => {
      const session = sessions[0];
      await session.loginPage.login(session.user.email, session.user.password);
      await session.page.getByText('Add to cart').click();
    })();
    
    // User 2: Check product availability via API
    const apiPromise = (async () => {
      const session = sessions[1];
      return session.apiClient.execute({
        endpoint: '/api/products/availability',
        method: 'GET'
      });
    })();
    
    await Promise.all([uiPromise, apiPromise]);
  } finally {
    sessions.forEach(s => s.page?.close());
  }
});
```

## Configuration

### Number of Parallel Users
Set via environment variable:
```bash
PARALLEL_USERS=5 npm test
```

### Base URL
```bash
DEMOWEBSHOP_BASE_URL=http://localhost:80 npm test
```

## Data Loading

Users are automatically loaded from `testdata/users.json`:

```json
{
  "validUsers": [
    {
      "email": "user1@test.com",
      "password": "Password@123",
      "firstName": "User",
      "lastName": "One"
    },
    {
      "email": "user2@test.com",
      "password": "Password@123",
      "firstName": "User",
      "lastName": "Two"
    }
  ]
}
```

Add more users to testdata/users.json for larger multi-user tests.

## Best Practices

1. **Always Cleanup Sessions**
   ```typescript
   try {
     // test code
   } finally {
     sessions.forEach(s => s.page?.close());
     UserContextManager.clearAllContexts();
   }
   ```

2. **Handle Errors Gracefully**
   ```typescript
   const results = await Promise.allSettled(promises);
   const errors = results.filter(r => r.status === 'rejected');
   ```

3. **Use Round-Robin for Distributed Testing**
   ```typescript
   const user = UserContextManager.getDistributedUserContext(testIndex);
   ```

4. **Collect Metrics**
   ```typescript
   const summary = MultiUserTestHelper.getSummary(results, users);
   console.log(`Success rate: ${summary.successRate}%`);
   ```

5. **Isolate Test Data**
   ```typescript
   test.beforeEach(() => {
     UserContextManager.clearAllContexts();
     TestDataLoader.clearCache();
   });
   ```

## Troubleshooting

### Issue: Too many concurrent connections
**Solution:** Reduce `PARALLEL_USERS` or increase server capacity

### Issue: Timeouts in parallel tests
**Solution:** Increase timeout values:
```typescript
await page.goto(baseUrl, { timeout: 120000 });
```

### Issue: Session conflicts
**Solution:** Ensure proper cleanup and unique session IDs:
```typescript
UserContextManager.clearAllContexts();
```

### Issue: API authentication failures
**Solution:** Ensure cookies/tokens are set correctly:
```typescript
UserContextManager.updateUserContext(userId, { 
  authToken: token,
  cookies: cookieMap 
});
```

## Advanced Scenarios

### Load Testing
```typescript
test('load test with 20 users', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(20);
  const startTime = Date.now();
  
  const results = await Promise.allSettled(
    sessions.map(s => s.loginPage.login(s.user.email, s.user.password))
  );
  
  const duration = Date.now() - startTime;
  console.log(`Completed 20 logins in ${duration}ms`);
});
```

### Data Synchronization Testing
```typescript
test('verify cart sync across users', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(2);
  
  // User 1 adds product
  await sessions[0].page.getByText('Add to cart').click();
  
  // User 2 checks inventory
  const inventory = await sessions[1].apiClient.execute({
    endpoint: '/api/products/123/inventory',
    method: 'GET'
  });
  
  expect(inventory.body.available).toBe(/* expected value */);
});
```

## Extending the Framework

### Custom Actions
```typescript
class CustomMultiUserActions {
  static async performCheckout(sessions) {
    return MultiUserTestHelper.executeOnMultipleUsers(
      sessions.map(s => s.user),
      async (user) => {
        const session = sessions.find(s => s.user.userId === user.userId);
        // Custom checkout logic
      }
    );
  }
}
```

### Custom Assertions
```typescript
expect.extend({
  async toHaveConsistentState(pages: Map<string, Page>, selector: string) {
    const values = await MultiUserTestHelper.collectDataFromMultipleUsers(pages, [{
      selector,
      name: 'state'
    }]);
    // Custom assertion logic
  }
});
```

## API Reference

See `utils/common/user-context.manager.ts`, `fixtures/multi-user.fixtures.ts`, and `utils/common/multi-user-test.helper.ts` for complete API documentation.

## Test Examples

See `tests/multi-user.spec.ts` for comprehensive test examples.
