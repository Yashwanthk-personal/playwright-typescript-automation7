#  Demo WebShop Automation Framework

Production-ready **Playwright + Cucumber BDD** test automation framework with full API testing, mobile support, and dual reporting (Allure + Playwright).

## 📌 What You Get

A comprehensive test automation framework combining:
- ✅ **UI Testing** - Playwright & BDD with Page Object Model
- ✅ **API Testing** - Full HTTP client with Cucumber integration
- ✅ **Mobile Testing** - iPhone 12, Pixel 5, and other device profiles
- ✅ **Multi-Browser** - Test on Chromium, Firefox, and WebKit simultaneously
- ✅ **Dual Reports** - Allure JSON reports + Playwright HTML reports
- ✅ **Clean Code** - Service layer, fixtures (DI), and utilities for maintainability

**Total Test Coverage:** 10+ UI tests | 8 BDD scenarios | 20+ API tests | 35+ mobile tests

## 📂 Project Structure

```
pages/        → Page Objects for UI automation
api/          → API services & executors
features/     → Cucumber BDD feature files
steps/        → BDD step implementations
tests/        → Playwright test suites
testdata/     → Test data (JSON + TypeScript)
config/       → Configuration & constants
fixtures/     → Dependency Injection setup
utils/        → Shared utilities & helpers
```

## 🔗 Documentation

- **[FRAMEWORK_COMPLETE_GUIDE.md](FRAMEWORK_COMPLETE_GUIDE.md)** - Everything (953 lines, fully searchable)
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing workflows for UI, API, Mobile
- **[fixtures/FIXTURES_GUIDE.md](fixtures/FIXTURES_GUIDE.md)** - Dependency Injection patterns
- **[testdata/TEST_DATA_GUIDE.md](testdata/TEST_DATA_GUIDE.md)** - Test data management

---

## 🚀 Quick Start

```bash
# Setup
npm install
npm run api:start

# Run Tests
npm run test                    # UI (Playwright, headless)
npm run test:headed            # UI (Playwright, visible browser)
npm run bdd:login              # UI (BDD)
npm run bdd:api                # API tests (HTTP only)
npm run bdd:mobile             # Mobile (BDD)
npm run test -- mobile/        # Mobile (Playwright)

# Reports
npm run bdd:report             # Allure
npm run test:report            # Playwright
npm run full:report            # All tests + both reports
```

---

## 📊 Run Tests with Reports

### Simple Commands (Recommended)
```bash
npm run ui:all:reports         # UI + Allure + Playwright
npm run api:all:reports        # API + Allure
npm run mobile:all:reports     # Mobile + Allure + Playwright
npm run test:both:reports      # Everything + both reports
```

### Full Control Commands
```bash
# UI - All Browsers
Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:login:all; npm run convert:allure; npm run allure:generate; npm run allure:open

# API - All Browsers
Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:api:all; npm run convert:allure; npm run allure:generate; npm run allure:open

# Mobile - All Browsers
Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:mobile:all; npm run convert:allure; npm run allure:generate; npm run allure:open

# Everything
Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:login:all; npm run bdd:api:all; npm run bdd:mobile:all; npm run convert:allure; npm run allure:generate; npm run allure:open
```

### Single Browser Commands
| Test | Chromium | Firefox | WebKit |
|------|----------|---------|--------|
| **UI** | `Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:login:chromium; npm run convert:allure; npm run allure:open` | `Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:login:firefox; npm run convert:allure; npm run allure:open` | `Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:login:webkit; npm run convert:allure; npm run allure:open` |
| **API** | `Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:api:chromium; npm run convert:allure; npm run allure:open` | `Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:api:firefox; npm run convert:allure; npm run allure:open` | `Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:api:webkit; npm run convert:allure; npm run allure:open` |
| **Mobile** | `Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:mobile:chromium; npm run convert:allure; npm run allure:open` | `Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:mobile:firefox; npm run convert:allure; npm run allure:open` | `Remove-Item -Path allure-results, allure-report -Recurse -Force -ErrorAction SilentlyContinue; npm run bdd:mobile:webkit; npm run convert:allure; npm run allure:open` |

---

## 📱 Mobile Testing

**Devices:** iPhone 12, iPhone 13, Pixel 5, Pixel 6, Galaxy S9

