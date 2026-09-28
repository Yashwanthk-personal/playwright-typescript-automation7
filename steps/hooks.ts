import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, BrowserContext, Page, BrowserType } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { apiMockManager } from '../api/utils/api-mock';
import { apiSnapshotManager } from '../api/utils/api-snapshot';

setDefaultTimeout(30000);

let browser: Browser;
let context: BrowserContext;
let page: Page;
let isTracingStarted = false;
const tracesDir = path.join(__dirname, '..', '..', 'allure-results', 'traces');

// Ensure traces directory exists
if (!fs.existsSync(tracesDir)) {
  fs.mkdirSync(tracesDir, { recursive: true });
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

Before({ tags: 'not @mobile and not @api' }, async function () {
  const headless = process.env.HEADLESS !== 'false';
  const browserType = getBrowserType();
  browser = await browserType.launch({ headless });
  
  // Create context with tracing enabled
  context = await browser.newContext();
  
  // Generate unique trace filename
  const traceFile = path.join(tracesDir, `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.zip`);
  
  // Start tracing
  await context.tracing.start({
    screenshots: true,
    snapshots: true
  });
  isTracingStarted = true;
  
  page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);
  
  // Store trace file path and context for use in steps/after hook
  this.page = page;
  this.context = context;
  this.traceFile = traceFile;
});

After({ tags: 'not @mobile and not @api' }, async function () {
  try {
    // Stop tracing and save to file (only if tracing was started and context still valid)
    if (this.context && isTracingStarted) {
      try {
        await this.context.tracing.stop({ path: this.traceFile });
        
        // Store trace file path for report
        if (!this.attachments) {
          this.attachments = [];
        }
        this.attachments.push({
          name: 'playwright-trace',
          file: this.traceFile
        });
      } catch (traceError) {
        // Silently skip trace save if context/browser is closed
        const errorMsg = traceError instanceof Error ? traceError.message : String(traceError);
        if (!errorMsg.includes('closed')) {
          throw traceError;
        }
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (!errorMsg.includes('closed')) {
      console.error('Error in afterHook:', error);
    }
  } finally {
    // Cleanup mocks and snapshots
    apiMockManager.clear();
    apiSnapshotManager.clear();
    
    isTracingStarted = false;
    
    try {
      await page?.close().catch(() => {});
      await context?.close().catch(() => {});
      await browser?.close().catch(() => {});
    } catch (cleanupError) {
      // Silently ignore cleanup errors
    }
  }
});
