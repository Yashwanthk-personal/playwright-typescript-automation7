import { test as base, Page } from '@playwright/test';
import { ServiceContainer } from './service.container';
import { ApiExecutor, ExecutionConfig } from '../api/core/executor';
import { LoginPage } from '../pages/login.page';
import { HomePage } from '../pages/home.page';
import { CartPage } from '../pages/cart.page';
import { ProductPage } from '../pages/product.page';
import { AccountPage } from '../pages/account.page';
import { UserConfig } from '../config/user';

/**
 * Custom Fixtures Interface
 * Extends Playwright's test fixtures with custom page objects and services
 */
interface CustomFixtures {
  // Service Container for dependency injection
  container: ServiceContainer;

  // Individual page objects
  loginPage: LoginPage;
  homePage: HomePage;
  cartPage: CartPage;
  productPage: ProductPage;
  accountPage: AccountPage;

  // API Client
  apiClient: ApiExecutor;

  // Navigation utilities
  navigateToHome: void;
  loginAsValidUser: void;
  loginAsInvalidUser: void;
  clearCart: void;

  // Common test setup
  authenticatedContext: void;
}

const baseUrl = process.env.DEMOWEBSHOP_BASE_URL || 'http://localhost:80';

/**
 * Extended test with custom fixtures
 * Implements dependency injection pattern
 */
export const test = base.extend<CustomFixtures>({
  /**
   * Service Container
   * Provides centralized access to all page objects and API clients
   * Implements dependency injection for all fixtures
   */
  container: async ({ page }, use) => {
    const container = new ServiceContainer(page, baseUrl);

    await use(container);

    // Cleanup after test
    await container.cleanup();
  },

  /**
   * LoginPage fixture
   * Injected from container
   */
  loginPage: async ({ container }, use) => {
    const loginPage = container.getLoginPage();
    await use(loginPage);
  },

  /**
   * HomePage fixture
   * Injected from container
   */
  homePage: async ({ container }, use) => {
    const homePage = container.getHomePage();
    await use(homePage);
  },

  /**
   * CartPage fixture
   * Injected from container
   */
  cartPage: async ({ container }, use) => {
    const cartPage = container.getCartPage();
    await use(cartPage);
  },

  /**
   * ProductPage fixture
   * Injected from container
   */
  productPage: async ({ container }, use) => {
    const productPage = container.getProductPage();
    await use(productPage);
  },

  /**
   * AccountPage fixture
   * Injected from container
   */
  accountPage: async ({ container }, use) => {
    const accountPage = container.getAccountPage();
    await use(accountPage);
  },

  /**
   * API Client fixture
   * Injected from container with automatic initialization
   */
  apiClient: async ({ container }, use) => {
    const apiClient = container.getApiClient();
    await apiClient.init();
    await use(apiClient);
  },

  /**
   * Navigate to home page
   * Automatically navigates to home before test
   */
  navigateToHome: async ({ page }, use) => {
    await page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await use();
  },

  /**
   * Login as valid user
   * Automatically logs in a user before test
   */
  loginAsValidUser: async ({ page }, use) => {
    await page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
    });

    // Click login link
    await page.getByText('Log in').click();

    // Fill credentials
    await page.locator('#Email').fill(UserConfig.validUser.email);
    await page.locator('#Password').fill(UserConfig.validUser.password);

    // Submit login
    await page
      .locator(
        'input[type="submit"].login-button, input[type="submit"][value*="Log in"], button.login-button'
      )
      .click();

    // Wait for successful login
    await page.waitForURL(baseUrl, { timeout: 30000 });
    await page.waitForLoadState('load');

    // Verify user is logged in
    await page
      .getByRole('link', { name: 'Tricentis Demo Web Shop' })
      .waitFor({ state: 'visible', timeout: 5000 });

    await use();
  },

  /**
   * Login with invalid credentials
   * Tests login failure scenarios
   */
  loginAsInvalidUser: async ({ page }, use) => {
    await page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
    });

    // Click login link
    await page.getByText('Log in').click();

    // Fill invalid credentials
    await page.locator('#Email').fill('invalid@example.com');
    await page.locator('#Password').fill('wrongpassword');

    // Submit login
    await page
      .locator(
        'input[type="submit"].login-button, input[type="submit"][value*="Log in"], button.login-button'
      )
      .click();

    await use();
  },

  /**
   * Clear cart
   * Empties shopping cart before test
   */
  clearCart: async ({ page }, use) => {
    try {
      // Navigate to cart
      await page.goto(`${baseUrl}/cart`, {
        waitUntil: 'domcontentloaded',
      });

      // Remove all items if they exist
      const removeButtons = await page.locator('button.remove-button, a.remove-from-cart').all();
      for (const button of removeButtons) {
        await button.click();
      }
    } catch {
      // Cart might already be empty or structure different
    }

    await use();
  },

  /**
   * Authenticated context
   * Sets up user session and authentication state
   */
  authenticatedContext: async ({ page }, use) => {
    await page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
    });

    // Perform login
    await page.getByText('Log in').click();
    await page.locator('#Email').fill(UserConfig.validUser.email);
    await page.locator('#Password').fill(UserConfig.validUser.password);
    await page
      .locator(
        'input[type="submit"].login-button, input[type="submit"][value*="Log in"], button.login-button'
      )
      .click();

    // Wait for authentication
    await page.waitForURL(baseUrl, { timeout: 30000 });

    await use();
  },
});

export { expect } from '@playwright/test';
