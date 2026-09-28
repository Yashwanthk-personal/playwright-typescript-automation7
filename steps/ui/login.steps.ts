import { Given, When, Then } from '@cucumber/cucumber';
import { LoginPage } from '../../pages/login.page';
import { expect } from '@playwright/test';
import { APP_BASE_URL } from '../../config/config';
import { UserConfig } from '../../config/user';

let loginPage: LoginPage;

Given('I am on the login page', async function () {
  await this.page.goto(APP_BASE_URL + '/login', { waitUntil: 'domcontentloaded' });
  loginPage = new LoginPage(this.page);
});

When('I click on the login link', async function () {
  await loginPage.navigateToLogin();
});

When('I enter valid credentials', async function () {
  await loginPage.fillEmail(UserConfig.validUser.email);
  await loginPage.fillPassword(UserConfig.validUser.password);
});

When('I enter a valid email {string}', async function (email: string) {
  await loginPage.fillEmail(email);
});

When('I enter a valid password {string}', async function (password: string) {
  await loginPage.fillPassword(password);
});

When('I enter an invalid email {string}', async function (email: string) {
  await loginPage.fillEmail(email);
});

When('I enter an invalid password {string}', async function (password: string) {
  await loginPage.fillPassword(password);
});

When('I click the login button', async function () {
  await loginPage.submitLogin();
  // Wait for page navigation to complete after login
  await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
    // If networkidle times out, try domcontentloaded
    return this.page.waitForLoadState('domcontentloaded');
  });
});

Then('I should be redirected to the homepage', async function () {
  // Verify we're not on the login page anymore
  const currentUrl = this.page.url();
  expect(currentUrl).not.toContain('/login');
  expect(currentUrl).toContain(APP_BASE_URL);
});

Then('I should see my account link', async function () {
  await loginPage.verifyUserIsLoggedIn();
});

Then('I should see an error message {string}', async function (message: string) {
  const errorMessage = await this.page.locator('.validation-summary-errors').innerText();
  expect(errorMessage).toContain(message);
});