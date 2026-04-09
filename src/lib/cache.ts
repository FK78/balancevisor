/**
 * Enhanced cache layer with typed entries and tag-based invalidation.
 *
 * Features:
 * - Type-safe cache operations
 * - Tag-based invalidation (e.g., invalidate all caches for a user)
 * - Per-entry TTL support
 * - O(1) tag lookups via index
 */

import { TtlMap } from '@/lib/ttl-map';

type CacheKey = string;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  tags: Set<string>;
};

// Main cache store
const cache = new TtlMap<CacheKey, CacheEntry<unknown>>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes default
  updateAgeOnGet: true,
});

// Tag index for O(1) invalidation by tag
const tagIndex = new Map<string, Set<CacheKey>>();

function addToTagIndex(key: CacheKey, tags: string[]): void {
  for (const tag of tags) {
    if (!tagIndex.has(tag)) {
      tagIndex.set(tag, new Set());
    }
    tagIndex.get(tag)!.add(key);
  }
}

function removeFromTagIndex(key: CacheKey): void {
  const entry = cache.get(key) as CacheEntry<unknown> | undefined;
  if (entry) {
    for (const tag of entry.tags) {
      tagIndex.get(tag)?.delete(key);
    }
  }
}

/**
 * Retrieve a cached value by key.
 * Returns undefined if not found or expired.
 */
export function getCached<T>(key: CacheKey): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * Store a value in the cache with optional TTL and tags.
 *
 * @param key - Cache key
 * @param value - Value to cache
 * @param options - Optional TTL and tags
 */
export function setCached<T>(
  key: CacheKey,
  value: T,
  options?: { ttlMs?: number; tags?: string[] }
): void {
  const ttlMs = options?.ttlMs ?? 1000 * 60 * 5;
  const tags = options?.tags ?? [];

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    tags: new Set(tags),
  });

  if (tags.length > 0) {
    addToTagIndex(key, tags);
  }
}

/**
 * Remove a cached entry by key.
 */
export function invalidateCached(key: CacheKey): void {
  removeFromTagIndex(key);
  cache.delete(key);
}

/**
 * Invalidate all cache entries with a specific tag.
 * This is O(n) where n is the number of keys with that tag,
 * but much faster than iterating all keys.
 */
export function invalidateByTag(tag: string): void {
  const keys = tagIndex.get(tag);
  if (!keys) return;

  for (const key of keys) {
    cache.delete(key);
  }
  tagIndex.delete(tag);
}

/**
 * Invalidate all cache entries for a specific user.
 * Uses the "user:{userId}" tag pattern.
 */
export function invalidateByUser(userId: string): void {
  invalidateByTag(`user:${userId}`);
}

/**
 * Generate a cache key with automatic user tag.
 */
export function cacheKey(prefix: string, userId?: string, ...args: unknown[]): CacheKey {
  const argString = JSON.stringify(args, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  );
  return `${prefix}:${userId ?? ''}:${argString}`;
}

/**
 * Clear the entire cache (use sparingly).
 */
export function clearCache(): void {
  cache.clear();
  tagIndex.clear();
}

/**
 * Get cache statistics for debugging.
 */
export function getCacheStats(): { size: number; tags: number } {
  return {
    size: cache.size,
    tags: tagIndex.size,
  };
}