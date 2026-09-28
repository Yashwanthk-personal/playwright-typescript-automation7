import { test as base, Page, devices } from "@playwright/test";
import { MobileLoginPage } from "../pages/mobile/login.mobile.page";
import { UserConfig } from "../config/user";

/**
 * Mobile Test Fixtures
 * Provides mobile page objects and utilities for testing
 */
interface MobileFixtures {
  // Mobile Page Objects
  mobileLoginPage: MobileLoginPage;

  // Navigation utilities
  mobileLoginAsValidUser: () => Promise<void>;
}

export const test = base.extend<MobileFixtures>({
  // Mobile context with touch support
  
  context: async ({ browser, browserName }, use) => {

    const deviceConfig =
      browserName === 'firefox'
        ? {
            viewport: { width: 390, height: 844 },
            userAgent: devices['iPhone 12'].userAgent,
            hasTouch: true,
          }
        : {
            ...devices['iPhone 12'],
            hasTouch: true,
          };

    const context = await browser!.newContext(deviceConfig);

    await use(context);
    await context.close();
  },

  // Mobile Login Page
  mobileLoginPage: async ({ page }, use) => {
    const loginPage = new MobileLoginPage(page);
    await use(loginPage);
  },

  // Mobile Login Utility
  mobileLoginAsValidUser: async ({ page, mobileLoginPage }, use) => {
    const mobileLoginAsValidUser = async () => {
      const { APP_BASE_URL } = await import('../config/config');
      await page.goto(APP_BASE_URL + '/login', { waitUntil: 'domcontentloaded' });
      await mobileLoginPage.fillEmail(UserConfig.validUser.email);
      await mobileLoginPage.fillPassword(UserConfig.validUser.password);
      await mobileLoginPage.submitLogin();
    };
    await use(mobileLoginAsValidUser);
  },
});

export { expect } from "@playwright/test";