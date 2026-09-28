# Framework Structure Migration Checklist

## Current Framework Status

✅ = Completed
⏳ = In Progress
❌ = Not Started

---

## Phase 1: Structure Setup ✅

- [x] Create `api/core/` directory
- [x] Create `api/services/` directory
- [x] Create `utils/web/` directory
- [x] Create `utils/api/` directory
- [x] Create `utils/common/` directory
- [x] Create `api/core/executor.ts` - API Execution Engine
- [x] Create `api/core/methods.ts` - HTTP Methods wrapper
- [x] Create `api/core/validator.ts` - Response validators
- [x] Create `api/core/index.ts` - Core exports
- [x] Create `api/services/base.service.ts` - Base service
- [x] Create `api/services/login.service.ts` - Login service
- [x] Create `api/services/cart.service.ts` - Cart service
- [x] Create `api/services/index.ts` - Services exports
- [x] Create `api/index.ts` - API module exports

---

## Phase 2: Utils Organization ⏳

- [x] Copy `element.utils.ts` to `utils/web/`
- [x] Copy `wait.utils.ts` to `utils/web/`
- [x] Copy `fallback.locator.ts` to `utils/web/`
- [x] Create `utils/web/index.ts`
- [ ] Copy `faker.utils.ts` to `utils/common/`
- [ ] Copy `retry.utils.ts` to `utils/common/`
- [ ] Copy `visual.testing.ts` to `utils/common/`
- [ ] Copy `test-data.loader.ts` to `utils/common/`
- [x] Create `utils/common/assertion.utils.ts`
- [x] Create `utils/common/index.ts`
- [x] Create `utils/api/index.ts`
- [x] Create `utils/index.ts` (main exports)

---

## Phase 3: Update Imports 

### In Step Definitions (`steps/`)

- [ ] `steps/api/login-api.steps.ts` - Update to use new imports
- [ ] `steps/ui/*.ts` - Update web utils imports

### In Tests (`tests/`)

- [ ] `tests/api-login.spec.ts` - Update to use LoginService from `api/services`
- [ ] All other test files

### In Fixtures (`fixtures/`)

- [ ] `fixtures/api-fixtures.ts` - Update to use new API structure
- [ ] `fixtures/fixtures.ts` - Update web utils imports

### In Page Objects (`pages/`)

- [ ] Update all imports to use `utils/web`

### In Configurations

- [ ] Update `config/config.ts` if needed
- [ ] Update `config/user.ts` if needed

---

## Phase 4: Clean Up (Optional)

- [ ] Remove/Archive deprecated files from `utils/`:
  - `api.client.ts` (moved to core)
  - `api.login.service.ts` (moved to services)
  - `api.validation.ts` (moved to core/validator.ts)
  - `api.mock.ts` (keep if used)

---

## Phase 5: Testing & Validation

- [ ] Run unit tests: `npm run test`
- [ ] Run BDD tests: `npm run bdd`
- [ ] Run API tests: `npm run bdd:api`
- [ ] Run specific test: `npm run test tests/api-login.spec.ts`
- [ ] Verify all imports resolve correctly
- [ ] No "Cannot find module" errors
- [ ] All tests pass with new structure

---

## Phase 6: Documentation ✅

- [x] Create `FRAMEWORK_STRUCTURE.md` - Detailed structure guide
- [x] Create `FRAMEWORK_ARCHITECTURE.md` - Architecture diagrams
- [x] Create `MIGRATION_CHECKLIST.md` - This file
- [ ] Update main `README.md` to reference new structure
- [ ] Add Quick Start migration guide

---

## Quick Import Reference

### Before (Old Structure)

```typescript
import { ApiClient } from '../utils/api.client';
import { ApiLoginService } from '../utils/api.login.service';
import { ResponseValidator } from '../utils/api.validation';
import { ElementUtils } from '../utils/element.utils';
import { WaitUtils } from '../utils/wait.utils';
import { AssertionUtils } from '../utils/assertion.utils';
```

### After (New Structure)

