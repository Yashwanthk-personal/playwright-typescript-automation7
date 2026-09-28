/**
 * Test Utilities
 * 
 * Reusable helper functions for common test operations
 * These promote DRY principle and reduce boilerplate
 * 
 * Usage:
 * import { testUtils } from '../utils/test-utils';
 * await testUtils.login(page, email, password);
 */

import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

const BASE_URL = process.env.DEMOWEBSHOP_BASE_URL || 'http://localhost:80';

/**
 * Login utilities
 */
export const loginUtils = {
  /**
   * Navigate to and perform login
   * @param page - Playwright page object
   * @param loginPage - LoginPage object
   * @param email - User email
   * @param password - User password
   */
  async login(
    page: Page,
    loginPage: LoginPage,
    email: string,
    password: string
  ): Promise<void> {
    await page.goto('/login');
    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);
    await loginPage.submitLogin();
    await page.waitForURL('/', { timeout: 30000 });
  },

  /**
   * Verify user is logged in
   * @param page - Playwright page object
   * @returns true if logged in, false otherwise
   */
  async isLoggedIn(page: Page): Promise<boolean> {
    try {
      const logoutLink = page.getByRole('link', { name: /Logout|Log Off/i });
      return await logoutLink.isVisible();
    } catch {
      return false;
    }
  },

  /**
   * Logout user
   * @param page - Playwright page object
   */
  async logout(page: Page): Promise<void> {
    const logoutLink = page.getByRole('link', { name: /Logout|Log Off/i });
    await logoutLink.click();
    await page.waitForURL('/', { timeout: 30000 });
  },
};

/**
 * Cart utilities
 */
export const cartUtils = {
  /**
   * Add product to cart by product name
   * @param page - Playwright page object
   * @param productName - Name of the product to add
   */
  async addProductToCart(page: Page, productName: string): Promise<void> {
    // Find product by name and click add to cart
    const productLocator = page.locator(`:has-text("${productName}")`);
    const addToCartButton = productLocator.locator('button:has-text("Add to cart")');
    await addToCartButton.click();

    // Wait for cart update
    await page.waitForTimeout(500);
  },

  /**
   * Get current cart item count
   * @param page - Playwright page object
   * @returns number of items in cart
   */
  async getCartItemCount(page: Page): Promise<number> {
    try {
      const cartBadge = page.locator('.cart-qty');
      const text = await cartBadge.innerText();
      return parseInt(text, 10);
    } catch {
      return 0;
    }
  },

  /**
   * Navigate to cart page
   * @param page - Playwright page object
   */
  async goToCart(page: Page): Promise<void> {
    const cartLink = page.getByRole('link', { name: /Cart|Shopping Cart/i });
    await cartLink.click();
    await page.waitForURL('**/cart');
  },

  /**
   * Clear all items from cart
   * @param page - Playwright page object
   */
  async clearAllItems(page: Page): Promise<void> {
    await cartUtils.goToCart(page);
    const removeButtons = page.locator('button:has-text("Remove")');
    const count = await removeButtons.count();

    for (let i = 0; i < count; i++) {
      const buttons = page.locator('button:has-text("Remove")');
      if ((await buttons.count()) > 0) {
        await buttons.first().click();
        await page.waitForTimeout(300);
      }
    }
  },

  /**
   * Verify cart is empty
   * @param page - Playwright page object
   */
  async verifyEmpty(page: Page): Promise<void> {
    const emptyMessage = page.locator('.no-data, text=/Your shopping cart is empty/i');
    await expect(emptyMessage).toBeVisible();
  },
};

/**
 * Navigation utilities
 */
export const navigationUtils = {
  /**
   * Navigate to home page
   * @param page - Playwright page object
   */
  async goToHome(page: Page): Promise<void> {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  },

  /**
   * Navigate to products page
   * @param page - Playwright page object
   */
  async goToProducts(page: Page): Promise<void> {
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('domcontentloaded');
  },

  /**
   * Navigate to search results
   * @param page - Playwright page object
   * @param query - Search query
   */
  async searchProducts(page: Page, query: string): Promise<void> {
    await navigationUtils.goToHome(page);
    const searchInput = page.locator('#small-searchterms');
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await page.waitForLoadState('domcontentloaded');
  },

  /**
   * Navigate to account page
   * @param page - Playwright page object
   */
  async goToAccount(page: Page): Promise<void> {
    const accountLink = page.getByRole('link', { name: /My Account|Account/i });
    await accountLink.click();
    await page.waitForLoadState('domcontentloaded');
  },
};

