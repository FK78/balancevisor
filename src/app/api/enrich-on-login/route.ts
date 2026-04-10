import { db } from "@/index";
import { userPreferencesTable } from "@/db/schema";
import { and, eq, lt, or, isNull } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";
import { enrichTransactions } from "@/lib/transaction-intelligence";
import { autoApplyBudgetSuggestions } from "@/lib/budget-auto-apply";
import { logger } from "@/lib/logger";
import { z } from "zod";

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

/**
 * On-login enrichment endpoint. Runs the full enrichment + budget auto-apply
 * pipeline with a cooldown per user to avoid redundant processing.
 *
 * Uses an atomic UPDATE … WHERE to prevent concurrent triggers for the same user.
 */
export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  try {
    const bodySchema = z.object({ force: z.boolean().optional().default(false) });
    const raw = await req.json().catch(() => ({}));
    const { force } = bodySchema.parse(raw);

    const now = new Date();

    // Atomic cooldown: UPDATE only succeeds if cooldown has elapsed (or forced).
    // This eliminates the TOCTOU race between checking and setting the timestamp.
    if (!force) {
      const threshold = new Date(now.getTime() - COOLDOWN_MS);
      const [claimed] = await db
        .update(userPreferencesTable)
        .set({ last_enriched_at: now })
        .where(
          and(
            eq(userPreferencesTable.user_id, userId),
            or(
              isNull(userPreferencesTable.last_enriched_at),
              lt(userPreferencesTable.last_enriched_at, threshold),
            ),
          ),
        )
        .returning({ user_id: userPreferencesTable.user_id });

      if (!claimed) {
        return Response.json({ skipped: true, reason: "cooldown" });
      }
    } else {
      // Force mode: always update timestamp
      await db
        .update(userPreferencesTable)
        .set({ last_enriched_at: now })
        .where(eq(userPreferencesTable.user_id, userId));
    }

    const enrichment = await enrichTransactions(userId);
    const budgets = await autoApplyBudgetSuggestions(userId);

    const result = {
      skipped: false,
      ...enrichment,
      budgetsCreated: budgets.budgetsCreated,
    };

    logger.info(
      "enrich-on-login",
      `User ${userId}: rules=${enrichment.ruleCategorised}, ai=${enrichment.aiCategorised}, ` +
        `newCats=${enrichment.categoriesCreated}, subs=${enrichment.subscriptionsCreated}, ` +
        `budgets=${budgets.budgetsCreated}`,
    );

    return Response.json(result);
  } catch (err) {
    logger.error("enrich-on-login", `Failed for user ${userId}`, err);
    return Response.json({ error: "Enrichment failed" }, { status: 500 });
  }
}
