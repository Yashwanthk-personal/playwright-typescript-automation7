import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ApiExecutor, ExecutionConfig } from '../api/core/executor';

/**
 * Refactored Custom Fixtures with Dependency Injection
 * 
 * This fixture set follows the Dependency Injection pattern:
 * - Each page object is injected directly via the fixture
 * - Page objects receive `page` through their constructor
 * - Tests are clean and only receive what they need
 * - Loose coupling between tests and page implementations
 * 
 * @example
 * test('should login successfully', async ({ loginPage }) => {
 *   await loginPage.navigateToLogin();
 *   await loginPage.login('user@example.com', 'password');
 * });
 */

interface PageObjectFixtures {
  // ==================== Page Objects ====================
  /**
   * LoginPage - Handles login-related UI interactions
   * Injected page through constructor for loose coupling
   */
  loginPage: LoginPage;

  // ==================== API Client ====================
  /**
   * API client for making HTTP requests
   * Configured with base URL and timeouts
   */
  apiClient: ApiExecutor;

  // ==================== Navigation Utilities ====================
  /**
   * Login with valid test credentials
   */
  loginAsValidUser: () => Promise<void>;
}

const baseUrl = process.env.DEMOWEBSHOP_BASE_URL || 'http://localhost:80';

/**
 * Extended test with DI fixtures
 * Use this in your tests instead of importing from '@playwright/test'
 * 
 * @example
 * import { test } from '../fixtures/fixtures-di';
 * 
 * test('example', async ({ loginPage, homePage }) => {
 *   // loginPage and homePage are automatically injected
 * });
 */
export const test = base.extend<PageObjectFixtures>({
  /**
   * LoginPage Fixture
   * Creates a new LoginPage instance with the page object injected
   * 
   * Pattern: Direct injection - test only receives what it needs
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /**
   * API Client Fixture
   * Provides an HTTP client for API testing
   * Automatically cleaned up after test
   */
  apiClient: async ({}, use) => {
    const config: ExecutionConfig = {
      baseUrl: baseUrl,
      timeout: 30000,
      retryAttempts: 1,
    };
    const apiClient = new ApiExecutor(config);

    await use(apiClient);

    // Cleanup
    await apiClient.close().catch(() => {
      // Silently fail on cleanup
    });
  },

  /**
   * Login Utility
   * Provides quick login with valid test credentials
   * 
   * Usage:
   * await loginAsValidUser();
   */
  loginAsValidUser: async ({ page, loginPage }, use) => {
    const { validUser } = require('../config/user').UserConfig;

    const loginAsValidUser = async () => {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
      await loginPage.fillEmail(validUser.email);
      await loginPage.fillPassword(validUser.password);
      await loginPage.submitLogin();
      // Wait for redirect to complete
      await page.waitForURL(baseUrl, { timeout: 30000 });
    };

    await use(loginAsValidUser);
  },
});

// Export 'expect' for convenience
export { expect } from '@playwright/test';
