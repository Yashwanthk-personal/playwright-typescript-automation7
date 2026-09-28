import { Page, Locator } from "@playwright/test";
import { UI_CONSTANTS } from "../../config/constants";

/**
 * Base Mobile Page Class
 * Provides common mobile-specific functionality for all mobile page objects
 * Includes touch interactions, mobile navigation, and responsive design handling
 */
export class BaseMobilePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ==================== NAVIGATION ====================

  /**
   * Navigate to a specific URL (mobile)
   */
  async navigateTo(url: string, timeout: number = UI_CONSTANTS.TIMEOUTS.NAVIGATION) {
    await this.page.goto(url, {
      waitUntil: UI_CONSTANTS.WAIT_CONDITIONS.LOAD,
      timeout,
    });
  }

  /**
   * Navigate back on mobile
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Navigate forward on mobile
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
  }

  // ==================== MOBILE TOUCH INTERACTIONS ====================

  /**
   * Tap on an element (mobile touch)
   */
  async tap(locator: Locator): Promise<void> {
    await locator.tap();
  }

  /**
   * Double tap on an element (mobile)
   */
  async doubleTap(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  /**
   * Long press on an element (mobile)
   */
  async longPress(locator: Locator, duration: number = 1000): Promise<void> {
    await locator.click({ timeout: duration });
  }

  /**
   * Swipe up on the page
   */
  async swipeUp(distance: number = 300): Promise<void> {
    const { height, width } = this.page.viewportSize() || { height: 600, width: 400 };
    const startX = width / 2;
    const startY = height * 0.8;
    const endY = startY - distance;

    // Use mouse drag to simulate swipe
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX, endY, { steps: 10 });
    await this.page.mouse.up();
  }

  /**
   * Swipe down on the page
   */
  async swipeDown(distance: number = 300): Promise<void> {
    const { height, width } = this.page.viewportSize() || { height: 600, width: 400 };
    const startX = width / 2;
    const startY = height * 0.2;
    const endY = startY + distance;

    // Use mouse drag to simulate swipe
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX, endY, { steps: 10 });
    await this.page.mouse.up();
  }

  /**
   * Swipe left on the page
   */
  async swipeLeft(distance: number = 200): Promise<void> {
    const { height, width } = this.page.viewportSize() || { height: 600, width: 400 };
    const startX = width * 0.8;
    const startY = height / 2;
    const endX = startX - distance;

    // Use mouse drag to simulate swipe
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, startY, { steps: 10 });
    await this.page.mouse.up();
  }

  /**
   * Swipe right on the page
   */
  async swipeRight(distance: number = 200): Promise<void> {
    const { height, width } = this.page.viewportSize() || { height: 600, width: 400 };
    const startX = width * 0.2;
    const startY = height / 2;
    const endX = startX + distance;

    // Use mouse drag to simulate swipe
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, startY, { steps: 10 });
    await this.page.mouse.up();
  }

  // ==================== SCROLLING ====================

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Scroll to bottom of page
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollBy(0, document.body.scrollHeight);
    });
  }

  /**
   * Scroll to top of page
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollBy(0, -document.body.scrollHeight);
    });
  }

  // ==================== FORM INTERACTIONS ====================

  /**
   * Fill text input field
   */
  async fillInput(locator: Locator, text: string): Promise<void> {
    await locator.fill(text);
  }

  /**
   * Clear text input field
   */
  async clearInput(locator: Locator): Promise<void> {
    await locator.clear();
  }

  /**
   * Type text slowly (slower for mobile readability)
   */
  async typeSlowly(locator: Locator, text: string, delayMs: number = 50): Promise<void> {
    await locator.pressSequentially(text, { delay: delayMs });
  }

  // ==================== VISIBILITY & WAITING ====================

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: Locator, timeout: number = UI_CONSTANTS.TIMEOUTS.ELEMENT_LOAD): Promise<void> {
    await locator.waitFor({ state: "visible", timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: Locator, timeout: number = UI_CONSTANTS.TIMEOUTS.ELEMENT_LOAD): Promise<void> {
    await locator.waitFor({ state: "hidden", timeout });
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: "visible", timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element text
   */
  async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || "";
  }

  /**
   * Get element attribute value
   */
  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    return await locator.getAttribute(attribute);
  }

  // ==================== SCREEN UTILITIES ====================

  /**
   * Get current page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(filename: string): Promise<Buffer | null> {
    return await this.page.screenshot({ path: `./artifacts/screenshots/${filename}.png` });
  }

  /**
   * Reload page
   */
  async reloadPage(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Accept alert (if present)
   */
  async acceptAlert(): Promise<void> {
    this.page.once("dialog", (dialog) => dialog.accept());
  }

  /**
   * Dismiss alert (if present)
   */
  async dismissAlert(): Promise<void> {
    this.page.once("dialog", (dialog) => dialog.dismiss());
  }
}
