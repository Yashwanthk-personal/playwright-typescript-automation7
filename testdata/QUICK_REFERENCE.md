# Faker Quick Reference

## Generate Single Items

```typescript
import { FakerUtils } from '../utils/faker.utils';

// User Data
FakerUtils.email()                    // test.person@example.com
FakerUtils.fullName()                // John Smith
FakerUtils.firstName()                // Jane
FakerUtils.lastName()                 // Doe
FakerUtils.password()                 // Complex 12-char: aB3!cD9#eF2@

// Contact Info
FakerUtils.phoneNumber()              // (555) 123-4567
FakerUtils.fullAddress()              // { street, city, state, zipCode }

// Finance
FakerUtils.creditCard()               // { number, holder, cvv, expiryMonth, expiryYear }
FakerUtils.creditCardNumber()         // 4532123456789012
FakerUtils.cvv()                      // 123

// Products
FakerUtils.product()                  // { id, name, price, stock, rating, ... }
FakerUtils.productName()              // Laptop
FakerUtils.productPrice()             // 299.99
FakerUtils.productSku()               // SKU-987654

// Utility
FakerUtils.uuid()                     // a1b2c3d4-e5f6-4a5b-8c9d-e0f1a2b3c4d5
FakerUtils.randomInt(1, 100)          // 42
```

## Generate Multiple Items

```typescript
// Generate 10 users
FakerUtils.sequence(10, () => FakerUtils.userAccount());

// Generate 5 products
FakerUtils.sequence(5, () => FakerUtils.product());

// Generate 20 emails
FakerUtils.sequence(20, () => FakerUtils.email());
```

## Load Test Data

```typescript
import { TestDataLoader } from '../utils/test-data.loader';

// Load all data
TestDataLoader.loadUsers()
TestDataLoader.loadProducts()
TestDataLoader.loadCart()
TestDataLoader.loadApi()

// Get specific test sets
TestDataLoader.getValidUsers()              // Valid credentials
TestDataLoader.getInvalidUsers()            // Invalid credentials
TestDataLoader.getSqlInjectionCases()       // Security tests
TestDataLoader.getXssCases()                // XSS tests

TestDataLoader.getValidProducts()           // Active products
TestDataLoader.getLowStockProducts()        // Low inventory
TestDataLoader.getOutOfStockProducts()      // Out of stock

TestDataLoader.getApiUserCreation()         // API: Create user
TestDataLoader.getApiLogin()                // API: Login scenarios
TestDataLoader.getApiPaginationTests()      // API: Pagination
```

## Data-Driven Test Template

```typescript
import { test } from '../fixtures/fixtures';
import { TestDataLoader } from '../utils/test-data.loader';

const testData = TestDataLoader.getValidUsers();

for (const data of testData) {
  test(`test with ${data.email}`, async ({ page }) => {
    // Test logic using data
  });
}
```

## Faker Examples

### Generate User for Signup
```typescript
const user = FakerUtils.userAccount();
// {
//   firstName: 'John',
//   lastName: 'Smith',
//   email: 'john.smith@gmail.com',
//   password: 'aB3!cD9#eF2@gH4$',
//   phone: '(555) 123-4567',
//   address: { street, city, state, zipCode }
// }
```

### Generate Product for Catalog
```typescript
const product = FakerUtils.product();
// {
//   id: 1234,
//   name: 'Laptop',
//   category: 'Electronics',
//   description: 'High-quality...',
//   price: 1299.99,
//   sku: 'PROD-987654',
//   stock: 42,
//   rating: 4.5
// }
```

### Generate Payment
```typescript
const card = FakerUtils.creditCard();
// {
//   number: '4532123456789012',
//   holder: 'JOHN SMITH',
//   expiryMonth: '03',
//   expiryYear: '25',
//   cvv: '123'
// }
```

## Test Data Files

```
testdata/
  ├── users.json        (validUsers, invalidUsers, security tests)
  ├── products.json     (inventory, pricing, search filters)
  ├── cart.json         (operations, validation, persistence)
  ├── api.json          (CRUD, pagination, errors)
  └── TEST_DATA_GUIDE.md
```

## Common Patterns

### Pattern 1: Multiple scenarios
```typescript
const scenarios = TestDataLoader.getValidUsers();
for (const scenario of scenarios) {
  test(`test: ${scenario.description}`, async () => {
    // use scenario
  });
}
```

### Pattern 2: Filter and test
```typescript
const all = TestDataLoader.getValidProducts();
const expensive = TestDataLoader.filter(all, p => p.price > 100);
for (const product of expensive) {
  test(`test: ${product.name}`, async () => {
    // test expensive product
  });
}
```

### Pattern 3: Generate and test
```typescript
const users = FakerUtils.sequence(5, () => FakerUtils.userAccount());
for (const user of users) {
  test(`test: ${user.email}`, async () => {
    // test with generated user
  });
}
```

### Pattern 4: Random selection
```typescript
test('random test', async () => {
  const user = TestDataLoader.random(TestDataLoader.getValidUsers());
  // test with random user
});
```

### Pattern 5: Subset
```typescript
const all = TestDataLoader.getValidProducts();
const first5 = TestDataLoader.take(all, 5);
for (const product of first5) {
  test(`test: ${product.name}`, async () => {
    // test only first 5 products
  });
}
```

## Password Types

```typescript
FakerUtils.password()           // 12 chars: Abc!Def@Ghi#
FakerUtils.simplePassword()     // 8 chars: AbcDef12
FakerUtils.strongPassword()     // 16 chars: Abc!Def@Ghi#Jkl$
```

## Date Generation

```typescript
FakerUtils.pastDate(30)         // Date within last 30 days
FakerUtils.futureDate(30)       // Date within next 30 days
FakerUtils.dateInRange(start, end)  // Random date in range
```

## Running Tests

```bash
# Run all data-driven tests
npm run test tests/data-driven.spec.ts

# Run specific test group
npm run test tests/data-driven.spec.ts -g "Login with Valid Users"

# Run with debugging
npm run test:headed tests/data-driven.spec.ts
```

## Tips & Tricks

1. **Override faker data**:
   ```typescript
   FakerUtils.userAccount({ email: 'specific@test.com' })
   ```

2. **Map test data**:
   ```typescript
   const emails = TestDataLoader.map(users, u => u.email);
   ```

3. **Create test combos**:
   ```typescript
   const credentials = FakerUtils.sequence(5, () => ({
     email: FakerUtils.email(),
     password: FakerUtils.password()
   }));
   ```

4. **Chain operations**:
   ```typescript
   const expensive = TestDataLoader.filter(
     TestDataLoader.getValidProducts(),
     p => p.price > 100
   );
   ```

5. **Random from array**:
   ```typescript
   const randomUser = TestDataLoader.random(
     TestDataLoader.getValidUsers()
   );
   ```
