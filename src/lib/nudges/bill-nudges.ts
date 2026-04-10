import type { Nudge } from "./types";
import type { BillIncrease, UnusedSubscription } from "@/lib/subscription-health";
import { formatCurrency } from "@/lib/formatCurrency";

export function generateBillNudges(
  billIncreases: readonly BillIncrease[],
  unusedSubscriptions: readonly UnusedSubscription[],
  currency: string,
): Nudge[] {
  const nudges: Nudge[] = [];

  for (const inc of billIncreases.slice(0, 3)) {
    nudges.push({
      id: `bill-increase-${inc.subscriptionId}`,
      category: "watch",
      title: `${inc.name} went up ${inc.increasePercent}%`,
      body: `Your ${inc.name} bill increased from ${formatCurrency(inc.previousAmount, currency)} to ${formatCurrency(inc.currentAmount, currency)} per ${inc.billingCycle} cycle — that's ${formatCurrency(inc.monthlyImpact, currency)}/mo more.`,
      actionUrl: "/dashboard/subscriptions",
      actionLabel: "Review subscriptions",
      priority: 90,
      icon: "alert-triangle",
      savingsEstimate: inc.monthlyImpact,
      dismissible: true,
    });
  }

  for (const sub of unusedSubscriptions.slice(0, 3)) {
    const dayText =
      sub.daysSinceLastTransaction === -1
        ? "never been used"
        : `not been used in ${sub.daysSinceLastTransaction} days`;

    nudges.push({
      id: `unused-sub-${sub.subscriptionId}`,
      category: "save",
      title: `${sub.name} may be unused`,
      body: `Your ${sub.name} subscription (${formatCurrency(sub.monthlyAmount, currency)}/mo) has ${dayText}. Cancelling could save you ${formatCurrency(sub.monthlyAmount * 12, currency)}/year.`,
      actionUrl: "/dashboard/subscriptions",
      actionLabel: "Review subscription",
      priority: 85,
      icon: "scissors",
      savingsEstimate: sub.monthlyAmount,
      dismissible: true,
    });
  }

  return nudges;
}
