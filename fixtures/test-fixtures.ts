import { test as base, Page } from '@playwright/test';

interface CustomFixtures {
  navigateToHomePage: Page;
  loginUser: Page;
  resetCart: Page;
}

const test = base.extend<CustomFixtures>({
  // Fixture to navigate to the home page before each test
  navigateToHomePage: async ({ page }, use) => {
    const baseUrl = process.env.DEMOWEBSHOP_BASE_URL || 'http://localhost:80';
    await page.goto(baseUrl);
    await use(page);
  },

  // Fixture to log in a user before tests that require authentication
  loginUser: async ({ page }, use) => {
    const baseUrl = process.env.DEMOWEBSHOP_BASE_URL || 'http://localhost:80';
    await page.goto(baseUrl);
    await page.getByText('Log in').click();
    await page.locator('#Email').fill('testuser@example.com'); // Replace with valid email
    await page.locator('#Password').fill('password123'); // Replace with valid password
    await page.locator('input[type="submit"].login-button, input[type="submit"][value*="Log in"], button.login-button').click();
    
    // Wait for successful login - verify redirect
    await page.waitForURL(baseUrl, { timeout: 30000 });
    await page.waitForLoadState('load');
    
    // Verify user is logged in by checking for account link
    await page.getByRole('link', { name: 'Tricentis Demo Web Shop' }).waitFor({ state: 'visible', timeout: 5000 });
    await use(page);
  },

  // Fixture to reset the cart before tests that require a clean cart state
  resetCart: async ({ page }, use) => {
    const baseUrl = process.env.DEMOWEBSHOP_BASE_URL || 'http://localhost:80';
    await page.goto(baseUrl);
    await page.locator('a.ico-cart').click();
    await page.locator('button.empty-cart').click(); // Assuming there's a button to empty the cart
    await use(page);
  },
});

export default test;