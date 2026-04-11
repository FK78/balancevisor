import { formatCompactCurrency, formatCurrency } from "@/lib/formatCurrency";
import type { HealthScoreResult } from "@/lib/financial-health-score";
import type { Nudge } from "@/lib/nudges/types";
import type { RetirementProjection } from "@/lib/retirement-calculator";
import type { SpendingAnomaly } from "@/lib/spending-anomalies";

type BudgetLike = {
  budgetCategory: string;
  budgetAmount: number;
  budgetSpent: number;
};

type RenewalLike = {
  name: string;
  amount: number;
  next_billing_date: string;
};

export type DashboardPriorityCard = {
  id: string;
  title: string;
  summary: string;
  actionLabel?: string;
  href?: string;
};

export function getBudgetUsagePercent(budget: BudgetLike) {
  return Math.round(getBudgetUsagePercentRaw(budget));
}

export function getBudgetUsagePercentRaw(budget: BudgetLike) {
  if (budget.budgetAmount <= 0) return 0;
  return (budget.budgetSpent / budget.budgetAmount) * 100;
}

export function getBudgetRiskScore(budget: BudgetLike) {
  if (budget.budgetAmount <= 0) return 0;
  return budget.budgetSpent / budget.budgetAmount;
}

export function getBudgetDecisionSummary({
  budgetsAtRisk,
  currency,
}: {
  budgetsAtRisk: BudgetLike[];
  currency: string;
}) {
  if (budgetsAtRisk.length === 0) {
    return {
      title: "Budgets are tracking to plan",
      summary: "No categories are close to their spending limit right now.",
      actionLabel: "View all budgets",
    };
  }

  const sorted = [...budgetsAtRisk].sort(
    (left, right) => getBudgetRiskScore(right) - getBudgetRiskScore(left),
  );
  const [primary, secondary] = sorted;

  const primarySummary =
    primary.budgetSpent > primary.budgetAmount
      ? `${primary.budgetCategory} is over by ${formatCurrency(
          primary.budgetSpent - primary.budgetAmount,
          currency,
        )}.`
      : `${primary.budgetCategory} is at ${getBudgetUsagePercent(primary)}% of budget.`;

  const secondarySummary = secondary
    ? secondary.budgetSpent > secondary.budgetAmount
      ? `${secondary.budgetCategory} is over by ${formatCurrency(
          secondary.budgetSpent - secondary.budgetAmount,
          currency,
        )}.`
      : `${secondary.budgetCategory} is at ${getBudgetUsagePercent(secondary)}% of budget.`
    : "Rebalance before more categories move into the danger zone.";

  return {
    title: `${sorted.length} budget${sorted.length === 1 ? "" : "s"} need attention`,
    summary: `${primarySummary} ${secondarySummary}`.trim(),
    actionLabel: "Review budget limits",
  };
}

export function getAnomalyDecisionSummary({
  anomalies,
  currency,
}: {
  anomalies: SpendingAnomaly[];
  currency: string;
}) {
  const sorted = getPrioritisedAnomalies(anomalies);
  const [primary, secondary] = sorted;

  if (!primary) {
    return {
      title: "No unusual spending signals",
      summary: "Your spending is lining up with its normal pattern this month.",
      actionLabel: "Review categories",
    };
  }

  const primarySummary = `${primary.category} is ${formatCurrency(
    primary.increaseAmount,
    currency,
  )} above usual spend this month.`;
  const secondarySummary = secondary
    ? `${secondary.category} is ${formatCurrency(
        secondary.increaseAmount,
        currency,
      )} above usual.`
    : "Review the category to confirm this is expected.";

  return {
    title: `${sorted.length} spending warning${sorted.length === 1 ? "" : "s"} to review`,
    summary: `${primarySummary} ${secondarySummary}`.trim(),
    actionLabel: "Review unusual spend",
  };
}

export function getPrioritisedAnomalies(anomalies: SpendingAnomaly[]) {
  return [...anomalies].sort((left, right) => {
    const increaseDifference = right.increaseAmount - left.increaseAmount;
    if (increaseDifference !== 0) return increaseDifference;
    return right.pctAbove - left.pctAbove;
  });
}

