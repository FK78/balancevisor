import { db } from "@/index";
import { categorisationRulesTable, transactionsTable } from "@/db/schema";
import { eq, desc, and, isNull, inArray } from "drizzle-orm";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { getCategoriesByUser } from "@/db/queries/categories";
import { logger } from "@/lib/logger";

const categoriseSchema = z.object({
  category_id: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

export type CategorisationRule = {
  pattern: string;
  category_id: string | null;
};

/**
 * Fetch all categorisation rules for a user from the database.
 * Call this once and pass the result to matchAgainstRules to avoid
 * N+1 queries when categorising multiple transactions in a loop.
 */
export async function fetchUserRules(
  userId: string,
): Promise<CategorisationRule[]> {
  return db
    .select({
      pattern: categorisationRulesTable.pattern,
      category_id: categorisationRulesTable.category_id,
    })
    .from(categorisationRulesTable)
    .where(eq(categorisationRulesTable.user_id, userId))
    .orderBy(desc(categorisationRulesTable.priority));
}

/**
 * Pure function — matches a description against a pre-fetched rule list.
 * No database calls. Use this inside loops after calling fetchUserRules once.
 * Returns the category_id of the first matching rule, or null if no match.
 */
export function matchAgainstRules(
  rules: CategorisationRule[],
  description: string,
): string | null {
  const descLower = description.toLowerCase();
  for (const rule of rules) {
    if (!rule.category_id) continue;
    if (descLower.includes(rule.pattern.toLowerCase())) {
      return rule.category_id;
    }
  }
  return null;
}

/**
 * Matches a transaction description against the user's categorisation rules.
 * Fetches rules from the DB on every call — use matchAgainstRules in loops.
 * Falls back to AI categorisation if no rule matches and GROQ_API_KEY is set.
 * Returns the category_id of the first matching rule, or null if no match.
 */
export async function matchCategorisationRule(
  userId: string,
  description: string,
): Promise<string | null> {
  const rules = await fetchUserRules(userId);
  const match = matchAgainstRules(rules, description);
  if (match) return match;

  if (process.env.GROQ_API_KEY) {
    return aiCategorise(userId, description);
  }

  return null;
}

/**
 * Uses an LLM to classify a transaction description into one of the user's categories.
 * Returns the category_id or null if uncertain.
 */
async function aiCategorise(
  userId: string,
  description: string,
): Promise<string | null> {
  try {
    const categories = await getCategoriesByUser(userId);
    if (categories.length === 0) return null;

    const categoryList = categories
      .map((c) => `- id: "${c.id}" → ${c.name}`)
      .join("\n");

    const { text: responseText } = await generateText({
      model: groq("openai/gpt-oss-20b"),
      prompt: `You are a financial transaction categoriser. Given a transaction description and a list of categories, pick the single best category.

Transaction: "${description}"

Categories:
${categoryList}

Return ONLY a JSON object with these exact fields:
- category_id: the id string of the best matching category, or null if none fit
- confidence: a number between 0 and 1

Respond with ONLY the JSON object, no other text.`,
      maxOutputTokens: 100,
    });

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = categoriseSchema.safeParse(JSON.parse(jsonMatch[0]));
    if (!parsed.success) return null;

    if (parsed.data.category_id && parsed.data.confidence >= 0.6) {
      const valid = categories.some((c) => c.id === parsed.data.category_id);
      return valid ? parsed.data.category_id : null;
    }

    return null;
  } catch (err) {
    logger.error("auto-categorise", "AI categorisation failed", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Batch AI categorisation — groups descriptions to minimise API calls
// ---------------------------------------------------------------------------

const batchCategoriseSchema = z.array(
  z.object({
    index: z.number(),
    category_id: z.string().nullable(),
    confidence: z.number().min(0).max(1),
  }),
);

const BATCH_SIZE = 20;
const HIGH_CONFIDENCE_THRESHOLD = 0.85;

/**
 * Batch-categorises uncategorised transactions using AI.
 * Groups ~20 descriptions per LLM call.
 * High-confidence matches auto-create categorisation rules for future use.
 * Returns the count of transactions categorised.
 */
export async function batchAiCategorise(
  userId: string,
  transactionIds?: string[],
): Promise<number> {
  if (!process.env.GROQ_API_KEY) return 0;

  try {
    const categories = await getCategoriesByUser(userId);
    if (categories.length === 0) return 0;

    // Fetch uncategorised transactions
    const conditions = [
      eq(transactionsTable.user_id, userId),
      isNull(transactionsTable.category_id),
    ];
    if (transactionIds && transactionIds.length > 0) {
      conditions.push(inArray(transactionsTable.id, transactionIds));
    }

    const uncategorised = await db
      .select({
        id: transactionsTable.id,
        description: transactionsTable.description,
      })
      .from(transactionsTable)
      .where(and(...conditions));

    if (uncategorised.length === 0) return 0;

    // Decrypt descriptions
    const { decryptForUser, getUserKey } = await import("@/lib/encryption");
    const userKey = await getUserKey(userId);
    const items = uncategorised.map((t) => ({
      id: t.id,
      description: t.description ? decryptForUser(t.description, userKey) : "",
    }));

    const categoryList = categories
      .map((c) => `- id: "${c.id}" → ${c.name}`)
      .join("\n");

    // Fetch existing rules to know max priority
    const existingRules = await fetchUserRules(userId);
    const maxPriority = existingRules.length > 0
      ? Math.max(...existingRules.map((_, i) => i))
      : 0;

    let totalCategorised = 0;
    let rulesPriority = maxPriority + 1;

    // Process in batches
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);

      const descriptionList = batch
        .map((t, idx) => `${idx}. "${t.description}"`)
        .join("\n");

      const { text: responseText } = await generateText({
        model: groq("openai/gpt-oss-20b"),
        prompt: `You are a financial transaction categoriser. Given a numbered list of transaction descriptions and a list of categories, assign the best category to each transaction.

Transactions:
${descriptionList}

Categories:
${categoryList}

Return ONLY a JSON array of objects with these exact fields for each transaction:
- index: the transaction number (0-based)
- category_id: the id string of the best matching category, or null if none fit
- confidence: a number between 0 and 1

Respond with ONLY the JSON array, no other text.`,
        maxOutputTokens: batch.length * 60,
      });

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) continue;

      let parsed;
      try {
        parsed = batchCategoriseSchema.safeParse(JSON.parse(jsonMatch[0]));
      } catch {
        continue;
      }
      if (!parsed.success) continue;

      for (const result of parsed.data) {
        if (
          result.category_id === null ||
          result.confidence < 0.6 ||
          result.index < 0 ||
          result.index >= batch.length
        ) {
          continue;
        }

        const valid = categories.some((c) => c.id === result.category_id);
        if (!valid) continue;

        const txn = batch[result.index];

        // Update the transaction with the AI-assigned category
        await db
          .update(transactionsTable)
          .set({ category_id: result.category_id })
          .where(eq(transactionsTable.id, txn.id));

        totalCategorised++;

        // Auto-create a categorisation rule for high-confidence matches
        if (result.confidence >= HIGH_CONFIDENCE_THRESHOLD && txn.description) {
          // Extract a simple pattern from the description (first 2-3 words)
          const pattern = extractPattern(txn.description);
          if (pattern) {
            const existsAlready = existingRules.some(
              (r) => r.pattern.toLowerCase() === pattern.toLowerCase(),
            );
            if (!existsAlready) {
              await db.insert(categorisationRulesTable).values({
                user_id: userId,
                pattern,
                category_id: result.category_id,
                priority: rulesPriority++,
              });
            }
          }
        }
      }
    }

    return totalCategorised;
  } catch (err) {
    logger.error("auto-categorise", "Batch AI categorisation failed", err);
    return 0;
  }
}

/**
 * Extract a meaningful pattern from a transaction description.
 * Takes the merchant name (usually the first significant words).
 */
function extractPattern(description: string): string | null {
  // Remove common prefixes/noise
  const cleaned = description
    .replace(/^(card payment to|direct debit to|payment to|pos|ref:?\s*)/i, "")
    .replace(/\s+\d{4,}$/g, "") // trailing reference numbers
    .replace(/\s+on\s+\d{2}\/\d{2}\/\d{4}$/g, "") // trailing dates
    .trim();

  // Take first 3 meaningful words
  const words = cleaned.split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return null;

  const pattern = words.slice(0, 3).join(" ");
  return pattern.length >= 3 ? pattern : null;
}
