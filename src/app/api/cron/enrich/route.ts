import { timingSafeEqual } from "node:crypto";
import { db } from "@/index";
import { userOnboardingTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { autoApplyBudgetSuggestions } from "@/lib/budget-auto-apply";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Daily cron endpoint that auto-creates budgets for all onboarded users.
 * Full enrichment (categorisation, subscriptions, recurring) is handled
 * on-login via /api/enrich-on-login. This cron only handles budgets since
 * they benefit from overnight batch processing.
 *
 * On a VPS, schedule via system cron:
 *   0 3 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/enrich
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = env().CRON_SECRET;

  if (!cronSecret || !authHeader) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expected = Buffer.from(`Bearer ${cronSecret}`, "utf-8");
  const actual = Buffer.from(authHeader, "utf-8");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await db
      .select({ user_id: userOnboardingTable.user_id })
      .from(userOnboardingTable)
      .where(eq(userOnboardingTable.completed, true));

    const MAX_USERS_PER_RUN = 100;
    const batch = users.slice(0, MAX_USERS_PER_RUN);

    let totalBudgets = 0;
    let usersProcessed = 0;

    for (const user of batch) {
      try {
        const result = await autoApplyBudgetSuggestions(user.user_id);
        totalBudgets += result.budgetsCreated;
        usersProcessed++;

        if (result.budgetsCreated > 0) {
          logger.info(
            "cron/enrich",
            `User ${user.user_id}: ${result.budgetsCreated} budgets auto-created`,
          );
        }
      } catch (err) {
        logger.error("cron/enrich", `Failed for user ${user.user_id}`, err);
      }
    }

    const summary = { usersProcessed, totalBudgets };
    logger.info("cron/enrich", `Completed: ${JSON.stringify(summary)}`);
    return Response.json(summary);
  } catch (err) {
    logger.error("cron/enrich", "Cron job failed", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
