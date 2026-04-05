/**
 * API middleware for rate limiting and other common concerns.
 *
 * Usage:
 *   export const GET = withRateLimit(
 *     async (req) => { /* handler logic *\/ },
 *     rateLimiters.search,
 *     (req) => req.ip ?? "unknown"
 *   );
 */

import { NextResponse } from "next/server";
import type { RateLimiter } from "@/lib/rate-limiter";
import { rateLimited } from "@/lib/api-errors";

/**
 * Wrap an API route handler with rate limiting.
 *
 * @param handler - The route handler function
 * @param limiter - The rate limiter instance to use
 * @param keyExtractor - Function to extract the rate limit key from the request
 * @returns A wrapped handler with rate limiting applied
 */
export function withRateLimit(
  handler: (req: Request) => Promise<NextResponse>,
  limiter: RateLimiter,
  keyExtractor: (req: Request) => string
) {
  return async (req: Request): Promise<NextResponse> => {
    const key = keyExtractor(req);
    const result = limiter.consume(key);

    if (!result.allowed) {
      return rateLimited(result.retryAfter);
    }

    const response = await handler(req);

    // Add rate limit headers to successful responses
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.resetAt));

    return response;
  };
}

/**
 * Extract the client IP from a request.
 * Works with Vercel, Cloudflare, and standard Node.js.
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;

  // Vercel
  const vercelIp = headers.get("x-vercel-forwarded-for")
    ?? headers.get("x-real-ip");
  if (vercelIp) return vercelIp;

  // Cloudflare
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  // Standard
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
}
