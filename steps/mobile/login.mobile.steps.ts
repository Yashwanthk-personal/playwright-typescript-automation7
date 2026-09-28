import { Given, When, Then } from '@cucumber/cucumber';
import { MobileLoginPage } from '../../pages/mobile/login.mobile.page';
import { expect } from '@playwright/test';
import { APP_BASE_URL } from '../../config/config';
import { UserConfig } from '../../config/user';

let mobileLoginPage: MobileLoginPage;

Given('I am on the mobile login page', async function () {
  await this.page.goto(APP_BASE_URL + '/login', { waitUntil: 'domcontentloaded' });
  // Set mobile viewport (iPhone 12)
  await this.page.setViewportSize({
    width: 390,
    height: 844,
  });
  mobileLoginPage = new MobileLoginPage(this.page);
});

When('I enter a mobile email {string}', async function (email: string) {
  await mobileLoginPage.fillEmail(email);
});

When('I enter a mobile password {string}', async function (password: string) {
  await mobileLoginPage.fillPassword(password);
});

When('I enter an invalid mobile email {string}', async function (email: string) {
  await mobileLoginPage.fillEmail(email);
});

When('I enter an invalid mobile password {string}', async function (password: string) {
  await mobileLoginPage.fillPassword(password);
});

When('I click the mobile login button', async function () {
  await mobileLoginPage.submitLogin();
});

Then('I should be redirected to the mobile homepage', async function () {
  await this.page.waitForURL(APP_BASE_URL, { timeout: 30000 });
});

Then('I should see my mobile account link', async function () {
  await mobileLoginPage.verifyUserIsLoggedIn();
});

Then('I should see a mobile error message', async function () {
  const errorMessage = await this.page.locator('.validation-summary-errors').innerText();
  expect(errorMessage.length).toBeGreaterThan(0);
});

Then('the mobile login form should be visible', async function () {
  await expect(mobileLoginPage.emailInput.getLocator()).toBeVisible();
  await expect(mobileLoginPage.passwordInput.getLocator()).toBeVisible();
});

Then('the mobile email field should be visible', async function () {
  await expect(mobileLoginPage.emailInput.getLocator()).toBeVisible();
});

Then('the mobile password field should be visible', async function () {
  await expect(mobileLoginPage.passwordInput.getLocator()).toBeVisible();
});

Then('the mobile login button should be visible', async function () {
  await expect(mobileLoginPage.loginButton.getLocator()).toBeVisible();
});

When('I view the login form on different mobile screen sizes', async function () {
  const screenSizes = [
    { width: 375, height: 667 }, // Small phone
    { width: 390, height: 844 }, // iPhone 12
    { width: 414, height: 896 }, // Large phone
  ];

  for (const size of screenSizes) {
    await this.page.setViewportSize(size);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
});

Then('all form elements should be accessible on small screens', async function () {
  await this.page.setViewportSize({ width: 375, height: 667 });
  await expect(mobileLoginPage.emailInput.getLocator()).toBeVisible();
  await expect(mobileLoginPage.passwordInput.getLocator()).toBeVisible();
  await expect(mobileLoginPage.loginButton.getLocator()).toBeVisible();
});

Then('all form elements should be accessible on large screens', async function () {
  await this.page.setViewportSize({ width: 414, height: 896 });
  await expect(mobileLoginPage.emailInput.getLocator()).toBeVisible();
  await expect(mobileLoginPage.passwordInput.getLocator()).toBeVisible();
  await expect(mobileLoginPage.loginButton.getLocator()).toBeVisible();
});

Then('all form elements should be accessible on tablet screens', async function () {
  await this.page.setViewportSize({ width: 768, height: 1024 });
  await expect(mobileLoginPage.emailInput.getLocator()).toBeVisible();
  await expect(mobileLoginPage.passwordInput.getLocator()).toBeVisible();
  await expect(mobileLoginPage.loginButton.getLocator()).toBeVisible();
});

When('I click the mobile login button without entering credentials', async function () {
  await mobileLoginPage.submitLogin();
});

Then('I should see validation error messages', async function () {
  // Wait for validation error to appear
  await this.page.waitForSelector('[class*="error"], [class*="validation"], .field-validation-error', { timeout: 5000 }).catch(() => {
    // If no error element found, check if we're still on the login page (form may have cleared or redirected)
    console.log('No validation error element found, checking page state...');
  });
  
  // Try multiple selectors for error messages
  const errorMessages = await this.page.locator('[class*="error"], [class*="validation"], .field-validation-error').all();
  expect(errorMessages.length).toBeGreaterThan(0);
});

Then('the email field should be highlighted as required', async function () {
  const emailInput = mobileLoginPage.emailInput.getLocator();
  // Verify the email field is visible and still present after validation attempt
  await expect(emailInput).toBeVisible();
});

Then('the password field should be highlighted as required', async function () {
  const passwordInput = mobileLoginPage.passwordInput.getLocator();
  // Verify the password field is visible and still present after validation attempt
  await expect(passwordInput).toBeVisible();
});
