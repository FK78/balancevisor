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
import type { TransactionWithDetails } from "@/lib/types";

type DashboardRecentTransactionsProps = {
  transactions: TransactionWithDetails[];
  currency: string;
};

export function DashboardRecentTransactions({
  transactions,
  currency,
}: DashboardRecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction Watchlist</CardTitle>
            <CardDescription>
              Recent items that may need your attention first.
            </CardDescription>
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
