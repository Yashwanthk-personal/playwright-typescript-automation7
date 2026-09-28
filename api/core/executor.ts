/**
 * API Execution Engine
 * Generic method to execute API calls with proper configuration and error handling
 */
import { APIRequestContext, request } from '@playwright/test';
import { RetryUtils, RetryOptions } from '../../utils/common';

export interface ExecutionConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RequestConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export interface ExecutionResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: T;
  ok: boolean;
  duration: number;
}

/**
 * API Executor - Handles all API execution with retry logic and error handling
 */
export class ApiExecutor {
  private context: APIRequestContext | null = null;
  private config: ExecutionConfig;
  private requestStartTime: number = 0;

  constructor(config: ExecutionConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 1,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Initialize the execution context
   */
  async init(): Promise<void> {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: this.config.baseUrl,
        extraHTTPHeaders: this.config.headers,
      });
    }
  }

  /**
   * Close the execution context
   */
  async close(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }

  /**
   * Execute an API request with retry logic using RetryUtils
   */
  async execute<T = unknown>(
    config: RequestConfig
  ): Promise<ExecutionResponse<T>> {
    const retryOptions: RetryOptions = {
      maxAttempts: this.config.retryAttempts || 1,
      delayMs: this.config.retryDelay || 1000,
      backoffMultiplier: 1.5,
      timeout: this.config.timeout || 30000,
      onRetry: (attempt, error) => {
        console.log(
          `[API Retry] Attempt ${attempt} failed: ${error.message}. Retrying...`
        );
      },
    };

    return RetryUtils.executeWithRetry(async () => {
      if (!this.context) {
        await this.init();
      }

      this.requestStartTime = Date.now();
      const response = await this.executeRequest<T>(config);
      const duration = Date.now() - this.requestStartTime;

      // Throw error if response is not ok (for retry logic to catch)
      if (!response.ok && !this.isExpectedErrorStatus(response.status)) {
        const error = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
        (error as any).status = response.status;
        throw error;
      }

      return {
        ...response,
        duration,
      };
    }, retryOptions);
  }

  /**
   * Check if status is an expected error (don't retry)
   */
  private isExpectedErrorStatus(status: number): boolean {
    // Don't retry on client errors (4xx) - retry only on 5xx and network errors
    return status >= 400 && status < 500;
  }

  /**
   * Execute the actual request based on method type
   */
  private async executeRequest<T = unknown>(
    config: RequestConfig
  ): Promise<ExecutionResponse<T>> {
    if (!this.context) {
      throw new Error('Executor not initialized. Call init() first.');
    }

    let response;
    const requestOptions: Record<string, unknown> = {
      headers: config.headers,
      timeout: config.timeout || this.config.timeout,
    };

    if (config.data) {
      requestOptions.data = config.data;
    }
    if (config.params) {
      requestOptions.params = config.params;
    }

    switch (config.method.toUpperCase()) {
      case 'GET':
        response = await this.context.get(config.endpoint, requestOptions);
        break;
      case 'POST':
        response = await this.context.post(config.endpoint, requestOptions);
        break;
      case 'PUT':
        response = await this.context.put(config.endpoint, requestOptions);
        break;
      case 'PATCH':
        response = await this.context.patch(config.endpoint, requestOptions);
        break;
      case 'DELETE':
        response = await this.context.delete(config.endpoint, requestOptions);
        break;
      case 'HEAD':
        response = await this.context.head(config.endpoint, requestOptions);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${config.method}`);
    }

    return this.parseResponse<T>(response);
  }

  /**
   * Parse response and extract body
   */
  private async parseResponse<T>(response: any): Promise<ExecutionResponse<T>> {
    let body: T;

    try {
      body = await response.json();
    } catch {
      try {
        body = (await response.text()) as unknown as T;
      } catch {
        body = {} as T;
      }
    }

    return {
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body,
      ok: response.ok(),
      duration: 0, // Set by execute method
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('econnrefused') ||
        message.includes('timeout') ||
        message.includes('econnreset') ||
        message.includes('network') ||
        message.includes('http 5') // Retry on server errors (5xx)
      );
    }
    return false;
  }

  /**
   * GET request convenience method
   */
  async get<T = unknown>(endpoint: string, config?: Partial<RequestConfig>): Promise<ExecutionResponse<T>> {
    return this.execute<T>({
      endpoint,
      method: 'GET',
      ...config,
    });
  }

  /**
   * POST request convenience method
   */
  async post<T = unknown>(endpoint: string, config?: Partial<RequestConfig>): Promise<ExecutionResponse<T>> {
    return this.execute<T>({
      endpoint,
      method: 'POST',
      ...config,
    });
  }

  /**
   * PUT request convenience method
   */
  async put<T = unknown>(endpoint: string, config?: Partial<RequestConfig>): Promise<ExecutionResponse<T>> {
    return this.execute<T>({
      endpoint,
      method: 'PUT',
      ...config,
    });
  }

  /**
   * PATCH request convenience method
   */
  async patch<T = unknown>(endpoint: string, config?: Partial<RequestConfig>): Promise<ExecutionResponse<T>> {
    return this.execute<T>({
      endpoint,
      method: 'PATCH',
      ...config,
    });
  }

  /**
   * DELETE request convenience method
   */
  async delete<T = unknown>(endpoint: string, config?: Partial<RequestConfig>): Promise<ExecutionResponse<T>> {
    return this.execute<T>({
      endpoint,
      method: 'DELETE',
      ...config,
    });
  }
}
