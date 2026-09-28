import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Visual Testing Utilities - Screenshots and visual regression testing
 */

export interface ScreenshotOptions {
  fullPage?: boolean;
  mask?: string[];
  maskColor?: string;
  timeout?: number;
  waitForSelector?: string;
}

export interface VisualComparisonOptions {
  threshold?: number;
  updateBaseline?: boolean;
  mask?: string[];
}

export class VisualTesting {
  private static readonly SCREENSHOTS_DIR = path.join(
    __dirname,
    '..',
    'test-results',
    'screenshots'
  );

  private static readonly BASELINE_DIR = path.join(
    __dirname,
    '..',
    'test-results',
    'baseline'
  );

  /**
   * Initialize screenshot directories
   */
  static initialize(): void {
    if (!fs.existsSync(this.SCREENSHOTS_DIR)) {
      fs.mkdirSync(this.SCREENSHOTS_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.BASELINE_DIR)) {
      fs.mkdirSync(this.BASELINE_DIR, { recursive: true });
    }
  }

  /**
   * Take a screenshot of the page
   */
  static async takeScreenshot(
    page: Page,
    name: string,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    this.initialize();

    const {
      fullPage = false,
      mask = [],
      maskColor = '#CCCCCC',
      timeout = 5000,
      waitForSelector,
    } = options;

    // Wait for specific element if specified
    if (waitForSelector) {
      await page.locator(waitForSelector).waitFor({ timeout });
    }

    const filename = `${name}.png`;
    const filepath = path.join(this.SCREENSHOTS_DIR, filename);

    await page.screenshot({
      path: filepath,
      fullPage,
      mask: mask.length > 0 ? mask.map(selector => page.locator(selector)) : undefined,
      maskColor,
    });

    return filepath;
  }

  /**
   * Take screenshot of specific element
   */
  static async takeElementScreenshot(
    page: Page,
    selector: string,
    name: string
  ): Promise<string> {
    this.initialize();

    const locator = page.locator(selector);
    await locator.waitFor({ state: 'visible' });

    const filename = `${name}.png`;
    const filepath = path.join(this.SCREENSHOTS_DIR, filename);

    await locator.screenshot({ path: filepath });

    return filepath;
  }

