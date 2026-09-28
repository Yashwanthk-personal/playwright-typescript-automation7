/**
 * Environment Variable Type Declarations
 * Defines TypeScript types for all process.env variables used in the project
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Base URL for the DemoWebShop application
      DEMOWEBSHOP_BASE_URL?: string;

      // Environment/mode configuration
      NODE_ENV?: 'development' | 'production' | 'test';

      // API configuration
      API_BASE_URL?: string;
      API_TIMEOUT?: string;
      API_RETRY_ATTEMPTS?: string;

      // Browser/Playwright configuration
      HEADLESS?: string;
      BROWSER?: string;
      SLOW_MO?: string;

      // Test configuration
      PARALLEL_WORKERS?: string;
      PARALLEL_USERS?: string;
      TEST_TIMEOUT?: string;

      // Logging and reporting
      DEBUG?: string;
      LOG_LEVEL?: string;
      SCREENSHOT_ON_FAILURE?: string;
      VIDEO_RECORDING?: string;

      // Authentication/Credentials (use with caution)
      TEST_USER_EMAIL?: string;
      TEST_USER_PASSWORD?: string;

      // Report configuration
      REPORT_OUTPUT_DIR?: string;
      ALLURE_RESULTS_DIR?: string;
    }
  }
}

export {};
