import type { Milestone } from "@/lib/milestones";

// ---------------------------------------------------------------------------
// In-memory cache for funny milestones (24-hour TTL)
// Same pattern used across other AI features.
// ---------------------------------------------------------------------------

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  readonly milestones: readonly Milestone[];
  readonly expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function getCachedFunnyMilestones(userId: string): readonly Milestone[] | null {
  const entry = cache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(userId);
    return null;
  }
  return entry.milestones;
}

export function setCachedFunnyMilestones(userId: string, milestones: readonly Milestone[]): void {
  cache.set(userId, { milestones, expiresAt: Date.now() + TTL_MS });
}

export function clearFunnyMilestonesCache(userId: string): void {
  cache.delete(userId);
}
