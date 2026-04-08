import { getCached, setCached, cacheKey, invalidateCached } from "@/lib/cache";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const PREFIX = "account-health";

function makeKey(userId: string): string {
  return cacheKey(PREFIX, userId);
}

export function getCachedAccountHealth(userId: string): string | undefined {
  return getCached<string>(makeKey(userId));
}

export function setCachedAccountHealth(userId: string, markdown: string): void {
  setCached(makeKey(userId), markdown, {
    ttlMs: CACHE_TTL_MS,
    tags: [`user:${userId}`],
  });
}

export function invalidateCachedAccountHealth(userId: string): void {
  invalidateCached(makeKey(userId));
}
