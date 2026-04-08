import { getCached, setCached, cacheKey, invalidateCached } from "@/lib/cache";

const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const PREFIX = "weekly-digest";

function makeKey(userId: string): string {
  return cacheKey(PREFIX, userId);
}

export function getCachedDigest(userId: string): string | undefined {
  return getCached<string>(makeKey(userId));
}

export function setCachedDigest(userId: string, markdown: string): void {
  setCached(makeKey(userId), markdown, {
    ttlMs: CACHE_TTL_MS,
    tags: [`user:${userId}`],
  });
}

export function invalidateCachedDigest(userId: string): void {
  invalidateCached(makeKey(userId));
}
