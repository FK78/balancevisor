import { getCached, setCached, cacheKey, invalidateCached } from "@/lib/cache";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const PREFIX = "portfolio-analysis";

function makeKey(userId: string): string {
  return cacheKey(PREFIX, userId);
}

export function getCachedAnalysis(userId: string): string | undefined {
  return getCached<string>(makeKey(userId));
}

export function setCachedAnalysis(userId: string, markdown: string): void {
  setCached(makeKey(userId), markdown, {
    ttlMs: CACHE_TTL_MS,
    tags: [`user:${userId}`],
  });
}

export function invalidateCachedAnalysis(userId: string): void {
  invalidateCached(makeKey(userId));
}