  /**
   * Compare screenshot with baseline
   */
  static async compareWithBaseline(
    page: Page,
    name: string,
    options: VisualComparisonOptions = {}
  ): Promise<boolean> {
    this.initialize();

    const { threshold = 0.2, updateBaseline = false } = options;

    const screenshotPath = await this.takeScreenshot(page, name);
    const baselinePath = path.join(this.BASELINE_DIR, `${name}.png`);

    // Create baseline if it doesn't exist
    if (!fs.existsSync(baselinePath) || updateBaseline) {
      fs.copyFileSync(screenshotPath, baselinePath);
      return true;
    }

    // Compare using Playwright's built-in comparison
    try {
      await expect(page).toHaveScreenshot(`${name}.png`, {
        maxDiffPixels: Math.floor(threshold * 1000), // Approximate threshold
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Take screenshots of multiple elements
   */
  static async takeMultipleScreenshots(
    page: Page,
    selectors: { [name: string]: string }
  ): Promise<{ [name: string]: string }> {
    this.initialize();

    const screenshots: { [name: string]: string } = {};

    for (const [name, selector] of Object.entries(selectors)) {
      try {
        screenshots[name] = await this.takeElementScreenshot(
          page,
          selector,
          name
        );
      } catch (error) {
        console.error(`Failed to capture screenshot for ${name}:`, error);
      }
    }

    return screenshots;
  }

  /**
   * Take screenshots during page interaction
   */
  static async takeInteractionScreenshots(
    page: Page,
    testName: string,
    steps: {
      name: string;
      action: () => Promise<void>;
      shouldWait?: string;
      waitMs?: number;
    }[]
  ): Promise<{ [name: string]: string }> {
    this.initialize();

    const screenshots: { [name: string]: string } = {};
    let stepCount = 0;

    for (const step of steps) {
      // Execute action
      await step.action();

      // Wait if specified
      if (step.shouldWait) {
        await page.locator(step.shouldWait).waitFor();
      }
      if (step.waitMs) {
        await page.waitForTimeout(step.waitMs);
      }

      // Take screenshot
      const filename = `${testName}-${stepCount++}-${step.name}`;
      const path_ = await this.takeScreenshot(page, filename);
      screenshots[step.name] = path_;
    }

    return screenshots;
  }

  /**
   * Compare full page visual regression
   */
  static async verifyPageVisuals(
    page: Page,
    pageName: string,
    options: VisualComparisonOptions = {}
  ): Promise<void> {
    const { updateBaseline = false } = options;

    const result = await this.compareWithBaseline(
      page,
      pageName,
      options
    );

    if (!result) {
      const screenshotPath = path.join(
        this.SCREENSHOTS_DIR,
        `${pageName}.png`
      );
      const baselinePath = path.join(this.BASELINE_DIR, `${pageName}.png`);

      throw new Error(
        `Visual regression detected for ${pageName}. ` +
        `Screenshot: ${screenshotPath}, Baseline: ${baselinePath}`
      );
    }
  }

  /**
   * Mask sensitive elements before comparison
   */
  static getMaskSelectors(type: string): string[] {
    const masks: { [key: string]: string[] } = {
      auth: ['input[type="password"]', '[data-sensitive]'],
      personal: ['[data-email]', '[data-phone]', '[data-ssn]'],
      financial: ['[data-card]', '[data-account]', '[data-balance]'],
      timestamps: ['[data-timestamp]', '.timestamp', '.time'],
      dynamic: ['[data-dynamic]', '.dynamic-content'],
    };

    return masks[type] || [];
  }

  /**
   * Take before/after screenshots
   */
  static async takeBeforeAfterScreenshots(
    page: Page,
    testName: string,
    before: () => Promise<void>,
    after: () => Promise<void>
  ): Promise<{ before: string; after: string }> {
    this.initialize();

    // Capture before state
    await before();
    const beforePath = await this.takeScreenshot(page, `${testName}-before`);

    // Capture after state
    await after();
    const afterPath = await this.takeScreenshot(page, `${testName}-after`);

    return { before: beforePath, after: afterPath };
  }

  /**
   * Generate visual report
   */
  static generateVisualReport(reportName: string): string {
    this.initialize();

    const screenshotFiles = fs.readdirSync(this.SCREENSHOTS_DIR);
    const baselineFiles = fs.readdirSync(this.BASELINE_DIR);

    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Visual Testing Report - ${reportName}</title>
  <style>
    body { font-family: Arial; margin: 20px; }
    h1 { color: #333; }
    .comparison { 
      display: inline-block; 
      margin: 20px; 
      border: 1px solid #ccc; 
      padding: 10px;
      border-radius: 4px;
    }
    .comparison img {
      max-width: 400px;
      margin: 5px;
    }
    .images {
      display: flex;
      gap: 20px;
    }
    .label { font-weight: bold; color: #666; }
  </style>
</head>
<body>
  <h1>Visual Testing Report - ${reportName}</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
`;

    // Add baseline screenshots
    if (baselineFiles.length > 0) {
      html += '<h2>Baseline Screenshots</h2>';
      for (const file of baselineFiles) {
        const imagePath = path.join(this.BASELINE_DIR, file);
        html += `
  <div class="comparison">
    <div class="label">Baseline: ${file}</div>
    <img src="${imagePath}" alt="${file}" />
  </div>
`;
      }
    }

    // Add current screenshots with comparisons
    if (screenshotFiles.length > 0) {
      html += '<h2>Current Screenshots</h2>';
      for (const file of screenshotFiles) {
        const screenshotPath = path.join(this.SCREENSHOTS_DIR, file);
        const baselinePath = path.join(this.BASELINE_DIR, file);
        const hasBaseline = baselineFiles.includes(file);

        html += '<div class="comparison">';
        html += `<div class="label">${file}</div>`;

        if (hasBaseline) {
          html += '<div class="images">';
          html += `<div><span class="label">Baseline:</span><br><img src="${baselinePath}" alt="baseline" /></div>`;
          html += `<div><span class="label">Current:</span><br><img src="${screenshotPath}" alt="current" /></div>`;
          html += '</div>';
        } else {
          html += `<img src="${screenshotPath}" alt="${file}" />`;
        }

        html += '</div>';
      }
    }

    html += `
</body>
</html>
`;

    const reportPath = path.join(
      this.SCREENSHOTS_DIR,
      `${reportName}-report.html`
    );
    fs.writeFileSync(reportPath, html);

    return reportPath;
  }

  /**
   * Verify element is visually present
   */
  static async verifyElementVisible(
    page: Page,
    selector: string,
    name?: string
  ): Promise<void> {
    const locator = page.locator(selector);
    await expect(locator).toBeVisible();

    if (name) {
      await this.takeElementScreenshot(page, selector, name);
    }
  }

  /**
   * Verify element state visually
   */
  static async verifyElementState(
    page: Page,
    selector: string,
    state: 'visible' | 'hidden' | 'enabled' | 'disabled',
    name?: string
  ): Promise<void> {
    const locator = page.locator(selector);

    switch (state) {
      case 'visible':
        await expect(locator).toBeVisible();
        break;
      case 'hidden':
        await expect(locator).toBeHidden();
        break;
      case 'enabled':
        await expect(locator).toBeEnabled();
        break;
      case 'disabled':
        await expect(locator).toBeDisabled();
        break;
    }

    if (name) {
      await this.takeElementScreenshot(page, selector, name);
    }
  }

  /**
   * Get screenshot directory path
   */
  static getScreenshotDir(): string {
    return this.SCREENSHOTS_DIR;
  }

  /**
   * Get baseline directory path
   */
  static getBaselineDir(): string {
    return this.BASELINE_DIR;
  }

  /**
   * Clear old screenshots
   */
  static clearOldScreenshots(daysOld: number = 7): void {
    const clearDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);
      const now = Date.now();
      const cutoffTime = now - daysOld * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);

        if (stats.mtimeMs < cutoffTime) {
          fs.unlinkSync(filepath);
        }
      }
    };

    clearDir(this.SCREENSHOTS_DIR);
  }
}
