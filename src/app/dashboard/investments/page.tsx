import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  AlertTriangle,
  Folder,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getBrokerConnections, getManualHoldings, getHoldingSales, decryptBrokerCredentials } from "@/db/queries/investments";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getGroupsByUser } from "@/db/queries/investment-groups";
import { getQuotes } from "@/lib/yahoo-finance";
import { formatCurrency } from "@/lib/formatCurrency";
import { getAdapter, BROKER_META } from "@/lib/brokers";
import type { BrokerSource } from "@/lib/brokers/types";
import { ConnectBrokerDialog } from "@/components/ConnectBrokerDialog";
import { AddHoldingDialog } from "@/components/AddHoldingDialog";
import { AddPrivateInvestmentDialog } from "@/components/AddPrivateInvestmentDialog";
import { DeleteHoldingButton } from "@/components/DeleteHoldingButton";
import { SellHoldingDialog } from "@/components/SellHoldingDialog";
import { RefreshPricesButton } from "@/components/RefreshPricesButton";
import { InvestmentGroupDialog } from "@/components/InvestmentGroupDialog";
import { DeleteGroupButton } from "@/components/DeleteGroupButton";
import { RealizedGainsTable } from "@/components/RealizedGainsTable";
import { PortfolioAIAnalysis } from "@/components/PortfolioAIAnalysis";
const InvestmentCharts = dynamic<{ holdings: NormalisedHolding[]; currency: string }>(
  () => import("@/components/InvestmentCharts").then(mod => mod.InvestmentCharts),
  {
    loading: () => <ChartSkeleton height={260} />,
  }
);

type NormalisedHolding = {
  id: string;
  source: BrokerSource | "manual";
  ticker: string | null;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  investmentType: "stock" | "crypto" | "etf" | "real_estate" | "private_equity" | "other";
  estimatedReturnPercent?: number | null;
  notes?: string | null;
  manualId?: string;
  accountId?: string | null;
  accountName?: string | null;
  groupId?: string | null;
  groupName?: string | null;
  groupColor?: string | null;
  pricePending?: boolean;
};

import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { DashboardWidget } from "@/components/DashboardWidget";

