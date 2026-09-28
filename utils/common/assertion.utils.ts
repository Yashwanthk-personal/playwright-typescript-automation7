import { Locator, Page, expect } from "@playwright/test";

export class AssertionUtils {
  static async verifyVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  static async verifyText(locator: Locator, expectedText: string) {
    await expect(locator).toHaveText(expectedText);
  }

  static async verifyElementCount(locator: Locator, expectedCount: number) {
    const count = await locator.count();
    expect(count).toBe(expectedCount);
  }

  static async verifyAttribute(locator: Locator, attribute: string, expectedValue: string) {
    const value = await locator.getAttribute(attribute);
    expect(value).toBe(expectedValue);
  }
}
