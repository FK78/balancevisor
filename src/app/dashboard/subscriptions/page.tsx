import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  ExternalLink,
  Repeat,
} from "lucide-react";
import { getSubscriptions, getActiveSubscriptionsTotals, toMonthlyAmount } from "@/db/queries/subscriptions";
import { getCategoriesByUser } from "@/db/queries/categories";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getCurrentUserId } from "@/lib/auth";
import { toDateString } from "@/lib/date";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { formatCurrency } from "@/lib/formatCurrency";
import { SubscriptionFormDialog } from "@/components/SubscriptionFormDialog";
import { DeleteSubscriptionButton } from "@/components/DeleteSubscriptionButton";
import { ToggleSubscriptionButton } from "@/components/ToggleSubscriptionButton";
import { SubscriptionAIAdvisor } from "@/components/SubscriptionAIAdvisor";
import { SubscriptionHealthBanner } from "@/components/SubscriptionHealthBanner";
import { SwitchingAdvisor } from "@/components/SwitchingAdvisor";
import { getSubscriptionHealthReport } from "@/lib/subscription-health";

const cycleLabels: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { DashboardWidget } from "@/components/DashboardWidget";
import { SecondaryPageIntro } from "@/components/SecondaryPageIntro";

export default async function SubscriptionsPage() {
  await requireFeature("subscriptions");
  const userId = await getCurrentUserId();

  const [subscriptions, totals, categories, accounts, baseCurrency, serverLayout, healthReport] = await Promise.all([
    getSubscriptions(userId),
    getActiveSubscriptionsTotals(userId),
    getCategoriesByUser(userId),
    getAccountsWithDetails(userId),
    getUserBaseCurrency(userId),
    getPageLayout(userId, "subscriptions"),
    getSubscriptionHealthReport(userId),
  ]);

  const activeCount = subscriptions.filter((s) => s.is_active).length;
  const pausedCount = subscriptions.filter((s) => !s.is_active).length;
  const totalIssues =
    healthReport.billIncreases.length
    + healthReport.unusedSubscriptions.length
    + healthReport.overlaps.length;

  const today = toDateString(new Date());
  const next7 = new Date();
  next7.setDate(next7.getDate() + 7);
  const next7Str = toDateString(next7);
  const upcomingCount = subscriptions.filter(
    (s) => s.is_active && s.next_billing_date >= today && s.next_billing_date <= next7Str
  ).length;

  const headerEl = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Subscriptions</h1>
      </div>
      <SubscriptionFormDialog categories={categories} accounts={accounts} />
    </div>
  );
  const statsCardEl = (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4 sm:divide-x sm:gap-0">
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Monthly</p>
          <p className="text-lg font-semibold tabular-nums">{formatCurrency(totals.monthly, baseCurrency)}</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Yearly</p>
          <p className="text-lg font-semibold tabular-nums text-violet-600">{formatCurrency(totals.yearly, baseCurrency)}</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Due This Week</p>
          <p className="text-lg font-semibold tabular-nums">{upcomingCount}</p>
        </div>
        <div className="px-4 text-center">
          <p className="text-xs text-muted-foreground">Paused</p>
          <p className="text-lg font-semibold tabular-nums">{pausedCount}</p>
        </div>
      </CardContent>
    </Card>
  );
  const introEl = (
    <SecondaryPageIntro
      heroEyebrow="Subscriptions"
      heroTitle="Keep recurring costs honest and easy to question"
      heroDescription={activeCount > 0
        ? `${upcomingCount > 0 ? `${upcomingCount} renewal${upcomingCount === 1 ? "" : "s"} land this week.` : "The current renewal queue is calm."} This cockpit keeps the headline cost, health flags, and next decision visible before the full subscription roster.`
        : "Once subscriptions are tracked, this page will surface recurring cost pressure and review opportunities before you scan the full list."}
      heroAction={<SubscriptionFormDialog categories={categories} accounts={accounts} />}
      heroAside={(
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Monthly</p>
            <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(totals.monthly, baseCurrency)}</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Due soon</p>
            <p className="mt-1 text-lg font-semibold text-white">{upcomingCount}</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Issues</p>
            <p className="mt-1 text-lg font-semibold text-white">{totalIssues}</p>
          </div>
        </div>
      )}
      actionShelfEyebrow="Next step"
      actionShelfTitle="Keep the cost picture steady before you review each service"
      actionShelfDescription="Monthly spend, annual weight, and near-term renewals stay above the fold so your decisions do not depend on scanning the whole grid."
      actionShelfContent={statsCardEl}
      supportPanel={{
        eyebrow: "Health check",
        title: totalIssues > 0 ? "A few subscriptions deserve another look" : "The subscription stack looks healthy",
        description: totalIssues > 0
          ? "Price changes, unused services, and overlapping categories stay close to the top so they are easier to act on."
          : "No price spikes, overlap, or likely unused services are currently standing out.",
        content: <SubscriptionHealthBanner report={healthReport} currency={baseCurrency} />,
      }}
      priorities={{
        eyebrow: "Priority stack",
        title: "Know what to question before you open each subscription",
        description: "These cards keep the most decision-relevant subscription signals visible first.",
        items: [
          {
            id: "renewals",
            title: upcomingCount > 0
              ? `${upcomingCount} subscription${upcomingCount === 1 ? "" : "s"} renew this week`
              : "No renewals are due in the next seven days",
            description: upcomingCount > 0
              ? "That near-term queue is the best place to confirm value, cancel unused services, or pause spending."
              : "The roster below is still available for deeper cleanup and optimisation.",
          },
          {
            id: "health",
            title: totalIssues > 0
              ? `${totalIssues} subscription health issue${totalIssues === 1 ? "" : "s"} found`
              : "No health issues are standing out right now",
            description: totalIssues > 0
              ? `${formatCurrency(healthReport.potentialMonthlySavings, baseCurrency)} per month could be recoverable from the flagged services.`
              : "The page can stay focused on upkeep and switching opportunities instead of cleanup.",
          },
          {
            id: "paused",
            title: `${pausedCount} subscription${pausedCount === 1 ? "" : "s"} are paused`,
            description: pausedCount > 0
              ? "Paused services stay visible so they do not quietly drift back into spend without a deliberate choice."
              : "If you pause services later, they will appear here as part of the decision summary.",
          },
        ],
      }}
    />
  );

  return (
    <PageWidgetWrapper pageId="subscriptions" serverLayout={serverLayout} header={headerEl} intro={introEl}>

      <DashboardWidget id="subscription-cards">
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Repeat className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-sm font-medium">No subscriptions yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Add your first subscription to start tracking recurring costs like
              Netflix, Spotify, gym memberships, and more.
            </p>
            <SubscriptionFormDialog categories={categories} accounts={accounts} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => {
            const monthlyEquiv = toMonthlyAmount(sub.amount, sub.billing_cycle);
            const isOverdue = sub.is_active && sub.next_billing_date < today;
            const isDueSoon =
              sub.is_active &&
              sub.next_billing_date >= today &&
              sub.next_billing_date <= next7Str;

            return (
              <Card
                key={sub.id}
                className={`relative overflow-hidden transition-colors ${
                  !sub.is_active ? "opacity-60" : ""
                }`}
              >
                <div
                  className="absolute top-0 left-0 h-1 w-full"
                  style={{ backgroundColor: sub.is_active ? sub.color : "transparent" }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: sub.color + "18" }}
                      >
                        <Repeat className="h-4.5 w-4.5" style={{ color: sub.color }} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{sub.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {cycleLabels[sub.billing_cycle] ?? sub.billing_cycle}
                          {sub.categoryName && (
                            <>
                              {" · "}
                              <span
                                className="inline-flex items-center gap-1"
                              >
                                <span
                                  className="inline-block h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: sub.categoryColor ?? undefined }}
                                />
                                {sub.categoryName}
                              </span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {sub.url && (
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <a href={sub.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      <ToggleSubscriptionButton id={sub.id} isActive={sub.is_active} />
                      <SubscriptionFormDialog
                        subscription={{
                          id: sub.id,
                          name: sub.name,
                          amount: sub.amount,
                          currency: sub.currency,
                          billing_cycle: sub.billing_cycle,
                          next_billing_date: sub.next_billing_date,
                          category_id: sub.category_id,
                          account_id: sub.account_id,
                          url: sub.url,
                          notes: sub.notes,
                          color: sub.color,
                          icon: sub.icon,
                        }}
                        categories={categories}
                        accounts={accounts}
                      />
                      <DeleteSubscriptionButton id={sub.id} name={sub.name} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold tabular-nums tracking-tight">
                        {formatCurrency(sub.amount, baseCurrency)}
                      </p>
                      {sub.billing_cycle !== "monthly" && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ≈ {formatCurrency(monthlyEquiv, baseCurrency)}/mo
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {!sub.is_active && (
                        <Badge variant="secondary">Paused</Badge>
                      )}
                      {isOverdue && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                      {isDueSoon && !isOverdue && (
                        <Badge variant="outline" className="border-sky-300 text-sky-600">Due soon</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <span className="flex items-center gap-1.5">
                      <CalendarClock className="h-3 w-3" />
                      Next: {new Date(sub.next_billing_date + "T00:00:00").toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {sub.notes && (
                    <p className="text-xs text-muted-foreground truncate">{sub.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </DashboardWidget>

      <DashboardWidget id="ai-advisor">
      {activeCount > 0 && <SubscriptionAIAdvisor />}
      </DashboardWidget>

      <DashboardWidget id="switching-advisor">
      {activeCount > 0 && <SwitchingAdvisor />}
      </DashboardWidget>
    </PageWidgetWrapper>
  );
}