export default async function InvestmentsPage() {
  await requireFeature("investments");
  const userId = await getCurrentUserId();

  const [brokerConnections, manualHoldings, baseCurrency, allAccounts, allGroups, sales, serverLayout] = await Promise.all([
    getBrokerConnections(userId),
    getManualHoldings(userId),
    getUserBaseCurrency(userId),
    getAccountsWithDetails(userId),
    getGroupsByUser(userId),
    getHoldingSales(userId),
    getPageLayout(userId, "investments"),
  ]);

  const groupMap = new Map(allGroups.map((g) => [g.id, g]));
  const groupOptions = allGroups.map((g) => ({ id: g.id, name: g.name, color: g.color, account_id: g.account_id }));

  const investmentAccounts = allAccounts
    .filter((a) => a.type === "investment")
    .map((a) => ({ id: a.id, accountName: a.accountName }));

  const connectedBrokers = brokerConnections.map((c) => c.broker as BrokerSource);

  // Fetch data from all connected brokers in parallel
  const holdings: NormalisedHolding[] = [];
  let brokerCash = 0;
  const brokerErrors: string[] = [];

  const brokerResults = await Promise.allSettled(
    brokerConnections.map(async (conn) => {
      const creds = await decryptBrokerCredentials(userId, conn.credentials_encrypted);
      const adapter = getAdapter(conn.broker as BrokerSource);
      const summary = await adapter.getSummary(creds);
      return { conn, summary };
    }),
  );

  for (const result of brokerResults) {
    if (result.status === "rejected") {
      brokerErrors.push(`Unable to sync broker data. Try again later or reconnect your account.`);
      continue;
    }
    const { conn, summary } = result.value;
    brokerCash += summary.cash;
    const accountName = conn.account_id
      ? investmentAccounts.find((a) => a.id === conn.account_id)?.accountName ?? null
      : null;

    for (const pos of summary.positions) {
      holdings.push({
        id: `${conn.broker}-${pos.ticker}`,
        source: conn.broker as BrokerSource,
        ticker: pos.ticker,
        name: pos.name,
        quantity: pos.quantity,
        averagePrice: pos.averagePrice,
        currentPrice: pos.currentPrice,
        currency: pos.currency,
        value: pos.value,
        gainLoss: pos.gainLoss,
        gainLossPercent: pos.gainLossPercent,
        investmentType: pos.investmentType,
        estimatedReturnPercent: null,
        notes: null,
        accountId: conn.account_id,
        accountName,
      });
    }
  }

  // Refresh stale manual holding prices (>15 min old)
  const now = new Date();
  const staleTickers = manualHoldings
    .filter((h) => {
      if ((h.investment_type ?? 'stock') !== 'stock' || !h.ticker) return false;
      if (!h.last_price_update) return true;
      const age = now.getTime() - new Date(h.last_price_update).getTime();
      return age > 15 * 60 * 1000;
    })
    .map((h) => h.ticker!)
    .filter((ticker): ticker is string => ticker !== null);

  const freshQuotes = staleTickers.length > 0 ? await getQuotes(staleTickers) : new Map();

  // Manual holdings
  for (const h of manualHoldings) {
    const quote = freshQuotes.get(h.ticker);
    const currentPrice = quote?.currentPrice ?? h.current_price ?? h.average_price;
    const value = currentPrice * h.quantity;
    const cost = h.average_price * h.quantity;
    const gainLoss = value - cost;
    const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

    holdings.push({
      id: `manual-${h.id}`,
      source: "manual",
      ticker: h.ticker,
      name: h.name,
      quantity: h.quantity,
      averagePrice: h.average_price,
      currentPrice,
      currency: h.currency,
      value,
      gainLoss,
      gainLossPercent,
      investmentType: h.investment_type ?? 'stock',
      estimatedReturnPercent: h.estimated_return_percent,
      notes: h.notes,
      manualId: h.id,
      accountId: h.account_id,
      accountName: h.accountName,
      groupId: h.group_id,
      groupName: h.group_id ? groupMap.get(h.group_id)?.name ?? null : null,
      groupColor: h.group_id ? groupMap.get(h.group_id)?.color ?? null : null,
      pricePending: (h.investment_type ?? 'stock') === 'stock' && h.ticker != null && !h.last_price_update && !quote,
    });
  }

  // Totals
  const totalInvestmentValue = holdings.reduce((s, h) => s + h.value, 0) + brokerCash;
  const totalCost =
    holdings.reduce((s, h) => s + h.averagePrice * h.quantity, 0);
  const totalGainLoss = holdings.reduce((s, h) => s + h.gainLoss, 0);
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const totalRealizedGain = sales.reduce((sum, s) => sum + s.realized_gain, 0);

  const sortedHoldings = [...holdings].sort((a, b) => b.value - a.value);

  const headerEl = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Investments</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <ConnectBrokerDialog
          connectedBrokers={connectedBrokers}
          investmentAccounts={investmentAccounts}
        />
        <InvestmentGroupDialog investmentAccounts={investmentAccounts} />
        <AddHoldingDialog investmentAccounts={investmentAccounts} groups={groupOptions} />
        <AddPrivateInvestmentDialog investmentAccounts={investmentAccounts} groups={groupOptions} />
        {manualHoldings.length > 0 && <RefreshPricesButton />}
      </div>
    </div>
  );

  return (
    <PageWidgetWrapper pageId="investments" serverLayout={serverLayout} header={headerEl}>
      <DashboardWidget id="broker-errors">
      {brokerErrors.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Broker sync failed</p>
              {brokerErrors.map((err, i) => (
                <p key={i} className="text-xs text-muted-foreground">{err}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </DashboardWidget>

      <DashboardWidget id="summary-cards">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-semibold">
              Total Value
            </CardDescription>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <DollarSign className="text-primary h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl">
              {formatCurrency(totalInvestmentValue, baseCurrency)}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              {holdings.length} holding{holdings.length !== 1 ? "s" : ""}
              {brokerCash > 0 && ` + ${formatCurrency(brokerCash, baseCurrency)} cash`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-semibold">
              Total Gain / Loss
            </CardDescription>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle
              className={`text-2xl ${totalGainLoss >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {totalGainLoss >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(totalGainLoss), baseCurrency)}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              {totalGainLossPercent >= 0 ? "+" : ""}
              {totalGainLossPercent.toFixed(2)}% overall return
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-semibold">
              Total Invested
            </CardDescription>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
              <BarChart3 className="text-cyan-500 h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl">
              {formatCurrency(totalCost, baseCurrency)}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              Cost basis across all holdings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-semibold">
              Realized Gains
            </CardDescription>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Wallet className="text-emerald-500 h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle
              className={`text-2xl ${totalRealizedGain >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {totalRealizedGain >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(totalRealizedGain), baseCurrency)}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              {sales.length} sale{sales.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>
      </DashboardWidget>

      <DashboardWidget id="charts">
      {holdings.length > 0 && (
        <InvestmentCharts holdings={sortedHoldings} currency={baseCurrency} />
      )}
      </DashboardWidget>

      <DashboardWidget id="ai-analysis">
      {holdings.length > 0 && <PortfolioAIAnalysis />}
      </DashboardWidget>

      <DashboardWidget id="holdings-table">
      {holdings.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Wallet className="h-10 w-10 opacity-40" />
            <div>
              <p className="text-sm font-medium text-foreground">No investments yet</p>
              <p className="text-xs">
                Connect a broker or add holdings manually to start tracking.
              </p>
            </div>
            <div className="flex gap-2">
              <ConnectBrokerDialog connectedBrokers={connectedBrokers} investmentAccounts={investmentAccounts} />
              <AddHoldingDialog investmentAccounts={investmentAccounts} groups={groupOptions} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Group by account */}
          {(() => {
            // Build hierarchy: account -> groups -> holdings
            type AccountSection = {
              accountId: string | null;
              accountName: string | null;
              groups: { group: typeof allGroups[number] | null; holdings: NormalisedHolding[] }[];
            };

            // Collect unique account IDs from holdings
            const accountIds = [...new Set(sortedHoldings.map((h) => h.accountId ?? "__none__"))];
            const sections: AccountSection[] = accountIds.map((aid) => {
              const accountHoldings = sortedHoldings.filter(
                (h) => (h.accountId ?? "__none__") === aid
              );
              const acctName = accountHoldings[0]?.accountName ?? null;
              const realAid = aid === "__none__" ? null : aid;

              // Groups within this account
              const accountGroups = allGroups.filter(
                (g) => g.account_id === realAid
              );

              const groupSections: AccountSection["groups"] = [];

              for (const group of accountGroups) {
                const groupHoldings = accountHoldings.filter(
                  (h) => h.groupId === group.id
                );
                if (groupHoldings.length > 0) {
                  groupSections.push({ group, holdings: groupHoldings });
                } else {
                  // Show empty group so user can see it
                  groupSections.push({ group, holdings: [] });
                }
              }

              // Ungrouped holdings
              const ungrouped = accountHoldings.filter(
                (h) => !h.groupId || !accountGroups.some((g) => g.id === h.groupId)
              );
              if (ungrouped.length > 0) {
                groupSections.push({ group: null, holdings: ungrouped });
              }

              return { accountId: realAid, accountName: acctName, groups: groupSections };
            });

            return sections.map((section) => (
              <Card key={section.accountId ?? "unlinked"}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {section.accountName ?? "Unlinked Holdings"}
                      </CardTitle>
                      <CardDescription>
                        {section.groups.reduce((s, g) => s + g.holdings.length, 0)} holding{section.groups.reduce((s, g) => s + g.holdings.length, 0) !== 1 ? "s" : ""}
                        {section.groups.filter((g) => g.group).length > 0 &&
                          ` · ${section.groups.filter((g) => g.group).length} group${section.groups.filter((g) => g.group).length !== 1 ? "s" : ""}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.groups.map((gs) => (
                    <div key={gs.group?.id ?? "ungrouped"}>
                      {/* Group header */}
                      {gs.group ? (
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-lg"
                              style={{ backgroundColor: gs.group.color + "20" }}
                            >
                              <Folder className="h-3.5 w-3.5" style={{ color: gs.group.color }} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{gs.group.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {gs.holdings.length} holding{gs.holdings.length !== 1 ? "s" : ""}
                                {gs.holdings.length > 0 && (
                                  <> · {formatCurrency(gs.holdings.reduce((s, h) => s + h.value, 0), baseCurrency)} total</>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <InvestmentGroupDialog
                              group={{ id: gs.group.id, name: gs.group.name, color: gs.group.color, account_id: gs.group.account_id }}
                              investmentAccounts={investmentAccounts}
                            />
                            <DeleteGroupButton group={{ id: gs.group.id, name: gs.group.name }} />
                          </div>
                        </div>
                      ) : section.groups.some((g) => g.group) ? (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-muted-foreground">Individual Holdings</p>
                        </div>
                      ) : null}

                      {/* Holdings table for this group */}
                      {gs.holdings.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Holding</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Shares</TableHead>
                              <TableHead className="text-right">Avg Price</TableHead>
                              <TableHead className="text-right">Current</TableHead>
                              <TableHead className="text-right">Value</TableHead>
                              <TableHead className="text-right">Gain / Loss</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {gs.holdings.map((h) => (
                              <TableRow key={h.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div>
                                      <p className="font-medium">{h.ticker ? h.ticker : h.name}</p>
                                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                        {h.ticker ? h.name : ""}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={h.source === "manual" ? "secondary" : "default"}
                                      className="text-[10px] shrink-0"
                                    >
                                      {h.source === "manual" ? "Manual" : BROKER_META[h.source]?.label ?? h.source}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={h.investmentType === 'stock' || h.investmentType === 'crypto' || h.investmentType === 'etf' ? 'secondary' : 'outline'} className="text-[10px] shrink-0">
                                    {h.investmentType === 'stock' ? 'Stock' : h.investmentType === 'crypto' ? 'Crypto' : h.investmentType === 'etf' ? 'ETF' : h.investmentType === 'real_estate' ? 'Real Estate' : h.investmentType === 'private_equity' ? 'Private Equity' : 'Other'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {h.quantity.toFixed(h.quantity % 1 === 0 ? 0 : 4)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {formatCurrency(h.averagePrice, h.currency)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {formatCurrency(h.currentPrice, h.currency)}
                                  {h.pricePending && (
                                    <p className="text-[10px] text-amber-500">Price pending</p>
                                  )}
                                </TableCell>
                                <TableCell className="text-right tabular-nums font-medium">
                                  {formatCurrency(h.value, baseCurrency)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span
                                    className={`tabular-nums text-sm font-medium ${
                                      h.gainLoss >= 0 ? "text-emerald-600" : "text-red-600"
                                    }`}
                                  >
                                    {h.gainLoss >= 0 ? "+" : "−"}
                                    {formatCurrency(Math.abs(h.gainLoss), baseCurrency)}
                                  </span>
                                  <p
                                    className={`text-xs ${
                                      h.gainLossPercent >= 0 ? "text-emerald-600" : "text-red-600"
                                    }`}
                                  >
                                    {h.gainLossPercent >= 0 ? "+" : ""}
                                    {h.gainLossPercent.toFixed(2)}%
                                  </p>
                                </TableCell>
                                <TableCell>
                                  {h.source === "manual" && h.manualId && (
                                    <div className="flex items-center gap-1 justify-end">
                                      {h.investmentType === 'stock' && h.ticker && (
                                        <AddHoldingDialog
                                          holding={{
                                            id: h.manualId,
                                            ticker: h.ticker!,
                                            name: h.name,
                                            quantity: h.quantity,
                                            average_price: h.averagePrice,
                                            account_id: h.accountId,
                                            group_id: h.groupId,
                                          }}
                                          investmentAccounts={investmentAccounts}
                                          groups={groupOptions}
                                        />
                                      )}
                                      {h.investmentType !== 'stock' && (
                                        <AddPrivateInvestmentDialog
                                          holding={{
                                            id: h.manualId,
                                            name: h.name,
                                            quantity: h.quantity,
                                            average_price: h.averagePrice,
                                            investment_type: h.investmentType as "real_estate" | "private_equity" | "other",
                                            estimated_return_percent: h.estimatedReturnPercent ?? null,
                                            notes: h.notes ?? null,
                                            account_id: h.accountId,
                                            group_id: h.groupId,
                                          }}
                                          investmentAccounts={investmentAccounts}
                                          groups={groupOptions}
                                        />
                                      )}
                                      {h.quantity > 0 && (
                                        <SellHoldingDialog
                                          holding={{
                                            id: h.manualId,
                                            ticker: h.ticker,
                                            name: h.name,
                                            quantity: h.quantity,
                                            average_price: h.averagePrice,
                                            current_price: h.currentPrice,
                                            currency: h.currency,
                                          }}
                                          investmentAccounts={investmentAccounts}
                                        />
                                      )}
                                      <DeleteHoldingButton
                                        holding={{
                                          id: h.manualId,
                                          ticker: h.ticker,
                                          name: h.name,
                                        }}
                                      />
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : gs.group ? (
                        <p className="text-xs text-muted-foreground italic py-2 pl-9">
                          No holdings in this group yet.
                        </p>
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ));
          })()}

          {sales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Realized Gains</CardTitle>
                <CardDescription>
                  History of sales and realized gains from your holdings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RealizedGainsTable sales={sales} baseCurrency={baseCurrency} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </DashboardWidget>
    </PageWidgetWrapper>
  );
}
