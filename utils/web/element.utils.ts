import { Locator } from "@playwright/test";

export class ElementUtils {
  static async click(locator: Locator) {
    await locator.click();
  }

  static async type(locator: Locator, text: string) {
    await locator.fill(text);
  }

  static async check(locator: Locator) {
    if (!(await locator.isChecked())) {
      await locator.check();
    }
  }

  static async uncheck(locator: Locator) {
    if (await locator.isChecked()) {
      await locator.uncheck();
    }
  }

  static async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  static async waitForVisible(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
  }
}
