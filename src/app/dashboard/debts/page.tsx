import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDebtsSummary } from "@/db/queries/debts";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { formatCurrency } from "@/lib/formatCurrency";
import { DebtFormDialog } from "@/components/DebtFormDialog";
import { DebtPaymentDialog } from "@/components/DebtPaymentDialog";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";
import { deleteDebt } from "@/db/mutations/debts";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, TrendingDown, Percent } from "lucide-react";
import { ShareAchievementButton } from "@/components/ShareAchievementButton";
import { DebtAIAdvisor } from "@/components/DebtAIAdvisor";
import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { DashboardWidget } from "@/components/DashboardWidget";
import { DebtPayoffStrategies } from "@/components/DebtPayoffStrategies";
import { SecondaryPageIntro } from "@/components/SecondaryPageIntro";

export default async function DebtsPage() {
  await requireFeature("debts");
  const userId = await getCurrentUserId();
  const [summary, accounts, baseCurrency, serverLayout] = await Promise.all([
    getDebtsSummary(userId),
    getAccountsWithDetails(userId),
    getUserBaseCurrency(userId),
    getPageLayout(userId, "debts"),
  ]);

  const {
    debts,
    active,
    totalOriginal,
    totalRemaining,
    totalPaid,
    totalMinimumPayment,
    overallPct,
  } = summary;
  const highInterestCount = active.filter((debt) => debt.interest_rate >= 15).length;
  const nextDebt = [...active].sort((left, right) => {
    if (right.interest_rate !== left.interest_rate) {
      return right.interest_rate - left.interest_rate;
    }
    return right.remaining_amount - left.remaining_amount;
  })[0];

  const nowMs = new Date().getTime();
  const daysLeftMap = new Map<string, number | null>();
  for (const d of debts) {
    if (d.due_date) {
      const diff = new Date(d.due_date).getTime() - nowMs;
      daysLeftMap.set(d.id, Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    } else {
      daysLeftMap.set(d.id, null);
    }
  }

  const headerEl = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Debt Payoff Tracker</h1>
      </div>
      <DebtFormDialog />
    </div>
  );
  const overviewCardEl = active.length > 0 ? (
    <Card>
      <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
            <CreditCard className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Remaining</p>
            <p className="text-2xl font-bold tabular-nums text-red-600">
              {formatCurrency(totalRemaining, baseCurrency)}{" "}
              <span className="text-base font-normal text-muted-foreground">
                of {formatCurrency(totalOriginal, baseCurrency)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Paid Off</p>
            <p className="font-semibold tabular-nums text-emerald-600">
              {formatCurrency(totalPaid, baseCurrency)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Min. Monthly</p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(totalMinimumPayment, baseCurrency)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{overallPct}% paid</span>
                <span>{active.length} debt{active.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="bg-muted h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#34C759] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(overallPct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <CreditCard className="h-10 w-10 text-muted-foreground opacity-40" />
        <div>
          <p className="text-sm font-medium text-foreground">No debts tracked yet</p>
          <p className="text-xs text-muted-foreground">
            Add a debt and this page will surface the balances that deserve attention first.
          </p>
        </div>
      </CardContent>
    </Card>
  );
  const introEl = (
    <SecondaryPageIntro
      heroEyebrow="Debt payoff"
      heroTitle="Keep payoff momentum pointed at the right balances"
      heroDescription={active.length > 0
        ? `${highInterestCount > 0 ? `${highInterestCount} balance${highInterestCount === 1 ? "" : "s"} carry higher pressure.` : "The current debt stack is steady."} This cockpit keeps the payoff picture and the strongest next payment visible before the full card grid.`
        : "Once debts are added, this page will keep your payoff momentum, monthly pressure, and next best payment visible before the full tracker."}
      heroAction={nextDebt ? (
        <DebtPaymentDialog
          debtId={nextDebt.id}
          debtName={nextDebt.name}
          remainingAmount={nextDebt.remaining_amount}
          accounts={accounts}
        />
      ) : (
        <DebtFormDialog />
      )}
      heroAside={(
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Remaining</p>
            <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(totalRemaining, baseCurrency)}</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Minimums</p>
            <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(totalMinimumPayment, baseCurrency)}</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">High APR</p>
            <p className="mt-1 text-lg font-semibold text-white">{highInterestCount}</p>
          </div>
        </div>
      )}
      actionShelfEyebrow="Next step"
      actionShelfTitle="Keep the payoff picture steady before you dive into each balance"
      actionShelfDescription="The total remaining, monthly minimums, and progress summary stay fixed above the fold so the next payment decision stays grounded."
      actionShelfContent={overviewCardEl}
      priorities={{
        eyebrow: "Priority stack",
        title: "See where the pressure and momentum sit first",
        description: "These cards keep the most useful payoff context visible before the strategy tools and full debt list begin.",
        items: [
          {
            id: "next-debt",
            title: nextDebt
              ? `${nextDebt.name} is the strongest next payment candidate`
              : "No active balances need a payment right now",
            description: nextDebt
              ? `${formatCurrency(nextDebt.remaining_amount, baseCurrency)} remains${nextDebt.interest_rate > 0 ? ` at ${nextDebt.interest_rate}% APR` : ""}, so it is the clearest place to focus extra payoff energy.`
              : "Add a debt to start seeing payment guidance here.",
          },
          {
            id: "high-interest",
            title: highInterestCount > 0
              ? `${highInterestCount} balance${highInterestCount === 1 ? "" : "s"} carry high interest`
              : "No active balance is currently in the high-interest band",
            description: highInterestCount > 0
              ? "The strategy tools below can help you decide whether avalanche or snowball is the better fit."
              : "You can still use the deeper payoff strategy tools to model the fastest route to debt freedom.",
          },
          {
            id: "progress",
            title: `${overallPct}% of tracked debt has already been cleared`,
            description: totalOriginal > 0
              ? `${formatCurrency(totalPaid, baseCurrency)} has been paid back so far, which keeps the payoff story anchored in progress rather than only what is left.`
              : "Once debts are tracked, this card turns into the quickest read on payoff momentum.",
          },
        ],
      }}
    />
  );

  return (
    <PageWidgetWrapper pageId="debts" serverLayout={serverLayout} header={headerEl} intro={introEl}>

      <DashboardWidget id="debt-cards">
      {debts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-sm font-medium">No debts tracked yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Add a debt to start tracking your payoff progress — whether it&apos;s a
              credit card, student loan, or mortgage.
            </p>
            <DebtFormDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {debts.map((debt) => {
            const paid = debt.original_amount - debt.remaining_amount;
            const pct = debt.original_amount > 0
              ? Math.min(Math.round((paid / debt.original_amount) * 100), 100)
              : 0;
            const isPaidOff = debt.remaining_amount <= 0;
            const daysLeft = daysLeftMap.get(debt.id) ?? null;

            return (
              <Card key={debt.id} className="relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-1 transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isPaidOff ? "#10b981" : debt.color,
                  }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${debt.color}20` }}
                      >
                        <CreditCard className="h-4 w-4" style={{ color: debt.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{debt.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {isPaidOff
                            ? "Paid off!"
                            : debt.lender
                            ? debt.lender
                            : daysLeft !== null
                            ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} to target`
                            : ""}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {isPaidOff && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 gap-1 mr-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Paid Off
                        </Badge>
                      )}
                      <DebtFormDialog debt={debt} />
                      <DeleteConfirmButton
                        onDelete={async () => {
                          "use server";
                          await deleteDebt(debt.id);
                        }}
                        dialogTitle="Delete debt?"
                        dialogDescription={`This will permanently delete "${debt.name}" and all its payment history.`}
                        successTitle="Debt deleted"
                        successDescription={`"${debt.name}" has been removed.`}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-end justify-between mb-1.5">
                      <span className="text-xl font-bold tabular-nums">
                        {formatCurrency(debt.remaining_amount, baseCurrency)}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        of {formatCurrency(debt.original_amount, baseCurrency)}
                      </span>
                    </div>
                    <div className="bg-muted h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isPaidOff ? "bg-emerald-400" : ""}`}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isPaidOff ? undefined : debt.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
                      <span>{pct}% paid off</span>
                      {!isPaidOff && (
                        <span>{formatCurrency(debt.remaining_amount, baseCurrency)} remaining</span>
                      )}
                    </div>
                  </div>

                  {/* Debt details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {debt.interest_rate > 0 && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Percent className="h-3 w-3" />
                        <span>{debt.interest_rate}% APR</span>
                      </div>
                    )}
                    {debt.minimum_payment > 0 && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingDown className="h-3 w-3" />
                        <span>{formatCurrency(debt.minimum_payment, baseCurrency)}/mo</span>
                      </div>
                    )}
                  </div>

                  {!isPaidOff && (
                    <DebtPaymentDialog
                      debtId={debt.id}
                      debtName={debt.name}
                      remainingAmount={debt.remaining_amount}
                      accounts={accounts}
                    />
                  )}

                  {isPaidOff && (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Debt free!
                      </div>
                      <ShareAchievementButton
                        milestone={{
                          kind: "debt_paid_off",
                          title: `${debt.name}: Paid Off`,
                          subtitle: "Debt cleared",
                          stat: formatCurrency(debt.original_amount, baseCurrency),
                          detail: null,
                          accent: "amber",
                          achievedAt: new Date().toISOString().split("T")[0],
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </DashboardWidget>

      <DashboardWidget id="payoff-strategies">
      {active.length >= 2 && (
        <DebtPayoffStrategies
          debts={active.map((d) => ({
            id: d.id,
            name: d.name,
            remaining_amount: d.remaining_amount,
            interest_rate: d.interest_rate,
            minimum_payment: d.minimum_payment,
            color: d.color,
          }))}
          totalMinimumPayment={totalMinimumPayment}
          currency={baseCurrency}
        />
      )}
      </DashboardWidget>

      <DashboardWidget id="ai-advisor">
      {active.length > 0 && <DebtAIAdvisor />}
      </DashboardWidget>
    </PageWidgetWrapper>
  );
}
