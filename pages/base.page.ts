import { Page, Locator } from "@playwright/test";
import { UI_CONSTANTS } from "../config/constants";

/**
 * Base Page Class
 * Provides common functionality for all page objects
 * Includes methods for navigation, interaction, and assertion
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ==================== NAVIGATION ====================

  /**
   * Navigate to a specific URL
   */
  async navigateTo(url: string, timeout: number = UI_CONSTANTS.TIMEOUTS.NAVIGATION) {
    await this.page.goto(url, {
      waitUntil: UI_CONSTANTS.WAIT_CONDITIONS.LOAD,
      timeout,
    });
  }

  /**
   * Navigate to URL with custom wait condition
   */
  async navigateToWithWaitCondition(
    url: string,
    waitCondition: "load" | "domcontentloaded" | "networkidle" | "commit",
    timeout: number = UI_CONSTANTS.TIMEOUTS.NAVIGATION
  ) {
    await this.page.goto(url, {
      waitUntil: waitCondition,
      timeout,
    });
  }

  /**
   * Go back to previous page
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Go forward to next page
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
  }

  /**
   * Reload current page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  // ==================== WAIT CONDITIONS ====================

  /**
   * Wait for element to be visible
   */
  async waitForElement(
    selector: string,
    timeout: number = UI_CONSTANTS.TIMEOUTS.ELEMENT_LOAD
  ): Promise<void> {
    await this.page.locator(selector).waitFor({ timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementToBeHidden(
    selector: string,
    timeout: number = UI_CONSTANTS.TIMEOUTS.ELEMENT_LOAD
  ): Promise<void> {
    await this.page.locator(selector).waitFor({ state: "hidden", timeout });
  }

  /**
   * Wait for element to be enabled
   */
  async waitForElementToBeEnabled(
    selector: string,
    timeout: number = UI_CONSTANTS.TIMEOUTS.ELEMENT_LOAD
  ): Promise<void> {
    await this.page.locator(selector).waitFor({ state: "attached", timeout });
  }

  /**
   * Wait for specific text to appear
   */
  async waitForText(
    text: string,
    timeout: number = UI_CONSTANTS.TIMEOUTS.ELEMENT_LOAD
  ): Promise<void> {
    await this.page.waitForFunction(
      (searchText: string) => document.body.textContent?.includes(searchText),
      text,
      { timeout }
    );
  }

  /**
   * Wait for URL to match pattern
   */
  async waitForURL(
    urlPattern: string | RegExp,
    timeout: number = UI_CONSTANTS.TIMEOUTS.NAVIGATION
  ): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Wait for function to return true
   */
  async waitForFunction(
    callback: () => boolean,
    timeout: number = UI_CONSTANTS.TIMEOUTS.MEDIUM
  ): Promise<void> {
    await this.page.waitForFunction(callback, { timeout });
  }

  // ==================== ELEMENT INTERACTION ====================

  /**
   * Click on an element
   */
  async click(
    selector: string,
    timeout: number = UI_CONSTANTS.TIMEOUTS.ELEMENT_LOAD
  ): Promise<void> {
    await this.waitForElement(selector, timeout);
    await this.page.locator(selector).click();
  }

  /**
   * Double click on an element
   */
  async doubleClick(selector: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).dblclick();
  }

  /**
   * Right click on an element
   */
  async rightClick(selector: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).click({ button: "right" });
  }

  /**
   * Hover over an element
   */
  async hover(selector: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).hover();
  }

  /**
   * Fill input with text
   */
  async fill(selector: string, text: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).fill(text);
  }

  /**
   * Type text character by character
   */
  async type(selector: string, text: string, delay: number = 50): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).type(text, { delay });
  }

  /**
   * Clear input field
   */
  async clear(selector: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).clear();
  }

  /**
   * Press a key
   */
  async pressKey(selector: string, key: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).press(key);
  }

  /**
   * Select option from dropdown by value
   */
  async selectOption(selector: string, value: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).selectOption(value);
  }

  /**
   * Select option from dropdown by label
   */
  async selectOptionByLabel(selector: string, label: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).selectOption({ label });
  }

  /**
   * Check a checkbox
   */
  async check(selector: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).check();
  }

  /**
   * Uncheck a checkbox
   */
  async uncheck(selector: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).uncheck();
  }

  /**
   * Focus on an element
   */
  async focus(selector: string): Promise<void> {
    await this.waitForElement(selector);
    await this.page.locator(selector).focus();
  }

  /**
   * Blur (unfocus) from an element
   */
  async blur(selector: string): Promise<void> {
    await this.page.locator(selector).blur();
  }

  // ==================== ELEMENT STATE CHECKING ====================

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      await this.waitForElement(selector, UI_CONSTANTS.TIMEOUTS.SHORT);
      return await this.page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is hidden
   */
  async isHidden(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isHidden();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isEnabled();
  }

  /**
   * Check if element is disabled
   */
  async isDisabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isDisabled();
  }

  /**
   * Check if checkbox is checked
   */
  async isChecked(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isChecked();
  }

  /**
   * Check if element exists in DOM
   */
  async exists(selector: string): Promise<boolean> {
    return (await this.page.locator(selector).count()) > 0;
  }

  /**
   * Get element count
   */
  async getElementCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  // ==================== TEXT & VALUE RETRIEVAL ====================

  /**
   * Get text content of an element
   */
  async getText(selector: string): Promise<string> {
    await this.waitForElement(selector);
    return await this.page.locator(selector).textContent() || "";
  }

  /**
   * Get all text content from multiple elements
   */
  async getAllText(selector: string): Promise<string[]> {
    return await this.page.locator(selector).allTextContents();
  }

  /**
   * Get input value
   */
  async getValue(selector: string): Promise<string> {
    await this.waitForElement(selector);
    return await this.page.locator(selector).inputValue();
  }

  /**
   * Get attribute value
   */
  async getAttribute(selector: string, attributeName: string): Promise<string | null> {
    await this.waitForElement(selector);
    return await this.page.locator(selector).getAttribute(attributeName);
  }

  /**
   * Get multiple attribute values
   */
  async getAttributes(selector: string, attributeNames: string[]): Promise<Record<string, string | null>> {
    await this.waitForElement(selector);
    const attributes: Record<string, string | null> = {};
    for (const name of attributeNames) {
      attributes[name] = await this.page.locator(selector).getAttribute(name);
    }
    return attributes;
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  // ==================== FORM OPERATIONS ====================

  /**
   * Fill form with multiple fields
   */
  async fillForm(formData: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(formData)) {
      await this.fill(selector, value);
    }
  }

  /**
   * Submit form
   */
  async submitForm(selector: string): Promise<void> {
    await this.page.locator(selector).evaluate((form: HTMLFormElement) => form.submit());
  }

  /**
   * Clear form
   */
  async clearForm(selector: string): Promise<void> {
    await this.page.locator(selector).evaluate((form: HTMLFormElement) => form.reset());
  }

  // ==================== SCREENSHOT & VISUAL ====================

  /**
   * Take screenshot of entire page
   */
  async takeScreenshot(filename: string): Promise<Buffer> {
    return await this.page.screenshot({ path: filename, fullPage: true });
  }

  /**
   * Take screenshot of specific element
   */
  async takeElementScreenshot(selector: string, filename: string): Promise<Buffer> {
    await this.waitForElement(selector);
    return await this.page.locator(selector).screenshot({ path: filename });
  }

  // ==================== JAVASCRIPT EXECUTION ====================

  /**
   * Execute JavaScript in page context
   */
  async executeScript<T>(script: string, ...args: unknown[]): Promise<T> {
    return await this.page.evaluate<T>(script, ...args);
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Scroll to top
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * Scroll to bottom
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  // ==================== PAGE STATE ====================

  /**
   * Get page content
   */
  async getPageContent(): Promise<string> {
    return await this.page.content();
  }

  /**
   * Get all available text on page
   */
  async getAllPageText(): Promise<string> {
    return await this.page.evaluate(() => document.body.innerText);
  }

  /**
   * Close page
   */
  async closePage(): Promise<void> {
    await this.page.close();
  }

  /**
   * Get locator for element
   */
  getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get page object
   */
  getPage(): Page {
    return this.page;
  }
}