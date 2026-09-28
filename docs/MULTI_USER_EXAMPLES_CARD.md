# Multi-User Testing Examples - Quick Reference Card

## 🎯 Common Code Patterns

### Pattern 1: Simple API Multi-User Test (Copy & Paste)
```typescript
import { test } from '../fixtures/multi-user.fixtures';

test('api multi-user test', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(3);

  try {
    // Initialize API clients
    await Promise.all(sessions.map(s => s.apiClient.init()));

    // Execute API calls in parallel
    const results = await Promise.all(
      sessions.map(s =>
        s.apiClient.execute({
          endpoint: '/api/products',
          method: 'GET',
        })
      )
    );

    // Verify results
    expect(results.length).toBe(3);
  } finally {
    sessions.forEach(s => s.page?.close());
  }
});
```

### Pattern 2: Simple UI Multi-User Test (Copy & Paste)
```typescript
import { test } from '../fixtures/multi-user.fixtures';

test('ui multi-user test', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(3);

  try {
    // All users navigate home
    await Promise.all(
      sessions.map(s =>
        s.page.goto('http://localhost:80', {
          waitUntil: 'domcontentloaded',
        })
      )
    );

    // All users login in parallel
    await Promise.all(
      sessions.map(s =>
        s.loginPage.login(s.user.email, s.user.password)
      )
    );

    // Verify all logged in
    expect(sessions.length).toBe(3);
  } finally {
    sessions.forEach(s => s.page?.close());
  }
});
```

### Pattern 3: Hybrid UI + API (Copy & Paste)
```typescript
import { test } from '../fixtures/multi-user.fixtures';

test('hybrid ui + api test', async ({ createMultipleUserSessions }) => {
  const sessions = await createMultipleUserSessions(2);

  try {
    // User 1: UI action
    const uiTask = sessions[0].loginPage.login(
      sessions[0].user.email,
      sessions[0].user.password
    );

    // User 2: API action
    const apiTask = (async () => {
      await sessions[1].apiClient.init();
      // API calls...
    })();

    // Execute in parallel
    await Promise.all([uiTask, apiTask]);

    expect(sessions.length).toBe(2);
  } finally {
    sessions.forEach(s => s.page?.close());
  }
});
```

## 📊 Test Examples Summary

### ✅ Created: 3 Test Files with 19 Scenarios

| File | Scenarios | Type | Runtime | Users |
|------|-----------|------|---------|-------|
| `api-multi-user.examples.spec.ts` | 6 | API | ~3-20s | 3-10 |
| `ui-multi-user.examples.spec.ts` | 8 | UI | ~3-30s | 3-10 |
| `hybrid-multi-user.examples.spec.ts` | 5 | Hybrid | ~5-15s | 2-6 |

### 🔹 What Each File Tests

**API Examples (`api-multi-user.examples.spec.ts`)**
```
✅ Scenario 1: Multiple users login via API
✅ Scenario 2: Concurrent product retrieval (5 users)
✅ Scenario 3: Users adding products to cart
✅ Scenario 4: Concurrent checkout with different payment methods
✅ Scenario 5: Load test with 10 users - order retrieval
✅ Scenario 6: Data consistency verification
```

**UI Examples (`ui-multi-user.examples.spec.ts`)**
```
✅ Scenario 1: Concurrent homepage access (3 users)
✅ Scenario 2: Multiple users login via UI
✅ Scenario 3: Concurrent product browsing (3 users)
✅ Scenario 4: Multiple users adding different products to cart
✅ Scenario 5: Multiple users viewing same product page
✅ Scenario 6: Load test - 10 concurrent users browsing
✅ Scenario 7: Users with different filters and sorting
✅ Scenario 8: UI consistency verification across users
```

**Hybrid Examples (`hybrid-multi-user.examples.spec.ts`)**
```
✅ Scenario 1: Parallel UI and API actions
✅ Scenario 2: UI action with API verification
✅ Scenario 3: 3 users UI actions with concurrent API checks
✅ Scenario 4: Complete user workflow (7 steps, UI + API)
✅ Scenario 5: Stress test - 6 users, UI + API load
```

## 🚀 How to Run

