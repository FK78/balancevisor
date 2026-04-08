import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getMonthKey } from "@/lib/date";
import { formatCurrency } from "@/lib/formatCurrency";

export type AccountHealthData = {
  baseCurrency: string;
  hasAccounts: boolean;
  context: string;
};

export async function getAccountHealthData(userId: string): Promise<AccountHealthData> {
  const [accounts, trend, baseCurrency] = await Promise.all([
    getAccountsWithDetails(userId),
    getMonthlyIncomeExpenseTrend(userId, 3),
    getUserBaseCurrency(userId),
  ]);

  if (accounts.length === 0) {
    return { baseCurrency, hasAccounts: false, context: "" };
  }

  const currentMonthKey = getMonthKey(new Date());
  const completedMonths = trend.filter((m) => m.month !== currentMonthKey);
  const monthCount = Math.max(completedMonths.length, 1);
  const avgMonthlyIncome = completedMonths.reduce((s, m) => s + m.income, 0) / monthCount;
  const avgMonthlyExpenses = completedMonths.reduce((s, m) => s + m.expenses, 0) / monthCount;

  const fmt = (n: number) => formatCurrency(n, baseCurrency);

  const lines: string[] = [
    `# Account Overview`,
    `- Total accounts: ${accounts.length}`,
    `- Average monthly income: ${fmt(avgMonthlyIncome)}`,
    `- Average monthly expenses: ${fmt(avgMonthlyExpenses)}`,
    ``,
    `# Individual Accounts`,
  ];

  for (const a of accounts) {
    lines.push(`## ${a.accountName}`);
    lines.push(`- Type: ${a.type ?? "Unknown"}`);
    lines.push(`- Balance: ${fmt(a.balance)}`);
    lines.push(`- Transaction count: ${a.transactions}`);

    // Flag accounts with zero or very few transactions
    if (a.transactions === 0) {
      lines.push(`- ⚠ No transactions recorded`);
    } else if (a.transactions < 5) {
      lines.push(`- ⚠ Very few transactions`);
    }

    // Flag negative balances on non-credit accounts
    if (a.balance < 0 && a.type !== "creditCard") {
      lines.push(`- ⚠ Negative balance (overdrawn)`);
    }

    // Flag low savings account balances
    if (a.type === "savings" && a.balance < avgMonthlyExpenses) {
      lines.push(`- ⚠ Savings below one month of expenses`);
    }

    lines.push(``);
  }

  return {
    baseCurrency,
    hasAccounts: true,
    context: lines.join("\n"),
  };
}
