import { TestDataLoader } from './test-data.loader';

/**
 * User Context - Represents a single user session
 */
export interface UserContext {
  userId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  sessionId: string;
  timestamp: number;
  authToken?: string;
  cookies?: Record<string, string>;
}

/**
 * Multi-User Context Manager
 * Manages multiple user sessions for concurrent testing scenarios
 */
export class UserContextManager {
  private static contexts: Map<string, UserContext> = new Map();
  private static sessionCount = 0;

  /**
   * Create a new user context
   */
  static createUserContext(userIndex: number): UserContext {
    const user = TestDataLoader.getValidUserByIndex(userIndex);
    const userId = `user_${userIndex}_${Date.now()}`;
    const sessionId = `session_${this.sessionCount++}_${Date.now()}`;

    const context: UserContext = {
      userId,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      sessionId,
      timestamp: Date.now(),
    };

    this.contexts.set(context.userId, context);
    return context;
  }

  /**
   * Create multiple user contexts for parallel testing
   */
  static createMultipleUserContexts(count: number): UserContext[] {
    const contexts: UserContext[] = [];
    for (let i = 0; i < count; i++) {
      contexts.push(this.createUserContext(i % TestDataLoader.getValidUsers().length));
    }
    return contexts;
  }

  /**
   * Get user context by userId
   */
  static getUserContext(userId: string): UserContext {
    const context = this.contexts.get(userId);
    if (!context) {
      throw new Error(`User context not found: ${userId}`);
    }
    return context;
  }

  /**
   * Update user context with authentication data
   */
  static updateUserContext(
    userId: string,
    updates: Partial<Omit<UserContext, 'userId' | 'sessionId' | 'timestamp'>>
  ): UserContext {
    const context = this.getUserContext(userId);
    const updatedContext = { ...context, ...updates };
    this.contexts.set(userId, updatedContext);
    return updatedContext;
  }

  /**
   * Get all active user contexts
   */
  static getAllContexts(): UserContext[] {
    return Array.from(this.contexts.values());
  }

  /**
   * Get user context by email
   */
  static getUserContextByEmail(email: string): UserContext | undefined {
    return Array.from(this.contexts.values()).find(ctx => ctx.email === email);
  }

  /**
   * Get user context by session ID
   */
  static getUserContextBySessionId(sessionId: string): UserContext | undefined {
    return Array.from(this.contexts.values()).find(ctx => ctx.sessionId === sessionId);
  }

  /**
   * Remove user context
   */
  static removeUserContext(userId: string): boolean {
    return this.contexts.delete(userId);
  }

  /**
   * Clear all user contexts
   */
  static clearAllContexts(): void {
    this.contexts.clear();
    this.sessionCount = 0;
  }

  /**
   * Get context count
   */
  static getContextCount(): number {
    return this.contexts.size;
  }

  /**
   * Check if context exists
   */
  static contextExists(userId: string): boolean {
    return this.contexts.has(userId);
  }

  /**
   * Get user by round-robin index (for distributed testing)
   */
  static getDistributedUserContext(testIndex: number): UserContext {
    const allContexts = this.getAllContexts();
    if (allContexts.length === 0) {
      throw new Error('No user contexts available');
    }
    return allContexts[testIndex % allContexts.length];
  }
}