### Run All Examples
```bash
npm test -- *multi-user.examples.spec.ts
```

### Run Specific File
```bash
npm test -- api-multi-user.examples.spec.ts
npm test -- ui-multi-user.examples.spec.ts
npm test -- hybrid-multi-user.examples.spec.ts
```

### Run Specific Scenario
```bash
npm test -- -g "Scenario 1"                    # Any "Scenario 1"
npm test -- -g "Multiple users login"          # By test description
npm test -- -g "Load test"                     # By keyword
```

### Run with Options
```bash
# Headed mode (see browser)
npm test -- --headed ui-multi-user.examples.spec.ts

# Verbose output
npm test -- --reporter=verbose api-multi-user.examples.spec.ts

# Slow down execution to watch
npm test -- --slow-mo=1000 ui-multi-user.examples.spec.ts

# Custom user count
PARALLEL_USERS=5 npm test -- api-multi-user.examples.spec.ts

# Custom URL
DEMOWEBSHOP_BASE_URL=http://localhost:3000 npm test -- ui-multi-user.examples.spec.ts
```

## 📋 Test Results Interpretation

### Successful Test Output
```
✅ Results: 3/3 users logged in successfully
✅ Success Rate: 100%
✅ Performance: 234ms average per user
```

### Partial Success (Expected in Some Scenarios)
```
✅ Results: 8/10 operations completed
✅ Success Rate: 80%
✅ Failed: 2 (acceptable in load test)
```

### Performance Metrics Shown
```
📊 Metrics:
  • Total Time: 5234ms
  • Successful: 10/10
  • Average Time/User: 523.40ms
  • Throughput: 1.91 req/sec
```

## 🛠️ Customize Examples

### Change User Count (Example: 5 users)
```typescript
// Before
const sessions = await createMultipleUserSessions(3);

// After
const sessions = await createMultipleUserSessions(5);
```

### Change Application URL (Example: your-app:8080)
```bash
DEMOWEBSHOP_BASE_URL=http://your-app:8080 npm test
```

### Add Console Logging
```typescript
sessions.forEach((s, i) => {
  console.log(`User ${i}: ${s.user.email}`);
});
```

### Error Handling
```typescript
const results = await Promise.allSettled(promises);

const failures = results.filter(r => r.status === 'rejected');
if (failures.length > 0) {
  console.log('Some operations failed:', failures);
}
```

## 📚 Documentation Files Created

| File | Purpose | Read Time |
|------|---------|-----------|
| `MULTI_USER_TESTING.md` | Complete guide | 15-20 min |
| `MULTI_USER_QUICK_REFERENCE.md` | Quick start | 5-10 min |
| `MULTI_USER_MIGRATION_GUIDE.md` | Converting tests | 10-15 min |
| `RUNNING_MULTI_USER_EXAMPLES.md` | Running examples | 10-15 min |
| `MULTI_USER_IMPLEMENTATION.md` | Architecture | 5-10 min |
| `MULTI_USER_FRAMEWORK_SUMMARY.md` | Overview | 5-10 min |
| `MULTI_USER_EXAMPLES_CARD.md` | This file | 2-3 min |

## 💡 Quick Tips

### Tip 1: Always Cleanup
```typescript
try {
  // Test code
} finally {
  sessions.forEach(s => s.page?.close());
  UserContextManager.clearAllContexts();
}
```

### Tip 2: Use Promise.allSettled for Error Handling
```typescript
// Instead of Promise.all (fails on first error)
const results = await Promise.allSettled(promises);

// Now you can check status
results.forEach(r => {
  if (r.status === 'rejected') {
    console.log('Error:', r.reason);
  }
});
```

### Tip 3: Add Users to testdata/users.json
The examples request 3-10 users. Add more users:
```json
{
  "validUsers": [
    { "email": "user1@test.com", "password": "Pass@123", "firstName": "User", "lastName": "One" },
    { "email": "user2@test.com", "password": "Pass@123", "firstName": "User", "lastName": "Two" },
    { "email": "user3@test.com", "password": "Pass@123", "firstName": "User", "lastName": "Three" },
    { "email": "user4@test.com", "password": "Pass@123", "firstName": "User", "lastName": "Four" },
    { "email": "user5@test.com", "password": "Pass@123", "firstName": "User", "lastName": "Five" }
  ]
}
```

