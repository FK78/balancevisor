import { db } from "@/index";
import { categorisationRulesTable, categoriesTable, transactionsTable } from "@/db/schema";
import { eq, desc, and, isNull, inArray } from "drizzle-orm";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { getCategoriesByUser } from "@/db/queries/categories";
import { isAiEnabled } from "@/db/queries/preferences";
import { logger } from "@/lib/logger";
import { normaliseMerchant } from "@/lib/merchant-normalise";
import { learnMerchantMappingForUser } from "@/db/mutations/merchant-mappings";
import { revalidateDomains } from "@/lib/revalidate";
import { env } from "@/lib/env";

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

  if (env().GROQ_API_KEY && (await isAiEnabled(userId))) {
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
    suggested_category: z.string().nullable().optional(),
  }),
);

const BATCH_SIZE = 20;
const HIGH_CONFIDENCE_THRESHOLD = 0.85;

// Deterministic color palette for auto-created categories
const AUTO_CATEGORY_COLORS = [
  "#f43f5e", "#8b5cf6", "#0ea5e9", "#f59e0b", "#84cc16",
  "#06b6d4", "#d946ef", "#64748b", "#e11d48", "#2563eb",
];

export type BatchAiResult = {
  categorised: number;
  categoriesCreated: number;
};

/**
 * Batch-categorises uncategorised transactions using AI.
 * Groups ~20 descriptions per LLM call.
 * High-confidence matches auto-create categorisation rules for future use.
 * When no existing category fits, AI can suggest a new category name which
 * gets auto-created (full autopilot mode).
 */
export async function batchAiCategorise(
  userId: string,
  transactionIds?: string[],
): Promise<BatchAiResult> {
  if (!env().GROQ_API_KEY) return { categorised: 0, categoriesCreated: 0 };
  if (!(await isAiEnabled(userId))) return { categorised: 0, categoriesCreated: 0 };

  try {
    let categories = await getCategoriesByUser(userId);
    if (categories.length === 0) return { categorised: 0, categoriesCreated: 0 };

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

    if (uncategorised.length === 0) return { categorised: 0, categoriesCreated: 0 };

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
    let totalCategoriesCreated = 0;
    let rulesPriority = maxPriority + 1;
    const createdCategoryNames = new Set<string>();

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
- category_id: the id string of the best matching category, or null if none fit well
- confidence: a number between 0 and 1
- suggested_category: if category_id is null and you can identify a clear spending category (e.g. "Clothing", "Pets", "Education"), provide the name here. Otherwise null.

IMPORTANT: Only suggest a new category when no existing one is a reasonable fit. Keep suggested names short (1-2 words), capitalised, and generic (not merchant-specific).

Respond with ONLY the JSON array, no other text.`,
        maxOutputTokens: batch.length * 80,
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
        if (result.index < 0 || result.index >= batch.length) continue;
        if (result.confidence < 0.6) continue;

        const txn = batch[result.index];
        const merchantName = normaliseMerchant(txn.description);
        let assignedCategoryId: string | null = null;

        if (result.category_id) {
          // Existing category match
          const valid = categories.some((c) => c.id === result.category_id);
          if (!valid) continue;
          assignedCategoryId = result.category_id;
        } else if (
          result.suggested_category &&
          result.confidence >= HIGH_CONFIDENCE_THRESHOLD
        ) {
          // AI suggests a new category — auto-create it
          const suggestedName = result.suggested_category.trim().slice(0, 50);
          if (!suggestedName || suggestedName.length < 2) continue;

          // Check if already exists (case-insensitive) or was created in this batch
          const nameLower = suggestedName.toLowerCase();
          const existing = categories.find(
            (c) => c.name.toLowerCase() === nameLower,
          );

          if (existing) {
            assignedCategoryId = existing.id;
          } else if (!createdCategoryNames.has(nameLower)) {
            const colorIdx =
              (categories.length + totalCategoriesCreated) %
              AUTO_CATEGORY_COLORS.length;
            const [newCat] = await db
              .insert(categoriesTable)
              .values({
                user_id: userId,
                name: suggestedName,
                color: AUTO_CATEGORY_COLORS[colorIdx],
              })
              .returning();
            if (newCat) {
              categories = [...categories, newCat];
              createdCategoryNames.add(nameLower);
              totalCategoriesCreated++;
              assignedCategoryId = newCat.id;
              logger.info(
                "auto-categorise",
                `Auto-created category "${suggestedName}" for user ${userId}`,
              );
            }
          } else {
            // Created earlier in this run — find it
            const justCreated = categories.find(
              (c) => c.name.toLowerCase() === nameLower,
            );
            if (justCreated) assignedCategoryId = justCreated.id;
          }
        }

        if (!assignedCategoryId) continue;

        // Update the transaction with the AI-assigned category
        await db
          .update(transactionsTable)
          .set({ category_id: assignedCategoryId, category_source: 'ai', merchant_name: merchantName })
          .where(eq(transactionsTable.id, txn.id));

        totalCategorised++;

        // Auto-create a categorisation rule for high-confidence matches
        if (result.confidence >= HIGH_CONFIDENCE_THRESHOLD && txn.description) {
          const pattern = extractPattern(txn.description);
          if (pattern) {
            const existsAlready = existingRules.some(
              (r) => r.pattern.toLowerCase() === pattern.toLowerCase(),
            );
            if (!existsAlready) {
              await db.insert(categorisationRulesTable).values({
                user_id: userId,
                pattern,
                category_id: assignedCategoryId,
                priority: rulesPriority++,
              });
            }
          }
          if (merchantName) {
            learnMerchantMappingForUser(userId, merchantName, assignedCategoryId, 'ai').catch((err) => logger.warn('auto-categorise', 'merchant mapping learn failed', err));
          }
        }
      }
    }

    if (totalCategoriesCreated > 0) {
      revalidateDomains('categories');
    }

    return { categorised: totalCategorised, categoriesCreated: totalCategoriesCreated };
  } catch (err) {
    logger.error("auto-categorise", "Batch AI categorisation failed", err);
    return { categorised: 0, categoriesCreated: 0 };
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
