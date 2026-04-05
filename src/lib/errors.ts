/**
 * Typed error hierarchy for the BalanceVisor application.
 *
 * Using typed errors instead of plain Error objects enables:
 * - Consistent error handling across the app
 * - Type-safe error catching
 * - Better debugging and logging
 * - Proper HTTP status code mapping
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(resource: string = "resource") {
    super(
      `Unauthorized: You do not have access to this ${resource}`,
      "UNAUTHORIZED",
      403
    );
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super(
      "Rate limit exceeded. Please try again later.",
      "RATE_LIMITED",
      429,
      { retryAfter }
    );
    this.name = "RateLimitError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message ?? `External service error: ${service}`,
      "EXTERNAL_SERVICE_ERROR",
      502,
      { service }
    );
    this.name = "ExternalServiceError";
  }
}

/**
 * Type guard for AppError instances.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert an error to a JSON-serializable object for API responses.
 */
export function errorToJson(error: Error): { message: string; code?: string; statusCode?: number } {
  if (isAppError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }
  return {
    message: error.message || "An unexpected error occurred",
  };
}
