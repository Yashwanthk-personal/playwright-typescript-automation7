# Test Data & Data-Driven Tests Guide

## Overview

This framework provides comprehensive test data management and data-driven testing capabilities:

- **Faker Utils**: Generate realistic test data without external dependencies
- **JSON Test Data**: Pre-defined test scenarios in JSON files
- **Test Data Loader**: Load and manipulate JSON test data
- **Data-Driven Tests**: Parameterized tests using test data

## Files Created

### 1. **utils/faker.utils.ts** - Faker Utilities
Generates realistic test data:
- `email()`, `emailWithDomain(domain)` - Email addresses
- `password()`, `simplePassword()`, `strongPassword()` - Various password types
- `fullName(gender?)`, `firstName()`, `lastName()` - Names
- `phoneNumber()` - Phone numbers
- `address()`, `city()`, `state()`, `zipCode()`, `fullAddress()` - Addresses
- `creditCard()`, `cvv()`, `expirationMonth()` - Payment data
- `product()`, `productName()`, `productPrice()` - Product data
- `uuid()`, `dateInRange()`, `pastDate()`, `futureDate()` - Utility functions
- `userAccount()`, `loginCredentials()` - Complex objects
- `sequence(count, generator)` - Generate multiple items

### 2. **testdata/users.json** - User Test Data
```json
{
  "validUsers": [...],           // Valid login credentials
  "invalidUsers": [...],         // Invalid credentials
  "edgeCaseUsers": [...],        // Edge case scenarios
  "invalidEmailFormats": [...],  // Email validation tests
  "sqlInjectionAttempts": [...], // Security tests
  "xssAttempts": [...]           // XSS prevention tests
}
```

### 3. **testdata/products.json** - Product Test Data
```json
{
  "validProducts": [...],        // Normal products
  "lowStockProducts": [...],     // Stock level tests
  "outOfStockProducts": [...],   // Unavailable products
  "priceVariations": [...],      // Price range tests
  "discountedProducts": [...],   // Discount scenarios
  "searchResults": [...],        // Search test cases
  "filterCriteria": [...]        // Filter test cases
}
```

### 4. **testdata/cart.json** - Cart Test Data
```json
{
  "cartOperations": [...],           // Add, remove, update
  "cartValidation": [...],           // Total calculations
  "invalidCartOperations": [...],    // Error cases
  "edgeCaseCartOperations": [...],   // Edge cases
  "cartPersistence": [...]           // Session persistence
}
```

### 5. **testdata/api.json** - API Test Data
```json
{
  "apiUserCreation": [...],          // User creation tests
  "apiUserValidation": [...],        // Validation tests
  "apiLogin": [...],                 // Login scenarios
  "apiLoginFailures": [...],         // Failed login
  "apiProductOperations": [...],     // CRUD operations
  "apiPaginationTests": [...],       // Pagination tests
  "apiErrorResponses": [...],        // Error scenarios
  "apiResponseValidation": [...]     // Response structure
}
```

### 6. **utils/test-data.loader.ts** - Test Data Loader
```typescript
// Load all data
const users = TestDataLoader.loadUsers();
const products = TestDataLoader.loadProducts();
const cart = TestDataLoader.loadCart();
const api = TestDataLoader.loadApi();

// Get specific subsets
const validUsers = TestDataLoader.getValidUsers();
const invalidUsers = TestDataLoader.getInvalidUsers();
const sqlTests = TestDataLoader.getSqlInjectionCases();

// Utility methods
TestDataLoader.random(array);      // Random selection
TestDataLoader.filter(items, pred); // Filter items
TestDataLoader.map(items, fn);     // Map items
TestDataLoader.take(items, count); // Get first N
```

## Usage Examples

### Example 1: Using Faker to Generate Test Data

```typescript
import { FakerUtils } from '../utils/faker.utils';
import { test } from '@playwright/test';

test('create user with generated data', async ({ page }) => {
  // Generate random user
  const user = FakerUtils.userAccount();
  
  // Sign up with generated data
  await page.goto('/signup');
  await page.fill('[name=firstName]', user.firstName);
  await page.fill('[name=lastName]', user.lastName);
  await page.fill('[name=email]', user.email);
  await page.fill('[name=password]', user.password);
  await page.click('button[type=submit]');
});
```

