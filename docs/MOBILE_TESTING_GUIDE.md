# Mobile Testing Setup

Complete mobile testing framework for Playwright automation.

## 📁 Project Structure

```
pages/mobile/
├── base.mobile.page.ts           # Base class for mobile pages
├── login.mobile.page.ts          # Mobile login page object
├── home.mobile.page.ts           # Mobile home page object
├── checkout.mobile.page.ts       # Mobile checkout page object
├── components/
│   ├── header.component.ts       # Mobile header component
│   ├── footer.component.ts       # Mobile footer component
│   └── mobile-menu.component.ts  # Mobile menu component
└── index.ts                      # Export all mobile classes

tests/mobile/
├── login.mobile.spec.ts          # Login page tests
├── home.mobile.spec.ts           # Home page tests
├── checkout.mobile.spec.ts       # Checkout tests
└── components.mobile.spec.ts     # Component tests

fixtures/
└── mobile.fixtures.ts            # Mobile test fixtures

config/
└── device.ts                     # Mobile device profiles

utils/
└── mobile.utils.ts               # Mobile utilities and helpers
```

## 🚀 Quick Start

### 1. Run Mobile Tests

```bash
# All mobile tests
npm test -- tests/mobile

# Specific test file
npm test -- tests/mobile/login.mobile.spec.ts

# Specific device
npm test -- tests/mobile/login.mobile.spec.ts --project="iPhone 12"
```

### 2. Use Mobile Fixtures

```typescript
import { test, expect } from "fixtures/mobile.fixtures";
import { IPHONE_12 } from "config/device";

test("mobile login", async ({ page, mobileLoginPage, mobileHeader }) => {
  await page.setViewportSize({
    width: IPHONE_12.viewport.width,
    height: IPHONE_12.viewport.height,
  });

  await mobileLoginPage.login("user@example.com", "password");
  expect(await mobileLoginPage.verifyUserIsLoggedIn()).toBeTruthy();
});
```

## 📱 Device Profiles

### Phones
- **iPhone 12** - 390x844 (3x scale)
- **iPhone 12 Landscape** - 844x390
- **iPhone SE** - 375x667 (2x scale)
- **iPhone 13 Pro** - 390x844 (3x scale)
- **Pixel 5** - 393x851 (2x scale)
- **Pixel 4** - 353x745 (2x scale)
- **Galaxy S21** - 360x800 (2x scale)

### Tablets
- **iPad Pro** - 1024x1366 (2x scale)
- **iPad Mini** - 768x1024 (2x scale)

### Usage

```typescript
import { IPHONE_12, PIXEL_5, getDeviceProfile } from "config/device";

// Use predefined profile
await page.setViewportSize({
  width: IPHONE_12.viewport.width,
  height: IPHONE_12.viewport.height,
});

// Get profile by name
const device = getDeviceProfile("iPhone 12");

// Get all phones (exclude tablets)
const phones = getPhoneDevices();

// Get all Android devices
const androidDevices = getAndroidDevices();
```

## 🎯 Mobile Page Objects

### BaseMobilePage

Base class providing common mobile interactions:

```typescript
// Touch interactions
await page.tap(element);
await page.doubleTap(element);
await page.longPress(element);

// Swipe gestures
await page.swipeUp(distance);
await page.swipeDown(distance);
await page.swipeLeft(distance);
await page.swipeRight(distance);

// Scrolling
await page.scrollIntoView(element);
await page.scrollToBottom();
await page.scrollToTop();

// Form interactions
await page.fillInput(element, text);
await page.clearInput(element);
await page.typeSlowly(element, text);

// Visibility
await page.waitForVisible(element);
await page.isVisible(element);
```

### MobileLoginPage

```typescript
// Login flow
await mobileLoginPage.login(email, password);
await mobileLoginPage.navigateToLogin();
await mobileLoginPage.fillEmail(email);
await mobileLoginPage.fillPassword(password);
await mobileLoginPage.submitLogin();

// Verification
await mobileLoginPage.verifyUserIsLoggedIn();
await mobileLoginPage.isLoginUnsuccessful();
await mobileLoginPage.getErrorMessage();
```

### MobileHomePage

```typescript
// Navigation
await mobileHomePage.waitForPageLoad();
await mobileHomePage.isHomePageLoaded();
await mobileHomePage.goToCart();
await mobileHomePage.goToAccount();

// Products
await mobileHomePage.getProductCount();
await mobileHomePage.selectFirstProduct();
await mobileHomePage.selectProductByName(name);
await mobileHomePage.searchForProduct(term);
await mobileHomePage.loadMoreProducts();
```

### MobileCheckoutPage

```typescript
// Checkout flow
await mobileCheckoutPage.waitForCheckoutPageLoad();
await mobileCheckoutPage.proceedToCheckout();
await mobileCheckoutPage.fillShippingAddress(...);
await mobileCheckoutPage.fillBillingAddress(...);
await mobileCheckoutPage.selectPaymentMethod(method);
await mobileCheckoutPage.confirmOrder();

// Cart operations
await mobileCheckoutPage.getCartItemsCount();
await mobileCheckoutPage.getTotalPrice();
await mobileCheckoutPage.removeItemFromCart();
await mobileCheckoutPage.updateItemQuantity(quantity);
```

## 🧩 Mobile Components

### MobileHeaderComponent

