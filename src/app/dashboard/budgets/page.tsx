import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Users,
} from "lucide-react";
import { getBudgets, getSharedBudgets, getAvgMonthlySpendByCategory } from "@/db/queries/budgets";
import { getMonthlyCategorySpendTrend } from "@/db/queries/transactions";
import { getSmartBudgetSuggestions } from "@/lib/budget-suggestions";
import { getCategoriesByUser } from "@/db/queries/categories";
import { formatCurrency } from "@/lib/formatCurrency";
import { BudgetFormDialog } from "@/components/AddBudgetForm";
import { SmartBudgetSuggestions } from "@/components/SmartBudgetSuggestions";
import { DeleteBudgetButton } from "@/components/DeleteBudgetButton";
import { ShareDialog } from "@/components/ShareDialog";
import { PendingInvitations } from "@/components/PendingInvitations";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { getCurrentUserId, getCurrentUserEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import dynamic from "next/dynamic";

import { ChartSkeleton } from "@/components/ChartSkeleton";
const BudgetCharts = dynamic(
  () => import("@/components/BudgetCharts").then((mod) => mod.BudgetCharts),
  { loading: () => <ChartSkeleton height={300} /> }
);
import { BudgetAlertSettings } from "@/components/BudgetAlertSettings";
import { getAlertPreferencesByUser } from "@/db/queries/budget-alerts";
import { getSharesByOwner, getPendingInvitations } from "@/db/queries/sharing";
import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { DashboardWidget } from "@/components/DashboardWidget";
import { SecondaryPageIntro } from "@/components/SecondaryPageIntro";

export default async function Budgets() {
  await requireFeature("budgets");
  const userId = await getCurrentUserId();
  const email = await getCurrentUserEmail();
  
  const [ownedBudgets, sharedBudgetRows, categories, baseCurrency, alertPrefs, allShares, pendingInvitations, avgSpend, serverLayout, categoryTrend] = await Promise.all([
    getBudgets(userId),
    getSharedBudgets(userId, email),
    getCategoriesByUser(userId),
    getUserBaseCurrency(userId),
    getAlertPreferencesByUser(userId),
    getSharesByOwner(userId),
    getPendingInvitations(userId, email),
    getAvgMonthlySpendByCategory(userId),
    getPageLayout(userId, "budgets"),
    getMonthlyCategorySpendTrend(userId, 6),
  ]);

  const budgets = [...ownedBudgets, ...sharedBudgetRows];
  const budgetPendingInvitations = pendingInvitations.filter(i => i.resource_type === "budget");

  const budgetSharesMap = new Map<string, typeof allShares>();
  for (const share of allShares) {
    if (share.resource_type !== "budget") continue;
    const existing = budgetSharesMap.get(share.resource_id) ?? [];
    existing.push(share);
    budgetSharesMap.set(share.resource_id, existing);
  }

  const alertPrefsMap = new Map(alertPrefs.map(p => [p.budget_id, p]));

  const budgetSuggestions = await getSmartBudgetSuggestions(userId, ownedBudgets, categoryTrend);

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.budgetSpent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overBudgetCount = budgets.filter((b) => b.budgetSpent > b.budgetAmount).length;
  const atRiskCount = budgets.filter((b) => {
    if (b.budgetAmount <= 0) return false;
    const used = (b.budgetSpent / b.budgetAmount) * 100;
    return used >= 80;
  }).length;
  const spentPercent = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : "0";
  const statsCardEl = (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4 sm:divide-x sm:gap-0">
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="text-lg font-semibold tabular-nums">{formatCurrency(totalBudget, baseCurrency)}</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Spent ({spentPercent}%)</p>
          <p className="text-lg font-semibold tabular-nums text-violet-600">{formatCurrency(totalSpent, baseCurrency)}</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="text-lg font-semibold tabular-nums text-emerald-600">{formatCurrency(totalRemaining, baseCurrency)}</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Over Budget</p>
          <p className="text-lg font-semibold tabular-nums">{overBudgetCount}</p>
        </div>
      </CardContent>
    </Card>
  );
  const headerEl = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Budgets</h1>
      </div>
      {categories.length === 0 ? (
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/categories">Add Categories First</Link>
        </Button>
      ) : (
        <BudgetFormDialog categories={categories} avgSpendByCategory={avgSpend} />
      )}
    </div>
  );
  const introEl = (
    <SecondaryPageIntro
      heroEyebrow="Budgets"
      heroTitle="Keep your category limits ahead of the month"
      heroDescription={budgets.length > 0
        ? `${atRiskCount > 0 ? `${atRiskCount} budget${atRiskCount === 1 ? "" : "s"} are already close to the edge.` : "Most categories are still on track."} The cockpit keeps the pressure points visible before you drop into every category card.`
        : "Once you set category limits, this page will keep the month’s pressure points obvious before you dive into the full budget list."}
      heroAction={categories.length === 0 ? (
        <Button asChild size="sm" className="workspace-primary-action">
          <Link href="/dashboard/categories">Add categories first</Link>
        </Button>
      ) : (
        <BudgetFormDialog categories={categories} avgSpendByCategory={avgSpend} />
      )}
      heroAside={(
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Budget</p>
            <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(totalBudget, baseCurrency)}</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Remaining</p>
            <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(totalRemaining, baseCurrency)}</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">At risk</p>
            <p className="mt-1 text-lg font-semibold text-white">{atRiskCount}</p>
          </div>
        </div>
      )}
      actionShelfEyebrow="Next step"
      actionShelfTitle="Adjust the few categories that matter most"
      actionShelfDescription="Keep the month summary and the primary add action together so the page feels guided instead of scattered."
      actionShelfContent={statsCardEl}
      supportPanel={budgetPendingInvitations.length > 0 ? {
        eyebrow: "Shared budgets",
        title: "Invitations stay visible without taking over",
        description: "Pending shares can be reviewed quickly, then you can get straight back to the category plan.",
        content: <PendingInvitations invitations={budgetPendingInvitations} />,
      } : null}
      priorities={{
        eyebrow: "Priority stack",
        title: "See the categories most likely to need a change first",
        description: "The page should answer what is under pressure, what room is left, and where smart nudges can help.",
        items: [
          {
            id: "at-risk",
            title: atRiskCount > 0
              ? `${atRiskCount} budget${atRiskCount === 1 ? "" : "s"} need attention`
              : "No categories are under immediate pressure",
            description: atRiskCount > 0
              ? "Start with the categories that are already at or near their limit before they turn into cleanup work."
              : "You can use the deeper tools below to tune limits before the month gets busier.",
          },
          {
            id: "remaining",
            title: `${formatCurrency(totalRemaining, baseCurrency)} remains across active budgets`,
            description: budgets.length > 0
              ? "That remaining headroom is the quickest way to see how much flexibility the rest of the month still has."
              : "Once budgets exist, this card turns into the fastest read on how much space is left.",
          },
          {
            id: "suggestions",
            title: budgetSuggestions.length > 0
              ? `${budgetSuggestions.length} smart suggestion${budgetSuggestions.length === 1 ? "" : "s"} are ready`
              : "No smart budget changes are waiting right now",
            description: budgetSuggestions.length > 0
              ? "The suggestion feed below can help you tighten limits using recent spending patterns."
              : "When recent spending shifts enough to matter, suggestions will show up here first.",
          },
        ],
      }}
    />
  );

  return (
    <PageWidgetWrapper pageId="budgets" serverLayout={serverLayout} header={headerEl} intro={introEl}>

      <DashboardWidget id="suggestions">
      {budgetSuggestions.length > 0 && (
        <SmartBudgetSuggestions suggestions={budgetSuggestions} currency={baseCurrency} />
      )}
      </DashboardWidget>

      <DashboardWidget id="charts">
      {budgets.length > 0 && (
        <BudgetCharts budgets={budgets} currency={baseCurrency} />
      )}
      </DashboardWidget>

      <DashboardWidget id="budget-cards">
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Target className="h-10 w-10 opacity-40" />
            <div>
              <p className="text-sm font-medium text-foreground">No budgets yet</p>
              <p className="text-xs">Set category limits to monitor spending.</p>
            </div>
            {categories.length === 0 ? (
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/categories">Add a category first</Link>
              </Button>
            ) : (
              <BudgetFormDialog categories={categories} avgSpendByCategory={avgSpend} />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const percent = Math.min(
              (budget.budgetSpent / budget.budgetAmount) * 100,
              100
            );
            const remaining = budget.budgetAmount - budget.budgetSpent;
            const isOver = budget.budgetSpent > budget.budgetAmount;
            const isNear = percent >= 80 && !isOver;
            const Icon = getCategoryIcon(budget.budgetIcon);

            return (
              <Card key={budget.id} className="relative overflow-hidden transition-colors">
                <div className="p-5 space-y-4">
                  {/* Header: icon + name + actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {Icon ? (
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: budget.budgetColor + "15" }}
                        >
                          <Icon className="h-4.5 w-4.5" style={{ color: budget.budgetColor }} />
                        </div>
                      ) : (
                        <div
                          className="h-10 w-10 shrink-0 rounded-xl"
                          style={{ backgroundColor: budget.budgetColor + "15" }}
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold truncate">{budget.budgetCategory}</h3>
                        <p className="text-[11px] text-muted-foreground capitalize">{budget.budgetPeriod} budget</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {budget.isShared && (
                        <Badge variant="outline" className="gap-1 text-[10px] mr-1">
                          <Users className="h-3 w-3" />
                          Shared
                        </Badge>
                      )}
                      {!budget.isShared && (
                        <ShareDialog
                          resourceType="budget"
                          resourceId={budget.id}
                          resourceName={budget.budgetCategory}
                          existingShares={(budgetSharesMap.get(budget.id) ?? []).map(s => ({
                            id: s.id,
                            shared_with_email: s.shared_with_email,
                            permission: s.permission,
                            status: s.status,
                          }))}
                        />
                      )}
                      <BudgetAlertSettings
                        budgetId={budget.id}
                        budgetCategory={budget.budgetCategory}
                        prefs={alertPrefsMap.get(budget.id) ?? null}
                      />
                      {!budget.isShared && <BudgetFormDialog categories={categories} budget={budget} />}
                      {!budget.isShared && <DeleteBudgetButton budget={budget} />}
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold tabular-nums tracking-tight">
                        {formatCurrency(budget.budgetSpent, baseCurrency)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        of {formatCurrency(budget.budgetAmount, baseCurrency)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        isOver
                          ? "destructive"
                          : isNear
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {isOver ? "Over" : isNear ? "Almost" : "On track"}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver
                            ? "bg-red-400"
                            : isNear
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-xs">
                      <span className="text-muted-foreground tabular-nums">
                        {percent.toFixed(0)}% used
                      </span>
                      <span
                        className={`tabular-nums ${
                          isOver
                            ? "font-medium text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isOver
                          ? `${formatCurrency(Math.abs(remaining), baseCurrency)} over`
                          : `${formatCurrency(remaining, baseCurrency)} left`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      </DashboardWidget>
    </PageWidgetWrapper>
  );
}
