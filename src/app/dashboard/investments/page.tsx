import dynamic from "next/dynamic";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { ChartSkeleton } from "@/components/ChartSkeleton";
import { AddHoldingDialog } from "@/components/AddHoldingDialog";
import { AddPrivateInvestmentDialog } from "@/components/AddPrivateInvestmentDialog";
import { ConnectBrokerDialog } from "@/components/ConnectBrokerDialog";
import { DashboardWidget } from "@/components/DashboardWidget";
import { DeleteGroupButton } from "@/components/DeleteGroupButton";
import { DeleteHoldingButton } from "@/components/DeleteHoldingButton";
import { requireFeature } from "@/components/FeatureGate";
import { InvestmentGroupDialog } from "@/components/InvestmentGroupDialog";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { PortfolioAIAnalysis } from "@/components/PortfolioAIAnalysis";
import { RealizedGainsTable } from "@/components/RealizedGainsTable";
import { RefreshPricesButton } from "@/components/RefreshPricesButton";
import { SellHoldingDialog } from "@/components/SellHoldingDialog";
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";
import { DecisionMetricCard } from "@/components/dense-data/DecisionMetricCard";
import { InvestmentsCockpitIntro } from "@/components/investments/InvestmentsCockpitIntro";
import {
  buildInvestmentsCockpitModel,
  type InvestmentsCockpitModel,
} from "@/components/investments/investments-cockpit";
import {
  HoldingsRoster,
} from "@/components/investments/HoldingsRoster";
import { buildInvestmentsRosterSections } from "@/components/investments/investments-roster";
import { SectionHeader } from "@/components/ui/cockpit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import {
  decryptBrokerCredentials,
  getBrokerConnections,
  getHoldingSales,
  getManualHoldings,
} from "@/db/queries/investments";
import { getGroupsByUser } from "@/db/queries/investment-groups";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getCurrentUserId } from "@/lib/auth";
import { BROKER_META, getAdapter } from "@/lib/brokers";
import type { BrokerSource } from "@/lib/brokers/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { getQuotes } from "@/lib/yahoo-finance";

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

const InvestmentCharts = dynamic<{ holdings: NormalisedHolding[]; currency: string }>(
  () => import("@/components/InvestmentCharts").then((mod) => mod.InvestmentCharts),
  {
    loading: () => <ChartSkeleton height={260} />,
  },
);

function getInvestmentTypeLabel(investmentType: NormalisedHolding["investmentType"]) {
  switch (investmentType) {
    case "stock":
      return "Stock";
    case "crypto":
      return "Crypto";
    case "etf":
      return "ETF";
    case "real_estate":
      return "Real estate";
    case "private_equity":
      return "Private equity";
    default:
      return "Other";
  }
}

function getGainTone(holding: NormalisedHolding): "neutral" | "positive" | "negative" | "warning" {
  if (holding.pricePending) {
    return "warning";
  }

  if (holding.gainLoss > 0) {
    return "positive";
  }

  if (holding.gainLoss < 0) {
    return "negative";
  }

  return "neutral";
}

function formatSignedCurrency(value: number, currency: string) {
  return `${value >= 0 ? "+" : "−"}${formatCurrency(Math.abs(value), currency)}`;
}

function buildPrimaryActionBlurb(model: InvestmentsCockpitModel) {
  switch (model.primaryAction.key) {
    case "reconnect-broker":
      return "Use the broker tools below to restore your live feeds before reading the rest of the page too closely.";
    case "refresh-prices":
      return "Refresh manual pricing first so the charts and holdings comparison stay grounded in the latest values.";
    case "review-concentration":
      return "Start with the roster and chart mix below to decide whether the largest position still fits your comfort level.";
    default:
      return "Your core maintenance is calm, so the next useful move is usually adding or organising the next holding.";
  }
}

