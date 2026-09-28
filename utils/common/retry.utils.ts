/**
 * Retry Utilities - Handle flaky tests with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  timeout?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export class RetryUtils {
  private static readonly DEFAULT_MAX_ATTEMPTS = 3;
  private static readonly DEFAULT_DELAY_MS = 1000;
  private static readonly DEFAULT_BACKOFF = 1.5;
  private static readonly DEFAULT_TIMEOUT = 30000;

  /**
   * Execute async function with retry logic
   */
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = this.DEFAULT_MAX_ATTEMPTS,
      delayMs = this.DEFAULT_DELAY_MS,
      backoffMultiplier = this.DEFAULT_BACKOFF,
      timeout = this.DEFAULT_TIMEOUT,
      onRetry,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.withTimeout(fn(), timeout);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxAttempts) {
          throw new Error(
            `Failed after ${maxAttempts} attempts: ${lastError.message}`
          );
        }

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        // Calculate delay with exponential backoff
        const waitTime = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        await this.delay(waitTime);
      }
    }

    throw lastError || new Error('Unknown error');
  }

  /**
   * Retry a condition until it's true
   */
  static async waitUntil(
    condition: () => Promise<boolean>,
    options: RetryOptions = {}
  ): Promise<void> {
    const {
      maxAttempts = this.DEFAULT_MAX_ATTEMPTS,
      delayMs = this.DEFAULT_DELAY_MS,
      backoffMultiplier = this.DEFAULT_BACKOFF,
      onRetry,
    } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await condition();
        if (result) {
          return;
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (onRetry) {
          onRetry(attempt, err);
        }
      }

      if (attempt < maxAttempts) {
        const waitTime = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        await this.delay(waitTime);
      }
    }

    throw new Error(
      `Condition not met after ${maxAttempts} attempts`
    );
  }

  /**
   * Retry with linear backoff
   */
  static async executeWithLinearBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions & { incrementMs?: number } = {}
  ): Promise<T> {
    const {
      maxAttempts = this.DEFAULT_MAX_ATTEMPTS,
      delayMs = this.DEFAULT_DELAY_MS,
      incrementMs = 500,
      timeout = this.DEFAULT_TIMEOUT,
      onRetry,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.withTimeout(fn(), timeout);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxAttempts) {
          throw lastError;
        }

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        // Linear backoff: delay = baseDelay + (increment * attemptNumber)
        const waitTime = delayMs + incrementMs * attempt;
        await this.delay(waitTime);
      }
    }

    throw lastError;
  }

  /**
   * Retry with fixed delay
   */
  static async executeWithFixedDelay<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = this.DEFAULT_MAX_ATTEMPTS,
      delayMs = this.DEFAULT_DELAY_MS,
      timeout = this.DEFAULT_TIMEOUT,
      onRetry,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.withTimeout(fn(), timeout);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxAttempts) {
          throw lastError;
        }

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        await this.delay(delayMs);
      }
    }

    throw lastError;
  }

  /**
   * Circuit breaker pattern - fail fast after threshold
   */
  static async executeWithCircuitBreaker<T>(
    fn: () => Promise<T>,
    failureThreshold: number = 3,
    resetTimeMs: number = 60000
  ): Promise<T> {
    let failureCount = 0;
    let lastFailureTime = 0;
    let isOpen = false;

    try {
      // If circuit is open, check if we should reset
      if (isOpen) {
        const timeSinceLastFailure = Date.now() - lastFailureTime;
        if (timeSinceLastFailure > resetTimeMs) {
          isOpen = false;
          failureCount = 0;
        } else {
          throw new Error('Circuit breaker is open - request rejected');
        }
      }

      return await fn();
    } catch (error) {
      failureCount++;
      lastFailureTime = Date.now();

      if (failureCount >= failureThreshold) {
        isOpen = true;
      }

      throw error;
    }
  }

  /**
   * Retry with jitter to avoid thundering herd
   */
  static async executeWithJitter<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = this.DEFAULT_MAX_ATTEMPTS,
      delayMs = this.DEFAULT_DELAY_MS,
      backoffMultiplier = this.DEFAULT_BACKOFF,
      timeout = this.DEFAULT_TIMEOUT,
      onRetry,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.withTimeout(fn(), timeout);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxAttempts) {
          throw lastError;
        }

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        // Exponential backoff with jitter
        const baseDelay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        const jitter = Math.random() * baseDelay * 0.1; // 10% jitter
        const waitTime = baseDelay + jitter;
        await this.delay(waitTime);
      }
    }

    throw lastError;
  }

  /**
   * Timeout wrapper
   */
  private static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }

  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Attempt to execute, return null on failure
   */
  static async tryExecute<T>(
    fn: () => Promise<T>,
    onError?: (error: Error) => void
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (onError) {
        onError(err);
      }
      return null;
    }
  }

  /**
   * Retry array of functions sequentially
   */
  static async executeSequentialWithRetry<T>(
    functions: (() => Promise<T>)[],
    options: RetryOptions = {}
  ): Promise<T[]> {
    const results: T[] = [];

    for (const fn of functions) {
      const result = await this.executeWithRetry(fn, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Retry with predicate - retry only if condition is met
   */
  static async executeWithConditionalRetry<T>(
    fn: () => Promise<T>,
    shouldRetry: (error: Error) => boolean,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = this.DEFAULT_MAX_ATTEMPTS,
      delayMs = this.DEFAULT_DELAY_MS,
      backoffMultiplier = this.DEFAULT_BACKOFF,
      onRetry,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (!shouldRetry(lastError)) {
          throw lastError;
        }

        if (attempt === maxAttempts) {
          throw lastError;
        }

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        const waitTime = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        await this.delay(waitTime);
      }
    }

    throw lastError;
  }
}
