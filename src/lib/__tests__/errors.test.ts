import { describe, it, expect } from "vitest";
import {
  AppError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  isAppError,
  errorToJson,
} from "@/lib/errors";

describe("AppError", () => {
  it("creates error with message, code, and status", () => {
    const err = new AppError("test", "TEST_CODE", 400);
    expect(err.message).toBe("test");
    expect(err.code).toBe("TEST_CODE");
    expect(err.statusCode).toBe(400);
    expect(err.name).toBe("AppError");
  });

  it("defaults statusCode to 500", () => {
    const err = new AppError("test", "TEST_CODE");
    expect(err.statusCode).toBe(500);
  });

  it("includes optional details", () => {
    const err = new AppError("test", "TEST_CODE", 400, { field: "name" });
    expect(err.details).toEqual({ field: "name" });
  });

  it("is an instance of Error", () => {
    const err = new AppError("test", "CODE");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("UnauthorizedError", () => {
  it("creates 403 error with resource name", () => {
    const err = new UnauthorizedError("account");
    expect(err.message).toContain("account");
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("uses default resource name", () => {
    const err = new UnauthorizedError();
    expect(err.message).toContain("resource");
  });
});

describe("NotFoundError", () => {
  it("creates 404 error", () => {
    const err = new NotFoundError("Account");
    expect(err.message).toBe("Account not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });
});

describe("ValidationError", () => {
  it("creates 400 error with details", () => {
    const err = new ValidationError("Invalid input", { field: "email" });
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual({ field: "email" });
  });
});

describe("ConflictError", () => {
  it("creates 409 error", () => {
    const err = new ConflictError("Already exists");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });
});

describe("RateLimitError", () => {
  it("creates 429 error with retryAfter", () => {
    const err = new RateLimitError(30);
    expect(err.statusCode).toBe(429);
    expect(err.details?.retryAfter).toBe(30);
  });
});

describe("ExternalServiceError", () => {
  it("creates 502 error with service name", () => {
    const err = new ExternalServiceError("Trading212");
    expect(err.statusCode).toBe(502);
    expect(err.message).toContain("Trading212");
    expect(err.details?.service).toBe("Trading212");
  });

  it("accepts custom message", () => {
    const err = new ExternalServiceError("API", "Timeout");
    expect(err.message).toBe("Timeout");
  });
});

describe("isAppError", () => {
  it("returns true for AppError instances", () => {
    expect(isAppError(new AppError("test", "CODE"))).toBe(true);
    expect(isAppError(new ValidationError("test"))).toBe(true);
  });

  it("returns false for plain Error", () => {
    expect(isAppError(new Error("test"))).toBe(false);
  });

  it("returns false for non-errors", () => {
    expect(isAppError("string")).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});

describe("errorToJson", () => {
  it("serializes AppError with code and statusCode", () => {
    const err = new ValidationError("Bad input");
    const json = errorToJson(err);
    expect(json.message).toBe("Bad input");
    expect(json.code).toBe("VALIDATION_ERROR");
    expect(json.statusCode).toBe(400);
  });

  it("serializes plain Error without code", () => {
    const err = new Error("something broke");
    const json = errorToJson(err);
    expect(json.message).toBe("something broke");
    expect(json.code).toBeUndefined();
  });

  it("provides default message for empty Error", () => {
    const err = new Error();
    const json = errorToJson(err);
    expect(json.message).toBe("An unexpected error occurred");
  });
});
