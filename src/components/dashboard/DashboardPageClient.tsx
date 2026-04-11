"use client";

import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutGrid, Loader2, Pencil, Settings2, SlidersHorizontal } from "lucide-react";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import { DashboardInsights } from "@/components/dashboard/DashboardInsights";
import { DashboardMonthlyReport } from "@/components/dashboard/DashboardMonthlyReport";
import { DashboardCashflowForecast } from "@/components/dashboard/DashboardCashflowForecast";
import { DashboardAnomalies } from "@/components/dashboard/DashboardAnomalies";
import { DashboardWeeklyDigest } from "@/components/dashboard/DashboardWeeklyDigest";
import { DashboardBudgetProgress } from "@/components/dashboard/DashboardBudgetProgress";
import { DashboardRecentTransactions } from "@/components/dashboard/DashboardRecentTransactions";
import { DashboardUpcomingBills } from "@/components/dashboard/DashboardUpcomingBills";
import { DashboardZakatSummary } from "@/components/dashboard/DashboardZakatSummary";
import { SpendCategoryRow } from "@/components/SpendCategoryRow";
import { DashboardRetirement } from "@/components/dashboard/DashboardRetirement";
import { DashboardMilestones } from "@/components/dashboard/DashboardMilestones";
import { DashboardHealthScore } from "@/components/dashboard/DashboardHealthScore";
import { DashboardExpenseVelocity } from "@/components/dashboard/DashboardExpenseVelocity";
import { DashboardBillTimeline } from "@/components/dashboard/DashboardBillTimeline";
import { DashboardNudgeFeed } from "@/components/dashboard/DashboardNudgeFeed";
import { DashboardOverviewHero } from "@/components/dashboard/DashboardOverviewHero";
import { DashboardWidget } from "@/components/DashboardWidget";
import { ReadOnlyWidgetGrid } from "@/components/ReadOnlyWidgetGrid";
import { WidgetLayoutProvider } from "@/components/WidgetLayoutProvider";
import { WorkspaceTabs } from "@/components/ui/workspace-tabs";
import {
  ActionShelf,
  PriorityCard,
  PriorityStack,
} from "@/components/ui/cockpit";
import {
  DASHBOARD_WORKSPACE_TABS,
  type DashboardWorkspaceTab,
  groupDashboardLayoutByTab,
} from "@/components/dashboard/dashboard-workspace";
import type { WidgetLayoutItem } from "@/lib/widget-registry";
import type { Insight } from "@/db/queries/insights";
import type { NetWorthPoint } from "@/db/queries/net-worth";
import type { MonthlyCashflowPoint } from "@/db/queries/transactions";
import type { BudgetRow } from "@/db/queries/budgets";
import type { UpcomingRenewalRow } from "@/db/queries/subscriptions";
import type { TransactionWithDetails } from "@/lib/types";
import type { CashflowForecast } from "@/lib/cashflow-forecast";
import type { SpendingAnomaly } from "@/lib/spending-anomalies";
import type { RetirementProjection } from "@/lib/retirement-calculator";
import type { Milestone } from "@/lib/milestones";
import type { HealthScoreResult } from "@/lib/financial-health-score";
import type { Nudge } from "@/lib/nudges/types";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";
import { buildDashboardPriorityCards } from "@/components/dashboard/dashboard-decision";

type WidgetCustomizerModule = typeof import("../WidgetCustomizerClient");
type ActivationAction = "edit" | "customize";

let widgetCustomizerModulePromise: Promise<WidgetCustomizerModule> | null = null;

function loadWidgetCustomizerModule() {
  if (!widgetCustomizerModulePromise) {
    widgetCustomizerModulePromise = import("../WidgetCustomizerClient").catch((error) => {
      widgetCustomizerModulePromise = null;
      throw error;
    });
  }

  return widgetCustomizerModulePromise;
}

const CashflowCharts = dynamic(
  () => import("@/components/CashflowCharts").then((mod) => mod.CashflowCharts),
  { loading: () => <ChartSkeleton height={300} /> }
);
const NetWorthChart = dynamic(
  () => import("@/components/NetWorthChart").then((mod) => mod.NetWorthChart),
  { loading: () => <ChartSkeleton height={260} /> }
);