export function getDaysUntil(targetDate: string, now: Date = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${targetDate}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysLabel(days: number) {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function getUpcomingBillsDecisionSummary({
  renewals,
  currency,
  now = new Date(),
}: {
  renewals: RenewalLike[];
  currency: string;
  now?: Date;
}) {
  const sorted = [...renewals].sort((left, right) =>
    left.next_billing_date.localeCompare(right.next_billing_date),
  );
  const total = sorted.reduce((sum, renewal) => sum + renewal.amount, 0);
  const [primary, secondary] = sorted;

  if (!primary) {
    return {
      title: "No bills due soon",
      summary: "There are no upcoming renewals in your current watch window.",
      actionLabel: "Review upcoming bills",
    };
  }

  const primaryDays = getDaysUntil(primary.next_billing_date, now);
  const primarySummary =
    primaryDays < 0
      ? `${primary.name} is ${getDaysLabel(primaryDays)}`
      : primaryDays === 0
      ? `${primary.name} is due today`
      : `${primary.name} is due ${getDaysLabel(primaryDays).toLowerCase()}`;

  const secondarySummary = secondary
    ? `${secondary.name} follows ${getDaysLabel(
        getDaysUntil(secondary.next_billing_date, now),
      ).toLowerCase()}.`
    : "Make sure enough cash is available before it lands.";

  return {
    title: `${formatCurrency(total, currency)} due across ${sorted.length} bill${
      sorted.length === 1 ? "" : "s"
    }`,
    summary: `${primarySummary} and ${secondarySummary}`.replace(" and Make sure", ". Make sure"),
    actionLabel: "Review upcoming bills",
  };
}

export function getRetirementTakeaway(
  projection: RetirementProjection,
  currency: string,
) {
  const ageDelta = Math.abs(
    projection.estimatedRetirementAge - projection.targetRetirementAge,
  );

  if (projection.canRetireOnTarget) {
    if (ageDelta === 0) {
      return `On track for age ${projection.estimatedRetirementAge}, right on your target.`;
    }

    return `On track for age ${projection.estimatedRetirementAge}, about ${ageDelta} year${
      ageDelta === 1 ? "" : "s"
    } ahead of your target.`;
  }

  return `Off track by about ${ageDelta} year${
    ageDelta === 1 ? "" : "s"
  }. Closing a ${formatCompactCurrency(Math.abs(projection.fundGap), currency).replace("k", "K")} gap would get you back toward target.`;
}

export function buildDashboardPriorityCards({
  budgetsAtRisk,
  anomalies,
  renewals,
  retirementProjection,
  healthScore,
  nudges,
  currency,
}: {
  budgetsAtRisk: BudgetLike[];
  anomalies: SpendingAnomaly[];
  renewals: RenewalLike[];
  retirementProjection: RetirementProjection | null;
  healthScore: HealthScoreResult;
  nudges: readonly Nudge[];
  currency: string;
}): DashboardPriorityCard[] {
  const cards: DashboardPriorityCard[] = [];

  const budgetSummary = getBudgetDecisionSummary({ budgetsAtRisk, currency });
  cards.push({
    id: "budgets",
    title: budgetsAtRisk.length > 0 ? budgetSummary.title : "No budgets need attention",
    summary: budgetsAtRisk.length > 0
      ? budgetSummary.summary
      : "Your tracked categories are not showing any immediate budget pressure.",
    actionLabel: budgetSummary.actionLabel,
    href: "/dashboard/budgets",
  });

  if (anomalies.length > 0) {
    const anomalySummary = getAnomalyDecisionSummary({ anomalies, currency });
    cards.push({
      id: "anomalies",
      title: anomalySummary.title,
      summary: anomalySummary.summary,
      actionLabel: anomalySummary.actionLabel,
      href: "/dashboard/reports",
    });
  }

  if (renewals.length > 0) {
    const billsSummary = getUpcomingBillsDecisionSummary({ renewals, currency });
    cards.push({
      id: "bills",
      title: billsSummary.title,
      summary: billsSummary.summary,
      actionLabel: billsSummary.actionLabel,
      href: "/dashboard/subscriptions",
    });
  }

  if (retirementProjection) {
    cards.push({
      id: "retirement",
      title: retirementProjection.canRetireOnTarget
        ? "Retirement plan is holding course"
        : "Retirement plan needs a nudge",
      summary: getRetirementTakeaway(retirementProjection, currency),
      actionLabel: "Review retirement plan",
      href: "/dashboard/retirement",
    });
  }

  if (nudges.length > 0) {
    const topNudge = [...nudges].sort((left, right) => right.priority - left.priority)[0];
    cards.push({
      id: "nudges",
      title: `${nudges.length} suggestion${nudges.length === 1 ? "" : "s"} worth a look`,
      summary: topNudge?.body ?? "A few gentle nudges are ready for you to review.",
      actionLabel: topNudge?.actionLabel ?? "Open dashboard",
      href: topNudge?.actionUrl ?? "/dashboard",
    });
  }

  if (healthScore.overall < 85) {
    cards.push({
      id: "health-score",
      title: `Financial health is ${healthScore.grade}`,
      summary: `Your overall score is ${healthScore.overall}/100. The next best step is to work through the watch items below.`,
      actionLabel: "Review health signals",
      href: "/dashboard",
    });
  }

  return cards.slice(0, 4);
}
