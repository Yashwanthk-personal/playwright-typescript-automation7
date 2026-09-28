/**
 * Response Validator
 * Methods for validating API responses, status codes, headers, and body content
 */
import { expect } from '@playwright/test';
import { ExecutionResponse } from './executor';

/**
 * Validator class for API responses
 */
export class ResponseValidator {
  /**
   * Validate HTTP status code
   */
  static validateStatus(status: number, expectedStatus: number) {
    expect(status).toBe(expectedStatus);
  }

  /**
   * Validate response status is successful (2xx)
   */
  static validateSuccess(status: number) {
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(300);
  }

  /**
   * Validate response status is error (4xx or 5xx)
   */
  static validateError(status: number) {
    expect(status).toBeGreaterThanOrEqual(400);
  }

  /**
   * Validate response body contains a specific key
   */
  static validateHasKey(body: any, key: string) {
    expect(body).toHaveProperty(key);
  }

  /**
   * Validate response body contains all specified keys
   */
  static validateHasKeys(body: any, keys: string[]) {
    keys.forEach((key) => {
      expect(body).toHaveProperty(key);
    });
  }

  /**
   * Validate response body property value
   */
  static validatePropertyValue(body: any, path: string, expectedValue: any) {
    const value = this.getNestedProperty(body, path);
    expect(value).toBe(expectedValue);
  }

  /**
   * Validate response body property is not null/undefined
   */
  static validatePropertyExists(body: any, path: string) {
    const value = this.getNestedProperty(body, path);
    expect(value).toBeDefined();
  }

  /**
   * Validate response body array length
   */
  static validateArrayLength(body: any[], expectedLength: number) {
    expect(body).toHaveLength(expectedLength);
  }

  /**
   * Validate response body is an array
   */
  static validateIsArray(body: any) {
    expect(Array.isArray(body)).toBe(true);
  }

  /**
   * Validate response body contains specific item
   */
  static validateArrayContains(body: any[], item: any) {
    expect(body).toContainEqual(item);
  }

  /**
   * Validate response headers
   */
  static validateHeader(
    headers: Record<string, string>,
    key: string,
    expectedValue: string
  ) {
    // Headers can be case-insensitive, so normalize
    const normalizedHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([k, v]) => {
      normalizedHeaders[k.toLowerCase()] = v;
    });

    expect(normalizedHeaders[key.toLowerCase()]).toBe(expectedValue);
  }

  /**
   * Validate response body matches pattern
   */
  static validateMatches(body: any, pattern: RegExp) {
    expect(String(body)).toMatch(pattern);
  }

  /**
   * Validate response is JSON
   */
  static validateJson(body: any) {
    expect(() => JSON.stringify(body)).not.toThrow();
  }

  /**
   * Validate execution time (response duration)
   */
  static validateExecutionTime(duration: number, maxDurationMs: number) {
    expect(duration).toBeLessThanOrEqual(maxDurationMs);
  }

  /**
   * Get nested property from an object using dot notation
   */
  private static getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  /**
   * Validate entire response object
   */
  static validateResponse(response: any, expectedSchema: Record<string, any>) {
    Object.entries(expectedSchema).forEach(([key, value]) => {
      if (typeof value === 'function') {
        value(response[key]);
      } else {
        expect(response[key]).toEqual(value);
      }
    });
  }

  /**
   * Validate JSON response contains expected properties
   */
  static validateJsonSchema(body: any, schema: Record<string, string>) {
    const keys = Object.keys(schema);
    keys.forEach((key) => {
      expect(body).toHaveProperty(key);
      const actualType = typeof body[key];
      expect(actualType).toBe(schema[key]);
    });
  }

  /**
   * Validate response body is successful response
   */
  static validateSuccessResponse<T>(response: ExecutionResponse<T>) {
    expect(response.ok).toBe(true);
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
  }

  /**
   * Validate response body is error response
   */
  static validateErrorResponse<T>(response: ExecutionResponse<T>) {
    expect(response.ok).toBe(false);
    expect(response.status).toBeGreaterThanOrEqual(400);
  }
}
