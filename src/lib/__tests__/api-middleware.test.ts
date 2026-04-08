import { describe, it, expect, vi, beforeEach } from "vitest";
import { withRateLimit, getClientIp } from "@/lib/api-middleware";
import { RateLimiter } from "@/lib/rate-limiter";
import { NextResponse } from "next/server";

function makeRequest(
  url = "http://localhost:3000/api/test",
  headers: Record<string, string> = {},
): Request {
  return new Request(url, { headers });
}

describe("getClientIp", () => {
  it("extracts Vercel forwarded IP", () => {
    const req = makeRequest("http://localhost", {
      "x-vercel-forwarded-for": "1.2.3.4",
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("extracts x-real-ip", () => {
    const req = makeRequest("http://localhost", {
      "x-real-ip": "5.6.7.8",
    });
    expect(getClientIp(req)).toBe("5.6.7.8");
  });

  it("extracts Cloudflare IP", () => {
    const req = makeRequest("http://localhost", {
      "cf-connecting-ip": "9.10.11.12",
    });
    expect(getClientIp(req)).toBe("9.10.11.12");
  });

  it("extracts first IP from x-forwarded-for", () => {
    const req = makeRequest("http://localhost", {
      "x-forwarded-for": "1.1.1.1, 2.2.2.2, 3.3.3.3",
    });
    expect(getClientIp(req)).toBe("1.1.1.1");
  });

  it('returns "unknown" when no IP headers present', () => {
    const req = makeRequest("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });

  it("prioritises Vercel over Cloudflare", () => {
    const req = makeRequest("http://localhost", {
      "x-vercel-forwarded-for": "1.2.3.4",
      "cf-connecting-ip": "5.6.7.8",
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });
});

describe("withRateLimit", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ maxRequests: 2, windowMs: 60_000 });
    limiter.resetAll();
  });

  it("passes through to handler when under limit", async () => {
    const handler = vi.fn(async () =>
      NextResponse.json({ ok: true }),
    );

    const wrapped = withRateLimit(handler, limiter, () => "key1");
    const res = await wrapped(makeRequest());

    expect(handler).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("1");
  });

  it("returns 429 when rate limited", async () => {
    const handler = vi.fn(async () => NextResponse.json({ ok: true }));
    const wrapped = withRateLimit(handler, limiter, () => "key1");

    await wrapped(makeRequest());
    await wrapped(makeRequest());
    const res = await wrapped(makeRequest());

    expect(res.status).toBe(429);
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
