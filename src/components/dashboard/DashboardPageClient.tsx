"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Wallet, Calculator } from "lucide-react";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { DashboardZakatSummary } from "@/components/dashboard/DashboardZakatSummary";
import { DashboardWidget } from "@/components/DashboardWidget";
import { ReadOnlyWidgetGrid } from "@/components/ReadOnlyWidgetGrid";
import { WidgetLayoutProvider, useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import type { WidgetLayoutItem } from "@/lib/widget-registry";
import type { NetWorthPoint } from "@/db/queries/net-worth";
import type { AccountWithDetails } from "@/lib/types";

const NetWorthChart = dynamic(
  () => import("@/components/NetWorthChart").then((mod) => mod.NetWorthChart),
  { loading: () => <ChartSkeleton height={260} /> }
);

interface ZakatData {
  readonly zakatDue: number;
  readonly zakatableAmount: number;
  readonly aboveNisab: boolean;
  readonly hasSettings: boolean;
}

interface DashboardPageClientProps {
  readonly serverLayout: readonly WidgetLayoutItem[];
  readonly displayName: string;
  readonly monthName: string;
  readonly baseCurrency: string;
  readonly accounts: AccountWithDetails[];
  readonly netWorth: number;
  readonly totalAssets: number;
  readonly totalLiabilities: number;
  readonly investmentValue: number;
  readonly netWorthHistory: NetWorthPoint[];
  readonly zakatEnabled: boolean;
  readonly zakatData: ZakatData | null;
  readonly investmentsEnabled: boolean;
  readonly accountsEnabled: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  currentAccount: "Current",
  savings: "Savings",
  creditCard: "Credit Card",
  investment: "Investment",
};

export function DashboardPageClient(props: DashboardPageClientProps) {
  return (
    <WidgetLayoutProvider pageId="dashboard" serverLayout={props.serverLayout}>
      <DashboardContent {...props} />
    </WidgetLayoutProvider>
  );
}

function DashboardContent({
  displayName,
  monthName,
  baseCurrency,
  accounts,
  netWorth,
  totalAssets,
  totalLiabilities,
  investmentValue,
  netWorthHistory,
  zakatEnabled,
  zakatData,
  investmentsEnabled,
  accountsEnabled,
}: DashboardPageClientProps) {
  const { layout } = useWidgetLayoutContext();

  function renderWidget(widgetId: string) {
    switch (widgetId) {
      case "net-worth-history":
        return accountsEnabled && netWorthHistory.length >= 2 ? (
          <NetWorthChart data={netWorthHistory} currency={baseCurrency} />
        ) : null;
      case "summary-cards":
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Net Worth" value={formatCurrency(netWorth, baseCurrency)} tone={netWorth >= 0 ? "positive" : "negative"} />
            <MetricCard label="Total Assets" value={formatCurrency(totalAssets, baseCurrency)} tone="neutral" />
            <MetricCard label="Total Liabilities" value={formatCurrency(totalLiabilities, baseCurrency)} tone={totalLiabilities > 0 ? "warning" : "neutral"} />
            {investmentsEnabled ? (
              <MetricCard label="Investments" value={formatCurrency(investmentValue, baseCurrency)} tone="neutral" />
            ) : null}
          </div>
        );
      case "account-cards":
        return accountsEnabled ? (
          <Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle>Accounts</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard/accounts">
                  Manage accounts <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
                  <Wallet className="h-10 w-10 opacity-40" />
                  <p className="text-sm">No accounts yet.</p>
                  <Button asChild size="sm">
                    <Link href="/dashboard/accounts">Add your first account</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <Link
                      key={account.id}
                      href={`/dashboard/accounts/${account.id}`}
                      className="flex items-center justify-between rounded-xl border border-[var(--workspace-card-border)] bg-background/60 p-3 transition-colors hover:bg-accent/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{account.accountName}</p>
                          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                            {TYPE_LABELS[account.type ?? ""] ?? "Account"}
                          </p>
                        </div>
                      </div>
                      <p className={cn(
                        "text-sm font-semibold",
                        account.balance >= 0 ? "text-foreground" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {formatCurrency(account.balance, account.currency ?? baseCurrency)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null;
      case "zakat-summary":
        return zakatEnabled && zakatData ? (
          <DashboardZakatSummary
            zakatDue={zakatData.zakatDue}
            zakatableAmount={zakatData.zakatableAmount}
            aboveNisab={zakatData.aboveNisab}
            daysUntil={null}
            hasSettings={zakatData.hasSettings}
            baseCurrency={baseCurrency}
          />
        ) : null;
      default:
        return null;
    }
  }

  const visibleWidgets = layout
    .map((item) => {
      const content = renderWidget(item.widgetId);
      if (!content) return null;
      return (
        <DashboardWidget key={item.widgetId} id={item.widgetId}>
          {content}
        </DashboardWidget>
      );
    })
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-10 md:py-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {monthName}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome back{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your net worth snapshot and portfolio overview.
        </p>
      </header>

      <section className="workspace-hero rounded-[2rem] px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-2">
          <Badge className="workspace-accent-chip w-fit border-0">Net worth</Badge>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {netWorth < 0 ? "−" : ""}
            {formatCurrency(Math.abs(netWorth), baseCurrency)}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <HeroStat label="Assets" value={formatCurrency(totalAssets, baseCurrency)} icon={<Wallet className="h-4 w-4" />} />
            <HeroStat label="Liabilities" value={formatCurrency(totalLiabilities, baseCurrency)} icon={<TrendingUp className="h-4 w-4 rotate-180" />} />
            <HeroStat label="Investments" value={formatCurrency(investmentValue, baseCurrency)} icon={<TrendingUp className="h-4 w-4" />} />
          </div>
        </div>
      </section>

      <ReadOnlyWidgetGrid>{visibleWidgets}</ReadOnlyWidgetGrid>

      {zakatEnabled && !zakatData ? (
        <Card className="workspace-card border border-dashed border-[var(--workspace-card-border)]">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <Calculator className="h-10 w-10 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium">Set up your Zakat anniversary</p>
            <Button asChild size="sm">
              <Link href="/dashboard/zakat">Open Zakat</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: "neutral" | "positive" | "negative" | "warning" }) {
  const toneClass = {
    neutral: "text-foreground",
    positive: "text-emerald-700 dark:text-emerald-400",
    negative: "text-rose-700 dark:text-rose-400",
    warning: "text-amber-700 dark:text-amber-400",
  }[tone];
  return (
    <Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
      <CardContent className="space-y-1 p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className={cn("text-2xl font-semibold tracking-tight", toneClass)}>{value}</p>
      </CardContent>
    </Card>
  );
}

function HeroStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="workspace-hero-panel rounded-2xl p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
