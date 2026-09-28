import { test as base, APIRequestContext } from '@playwright/test';
import { ApiExecutor, ExecutionConfig } from '../api/core/executor';
import { LoginService, LoginResponse } from '../api/services/login.service';
import { UserConfig } from '../config/user';

const baseUrl = process.env.DEMOWEBSHOP_BASE_URL || 'http://localhost:80';

/**
 * API-Specific Fixtures Interface
 * Extends Playwright fixtures with API login and authentication utilities
 */
interface ApiFixtures {
  // API clients
  apiClient: ApiExecutor;
  apiLoginService: LoginService;

  // Pre-authenticated contexts
  authenticatedApiClient: {
    client: ApiExecutor;
    token: string;
    response: any;
  };

  // Helper functions for API testing
  loginAsValidUser: {
    token: string;
    response: any;
    client: ApiExecutor;
  };

  loginAsInvalidUser: {
    response: any;
    client: ApiExecutor;
  };

  // API request helpers
  apiRequestWithAuth: (endpoint: string, method: string, token: string, data?: any) => Promise<any>;
  apiRequestWithoutAuth: (endpoint: string, method: string, data?: any) => Promise<any>;

  // Token management
  createValidAuthToken: string;
  createInvalidAuthToken: string;
}

const baseUrl_var = baseUrl;

/**
 * Extended test with API fixtures
 * Provides API clients, services, and authentication helpers
 */
export const test = base.extend<ApiFixtures>({
  /**
   * API Client fixture
   * Initialize and provide API executor for HTTP requests
   */
  apiClient: async ({}, use) => {
    const config: ExecutionConfig = {
      baseUrl: baseUrl_var,
      timeout: 30000,
      retryAttempts: 1,
    };
    const apiClient = new ApiExecutor(config);
    await apiClient.init();

    await use(apiClient);

    // Cleanup
    await apiClient.close();
  },

  /**
   * API Login Service fixture
   * Provides login-specific API operations
   */
  apiLoginService: async ({ apiClient }, use) => {
    const loginService = new LoginService(apiClient);
    await use(loginService);
  },

  /**
   * Pre-authenticated API Client
   * Logs in and provides authenticated client with token
   */
  authenticatedApiClient: async ({ apiClient }, use) => {
    const loginService = new LoginService(apiClient);
    const response = await loginService.login(
      UserConfig.validUser.email,
      UserConfig.validUser.password
    );

    const token = response.body.token || response.body.accessToken || '';

    await use({
      client: apiClient,
      token,
      response: response.body,
    });

    // Cleanup
    await apiClient.close();
  },

  /**
   * Login as Valid User
   * Provides authenticated context with valid user credentials
   */
  loginAsValidUser: async ({ apiClient }, use) => {
    const loginService = new LoginService(apiClient);
    const response = await loginService.login(
      UserConfig.validUser.email,
      UserConfig.validUser.password
    );

    const token = response.body.token || response.body.accessToken || '';

    await use({
      token,
      response: response.body,
      client: apiClient,
    });

    // Cleanup
    await apiClient.close();
  },

  /**
   * Login as Invalid User
   * Attempt login with invalid credentials for negative testing
   */
  loginAsInvalidUser: async ({ apiClient }, use) => {
    const loginService = new LoginService(apiClient);
    const response = await loginService.login(
      'invalid@example.com',
      'wrongpassword123'
    );

    await use({
      response: response.body,
      client: apiClient,
    });

    // Cleanup
    await apiClient.close();
  },

  /**
   * API Request with Authentication
   * Helper to make authenticated API requests
   */
  apiRequestWithAuth: async ({ apiClient }, use) => {
    const makeRequest = async (
      endpoint: string,
      method: string,
      token: string,
      data?: any
    ) => {
      const options: any = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        options.data = data;
      }

      return apiClient.execute({
        endpoint,
        method: method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD',
        headers: options.headers,
        data: options.data,
      });
    };

    await use(makeRequest);

    // Cleanup
    await apiClient.close();
  },

  /**
   * API Request without Authentication
   * Helper to make unauthenticated API requests
   */
  apiRequestWithoutAuth: async ({ apiClient }, use) => {
    const makeRequest = async (endpoint: string, method: string, data?: any) => {
      const options: any = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        options.data = data;
      }

      return apiClient.execute({
        endpoint,
        method: method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD',
        headers: options.headers,
        data: options.data,
      });
    };

    await use(makeRequest);

    // Cleanup
    await apiClient.close();
  },

  /**
   * Create Valid Auth Token
   * Generates a valid authentication token
   */
  createValidAuthToken: async ({ apiClient }, use) => {
    const loginService = new LoginService(apiClient);
    const response = await loginService.login(
      UserConfig.validUser.email,
      UserConfig.validUser.password
    );

    const token =
      response.body.token ||
      response.body.accessToken ||
      '';

    await use(token || '');

    // Cleanup
    await apiClient.close();
  },

  /**
   * Create Invalid Auth Token
   * Provides an intentionally invalid token for testing
   */
  createInvalidAuthToken: async ({}, use) => {
    const invalidToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload';
    await use(invalidToken);
  },
});

// Export expect from Playwright test
export { expect } from '@playwright/test';
