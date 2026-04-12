/**
 * V1 API route handler wrapper.
 *
 * Combines Bearer token authentication, rate limiting, and error handling
 * into a single composable wrapper for /api/v1/* routes.
 *
 * Usage:
 *   export const GET = v1Handler(async ({ userId, user, req, params }) => {
 *     const data = await getAccounts(userId);
 *     return NextResponse.json({ data });
 *   });
 */

import { NextResponse } from "next/server";
import { authenticateV1Request } from "@/lib/api-v1-auth";
import { handleApiError, apiErrorResponse } from "@/lib/api-errors";
import type { RateLimiter } from "@/lib/rate-limiter";
import { rateLimiters } from "@/lib/rate-limiter";
import type { CurrentUserIdentity } from "@/lib/auth";
import { logger } from "@/lib/logger";

export interface V1HandlerContext {
  readonly userId: string;
  readonly user: CurrentUserIdentity;
  readonly req: Request;
  readonly params: Record<string, string>;
  readonly searchParams: URLSearchParams;
}

type V1HandlerFn = (ctx: V1HandlerContext) => Promise<NextResponse | Response>;

interface V1HandlerOptions {
  /** Rate limiter to apply. Defaults to rateLimiters.api. */
  readonly limiter?: RateLimiter;
  /** Custom rate limit key prefix. Defaults to the route path. */
  readonly rateLimitKeyPrefix?: string;
}

/**
 * Wrap a v1 API route handler with auth, rate limiting, and error handling.
 */
export function v1Handler(
  handler: V1HandlerFn,
  options: V1HandlerOptions = {},
) {
  const limiter = options.limiter ?? rateLimiters.api;

  return async (
    req: Request,
    context?: { params?: Promise<Record<string, string>> },
  ): Promise<NextResponse | Response> => {
    try {
      // 1. Authenticate
      const authResult = await authenticateV1Request(req);
      if (!authResult.ok) {
        return apiErrorResponse(authResult.message, authResult.status);
      }

      const { user } = authResult;

      // 2. Rate limit
      const url = new URL(req.url);
      const rateLimitKey = `v1:${options.rateLimitKeyPrefix ?? url.pathname}:${user.id}`;
      const rlResult = limiter.consume(rateLimitKey);

      if (!rlResult.allowed) {
        return apiErrorResponse("Rate limit exceeded. Please try again later.", 429, {
          headers: { "Retry-After": String(rlResult.retryAfter) },
        });
      }

      // 3. Resolve dynamic params
      const params = context?.params ? await context.params : {};
      const searchParams = url.searchParams;

      // 4. Execute handler
      const response = await handler({
        userId: user.id,
        user,
        req,
        params,
        searchParams,
      });

      // Add rate limit headers
      if (response instanceof NextResponse) {
        response.headers.set("X-RateLimit-Remaining", String(rlResult.remaining));
        response.headers.set("X-RateLimit-Reset", String(rlResult.resetAt));
      }

      return response;
    } catch (error) {
      logger.error("v1-api", "Unhandled error in v1 handler", { error });
      return handleApiError(error);
    }
  };
}

// ─── Response helpers ───────────────────────────────────────────────────────

/** Standard paginated list response. */
export function paginatedResponse<T>(
  data: readonly T[],
  total: number,
  page: number,
  limit: number,
): NextResponse {
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
}

/** Standard success response with data. */
export function dataResponse<T>(data: T): NextResponse {
  return NextResponse.json({ data });
}

/** Standard success response for mutations. */
export function mutationResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

/** Parse pagination params with defaults. */
export function parsePagination(searchParams: URLSearchParams): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
