import { formatCompactCurrency, formatCurrency } from "@/lib/formatCurrency";
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

export function getBudgetUsagePercent(budget: BudgetLike) {
  if (budget.budgetAmount <= 0) return 0;
  return Math.round((budget.budgetSpent / budget.budgetAmount) * 100);
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
  const sorted = [...anomalies].sort(
    (left, right) => right.increaseAmount - left.increaseAmount,
  );
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

export function getDaysUntil(targetDate: string, now: Date = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${targetDate}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysLabel(days: number) {
  if (days <= 0) return "Due today";
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
    primaryDays <= 0
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
