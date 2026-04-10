import type { NetWorthPoint } from "@/db/queries/net-worth";
import type { MonthlyCashflowPoint } from "@/db/queries/transactions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MilestoneKind =
  | "net_worth_growth"
  | "goal_completed"
  | "debt_paid_off"
  | "savings_streak"
  | "budget_adherence"
  | "funny";

export interface Milestone {
  readonly kind: MilestoneKind;
  readonly title: string;
  readonly subtitle: string;
  /** Primary stat displayed prominently (e.g. "+34%", "6 months", "£24,500") */
  readonly stat: string;
  /** Optional secondary detail line */
  readonly detail: string | null;
  /** Accent colour class (tailwind) */
  readonly accent: "blue" | "emerald" | "amber" | "violet" | "rose";
  /** ISO date string of when the milestone was achieved (best guess) */
  readonly achievedAt: string;
}

// ---------------------------------------------------------------------------
// Input shapes (minimal — callers pass what they already have)
// ---------------------------------------------------------------------------

export interface MilestoneInput {
  readonly netWorthHistory: readonly NetWorthPoint[];
  readonly monthlyTrend: readonly MonthlyCashflowPoint[];
  readonly goals: readonly { id: string; name: string; target_amount: number; saved_amount: number }[];
  readonly debts: readonly { id: string; name: string; original_amount: number; remaining_amount: number }[];
  readonly budgets: readonly { id: string; spent: number; limit: number }[];
  readonly currency: string;
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

export function detectMilestones(input: MilestoneInput): readonly Milestone[] {
  const milestones: Milestone[] = [];
  const now = new Date().toISOString().split("T")[0];

  detectNetWorthGrowth(input, milestones, now);
  detectCompletedGoals(input, milestones, now);
  detectPaidOffDebts(input, milestones, now);
  detectSavingsStreak(input, milestones, now);
  detectBudgetAdherence(input, milestones, now);

  // Sort: most recent first, then by kind for stability
  milestones.sort((a, b) => b.achievedAt.localeCompare(a.achievedAt));

  return milestones;
}

// ---------------------------------------------------------------------------
// Individual detectors
// ---------------------------------------------------------------------------

function detectNetWorthGrowth(
  { netWorthHistory }: MilestoneInput,
  out: Milestone[],
  now: string,
): void {
  if (netWorthHistory.length < 2) return;

  const latest = netWorthHistory[netWorthHistory.length - 1];
  const oldestInRange = netWorthHistory[0];

  if (!latest || !oldestInRange) return;

  const oldVal = oldestInRange.net_worth;
  const newVal = latest.net_worth;

  // Only flag positive growth of at least 5%
  if (oldVal <= 0 || newVal <= oldVal) return;

  const pctGrowth = Math.round(((newVal - oldVal) / Math.abs(oldVal)) * 100);
  if (pctGrowth < 5) return;

  out.push({
    kind: "net_worth_growth",
    title: `Net Worth ↗ +${pctGrowth}%`,
    subtitle: "Growth over tracked period",
    stat: `+${pctGrowth}%`,
    detail: null,
    accent: "blue",
    achievedAt: latest.date ?? now,
  });
}

function detectCompletedGoals(
  { goals }: MilestoneInput,
  out: Milestone[],
  now: string,
): void {
  for (const goal of goals) {
    if (goal.saved_amount >= goal.target_amount) {
      out.push({
        kind: "goal_completed",
        title: `${goal.name} ✓`,
        subtitle: "Savings goal reached",
        stat: "100%",
        detail: `Target: ${goal.target_amount.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}`,
        accent: "emerald",
        achievedAt: now,
      });
    }
  }
}

function detectPaidOffDebts(
  { debts }: MilestoneInput,
  out: Milestone[],
  now: string,
): void {
  for (const debt of debts) {
    if (debt.remaining_amount <= 0 && debt.original_amount > 0) {
      out.push({
        kind: "debt_paid_off",
        title: `${debt.name}: Paid Off`,
        subtitle: "Debt cleared",
        stat: debt.original_amount.toLocaleString("en-GB", { style: "currency", currency: "GBP" }),
        detail: null,
        accent: "amber",
        achievedAt: now,
      });
    }
  }
}

function detectSavingsStreak(
  { monthlyTrend }: MilestoneInput,
  out: Milestone[],
  now: string,
): void {
  if (monthlyTrend.length < 2) return;

  // Count consecutive months with positive net, starting from the most recent
  let streak = 0;
  for (let i = monthlyTrend.length - 1; i >= 0; i--) {
    if (monthlyTrend[i].net > 0) {
      streak++;
    } else {
      break;
    }
  }

  // Only flag streaks of 3+ months
  if (streak < 3) return;

  out.push({
    kind: "savings_streak",
    title: `${streak}-Month Savings Streak`,
    subtitle: "Consecutive months with positive savings",
    stat: `${streak} months`,
    detail: null,
    accent: "violet",
    achievedAt: now,
  });
}

function detectBudgetAdherence(
  { budgets }: MilestoneInput,
  out: Milestone[],
  now: string,
): void {
  if (budgets.length < 2) return;

  const onTrack = budgets.filter((b) => b.spent <= b.limit).length;
  const pct = Math.round((onTrack / budgets.length) * 100);

  // Only flag if 80%+ budgets are on track
  if (pct < 80) return;

  out.push({
    kind: "budget_adherence",
    title: `${pct}% Budgets On Track`,
    subtitle: `${onTrack} of ${budgets.length} budgets within limits`,
    stat: `${pct}%`,
    detail: null,
    accent: "rose",
    achievedAt: now,
  });
}