export default async function InvestmentsPage() {
  await requireFeature("investments");
  const userId = await getCurrentUserId();

  const [
    brokerConnections,
    manualHoldings,
    baseCurrency,
    allAccounts,
    allGroups,
    sales,
    serverLayout,
  ] = await Promise.all([
    getBrokerConnections(userId),
    getManualHoldings(userId),
    getUserBaseCurrency(userId),
    getAccountsWithDetails(userId),
    getGroupsByUser(userId),
    getHoldingSales(userId),
    getPageLayout(userId, "investments"),
  ]);

  const groupMap = new Map(allGroups.map((group) => [group.id, group]));
  const groupOptions = allGroups.map((group) => ({
    id: group.id,
    name: group.name,
    color: group.color,
    account_id: group.account_id,
  }));
  const investmentAccounts = allAccounts
    .filter((account) => account.type === "investment")
    .map((account) => ({ id: account.id, accountName: account.accountName }));
  const connectedBrokers = brokerConnections.map((connection) => connection.broker as BrokerSource);

  const holdings: NormalisedHolding[] = [];
  let brokerCash = 0;
  const brokerErrors: { broker: string; message: string }[] = [];

  for (const connection of brokerConnections) {
    if (connection.consecutive_failures >= 3 && connection.last_error) {
      brokerErrors.push({
        broker: BROKER_META[connection.broker as BrokerSource]?.label ?? connection.broker,
        message: connection.last_error,
      });
    }
  }

  const brokerResults = await Promise.allSettled(
    brokerConnections.map(async (connection) => {
      const credentials = await decryptBrokerCredentials(userId, connection.credentials_encrypted);
      const adapter = getAdapter(connection.broker as BrokerSource);
      const summary = await adapter.getSummary(credentials);
      return { connection, summary };
    }),
  );

  for (let index = 0; index < brokerResults.length; index += 1) {
    const result = brokerResults[index];
    const connection = brokerConnections[index];

    if (result.status === "rejected") {
      const message = result.reason instanceof Error ? result.reason.message : "Connection failed";
      const brokerLabel = BROKER_META[connection.broker as BrokerSource]?.label ?? connection.broker;
      if (!brokerErrors.some((error) => error.broker === brokerLabel)) {
        brokerErrors.push({ broker: brokerLabel, message });
      }
      continue;
    }

    const { summary } = result.value;
    brokerCash += summary.cash;
    const accountName = connection.account_id
      ? investmentAccounts.find((account) => account.id === connection.account_id)?.accountName ?? null
      : null;

    for (const position of summary.positions) {
      holdings.push({
        id: `${connection.broker}-${position.ticker}`,
        source: connection.broker as BrokerSource,
        ticker: position.ticker,
        name: position.name,
        quantity: position.quantity,
        averagePrice: position.averagePrice,
        currentPrice: position.currentPrice,
        currency: position.currency,
        value: position.value,
        gainLoss: position.gainLoss,
        gainLossPercent: position.gainLossPercent,
        investmentType: position.investmentType,
        estimatedReturnPercent: null,
        notes: null,
        accountId: connection.account_id,
        accountName,
      });
    }
  }

  const now = new Date();
  const staleTickers = manualHoldings
    .filter((holding) => {
      if ((holding.investment_type ?? "stock") !== "stock" || !holding.ticker) {
        return false;
      }
      if (!holding.last_price_update) {
        return true;
      }

      const age = now.getTime() - new Date(holding.last_price_update).getTime();
      return age > 15 * 60 * 1000;
    })
    .map((holding) => holding.ticker!)
    .filter((ticker): ticker is string => ticker !== null);

  const freshQuotes = staleTickers.length > 0 ? await getQuotes(staleTickers) : new Map();

  for (const holding of manualHoldings) {
    const quote = freshQuotes.get(holding.ticker);
    const currentPrice = quote?.currentPrice ?? holding.current_price ?? holding.average_price;
    const value = currentPrice * holding.quantity;
    const cost = holding.average_price * holding.quantity;
    const gainLoss = value - cost;
    const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

    holdings.push({
      id: `manual-${holding.id}`,
      source: "manual",
      ticker: holding.ticker,
      name: holding.name,
      quantity: holding.quantity,
      averagePrice: holding.average_price,
      currentPrice,
      currency: holding.currency,
      value,
      gainLoss,
      gainLossPercent,
      investmentType: holding.investment_type ?? "stock",
      estimatedReturnPercent: holding.estimated_return_percent,
      notes: holding.notes,
      manualId: holding.id,
      accountId: holding.account_id,
      accountName: holding.accountName,
      groupId: holding.group_id,
      groupName: holding.group_id ? groupMap.get(holding.group_id)?.name ?? null : null,
      groupColor: holding.group_id ? groupMap.get(holding.group_id)?.color ?? null : null,
      pricePending:
        (holding.investment_type ?? "stock") === "stock" &&
        holding.ticker != null &&
        !holding.last_price_update &&
        !quote,
    });
  }

  const totalInvestmentValue = holdings.reduce((sum, holding) => sum + holding.value, 0) + brokerCash;
  const totalCost = holdings.reduce((sum, holding) => sum + holding.averagePrice * holding.quantity, 0);
  const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const totalRealizedGain = sales.reduce((sum, sale) => sum + sale.realized_gain, 0);
  const sortedHoldings = [...holdings].sort((left, right) => right.value - left.value);

  const cockpitModel = buildInvestmentsCockpitModel({
    holdings: sortedHoldings,
    brokerErrors,
    brokerCash,
    totalRealizedGain,
    baseCurrency,
    allGroups,
  });

  const rosterSections = buildInvestmentsRosterSections({
    accountSections: cockpitModel.accountSections,
    holdings: sortedHoldings,
    allGroups,
    investmentAccounts,
    groupOptions,
    baseCurrency,
    getInvestmentTypeLabel,
    getGainTone,
    getSourceLabel: (holding) =>
      holding.source === "manual"
        ? "Manual"
        : (BROKER_META[holding.source]?.label ?? holding.source),
    renderGroupActions: ({ group, investmentAccounts: accounts }) => (
      <div className="flex items-center gap-0.5">
        <InvestmentGroupDialog
          group={{
            id: group.id,
            name: group.name,
            color: group.color,
            account_id: group.account_id,
          }}
          investmentAccounts={accounts}
        />
        <DeleteGroupButton group={{ id: group.id, name: group.name }} />
      </div>
    ),
    renderHoldingActions: ({ holding, investmentAccounts: accounts, groupOptions: groups }) =>
      holding.source === "manual" && holding.manualId ? (
        <div className="flex items-center gap-1">
          {holding.investmentType === "stock" && holding.ticker ? (
            <AddHoldingDialog
              holding={{
                id: holding.manualId,
                ticker: holding.ticker,
                name: holding.name,
                quantity: holding.quantity,
                average_price: holding.averagePrice,
                account_id: holding.accountId,
                group_id: holding.groupId,
              }}
              investmentAccounts={accounts}
              groups={groups}
            />
          ) : null}
          {holding.investmentType !== "stock" ? (
            <AddPrivateInvestmentDialog
              holding={{
                id: holding.manualId,
                name: holding.name,
                quantity: holding.quantity,
                average_price: holding.averagePrice,
                investment_type: holding.investmentType as "real_estate" | "private_equity" | "other",
                estimated_return_percent: holding.estimatedReturnPercent ?? null,
                notes: holding.notes ?? null,
                account_id: holding.accountId,
                group_id: holding.groupId,
              }}
              investmentAccounts={accounts}
              groups={groups}
            />
          ) : null}
          {holding.quantity > 0 ? (
            <SellHoldingDialog
              holding={{
                id: holding.manualId,
                ticker: holding.ticker,
                name: holding.name,
                quantity: holding.quantity,
                average_price: holding.averagePrice,
                current_price: holding.currentPrice,
                currency: holding.currency,
              }}
              investmentAccounts={accounts}
            />
          ) : null}
          <DeleteHoldingButton
            holding={{
              id: holding.manualId,
              ticker: holding.ticker,
              name: holding.name,
            }}
          />
        </div>
      ) : undefined,
  });

  const headerEl = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Investments</h1>
      </div>
    </div>
  );

  const portfolioTools = (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Recommended next step
        </p>
        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-semibold tracking-tight text-foreground">
              {cockpitModel.primaryAction.label}
            </p>
            <p className="text-sm text-muted-foreground">
              {cockpitModel.primaryAction.description}
            </p>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">{buildPrimaryActionBlurb(cockpitModel)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ConnectBrokerDialog
          connectedBrokers={connectedBrokers}
          investmentAccounts={investmentAccounts}
        />
        <InvestmentGroupDialog investmentAccounts={investmentAccounts} />
        <AddHoldingDialog investmentAccounts={investmentAccounts} groups={groupOptions} />
        <AddPrivateInvestmentDialog investmentAccounts={investmentAccounts} groups={groupOptions} />
        {manualHoldings.length > 0 ? <RefreshPricesButton /> : null}
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Assets outside broker feeds
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Keep property, pensions, gold, and other off-platform holdings in the portfolio story so
          the full picture stays easy to check.
        </p>
        <Link
          href="/dashboard/accounts#portfolio-support"
          className="mt-3 inline-flex text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline"
        >
          Review portfolio support
        </Link>
      </div>
    </div>
  );

  const introEl = (
    <InvestmentsCockpitIntro
      model={cockpitModel}
      totalInvestmentValue={totalInvestmentValue}
      totalGainLoss={totalGainLoss}
      totalGainLossPercent={totalGainLossPercent}
      totalRealizedGain={totalRealizedGain}
      currency={baseCurrency}
      actionShelfContent={portfolioTools}
    />
  );

  return (
    <PageWidgetWrapper
      pageId="investments"
      serverLayout={serverLayout}
      header={headerEl}
      intro={introEl}
    >
      <DashboardWidget id="broker-errors">
        {brokerErrors.length > 0 ? (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex items-start gap-3 py-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Some broker feeds need attention before the portfolio story is fully reliable.
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {brokerErrors.map((error) => (
                    <p key={`${error.broker}-${error.message}`}>
                      <span className="font-medium text-foreground">{error.broker}:</span> {error.message}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DashboardWidget>

      <DashboardWidget id="summary-cards">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <DecisionMetricCard
            eyebrow="Portfolio value"
            title={formatCurrency(totalInvestmentValue, baseCurrency)}
            subtitle={`${holdings.length} holding${holdings.length === 1 ? "" : "s"}${brokerCash > 0 ? ` plus ${formatCurrency(brokerCash, baseCurrency)} cash` : ""}`}
            interpretation="Keep the total visible, but let concentration and data quality decide whether the detail below is ready to trust."
          />
          <DecisionMetricCard
            eyebrow="Open return"
            title={formatSignedCurrency(totalGainLoss, baseCurrency)}
            subtitle={`${totalGainLossPercent >= 0 ? "+" : ""}${totalGainLossPercent.toFixed(2)}% overall return`}
            interpretation="This stays deliberately quiet so it supports the risk story instead of overpowering it."
          />
          <DecisionMetricCard
            eyebrow="Cost basis"
            title={formatCurrency(totalCost, baseCurrency)}
            subtitle="Across every open holding"
            interpretation="Use this as the comparison anchor when you review gains, losses, and position sizes."
          />
          <DecisionMetricCard
            eyebrow="Realised gains"
            title={formatSignedCurrency(totalRealizedGain, baseCurrency)}
            subtitle={`${sales.length} sale${sales.length === 1 ? "" : "s"} recorded`}
            interpretation="Closed outcomes stay nearby so realised performance is not lost behind the live portfolio view."
          />
        </div>
      </DashboardWidget>

      <DashboardWidget id="charts">
        {holdings.length > 0 ? (
          <div className="space-y-4">
            <SectionHeader
              eyebrow="Risk confirmation"
              title="Use the charts to confirm the concentration story"
              description="These visuals should validate what the cockpit intro suggested about portfolio mix, not replace it."
            />
            <InvestmentCharts holdings={sortedHoldings} currency={baseCurrency} />
          </div>
        ) : null}
      </DashboardWidget>

      <DashboardWidget id="ai-analysis">
        {holdings.length > 0 ? (
          <div className="space-y-4">
            <SectionHeader
              eyebrow="Secondary read"
              title="AI analysis sits behind the core portfolio checks"
              description="Read this after the concentration, data quality, and realised gains signals above."
            />
            <PortfolioAIAnalysis />
          </div>
        ) : null}
      </DashboardWidget>

      <DashboardWidget id="holdings-table">
        {holdings.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <DecisionEmptyState
                title="No investments yet"
                description="Connect a broker or add a holding manually to start the portfolio cockpit."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <ConnectBrokerDialog
                      connectedBrokers={connectedBrokers}
                      investmentAccounts={investmentAccounts}
                    />
                    <AddHoldingDialog investmentAccounts={investmentAccounts} groups={groupOptions} />
                  </div>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <SectionHeader
              eyebrow="Holdings roster"
              title="Compare positions calmly before making changes"
              description="Mobile keeps each holding in a decision-card rhythm, while desktop lays the same information out for easier side-by-side reading."
            />

            <HoldingsRoster accountSections={rosterSections} currency={baseCurrency} />

            {sales.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Realised gains history</CardTitle>
                  <CardDescription>
                    Closed sales stay attached to the current portfolio so open and realised outcomes can be read together.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RealizedGainsTable sales={sales} baseCurrency={baseCurrency} />
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </DashboardWidget>
    </PageWidgetWrapper>
  );
}
