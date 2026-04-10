import { getSubscriptions, toMonthlyAmount, toYearlyAmount } from "@/db/queries/subscriptions";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { formatCurrency } from "@/lib/formatCurrency";
import type { SubscriptionHealthReport } from "@/lib/subscription-health";
import { getSubscriptionHealthReport } from "@/lib/subscription-health";

export type SwitchingAdvisorData = {
  readonly baseCurrency: string;
  readonly hasBills: boolean;
  readonly context: string;
};

/**
 * Gathers user bill/subscription data and health report to build a rich
 * context prompt for the AI switching advisor.
 */
export async function getSwitchingAdvisorData(userId: string): Promise<SwitchingAdvisorData> {
  const [subscriptions, baseCurrency, healthReport] = await Promise.all([
    getSubscriptions(userId),
    getUserBaseCurrency(userId),
    getSubscriptionHealthReport(userId),
  ]);

  const active = subscriptions.filter((s) => s.is_active);
  if (active.length === 0) {
    return { baseCurrency, hasBills: false, context: "" };
  }

  const fmt = (n: number) => formatCurrency(n, baseCurrency);

  const lines: string[] = [
    `# Bills & Subscriptions`,
    `Active: ${active.length}`,
    ``,
    `## All Active Bills`,
  ];

  // Identify likely "switchable" categories
  const switchableKeywords = ["energy", "gas", "electric", "broadband", "internet", "mobile", "phone", "insurance", "tv", "streaming"];

  for (const sub of active) {
    const monthly = toMonthlyAmount(sub.amount, sub.billing_cycle);
    const yearly = toYearlyAmount(sub.amount, sub.billing_cycle);
    const cat = sub.categoryName ?? "Uncategorised";
    const isSwitchable = switchableKeywords.some(
      (kw) =>
        sub.name.toLowerCase().includes(kw) ||
        cat.toLowerCase().includes(kw),
    );

    lines.push(
      `- **${sub.name}** [${cat}]: ${fmt(sub.amount)}/${sub.billing_cycle} (${fmt(monthly)}/mo, ${fmt(yearly)}/yr)${isSwitchable ? " ⚡ likely switchable" : ""}`,
    );
  }

  // Add health intelligence
  if (healthReport.billIncreases.length > 0) {
    lines.push(``, `## Recent Price Increases`);
    for (const inc of healthReport.billIncreases) {
      lines.push(
        `- **${inc.name}** increased ${inc.increasePercent}%: ${fmt(inc.previousAmount)} → ${fmt(inc.currentAmount)} (${fmt(inc.monthlyImpact)}/mo impact)`,
      );
    }
  }

  if (healthReport.unusedSubscriptions.length > 0) {
    lines.push(``, `## Potentially Unused`);
    for (const unused of healthReport.unusedSubscriptions) {
      const dayText =
        unused.daysSinceLastTransaction === -1
          ? "never used"
          : `not used in ${unused.daysSinceLastTransaction} days`;
      lines.push(`- **${unused.name}** (${fmt(unused.monthlyAmount)}/mo): ${dayText}`);
    }
  }

  if (healthReport.overlaps.length > 0) {
    lines.push(``, `## Category Overlaps`);
    for (const overlap of healthReport.overlaps) {
      const names = overlap.subscriptions.map((s) => s.name).join(", ");
      lines.push(`- **${overlap.category}** (${fmt(overlap.totalMonthly)}/mo): ${names}`);
    }
  }

  lines.push(
    ``,
    `## Potential Savings`,
    `Estimated monthly savings from unused subs + bill increases: ${fmt(healthReport.potentialMonthlySavings)}`,
  );

  return {
    baseCurrency,
    hasBills: true,
    context: lines.join("\n"),
  };
}
