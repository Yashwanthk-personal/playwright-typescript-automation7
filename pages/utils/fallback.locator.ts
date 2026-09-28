/**
 * Fallback Locator Utility
 * Provides resilient locator selection with fallback support
 * Tries primary locator first, falls back to alternatives if not found
 */

import { Locator, Page } from '@playwright/test';

export interface LocatorConfig {
  primary: string;
  fallbacks?: string[];
  selector?: 'css' | 'xpath' | 'text' | 'role';
}

export interface RoleLocatorConfig {
  role: string;
  name?: string;
  fallbacks?: { role: string; name?: string }[];
}

export class FallbackLocator {
  private page: Page;
  private primaryLocator: Locator;
  private fallbackLocators: Locator[] = [];
  private locatorConfigs: LocatorConfig;

  constructor(page: Page, config: LocatorConfig) {
    this.page = page;
    this.locatorConfigs = config;

    // Create primary locator
    this.primaryLocator = this.createLocator(config.primary, config.selector || 'css');

    // Create fallback locators
    if (config.fallbacks && config.fallbacks.length > 0) {
      this.fallbackLocators = config.fallbacks.map((selector) =>
        this.createLocator(selector, config.selector || 'css')
      );
    }
  }

  /**
   * Create a locator based on selector type
   */
  private createLocator(selector: string, type: string): Locator {
    switch (type.toLowerCase()) {
      case 'xpath':
        return this.page.locator(`xpath=${selector}`);
      case 'text':
        return this.page.getByText(selector);
      case 'role':
        return this.page.getByRole(selector as any);
      case 'css':
      default:
        return this.page.locator(selector);
    }
  }

  /**
   * Get the first available locator (primary or fallback)
   */
  async getAvailableLocator(timeout: number = 5000): Promise<Locator | null> {
    // Try primary locator first
    try {
      await this.primaryLocator.first().waitFor({ state: 'attached', timeout });
      return this.primaryLocator;
    } catch (error) {
      // Try fallback locators
      for (const fallback of this.fallbackLocators) {
        try {
          await fallback.first().waitFor({ state: 'attached', timeout: 2000 });
          return fallback;
        } catch (fallbackError) {
          // Continue to next fallback
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Get locator with auto-fallback support
   */
  getLocator(): Locator {
    return this.primaryLocator;
  }

  /**
   * Click with fallback support
   */
  async clickWithFallback(timeout?: number): Promise<void> {
    const locator = await this.getAvailableLocator(timeout);
    if (locator) {
      await locator.click();
    } else {
      throw new Error(
        `No locator found. Primary: "${this.locatorConfigs.primary}", ` +
          `Fallbacks: [${(this.locatorConfigs.fallbacks || []).join(', ')}]`
      );
    }
  }

  /**
   * Fill input with fallback support
   */
  async fillWithFallback(text: string, timeout?: number): Promise<void> {
    const locator = await this.getAvailableLocator(timeout);
    if (locator) {
      await locator.fill(text);
    } else {
      throw new Error(
        `No input locator found. Primary: "${this.locatorConfigs.primary}", ` +
          `Fallbacks: [${(this.locatorConfigs.fallbacks || []).join(', ')}]`
      );
    }
  }

  /**
   * Type with fallback support
   */
  async typeWithFallback(text: string, timeout?: number): Promise<void> {
    const locator = await this.getAvailableLocator(timeout);
    if (locator) {
      await locator.type(text);
    } else {
      throw new Error(
        `No input locator found. Primary: "${this.locatorConfigs.primary}", ` +
          `Fallbacks: [${(this.locatorConfigs.fallbacks || []).join(', ')}]`
      );
    }
  }

  /**
   * Get text with fallback support
   */
  async getTextWithFallback(timeout?: number): Promise<string> {
    const locator = await this.getAvailableLocator(timeout);
    if (locator) {
      return await locator.first().textContent() || '';
    } else {
      throw new Error(
        `No locator found. Primary: "${this.locatorConfigs.primary}", ` +
          `Fallbacks: [${(this.locatorConfigs.fallbacks || []).join(', ')}]`
      );
    }
  }

  /**
   * Wait for element with fallback support
   */
  async waitForWithFallback(options: any = {}): Promise<void> {
    const locator = await this.getAvailableLocator(options.timeout);
    if (locator) {
      await locator.first().waitFor(options);
    } else {
      throw new Error(
        `No locator found. Primary: "${this.locatorConfigs.primary}", ` +
          `Fallbacks: [${(this.locatorConfigs.fallbacks || []).join(', ')}]`
      );
    }
  }

  /**
   * Check if element is visible with fallback support
   */
  async isVisibleWithFallback(timeout?: number): Promise<boolean> {
    const locator = await this.getAvailableLocator(timeout || 2000);
    if (locator) {
      try {
        await locator.first().waitFor({ state: 'visible', timeout: 2000 });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Get all matching locators from primary and fallbacks
   */
  getAllLocators(): Locator[] {
    return [this.primaryLocator, ...this.fallbackLocators];
  }

  /**
   * Get locator count trying primary and fallbacks
   */
  async getCountWithFallback(): Promise<number> {
    try {
      const count = await this.primaryLocator.count();
      if (count > 0) return count;
    } catch {
      //Fall through
    }

    for (const fallback of this.fallbackLocators) {
      try {
        const count = await fallback.count();
        if (count > 0) return count;
      } catch {
        // Try next
      }
    }

    return 0;
  }

  /**
   * Highlight locator for debugging
   */
  async highlight(timeout: number = 3000): Promise<void> {
    const locator = await this.getAvailableLocator(timeout);
    if (locator) {
      await locator.first().highlight();
    }
  }
}

/**
 * Helper factory for creating fallback locators
 */
export class FallbackLocatorFactory {
  /**
   * Create a fallback locator for a button with multiple selector options
   */
  static createButtonLocator(page: Page, buttonText: string, selectors?: string[]): FallbackLocator {
    const defaults = [
      `button:has-text("${buttonText}")`,
      `input[type='submit'][value*='${buttonText}']`,
      `a:has-text("${buttonText}")`,
    ];

    return new FallbackLocator(page, {
      primary: defaults[0],
      fallbacks: [...defaults.slice(1), ...(selectors || [])],
    });
  }

  /**
   * Create a fallback locator for an input field
   */
  static createInputLocator(page: Page, placeholder?: string, selectors?: string[]): FallbackLocator {
    const defaults = placeholder
      ? [
          `input[placeholder='${placeholder}']`,
          `input[placeholder*='${placeholder}']`,
          `input[aria-label='${placeholder}']`,
        ]
      : ['input', 'textarea'];

    return new FallbackLocator(page, {
      primary: defaults[0],
      fallbacks: [...defaults.slice(1), ...(selectors || [])],
    });
  }

  /**
   * Create a fallback locator for a link
   */
  static createLinkLocator(page: Page, linkText: string, selectors?: string[]): FallbackLocator {
    const defaults = [
      `a:has-text("${linkText}")`,
      `//a[contains(text(), "${linkText}")]`,
      `a[href*="${linkText.toLowerCase()}"]`,
    ];

    return new FallbackLocator(page, {
      primary: defaults[0],
      fallbacks: [...defaults.slice(1), ...(selectors || [])],
    });
  }
}
