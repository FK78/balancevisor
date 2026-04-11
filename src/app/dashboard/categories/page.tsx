import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCategoriesByUser } from "@/db/queries/categories";
import { getCategorisationRules } from "@/db/queries/categorisation-rules";
import {
  getMonthlyCategorySpendTrend,
  getTotalSpendByCategoryThisMonth,
} from "@/db/queries/transactions";
import { CategoryFormDialog } from "@/components/CategoryFormDialog";
import { DeleteCategoryButton } from "@/components/DeleteCategoryButton";
import { CategorisationRuleFormDialog } from "@/components/CategorisationRuleForm";
import { DeleteRuleButton } from "@/components/DeleteRuleButton";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { Tags, Wand2 } from "lucide-react";
import dynamic from "next/dynamic";

import { ChartSkeleton } from "@/components/ChartSkeleton";
import { CategoriesCockpitIntro } from "@/components/categories/CategoriesCockpitIntro";
import {
  buildCategoriesCockpitModel,
} from "@/components/categories/categories-cockpit";
import { CategoryStructureGrid } from "@/components/categories/CategoryStructureGrid";
import { formatCurrency } from "@/lib/formatCurrency";
const CategoryCharts = dynamic(
  () => import("@/components/CategoryCharts").then((mod) => mod.CategoryCharts),
  { loading: () => <ChartSkeleton height={300} /> }
);

import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { DashboardWidget } from "@/components/DashboardWidget";