```bash
npm run test -- mobile/        # All devices (Playwright)
npm run test -- mobile/ --headed  # Visible browser
npm run bdd:mobile             # BDD scenarios
```

---

## 📂 Directory Structure

```
pages/               → Page Objects (UI)
api/                 → API services
fixtures/            → Dependency Injection setup
features/            → Cucumber feature files (BDD)
steps/               → BDD step implementations
tests/               → Playwright test files
testdata/            → Test data (JSON + TypeScript)
config/              → Configuration & constants
utils/               → Utilities & helpers
docs/                → Documentation guides
```

---

## 🎯 What's Inside

| Component | Coverage |
|-----------|----------|
| Playwright UI Tests | 10+ login tests |
| BDD UI Scenarios | 8 scenarios |
| API Tests | 20 scenarios |
| Mobile Tests | 35+ device tests |
| Mobile BDD | 8 scenarios |

---

## ✨ Key Features

- ✅ **Page Object Model** - Clean, maintainable tests
- ✅ **BDD Support** - Cucumber feature files + step definitions
- ✅ **API Testing** - Full HTTP client with validators
- ✅ **Mobile Testing** - iPhone & Android device profiles
- ✅ **Multi-Browser** - Chromium, Firefox, WebKit
- ✅ **Dual Reporting** - Allure + Playwright HTML reports
- ✅ **Dependency Injection** - Fixtures for easy setup
- ✅ **Test Data** - JSON + dynamic generators
- ✅ **Advanced Utils** - Faker, retry logic, screenshots

---

## 📖 Complete Documentation

**For everything:** Read [FRAMEWORK_COMPLETE_GUIDE.md](FRAMEWORK_COMPLETE_GUIDE.md)
- Architecture & design patterns
- How to write tests (UI, API, BDD, Mobile)
- All npm commands reference
- 5 practical testing patterns
- Advanced features & best practices
- Troubleshooting & debugging

**Specialized Guides:**
- [fixtures/FIXTURES_GUIDE.md](fixtures/FIXTURES_GUIDE.md) - Dependency Injection
- [testdata/TEST_DATA_GUIDE.md](testdata/TEST_DATA_GUIDE.md) - Test data management
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing workflows

---

## 🔧 Common Tasks

| Task | Command |
|------|---------|
| **Debug Mode** | `PWDEBUG=1 npm run test` |
| **Impact Analysis** | `npm run impact` |
| **API Server** | `npm run api:start` |
| **API Server (Auto-reload)** | `npm run api:dev` |
| **View Traces** | Check `playwright-report/` |

---

## 🧬 Impact Analysis - Smart Test Selection

**What is it?** Automatically detects which tests should run based on code changes, reducing CI/CD execution time.

**How it works:**
1. Detects changed files using `git diff`
2. Maps changed files to modules using `mapping.json`
3. Identifies which modules were impacted
4. Retrieves associated test files for those modules
5. Runs only the impacted tests (or all tests if no mapping found)

**Use Case:** When you modify a service or page object, it automatically determines which tests need to be re-run instead of running the entire suite.

**Example Output:**
```
Changed Files:
  - api/services/login.service.ts
  - pages/login.page.ts

Impacted Modules:
  - LoginService
  - LoginPage

Tests to Run:
  - tests/login.spec.ts
  - features/ui/login.feature
  - features/api/login-api.feature

Summary: 2 files changed → 2 modules impacted → 3 tests to run
```

**Files:**
- `utils/impact-analysis.ts` - Main analysis engine
- `mapping.json` - Module-to-test configuration
- [IMPACT_ANALYSIS.md](IMPACT_ANALYSIS.md) - Full documentation

---

## 📊 Example: Full QA Check

```bash
# Terminal 1: Start server (keep running)
npm run api:start

# Terminal 2: Run everything
npm run test:both:reports

# Result:
# ✓ All Playwright tests (UI + Mobile)
# ✓ All BDD tests (UI + API + Mobile)
# ✓ Allure report generated & opened
# ✓ Playwright report generated & opened
```

---

## ✅ Status

- **Version:** 1.0.0
- **Status:** Production Ready
- **Test Coverage:** 105+ Playwright + 5 BDD scenarios
- **Last Updated:** April 2026

---

**For complete documentation, see [FRAMEWORK_COMPLETE_GUIDE.md](FRAMEWORK_COMPLETE_GUIDE.md)**
