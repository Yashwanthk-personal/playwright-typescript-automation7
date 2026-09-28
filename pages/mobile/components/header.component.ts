import { Locator, Page } from "@playwright/test";

/**
 * Mobile Header Component
 * Reusable header component for mobile pages
 */
export class MobileHeaderComponent {
  readonly page: Page;
  readonly hamburgerMenu: Locator;
  readonly logo: Locator;
  readonly title: Locator;
  readonly backButton: Locator;
  readonly notificationBadge: Locator;
  readonly cartBadge: Locator;
  readonly searchIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.hamburgerMenu = page.locator('[class*="menu"]').first();
    this.logo = page.locator('img[alt*="logo"]').first();
    this.title = page.locator('header h1, [class*="header"] h1').first();
    this.backButton = page.locator('button[aria-label*="back" i]');
    this.notificationBadge = page.locator('[class*="notification"]');
    this.cartBadge = page.locator('[class*="cart-count"], [data-qa*="cart"]');
    this.searchIcon = page.locator('button[aria-label*="search" i]');
  }

  /**
   * Open hamburger menu
   */
  async openHamburgerMenu() {
    await this.hamburgerMenu.click();
  }

  /**
   * Get header title text
   */
  async getHeaderTitle(): Promise<string> {
    return await this.title.textContent() || "";
  }

  /**
   * Click back button if visible
   */
  async clickBack() {
    if (await this.backButton.isVisible()) {
      await this.backButton.click();
    }
  }

  /**
   * Get notification badge count
   */
  async getNotificationCount(): Promise<string> {
    return await this.notificationBadge.textContent() || "0";
  }

  /**
   * Get cart item count from badge
   */
  async getCartItemCount(): Promise<string> {
    return await this.cartBadge.textContent() || "0";
  }

  /**
   * Check if search icon is visible
   */
  async isSearchIconVisible(): Promise<boolean> {
    return await this.searchIcon.isVisible();
  }

  /**
   * Click search icon
   */
  async clickSearchIcon() {
    await this.searchIcon.click();
  }

  /**
   * Click logo to go home
   */
  async clickLogo() {
    await this.logo.click();
  }

  /**
   * Check if hamburger menu is visible
   */
  async isHamburgerMenuVisible(): Promise<boolean> {
    return await this.hamburgerMenu.isVisible();
  }
}
