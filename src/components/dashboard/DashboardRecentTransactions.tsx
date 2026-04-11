import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";
import { TransactionDecisionRow } from "@/components/transactions/TransactionDecisionRow";
import { buildTransactionDecisionState } from "@/components/transactions/transaction-decision";
import type { TransactionWithDetails } from "@/lib/types";

type DashboardRecentTransactionsProps = {
  transactions: TransactionWithDetails[];
  currency: string;
};

export function DashboardRecentTransactions({
  transactions,
  currency,
}: DashboardRecentTransactionsProps) {
  const reviewCount = transactions.filter(
    (transaction) => buildTransactionDecisionState(transaction, currency).statusLabel === "Needs review",
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction Watchlist</CardTitle>
            <CardDescription>
              Recent items that may need your attention first.
            </CardDescription>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-[var(--workspace-card-border)] bg-background/80 px-3 py-1 font-medium text-foreground">
                {transactions.length} item{transactions.length === 1 ? "" : "s"} in watchlist
              </span>
              <span className="rounded-full border border-[var(--workspace-card-border)] bg-background/80 px-3 py-1">
                {reviewCount} item{reviewCount === 1 ? "" : "s"} {reviewCount === 1 ? "needs" : "need"} review right now.
              </span>
            </div>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/transactions">Open transactions</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.length === 0 ? (
          <DecisionEmptyState
            title="No transactions yet"
            description="Add a transaction to populate your dashboard watchlist."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/transactions">Go to transactions</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => {
              return (
                <TransactionDecisionRow
                  key={t.id}
                  transaction={t}
                  currency={currency}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