export default async function Categories() {
  await requireFeature("categories");
  const userId = await getCurrentUserId();

  const [categories, topSpendRows, monthlySpendRows, baseCurrency, rules, serverLayout] = await Promise.all([
    getCategoriesByUser(userId),
    getTotalSpendByCategoryThisMonth(userId),
    getMonthlyCategorySpendTrend(userId, 6),
    getUserBaseCurrency(userId),
    getCategorisationRules(userId),
    getPageLayout(userId, "categories"),
  ]);

  const topSpendByCategory = topSpendRows
    .map((row) => ({
      category: row.category,
      color: row.color,
      total: Number(row.total) || 0,
    }))
    .sort((a, b) => b.total - a.total);

  const cockpitModel = buildCategoriesCockpitModel({
    categories,
    topSpendByCategory,
    monthlySpendRows,
    rules,
  });

  const totalTrackedSpend = topSpendByCategory.reduce((sum, row) => sum + row.total, 0);
  const topCategoryName = topSpendByCategory[0]?.category ?? null;
  const categorySpendByName = new Map(topSpendByCategory.map((row) => [row.category, row.total]));
  const monthlyRowsByCategoryId = new Map<string, typeof monthlySpendRows>();

  for (const row of monthlySpendRows) {
    const existing = monthlyRowsByCategoryId.get(row.category_id) ?? [];
    monthlyRowsByCategoryId.set(row.category_id, [...existing, row]);
  }

  const categoryCards = [...categories]
    .map((category) => {
      const spend = categorySpendByName.get(category.name) ?? 0;
      const spendShare = totalTrackedSpend > 0 ? (spend / totalTrackedSpend) * 100 : 0;
      const monthlyRows = [...(monthlyRowsByCategoryId.get(category.id) ?? [])]
        .sort((left, right) => left.month.localeCompare(right.month));
      const latest = monthlyRows.at(-1) ?? null;
      const previous = monthlyRows.at(-2) ?? null;
      const changeRatio = latest && previous ? (latest.total - previous.total) / Math.max(previous.total, 1) : null;
      const directionLabel = changeRatio === null
        ? "Waiting for another month of spend"
        : `${changeRatio >= 0 ? "+" : ""}${Math.round(changeRatio * 100)}% vs last month`;

      let structureSignal = "Supporting category in the current structure";
      if (category.name === topCategoryName && spend > 0) {
        structureSignal = "Largest category this month";
      } else if (spendShare >= 15) {
        structureSignal = "Core part of this month's spend";
      } else if (changeRatio !== null && Math.abs(changeRatio) >= 0.2) {
        structureSignal = "Notable month-over-month shift";
      }

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        spendShare,
        spendLabel: spend > 0 ? `${formatCurrency(spend, baseCurrency)} this month` : "No tracked spend yet",
        shareLabel: totalTrackedSpend > 0 ? `${Math.round(spendShare)}% of tracked spend` : "Waiting for tracked spend",
        structureSignal,
        trendLabel: directionLabel,
        actions: (
          <div className="flex items-center gap-1">
            <CategoryFormDialog category={category} />
            <DeleteCategoryButton category={category} />
          </div>
        ),
      };
    })
    .sort((left, right) => right.spendShare - left.spendShare || left.name.localeCompare(right.name));

  const heroAction = cockpitModel.primaryAction.key === "add-rule" && categories.length > 0
    ? <CategorisationRuleFormDialog categories={categories} />
    : <CategoryFormDialog />;

  const headerEl = (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Categories</h1>
      </div>
    </div>
  );

  const introEl = (
    <CategoriesCockpitIntro
      model={cockpitModel}
      totalTrackedSpend={totalTrackedSpend}
      categoryCount={categories.length}
      ruleCount={rules.length}
      currency={baseCurrency}
      heroAction={heroAction}
      actionShelfContent={(
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <CategoryFormDialog />
            {categories.length > 0 ? <CategorisationRuleFormDialog categories={categories} /> : null}
            <span className="inline-flex items-center rounded-full border border-border/70 px-3 py-2 text-sm text-muted-foreground">
              Structure leads below
            </span>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Add categories when the spend story needs a better shape, then add rules to reduce clean-up on the transactions that repeat.
          </p>
        </div>
      )}
    />
  );

  return (
    <PageWidgetWrapper
      pageId="categories"
      serverLayout={serverLayout}
      header={headerEl}
      intro={introEl}
    >
      <DashboardWidget id="charts">
        {(topSpendByCategory.length > 0 || monthlySpendRows.length > 0) ? (
          <CategoryCharts
            topThisMonth={topSpendByCategory}
            monthlyRows={monthlySpendRows}
            currency={baseCurrency}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Spending structure charts</CardTitle>
              <CardDescription>
                Chart views will appear here once categories begin carrying tracked spend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground flex min-h-[220px] items-center justify-center text-sm">
                Add a few categories and categorised transactions to unlock the structure view.
              </div>
            </CardContent>
          </Card>
        )}
      </DashboardWidget>

      <DashboardWidget id="all-categories">
        <Card>
          <CardHeader>
            <CardTitle>Category structure grid</CardTitle>
            <CardDescription>
              Use these cards to compare category identity, share of spend, and trend before you make edits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="space-y-4">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Tags className="h-4 w-4" />
                  Categories will become more useful once they describe the structure of real spend.
                </div>
                <CategoryStructureGrid
                  categories={[]}
                  emptyAction={<CategoryFormDialog />}
                />
              </div>
            ) : (
              <CategoryStructureGrid categories={categoryCards} />
            )}
          </CardContent>
        </Card>
      </DashboardWidget>

      <DashboardWidget id="auto-rules">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 pb-2">
                  <Wand2 className="h-4 w-4" />
                  Automation quality control
                </CardTitle>
                <CardDescription>
                  Rules stay third on this page because they support the structure above rather than replacing it.
                </CardDescription>
              </div>
              {categories.length > 0 ? (
                <CategorisationRuleFormDialog categories={categories} />
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-10 text-center">
                <Wand2 className="h-10 w-10 opacity-40" />
                <div>
                  <p className="text-sm font-medium text-foreground">No rules yet</p>
                  <p className="text-xs">
                    Add rules after the category structure feels right so recurring transactions land cleanly.
                  </p>
                </div>
                {categories.length > 0 ? (
                  <CategorisationRuleFormDialog categories={categories} />
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 p-4 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Automation pattern
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <code className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium">
                          {rule.pattern}
                        </code>
                        <span className="text-xs text-muted-foreground">→</span>
                        {rule.categoryColor ? (
                          <span className="flex items-center gap-1.5 text-xs">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: rule.categoryColor }}
                            />
                            {rule.categoryName}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No category assigned</span>
                        )}
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Priority {rule.priority} in the automation stack
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <CategorisationRuleFormDialog categories={categories} rule={rule} />
                      <DeleteRuleButton ruleId={rule.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardWidget>
    </PageWidgetWrapper>
  );
}
