import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "@/components/TransactionRow";
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TransactionRow key={t.id} t={t} currency={currency} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
