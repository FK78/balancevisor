import type { Nudge } from "./types";
import type { MonthlyCashflowPoint } from "@/db/queries/transactions";
import { formatCurrency } from "@/lib/formatCurrency";
import { getMonthKey } from "@/lib/date";

export type CelebrationInputs = {
  readonly monthlyTrend: readonly MonthlyCashflowPoint[];
  readonly goalsProgress: readonly { name: string; pct: number }[];
  readonly currency: string;
};

export function generateCelebrationNudges(inputs: CelebrationInputs): Nudge[] {
  const { monthlyTrend, goalsProgress, currency } = inputs;
  const nudges: Nudge[] = [];
  const currentMonthKey = getMonthKey(new Date());

  // Positive savings streak
  const sorted = [...monthlyTrend]
    .filter((m) => m.month <= currentMonthKey)
    .sort((a, b) => a.month.localeCompare(b.month));

  let savingsStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].income > sorted[i].expenses && sorted[i].income > 0) {
      savingsStreak++;
    } else {
      break;
    }
  }

  if (savingsStreak >= 3) {
    nudges.push({
      id: "savings-streak",
      category: "celebrate",
      title: `${savingsStreak}-month savings streak!`,
      body: `You've spent less than you've earned for ${savingsStreak} months straight. Keep it up!`,
      priority: 50,
      icon: "party-popper",
      dismissible: true,
    });
  }

  // High savings rate this month
  const current = sorted.at(-1);
  if (current && current.income > 0) {
    const rate = ((current.income - current.expenses) / current.income) * 100;
    if (rate >= 30) {
      nudges.push({
        id: "high-savings-rate",
        category: "celebrate",
        title: `Saving ${Math.round(rate)}% of income this month`,
        body: `You're keeping ${formatCurrency(current.income - current.expenses, currency)} this month — that's a great savings rate.`,
        priority: 45,
        icon: "piggy-bank",
        dismissible: true,
      });
    }
  }

  // Goals near completion (80-99%)
  for (const goal of goalsProgress.slice(0, 2)) {
    if (goal.pct >= 80 && goal.pct < 100) {
      nudges.push({
        id: `goal-almost-${goal.name.toLowerCase().replace(/\s+/g, "-")}`,
        category: "celebrate",
        title: `${goal.name} is ${Math.round(goal.pct)}% complete`,
        body: `You're almost there! Just a little more to hit your ${goal.name} target.`,
        actionUrl: "/dashboard/goals",
        actionLabel: "View goals",
        priority: 55,
        icon: "party-popper",
        dismissible: true,
      });
    }
  }

  return nudges;
}
