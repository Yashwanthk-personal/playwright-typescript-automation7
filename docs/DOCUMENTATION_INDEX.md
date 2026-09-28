# Documentation Index

Welcome! This directory contains comprehensive documentation for the Advanced Testing Utilities framework. Start here to find what you need.

---

## 📖 Documentation Overview

### 1. **QUICK_START.md** - Start Here! ⭐
**Best for:** Getting started in 5 minutes

- Quick reference for all utilities
- Copy-paste code examples
- Common test patterns
- Real-world examples
- Running tests

**When to read:** First time using these utilities

---

### 2. **ADVANCED_TESTING_GUIDE.md** - Comprehensive Guide
**Best for:** Understanding how to use each utility

- In-depth usage guide for each utility
- All available methods with examples
- Best practices
- Running and troubleshooting

**When to read:** After quick start, when learning features

---

### 3. **API_REFERENCE.md** - Complete API Documentation
**Best for:** Finding specific method documentation

- Every method documented with parameters and returns
- Type definitions
- Parameter details
- Return values explained

**When to read:** When you need exact method signatures or parameters

---

### 4. **TROUBLESHOOTING_FAQ.md** - Debugging & Common Issues
**Best for:** Solving problems when things don't work

- Common problems and solutions
- Debugging strategies
- FAQ with answers
- Performance tips
- Best practices

**When to read:** When tests fail or behave unexpectedly

---

## 🎯 Quick Navigation by Task

### I want to...

**...get started quickly**
→ Start with [QUICK_START.md](QUICK_START.md)

