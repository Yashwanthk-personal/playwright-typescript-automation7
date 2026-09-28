import { ApiExecutor, ExecutionConfig } from '../core/executor';
import { UserContextManager, UserContext } from '../../utils/common';

/**
 * Multi-User API Client Manager
 * Manages API clients for multiple users with authentication handling
 */
export class MultiUserApiManager {
  private static clients: Map<string, ApiExecutor> = new Map();

  /**
   * Create API client for user with base config
   */
  static createClientForUser(user: UserContext, baseUrl: string): ApiExecutor {
    const config: ExecutionConfig = {
      baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `TestUser-${user.userId}`,
      },
    };

    const client = new ApiExecutor(config);
    this.clients.set(user.userId, client);
    return client;
  }

  /**
   * Create clients for multiple users
   */
  static createClientsForUsers(
    users: UserContext[],
    baseUrl: string
  ): Map<string, ApiExecutor> {
    const clients = new Map<string, ApiExecutor>();

    for (const user of users) {
      const client = this.createClientForUser(user, baseUrl);
      clients.set(user.userId, client);
    }

    return clients;
  }

  /**
   * Get client for user
   */
  static getClient(userId: string): ApiExecutor {
    const client = this.clients.get(userId);
    if (!client) {
      throw new Error(`API client not found for user ${userId}`);
    }
    return client;
  }

  /**
   * Initialize all clients
   */
  static async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.clients.values()).map(client =>
      client.init()
    );

    await Promise.all(initPromises);
  }

  /**
   * Update client auth headers
   */
  static updateClientAuth(userId: string, authToken: string): void {
    const client = this.getClient(userId);
    const headers = client.getConfig?.()?.headers || {};
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  /**
   * Execute request for user
   */
  static async executeFor<T>(
    userId: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    data?: unknown
  ): Promise<T> {
    const client = this.getClient(userId);

    // Add user context to request if needed
    const user = UserContextManager.getUserContext(userId);

    return client.execute({
      endpoint,
      method,
      data,
    });
  }

  /**
   * Execute request on all user clients in parallel
   */
  static async executeOnAll<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    data?: unknown
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    const promises: Promise<void>[] = [];

    for (const [userId, client] of this.clients) {
      const promise = (async () => {
        try {
          const result = await client.execute({
            endpoint,
            method,
            data,
          });
          results.set(userId, result);
        } catch (error) {
          console.error(`API call failed for user ${userId}:`, error);
          throw error;
        }
      })();

      promises.push(promise);
    }

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Execute with different payloads per user
   */
  static async executeMultiWithPayloads<T>(
    payloads: Map<string, unknown>,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    const promises: Promise<void>[] = [];

    for (const [userId, payload] of payloads) {
      const client = this.clients.get(userId);
      if (!client) {
        console.warn(`No client for user ${userId}`);
        continue;
      }

      const promise = (async () => {
        try {
          const result = await client.execute({
            endpoint,
            method,
            data: payload,
          });
          results.set(userId, result);
        } catch (error) {
          console.error(`API call failed for user ${userId}:`, error);
          throw error;
        }
      })();

      promises.push(promise);
    }

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Batch operations - send different endpoints for each user
   */
  static async batchExecute<T>(
    operations: Array<{
      userId: string;
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      data?: unknown;
    }>
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();

    const promises = operations.map(async op => {
      try {
        const result = await this.executeFor<T>(
          op.userId,
          op.endpoint,
          op.method,
          op.data
        );
        results.set(op.userId, result);
      } catch (error) {
        console.error(`Batch operation failed for ${op.userId}:`, error);
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Get all clients
   */
  static getAllClients(): Map<string, ApiExecutor> {
    return new Map(this.clients);
  }

  /**
   * Clear all clients
   */
  static clearAll(): void {
    this.clients.clear();
  }

  /**
   * Get client count
   */
  static getClientCount(): number {
    return this.clients.size;
  }
}

/**
 * Common Multi-User API Operations
 */
export class MultiUserApiOperations {
  /**
   * Login multiple users via API
   */
  static async loginMultipleUsersAPI(
    baseUrl: string,
    loginEndpoint: string = '/api/login'
  ): Promise<Map<string, string>> {
    const users = UserContextManager.getAllContexts();
    const authTokens = new Map<string, string>();

    const loginPromises = users.map(async user => {
      try {
        const client = MultiUserApiManager.getClient(user.userId);

        // @ts-ignore - API response structure depends on implementation
        const response = await client.execute({
          endpoint: loginEndpoint,
          method: 'POST',
          data: {
            email: user.email,
            password: user.password,
          },
        });

        // Store auth token
        if (response.body?.token) {
          authTokens.set(user.userId, response.body.token);
          MultiUserApiManager.updateClientAuth(user.userId, response.body.token);
        }

        return true;
      } catch (error) {
        console.error(`Login failed for user ${user.email}:`, error);
        return false;
      }
    });

    await Promise.allSettled(loginPromises);
    return authTokens;
  }

  /**
   * Get data for multiple users
   */
  static async getDataForMultipleUsers(
    endpoint: string
  ): Promise<Map<string, any>> {
    return MultiUserApiManager.executeOnAll(endpoint, 'GET');
  }

  /**
   * Create resources for multiple users
   */
  static async createResourcesForUsers(
    endpoint: string,
    dataGenerator: (user: UserContext) => unknown
  ): Promise<Map<string, any>> {
    const users = UserContextManager.getAllContexts();
    const payloads = new Map(users.map(u => [u.userId, dataGenerator(u)]));

    return MultiUserApiManager.executeMultiWithPayloads(payloads, endpoint, 'POST');
  }

  /**
   * Update resources for multiple users
   */
  static async updateResourcesForUsers(
    endpoint: string,
    dataGenerator: (user: UserContext) => unknown
  ): Promise<Map<string, any>> {
    const users = UserContextManager.getAllContexts();
    const payloads = new Map(users.map(u => [u.userId, dataGenerator(u)]));

    return MultiUserApiManager.executeMultiWithPayloads(payloads, endpoint, 'PUT');
  }

  /**
   * Delete resources for multiple users
   */
  static async deleteResourcesForUsers(endpoint: string): Promise<Map<string, any>> {
    return MultiUserApiManager.executeOnAll(endpoint, 'DELETE');
  }

  /**
   * Verify data consistency across users
   */
  static async verifyConsistency(
    endpoint: string,
    expectedValue: string | number
  ): Promise<{
    consistent: boolean;
    results: Map<string, any>;
    inconsistencies: string[];
  }> {
    const results = await MultiUserApiManager.executeOnAll(endpoint, 'GET');
    const inconsistencies: string[] = [];

    for (const [userId, result] of results) {
      const user = UserContextManager.getUserContext(userId);
      // Adjust this based on your API response structure
      const actualValue = (result as any)?.body?.value;

      if (actualValue !== expectedValue) {
        inconsistencies.push(
          `User ${user.email}: expected ${expectedValue}, got ${actualValue}`
        );
      }
    }

    return {
      consistent: inconsistencies.length === 0,
      results,
      inconsistencies,
    };
  }

  /**
   * Performance test - measure response times
   */
  static async performanceTest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
  ): Promise<{
    totalTime: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    responseTimes: Map<string, number>;
  }> {
    const responseTimes = new Map<string, number>();

    const start = Date.now();

    const results = await MultiUserApiManager.executeOnAll(endpoint, method as any);

    const totalDuration = Date.now() - start;

    // In a real scenario, you'd want to track individual request times
    // This is a simplified example
    const times = Array.from(responseTimes.values());
    const averageTime = times.length > 0 ? times.reduce((a, b) => a + b) / times.length : 0;
    const minTime = Math.min(...times, Infinity);
    const maxTime = Math.max(...times, -Infinity);

    return {
      totalTime: totalDuration,
      averageTime,
      minTime: minTime === Infinity ? 0 : minTime,
      maxTime: maxTime === -Infinity ? 0 : maxTime,
      responseTimes,
    };
  }
}
