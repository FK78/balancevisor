import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGoals } from "@/db/queries/goals";
import { getGoalForecasts } from "@/lib/goal-forecast";
import { GoalForecastCard } from "@/components/GoalForecastCard";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { formatCurrency } from "@/lib/formatCurrency";
import { GoalFormDialog } from "@/components/GoalFormDialog";
import { ContributeGoalDialog } from "@/components/ContributeGoalDialog";
import { DeleteGoalButton } from "@/components/DeleteGoalButton";
import { Trophy } from "lucide-react";
import { ShareAchievementButton } from "@/components/ShareAchievementButton";
import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { DashboardWidget } from "@/components/DashboardWidget";
import { SecondaryPageIntro } from "@/components/SecondaryPageIntro";

export default async function GoalsPage() {
  await requireFeature("goals");
  const userId = await getCurrentUserId();
  const [goals, baseCurrency, serverLayout] = await Promise.all([
    getGoals(userId),
    getUserBaseCurrency(userId),
    getPageLayout(userId, "goals"),
  ]);

  const forecasts = goals.length > 0 ? await getGoalForecasts(userId, goals) : [];

  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved_amount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const completedGoals = goals.filter((goal) => goal.saved_amount >= goal.target_amount).length;
  const atRiskGoals = forecasts.filter((goal) => goal.status === "behind" || goal.status === "at_risk").length;
  const nextGoal = [...goals]
    .filter((goal) => goal.saved_amount < goal.target_amount)
    .sort((left, right) => {
      if (left.target_date && right.target_date) {
        return left.target_date.localeCompare(right.target_date);
      }
      if (left.target_date) return -1;
      if (right.target_date) return 1;
      return (left.target_amount - left.saved_amount) - (right.target_amount - right.saved_amount);
    })[0];

  // Precompute days-left for each goal (server component, runs once per request)
  const nowMs = new Date().getTime();
  const daysLeftMap = new Map<string, number | null>();
  for (const g of goals) {
    if (g.target_date) {
      const diff = new Date(g.target_date).getTime() - nowMs;
      daysLeftMap.set(g.id, Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    } else {
      daysLeftMap.set(g.id, null);
    }
  }

  const headerEl = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Goals</h1>
      </div>
      <GoalFormDialog />
    </div>
  );
  const overviewCardEl = goals.length > 0 ? (
    <Card>
      <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Trophy className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(totalSaved, baseCurrency)}{" "}
              <span className="text-base font-normal text-muted-foreground">
                of {formatCurrency(totalTarget, baseCurrency)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{overallPct}%</span>
              <span>{goals.length} goal{goals.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="bg-muted h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${Math.min(overallPct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <Trophy className="h-10 w-10 text-muted-foreground opacity-40" />
        <div>
          <p className="text-sm font-medium text-foreground">No goals yet</p>
          <p className="text-xs text-muted-foreground">
            Add your first goal so this page can highlight progress, pressure, and forecasted finish dates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
  const introEl = (
    <SecondaryPageIntro
      heroEyebrow="Goals"
      heroTitle="Turn savings targets into the next clear move"
      heroDescription={goals.length > 0
        ? `${completedGoals > 0 ? `${completedGoals} goal${completedGoals === 1 ? "" : "s"} are already complete.` : "The page starts with total progress."} From there, it keeps the next contribution and the most at-risk targets visible before the full goal grid.`
        : "Once goals are created, this cockpit will keep your overall progress and the next best contribution visible before the detailed cards."}
      heroAction={nextGoal ? (
        <ContributeGoalDialog goalId={nextGoal.id} goalName={nextGoal.name} />
      ) : (
        <GoalFormDialog />
      )}
      heroAside={(
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Saved</p>
            <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(totalSaved, baseCurrency)}</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Progress</p>
            <p className="mt-1 text-lg font-semibold text-white">{overallPct}%</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">At risk</p>
            <p className="mt-1 text-lg font-semibold text-white">{atRiskGoals}</p>
          </div>
        </div>
      )}
      actionShelfEyebrow="Next step"
      actionShelfTitle="Keep the strongest progress signal in view"
      actionShelfDescription="Overall progress stays fixed above the fold so adding a contribution or checking momentum never feels buried."
      actionShelfContent={overviewCardEl}
      priorities={{
        eyebrow: "Priority stack",
        title: "Focus on the goals that most deserve the next contribution",
        description: "These cards turn a long goal list into a quick decision about momentum, risk, and what is closest to completion.",
        items: [
          {
            id: "next-goal",
            title: nextGoal
              ? `${nextGoal.name} is the clearest next move`
              : "Every current goal is already complete",
            description: nextGoal
              ? `${formatCurrency(Math.max(nextGoal.target_amount - nextGoal.saved_amount, 0), baseCurrency)} remains, so a contribution here moves the plan forward fastest.`
              : "Use the add-goal action to set the next target once you are ready.",
          },
          {
            id: "at-risk",
            title: atRiskGoals > 0
              ? `${atRiskGoals} goal${atRiskGoals === 1 ? "" : "s"} are forecast as at risk`
              : "No goal is currently forecast as off track",
            description: atRiskGoals > 0
              ? "Check the forecast card below to see which targets need higher monthly contributions."
              : "Forecasts below can still help you rebalance timing and confidence.",
          },
          {
            id: "completed",
            title: `${completedGoals} goal${completedGoals === 1 ? "" : "s"} already completed`,
            description: completedGoals > 0
              ? "Completed targets are still visible in the grid, but the cockpit keeps momentum focused on what comes next."
              : "Your first completed goal will show up here as a progress milestone.",
          },
        ],
      }}
    />
  );

  return (
    <PageWidgetWrapper pageId="goals" serverLayout={serverLayout} header={headerEl} intro={introEl}>

      <DashboardWidget id="forecasts">
      {forecasts.length > 0 && (
        <GoalForecastCard forecasts={forecasts} currency={baseCurrency} />
      )}
      </DashboardWidget>

      <DashboardWidget id="goals-grid">
      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-sm font-medium">No goals yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Create a savings goal to start tracking your progress — whether it&apos;s
              a holiday fund, emergency savings, or a big purchase.
            </p>
            <GoalFormDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const pct = goal.target_amount > 0
              ? Math.min(Math.round((goal.saved_amount / goal.target_amount) * 100), 100)
              : 0;
            const isComplete = goal.saved_amount >= goal.target_amount;
            const remaining = Math.max(goal.target_amount - goal.saved_amount, 0);

            const daysLeft = daysLeftMap.get(goal.id) ?? null;

            return (
              <Card key={goal.id} className="relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-1 transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: goal.color,
                  }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        <Trophy className="h-4 w-4" style={{ color: goal.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{goal.name}</CardTitle>
                        {goal.target_date && (
                          <CardDescription className="text-xs">
                            {isComplete
                              ? "Completed!"
                              : daysLeft !== null
                              ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                              : ""}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <GoalFormDialog goal={goal} />
                      <DeleteGoalButton id={goal.id} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-end justify-between mb-1.5">
                      <span className="text-xl font-bold tabular-nums">
                        {formatCurrency(goal.saved_amount, baseCurrency)}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatCurrency(goal.target_amount, baseCurrency)}
                      </span>
                    </div>
                    <div className="bg-muted h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isComplete ? "bg-emerald-400" : ""}`}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isComplete ? undefined : goal.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
                      <span>{pct}% saved</span>
                      {!isComplete && (
                        <span>{formatCurrency(remaining, baseCurrency)} to go</span>
                      )}
                    </div>
                  </div>

                  {!isComplete && (
                    <ContributeGoalDialog goalId={goal.id} goalName={goal.name} />
                  )}

                  {isComplete && (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-600">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Goal reached!
                      </div>
                      <ShareAchievementButton
                        milestone={{
                          kind: "goal_completed",
                          title: `${goal.name} ✓`,
                          subtitle: "Savings goal reached",
                          stat: "100%",
                          detail: `Target: ${formatCurrency(goal.target_amount, baseCurrency)}`,
                          accent: "emerald",
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
    </PageWidgetWrapper>
  );
}
