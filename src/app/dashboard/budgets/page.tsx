import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
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
import { getCategoriesByUser } from "@/db/queries/categories";
import { formatCurrency } from "@/lib/formatCurrency";
import { BudgetFormDialog } from "@/components/AddBudgetForm";
import { DeleteBudgetButton } from "@/components/DeleteBudgetButton";
import { ShareDialog } from "@/components/ShareDialog";
import { PendingInvitations } from "@/components/PendingInvitations";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { getCurrentUserId, getCurrentUserEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import dynamic from "next/dynamic";

const BudgetCharts = dynamic(
  () => import("@/components/BudgetCharts").then((mod) => mod.BudgetCharts),
  { loading: () => <div className="min-h-[300px]" /> }
);
import { BudgetAlertSettings } from "@/components/BudgetAlertSettings";
import { getAlertPreferencesByUser } from "@/db/queries/budget-alerts";
import { getSharesByOwner, getPendingInvitations } from "@/db/queries/sharing";

export default async function Budgets() {
  const userId = await getCurrentUserId();
  const email = await getCurrentUserEmail();
  
  const [ownedBudgets, sharedBudgetRows, categories, baseCurrency, alertPrefs, allShares, pendingInvitations, avgSpend] = await Promise.all([
    getBudgets(userId),
    getSharedBudgets(userId, email),
    getCategoriesByUser(userId),
    getUserBaseCurrency(userId),
    getAlertPreferencesByUser(userId),
    getSharesByOwner(userId),
    getPendingInvitations(userId, email),
    getAvgMonthlySpendByCategory(userId),
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

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.budgetSpent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overBudgetCount = budgets.filter((b) => b.budgetSpent > b.budgetAmount).length;
  const spentPercent = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : "0";
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
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

      {budgetPendingInvitations.length > 0 && (
        <PendingInvitations invitations={budgetPendingInvitations} />
      )}

      {/* Compact stats */}
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

      {budgets.length > 0 && (
        <BudgetCharts budgets={budgets} currency={baseCurrency} />
      )}

      {/* Budget cards */}
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
        <BlurFade delay={0.1} inView>
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
              <Card key={budget.id} className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
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
        </BlurFade>
      )}
    </div>
  );
}
