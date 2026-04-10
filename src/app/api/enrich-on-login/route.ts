import { db } from "@/index";
import { userPreferencesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";
import { enrichTransactions } from "@/lib/transaction-intelligence";
import { autoApplyBudgetSuggestions } from "@/lib/budget-auto-apply";
import { logger } from "@/lib/logger";

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

/**
 * On-login enrichment endpoint. Runs the full enrichment + budget auto-apply
 * pipeline with a 1-hour cooldown per user to avoid redundant processing.
 */
export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  try {
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    // Check cooldown (skip if force=true from manual trigger)
    if (!force) {
      const [prefs] = await db
        .select({ last_enriched_at: userPreferencesTable.last_enriched_at })
        .from(userPreferencesTable)
        .where(eq(userPreferencesTable.user_id, userId));

      if (prefs?.last_enriched_at) {
        const elapsed = Date.now() - prefs.last_enriched_at.getTime();
        if (elapsed < COOLDOWN_MS) {
          return Response.json({ skipped: true, reason: "cooldown" });
        }
      }
    }

    // Set timestamp before running to prevent concurrent triggers
    await db
      .update(userPreferencesTable)
      .set({ last_enriched_at: new Date() })
      .where(eq(userPreferencesTable.user_id, userId));

    const enrichment = await enrichTransactions(userId);
    const budgets = await autoApplyBudgetSuggestions(userId);

    const result = {
      skipped: false,
      ...enrichment,
      budgetsCreated: budgets.budgetsCreated,
    };

    logger.info(
      "enrich-on-login",
      `User ${userId}: categorised=${enrichment.aiCategorised}, ` +
        `newCats=${enrichment.categoriesCreated}, subs=${enrichment.subscriptionsCreated}, ` +
        `budgets=${budgets.budgetsCreated}`,
    );

    return Response.json(result);
  } catch (err) {
    logger.error("enrich-on-login", `Failed for user ${userId}`, err);
    return Response.json({ error: "Enrichment failed" }, { status: 500 });
  }
}
