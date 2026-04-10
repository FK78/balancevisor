import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { rateLimiters } from "@/lib/rate-limiter";
import type { SpendingPattern } from "@/lib/spending-patterns";
import { z } from "zod";
import { parseJsonBody } from "@/lib/api-errors";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// AI copy generation for funny milestone cards
// ---------------------------------------------------------------------------

const requestBodySchema = z.object({
  patterns: z.array(z.object({
    type: z.string(),
    label: z.string(),
    total: z.number(),
    count: z.number(),
  }).passthrough()).min(1, "At least one pattern is required"),
  currency: z.string().min(1).max(10).default("GBP"),
});

interface FunnyCopy {
  title: string;
  subtitle: string;
  stat: string;
  detail: string | null;
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.funnyMilestones.consume(`funny-milestones:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before refreshing milestones." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const body = await parseJsonBody(req, requestBodySchema);
  if (body instanceof NextResponse) return body;

  const patterns = body.patterns as unknown as SpendingPattern[];
  const patternsJson = JSON.stringify(patterns);
  const currency = body.currency;

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are a witty financial roast master for BalanceVisor. Given spending patterns, write a shareable milestone card for each.

Return ONLY a JSON array (no markdown fences) with one object per pattern:
[{ "title": "...", "subtitle": "...", "stat": "...", "detail": "..." }]

Rules:
- title: ≤40 chars, catchy, funny headline (e.g. "Deliveroo's Favourite Customer")
- subtitle: ≤60 chars, one-liner observation
- stat: short punchy number or label (e.g. "47 orders", "£812", "23%")
- detail: optional extra quip or null
- Be funny but not mean or judgmental
- Use ${currency} for money references
- Use emojis sparingly (max 1 per field)
- Match the array order to the input patterns`,
    prompt: `Generate funny milestone cards for these spending patterns:\n${patternsJson}`,
    maxOutputTokens: 600,
  });

  // Parse and validate AI response
  let parsed: FunnyCopy[];
  try {
    // Strip markdown fences if the model wraps them
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error("Not an array");
    parsed = parsed.slice(0, patterns.length).map((item) => ({
      title: String(item.title ?? "").slice(0, 50),
      subtitle: String(item.subtitle ?? "").slice(0, 80),
      stat: String(item.stat ?? "").slice(0, 20),
      detail: item.detail ? String(item.detail).slice(0, 100) : null,
    }));
  } catch {
    return new Response(
      JSON.stringify({ error: "AI returned invalid response. Try again." }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
