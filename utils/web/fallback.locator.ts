import { Locator, Page } from '@playwright/test';

/**
 * Fallback Locator Utilities - Multiple selector strategies with fallback
 */

export class FallbackLocator {

  // ===================== CORE =====================

  static async findElement(
    page: Page,
    selectors: string[]
  ): Promise<Locator | null> {
    for (const selector of selectors) {
      try {
        const locator = page.locator(selector);
        if (await locator.isVisible().catch(() => false)) {
          return locator;
        }
      } catch {}
    }
    return null;
  }

  static async findElementOrThrow(
    page: Page,
    selectors: string[],
    errorMessage?: string
  ): Promise<Locator> {
    const locator = await this.findElement(page, selectors);
    if (!locator) {
      throw new Error(
        errorMessage || `None of the selectors found: ${selectors.join(', ')}`
      );
    }
    return locator;
  }

  static async findVisibleElement(
    page: Page,
    selectors: string[]
  ): Promise<Locator | null> {
    for (const selector of selectors) {
      try {
        const locator = page.locator(selector);
        await locator.waitFor({ state: 'visible', timeout: 1000 });
        return locator;
      } catch { }
    }
    return null;
  }

  // ===================== ACTIONS =====================

  static async clickWithFallback(
    page: Page,
    selectors: string[],
    options?: { timeout?: number }
  ): Promise<boolean> {
    for (const selector of selectors) {
      try {
        await page.locator(selector).click({ timeout: options?.timeout || 5000 });
        return true;
      } catch {}
    }
    return false;
  }

  static async fillWithFallback(
    page: Page,
    selectors: string[],
    value: string,
    options?: { timeout?: number }
  ): Promise<boolean> {
    for (const selector of selectors) {
      try {
        await page.locator(selector).fill(value, { timeout: options?.timeout || 5000 });
        return true;
      } catch {}
    }
    return false;
  }

  // ===================== GETTERS =====================

  static async getTextWithFallback(
    page: Page,
    selectors: string[]
  ): Promise<string | null> {
    for (const selector of selectors) {
      try {
        const text = await page.locator(selector).textContent();
        if (text) return text;
      } catch {}
    }
    return null;
  }

  static async getAttributeWithFallback(
    page: Page,
    selectors: string[],
    attribute: string
  ): Promise<string | null> {
    for (const selector of selectors) {
      try {
        const value = await page.locator(selector).getAttribute(attribute);
        if (value) return value;
      } catch {}
    }
    return null;
  }

  // ===================== STRATEGIES =====================

  static async findByText(
    page: Page,
    texts: string[],
    exact: boolean = false
  ): Promise<Locator | null> {
    for (const text of texts) {
      const xpath = exact
        ? `//*[text()='${text}']`
        : `//*[contains(text(), '${text}')]`;

      try {
        const locator = page.locator(`xpath=${xpath}`);
        await locator.waitFor({ state: 'visible', timeout: 1000 });
        return locator;
      } catch {}
    }
    return null;
  }

  static async findByRole(
    page: Page,
    role: string,
    names: string[]
  ): Promise<Locator | null> {
    for (const name of names) {
      try {
        const locator = page.getByRole(role as any, { name, exact: true });
        await locator.waitFor({ state: 'visible', timeout: 1000 });
        return locator;
      } catch {
        try {
          const partial = page.getByRole(role as any, { name });
          await partial.waitFor({ state: 'visible', timeout: 1000 });
          return partial;
        } catch {}
      }
    }
    return null;
  }

  static async findByDataAttribute(
    page: Page,
    attributes: { key: string; value: string }[]
  ): Promise<Locator | null> {
    for (const attr of attributes) {
      try {
        const locator = page.locator(`[data-${attr.key}="${attr.value}"]`);
        await locator.waitFor({ state: 'visible', timeout: 1000 });
        return locator;
      } catch {}
    }
    return null;
  }

  // ===================== SMART LOCATOR (FIXED) =====================

  static smartLocator(
    page: Page,
    options: {
      defaultSelector?: string;
      cssSelectors?: string[];
      xpaths?: string[];
      texts?: string[];
      roles?: { role: string; names: string[] }[];
      dataAttrs?: { key: string; value: string }[];
    }
  ): { locator: () => Promise<Locator>; tryAll: () => Promise<Locator | null> } {

    const locatorFn = async (): Promise<Locator> => {

      if (options.defaultSelector) {
        const loc = await this.findElement(page, [options.defaultSelector]);
        if (loc) return loc;
      }

      if (options.cssSelectors) {
        const loc = await this.findElement(page, options.cssSelectors);
        if (loc) return loc;
      }

      if (options.xpaths) {
        const xpathSelectors = options.xpaths.map(x => `xpath=${x}`);
        const loc = await this.findElement(page, xpathSelectors);
        if (loc) return loc;
      }

      if (options.texts) {
        const loc = await this.findByText(page, options.texts);
        if (loc) return loc;
      }

      if (options.roles) {
        for (const roleOption of options.roles) {
          const loc = await this.findByRole(
            page,
            roleOption.role,
            roleOption.names
          );
          if (loc) return loc;
        }
      }

      if (options.dataAttrs) {
        const loc = await this.findByDataAttribute(page, options.dataAttrs);
        if (loc) return loc;
      }

      throw new Error('No locator strategies found any elements');
    };

    return {
      locator: locatorFn,

      tryAll: async () => {
        try {
          return await locatorFn();
        } catch {
          return null;
        }
      }
    };
  }

  // ===================== WAIT UTILITIES =====================

  static async waitForAny(
    page: Page,
    selectors: string[],
    timeout: number = 30000
  ): Promise<Locator> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      for (const selector of selectors) {
        const locator = page.locator(selector);
        if (await locator.isVisible().catch(() => false)) {
          return locator;
        }
      }
      await new Promise(r => setTimeout(r, 100));
    }

    throw new Error(`None visible: ${selectors.join(', ')}`);
  }

  static async waitForAll(
    page: Page,
    selectors: string[],
    timeout: number = 30000
  ): Promise<Locator[]> {
    const results: Locator[] = [];

    for (const selector of selectors) {
      const locator = page.locator(selector);
      await locator.waitFor({ state: 'visible', timeout });
      results.push(locator);
    }

    return results;
  }

  // ===================== HELPERS =====================

  static async findButton(page: Page, texts: string[]) {
    return this.findByRole(page, 'button', texts);
  }

  static async findInput(
    page: Page,
    options: {
      placeholders?: string[];
      labels?: string[];
      names?: string[];
      ids?: string[];
      selectors?: string[];
    }
  ): Promise<Locator | null> {

    if (options.placeholders) {
      for (const p of options.placeholders) {
        const loc = page.locator(`xpath=//input[@placeholder='${p}']`);
        if (await loc.isVisible().catch(() => false)) return loc;
      }
    }

    if (options.labels) {
      for (const l of options.labels) {
        const loc = page.locator(`xpath=//label[contains(text(),'${l}')]/..//input`);
        if (await loc.isVisible().catch(() => false)) return loc;
      }
    }

    if (options.names) {
      for (const n of options.names) {
        const loc = page.locator(`input[name="${n}"]`);
        if (await loc.isVisible().catch(() => false)) return loc;
      }
    }

    if (options.ids) {
      for (const id of options.ids) {
        const loc = page.locator(`#${id}`);
        if (await loc.isVisible().catch(() => false)) return loc;
      }
    }

    if (options.selectors) {
      return this.findElement(page, options.selectors);
    }

    return null;
  }
}
