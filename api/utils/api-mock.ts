/**
 * API Mocking Utilities - Mock API responses for testing
 */
import { APIRequestContext, Route } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface MockResponse {
  status: number;
  statusText?: string;
  body: unknown;
  headers?: Record<string, string>;
  delay?: number;
}

export interface MockedRequest {
  method: string;
  url: string;
  postData?: string;
  headers?: Record<string, string>;
  timestamp: number;
}

/**
 * API Mock Manager - Handle mocking of API responses
 */
export class ApiMockManager {
  private mocks: Map<string, MockResponse> = new Map();
  private mockedRequests: MockedRequest[] = [];
  private responseDelays: Map<string, number> = new Map();
  private retrySimulation: Map<string, { attempts: number; failedAttempts: number }> =
    new Map();
  private mockActive: boolean = false;
  private readonly MOCK_DIR = path.join(__dirname, '..', '..', 'allure-results', 'mocks');

  constructor() {
    this.initializeMockDirectory();
  }

  /**
   * Initialize mock directory for storing mock data
   */
  private initializeMockDirectory(): void {
    if (!fs.existsSync(this.MOCK_DIR)) {
      fs.mkdirSync(this.MOCK_DIR, { recursive: true });
    }
  }

  /**
   * Register a mock response for an endpoint
   */
  registerMock(endpoint: string, response: MockResponse): void {
    this.mocks.set(endpoint, response);
  }

  /**
   * Register a delay for an endpoint
   */
  registerDelay(endpoint: string, delayMs: number): void {
    this.responseDelays.set(endpoint, delayMs);
  }

  /**
   * Setup retry simulation - fail N times then succeed
   */
  setupRetrySimulation(endpoint: string, failAttempts: number): void {
    this.retrySimulation.set(endpoint, {
      attempts: 0,
      failedAttempts: failAttempts,
    });
  }

  /**
   * Get registered mock for endpoint
   */
  getMock(endpoint: string): MockResponse | undefined {
    return this.mocks.get(endpoint);
  }

  /**
   * Get delay for endpoint
   */
  getDelay(endpoint: string): number {
    return this.responseDelays.get(endpoint) || 0;
  }

  /**
   * Check if should retry based on simulation setup
   */
  shouldFailThisAttempt(endpoint: string): boolean {
    const sim = this.retrySimulation.get(endpoint);
    if (!sim) return false;

    sim.attempts++;
    return sim.attempts <= sim.failedAttempts;
  }

  /**
   * Record a mocked request
   */
  recordRequest(method: string, url: string, postData?: string, headers?: Record<string, string>): void {
    this.mockedRequests.push({
      method,
      url,
      postData,
      headers,
      timestamp: Date.now(),
    });
  }

  /**
   * Get mocked requests
   */
  getMockedRequests(endpoint?: string): MockedRequest[] {
    if (!endpoint) {
      return this.mockedRequests;
    }
    return this.mockedRequests.filter((req) => req.url.includes(endpoint));
  }

  /**
   * Get count of mocked requests to endpoint
   */
  getRequestCount(endpoint: string): number {
    return this.getMockedRequests(endpoint).length;
  }

  /**
   * Get last mocked request
   */
  getLastRequest(): MockedRequest | undefined {
    return this.mockedRequests[this.mockedRequests.length - 1];
  }

  /**
   * Get request payload as object
   */
  getRequestPayload(endpoint?: string): unknown {
    const request = endpoint ? this.getMockedRequests(endpoint).pop() : this.getLastRequest();
    if (!request || !request.postData) {
      return {};
    }
    try {
      return JSON.parse(request.postData);
    } catch {
      return request.postData;
    }
  }

  /**
   * Clear all mocks and recorded requests
   */
  clear(): void {
    this.mocks.clear();
    this.mockedRequests = [];
    this.responseDelays.clear();
    this.retrySimulation.clear();
    this.mockActive = false;
  }

  /**
   * Reset only recorded requests (keep mocks active)
   */
  resetRequests(): void {
    this.mockedRequests = [];
  }

  /**
   * Save mock data to file
   */
  saveMockData(testName: string): void {
    const mockData = {
      registered: Array.from(this.mocks.entries()),
      recorded: this.mockedRequests,
      timestamp: new Date().toISOString(),
    };

    const filePath = path.join(this.MOCK_DIR, `${testName}-mock-data.json`);
    fs.writeFileSync(filePath, JSON.stringify(mockData, null, 2));
  }

  /**
   * Mark mocks as active
   */
  activate(): void {
    this.mockActive = true;
  }

  /**
   * Check if mocks are active
   */
  isActive(): boolean {
    return this.mockActive;
  }

  /**
   * Deactivate mocks
   */
  deactivate(): void {
    this.mockActive = false;
  }
}

// Global mock manager instance
export const apiMockManager = new ApiMockManager();