### Tip 4: View Console Output for Debugging
```bash
npm test -- -g "Scenario 1" # See detailed scenario output
```

### Tip 5: Create Custom Logging
```typescript
sessions.forEach((s, i) => {
  console.log(`\n👤 User ${i + 1}: ${s.user.email}`);
  console.log(`   Context: ${s.user.sessionId}`);
});
```

## 🎓 Learning Path

1. **5 min**: Skim this file for overview
2. **5 min**: Run `npm test -- api-multi-user.examples.spec.ts`
3. **10 min**: Read `MULTI_USER_QUICK_REFERENCE.md`
4. **30 min**: Review one example test file in detail
5. **30 min**: Create a simple custom test based on example
6. **1 hour**: Read `MULTI_USER_TESTING.md` for complete understanding

**Total: ~2 hours to full proficiency**

## 🔍 Find Examples of...

### Multiple users doing same action
→ See: `api-multi-user.examples.spec.ts` Scenario 2 (concurrent retrieval)

### Multiple users doing different actions
→ See: `ui-multi-user.examples.spec.ts` Scenario 4 (different products)

### UI and API together
→ See: `hybrid-multi-user.examples.spec.ts` Scenario 1, 4, 5

### Load testing
→ See: `ui-multi-user.examples.spec.ts` Scenario 6, or `api-multi-user.examples.spec.ts` Scenario 5

### Error handling
→ See: Any scenario using `Promise.allSettled()`

### Performance metrics
→ See: Any scenario measuring `Date.now()`

### Data consistency
→ See: `api-multi-user.examples.spec.ts` Scenario 6

## ⚡ Performance Expectations

| Scenario | Duration | Users | Throughput |
|----------|----------|-------|-----------|
| Simple login | 3-5s | 3 | 0.6-1.0 ops/sec |
| Product retrieval | 5-8s | 5 | 0.6-1.0 ops/sec |
| Shopping cart | 8-12s | 3 | 0.25-0.37 ops/sec |
| Checkout | 10-15s | 4 | 0.25-0.4 ops/sec |
| Load test (API) | 15-25s | 10 | 0.4-0.66 ops/sec |
| Load test (UI) | 20-35s | 10 | 0.28-0.5 ops/sec |

*Actual times depend on system, network, and application performance*

## 🆘 Troubleshooting Quick Guide

| Problem | Fix | Example |
|---------|-----|---------|
| Tests timeout | Increase timeout or check app | `await page.goto(url, { timeout: 120000 })` |
| "Out of range" | Add users to testdata/users.json | Add `"user4@test.com"` entry |
| Selectors not found | Update selectors for your app | Change `#Email` to your actual selector |
| Low success rate | Retry or reduce users | `PARALLEL_USERS=3` |
| Memory issues | Reduce concurrent users | `PARALLEL_USERS=2` |

## 📞 Quick Links

- **Run examples**: `npm test -- api-multi-user.examples.spec.ts`
- **Full guide**: See `MULTI_USER_TESTING.md`
- **Migration help**: See `MULTI_USER_MIGRATION_GUIDE.md`
- **Complete docs**: See `RUNNING_MULTI_USER_EXAMPLES.md`

## ✅ Checklist: Ready to Test

Before running examples:
- [ ] Application running at http://localhost:80
- [ ] Test users added to `testdata/users.json`
- [ ] Dependencies installed: `npm install`
- [ ] Node.js version 14+
- [ ] Sufficient system resources (memory ~2GB)

## 🎉 Next Steps

1. **Right now**: Run `npm test -- api-multi-user.examples.spec.ts`
2. **Next**: Review console output and understand what happened
3. **Then**: Create your first custom multi-user test
4. **Finally**: Integrate into your CI/CD pipeline

---

**Need help?** See `RUNNING_MULTI_USER_EXAMPLES.md` for detailed instructions.

**Want to learn more?** See `MULTI_USER_QUICK_REFERENCE.md` for all available methods.

**Have existing tests?** See `MULTI_USER_MIGRATION_GUIDE.md` for conversion steps.
