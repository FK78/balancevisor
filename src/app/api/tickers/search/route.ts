import { searchTickers } from "@/db/queries/investments";
import { NextResponse } from "next/server";
import { rateLimiters } from "@/lib/rate-limiter";

export async function GET(req: Request) {
  // Rate limit by IP address
  const ip = (req as Request & { ip?: string }).ip ?? "unknown";
  const result = rateLimiters.search.consume(`ticker-search:${ip}`);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
    );
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchTickers(query);
    const response = NextResponse.json(results ?? []);
    // Add rate limit headers
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.resetAt));
    return response;
  } catch (error) {
    console.error("Error searching tickers:", error);
    return NextResponse.json({ error: "Failed to search tickers" }, { status: 500 });
  }
}
