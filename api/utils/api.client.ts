import { APIRequestContext, request } from '@playwright/test';

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
}

export interface ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: T;
  ok: boolean;
}

export class ApiClient {
  private context: APIRequestContext | null = null;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize the API context
   */
  async init(): Promise<void> {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: this.baseUrl,
      });
    }
  }

  /**
   * Close the API context
   */
  async close(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }

  /**
   * Perform a GET request
   */
  async get<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    if (!this.context) {
      await this.init();
    }

    const response = await this.context!.get(endpoint, {
      headers: options?.headers,
      timeout: options?.timeout,
      params: options?.params,
    });

    return this.parseResponse(response);
  }

  /**
   * Perform a POST request
   */
  async post<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    if (!this.context) {
      await this.init();
    }

    const response = await this.context!.post(endpoint, {
      headers: options?.headers,
      timeout: options?.timeout,
      data: options?.data,
    });

    return this.parseResponse(response);
  }

  /**
   * Perform a PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    if (!this.context) {
      await this.init();
    }

    const response = await this.context!.put(endpoint, {
      headers: options?.headers,
      timeout: options?.timeout,
      data: options?.data,
    });

    return this.parseResponse(response);
  }

  /**
   * Perform a PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    if (!this.context) {
      await this.init();
    }

    const response = await this.context!.patch(endpoint, {
      headers: options?.headers,
      timeout: options?.timeout,
      data: options?.data,
    });

    return this.parseResponse(response);
  }

  /**
   * Perform a DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    if (!this.context) {
      await this.init();
    }

    const response = await this.context!.delete(endpoint, {
      headers: options?.headers,
      timeout: options?.timeout,
    });

    return this.parseResponse(response);
  }

  /**
   * Parse response and extract body
   */
  private async parseResponse<T>(response: any): Promise<ApiResponse<T>> {
    let body: T;

    try {
      body = await response.json();
    } catch {
      body = (await response.text()) as unknown as T;
    }

    return {
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body,
      ok: response.ok(),
    };
  }
}