### Example 2: Data-Driven Test with Valid Users

```typescript
import { TestDataLoader } from '../utils/test-data.loader';
import { test, expect } from '@playwright/test';

const validUsers = TestDataLoader.getValidUsers();

for (const user of validUsers) {
  test(`login with ${user.email}`, async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', user.email);
    await page.fill('[name=password]', user.password);
    await page.click('button[type=submit]');
    
    // Verify login success
    await expect(page).toHaveURL('/dashboard');
  });
}
```

### Example 3: Generate Multiple Test Items

```typescript
import { FakerUtils } from '../utils/faker.utils';

// Generate 10 random products
const products = FakerUtils.sequence(10, () => FakerUtils.product());

// Generate 5 users
const users = FakerUtils.sequence(5, () => FakerUtils.userAccount());

// Generate 20 passwords
const passwords = FakerUtils.sequence(20, () => FakerUtils.password());
```

### Example 4: Filter Test Data

```typescript
import { TestDataLoader } from '../utils/test-data.loader';

const products = TestDataLoader.getValidProducts();

// Filter expensive products (> $100)
const expensive = TestDataLoader.filter(
  products, 
  p => p.price > 100
);

// Get first 5
const first5 = TestDataLoader.take(products, 5);

// Extract product names
const names = TestDataLoader.map(
  products,
  p => p.name
);
```

### Example 5: Security Testing with Test Data

```typescript
import { TestDataLoader } from '../utils/test-data.loader';
import { test, expect } from '@playwright/test';

const sqlTests = TestDataLoader.getSqlInjectionCases();

for (const testCase of sqlTests) {
  test(`prevent SQL injection - ${testCase.description}`, async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', testCase.email);
    await page.fill('[name=password]', testCase.password);
    await page.click('button[type=submit]');
    
    // Verify not logged in
    await expect(page).not.toHaveURL('/dashboard');
  });
}
```

### Example 6: Add Custom Test Data

To add custom test data:

1. Create a new JSON file in `testdata/` directory:

```json
// testdata/checkout.json
{
  "billingAddresses": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  ],
  "paymentMethods": [
    {
      "type": "credit_card",
      "cardNumber": "4111111111111111",
      "cvv": "123"
    }
  ]
}
```

2. Add loader methods to `TestDataLoader`:

```typescript
static loadCheckout() {
  return this.loadData<any>('checkout.json');
}

static getBillingAddresses() {
  return this.loadCheckout().billingAddresses || [];
}
```

3. Use in tests:

```typescript
const addresses = TestDataLoader.getBillingAddresses();
for (const address of addresses) {
  test(`checkout with address ${address.zipCode}`, async () => {
    // Test logic
  });
}
```

## Faker Utils API Reference

### Email Generation
```typescript
FakerUtils.email()                    // any@domain.com
FakerUtils.emailWithDomain('test.com') // any@test.com
```

### Name Generation
```typescript
FakerUtils.firstName()           // John
FakerUtils.lastName()            // Smith
FakerUtils.fullName()            // John Smith
FakerUtils.fullName('male')      // Adam Johnson
FakerUtils.fullName('female')    // Alice Williams
```

### Password Generation
```typescript
FakerUtils.password()            // 12 chars, complex
FakerUtils.simplePassword()      // 8 chars, letters+numbers
FakerUtils.strongPassword()      // 16 chars, complex
```

### Location Generation
```typescript
FakerUtils.address()             // 123 Main St
FakerUtils.city()                // New York
FakerUtils.state()               // CA
FakerUtils.zipCode()             // 90210
FakerUtils.fullAddress()         // Complete address object
```

### Product Generation
```typescript
FakerUtils.productName()         // Laptop
FakerUtils.productCategory()     // Electronics
FakerUtils.productDescription()  // High-quality product...
FakerUtils.productPrice()        // 299.99
FakerUtils.productSku()          // SKU-123456
FakerUtils.product()             // Complete product object
```

