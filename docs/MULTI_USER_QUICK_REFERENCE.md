# Multi-User Testing Quick Reference

## Quick Start

### 1. Single User Test
```typescript
import { test } from '../fixtures/multi-user.fixtures';

test('login as single user', async ({ userContext }) => {
  console.log(userContext.email);
  // Use context to perform actions
});
```

### 2. Multiple Users - Sequential
```typescript
test('multiple users sequential', async ({ userContextList }) => {
  for (const user of userContextList) {
    // Perform action for each user
    console.log(user.email);
  }
});
```

### 3. Multiple Users - Parallel UI
```typescript
test('multiple users parallel ui', async ({ multiUserContextList }) => {
  await Promise.all(
    multiUserContextList.map(ctx => 
      ctx.loginPage.login(ctx.user.email, ctx.user.password)
    )
  );
});
```

### 4. Multiple Users - On Demand
```typescript
test('create users dynamically', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(5);
  
  try {
    // Use sessions
  } finally {
    sessions.forEach(s => s.page?.close());
  }
});
```

## Common Patterns

### Pattern 1: Parallel Login
```typescript
test('login all users in parallel', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(3);

  try {
    await Promise.all(
      sessions.map(s => 
        s.loginPage.login(s.user.email, s.user.password)
      )
    );
  } finally {
    sessions.forEach(s => s.page?.close());
  }
});
```

### Pattern 2: Collect Data from Users
```typescript
import { MultiUserTestHelper } from '../utils/common';

test('collect user data', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(3);
  const pages = new Map(sessions.map(s => [s.user.userId, s.page]));

  try {
    const data = await MultiUserTestHelper.collectDataFromMultipleUsers(
      pages,
      [{ selector: '.user-name', name: 'userName' }]
    );

    console.log(data); // Map of userId -> user data
  } finally {
    sessions.forEach(s => s.page?.close());
  }
});
```

### Pattern 3: Execute Action on All Users
```typescript
import { MultiUserTestHelper } from '../utils/common';

test('execute action on all users', async ({ userContextList }) => {
  const results = await MultiUserTestHelper.executeOnMultipleUsers(
    userContextList,
    async (user) => {
      // Do something with user
      return true;
    }
  );

  // Results is a Map<userId, boolean>
});
```

### Pattern 4: Verify Consistency
```typescript
import { MultiUserTestHelper } from '../utils/common';

test('verify price consistency', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(3);
  const pages = new Map(sessions.map(s => [s.user.userId, s.page]));

  try {
    // All users should see same price
    const consistency = await MultiUserTestHelper.verifyConsistency(
      sessions.map(s => s.user),
      pages,
      '.product-price',
      '99.99'
    );
  } finally {
    sessions.forEach(s => s.page?.close());
  }
});
```

### Pattern 5: Hybrid UI + API
```typescript
test('ui and api concurrently', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(2);

  try {
    const uiOp = (async () => {
      await sessions[0].loginPage.login(
        sessions[0].user.email,
        sessions[0].user.password
      );
    })();

    const apiOp = (async () => {
      await sessions[1].apiClient.init();
      // Perform API call
    })();

    await Promise.all([uiOp, apiOp]);
  } finally {
    sessions.forEach(s => s.page?.close());
  }
});
```

## Helper Methods Cheat Sheet

### UserContextManager
```typescript
import { UserContextManager } from '../utils/common';

// Create
UserContextManager.createUserContext(0);
UserContextManager.createMultipleUserContexts(5);

// Get
UserContextManager.getUserContext(userId);
UserContextManager.getUserContextByEmail('user@test.com');
UserContextManager.getUserContextBySessionId(sessionId);
UserContextManager.getDistributedUserContext(index);

// Update
UserContextManager.updateUserContext(userId, { authToken: 'xyz' });

// Manage
UserContextManager.removeUserContext(userId);
UserContextManager.clearAllContexts();
UserContextManager.contextExists(userId);
UserContextManager.getContextCount();
UserContextManager.getAllContexts();
```

