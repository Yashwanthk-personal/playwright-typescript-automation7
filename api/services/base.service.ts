/**
 * Base API Service
 * Common functionality for all API services with comprehensive methods
 */
import { ApiMethods } from '../core/methods';
import { ApiExecutor, ExecutionResponse } from '../core/executor';
import { API_CONSTANTS } from '../../config/constants';

/**
 * Base service with common API operations
 * Provides methods for authentication, headers, and common patterns
 */
export class BaseApiService {
  protected methods: ApiMethods;

  constructor(executor: ApiExecutor) {
    this.methods = new ApiMethods(executor);
  }

  // ==================== AUTHENTICATION & HEADERS ====================

  /**
   * Get authorization header with Bearer token
   */
  protected getAuthHeaders(token: string): Record<string, string> {
    return {
      [API_CONSTANTS.HEADERS.AUTHORIZATION]: `${API_CONSTANTS.HEADERS.BEARER_TOKEN} ${token}`,
      [API_CONSTANTS.HEADERS.CONTENT_TYPE]: API_CONSTANTS.CONTENT_TYPES.JSON,
    };
  }

  /**
   * Get authorization header with Basic auth
   */
  protected getBasicAuthHeaders(username: string, password: string): Record<string, string> {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    return {
      [API_CONSTANTS.HEADERS.AUTHORIZATION]: `${API_CONSTANTS.HEADERS.BASIC_AUTH} ${credentials}`,
      [API_CONSTANTS.HEADERS.CONTENT_TYPE]: API_CONSTANTS.CONTENT_TYPES.JSON,
    };
  }

  /**
   * Get standard JSON headers
   */
  protected getJsonHeaders(): Record<string, string> {
    return {
      [API_CONSTANTS.HEADERS.CONTENT_TYPE]: API_CONSTANTS.CONTENT_TYPES.JSON,
    };
  }

  /**
   * Get form-urlencoded headers
   */
  protected getFormHeaders(): Record<string, string> {
    return {
      [API_CONSTANTS.HEADERS.CONTENT_TYPE]: API_CONSTANTS.CONTENT_TYPES.FORM_URLENCODED,
    };
  }

  /**
   * Get form-data (multipart) headers
   */
  protected getMultipartHeaders(): Record<string, string> {
    return {
      [API_CONSTANTS.HEADERS.CONTENT_TYPE]: API_CONSTANTS.CONTENT_TYPES.MULTIPART_FORM,
    };
  }

  /**
   * Get custom headers with additional values
   */
  protected getCustomHeaders(
    customHeaders: Record<string, string>,
    includeJson: boolean = true
  ): Record<string, string> {
    const headers = includeJson ? this.getJsonHeaders() : {};
    return { ...headers, ...customHeaders };
  }

  /**
   * Get headers with authentication
   */
  protected getAuthenticatedHeaders(
    token: string,
    additionalHeaders?: Record<string, string>
  ): Record<string, string> {
    return { ...this.getAuthHeaders(token), ...additionalHeaders };
  }

  // ==================== RESPONSE PARSING ====================

  /**
   * Extract data from successful response
   */
  protected extractResponseData<T>(response: ExecutionResponse<T>): T {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    return response.body;
  }

  /**
   * Check if response is successful
   */
  protected isSuccessResponse(response: ExecutionResponse): boolean {
    return response.ok && response.status >= 200 && response.status < 300;
  }

  /**
   * Check if response is client error (4xx)
   */
  protected isClientError(response: ExecutionResponse): boolean {
    return response.status >= 400 && response.status < 500;
  }

  /**
   * Check if response is server error (5xx)
   */
  protected isServerError(response: ExecutionResponse): boolean {
    return response.status >= 500 && response.status < 600;
  }

  /**
   * Get error message from response
   */
  protected getErrorMessage(response: ExecutionResponse): string {
    if (response.body && typeof response.body === 'object') {
      const body = response.body as Record<string, unknown>;
      return String(body.message || body.error || response.statusText || 'Unknown error');
    }
    return response.statusText || 'Unknown error';
  }

  // ==================== REQUEST BUILDING ====================

  /**
   * Build query string from object
   */
  protected buildQueryString(params: Record<string, string | number | boolean>): string {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        queryParams.append(key, String(value));
      }
    }
    return queryParams.toString();
  }

  /**
   * Build endpoint URL with path parameters
   */
  protected buildUrl(endpoint: string, pathParams?: Record<string, string | number>): string {
    let url = endpoint;
    if (pathParams) {
      for (const [key, value] of Object.entries(pathParams)) {
        url = url.replace(`{${key}}`, String(value));
      }
    }
    return url;
  }

  /**
   * Build full endpoint URL with query parameters
   */
  protected buildUrlWithQuery(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean>,
    pathParams?: Record<string, string | number>
  ): string {
    let url = this.buildUrl(endpoint, pathParams);
    if (queryParams && Object.keys(queryParams).length > 0) {
      const queryString = this.buildQueryString(queryParams);
      url += `?${queryString}`;
    }
    return url;
  }

  // ==================== VALIDATION ====================

  /**
   * Validate response status
   */
  protected validateStatus(response: ExecutionResponse, expectedStatus: number): void {
    if (response.status !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, but got ${response.status}: ${this.getErrorMessage(response)}`
      );
    }
  }

  /**
   * Validate response status in range
   */
  protected validateStatusRange(
    response: ExecutionResponse,
    minStatus: number,
    maxStatus: number
  ): void {
    if (response.status < minStatus || response.status > maxStatus) {
      throw new Error(
        `Expected status between ${minStatus}-${maxStatus}, but got ${response.status}: ${this.getErrorMessage(response)}`
      );
    }
  }

  /**
   * Validate response has required fields
   */
  protected validateRequiredFields(
    response: ExecutionResponse,
    requiredFields: string[]
  ): void {
    if (!response.body || typeof response.body !== 'object') {
      throw new Error('Response body is not an object');
    }

    const body = response.body as Record<string, unknown>;
    const missingFields = requiredFields.filter(field => !(field in body));

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Validate response field types
   */
  protected validateFieldTypes(
    response: ExecutionResponse,
    fieldTypeMap: Record<string, string>
  ): void {
    if (!response.body || typeof response.body !== 'object') {
      throw new Error('Response body is not an object');
    }

    const body = response.body as Record<string, unknown>;
    for (const [field, expectedType] of Object.entries(fieldTypeMap)) {
      const actualType = typeof body[field];
      if (actualType !== expectedType) {
        throw new Error(
          `Field '${field}' has type '${actualType}', expected '${expectedType}'`
        );
      }
    }
  }

  // ==================== PAGINATION ====================

  /**
   * Build pagination parameters
   */
  protected getPaginationParams(page: number, limit: number): Record<string, number> {
    return {
      page: Math.max(1, page),
      limit: Math.min(Math.max(1, limit), 100),
    };
  }

  /**
   * Get offset-based pagination parameters
   */
  protected getOffsetPaginationParams(offset: number, limit: number): Record<string, number> {
    return {
      offset: Math.max(0, offset),
      limit: Math.min(Math.max(1, limit), 100),
    };
  }

  // ==================== RETRY & ERROR HANDLING ====================

  /**
   * Check if status code is retryable
   */
  protected isRetryableStatus(status: number): boolean {
    return API_CONSTANTS.RETRY.RETRYABLE_STATUS_CODES.includes(status as any);
  }

  /**
   * Format error for logging
   */
  protected formatErrorForLogging(response: ExecutionResponse): string {
    return `Status: ${response.status}, Message: ${this.getErrorMessage(response)}, Duration: ${response.duration}ms`;
  }
}
