import { getDebtsSummary } from "@/db/queries/debts";
import { getActiveSubscriptionsTotals } from "@/db/queries/subscriptions";
import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getMonthKey } from "@/lib/date";
import { formatCurrency } from "@/lib/formatCurrency";

export type DebtAdvisorData = {
  baseCurrency: string;
  hasDebts: boolean;
  context: string;
};

export async function getDebtAdvisorData(userId: string): Promise<DebtAdvisorData> {
  const [summary, subscriptions, trend, baseCurrency] = await Promise.all([
    getDebtsSummary(userId),
    getActiveSubscriptionsTotals(userId),
    getMonthlyIncomeExpenseTrend(userId, 6),
    getUserBaseCurrency(userId),
  ]);

  const { active, totalRemaining, totalMinimumPayment, totalPaid, totalOriginal, overallPct } = summary;

  if (active.length === 0) {
    return { baseCurrency, hasDebts: false, context: "" };
  }

  const currentMonthKey = getMonthKey(new Date());
  const completedMonths = trend.filter((m) => m.month !== currentMonthKey);
  const monthCount = Math.max(completedMonths.length, 1);
  const avgMonthlyIncome = completedMonths.reduce((s, m) => s + m.income, 0) / monthCount;
  const avgMonthlyExpenses = completedMonths.reduce((s, m) => s + m.expenses, 0) / monthCount;
  const avgMonthlySavings = avgMonthlyIncome - avgMonthlyExpenses;

  const fmt = (n: number) => formatCurrency(n, baseCurrency);

  const lines: string[] = [
    `# Debt Overview`,
    `- Active debts: ${active.length}`,
    `- Total remaining: ${fmt(totalRemaining)} of ${fmt(totalOriginal)} original (${overallPct}% paid off)`,
    `- Total paid so far: ${fmt(totalPaid)}`,
    `- Combined minimum monthly payments: ${fmt(totalMinimumPayment)}`,
    ``,
    `# Individual Debts`,
  ];

  for (const d of active) {
    const paid = d.original_amount - d.remaining_amount;
    const pct = d.original_amount > 0 ? Math.round((paid / d.original_amount) * 100) : 0;
    lines.push(`## ${d.name}`);
    lines.push(`- Lender: ${d.lender ?? "Not specified"}`);
    lines.push(`- Remaining: ${fmt(d.remaining_amount)} of ${fmt(d.original_amount)} (${pct}% paid off)`);
    lines.push(`- Interest rate: ${d.interest_rate}% APR`);
    lines.push(`- Minimum payment: ${fmt(d.minimum_payment)}/mo`);
    if (d.due_date) {
      lines.push(`- Target payoff date: ${d.due_date}`);
    }
    lines.push(``);
  }

  lines.push(`# Financial Context`);
  lines.push(`- Average monthly income: ${fmt(avgMonthlyIncome)}`);
  lines.push(`- Average monthly expenses: ${fmt(avgMonthlyExpenses)}`);
  lines.push(`- Average monthly net savings: ${fmt(avgMonthlySavings)}`);
  lines.push(`- Subscription costs: ${fmt(subscriptions.monthly)}/mo`);

  return {
    baseCurrency,
    hasDebts: true,
    context: lines.join("\n"),
  };
}
