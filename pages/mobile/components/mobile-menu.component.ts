import { Locator, Page } from "@playwright/test";

/**
 * Mobile Menu Component
 * Reusable mobile navigation menu component
 */
export class MobileMenuComponent {
  readonly page: Page;
  readonly menuContainer: Locator;
  readonly closeButton: Locator;
  readonly menuItems: Locator;
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly accountLink: Locator;
  readonly searchLink: Locator;
  readonly settingsLink: Locator;
  readonly logoutLink: Locator;
  readonly overlay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuContainer = page.locator('[class*="mobile-menu"], [class*="sidebar"], nav[class*="mobile"]');
    this.closeButton = page.locator('[class*="mobile-menu"] button[aria-label*="close" i], .sidebar button[aria-label*="close" i]');
    this.menuItems = page.locator('[class*="mobile-menu"] a, [class*="sidebar"] a, nav[class*="mobile"] a');
    this.homeLink = page.locator('a:has-text("Home")');
    this.productsLink = page.locator('a:has-text("Products"), a:has-text("Shop")');
    this.cartLink = page.locator('a:has-text("Cart")');
    this.accountLink = page.locator('a:has-text("Account"), a:has-text("Profile")');
    this.searchLink = page.locator('a:has-text("Search")');
    this.settingsLink = page.locator('a:has-text("Settings")');
    this.logoutLink = page.locator('a:has-text("Logout"), a:has-text("Sign Out")');
    this.overlay = page.locator('[class*="overlay"], [class*="backdrop"]');
  }

  /**
   * Check if menu is visible
   */
  async isMenuVisible(): Promise<boolean> {
    return await this.menuContainer.isVisible();
  }

  /**
   * Close mobile menu
   */
  async closeMenu() {
    if (await this.closeButton.isVisible()) {
      await this.closeButton.click();
    }
  }

  /**
   * Close menu by clicking overlay
   */
  async closeMenuByOverlay() {
    if (await this.overlay.isVisible()) {
      await this.overlay.click();
    }
  }

  /**
   * Get menu items count
   */
  async getMenuItemsCount(): Promise<number> {
    return await this.menuItems.count();
  }

  /**
   * Click on menu item by text
   */
  async clickMenuItem(itemText: string) {
    const menuItem = this.page.locator(`[class*="mobile-menu"] a:has-text("${itemText}"), nav[class*="mobile"] a:has-text("${itemText}")`);
    await menuItem.click();
  }

  /**
   * Navigate to home from menu
   */
  async navigateToHome() {
    await this.homeLink.click();
  }

  /**
   * Navigate to products from menu
   */
  async navigateToProducts() {
    await this.productsLink.click();
  }

  /**
   * Navigate to cart from menu
   */
  async navigateToCart() {
    await this.cartLink.click();
  }

  /**
   * Navigate to account from menu
   */
  async navigateToAccount() {
    await this.accountLink.click();
  }

  /**
   * Navigate to search from menu
   */
  async navigateToSearch() {
    await this.searchLink.click();
  }

  /**
   * Open settings from menu
   */
  async openSettings() {
    await this.settingsLink.click();
  }

  /**
   * Logout from menu
   */
  async logout() {
    await this.logoutLink.click();
  }

  /**
   * Check if home link is visible
   */
  async isHomeLinkVisible(): Promise<boolean> {
    return await this.homeLink.isVisible();
  }

  /**
   * Check if logout link is visible
   */
  async isLogoutLinkVisible(): Promise<boolean> {
    return await this.logoutLink.isVisible();
  }

  /**
   * Get all menu item texts
   */
  async getMenuItemTexts(): Promise<string[]> {
    return await this.menuItems.allTextContents();
  }
}
