/**
 * API Methods - HTTP methods wrapper
 * Provides typed, reusable methods for common HTTP operations
 */
import { ApiExecutor, RequestConfig, ExecutionResponse } from './executor';

/**
 * API Methods class - Encapsulates HTTP methods
 */
export class ApiMethods {
  constructor(private executor: ApiExecutor) {}

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean>;
      timeout?: number;
    }
  ): Promise<ExecutionResponse<T>> {
    return this.executor.execute<T>({
      endpoint,
      method: 'GET',
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean>;
      timeout?: number;
    }
  ): Promise<ExecutionResponse<T>> {
    return this.executor.execute<T>({
      endpoint,
      method: 'POST',
      data,
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean>;
      timeout?: number;
    }
  ): Promise<ExecutionResponse<T>> {
    return this.executor.execute<T>({
      endpoint,
      method: 'PUT',
      data,
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean>;
      timeout?: number;
    }
  ): Promise<ExecutionResponse<T>> {
    return this.executor.execute<T>({
      endpoint,
      method: 'PATCH',
      data,
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean>;
      timeout?: number;
    }
  ): Promise<ExecutionResponse<T>> {
    return this.executor.execute<T>({
      endpoint,
      method: 'DELETE',
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
  }

  /**
   * HEAD request
   */
  async head(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean>;
      timeout?: number;
    }
  ): Promise<ExecutionResponse> {
    return this.executor.execute({
      endpoint,
      method: 'HEAD',
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout,
    });
  }
}