interface DashboardPageClientProps {
  readonly serverLayout: readonly WidgetLayoutItem[];
  readonly displayName: string;
  readonly monthName: string;
  readonly transactionsEnabled: boolean;
  readonly accountsEnabled: boolean;
  readonly investmentsEnabled: boolean;
  readonly reportsEnabled: boolean;
  readonly budgetsEnabled: boolean;
  readonly categoriesEnabled: boolean;
  readonly subscriptionsEnabled: boolean;
  readonly retirementEnabled: boolean;
  readonly zakatEnabled: boolean;
  readonly zakatData: { zakatDue: number; zakatableAmount: number; aboveNisab: boolean; daysUntil: number | null; hasSettings: boolean } | null;
  readonly insights: Insight[];
  readonly netWorth: number;
  readonly totalAssets: number;
  readonly totalLiabilities: number;
  readonly investmentValue: number;
  readonly baseCurrency: string;
  readonly netWorthHistory: NetWorthPoint[];
  readonly monthlyTrend: MonthlyCashflowPoint[];
  readonly forecast: CashflowForecast | null;
  readonly anomalies: SpendingAnomaly[];
  readonly upcomingRenewals: UpcomingRenewalRow[];
  readonly budgets: BudgetRow[];
  readonly budgetsAtRisk: BudgetRow[];
  readonly spendByCategory: { category: string; total: string | null; color: string }[];
  readonly expenses: number;
  readonly lastFiveTransactions: TransactionWithDetails[];
  readonly retirementProjection: RetirementProjection | null;
  readonly hasRetirementProfile: boolean;
  readonly milestones: readonly Milestone[];
  readonly healthScore: HealthScoreResult;
  readonly nudges: readonly Nudge[];
}

export function DashboardPageClient(props: DashboardPageClientProps) {
  const { serverLayout } = props;

  return (
    <WidgetLayoutProvider pageId="dashboard" serverLayout={serverLayout}>
      <DashboardPageContent {...props} />
    </WidgetLayoutProvider>
  );
}

