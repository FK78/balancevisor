import type { Nudge } from "./types";
import type { SpendingAnomaly } from "@/lib/spending-anomalies";
import type { BudgetRow } from "@/db/queries/budgets";
import type { MonthlyCashflowPoint } from "@/db/queries/transactions";
import type { SubscriptionHealthReport } from "@/lib/subscription-health";
import { generateBillNudges } from "./bill-nudges";
import { generateBudgetNudges } from "./budget-nudges";
import { generateSpendingNudges } from "./spending-nudges";
import { generateCelebrationNudges } from "./celebration-nudges";
import { calculateBudgetPace } from "@/lib/budget-pace";

export type { Nudge, NudgeCategory } from "./types";

export type NudgeInputs = {
  readonly subscriptionHealth: SubscriptionHealthReport;
  readonly anomalies: readonly SpendingAnomaly[];
  readonly budgets: readonly BudgetRow[];
  readonly monthlyTrend: readonly MonthlyCashflowPoint[];
  readonly goalsProgress: readonly { name: string; pct: number }[];
  readonly currency: string;
  readonly dismissedNudgeKeys?: ReadonlySet<string>;
};

/**
 * Generates a prioritised list of nudges from all sources.
 * All generators are deterministic — no API calls.
 * Dismissed nudges are filtered out.
 */
export function generateNudges(inputs: NudgeInputs): readonly Nudge[] {
  const {
    subscriptionHealth,
    anomalies,
    budgets,
    monthlyTrend,
    goalsProgress,
    currency,
    dismissedNudgeKeys = new Set<string>(),
  } = inputs;

  const paceResults = calculateBudgetPace(budgets);

  const allNudges: Nudge[] = [
    ...generateBillNudges(
      subscriptionHealth.billIncreases,
      subscriptionHealth.unusedSubscriptions,
      currency,
    ),
    ...generateBudgetNudges(paceResults, currency),
    ...generateSpendingNudges(anomalies, monthlyTrend, currency),
    ...generateCelebrationNudges({ monthlyTrend, goalsProgress, currency }),
  ];

  // Add an overlap info nudge when there are overlapping subscription categories
  for (const overlap of subscriptionHealth.overlaps.slice(0, 2)) {
    const names = overlap.subscriptions.map((s) => s.name).join(", ");
    allNudges.push({
      id: `overlap-${overlap.category.toLowerCase().replace(/\s+/g, "-")}`,
      category: "info",
      title: `${overlap.subscriptions.length} subscriptions in ${overlap.category}`,
      body: `You have ${names} — check if you need all of them.`,
      actionUrl: "/dashboard/subscriptions",
      actionLabel: "Review",
      priority: 60,
      icon: "repeat",
      dismissible: true,
    });
  }

  // Filter out dismissed nudges
  const filtered = allNudges.filter((n) => !dismissedNudgeKeys.has(n.id));

  // Sort by priority (highest first)
  filtered.sort((a, b) => b.priority - a.priority);

  // Cap at 8 nudges to avoid overwhelming the user
  return filtered.slice(0, 8);
}
