import { LRUCache } from 'lru-cache';

type CacheKey = string;

// Using `any` because lru-cache expects a value type that satisfies `{}`
const cache = new LRUCache<CacheKey, any>({ // eslint-disable-line @typescript-eslint/no-explicit-any
  max: 100, // maximum number of items
  ttl: 1000 * 60 * 5, // 5 minutes in milliseconds
});

/**
 * Retrieve a cached value by key.
 * Returns undefined if not found or expired.
 */
export function getCached<T>(key: CacheKey): T | undefined {
  return cache.get(key) as T | undefined;
}

/**
 * Store a value in the cache with the given key.
 */
export function setCached<T>(key: CacheKey, value: T): void {
  cache.set(key, value);
}

/**
 * Remove a cached entry by key.
 */
export function invalidateCached(key: CacheKey): void {
  cache.delete(key);
}

/**
 * Invalidate all cache entries for a specific user.
 * This iterates over all keys and removes those containing the user ID.
 * Use sparingly as iteration is O(n).
 */
export function invalidateByUser(userId: string): void {
  for (const key of cache.keys()) {
    if (key.includes(userId)) {
      cache.delete(key);
    }
  }
}

/**
 * Generate a cache key for a query function and its arguments.
 * Uses JSON.stringify for simplicity; ensure arguments are serializable.
 */
export function cacheKey(prefix: string, ...args: unknown[]): CacheKey {
  const argString = JSON.stringify(args, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  );
  return `${prefix}:${argString}`;
}

/**
 * Clear the entire cache (use sparingly).
 */
export function clearCache(): void {
  cache.clear();
}