function DashboardPageContent(props: DashboardPageClientProps) {
  const {
    displayName,
    monthName,
    transactionsEnabled,
    accountsEnabled,
    investmentsEnabled,
    reportsEnabled,
    budgetsEnabled,
    categoriesEnabled,
    subscriptionsEnabled,
    retirementEnabled,
    zakatEnabled,
    zakatData,
    insights,
    netWorth,
    totalAssets,
    totalLiabilities,
    investmentValue,
    baseCurrency,
    netWorthHistory,
    monthlyTrend,
    forecast,
    anomalies,
    upcomingRenewals,
    budgets,
    budgetsAtRisk,
    spendByCategory,
    expenses,
    lastFiveTransactions,
    retirementProjection,
    hasRetirementProfile,
    milestones,
    healthScore,
    nudges,
  } = props;
  const { layout, isCustomised } = useWidgetLayoutContext();
  const [activeTab, setActiveTab] = useState<DashboardWorkspaceTab>("overview");
  const [widgetCustomizerModule, setWidgetCustomizerModule] =
    useState<WidgetCustomizerModule | null>(null);
  const [loadingAction, setLoadingAction] = useState<ActivationAction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customizationError, setCustomizationError] = useState<string | null>(null);
  const groupedLayout = groupDashboardLayoutByTab(layout);
  const activeLayout = groupedLayout[activeTab];
  const dashboardPriorities = buildDashboardPriorityCards({
    budgetsAtRisk,
    anomalies,
    renewals: upcomingRenewals,
    retirementProjection,
    healthScore,
    nudges,
    currency: baseCurrency,
  });
  const primaryPriority = dashboardPriorities[0];
  const secondaryPriorities = dashboardPriorities.slice(1, 4);

  async function activateCustomization(action: ActivationAction) {
    setCustomizationError(null);

    if (widgetCustomizerModule) {
      if (action === "edit") {
        setIsEditing(true);
      } else {
        setDrawerOpen(true);
      }
      return;
    }

    setLoadingAction(action);
    try {
      const loadedModule = await loadWidgetCustomizerModule();
      setWidgetCustomizerModule(loadedModule);

      if (action === "edit") {
        setIsEditing(true);
      } else {
        setDrawerOpen(true);
      }
    } catch {
      setCustomizationError("Layout controls could not be loaded.");
    } finally {
      setLoadingAction(null);
    }
  }

  function renderWidget(widgetId: string) {
    switch (widgetId) {
      case "nudge-feed":
        return nudges.length > 0 ? <DashboardNudgeFeed nudges={nudges} /> : null;
      case "insights":
        return insights.length > 0 ? <DashboardInsights insights={insights} /> : null;
      case "monthly-report":
        return reportsEnabled ? <DashboardMonthlyReport /> : null;
      case "net-worth-history":
        return accountsEnabled && netWorthHistory.length >= 2 ? (
          <NetWorthChart data={netWorthHistory} currency={baseCurrency} />
        ) : null;
      case "cashflow":
        return reportsEnabled ? <CashflowCharts data={monthlyTrend} currency={baseCurrency} /> : null;
      case "cashflow-forecast":
        return reportsEnabled && forecast ? (
          <DashboardCashflowForecast forecast={forecast} />
        ) : null;
      case "anomalies":
        return reportsEnabled && anomalies.length > 0 ? (
          <DashboardAnomalies anomalies={anomalies} currency={baseCurrency} />
        ) : null;
      case "weekly-digest":
        return reportsEnabled ? <DashboardWeeklyDigest /> : null;
      case "upcoming-bills":
        return subscriptionsEnabled && upcomingRenewals.length > 0 ? (
          <DashboardUpcomingBills renewals={upcomingRenewals} currency={baseCurrency} />
        ) : null;
      case "budget-progress":
        return budgetsEnabled ? (
          <DashboardBudgetProgress
            budgets={budgets}
            budgetsAtRisk={budgetsAtRisk}
            currency={baseCurrency}
          />
        ) : null;
      case "category-spend":
        return categoriesEnabled ? (
          <Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {spendByCategory.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">No spend data yet.</p>
              ) : (
                spendByCategory.map((cat) => (
                  <SpendCategoryRow
                    key={cat.category}
                    category={cat.category}
                    total={cat.total}
                    color={cat.color}
                    totalExpenses={expenses}
                    currency={baseCurrency}
                  />
                ))
              )}
            </CardContent>
          </Card>
        ) : null;
      case "retirement":
        return retirementEnabled ? (
          <DashboardRetirement
            projection={retirementProjection}
            hasProfile={hasRetirementProfile}
            baseCurrency={baseCurrency}
          />
        ) : null;
      case "recent-transactions":
        return transactionsEnabled ? (
          <DashboardRecentTransactions transactions={lastFiveTransactions} currency={baseCurrency} />
        ) : null;
      case "zakat-summary":
        return zakatEnabled && zakatData ? (
          <DashboardZakatSummary
            zakatDue={zakatData.zakatDue}
            zakatableAmount={zakatData.zakatableAmount}
            aboveNisab={zakatData.aboveNisab}
            daysUntil={zakatData.daysUntil}
            hasSettings={zakatData.hasSettings}
            baseCurrency={baseCurrency}
          />
        ) : null;
      case "milestones":
        return milestones.length > 0 ? (
          <DashboardMilestones milestones={milestones} displayName={displayName} />
        ) : null;
      case "health-score":
        return <DashboardHealthScore healthScore={healthScore} />;
      case "expense-velocity":
        return reportsEnabled && forecast ? (
          <DashboardExpenseVelocity forecast={forecast} />
        ) : null;
      case "bill-timeline":
        return subscriptionsEnabled && upcomingRenewals.length > 0 ? (
          <DashboardBillTimeline renewals={upcomingRenewals} currency={baseCurrency} />
        ) : null;
      default:
        return null;
    }
  }

  const activeWidgets = activeLayout
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

  const activeTabMeta = DASHBOARD_WORKSPACE_TABS.find((tab) => tab.value === activeTab);
  const WidgetCustomizerControls = widgetCustomizerModule?.WidgetCustomizerControls;
  const EditableWidgetGrid = widgetCustomizerModule?.EditableWidgetGrid;

  return (
    <div className="cockpit-page mx-auto max-w-7xl px-4 py-5 md:px-10 md:py-8">
      <div className="cockpit-topbar">
        <div>
          <p className="cockpit-kicker">Workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back{displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{monthName}</p>
        </div>
      </div>

      <DashboardOverviewHero
        displayName={displayName}
        monthName={monthName}
        netWorth={netWorth}
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
        investmentValue={investmentsEnabled ? investmentValue : 0}
        currency={baseCurrency}
      />

      <ActionShelf
        eyebrow="Next step"
        title="Stay on top of the few things worth checking"
        description="The dashboard now surfaces one clear next action first, then keeps the rest of the workspace quieter."
      >
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          {primaryPriority ? (
            <PriorityCard
              title={primaryPriority.title}
              description={primaryPriority.summary}
              action={primaryPriority.href ? (
                <Button asChild size="sm" className="workspace-primary-action">
                  <Link href={primaryPriority.href}>
                    {primaryPriority.actionLabel ?? "Review now"}
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              ) : null}
            />
          ) : null}

          <div className="grid gap-3">
            <div className="workspace-surface rounded-[1.5rem] border border-[var(--workspace-card-border)] p-4">
              <p className="cockpit-kicker">Actions</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {transactionsEnabled ? (
                  <>
                    <QuickAddTransaction />
                    <Button asChild size="sm" className="workspace-primary-action">
                      <Link href="/dashboard/transactions">
                        Transactions <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="workspace-surface rounded-[1.5rem] border border-[var(--workspace-card-border)] p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="cockpit-kicker">Layout</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Secondary controls stay tucked away</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Layout
                  </span>
                  {WidgetCustomizerControls ? (
                    <WidgetCustomizerControls
                      isEditing={isEditing}
                      setIsEditing={setIsEditing}
                      drawerOpen={drawerOpen}
                      setDrawerOpen={setDrawerOpen}
                    />
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        disabled={loadingAction !== null}
                        onClick={() => void activateCustomization("edit")}
                      >
                        {loadingAction === "edit" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Pencil className="h-3.5 w-3.5" />
                        )}
                        Edit Layout
                      </Button>
                      <Button
                        aria-label="Customize layout"
                        variant="ghost"
                        size="icon"
                        className="relative h-8 w-8"
                        disabled={loadingAction !== null}
                        onClick={() => void activateCustomization("customize")}
                      >
                        {loadingAction === "customize" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Settings2 className="h-4 w-4" />
                        )}
                        {isCustomised ? (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
                        ) : null}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {customizationError ? (
                <p className="pt-2 text-xs text-muted-foreground">{customizationError}</p>
              ) : null}
            </div>
          </div>
        </div>
      </ActionShelf>

      {secondaryPriorities.length > 0 ? (
        <PriorityStack
          eyebrow="Priority stack"
          title="Keep the main signals in view"
          description="Each card explains what matters, why you should care, and where to go next."
        >
          {secondaryPriorities.map((priority) => (
            <PriorityCard
              key={priority.id}
              title={priority.title}
              description={priority.summary}
              action={priority.href ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={priority.href}>{priority.actionLabel ?? "Open"}</Link>
                </Button>
              ) : null}
            />
          ))}
        </PriorityStack>
      ) : null}

      <div className="workspace-surface rounded-[1.75rem] border border-[var(--workspace-card-border)] px-3 py-3 shadow-sm sm:px-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <WorkspaceTabs
              ariaLabel="Dashboard sections"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as DashboardWorkspaceTab)}
              tabs={DASHBOARD_WORKSPACE_TABS}
            />
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <div>
              <p className="text-sm font-semibold text-foreground">{activeTabMeta?.label}</p>
              <p className="text-xs text-muted-foreground">{activeTabMeta?.description}</p>
            </div>
          </div>
        </div>
      </div>

      <section
        id={`workspace-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`workspace-tab-${activeTab}`}
        className="space-y-4"
      >
        {activeWidgets.length > 0 ? (
          EditableWidgetGrid && isEditing ? (
            <EditableWidgetGrid>{activeWidgets}</EditableWidgetGrid>
          ) : (
            <ReadOnlyWidgetGrid>{activeWidgets}</ReadOnlyWidgetGrid>
          )
        ) : (
          <Card className="workspace-card border border-dashed border-[var(--workspace-card-border)] px-2 py-2 shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--workspace-muted-surface)] text-primary">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Nothing visible in {activeTabMeta?.label?.toLowerCase()} yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Use layout controls to bring modules into this workspace, or switch to another tab.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