```typescript
// Menu
await mobileHeader.openHamburgerMenu();
await mobileHeader.clickBack();

// Info
await mobileHeader.getHeaderTitle();
await mobileHeader.getCartItemCount();
await mobileHeader.getNotificationCount();

// Actions
await mobileHeader.clickSearchIcon();
await mobileHeader.clickLogo();
```

### MobileFooterComponent

```typescript
// Navigation
await mobileFooter.scrollToFooter();

// Links
await mobileFooter.clickCompanyLink(name);
await mobileFooter.clickResourcesLink(name);
await mobileFooter.clickLegalLink(name);

// Social
await mobileFooter.clickFacebookLink();
await mobileFooter.clickInstagramLink();

// Info
await mobileFooter.getCopyrightText();
```

### MobileMenuComponent

```typescript
// Menu control
await mobileMenu.isMenuVisible();
await mobileMenu.closeMenu();
await mobileMenu.closeMenuByOverlay();

// Navigation
await mobileMenu.navigateToHome();
await mobileMenu.navigateToProducts();
await mobileMenu.navigateToCart();
await mobileMenu.navigateToAccount();
await mobileMenu.logout();

// Items
await mobileMenu.getMenuItemsCount();
await mobileMenu.clickMenuItem(text);
```

## 🛠️ Mobile Utilities

```typescript
import * as mobileUtils from "utils/mobile.utils";

// Network throttling
await mobileUtils.setNetwork3G(page);
await mobileUtils.setNetwork4G(page);
await mobileUtils.setNetworkSlow(page);

// Device utilities
const category = mobileUtils.getDeviceSizeCategory(width);
const orientation = await mobileUtils.getDeviceOrientation(page);
await mobileUtils.rotateDevice(page, "landscape");

// Touch utilities
await mobileUtils.simulateDoubleTap(page, x, y);
await mobileUtils.simulatePinchZoom(page, x, y, factor);

// Accessibility
const a11yInfo = await mobileUtils.getElementA11yInfo(page, selector);
```

## 📋 Test Examples

### Login Test

```typescript
import { test, expect } from "fixtures/mobile.fixtures";
import { IPHONE_12 } from "config/device";

test("should login on mobile", async ({ page, mobileLoginPage }) => {
  await page.setViewportSize({
    width: IPHONE_12.viewport.width,
    height: IPHONE_12.viewport.height,
  });

  await page.goto("http://localhost:3000");
  await mobileLoginPage.login("user@example.com", "password");
  await expect(mobileLoginPage.demoWebShopText).toBeVisible();
});
```

### Component Test

```typescript
test("should open mobile menu", async ({ page, mobileHeader, mobileMenu }) => {
  await page.goto("http://localhost:3000");
  await mobileHeader.openHamburgerMenu();
  expect(await mobileMenu.isMenuVisible()).toBeTruthy();
  
  const items = await mobileMenu.getMenuItemTexts();
  expect(items.length).toBeGreaterThan(0);
});
```

### Responsive Test

```typescript
test("should be responsive", async ({ page, mobileHomePage }) => {
  const devices = [
    { width: 375, height: 667 },
    { width: 414, height: 896 },
    { width: 768, height: 1024 },
  ];

  for (const size of devices) {
    await page.setViewportSize(size);
    await page.goto("http://localhost:3000");
    await mobileHomePage.waitForPageLoad();
    expect(await mobileHomePage.isHomePageLoaded()).toBeTruthy();
  }
});
```

## ⚙️ Configuration

### playwright.config.ts

Add mobile device projects:

```typescript
export default defineConfig({
  projects: [
    {
      name: "iPhone 12",
      use: { ...devices["iPhone 12"] },
    },
    {
      name: "Pixel 5",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "iPad Pro",
      use: { ...devices["iPad Pro"] },
    },
  ],
});
```

## 🔍 Best Practices

1. **Always set viewport size** before navigating
2. **Use swipe interactions** for mobile-specific gestures
3. **Handle slower networks** when testing
4. **Test across devices** (multiple iOS and Android)
5. **Verify touch accessibility** in components
6. **Handle orientation changes** in tests
7. **Use mobile fixtures** for page objects
8. **Test mobile-specific features** (hamburger menu, swipe)
9. **Verify responsive design** at multiple screen sizes
10. **Use fallback locators** for robustness

## 📊 Running All Mobile Tests

```bash
# Run all mobile tests
npm test -- tests/mobile

# Run with specific browser
npm test -- tests/mobile --project="chromium"

# Run in headed mode
npm test -- tests/mobile --headed

# Run with debugging
npm test -- tests/mobile --debug

# Generate report
npm test -- tests/mobile && npm run test:report
```

## 🐛 Debugging

```typescript
// Take screenshot on mobile
await page.screenshot({ path: "mobile-screenshot.png" });

// Highlight elements
await page.locator(selector).highlight();

// Debug viewport
console.log(page.viewportSize());

// Check element visibility
const isVisible = await element.isVisible();
const boundingBox = await element.boundingBox();
```

## 📚 Resources

- [Playwright Mobile Testing](https://playwright.dev/docs/mobile)
- [Mobile Devices](https://playwright.dev/docs/emulation)
- [Touch Events](https://playwright.dev/docs/api/class-touchscreen)
- [Best Practices](https://playwright.dev/docs/best-practices)

## 🤝 Contributing

When adding new mobile pages or components:

1. Extend `BaseMobilePage` for page objects
2. Add comprehensive mobile interactions
3. Include fallback locators for robustness
4. Write tests for new features
5. Update documentation

---

**Created:** April 2026  
**Framework:** Playwright + TypeScript  
**Test Runner:** Playwright Test
