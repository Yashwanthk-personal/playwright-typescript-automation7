import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Decide which environment file to load
const env = process.env.TEST_ENV || 'dev';

// Load .env.dev, .env.qa, etc.
dotenv.config({
  path: `.env.${env}`,
});

/**
 * Playwright Configuration
 */
export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,

  /* Reporter Configuration */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright']
  ],

  timeout: 60000,

  use: {
    baseURL: process.env.DEMOWEBSHOP_BASE_URL,
    viewport: null,
    ignoreHTTPSErrors: true,

    trace: 'on',
    video: 'on',
    screenshot: 'on',

    actionTimeout: 60000,

    storageState: 'tests/auth/auth.json',
  },

  projects: [
    /* Chromium (Chrome) */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,

        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',

        locale: 'en-AU',

        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--start-maximized'
          ]
        }
      }
    },

    /* Microsoft Edge */
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        headless: false,

        locale: 'en-AU',

        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--start-maximized'
          ]
        }
      }
    },

    /* Mozilla Firefox */
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: false,

        locale: 'en-AU',

        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',

        launchOptions: {
          args: ['--start-maximized'] // may not always work fully in Firefox
        }
      }
    },

    /* WebKit (Safari) */
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        headless: false,

        locale: 'en-AU',

        launchOptions: {
          args: []
        }
      }
    },

    /* Mobile View - iPhone 12 */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        headless: false,

        locale: 'en-AU',
      }
    }
  ]
});