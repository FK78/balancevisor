import { getTotalsByType, getMonthlyCategorySpendTrend } from "@/db/queries/transactions";
import { getBudgets } from "@/db/queries/budgets";
import { getGoals } from "@/db/queries/goals";
import { getDebtsSummary } from "@/db/queries/debts";
import { getActiveSubscriptionsTotals } from "@/db/queries/subscriptions";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getNetWorthHistory } from "@/db/queries/net-worth";
import { getPortfolioSnapshot, formatPortfolioContext } from "@/lib/portfolio-data";
import { getMonthRange, getMonthKey } from "@/lib/date";
import { formatCurrency } from "@/lib/formatCurrency";

export type MonthlyReportData = {
  monthLabel: string;
  monthKey: string;
  isCurrentMonth: boolean;
  baseCurrency: string;
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
  prevIncome: number;
  prevExpenses: number;
  incomeChange: number;
  expenseChange: number;
  categorySpend: Array<{ category: string; total: number; color: string }>;
  budgets: Array<{ category: string; amount: number; spent: number; period: string | null }>;
  goals: Array<{ name: string; saved: number; target: number; targetDate: string | null }>;
  debtSummary: {
    activeCount: number;
    totalRemaining: number;
    totalMinimumPayment: number;
    overallPct: number;
  };
  subscriptions: { monthly: number; yearly: number; count: number };
  investmentValue: number;
  netWorthStart: number | null;
  netWorthEnd: number | null;
  netWorthChange: number | null;
  portfolioContext: string;
};

export async function getMonthlyReportData(
  userId: string,
  monthsAgo: number,
): Promise<MonthlyReportData> {
  const targetMonth = getMonthRange(monthsAgo);
  const prevMonth = getMonthRange(monthsAgo + 1);

  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const monthKey = getMonthKey(targetDate);
  const isCurrentMonth = monthsAgo === 0;
  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(targetDate);

  const [
    income,
    expenses,
    prevIncome,
    prevExpenses,
    categoryTrend,
    budgets,
    goals,
    debtSummary,
    subscriptions,
    baseCurrency,
    netWorthHistory,
    portfolioSnapshot,
  ] = await Promise.all([
    getTotalsByType(userId, "income", targetMonth.start, targetMonth.end),
    getTotalsByType(userId, "expense", targetMonth.start, targetMonth.end),
    getTotalsByType(userId, "income", prevMonth.start, prevMonth.end),
    getTotalsByType(userId, "expense", prevMonth.start, prevMonth.end),
    getMonthlyCategorySpendTrend(userId, 12),
    getBudgets(userId),
    getGoals(userId),
    getDebtsSummary(userId),
    getActiveSubscriptionsTotals(userId),
    getUserBaseCurrency(userId),
    getNetWorthHistory(userId, 90),
    getPortfolioSnapshot(userId),
  ]);

  const net = income - expenses;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;
  const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
  const expenseChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;

  const categorySpend = categoryTrend
    .filter((r) => r.month === monthKey)
    .map((r) => ({ category: r.category, total: r.total, color: r.color }))
    .sort((a, b) => b.total - a.total);

  const budgetData = budgets.map((b) => ({
    category: b.budgetCategory,
    amount: b.budgetAmount,
    spent: b.budgetSpent,
    period: b.budgetPeriod,
  }));

  const goalData = goals.map((g) => ({
    name: g.name,
    saved: g.saved_amount,
    target: g.target_amount,
    targetDate: g.target_date,
  }));

  // Find net worth at month start & end from snapshot history
  const monthStart = targetMonth.start;
  const monthEnd = targetMonth.end;
  const nwBefore = netWorthHistory.filter((r) => r.date < monthStart);
  const nwInMonth = netWorthHistory.filter((r) => r.date >= monthStart && r.date < monthEnd);
  const netWorthStart = nwBefore.length > 0 ? nwBefore[nwBefore.length - 1].net_worth : null;
  const netWorthEnd = nwInMonth.length > 0 ? nwInMonth[nwInMonth.length - 1].net_worth : null;
  const netWorthChange = netWorthStart !== null && netWorthEnd !== null ? netWorthEnd - netWorthStart : null;

  return {
    monthLabel,
    monthKey,
    isCurrentMonth,
    baseCurrency,
    income,
    expenses,
    net,
    savingsRate,
    prevIncome,
    prevExpenses,
    incomeChange,
    expenseChange,
    categorySpend,
    budgets: budgetData,
    goals: goalData,
    debtSummary: {
      activeCount: debtSummary.activeCount,
      totalRemaining: debtSummary.totalRemaining,
      totalMinimumPayment: debtSummary.totalMinimumPayment,
      overallPct: debtSummary.overallPct,
    },
    subscriptions,
    investmentValue: portfolioSnapshot.totalValue,
    netWorthStart,
    netWorthEnd,
    netWorthChange,
    portfolioContext: formatPortfolioContext(portfolioSnapshot),
  };
}

export function formatMonthlyReportContext(data: MonthlyReportData): string {
  const c = data.baseCurrency;
  const fmt = (v: number) => formatCurrency(v, c);
  const pct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;

  const categoryLines = data.categorySpend.slice(0, 10).map(
    (cat) => `- ${cat.category}: ${fmt(cat.total)}`,
  );

  const budgetLines = data.budgets.map((b) => {
    const usage = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0;
    return `- ${b.category}: ${fmt(b.spent)} / ${fmt(b.amount)} (${usage}% used, ${b.period ?? "monthly"})`;
  });

  const goalLines = data.goals.map((g) => {
    const progress = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
    const deadline = g.targetDate ? ` — deadline: ${g.targetDate}` : "";
    return `- ${g.name}: ${fmt(g.saved)} / ${fmt(g.target)} (${progress}%)${deadline}`;
  });

  return `
## Financial Data for ${data.monthLabel}${data.isCurrentMonth ? " (in progress)" : ""}
Currency: ${c}

### Income & Expenses
- Income: ${fmt(data.income)} (${pct(data.incomeChange)} vs prev month)
- Expenses: ${fmt(data.expenses)} (${pct(data.expenseChange)} vs prev month)
- Net: ${data.net >= 0 ? "+" : ""}${fmt(Math.abs(data.net))}
- Savings rate: ${data.savingsRate.toFixed(1)}%

### Top Spending Categories
${categoryLines.length > 0 ? categoryLines.join("\n") : "- No expense data"}

### Budget Performance
${budgetLines.length > 0 ? budgetLines.join("\n") : "- No budgets set"}

### Savings Goals (${data.goals.length})
${goalLines.length > 0 ? goalLines.join("\n") : "- No goals set"}

### Debts
- Active debts: ${data.debtSummary.activeCount}
- Total remaining: ${fmt(data.debtSummary.totalRemaining)}
- Minimum monthly payments: ${fmt(data.debtSummary.totalMinimumPayment)}
- Overall paid off: ${data.debtSummary.overallPct}%

### Subscriptions
- Active: ${data.subscriptions.count}
- Monthly cost: ${fmt(data.subscriptions.monthly)}
- Yearly cost: ${fmt(data.subscriptions.yearly)}

### Investments
- Total portfolio value: ${fmt(data.investmentValue)}

### Net Worth Change
${data.netWorthChange !== null
    ? `- Start of month: ${fmt(data.netWorthStart!)}\n- End of month: ${fmt(data.netWorthEnd!)}\n- Change: ${data.netWorthChange >= 0 ? "+" : ""}${fmt(Math.abs(data.netWorthChange))}`
    : "- Insufficient snapshot data for this month"}

${data.portfolioContext}
`.trim();
}
