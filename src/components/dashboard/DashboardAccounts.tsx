import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccountCard } from "@/components/AccountCard";
import { Wallet } from "lucide-react";
import type { AccountWithDetails } from "@/lib/types";

type DashboardAccountsProps = {
  accounts: AccountWithDetails[];
  currency: string;
};

export function DashboardAccounts({
  accounts,
  currency,
}: DashboardAccountsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>
              {accounts.length} account{accounts.length !== 1 ? "s" : ""}{" "}
              linked.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/accounts">Manage</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-6 text-center">
            <Wallet className="h-8 w-8 opacity-40" />
            <p className="text-sm font-medium text-foreground">
              No accounts linked
            </p>
            <p className="text-xs">
              Create an account to start tracking balances.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/accounts">Add account</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.accountName}
                account={account}
                currency={currency}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
