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

const cycleLabels: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export default async function SubscriptionsPage() {
  const userId = await getCurrentUserId();

  const [subscriptions, totals, categories, accounts, baseCurrency] = await Promise.all([
    getSubscriptions(userId),
    getActiveSubscriptionsTotals(userId),
    getCategoriesByUser(userId),
    getAccountsWithDetails(userId),
    getUserBaseCurrency(userId),
  ]);

  const activeCount = subscriptions.filter((s) => s.is_active).length;
  const pausedCount = subscriptions.filter((s) => !s.is_active).length;

  const today = toDateString(new Date());
  const next7 = new Date();
  next7.setDate(next7.getDate() + 7);
  const next7Str = toDateString(next7);
  const upcomingCount = subscriptions.filter(
    (s) => s.is_active && s.next_billing_date >= today && s.next_billing_date <= next7Str
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Subscriptions</h1>
        </div>
        <SubscriptionFormDialog categories={categories} accounts={accounts} />
      </div>

      {/* Compact stats */}
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

      {/* Subscription cards */}
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
                className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${
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
    </div>
  );
}
