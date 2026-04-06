/**
 * API response helpers for consistent error handling across API routes.
 *
 * All API routes should use these helpers to ensure consistent response formats.
 */

import { NextResponse } from "next/server";
import { AppError, errorToJson } from "@/lib/errors";

/**
 * Create a standardized API error response.
 */
export function apiErrorResponse(
  message: string,
  status: number,
  options?: {
    code?: string;
    headers?: Record<string, string>;
    details?: Record<string, unknown>;
  }
): NextResponse {
  const body: Record<string, unknown> = {
    error: message,
    status,
  };

  if (options?.code) {
    body.code = options.code;
  }

  if (options?.details) {
    body.details = options.details;
  }

  return NextResponse.json(body, {
    status,
    headers: options?.headers,
  });
}

/**
 * Create a 400 Bad Request response.
 */
export function badRequest(message: string, options?: { code?: string; headers?: Record<string, string> }): NextResponse {
  return apiErrorResponse(message, 400, options);
}

/**
 * Create a 401 Unauthorized response.
 */
export function unauthorized(message: string = "Unauthorized"): NextResponse {
  return apiErrorResponse(message, 401);
}

/**
 * Create a 403 Forbidden response.
 */
export function forbidden(message: string = "Forbidden"): NextResponse {
  return apiErrorResponse(message, 403);
}

/**
 * Create a 404 Not Found response.
 */
export function notFound(message: string = "Resource not found"): NextResponse {
  return apiErrorResponse(message, 404);
}

/**
 * Create a 409 Conflict response.
 */
export function conflict(message: string): NextResponse {
  return apiErrorResponse(message, 409);
}

/**
 * Create a 429 Too Many Requests response.
 */
export function rateLimited(retryAfter: number): NextResponse {
  return apiErrorResponse(
    "Rate limit exceeded. Please try again later.",
    429,
    {
      headers: {
        "Retry-After": String(retryAfter),
      },
    }
  );
}

/**
 * Create a 500 Internal Server Error response.
 */
export function serverError(message: string = "Internal server error"): NextResponse {
  return apiErrorResponse(message, 500);
}

/**
 * Create a 502 Bad Gateway response (for external service failures).
 */
export function badGateway(service: string): NextResponse {
  return apiErrorResponse(`External service error: ${service}`, 502);
}

/**
 * Handle any error and return an appropriate API response.
 * Use this in catch blocks for consistent error handling.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return apiErrorResponse(error.message, error.statusCode, {
      code: error.code,
      details: error.details,
    });
  }

  if (error instanceof Error) {
    // Log the full error in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[API Error] ${error.name}: ${error.message}`);
      console.error(error.stack);
    }
    return serverError(error.message);
  }

  return serverError("An unexpected error occurred");
}

/**
 * Create a standardized API success response.
 */
export function successResponse<T>(data: T, options?: { headers?: Record<string, string> }): NextResponse {
  return NextResponse.json({ success: true, data }, { headers: options?.headers });
}
