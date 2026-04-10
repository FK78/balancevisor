import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import type { Milestone, FunnyPatternType } from "@/lib/milestones";
import { getRecentTransactionsForPatterns } from "@/db/queries/transactions";
import { detectSpendingPatterns, type SubscriptionInput } from "@/lib/spending-patterns";
import { getCachedFunnyMilestones, setCachedFunnyMilestones } from "@/lib/funny-milestones-cache";
import { isAiEnabled } from "@/db/queries/preferences";
import { env } from "@/lib/env";

// ---------------------------------------------------------------------------
// Server-side orchestrator: detect patterns → AI copy → cache → return
// ---------------------------------------------------------------------------

interface FunnyCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly stat: string;
  readonly detail: string | null;
}

export async function getFunnyMilestones(
  userId: string,
  currency: string,
  subs: SubscriptionInput | null = null,
): Promise<readonly Milestone[]> {
  // 1. Check cache
  const cached = getCachedFunnyMilestones(userId);
  if (cached) return cached;

  // 2. Guard: AI must be enabled and key must exist
  if (!env().GROQ_API_KEY) {
    setCachedFunnyMilestones(userId, []);
    return [];
  }
  const aiEnabled = await isAiEnabled(userId);
  if (!aiEnabled) {
    setCachedFunnyMilestones(userId, []);
    return [];
  }

  // 3. Fetch recent transactions
  const txns = await getRecentTransactionsForPatterns(userId, 90);
  if (txns.length === 0) {
    setCachedFunnyMilestones(userId, []);
    return [];
  }

  // 4. Detect spending patterns
  const patterns = detectSpendingPatterns(txns, subs);
  if (patterns.length === 0) {
    setCachedFunnyMilestones(userId, []);
    return [];
  }

  // 5. Generate AI copy
  let copies: FunnyCopy[];
  try {
    copies = await generateFunnyCopy(patterns, currency);
  } catch {
    // AI failure is non-critical — return empty, don't cache (allow retry)
    return [];
  }

  // 6. Map to Milestone[] — pair each copy with its source pattern type
  const now = new Date().toISOString().split("T")[0];
  const milestones: Milestone[] = copies.map((copy, i) => ({
    kind: "funny" as const,
    title: copy.title,
    subtitle: copy.subtitle,
    stat: copy.stat,
    detail: copy.detail,
    accent: "rose" as const,
    achievedAt: now,
    funnyPattern: (patterns[i]?.type ?? "top_merchant") as FunnyPatternType,
  }));

  // 7. Cache and return
  setCachedFunnyMilestones(userId, milestones);
  return milestones;
}

// ---------------------------------------------------------------------------
// Internal: call Groq directly (avoids HTTP round-trip)
// ---------------------------------------------------------------------------

async function generateFunnyCopy(
  patterns: readonly import("@/lib/spending-patterns").SpendingPattern[],
  currency: string,
): Promise<FunnyCopy[]> {
  const patternsJson = JSON.stringify(patterns);

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

  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("AI response is not an array");

  return parsed.slice(0, patterns.length).map((item: Record<string, unknown>) => ({
    title: String(item.title ?? "").slice(0, 50),
    subtitle: String(item.subtitle ?? "").slice(0, 80),
    stat: String(item.stat ?? "").slice(0, 20),
    detail: item.detail ? String(item.detail).slice(0, 100) : null,
  }));
}
