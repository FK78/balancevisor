import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Wallet, ArrowRight } from "lucide-react";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { AccountFormDialog } from "@/components/AddAccountForm";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getManualHoldings, getBrokerConnections } from "@/db/queries/investments";
import { BROKER_META } from "@/lib/brokers";
import type { BrokerSource } from "@/lib/brokers/types";
import { requireFeature } from "@/components/FeatureGate";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { formatCurrency } from "@/lib/formatCurrency";

const AccountCharts = dynamic(
  () => import("@/components/AccountCharts").then((mod) => mod.AccountCharts),
  { loading: () => <ChartSkeleton height={300} /> },
);

const TYPE_LABELS: Record<string, string> = {
  currentAccount: "Current",
  savings: "Savings",
  creditCard: "Credit Card",
  investment: "Investment",
};

const LIABILITY_TYPES = new Set(["creditCard"]);

export default async function AccountsPage() {
  await requireFeature("accounts");
  const userId = await getCurrentUserId();

  const [accounts, baseCurrency, manualHoldings, brokerConnections] =
    await Promise.all([
      getAccountsWithDetails(userId),
      getUserBaseCurrency(userId),
      getManualHoldings(userId),
      getBrokerConnections(userId),
    ]);

  const investmentByAccount = new Map<
    string,
    { manual: number; brokers: string[] }
  >();
  for (const h of manualHoldings) {
    if (!h.account_id) continue;
    const current = investmentByAccount.get(h.account_id) ?? {
      manual: 0,
      brokers: [],
    };
    current.manual++;
    investmentByAccount.set(h.account_id, current);
  }
  for (const conn of brokerConnections) {
    if (!conn.account_id) continue;
    const current = investmentByAccount.get(conn.account_id) ?? {
      manual: 0,
      brokers: [],
    };
    const label = BROKER_META[conn.broker as BrokerSource]?.label ?? conn.broker;
    current.brokers.push(label);
    investmentByAccount.set(conn.account_id, current);
  }

  const totalAssets = accounts
    .filter((a) => !LIABILITY_TYPES.has(a.type ?? ""))
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a) => LIABILITY_TYPES.has(a.type ?? ""))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-10 md:py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Accounts
          </h1>
          <p className="text-sm text-muted-foreground">
            Track balances across current accounts, savings, and credit cards.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AccountFormDialog />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Assets"
          value={formatCurrency(totalAssets, baseCurrency)}
        />
        <MetricCard
          label="Total Liabilities"
          value={formatCurrency(totalLiabilities, baseCurrency)}
          tone={totalLiabilities > 0 ? "warning" : "neutral"}
        />
        <MetricCard
          label="Net"
          value={formatCurrency(totalAssets - totalLiabilities, baseCurrency)}
          tone={totalAssets - totalLiabilities >= 0 ? "positive" : "negative"}
        />
      </div>

      {accounts.length > 0 ? (
        <AccountCharts accounts={accounts} currency={baseCurrency} />
      ) : null}

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <Wallet className="h-10 w-10 opacity-40" />
            <div>
              <p className="text-sm font-medium text-foreground">
                No accounts yet
              </p>
              <p className="text-xs">
                Create your first account to start tracking balances.
              </p>
            </div>
            <AccountFormDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {accounts.map((account) => {
            const info = investmentByAccount.get(account.id);
            return (
              <Card key={account.id} className="overflow-hidden">
                <CardHeader className="flex-row items-start justify-between gap-2 pb-2">
                  <div>
                    <CardTitle className="text-base">
                      {account.accountName}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {TYPE_LABELS[account.type ?? ""] ?? "Account"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <AccountFormDialog account={account} />
                    <DeleteAccountButton account={account} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p
                    className={
                      "text-2xl font-semibold " +
                      (LIABILITY_TYPES.has(account.type ?? "") ||
                      account.balance < 0
                        ? "text-rose-700 dark:text-rose-400"
                        : "text-foreground")
                    }
                  >
                    {formatCurrency(
                      account.balance,
                      account.currency ?? baseCurrency,
                    )}
                  </p>

                  {account.type === "investment" && info ? (
                    <Link
                      href="/dashboard/investments"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <TrendingUp className="h-3 w-3" />
                      {[
                        ...info.brokers,
                        info.manual > 0
                          ? `${info.manual} manual holding${info.manual !== 1 ? "s" : ""}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Link>
                  ) : null}

                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                  >
                    <Link href={`/dashboard/accounts/${account.id}`}>
                      View details
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "warning";
}) {
  const toneClass = {
    neutral: "text-foreground",
    positive: "text-emerald-700 dark:text-emerald-400",
    negative: "text-rose-700 dark:text-rose-400",
    warning: "text-amber-700 dark:text-amber-400",
  }[tone];
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className={`text-xl font-semibold tracking-tight ${toneClass}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
