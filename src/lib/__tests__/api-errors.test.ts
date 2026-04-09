import { describe, it, expect } from "vitest";
import {
  apiErrorResponse,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  rateLimited,
  serverError,
  badGateway,
} from "@/lib/api-errors";

async function parseBody(response: Response) {
  return response.json();
}

describe("apiErrorResponse", () => {
  it("creates JSON response with correct status", async () => {
    const res = apiErrorResponse("test error", 400);
    expect(res.status).toBe(400);

    const body = await parseBody(res);
    expect(body.error).toBe("test error");
    expect(body.status).toBe(400);
  });

  it("includes optional code", async () => {
    const res = apiErrorResponse("error", 400, { code: "INVALID" });
    const body = await parseBody(res);
    expect(body.code).toBe("INVALID");
  });

  it("includes optional details", async () => {
    const res = apiErrorResponse("error", 400, { details: { field: "email" } });
    const body = await parseBody(res);
    expect(body.details).toEqual({ field: "email" });
  });

  it("includes custom headers", () => {
    const res = apiErrorResponse("error", 429, {
      headers: { "Retry-After": "30" },
    });
    expect(res.headers.get("Retry-After")).toBe("30");
  });
});

describe("badRequest", () => {
  it("returns 400", () => {
    const res = badRequest("invalid input");
    expect(res.status).toBe(400);
  });
});

describe("unauthorized", () => {
  it("returns 401 with default message", async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    const body = await parseBody(res);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 with custom message", async () => {
    const res = unauthorized("Token expired");
    const body = await parseBody(res);
    expect(body.error).toBe("Token expired");
  });
});

describe("forbidden", () => {
  it("returns 403", () => {
    expect(forbidden().status).toBe(403);
  });
});

describe("notFound", () => {
  it("returns 404 with default message", async () => {
    const res = notFound();
    expect(res.status).toBe(404);
    const body = await parseBody(res);
    expect(body.error).toBe("Resource not found");
  });
});

describe("conflict", () => {
  it("returns 409", () => {
    expect(conflict("Already exists").status).toBe(409);
  });
});

describe("rateLimited", () => {
  it("returns 429 with Retry-After header", () => {
    const res = rateLimited(60);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });
});

describe("serverError", () => {
  it("returns 500 with default message", async () => {
    const res = serverError();
    expect(res.status).toBe(500);
    const body = await parseBody(res);
    expect(body.error).toBe("Internal server error");
  });
});

describe("badGateway", () => {
  it("returns 502 with service name", async () => {
    const res = badGateway("Trading212");
    expect(res.status).toBe(502);
    const body = await parseBody(res);
    expect(body.error).toContain("Trading212");
  });
});
