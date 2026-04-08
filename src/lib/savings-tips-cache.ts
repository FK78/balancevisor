import { getCached, setCached, cacheKey, invalidateCached } from "@/lib/cache";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const PREFIX = "savings-tips";

function makeKey(userId: string): string {
  return cacheKey(PREFIX, userId);
}

export function getCachedSavingsTips(userId: string): string | undefined {
  return getCached<string>(makeKey(userId));
}

export function setCachedSavingsTips(userId: string, markdown: string): void {
  setCached(makeKey(userId), markdown, {
    ttlMs: CACHE_TTL_MS,
    tags: [`user:${userId}`],
  });
}

export function invalidateCachedSavingsTips(userId: string): void {
  invalidateCached(makeKey(userId));
}
