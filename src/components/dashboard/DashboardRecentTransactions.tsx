import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import type { TransactionWithDetails } from "@/lib/types";

type DashboardRecentTransactionsProps = {
  transactions: TransactionWithDetails[];
  currency: string;
};

function getTransactionStyle(type: string) {
  switch (type) {
    case "income":
    case "sale":
      return { color: "text-emerald-600", prefix: "+" };
    case "refund":
      return { color: "text-amber-600", prefix: "↩ " };
    case "transfer":
      return { color: "text-blue-600", prefix: "⇄ " };
    default:
      return { color: "text-red-600", prefix: "−" };
  }
}

function getCategoryLabel(t: TransactionWithDetails) {
  if (t.type === "transfer") return "Transfer";
  if (t.type === "sale") return "Sale";
  if (t.type === "refund") return "Refund";
  return t.category ?? "";
}

export function DashboardRecentTransactions({
  transactions,
  currency,
}: DashboardRecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your last 5 transactions.</CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/transactions">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No transactions yet
            </p>
            <p className="text-xs">
              Add a transaction to populate your dashboard.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/transactions">Go to transactions</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {transactions.map((t) => {
              const style = getTransactionStyle(t.type);
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {getCategoryLabel(t)}{t.date ? ` · ${t.date}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 text-sm font-semibold tabular-nums ${style.color}`}>
                    {style.prefix}{formatCurrency(t.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
