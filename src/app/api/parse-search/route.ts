import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getCategoriesByUser } from "@/db/queries/categories";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { toDateString } from "@/lib/date";
import { rateLimiters } from "@/lib/rate-limiter";

const searchFiltersSchema = z.object({
  search: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  accountId: z.string().nullable(),
});

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.serverAction.consume(`parse-search:${userId}`);
  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return Response.json({ error: "Missing query" }, { status: 400 });
  }

  const [accounts, categories] = await Promise.all([
    getAccountsWithDetails(userId),
    getCategoriesByUser(userId),
  ]);

  const accountList = accounts.map((a) => `- id: "${a.id}" → ${a.accountName} (${a.type})`).join("\n");
  const categoryList = categories.map((c) => `- "${c.name}"`).join("\n");

  const today = toDateString(new Date());

  const { text: responseText } = await generateText({
    model: groq("openai/gpt-oss-20b"),
    prompt: `You are a search query parser for a personal finance app. Parse the user's natural language search into structured filters.

Return ONLY a JSON object with these fields:
- search: string or null — keyword to search in descriptions/categories (e.g. "groceries", "Netflix")
- startDate: string or null — YYYY-MM-DD format start date
- endDate: string or null — YYYY-MM-DD format end date
- accountId: string or null — matched account ID from the list

Today's date: ${today}

User's accounts:
${accountList}

User's categories:
${categoryList}

Interpret relative dates:
- "this month" = first day of current month to today
- "last month" = first to last day of previous month
- "this week" = Monday of current week to today
- "last week" = previous Monday to Sunday
- "yesterday" = yesterday's date for both start and end
- "today" = today for both start and end

For category-based queries like "food purchases" or "entertainment spending", put the category name in the search field.
For amount-based queries like "over £50", include the relevant keyword in search (best effort — exact amount filtering is not supported).

User query: "${query}"

Respond with ONLY the JSON object, no other text.`,
    maxOutputTokens: 200,
  });

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "Could not parse search query" }, { status: 422 });
  }

  const parsed = searchFiltersSchema.safeParse(JSON.parse(jsonMatch[0]));
  if (!parsed.success) {
    return Response.json({ error: "Could not parse search query" }, { status: 422 });
  }

  const filters = parsed.data;

  // Validate accountId exists
  if (filters.accountId) {
    const valid = accounts.some((a) => a.id === filters.accountId);
    if (!valid) filters.accountId = null;
  }

  return Response.json(filters);
}