### MultiUserTestHelper
```typescript
import { MultiUserTestHelper } from '../utils/common';

// Execute
await MultiUserTestHelper.executeOnMultipleUsers(users, action);
await MultiUserTestHelper.executeApiForMultipleUsers(users, apiClients, action);

// Login/Actions
await MultiUserTestHelper.loginMultipleUsers(pages, baseUrl);
await MultiUserTestHelper.addToCartMultipleUsers(pages, productName, qty);

// Verify
await MultiUserTestHelper.verifyConsistency(users, pages, selector, value);
await MultiUserTestHelper.waitForAllUsersReady(pages, selector);

// Collect
await MultiUserTestHelper.collectDataFromMultipleUsers(pages, extractors);

// Report
const summary = MultiUserTestHelper.getSummary(results, users);
```

### TestDataLoader
```typescript
import { TestDataLoader } from '../utils/common';

// Get users
TestDataLoader.getValidUsers();
TestDataLoader.getValidUserByIndex(0);
TestDataLoader.getValidUserByEmail('user@test.com');
TestDataLoader.getRandomValidUser();
TestDataLoader.getMultipleValidUsers(5);
TestDataLoader.getNthUser(index);

// Create contexts
TestDataLoader.createUserContexts(5);

// Filter
TestDataLoader.getUsersByFilter(user => user.firstName === 'Test');
```

## Setup & Teardown

### Always cleanup!
```typescript
test.beforeEach(() => {
  UserContextManager.clearAllContexts();
  TestDataLoader.clearCache();
});

test.afterEach(() => {
  UserContextManager.clearAllContexts();
});

test('my test', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(3);

  try {
    // Test code
  } finally {
    // Always cleanup
    sessions.forEach(s => s.page?.close());
    sessions.forEach(s => s.container?.cleanup());
  }
});
```

## Environment Variables

```bash
# Set number of concurrent users
PARALLEL_USERS=5 npm test

# Set base URL
DEMOWEBSHOP_BASE_URL=http://localhost:80 npm test

# Combined
PARALLEL_USERS=10 DEMOWEBSHOP_BASE_URL=http://localhost:80 npm test
```

## Fixture Comparison

| Fixture | Use Case |
|---------|----------|
| `userContext` | Single user tests |
| `multiUserContext` | Single user UI + API integration |
| `userContextList` | Multiple users (data only) |
| `multiUserContextList` | Multiple users (parallel UI/API) |
| `createUserSession` | Dynamic single user creation |
| `createMultipleUserSessions` | Dynamic multiple user creation |

## Common Errors & Fixes

### Error: "User index out of range"
**Fix:** Add more users to `testdata/users.json`

### Error: "Timeout waiting for selector"
**Fix:** Increase timeout or check selector:
```typescript
page.locator(selector).waitFor({ state: 'visible', timeout: 120000 });
```

### Error: "Browser context already closed"
**Fix:** Don't close context if fixture manages it. Only close created contexts:
```typescript
sessions.forEach(s => s.page?.close()); // OK
sessions.forEach(s => s.container?.cleanup()); // OK
```

### Error: "No user contexts available"
**Fix:** Create contexts before accessing:
```typescript
const sessions = await createMultipleUserSessions(3);
// Now contexts are available
```

## Performance Tips

1. **Use `multiUserContextList` for parallel tests** - Better resource usage
2. **Limit to 10-20 users** - Balance between concurrency and stability
3. **Use `Promise.allSettled()` instead of `Promise.all()`** - Handle failures gracefully
4. **Collect metrics** - Understand performance impact

```typescript
const startTime = Date.now();
await MultiUserTestHelper.executeOnMultipleUsers(users, action);
const duration = Date.now() - startTime;
console.log(`Completed ${users.length} users in ${duration}ms`);
```

## FAQ

**Q: Can I test 100+ concurrent users?**
A: Yes, but start with smaller numbers. Consider load testing tools instead.

**Q: How do I handle user-specific data?**
A: Use `UserContextManager.updateUserContext()` to store data per user.

**Q: Can I mix UI and API tests for same user?**
A: Yes! Use `multiUserContext` or `multiUserContextList`.

**Q: How do I get test results summary?**
A: Use `MultiUserTestHelper.getSummary()` method.

**Q: What if a user login fails?**
A: Use `Promise.allSettled()` to capture both successes and failures.