```typescript
// API Core
import { ApiExecutor, ApiMethods, ResponseValidator } from 'api/core';

// API Services
import { LoginService, CartService } from 'api/services';

// Or use main export
import { ApiExecutor, LoginService, ResponseValidator } from 'api';

// Web Utils
import { ElementUtils, WaitUtils, FallbackLocator } from 'utils/web';

// Common Utils
import { AssertionUtils } from 'utils/common';

// Or use main export
import { ElementUtils, AssertionUtils } from 'utils';
```

---

## Priority Tasks

### HIGH PRIORITY (Do First)

1. ✅ Set up API core structure (`api/core/`)
2. ✅ Create API services (`api/services/`)
3. ⏳ Copy and update remaining utils
4. Update main test files and step definitions

### MEDIUM PRIORITY

5. Run tests to verify everything works
6. Update all imports across codebase
7. Update documentation

### LOW PRIORITY

8. Clean up deprecated files
9. Archive old API client files
10. Add additional services as needed

---

## Known Issues & Solutions

### Issue 1: "Cannot find module 'api'"
**Solution**: Ensure `tsconfig.json` has correct path mappings or use relative paths.

**tsconfig.json example:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "api/*": ["api/*"],
      "utils/*": ["utils/*"],
      "config/*": ["config/*"]
    }
  }
}
```

### Issue 2: Circular Dependencies
**Solution**: Always import from `/index.ts` files, not directly from modules.

✅ Correct:
```typescript
import { LoginService } from 'api/services';
```

❌ Incorrect:
```typescript
import { LoginService } from 'api/services/login.service';
```

---

## Verification Steps

After making changes, run:

```bash
# 1. Check TypeScript compilation
npx tsc --noEmit

# 2. Run tests
npm run test

# 3. Run BDD tests
npm run bdd

# 4. Run specific test suite
npm run test tests/api-login.spec.ts

# 5. Check for import errors
npm run test -- --reporter=list
```

---

## File Organization Summary

```
✅ Created:
├── api/core/
│   ├── executor.ts (API Execution Engine)
│   ├── methods.ts (HTTP Methods)
│   ├── validator.ts (Response Validators)
│   └── index.ts
├── api/services/
│   ├── base.service.ts (Base service)
│   ├── login.service.ts (Login/Auth)
│   ├── cart.service.ts (Shopping cart)
│   └── index.ts
├── utils/web/
│   ├── element.utils.ts
│   ├── wait.utils.ts
│   ├── fallback.locator.ts
│   └── index.ts
├── utils/common/
│   ├── assertion.utils.ts
│   ├── index.ts
│   └── (other utilities)
├── FRAMEWORK_STRUCTURE.md (Detailed guide)
└── FRAMEWORK_ARCHITECTURE.md (Architecture diagrams)

⏳ To Copy:
├── faker.utils.ts → utils/common/
├── retry.utils.ts → utils/common/
├── visual.testing.ts → utils/common/
└── test-data.loader.ts → utils/common/

❌ To Update:
├── All test files - import statements
├── All step definitions - import statements
├── All page objects - import statements
└── All fixtures - import statements
```

---

## Success Criteria

✅ Framework will be complete when:

1. All API core modules are functional
2. All services work with executor
3. All tests pass with new import structure
4. No breaking changes to existing tests
5. Documentation is complete and accurate
6. Team can easily add new services
7. Code is maintainable and well-organized
8. Performance is not degraded

---

## Contact & Support

For questions about the new structure:
- See `FRAMEWORK_STRUCTURE.md` for detailed guide
- See `FRAMEWORK_ARCHITECTURE.md` for diagrams
- Check existing service implementations as examples
- Review test files for usage examples

---

## Timeline

**Completed**: Phase 1, 2, 6 (Structure setup, docs)
**In Progress**: Phase 2 (Utils organization)
**Pending**: Phase 3, 4, 5 (Import updates, testing, cleanup)

**Estimated Completion**: 2-3 hours with full team effort

---

Last Updated: April 6, 2026
