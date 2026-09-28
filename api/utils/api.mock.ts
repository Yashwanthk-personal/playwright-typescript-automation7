import { Page, Route } from '@playwright/test';

/**
 * API Mocking Utilities - Mock API responses
 */

export interface MockRoute {
  pattern: string | RegExp;
  response: any;
  status?: number;
  headers?: Record<string, string>;
  delay?: number;
}

export interface MockCallLog {
  url: string;
  method: string;
  body?: any;
  timestamp: number;
}

export class ApiMock {
  private mockRoutes: Map<string, any> = new Map();
  private callLogs: MockCallLog[] = [];
  private responseInterceptors: ((response: any) => any)[] = [];

  /**
   * Setup mock for a specific route
   */
  async mockRoute(
    page: Page,
    route: MockRoute
  ): Promise<void> {
    const { pattern, response, status = 200, headers = {}, delay = 0 } = route;

    // Store mock for reference
    const key = pattern instanceof RegExp ? pattern.source : pattern;
    this.mockRoutes.set(key, route);

    await page.route(pattern, async route => {
      // Log the call
      this.callLogs.push({
        url: route.request().url(),
        method: route.request().method(),
        body: await route.request().postDataJSON().catch(() => null),
        timestamp: Date.now(),
      });

      // Apply delay if specified
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Abort the real request and respond with mock
      await route.abort('blockedbyclient');
      
      // Apply response interceptors
      let finalResponse = response;
      for (const interceptor of this.responseInterceptors) {
        finalResponse = interceptor(finalResponse);
      }

      await route.fulfill({
        status,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body:
          typeof finalResponse === 'string'
            ? finalResponse
            : JSON.stringify(finalResponse),
      });
    });
  }

  /**
   * Setup multiple mock routes at once
   */
  async setupMockRoutes(page: Page, routes: MockRoute[]): Promise<void> {
    for (const route of routes) {
      await this.mockRoute(page, route);
    }
  }

  /**
   * Mock API with error response
   */
  async mockError(
    page: Page,
    pattern: string | RegExp,
    errorMessage: string = 'Internal Server Error',
    status: number = 500,
    delay: number = 0
  ): Promise<void> {
    await this.mockRoute(page, {
      pattern,
      response: { error: errorMessage, status },
      status,
      delay,
    });
  }

  /**
   * Mock API with 404 response
   */
  async mockNotFound(
    page: Page,
    pattern: string | RegExp,
    delay: number = 0
  ): Promise<void> {
    await this.mockError(page, pattern, 'Not Found', 404, delay);
  }

  /**
   * Mock API with 401 Unauthorized response
   */
  async mockUnauthorized(
    page: Page,
    pattern: string | RegExp,
    delay: number = 0
  ): Promise<void> {
    await this.mockError(page, pattern, 'Unauthorized', 401, delay);
  }

  /**
   * Mock API with 403 Forbidden response
   */
  async mockForbidden(
    page: Page,
    pattern: string | RegExp,
    delay: number = 0
  ): Promise<void> {
    await this.mockError(page, pattern, 'Forbidden', 403, delay);
  }

  /**
   * Mock API with successful response
   */
  async mockSuccess(
    page: Page,
    pattern: string | RegExp,
    response: any,
    delay: number = 0
  ): Promise<void> {
    await this.mockRoute(page, {
      pattern,
      response,
      status: 200,
      delay,
    });
  }

