/**
 * In-memory rate limiter using a sliding window algorithm.
 *
 * For production use, replace this with a Redis-backed or database-backed
 * implementation so that rate limits are shared across multiple server instances.
 *
 * Usage:
 *   const limiter = new RateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *   const { allowed, remaining, resetAt } = limiter.consume('user-id');
 *   if (!allowed) throw new Error('Rate limit exceeded');
 */

interface RateLimiterConfig {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

interface RateLimiterResult {
  /** Whether the request is allowed. */
  allowed: boolean;
  /** Number of remaining requests in the current window. */
  remaining: number;
  /** Timestamp (ms) when the window resets. */
  resetAt: number;
  /** Retry-After header value (seconds) when rate limited. */
  retryAfter: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

// In-memory store: key → window entry
const store = new Map<string, WindowEntry>();

// Periodically clean up expired entries
const CLEANUP_INTERVAL_MS = 60_000; // every 60 seconds
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  cleanupTimer.unref(); // Don't prevent Node.js from exiting
}

export class RateLimiter {
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
    startCleanup();
  }

  /**
   * Consume one request for the given key.
   * Returns whether the request is allowed and metadata for response headers.
   */
  consume(key: string): RateLimiterResult {
    const now = Date.now();
    const { maxRequests, windowMs } = this.config;
    const entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
      // New window
      const resetAt = now + windowMs;
      store.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt,
        retryAfter: 0,
      };
    }

    if (entry.count >= maxRequests) {
      // Rate limited
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter,
      };
    }

    // Increment within window
    entry.count += 1;
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
      retryAfter: 0,
    };
  }

  /**
   * Reset the rate limit for a specific key.
   */
  reset(key: string): void {
    store.delete(key);
  }

  /**
   * Reset all rate limits (useful for testing).
   */
  resetAll(): void {
    store.clear();
  }
}

/**
 * Pre-configured rate limiters for different use cases.
 */
export const rateLimiters = {
  /** Auth endpoints: 5 requests per 15 minutes (brute-force protection). */
  auth: new RateLimiter({ maxRequests: 5, windowMs: 15 * 60 * 1000 }),

  /** API routes (general): 30 requests per minute. */
  api: new RateLimiter({ maxRequests: 30, windowMs: 60 * 1000 }),

  /** Ticker search: 60 requests per minute (user typing). */
  search: new RateLimiter({ maxRequests: 60, windowMs: 60 * 1000 }),

  /** Server actions (transactions, accounts): 20 requests per minute. */
  serverAction: new RateLimiter({ maxRequests: 20, windowMs: 60 * 1000 }),

  /** TrueLayer connect: 3 requests per 10 minutes. */
  truelayer: new RateLimiter({ maxRequests: 3, windowMs: 10 * 60 * 1000 }),

  /** Chat (AI): 10 requests per minute. */
  chat: new RateLimiter({ maxRequests: 10, windowMs: 60 * 1000 }),

  /** Portfolio AI analysis: 5 requests per 10 minutes. */
  portfolioAnalysis: new RateLimiter({ maxRequests: 5, windowMs: 10 * 60 * 1000 }),

  /** Dashboard layout save/delete: 20 requests per minute. */
  dashboardLayout: new RateLimiter({ maxRequests: 20, windowMs: 60 * 1000 }),
};
