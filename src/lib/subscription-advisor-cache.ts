import { getCached, setCached, cacheKey, invalidateCached } from "@/lib/cache";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const PREFIX = "subscription-advisor";

function makeKey(userId: string): string {
  return cacheKey(PREFIX, userId);
}

export function getCachedSubscriptionAdvice(userId: string): string | undefined {
  return getCached<string>(makeKey(userId));
}

export function setCachedSubscriptionAdvice(userId: string, markdown: string): void {
  setCached(makeKey(userId), markdown, {
    ttlMs: CACHE_TTL_MS,
    tags: [`user:${userId}`],
  });
}

export function invalidateCachedSubscriptionAdvice(userId: string): void {
  invalidateCached(makeKey(userId));
}