/**
 * Search utilities
 */
export const searchUtils = {
  /**
   * Perform a product search
   * @param page - Playwright page object
   * @param query - Search term
   * @returns array of product names found
   */
  async searchAndGetResults(page: Page, query: string): Promise<string[]> {
    const searchInput = page.locator('#small-searchterms');
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await page.waitForLoadState('domcontentloaded');

    const productNames = await page
      .locator('.product-item')
      .locator('a[href*="/p/"]')
      .allTextContents();

    return productNames;
  },

  /**
   * Verify search returned results
   * @param page - Playwright page object
   */
  async verifyResultsFound(page: Page): Promise<void> {
    const productItems = page.locator('.product-item');
    await expect(productItems.first()).toBeVisible();
  },

  /**
   * Verify no results message
   * @param page - Playwright page object
   */
  async verifyNoResultsMessage(page: Page): Promise<void> {
    const noResultsMessage = page.locator('text=/No products found/i');
    await expect(noResultsMessage).toBeVisible();
  },
};

/**
 * Assertion utilities
 * 
 * Helper functions for common assertions
 * These provide semantic clarity to tests
 */
export const assertionUtils = {
  /**
   * Assert page navigated to expected URL
   * @param page - Playwright page object
   * @param urlPattern - Expected URL pattern
   */
  async assertUrlContains(page: Page, urlPattern: string): Promise<void> {
    await expect(page).toHaveURL(new RegExp(urlPattern));
  },

  /**
   * Assert element is visible
   * @param page - Playwright page object
   * @param selector - CSS selector or role
   */
  async assertElementVisible(page: Page, selector: string): Promise<void> {
    await expect(page.locator(selector)).toBeVisible();
  },

  /**
   * Assert element contains text
   * @param page - Playwright page object
   * @param selector - CSS selector
   * @param text - Expected text
   */
  async assertElementContainsText(
    page: Page,
    selector: string,
    text: string
  ): Promise<void> {
    await expect(page.locator(selector)).toContainText(text);
  },

  /**
   * Assert element is hidden
   * @param page - Playwright page object
   * @param selector - CSS selector
   */
  async assertElementHidden(page: Page, selector: string): Promise<void> {
    await expect(page.locator(selector)).toBeHidden();
  },

  /**
   * Assert error message appears
   * @param page - Playwright page object
   * @param message - Expected error message
   */
  async assertErrorMessage(page: Page, message: string): Promise<void> {
    const errorLocator = page.locator('.validation-summary-errors, .error-message, [role="alert"]');
    await expect(errorLocator).toContainText(message);
  },

  /**
   * Assert success message appears
   * @param page - Playwright page object
   * @param message - Expected success message
   */
  async assertSuccessMessage(page: Page, message: string): Promise<void> {
    const successLocator = page.locator('.success-message, .alert-success, [role="status"]');
    await expect(successLocator).toContainText(message);
  },
};

/**
 * Waiters and delays
 * 
 * Use sparingly - prefer explicit waits with locators
 * These are for cases where no locator is available
 */
export const waitUtils = {
  /**
   * Wait for network to be idle
   * @param page - Playwright page object
   */
  async waitForNetworkIdle(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
  },

  /**
   * Wait for element to appear
   * @param page - Playwright page object
   * @param selector - CSS selector
   * @param timeout - timeout in milliseconds
   */
  async waitForElement(
    page: Page,
    selector: string,
    timeout: number = 5000
  ): Promise<void> {
    await page.locator(selector).waitFor({ timeout });
  },

  /**
   * Small delay utility (avoid overuse)
   * @param ms - milliseconds to wait
   */
  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

/**
 * Combined utilities export
 * 
 * Usage:
 * import { testUtils } from '../utils/test-utils';
 * await testUtils.login.login(page, loginPage, email, password);
 * await testUtils.cart.goToCart(page);
 */
export const testUtils = {
  login: loginUtils,
  cart: cartUtils,
  navigation: navigationUtils,
  search: searchUtils,
  assertion: assertionUtils,
  wait: waitUtils,
};

export default testUtils;
