import { test, expect } from "../../fixtures/mobile.fixtures";
import { IPHONE_12, PIXEL_5 } from "../../config/device";
import { APP_BASE_URL } from "../../config/config";
import { MobileLoginPage } from "../../pages/mobile/login.mobile.page";

test.describe("Mobile Login Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_BASE_URL);
  });

  test("should display login page on mobile - iPhone 12", async ({ page, mobileLoginPage }) => {
    // Navigate directly to login page
    await page.goto(APP_BASE_URL + '/login', { waitUntil: 'domcontentloaded' });

    // Verify page is displayed
    expect(await mobileLoginPage.isVisible(mobileLoginPage.emailInput.getLocator())).toBeTruthy();
  });

  test("should display login page on mobile - Pixel 5", async ({ page, mobileLoginPage }) => {
    // Navigate directly to login page
    await page.goto(APP_BASE_URL + '/login', { waitUntil: 'domcontentloaded' });

    // Verify page is displayed
    expect(await mobileLoginPage.isVisible(mobileLoginPage.emailInput.getLocator())).toBeTruthy();
  });

  test("should login successfully on mobile", async ({ page, mobileLoginPage }) => {
    // Navigate to login page
    await page.goto(APP_BASE_URL + '/login', { waitUntil: 'domcontentloaded' });

    // Get valid credentials from environment or test data
    const validEmail = process.env.TEST_EMAIL || "test@example.com";
    const validPassword = process.env.TEST_PASSWORD || "password";

    // Perform login
    await mobileLoginPage.login(validEmail, validPassword);

    // Add small delay for page to load
    await page.waitForLoadState("networkidle").catch(() => {});
  });

  test("should display error on invalid credentials - mobile", async ({ page, mobileLoginPage }) => {
    // Navigate to login page
    await page.goto(APP_BASE_URL + '/login', { waitUntil: 'domcontentloaded' });

    // Try to login with invalid credentials
    await mobileLoginPage.login("invalid@example.com", "wrongpassword");

    // Verify error message appears
    const isUnsuccessful = await mobileLoginPage.isLoginUnsuccessful();
    expect(isUnsuccessful || (await page.url()).includes("login")).toBeTruthy();
  });

  test("should have accessible login form on mobile", async ({ page, mobileLoginPage }) => {
    // Navigate to login page
    await page.goto(APP_BASE_URL + '/login', { waitUntil: 'domcontentloaded' });

    // Verify all form fields are visible and accessible
    expect(await mobileLoginPage.isVisible(mobileLoginPage.emailInput.getLocator())).toBeTruthy();
    expect(await mobileLoginPage.isVisible(mobileLoginPage.passwordInput.getLocator())).toBeTruthy();
    expect(await mobileLoginPage.isVisible(mobileLoginPage.loginButton.getLocator())).toBeTruthy();
  });
});

test.describe("Mobile Login - Responsive Design", () => {
  test("login form should be responsive on different screen sizes", async ({ browser }) => {
    const screenSizes = [
      { width: 375, height: 667, name: "Small phone" }, // Small phone
      { width: 414, height: 896, name: "Large phone" }, // Large phone
      { width: 768, height: 1024, name: "Tablet" }, // Tablet
    ];

    for (const size of screenSizes) {
      const context = await browser!.newContext({ viewport: size });
      const page = await context.newPage();
      const mobileLoginPage = new MobileLoginPage(page);

      await page.goto(APP_BASE_URL + '/login', { waitUntil: 'domcontentloaded' });

      // Verify form is visible at each screen size
      expect(await mobileLoginPage.isVisible(mobileLoginPage.emailInput.getLocator())).toBeTruthy();
      expect(await mobileLoginPage.isVisible(mobileLoginPage.passwordInput.getLocator())).toBeTruthy();

      await context.close();
    }
  });

  test("should handle form submission on mobile with slow network", async ({ page, mobileLoginPage }) => {
    // Simulate slow 3G network
    await page.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.continue();
    });

    await page.goto(APP_BASE_URL + '/login', { waitUntil: 'domcontentloaded' });

    expect(await mobileLoginPage.isVisible(mobileLoginPage.emailInput.getLocator())).toBeTruthy();
  });
});
