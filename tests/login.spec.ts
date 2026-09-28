/**
 * Login Tests - Refactored with DI and Page Object Model
 * 
 * Uses LoginPage object injected via fixtures for clean, maintainable tests
 */

import { test, expect } from '../fixtures/fixtures-di';
import { APP_BASE_URL } from '../config/config';
import { UserConfig } from '../config/user';

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_BASE_URL, { waitUntil: 'domcontentloaded' });
  });

  test('should successfully login with valid credentials', async ({ page, loginPage }) => {
    // Act: Navigate to login and fill credentials
    await loginPage.navigateToLogin();
    await loginPage.fillEmail(UserConfig.validUser.email);
    await loginPage.fillPassword(UserConfig.validUser.password);
    await loginPage.submitLogin();

    // Assert: Verify redirect and logged-in state
    await page.waitForURL(APP_BASE_URL, { timeout: 30000 });
    await loginPage.verifyUserIsLoggedIn();
  });

  test('should fail login with invalid credentials', async ({ page, loginPage }) => {
    // Act: Navigate to login and fill invalid credentials
    await loginPage.navigateToLogin();
    await loginPage.fillEmail('invalid@example.com');
    await loginPage.fillPassword('wrongpassword');
    await loginPage.submitLogin();

    // Assert: Verify error message appears
    const errorMessage = page.locator('.validation-summary-errors');
    await expect(errorMessage).toContainText('Login was unsuccessful');
  });
});
