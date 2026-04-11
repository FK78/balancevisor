import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getRecurringTransactionsSummary } from "@/db/queries/recurring";
import { formatCurrency } from "@/lib/formatCurrency";
import { RecurringClient } from "@/components/RecurringClient";
import { detectRecurringCandidates } from "@/lib/recurring-detection";
import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { DashboardWidget } from "@/components/DashboardWidget";
import { SecondaryPageIntro } from "@/components/SecondaryPageIntro";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function RecurringPage() {
  await requireFeature("recurring");
  const userId = await getCurrentUserId();

  const [summary, baseCurrency, serverLayout, candidates] = await Promise.all([
    getRecurringTransactionsSummary(userId),
    getUserBaseCurrency(userId),
    getPageLayout(userId, "recurring"),
    detectRecurringCandidates(userId),
  ]);

  const {
    recurring,
    monthlyExpenses,
    monthlyIncome,
    upcomingCount,
  } = summary;
  const candidateCount = candidates.length;
  const monthlyNet = monthlyIncome - monthlyExpenses;

  const headerEl = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Recurring Transactions
        </h1>
      </div>
    </div>
  );
  const statsCardEl = (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4 sm:divide-x sm:gap-0">
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Expenses</p>
          <p className="text-lg font-semibold tabular-nums text-red-600">{formatCurrency(monthlyExpenses, baseCurrency)}</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="text-lg font-semibold tabular-nums text-emerald-600">{formatCurrency(monthlyIncome, baseCurrency)}</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Net</p>
          <p className={`text-lg font-semibold tabular-nums ${monthlyNet >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {monthlyNet >= 0 ? "+" : "−"}{formatCurrency(Math.abs(monthlyNet), baseCurrency)}
          </p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Due This Week</p>
          <p className="text-lg font-semibold tabular-nums">{upcomingCount}</p>
        </div>
      </CardContent>
    </Card>
  );
  const introEl = (
    <SecondaryPageIntro
      heroEyebrow="Recurring"
      heroTitle="Recurring money should feel predictable, not hidden"
      heroDescription={recurring.length > 0
        ? `${candidateCount > 0 ? `${candidateCount} pattern${candidateCount === 1 ? "" : "s"} are ready to convert into proper recurring entries.` : "Your recurring schedule is already mapped."} This cockpit keeps the cashflow shape and the next schedule review visible before the full list.`
        : "Once recurring entries exist, this page will keep the schedule, cashflow effect, and new pattern candidates visible before the deeper management tools."}
      heroAction={candidateCount > 0 ? (
        <Button asChild size="sm" className="workspace-primary-action">
          <Link href="/dashboard/transactions">Review source transactions</Link>
        </Button>
      ) : undefined}
      heroAside={(
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Recurring</p>
            <p className="mt-1 text-lg font-semibold text-white">{recurring.length}</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Candidates</p>
            <p className="mt-1 text-lg font-semibold text-white">{candidateCount}</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Due soon</p>
            <p className="mt-1 text-lg font-semibold text-white">{upcomingCount}</p>
          </div>
        </div>
      )}
      actionShelfEyebrow="Next step"
      actionShelfTitle="Keep the recurring cashflow picture in view"
      actionShelfDescription="Monthly inflows, outflows, and what is due next stay above the fold so the list below feels easier to manage."
      actionShelfContent={statsCardEl}
      priorities={{
        eyebrow: "Priority stack",
        title: "See what deserves the next schedule review first",
        description: "These cards turn recurring upkeep into a quick decision instead of a hidden admin task.",
        items: [
          {
            id: "candidates",
            title: candidateCount > 0
              ? `${candidateCount} recurring candidate${candidateCount === 1 ? "" : "s"} are waiting`
              : "No new recurring patterns need promoting right now",
            description: candidateCount > 0
              ? "Reviewing those source transactions is the quickest way to make future cashflow more predictable."
              : "When new repeating patterns emerge, they will appear here first.",
          },
          {
            id: "due",
            title: `${upcomingCount} recurring item${upcomingCount === 1 ? "" : "s"} are due this week`,
            description: upcomingCount > 0
              ? "That due-soon queue is the best place to confirm timing and keep projections honest."
              : "The list below is clear for deeper edits and maintenance.",
          },
          {
            id: "net",
            title: monthlyNet >= 0
              ? `${formatCurrency(monthlyNet, baseCurrency)} net positive each month`
              : `${formatCurrency(Math.abs(monthlyNet), baseCurrency)} more goes out than in each month`,
            description: "Keeping the recurring net visible makes it easier to judge whether a pattern should be edited, paused, or promoted.",
          },
        ],
      }}
    />
  );

  return (
    <PageWidgetWrapper pageId="recurring" serverLayout={serverLayout} header={headerEl} intro={introEl}>

      <DashboardWidget id="recurring-list">
      <RecurringClient
        recurring={recurring}
        candidates={candidates}
        currency={baseCurrency}
      />
      </DashboardWidget>
    </PageWidgetWrapper>
  );
}