### Payment Generation
```typescript
FakerUtils.creditCard()          // Card object with all fields
FakerUtils.creditCardNumber()    // 1234567890123456
FakerUtils.cvv()                 // 123
FakerUtils.expirationMonth()     // 03
FakerUtils.expirationYear()      // 25
```

### Utility Functions
```typescript
FakerUtils.randomInt(1, 100)           // Random number
FakerUtils.randomElement(array)        // Random array item
FakerUtils.uuid()                      // UUID-v4
FakerUtils.dateInRange(start, end)     // Random date
FakerUtils.pastDate(30)                // Date 30 days ago
FakerUtils.futureDate(30)              // Date 30 days ahead
FakerUtils.sequence(10, generator)     // Array of 10 generated items
```

### Complex Objects
```typescript
FakerUtils.userAccount()        // Full user profile
FakerUtils.userAccount({        // With overrides
  firstName: 'John'
})

FakerUtils.loginCredentials()   // Login form data
FakerUtils.testData()           // Generic test object
```

## Best Practices

### 1. Use Data-Driven Tests for Multiple Scenarios
```typescript
// Good - tests multiple scenarios
const testCases = TestDataLoader.getValidUsers();
for (const user of testCases) {
  test(`login with ${user.email}`, async ({ page }) => {
    // Test logic
  });
}

// Avoid - duplicated test code
test('login with user1', ...);
test('login with user2', ...);
test('login with user3', ...);
```

### 2. Generate Variety with Faker
```typescript
// Good - generates different data each time
const users = FakerUtils.sequence(100, () => 
  FakerUtils.userAccount()
);

// Avoid - same data repeated
const users = Array(100).fill({
  email: 'test@test.com',
  password: 'password'
});
```

### 3. Organize Test Data by Purpose
```typescript
// Good organization
testdata/
  users.json          // User-related tests
  products.json       // Product-related tests
  cart.json           // Shopping cart tests
  api.json            // API tests
  checkout.json       // Checkout process

// Avoid - mixed purposes
testdata/
  data.json           // Everything mixed
```

### 4. Use Descriptive Test Names
```typescript
// Good
test('should reject login with SQL injection attempt', async () => {});

// Avoid
test('security test', async () => {});
```

### 5. Validate Test Data Integrity
```typescript
// Good - verify data was loaded correctly
const users = TestDataLoader.getValidUsers();
expect(users.length).toBeGreaterThan(0);
expect(users[0].email).toContain('@');

// Avoid - assuming data structure
const email = users[0].email;
```

## Performance Considerations

1. **Load test data once per file**:
   ```typescript
   // Avoid loading in each test
   test('test 1', () => {
     const users = TestDataLoader.getValidUsers();
   });

   // Better - load once
   const users = TestDataLoader.getValidUsers();
   for (const user of users) {
     test('test', () => {});
   }
   ```

2. **Use pagination for large datasets**:
   ```typescript
   const pageSize = 10;
   const pages = Math.ceil(allItems.length / pageSize);
   for (let page = 0; page < pages; page++) {
     const items = TestDataLoader.take(
       allItems.slice(page * pageSize),
       pageSize
     );
   }
   ```

3. **Filter early**:
   ```typescript
   // Filter before iterating
   const expensiveProducts = TestDataLoader.filter(
     products,
     p => p.price > 100
   );
   for (const product of expensiveProducts) {
     test(...);
   }
   ```

## Running Data-Driven Tests

```bash
# Run all data-driven tests
npm run test tests/data-driven.spec.ts

# Run with specific filter
npm run test tests/data-driven.spec.ts -g "valid users"

# Run in headed mode
npm run test:headed tests/data-driven.spec.ts

# Run with specific number of workers
npm run test -- --workers=1 tests/data-driven.spec.ts
```

## Troubleshooting

**Q: Test data file not found error?**
A: Ensure the JSON file is in the `testdata/` directory and the loader path is correct.

**Q: Too many tests generated?**
A: Use `TestDataLoader.take()` to limit test data or filter with conditions.

**Q: Tests running slowly?**
A: Reduce number of data-driven tests or run with more workers.

**Q: Faker generating invalid data?**
A: Validate generated data with assertions or customize generator functions.