  /**
   * Mock API with paginated response
   */
  async mockPaginated(
    page: Page,
    pattern: string | RegExp,
    items: any[],
    pageSize: number = 10,
    delay: number = 0
  ): Promise<void> {
    await page.route(pattern, async route => {
      const url = new URL(route.request().url());
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || String(pageSize));

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedItems = items.slice(start, end);

      // Log the call
      this.callLogs.push({
        url: route.request().url(),
        method: route.request().method(),
        body: await route.request().postDataJSON().catch(() => null),
        timestamp: Date.now(),
      });

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: paginatedItems,
          page,
          limit,
          total: items.length,
          pages: Math.ceil(items.length / limit),
        }),
      });
    });
  }

  /**
   * Mock with dynamic response based on request
   */
  async mockDynamic(
    page: Page,
    pattern: string | RegExp,
    responseBuilder: (request: any) => Promise<any>,
    status: number = 200,
    delay: number = 0
  ): Promise<void> {
    await page.route(pattern, async route => {
      const request = route.request();

      // Log the call
      this.callLogs.push({
        url: request.url(),
        method: request.method(),
        body: await request
          .postDataJSON()
          .catch(() => null),
        timestamp: Date.now(),
      });

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await responseBuilder(request);

      await route.fulfill({
        status,
        headers: { 'Content-Type': 'application/json' },
        body:
          typeof response === 'string'
            ? response
            : JSON.stringify(response),
      });
    });
  }

  /**
   * Mock with conditional response
   */
  async mockConditional(
    page: Page,
    pattern: string | RegExp,
    condition: (request: any) => boolean,
    successResponse: any,
    failureResponse: any,
    delay: number = 0
  ): Promise<void> {
    await page.route(pattern, async route => {
      const request = route.request();

      // Log the call
      this.callLogs.push({
        url: request.url(),
        method: request.method(),
        body: await request
          .postDataJSON()
          .catch(() => null),
        timestamp: Date.now(),
      });

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = condition(request)
        ? successResponse
        : failureResponse;

      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(
    interceptor: (response: any) => any
  ): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Get call logs
   */
  getCallLogs(): MockCallLog[] {
    return this.callLogs;
  }

  /**
   * Get specific call logs by URL pattern
   */
  getCallLogsByUrl(pattern: string | RegExp): MockCallLog[] {
    return this.callLogs.filter(log => {
      if (typeof pattern === 'string') {
        return log.url.includes(pattern);
      }
      return pattern.test(log.url);
    });
  }

  /**
   * Get call count
   */
  getCallCount(pattern?: string | RegExp): number {
    if (!pattern) {
      return this.callLogs.length;
    }
    return this.getCallLogsByUrl(pattern).length;
  }

  /**
   * Clear call logs
   */
  clearCallLogs(): void {
    this.callLogs = [];
  }

  /**
   * Verify API was called
   */
  verifyCalled(pattern: string | RegExp): boolean {
    return this.getCallLogsByUrl(pattern).length > 0;
  }

  /**
   * Verify API was called X times
   */
  verifyCalledTimes(pattern: string | RegExp, times: number): boolean {
    return this.getCallLogsByUrl(pattern).length === times;
  }

  /**
   * Verify API was called with specific request body
   */
  verifyCalledWithBody(
    pattern: string | RegExp,
    expectedBody: any
  ): boolean {
    return this.getCallLogsByUrl(pattern).some(log =>
      JSON.stringify(log.body) === JSON.stringify(expectedBody)
    );
  }

  /**
   * Reset all mocks
   */
  reset(): void {
    this.mockRoutes.clear();
    this.callLogs = [];
    this.responseInterceptors = [];
  }
}

/**
 * Factory for creating common mock scenarios
 */
export class ApiMockScenarios {
  /**
   * Mock user login scenarios
   */
  static createLoginMocks(): MockRoute[] {
    return [
      {
        pattern: '**/api/login',
        response: { token: 'mock-jwt-token-123', userId: 1 },
        status: 200,
      },
      {
        pattern: '**/api/logout',
        response: { success: true },
        status: 200,
      },
      {
        pattern: '**/api/me',
        response: {
          id: 1,
          email: 'test@test.com',
          name: 'Test User',
        },
        status: 200,
      },
    ];
  }

  /**
   * Mock product list scenarios
   */
  static createProductMocks(): MockRoute[] {
    return [
      {
        pattern: '**/api/products',
        response: [
          { id: 1, name: 'Product 1', price: 99.99 },
          { id: 2, name: 'Product 2', price: 149.99 },
          { id: 3, name: 'Product 3', price: 199.99 },
        ],
        status: 200,
      },
      {
        pattern: '**/api/products/1',
        response: { id: 1, name: 'Product 1', price: 99.99, stock: 10 },
        status: 200,
      },
    ];
  }

  /**
   * Mock cart scenarios
   */
  static createCartMocks(): MockRoute[] {
    return [
      {
        pattern: '**/api/cart',
        response: {
          items: [],
          total: 0,
          itemCount: 0,
        },
        status: 200,
      },
      {
        pattern: '**/api/cart/add',
        response: { success: true, itemCount: 1 },
        status: 201,
      },
      {
        pattern: '**/api/cart/remove',
        response: { success: true },
        status: 200,
      },
    ];
  }

  /**
   * Mock checkout scenarios
   */
  static createCheckoutMocks(): MockRoute[] {
    return [
      {
        pattern: '**/api/checkout/validate',
        response: { valid: true },
        status: 200,
      },
      {
        pattern: '**/api/checkout/process',
        response: { orderId: '12345', status: 'success' },
        status: 201,
      },
      {
        pattern: '**/api/orders',
        response: [{ orderId: '12345', total: 299.99, status: 'completed' }],
        status: 200,
      },
    ];
  }

  /**
   * Mock error scenarios
   */
  static createErrorMocks(): MockRoute[] {
    return [
      {
        pattern: '**/api/server-error',
        response: { error: 'Internal Server Error' },
        status: 500,
      },
      {
        pattern: '**/api/not-found',
        response: { error: 'Not Found' },
        status: 404,
      },
      {
        pattern: '**/api/unauthorized',
        response: { error: 'Unauthorized' },
        status: 401,
      },
      {
        pattern: '**/api/forbidden',
        response: { error: 'Forbidden' },
        status: 403,
      },
      {
        pattern: '**/api/bad-request',
        response: { error: 'Bad Request' },
        status: 400,
      },
    ];
  }
}
