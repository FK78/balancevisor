import { getSubscriptions, toMonthlyAmount, toYearlyAmount } from "@/db/queries/subscriptions";
import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getMonthKey } from "@/lib/date";
import { formatCurrency } from "@/lib/formatCurrency";

export type SubscriptionAdvisorData = {
  baseCurrency: string;
  hasSubscriptions: boolean;
  context: string;
};

export async function getSubscriptionAdvisorData(userId: string): Promise<SubscriptionAdvisorData> {
  const [subscriptions, trend, baseCurrency] = await Promise.all([
    getSubscriptions(userId),
    getMonthlyIncomeExpenseTrend(userId, 6),
    getUserBaseCurrency(userId),
  ]);

  const active = subscriptions.filter((s) => s.is_active);
  if (active.length === 0) {
    return { baseCurrency, hasSubscriptions: false, context: "" };
  }

  const currentMonthKey = getMonthKey(new Date());
  const completedMonths = trend.filter((m) => m.month !== currentMonthKey);
  const monthCount = Math.max(completedMonths.length, 1);
  const avgMonthlyIncome = completedMonths.reduce((s, m) => s + m.income, 0) / monthCount;
  const avgMonthlyExpenses = completedMonths.reduce((s, m) => s + m.expenses, 0) / monthCount;

  const totalMonthly = active.reduce((s, sub) => s + toMonthlyAmount(sub.amount, sub.billing_cycle), 0);
  const totalYearly = active.reduce((s, sub) => s + toYearlyAmount(sub.amount, sub.billing_cycle), 0);
  const subPctOfExpenses = avgMonthlyExpenses > 0 ? Math.round((totalMonthly / avgMonthlyExpenses) * 100) : 0;

  const fmt = (n: number) => formatCurrency(n, baseCurrency);

  const lines: string[] = [
    `# Subscription Overview`,
    `- Active subscriptions: ${active.length}`,
    `- Total monthly cost: ${fmt(Math.round(totalMonthly * 100) / 100)}`,
    `- Total yearly cost: ${fmt(Math.round(totalYearly * 100) / 100)}`,
    `- Subscriptions as % of monthly expenses: ${subPctOfExpenses}%`,
    ``,
    `# Financial Context`,
    `- Average monthly income: ${fmt(avgMonthlyIncome)}`,
    `- Average monthly expenses: ${fmt(avgMonthlyExpenses)}`,
    `- Average monthly savings: ${fmt(avgMonthlyIncome - avgMonthlyExpenses)}`,
    ``,
    `# Individual Subscriptions`,
  ];

  // Group by category to identify overlaps
  const byCategory = new Map<string, typeof active>();
  for (const sub of active) {
    const cat = sub.categoryName ?? "Uncategorised";
    const existing = byCategory.get(cat) ?? [];
    existing.push(sub);
    byCategory.set(cat, existing);
  }

  for (const [category, subs] of byCategory) {
    lines.push(`\n## ${category} (${subs.length} subscription${subs.length !== 1 ? "s" : ""})`);
    for (const sub of subs) {
      const monthly = toMonthlyAmount(sub.amount, sub.billing_cycle);
      lines.push(`- **${sub.name}**: ${fmt(sub.amount)}/${sub.billing_cycle} (${fmt(monthly)}/mo)`);
      if (sub.notes) lines.push(`  Notes: ${sub.notes}`);
    }
  }

  // Flag categories with multiple subscriptions as potential overlap
  const overlapCategories = [...byCategory.entries()].filter(([, subs]) => subs.length >= 2);
  if (overlapCategories.length > 0) {
    lines.push(`\n# Potential Overlaps`);
    for (const [cat, subs] of overlapCategories) {
      lines.push(`- ${cat}: ${subs.map((s) => s.name).join(", ")}`);
    }
  }

  return {
    baseCurrency,
    hasSubscriptions: true,
    context: lines.join("\n"),
  };
}
