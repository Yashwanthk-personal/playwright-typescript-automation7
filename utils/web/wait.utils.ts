import { Page, Locator } from "@playwright/test";

export class WaitUtils {
  static async waitForElementToBeVisible(page: Page, locator: Locator, timeout: number = 30000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  static async waitForElementToBeHidden(page: Page, locator: Locator, timeout: number = 30000) {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  static async waitForPageLoad(page: Page, timeout: number = 60000) {
    await page.waitForLoadState('load', { timeout });
  }

  static async shortWait(page: Page, timeout: number = 2000) {
    await page.waitForTimeout(timeout);
  }
}
