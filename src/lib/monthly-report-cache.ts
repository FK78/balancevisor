import { getCached, setCached, cacheKey, invalidateCached } from "@/lib/cache";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const PREFIX = "monthly-report";

function makeKey(userId: string, monthsAgo: number): string {
  return cacheKey(PREFIX, userId, monthsAgo);
}

export function getCachedReport(userId: string, monthsAgo: number): string | undefined {
  return getCached<string>(makeKey(userId, monthsAgo));
}

export function setCachedReport(userId: string, monthsAgo: number, markdown: string): void {
  setCached(makeKey(userId, monthsAgo), markdown, {
    ttlMs: CACHE_TTL_MS,
    tags: [`user:${userId}`],
  });
}

export function invalidateCachedReport(userId: string, monthsAgo: number): void {
  invalidateCached(makeKey(userId, monthsAgo));
}