**...handle flaky/intermittent test failures**
→ See "Retry Logic" section in [ADVANCED_TESTING_GUIDE.md](ADVANCED_TESTING_GUIDE.md#1-retry-logic)

**...find elements more reliably**
→ See "Fallback Locators" section in [ADVANCED_TESTING_GUIDE.md](ADVANCED_TESTING_GUIDE.md#2-fallback-locators)

**...mock API calls for testing**
→ See "API Mocking" section in [ADVANCED_TESTING_GUIDE.md](ADVANCED_TESTING_GUIDE.md#3-api-mocking)

**...add visual regression testing**
→ See "Visual Testing" section in [ADVANCED_TESTING_GUIDE.md](ADVANCED_TESTING_GUIDE.md#4-visual-testing)

**...understand a specific method**
→ Look up the method in [API_REFERENCE.md](API_REFERENCE.md)

**...solve a test problem**
→ Check [TROUBLESHOOTING_FAQ.md](TROUBLESHOOTING_FAQ.md) for your issue

**...see working code examples**
→ Check [tests/advanced-testing.spec.ts](tests/advanced-testing.spec.ts) (500+ lines of examples)

**...learn best practices**
→ See "Best Practices" section in [TROUBLESHOOTING_FAQ.md](TROUBLESHOOTING_FAQ.md#best-practices)

---

## 📚 Document Structure

### QUICK_START.md
```
- 5-Minute Quick Start
- Quick Reference
- Common Test Patterns
- Real-World Examples
- Running Tests
- Tips for Best Results
- Troubleshooting Quick Fixes
- Next Steps
```

### ADVANCED_TESTING_GUIDE.md
```
- Overview
- 1. Retry Logic
  - Basic Usage
  - Retry Strategies
  - Wait Until Condition
  - Conditional Retry
  - Retry Callbacks
  - Safe Execution
  - Sequential Retry
- 2. Fallback Locators
  - Basic Usage
  - Find by Different Strategies
  - Smart Locator
  - Find Specific Elements
  - Wait for Visibility
- 3. API Mocking
  - Basic Mocking
  - Paginated Response
  - Dynamic Response
  - Predefined Scenarios
  - Verify API Calls
  - Response Interceptors
- 4. Visual Testing
  - Basic Screenshots
  - Multiple Screenshots
  - Before/After Comparison
  - Interaction Screenshots
  - Mask Sensitive Elements
  - Visual Regression Testing
  - Element State Verification
  - Directories
- Combined Examples
- Best Practices
- Running Tests
- Troubleshooting
```

### API_REFERENCE.md
```
- RetryUtils (9 methods documented)
- FallbackLocator (15+ methods documented)
- ApiMock (18+ methods documented)
- ApiMockScenarios (5 scenario generators)
- VisualTesting (16+ methods documented)
- Type Definitions (8 types documented)
```

### TROUBLESHOOTING_FAQ.md
```
- Troubleshooting Guide
  - Retry Logic Issues
  - Fallback Locator Issues
  - API Mocking Issues
  - Visual Testing Issues
  - Common Problems & Solutions
- FAQ
  - When to use retry vs error handling
  - How to combine strategies
  - Response verification
  - Dynamic content handling
  - And more...
- Performance Tips
- Common Patterns
```

---

## 🔍 Finding Specific Information

### By Topic

**Debugging**
- [TROUBLESHOOTING_FAQ.md - Troubleshooting Guide](TROUBLESHOOTING_FAQ.md#troubleshooting-guide)
- [ADVANCED_TESTING_GUIDE.md - Troubleshooting](ADVANCED_TESTING_GUIDE.md#troubleshooting)

**Best Practices**
- [ADVANCED_TESTING_GUIDE.md - Best Practices](ADVANCED_TESTING_GUIDE.md#best-practices)
- [TROUBLESHOOTING_FAQ.md - Performance Tips](TROUBLESHOOTING_FAQ.md#performance-tips)

**Code Examples**
- [QUICK_START.md - Real-World Examples](QUICK_START.md#real-world-examples)
- [tests/advanced-testing.spec.ts](tests/advanced-testing.spec.ts)

**Method Details**
- [API_REFERENCE.md - RetryUtils](API_REFERENCE.md#retryutils)
- [API_REFERENCE.md - FallbackLocator](API_REFERENCE.md#fallbacklocator)
- [API_REFERENCE.md - ApiMock](API_REFERENCE.md#apimock)
- [API_REFERENCE.md - VisualTesting](API_REFERENCE.md#visualtesting)

### By Utility

**RetryUtils**
- Quick intro: [QUICK_START.md - Retry Logic](QUICK_START.md#retry-logic---handle-flaky-tests)
- Full guide: [ADVANCED_TESTING_GUIDE.md - Retry Logic](ADVANCED_TESTING_GUIDE.md#1-retry-logic)
- Reference: [API_REFERENCE.md - RetryUtils](API_REFERENCE.md#retryutils)
- Issues: [TROUBLESHOOTING_FAQ.md - Retry Logic Issues](TROUBLESHOOTING_FAQ.md#retry-logic-issues)

**FallbackLocator**
- Quick intro: [QUICK_START.md - Fallback Locators](QUICK_START.md#fallback-locators---multiple-selector-strategies)
- Full guide: [ADVANCED_TESTING_GUIDE.md - Fallback Locators](ADVANCED_TESTING_GUIDE.md#2-fallback-locators)
- Reference: [API_REFERENCE.md - FallbackLocator](API_REFERENCE.md#fallbacklocator)
- Issues: [TROUBLESHOOTING_FAQ.md - Fallback Locator Issues](TROUBLESHOOTING_FAQ.md#fallback-locator-issues)

**ApiMock**
- Quick intro: [QUICK_START.md - API Mocking](QUICK_START.md#api-mocking---mock-responses)
- Full guide: [ADVANCED_TESTING_GUIDE.md - API Mocking](ADVANCED_TESTING_GUIDE.md#3-api-mocking)
- Reference: [API_REFERENCE.md - ApiMock](API_REFERENCE.md#apimock)
- Issues: [TROUBLESHOOTING_FAQ.md - API Mocking Issues](TROUBLESHOOTING_FAQ.md#api-mocking-issues)

**VisualTesting**
- Quick intro: [QUICK_START.md - Visual Testing](QUICK_START.md#visual-testing---screenshots--regression)
- Full guide: [ADVANCED_TESTING_GUIDE.md - Visual Testing](ADVANCED_TESTING_GUIDE.md#4-visual-testing)
- Reference: [API_REFERENCE.md - VisualTesting](API_REFERENCE.md#visualtesting)
- Issues: [TROUBLESHOOTING_FAQ.md - Visual Testing Issues](TROUBLESHOOTING_FAQ.md#visual-testing-issues)

---

## 🚀 Getting Started Paths

### Path 1: I'm New to These Utilities
1. Read [QUICK_START.md](QUICK_START.md) - 10 min
2. Copy a pattern from [QUICK_START.md - Common Test Patterns](QUICK_START.md#common-test-patterns)
3. Adapt it for your test
4. If it doesn't work, check [TROUBLESHOOTING_FAQ.md](TROUBLESHOOTING_FAQ.md)

### Path 2: I Need to Solve a Problem
1. Find your problem in [TROUBLESHOOTING_FAQ.md - Troubleshooting Guide](TROUBLESHOOTING_FAQ.md#troubleshooting-guide)
2. Read the solution
3. If you need more details, check [ADVANCED_TESTING_GUIDE.md](ADVANCED_TESTING_GUIDE.md)

### Path 3: I'm Learning in Depth
1. Start with [QUICK_START.md](QUICK_START.md) for overview
2. Read [ADVANCED_TESTING_GUIDE.md](ADVANCED_TESTING_GUIDE.md) for each utility
3. Reference [API_REFERENCE.md](API_REFERENCE.md) for specific methods
4. Check examples in [tests/advanced-testing.spec.ts](tests/advanced-testing.spec.ts)

### Path 4: I Need Specific Examples
1. Go directly to [QUICK_START.md - Real-World Examples](QUICK_START.md#real-world-examples)
2. Or search for your scenario in [tests/advanced-testing.spec.ts](tests/advanced-testing.spec.ts)
3. Copy and adapt the example

---

## 📋 File Structure

```
Documentation Files:
├── QUICK_START.md                    ← START HERE (if new)
├── ADVANCED_TESTING_GUIDE.md         ← Complete usage guide
├── API_REFERENCE.md                  ← Method documentation
├── TROUBLESHOOTING_FAQ.md            ← Problem solving
└── Documentation/Index.md            ← YOU ARE HERE

Utility Files:
├── utils/retry.utils.ts              (retry logic)
├── utils/fallback.locator.ts         (DOM finding)
├── utils/api.mock.ts                 (API mocking)
└── utils/visual.testing.ts           (visual testing)

Test Examples:
└── tests/advanced-testing.spec.ts    (40+ examples)
```

---

## ✅ Checklist

### Before You Start
- [ ] Read [QUICK_START.md](QUICK_START.md)
- [ ] Run `npm run test tests/advanced-testing.spec.ts` to see examples
- [ ] Pick one utility to focus on first

### When Learning a Utility
- [ ] Read the section in [ADVANCED_TESTING_GUIDE.md](ADVANCED_TESTING_GUIDE.md)
- [ ] Review examples in [tests/advanced-testing.spec.ts](tests/advanced-testing.spec.ts)
- [ ] Copy a simple example and modify it
- [ ] Run and test it works

### When Running Tests
- [ ] Use pattern from [QUICK_START.md](QUICK_START.md)
- [ ] Refer to [API_REFERENCE.md](API_REFERENCE.md) for method signatures
- [ ] If it fails, check [TROUBLESHOOTING_FAQ.md](TROUBLESHOOTING_FAQ.md)

### When Adding to Project
- [ ] Combine utilities from [QUICK_START.md - Common Test Patterns](QUICK_START.md#common-test-patterns)
- [ ] Reference [ADVANCED_TESTING_GUIDE.md - Best Practices](ADVANCED_TESTING_GUIDE.md#best-practices)
- [ ] Check [TROUBLESHOOTING_FAQ.md - Common Patterns](TROUBLESHOOTING_FAQ.md#common-patterns)

---

## 💡 Pro Tips

1. **Start Simple**: Begin with one utility, then combine
2. **Copy Examples**: Use examples from docs/tests as templates
3. **Use F3/Ctrl+F**: Search docs for keywords
4. **Check Examples**: Always look at [tests/advanced-testing.spec.ts](tests/advanced-testing.spec.ts) first
5. **Debug with Logs**: Use `onRetry`, `getCallLogs()` for debugging
6. **Refer to API**: When unsure about parameters, check [API_REFERENCE.md](API_REFERENCE.md)
7. **Know Limitations**: Check [TROUBLESHOOTING_FAQ.md](TROUBLESHOOTING_FAQ.md) for gotchas

---

## 🔗 Cross-References

### Most Common Scenarios

**Flaky Test?** 
→ Retry + Fallback: [QUICK_START.md - Pattern 1](QUICK_START.md#pattern-1-retry-with-fallback)

**Element Not Found?**
→ Fallback Locators: [QUICK_START.md - Fallback Locators](QUICK_START.md#fallback-locators---multiple-selector-strategies)

**API Dependency?**
→ API Mocking: [QUICK_START.md - Pattern 2](QUICK_START.md#pattern-2-mock-api--verify)

**Visual Regression?**
→ Visual Testing: [QUICK_START.md - Pattern 3](QUICK_START.md#pattern-3-visual--interaction)

**Complete Failure?**
→ Full Pattern: [QUICK_START.md - Pattern 4](QUICK_START.md#pattern-4-full-test-flow)

---

## 📞 When You Get Stuck

1. **For "How do I...?"** → Read [QUICK_START.md](QUICK_START.md)
2. **For syntax/parameters** → Check [API_REFERENCE.md](API_REFERENCE.md)
3. **For detailed explanation** → Read [ADVANCED_TESTING_GUIDE.md](ADVANCED_TESTING_GUIDE.md)
4. **For errors/problems** → Search [TROUBLESHOOTING_FAQ.md](TROUBLESHOOTING_FAQ.md)
5. **For working code** → Look at [tests/advanced-testing.spec.ts](tests/advanced-testing.spec.ts)
6. **For best practices** → Check [TROUBLESHOOTING_FAQ.md - Common Patterns](TROUBLESHOOTING_FAQ.md#common-patterns)

---

## 🎓 Learning Objectives

After reading these docs, you should be able to:

- [ ] Use RetryUtils to handle flaky tests
- [ ] Use FallbackLocator to find elements reliably
- [ ] Use ApiMock to mock API responses
- [ ] Use VisualTesting for visual regression
- [ ] Combine utilities for comprehensive testing
- [ ] Troubleshoot common issues
- [ ] Apply best practices to your tests
- [ ] Write production-ready automated tests

---

**Happy Testing! 🧪 Start with [QUICK_START.md](QUICK_START.md) →**
