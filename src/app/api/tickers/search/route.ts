import { searchTickers } from "@/db/queries/investments";
import { NextResponse } from "next/server";
import { withRateLimit, getClientIp } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-errors";
import { rateLimiters } from "@/lib/rate-limiter";
import { getCurrentUserId } from "@/lib/auth";

async function handler(req: Request): Promise<NextResponse> {
  try {
    await getCurrentUserId();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 1) {
      return NextResponse.json([]);
    }

    // Validate query length to prevent abuse
    if (query.length > 100) {
      return NextResponse.json(
        { error: "Query too long. Maximum 100 characters." },
        { status: 400 }
      );
    }

    const results = await searchTickers(query);
    return NextResponse.json(results ?? []);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withRateLimit(
  handler,
  rateLimiters.search,
  (req) => `ticker-search:${getClientIp(req)}`
);
