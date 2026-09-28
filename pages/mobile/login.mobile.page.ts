import { Locator, Page } from "@playwright/test";
import { BaseMobilePage } from "./base.mobile.page";
import { FallbackLocator, FallbackLocatorFactory } from "../utils/fallback.locator";

/**
 * Mobile Login Page
 * Handles login functionality for mobile devices
 */
export class MobileLoginPage extends BaseMobilePage {
  readonly loginLink: Locator;
  readonly emailInput: FallbackLocator;
  readonly passwordInput: FallbackLocator;
  readonly loginButton: FallbackLocator;
  readonly demoWebShopText: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.loginLink = page.getByRole("link", { name: "Log in" });

    // Use fallback locators for robust element selection
    this.emailInput = new FallbackLocator(page, {
      primary: "#Email",
      fallbacks: [
        "input[name='Email']",
        "input[id*='email' i]",
        "input[placeholder*='email' i]",
        "input[aria-label*='email' i]",
      ],
    });

    this.passwordInput = new FallbackLocator(page, {
      primary: "#Password",
      fallbacks: [
        "input[name='Password']",
        "input[id*='password' i]",
        "input[type='password']",
        "input[placeholder*='password' i]",
      ],
    });

    this.loginButton = new FallbackLocator(page, {
      primary: "input[type='submit'].login-button",
      fallbacks: [
        "input[type='submit'][value*='Log in']",
        "button.login-button",
        "button:has-text('Log in')",
        "input[value='Log in']",
        "button[type='submit']",
      ],
    });

    this.demoWebShopText = page.getByRole("link", {
      name: "Tricentis Demo Web Shop",
    });

    this.errorMessage = page.locator('[id*="error" i], [class*="error" i]');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.tap(this.loginLink);
    await this.waitForVisible(this.emailInput.getLocator());
  }

  /**
   * Fill email on mobile
   */
  async fillEmail(email: string) {
    await this.scrollIntoView(this.emailInput.getLocator());
    await this.fillInput(this.emailInput.getLocator(), email);
  }

  /**
   * Fill password on mobile
   */
  async fillPassword(password: string) {
    await this.scrollIntoView(this.passwordInput.getLocator());
    await this.fillInput(this.passwordInput.getLocator(), password);
  }

  /**
   * Submit login form on mobile
   */
  async submitLogin() {
    await this.scrollIntoView(this.loginButton.getLocator());
    await this.tap(this.loginButton.getLocator());
  }

  /**
   * Perform complete login flow
   */
  async login(email: string, password: string) {
    await this.navigateToLogin();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submitLogin();
  }

  /**
   * Verify user is logged in (mobile variant)
   */
  async verifyUserIsLoggedIn(timeout: number = 10000) {
    await this.waitForVisible(this.demoWebShopText, timeout);
  }

  /**
   * Check if error message is displayed
   */
  async getErrorMessage(): Promise<string> {
    const visible = await this.isVisible(this.errorMessage);
    if (visible) {
      return await this.getText(this.errorMessage);
    }
    return "";
  }

  /**
   * Check if login was unsuccessful
   */
  async isLoginUnsuccessful(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }
}
