import { searchTickers } from "@/db/queries/investments";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchTickers(query);
    return NextResponse.json(results ?? []);
  } catch (error) {
    console.error("Error searching tickers:", error);
    return NextResponse.json({ error: "Failed to search tickers" }, { status: 500 });
  }
}
