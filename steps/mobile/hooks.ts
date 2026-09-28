import { Before, After } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, BrowserContext, Page, BrowserType } from '@playwright/test';
import { devices } from '@playwright/test';

declare global {
  namespace NodeJS {
    interface Global {
      browser: Browser;
      context: BrowserContext;
      page: Page;
    }
  }
}

// Get browser type from environment variable (default: chromium)
function getBrowserType(): BrowserType {
  const browserType = (process.env.BROWSER || 'chromium').toLowerCase();
  switch (browserType) {
    case 'firefox':
      return firefox;
    case 'webkit':
      return webkit;
    case 'chromium':
    default:
      return chromium;
  }
}

Before({ tags: '@mobile' }, async function () {
  // Launch browser only for mobile tests
  const browserType = getBrowserType();
  const browser = await browserType.launch({
    headless: process.env.HEADLESS !== 'false',
  });

  // Create context with iPhone 12 profile for mobile testing
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });

  // Create page
  const page = await context.newPage();

  // Attach to test context
  this.browser = browser;
  this.context = context;
  this.page = page;
});

After({ tags: '@mobile' }, async function () {
  // Close page and context (only for mobile tests)
  if (this.page) {
    await this.page.close();
  }

  if (this.context) {
    await this.context.close();
  }

  if (this.browser) {
    await this.browser.close();
  }
});
