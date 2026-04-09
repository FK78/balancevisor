import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getRecurringTransactionsSummary } from "@/db/queries/recurring";
import { formatCurrency } from "@/lib/formatCurrency";
import { RecurringClient } from "@/components/RecurringClient";
import { requireFeature } from "@/components/FeatureGate";

export default async function RecurringPage() {
  await requireFeature("recurring");
  const userId = await getCurrentUserId();

  const [summary, baseCurrency] = await Promise.all([
    getRecurringTransactionsSummary(userId),
    getUserBaseCurrency(userId),
  ]);

  const {
    recurring,
    incomeCount,
    expenseCount,
    monthlyExpenses,
    monthlyIncome,
    upcomingCount,
  } = summary;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Recurring Transactions
          </h1>
        </div>
      </div>

      {/* Compact stats */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4 sm:divide-x sm:gap-0">
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-lg font-semibold tabular-nums text-red-600">{formatCurrency(monthlyExpenses, baseCurrency)}</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-lg font-semibold tabular-nums text-emerald-600">{formatCurrency(monthlyIncome, baseCurrency)}</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Net</p>
            <p className={`text-lg font-semibold tabular-nums ${monthlyIncome - monthlyExpenses >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {monthlyIncome - monthlyExpenses >= 0 ? "+" : "−"}{formatCurrency(Math.abs(monthlyIncome - monthlyExpenses), baseCurrency)}
            </p>
          </div>
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Due This Week</p>
            <p className="text-lg font-semibold tabular-nums">{upcomingCount}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recurring transactions list */}
      <RecurringClient
        recurring={recurring}
        currency={baseCurrency}
      />
    </div>
  );
}
