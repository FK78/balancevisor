import { describe, it, expect, beforeEach } from "vitest";
import { RateLimiter } from "@/lib/rate-limiter";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ maxRequests: 3, windowMs: 60_000 });
    limiter.resetAll();
  });

  it("allows requests within the limit", () => {
    const r1 = limiter.consume("user1");
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
  });

  it("tracks remaining correctly", () => {
    limiter.consume("user1");
    const r2 = limiter.consume("user1");
    expect(r2.remaining).toBe(1);

    const r3 = limiter.consume("user1");
    expect(r3.remaining).toBe(0);
  });

  it("blocks after exceeding limit", () => {
    limiter.consume("user1");
    limiter.consume("user1");
    limiter.consume("user1");

    const r4 = limiter.consume("user1");
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.retryAfter).toBeGreaterThan(0);
  });

  it("tracks different keys independently", () => {
    limiter.consume("user1");
    limiter.consume("user1");
    limiter.consume("user1");

    const r = limiter.consume("user2");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("provides resetAt timestamp", () => {
    const r = limiter.consume("user1");
    expect(r.resetAt).toBeGreaterThan(Date.now());
  });

  it("retryAfter is 0 when allowed", () => {
    const r = limiter.consume("user1");
    expect(r.retryAfter).toBe(0);
  });

  describe("reset()", () => {
    it("resets limit for a specific key", () => {
      limiter.consume("user1");
      limiter.consume("user1");
      limiter.consume("user1");

      limiter.reset("user1");

      const r = limiter.consume("user1");
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(2);
    });
  });

  describe("resetAll()", () => {
    it("resets all keys", () => {
      limiter.consume("user1");
      limiter.consume("user2");

      limiter.resetAll();

      const r1 = limiter.consume("user1");
      const r2 = limiter.consume("user2");
      expect(r1.remaining).toBe(2);
      expect(r2.remaining).toBe(2);
    });
  });
});
