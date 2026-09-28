import { Locator, Page } from "@playwright/test";
import { FallbackLocator, FallbackLocatorFactory } from "./utils/fallback.locator";

export class LoginPage {
  readonly page: Page;
  readonly loginLink: Locator;
  readonly emailInput: FallbackLocator;
  readonly passwordInput: FallbackLocator;
  readonly loginButton: FallbackLocator;
  readonly demoWebShopText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginLink = page.getByRole("link", { name: "Log in" });
    
    // Use fallback locators for robust element selection
    this.emailInput = new FallbackLocator(page, {
      primary: "#Email",
      fallbacks: [
        "input[name='Email']",
        "input[id*='email' i]",
        "input[placeholder*='email' i]",
        "input[aria-label*='email' i]"
      ]
    });

    this.passwordInput = new FallbackLocator(page, {
      primary: "#Password",
      fallbacks: [
        "input[name='Password']",
        "input[id*='password' i]",
        "input[type='password']",
        "input[placeholder*='password' i]"
      ]
    });

    this.loginButton = new FallbackLocator(page, {
      primary: "input[type='submit'].login-button",
      fallbacks: [
        "input[type='submit'][value*='Log in']",
        "button.login-button",
        "button:has-text('Log in')",
        "input[value='Log in']",
        "button[type='submit']"
      ]
    });

    this.demoWebShopText = page.getByRole('link', { name: 'Tricentis Demo Web Shop' });
  }

  async navigateToLogin() {
    await this.loginLink.click();
  }

  async fillEmail(email: string) {
    await this.emailInput.fillWithFallback(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fillWithFallback(password);
  }

  async submitLogin() {
    await this.loginButton.clickWithFallback();
  }

  async verifyUserIsLoggedIn() {
    await this.demoWebShopText.waitFor({ state: "visible" });
  }

  /**
   * Get info about which locator was used
   */
  async getActiveLocators() {
    return {
      email: await this.emailInput.getCountWithFallback() > 0,
      password: await this.passwordInput.getCountWithFallback() > 0,
      loginButton: await this.loginButton.getCountWithFallback() > 0,
    };
  }

  /**
   * Debug: Highlight elements on page
   */
  async highlightElements() {
    try {
      await this.emailInput.highlight();
      await this.passwordInput.highlight();
      await this.loginButton.highlight();
    } catch (error) {
      console.warn("Could not highlight all elements:", error);
    }
  }
}