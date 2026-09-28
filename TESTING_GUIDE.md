# Testing Guide - Demo WebShop Automation

Comprehensive guide to running UI, API, and Mobile tests with Playwright and Cucumber BDD, with detailed reporting options.

---

## Table of Contents

1. [UI Testing](#ui-testing)
2. [API Testing](#api-testing)
3. [Mobile Testing](#mobile-testing)
4. [Report Generation](#report-generation)
5. [Multi-Browser Testing](#multi-browser-testing)
6. [Quick Reference](#quick-reference)

---

## UI Testing

### Playwright UI Tests (No BDD)

**Single Browser:**
```powershell
# Chromium (Chrome)
npx playwright test tests/login.spec.ts --project=chromium

# Firefox
npx playwright test tests/login.spec.ts --project=firefox

# WebKit (Safari)
npx playwright test tests/login.spec.ts --project=webkit
```

**All Browsers:**
```powershell
npx playwright test tests/login.spec.ts
```

**With Headed Browser (visible):**
```powershell
npx playwright test tests/login.spec.ts --headed
```

---

### BDD UI Tests (Cucumber)

**Single Browser:**
```powershell
# Chromium
npm run bdd:login:chromium

# Firefox
npm run bdd:login:firefox

# WebKit
npm run bdd:login:webkit
```

**All Browsers (Sequential):**
```powershell
npm run bdd:login:all
```

**Headless Mode (Default):**
```powershell
npm run bdd:login:chromium
```

**Headed Mode (Browser Visible):**
```powershell
cross-env HEADLESS=false npm run bdd:login:chromium
```

---

## API Testing

### Playwright API Tests (No BDD)

**HTTP Client Only (No Browser):**
```powershell
# All projects
npx playwright test tests/api-login.spec.ts

# Single project (faster)
npx playwright test tests/api-login.spec.ts --project=chromium
```

⚠️ **Note:** API tests don't launch browsers. The `--project` flag is optional and doesn't affect performance.

---

### BDD API Tests (Cucumber)

**Single Browser:**
```powershell
# Chromium
npm run bdd:api:chromium

# Firefox
npm run bdd:api:firefox

# WebKit
npm run bdd:api:webkit
```

**All Browsers (Sequential):**
```powershell
npm run bdd:api:all
```

⚠️ **Important:** API tests don't launch browsers, even with BDD. They run as pure HTTP clients.

---

## Mobile Testing

### Playwright Mobile Tests (No BDD)

**Single Device:**
```powershell
# All mobile devices
npx playwright test tests/mobile/

# Specific device/browser
npx playwright test tests/mobile/login.mobile.spec.ts --project=chromium
```

**Headed Mode (Browser Visible):**
```powershell
npx playwright test tests/mobile/ --headed
```

---

### BDD Mobile Tests (Cucumber)

**Single Browser:**
```powershell
# Chromium (iPhone 12 profile)
npm run bdd:mobile:chromium

# Firefox (iPhone 12 profile)
npm run bdd:mobile:firefox

# WebKit (iPhone 12 profile)
npm run bdd:mobile:webkit
```

**All Browsers (Sequential):**
```powershell
npm run bdd:mobile:all
```

**Headless Mode (Default):**
```powershell
npm run bdd:mobile:chromium
```

**Headed Mode (Browser Visible):**
```powershell
cross-env HEADLESS=false npm run bdd:mobile:chromium
```

---

## Report Generation

### Playwright HTML Reports

**View Existing Report:**
```powershell
npx playwright show-report
```

**View on Specific Port:**
```powershell
npx playwright show-report --port 9324
```

---

### Allure Reports

#### For Playwright Tests

**Generate Allure Report:**
```powershell
npm run allure:generate
```

**Generate & Open Report:**
```powershell
npm run allure:open
```

**Full Pipeline (Test + Report):**
```powershell
npx playwright test tests/api-login.spec.ts; npm run allure:generate; npm run allure:open
```

---

#### For BDD Tests

**Convert Cucumber to Allure & Generate Report:**
```powershell
npm run convert:allure
```

**Full BDD Pipeline (Chromium Only):**
```powershell
# UI BDD
npm run bdd:login:chromium; npm run convert:allure; npm run allure:open

# API BDD
npm run bdd:api:chromium; npm run convert:allure; npm run allure:open

# Mobile BDD
npm run bdd:mobile:chromium; npm run convert:allure; npm run allure:open
```

---

## Multi-Browser Testing

### UI Multi-Browser Tests

**All Browsers with Report:**
```powershell
npm run bdd:login:all; npm run convert:allure; npm run allure:open
```

**Also includes:**
- ✅ Chromium
- ✅ Firefox
- ✅ WebKit
- ✅ Report Merging
- ✅ Allure Generation

---

### API Multi-Browser Tests

**All Browsers with Report:**
```powershell
npm run bdd:api:all; npm run convert:allure; npm run allure:open
```

**Note:** All browsers run same API tests (identical results), but ensures multi-project testing.

---

### Mobile Multi-Browser Tests

**All Browsers with Report:**
```powershell
npm run bdd:mobile:all; npm run convert:allure; npm run allure:open
```

**What happens:**
- ✅ Chromium (iPhone 12)
- ✅ Firefox (iPhone 12)
- ✅ WebKit (iPhone 12)
- ✅ Report Merging
- ✅ Allure Generation

---

## Complete Testing Pipelines

### Run Everything with Reports

**All UI Tests (All Browsers):**
```powershell
npm run bdd:login:all; npm run convert:allure; npm run allure:open
```

**All API Tests (All Browsers):**
```powershell
npm run bdd:api:all; npm run convert:allure; npm run allure:open
```

**All Mobile Tests (All Browsers):**
```powershell
npm run bdd:mobile:all; npm run convert:allure; npm run allure:open
```

**All Tests (Complete Suite):**
```powershell
npm run bdd:login:all; npm run bdd:api:all; npm run bdd:mobile:all; npm run convert:allure; npm run allure:open
```

---

## Quick Reference

### UI Tests

| Command | Browser | BDD | Report | Headed |
|---------|---------|-----|--------|--------|
| `npm run bdd:login:chromium` | Chrome | ✅ | No | No |
| `cross-env HEADLESS=false npm run bdd:login:chromium` | Chrome | ✅ | No | ✅ |
| `npm run bdd:login:all` | All (3) | ✅ | No | No |
| `npm run bdd:login:chromium; npm run convert:allure; npm run allure:open` | Chrome | ✅ | Allure | No |

---

### API Tests

| Command | Browser | BDD | Report | Notes |
|---------|---------|-----|--------|-------|
| `npx playwright test tests/api-login.spec.ts --project=chromium` | N/A | ❌ | No | HTTP only |
| `npm run bdd:api:chromium` | N/A | ✅ | No | HTTP only |
| `npm run bdd:api:all` | N/A | ✅ | No | All projects |
| `npm run bdd:api:chromium; npm run convert:allure; npm run allure:open` | N/A | ✅ | Allure | HTTP only |

---

### Mobile Tests

| Command | Device | BDD | Report | Headed |
|---------|--------|-----|--------|--------|
| `npx playwright test tests/mobile/` | iPhone 12 | ❌ | No | No |
| `npm run bdd:mobile:chromium` | iPhone 12 | ✅ | No | No |
| `cross-env HEADLESS=false npm run bdd:mobile:chromium` | iPhone 12 | ✅ | No | ✅ |
| `npm run bdd:mobile:all` | iPhone 12 | ✅ | No | No |
| `npm run bdd:mobile:chromium; npm run convert:allure; npm run allure:open` | iPhone 12 | ✅ | Allure | No |

---

## Key Points

### Browser Support

- **UI Tests:** Chromium, Firefox, WebKit
- **API Tests:** No browser (HTTP client only)
- **Mobile Tests:** Chromium, Firefox, WebKit (with mobile device profiles)

### Reporting

- **Playwright Reports:** `npx playwright show-report`
- **Allure Reports:** Generated from Cucumber JSON via `npm run convert:allure`
- **Both:** Generate both reports from single test run

### Environments

- **Default:** Headless (faster, no browser window)
- **Headed:** `cross-env HEADLESS=false` (visible browser)
- **Multi-browser:** Runs on all 3 browsers sequentially

### Performance

- **API BDD:** ~2-3 seconds (no browser)
- **UI BDD:** ~60+ seconds (per browser)
- **Mobile BDD:** ~70+ seconds (per browser)

---

## Troubleshooting

### No Report Generated

```powershell
# Clear old reports and regenerate
Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue
npm run bdd:login:chromium
npm run convert:allure
npm run allure:generate
```

### Browser Won't Launch (UI/Mobile)

```powershell
# Ensure HEADLESS=false for headed mode
cross-env HEADLESS=false npm run bdd:login:chromium

# Or use Playwright flag
npx playwright test tests/login.spec.ts --headed
```

### API Tests Launching Browser

```powershell
# This is expected - API tests don't launch browsers
# Only HTTP requests are made
npm run bdd:api:chromium  # HTTP only, no browser
```

### Tests Timing Out

Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60000,  // 60 seconds
```

---

## Environment Variables

| Variable | Values | Default | Usage |
|----------|--------|---------|-------|
| `HEADLESS` | `true`, `false` | `true` | Browser visibility |
| `BROWSER` | `chromium`, `firefox`, `webkit` | `chromium` | Browser selection |
| `TEST_ENV` | `dev`, `qa`, `prod` | `dev` | Environment selection |

### Examples

```powershell
# Headed Firefox
cross-env HEADLESS=false BROWSER=firefox npm run bdd:login:chromium

# WebKit mobile test
cross-env BROWSER=webkit npm run bdd:mobile:chromium

# QA environment
cross-env TEST_ENV=qa npm run bdd:api:chromium
```

---

## File Structure

```
tests/
├── login.spec.ts              # Playwright UI tests
├── api-login.spec.ts          # Playwright API tests
└── mobile/
    └── login.mobile.spec.ts   # Playwright mobile tests

features/
├── ui/
│   └── login.feature          # UI BDD scenarios
├── api/
│   └── login-api.feature      # API BDD scenarios
└── mobile/
    └── login.mobile.feature   # Mobile BDD scenarios

steps/
├── hooks.ts                   # UI test hooks
├── ui/
│   └── login.steps.ts         # UI BDD steps
├── api/
│   ├── hooks.ts               # API test hooks
│   └── login-api.steps.ts     # API BDD steps
└── mobile/
    ├── hooks.ts               # Mobile test hooks
    └── login.mobile.steps.ts  # Mobile BDD steps
```

---

## Report Locations

- **Playwright Reports:** `playwright-report/index.html`
- **Allure Reports:** `allure-report/index.html`
- **Test Results:** `test-results/` (JSON, traces, videos)
- **Allure Results:** `allure-results/` (JSON, traces)

---

## CI/CD Integration

```powershell
# Run all tests with reports (for CI/CD)
npm run bdd:login:all
npm run bdd:api:all
npm run bdd:mobile:all
npm run convert:allure
npm run allure:generate
```

---

## Best Practices

1. **Always use BDD for UI/Mobile** - Better test documentation
2. **Use single browser for API** - `npm run bdd:api:chromium`
3. **Clean reports before tests** - `Remove-Item allure-results, allure-report -Recurse`
4. **Run headed mode during development** - `cross-env HEADLESS=false`
5. **Use multi-browser for CI/CD** - `npm run bdd:login:all`

---

## Additional Commands

```powershell
# View all available scripts
npm run

# Clean test results
Remove-Item test-results, allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue

# Compile TypeScript only
npx tsc --noEmit

# Run with specific tags
cucumber-js --tags "@smoke"
```

---

**Last Updated:** April 29, 2026
**Maintained By:** QA Automation Team
