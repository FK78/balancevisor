import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getCached,
  setCached,
  invalidateCached,
  invalidateByTag,
  invalidateByUser,
  cacheKey,
  clearCache,
  getCacheStats,
} from "@/lib/cache";

describe("cache", () => {
  beforeEach(() => {
    clearCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("setCached / getCached", () => {
    it("stores and retrieves a value", () => {
      setCached("key1", { data: 42 });
      expect(getCached<{ data: number }>("key1")).toEqual({ data: 42 });
    });

    it("returns undefined for missing key", () => {
      expect(getCached("nonexistent")).toBeUndefined();
    });

    it("respects TTL expiry", () => {
      vi.useFakeTimers();
      setCached("key1", "value", { ttlMs: 1000 });

      vi.advanceTimersByTime(500);
      expect(getCached("key1")).toBe("value");

      vi.advanceTimersByTime(600);
      expect(getCached("key1")).toBeUndefined();
    });

    it("uses default TTL of 5 minutes", () => {
      vi.useFakeTimers();
      setCached("key1", "value");

      vi.advanceTimersByTime(4 * 60 * 1000);
      expect(getCached("key1")).toBe("value");

      vi.advanceTimersByTime(2 * 60 * 1000);
      expect(getCached("key1")).toBeUndefined();
    });
  });

  describe("invalidateCached", () => {
    it("removes a specific key", () => {
      setCached("key1", "value");
      invalidateCached("key1");
      expect(getCached("key1")).toBeUndefined();
    });
  });

  describe("invalidateByTag", () => {
    it("removes all entries with a given tag", () => {
      setCached("a", 1, { tags: ["user:123"] });
      setCached("b", 2, { tags: ["user:123"] });
      setCached("c", 3, { tags: ["user:456"] });

      invalidateByTag("user:123");

      expect(getCached("a")).toBeUndefined();
      expect(getCached("b")).toBeUndefined();
      expect(getCached("c")).toBe(3);
    });

    it("no-ops for unknown tag", () => {
      setCached("a", 1);
      invalidateByTag("unknown");
      expect(getCached("a")).toBe(1);
    });
  });

  describe("invalidateByUser", () => {
    it("invalidates all entries tagged with user:{id}", () => {
      setCached("k1", "v1", { tags: ["user:abc"] });
      setCached("k2", "v2", { tags: ["user:abc"] });

      invalidateByUser("abc");

      expect(getCached("k1")).toBeUndefined();
      expect(getCached("k2")).toBeUndefined();
    });
  });

  describe("cacheKey", () => {
    it("generates a key with prefix and userId", () => {
      const key = cacheKey("totals", "user123");
      expect(key).toContain("totals");
      expect(key).toContain("user123");
    });

    it("includes extra args in key", () => {
      const k1 = cacheKey("totals", "u1", "income", "2025-01");
      const k2 = cacheKey("totals", "u1", "expense", "2025-01");
      expect(k1).not.toBe(k2);
    });

    it("handles missing userId", () => {
      const key = cacheKey("global");
      expect(key).toContain("global");
    });
  });

  describe("clearCache", () => {
    it("removes all entries", () => {
      setCached("a", 1);
      setCached("b", 2);
      clearCache();
      expect(getCached("a")).toBeUndefined();
      expect(getCached("b")).toBeUndefined();
    });
  });

  describe("getCacheStats", () => {
    it("returns size and tag count", () => {
      setCached("a", 1, { tags: ["t1"] });
      setCached("b", 2, { tags: ["t2"] });

      const stats = getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.tags).toBe(2);
    });
  });
});
