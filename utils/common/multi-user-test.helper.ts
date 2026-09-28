import { Page } from '@playwright/test';
import { ApiExecutor } from '../../api/core/executor';
import { UserContext, UserContextManager } from './user-context.manager';

/**
 * Multi-User Test Helpers
 * Provides utilities for common multi-user testing scenarios
 */
export class MultiUserTestHelper {
  /**
   * Execute action on multiple users in parallel
   */
  static async executeOnMultipleUsers<T>(
    users: UserContext[],
    action: (user: UserContext) => Promise<T>
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    const promises = users.map(async user => {
      try {
        const result = await action(user);
        results.set(user.userId, result);
      } catch (error) {
        console.error(`Error executing action for user ${user.email}:`, error);
        throw error;
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Login multiple users
   */
  static async loginMultipleUsers(
    pages: Map<string, Page>,
    baseUrl: string
  ): Promise<Map<string, Page>> {
    const loggedInPages = new Map<string, Page>();

    for (const [userId, page] of pages) {
      const userContext = UserContextManager.getUserContext(userId);

      try {
        await page.goto(baseUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });

        // Click login link
        await page.getByText('Log in').click();

        // Fill credentials
        await page.locator('#Email').fill(userContext.email);
        await page.locator('#Password').fill(userContext.password);

        // Submit login
        await page
          .locator(
            'input[type="submit"].login-button, input[type="submit"][value*="Log in"], button.login-button'
          )
          .click();

        // Wait for successful login
        await page.waitForURL('**/home', { timeout: 60000 });

        loggedInPages.set(userId, page);
      } catch (error) {
        console.error(`Login failed for user ${userContext.email}:`, error);
        throw error;
      }
    }

    return loggedInPages;
  }

  /**
   * Add products to cart for multiple users in parallel
   */
  static async addToCartMultipleUsers(
    pages: Map<string, Page>,
    productName: string,
    quantity: number = 1
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    const promises = Array.from(pages).map(async ([userId, page]) => {
      try {
        // Search for product
        await page.locator('input[value="Search"]').fill(productName);
        await page.locator('input[type="submit"][value="Search"]').click();

        // Add to cart
        await page.locator(`text=${productName}`).first().click();
        for (let i = 0; i < quantity; i++) {
          await page.locator('input.qty-input').fill(String(quantity));
        }
        await page.locator('input[value="Add to cart"]').click();

        results.set(userId, true);
      } catch (error) {
        console.error(`Failed to add product for user ${userId}:`, error);
        results.set(userId, false);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Perform API calls with multiple user tokens
   */
  static async executeApiForMultipleUsers<T>(
    users: UserContext[],
    apiClients: Map<string, ApiExecutor>,
    action: (user: UserContext, apiClient: ApiExecutor) => Promise<T>
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();

    for (const user of users) {
      const apiClient = apiClients.get(user.userId);
      if (!apiClient) {
        throw new Error(`API client not found for user ${user.email}`);
      }

      try {
        const result = await action(user, apiClient);
        results.set(user.userId, result);
      } catch (error) {
        console.error(`API call failed for user ${user.email}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Verify state consistency across multiple users
   */
  static async verifyConsistency<T>(
    users: UserContext[],
    pages: Map<string, Page>,
    selector: string,
    expectedValue: string
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    const promises = Array.from(pages).map(async ([userId, page]) => {
      try {
        const value = await page.locator(selector).textContent();
        const isConsistent = value?.includes(expectedValue) || false;
        results.set(userId, isConsistent);
      } catch (error) {
        console.error(`Consistency check failed for user ${userId}:`, error);
        results.set(userId, false);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Wait for all users to reach a certain state
   */
  static async waitForAllUsersReady(
    pages: Map<string, Page>,
    selector: string,
    timeout: number = 60000
  ): Promise<void> {
    const promises = Array.from(pages.values()).map(page =>
      page.locator(selector).waitFor({ state: 'visible', timeout })
    );

    await Promise.all(promises);
  }

  /**
   * Collect data from multiple user sessions
   */
  static async collectDataFromMultipleUsers(
    pages: Map<string, Page>,
    extractors: {
      selector: string;
      attribute?: string;
      name: string;
    }[]
  ): Promise<Map<string, Record<string, string>>> {
    const results = new Map<string, Record<string, string>>();

    for (const [userId, page] of pages) {
      const userData: Record<string, string> = {};

      for (const extractor of extractors) {
        try {
          const element = page.locator(extractor.selector);
          const value = extractor.attribute
            ? await element.getAttribute(extractor.attribute)
            : await element.textContent();

          userData[extractor.name] = value || '';
        } catch (error) {
          console.error(
            `Failed to extract ${extractor.name} for user ${userId}:`,
            error
          );
          userData[extractor.name] = '';
        }
      }

      results.set(userId, userData);
    }

    return results;
  }

  /**
   * Get summary of multi-user test results
   */
  static getSummary<T>(
    results: Map<string, T>,
    users: UserContext[]
  ): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    userResults: Array<{ email: string; result: T }>;
  } {
    const successful = results.size;
    const failed = users.length - successful;
    const successRate = (successful / users.length) * 100;

    const userResults = users
      .filter(u => results.has(u.userId))
      .map(u => ({
        email: u.email,
        result: results.get(u.userId)!,
      }));

    return {
      total: users.length,
      successful,
      failed,
      successRate,
      userResults,
    };
  }
}
