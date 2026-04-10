import type { Nudge } from "./types";
import type { SpendingAnomaly } from "@/lib/spending-anomalies";
import type { MonthlyCashflowPoint } from "@/db/queries/transactions";
import { formatCurrency } from "@/lib/formatCurrency";
import { getMonthKey } from "@/lib/date";

export function generateSpendingNudges(
  anomalies: readonly SpendingAnomaly[],
  monthlyTrend: readonly MonthlyCashflowPoint[],
  currency: string,
): Nudge[] {
  const nudges: Nudge[] = [];

  for (const a of anomalies.slice(0, 2)) {
    nudges.push({
      id: `anomaly-${a.category.toLowerCase().replace(/\s+/g, "-")}`,
      category: "watch",
      title: `${a.category} spending is ${a.pctAbove}% above average`,
      body: `You've spent ${formatCurrency(a.currentSpend, currency)} on ${a.category} this month vs your usual ${formatCurrency(a.avgSpend, currency)}. That's ${formatCurrency(a.increaseAmount, currency)} more than normal.`,
      actionUrl: "/dashboard/reports",
      actionLabel: "View report",
      priority: 70,
      icon: "trending-down",
      dismissible: true,
    });
  }

  // Consecutive spending increase streak
  const currentMonthKey = getMonthKey(new Date());
  const sorted = [...monthlyTrend]
    .filter((m) => m.month <= currentMonthKey)
    .sort((a, b) => a.month.localeCompare(b.month));

  let streak = 0;
  for (let i = sorted.length - 1; i > 0; i--) {
    if (sorted[i].expenses > sorted[i - 1].expenses && sorted[i - 1].expenses > 0) {
      streak++;
    } else {
      break;
    }
  }

  if (streak >= 3) {
    nudges.push({
      id: "spending-streak",
      category: "watch",
      title: `Spending has increased ${streak} months in a row`,
      body: "Your total expenses have been climbing for several consecutive months. It may be worth reviewing your recurring costs and discretionary spending.",
      actionUrl: "/dashboard/reports",
      actionLabel: "View trends",
      priority: 75,
      icon: "alert-triangle",
      dismissible: true,
    });
  }

  return nudges;
}
