/**
 * Computes a composite Financial Health Score (0–100) from five sub-scores:
 *   1. Savings rate (0–25)
 *   2. Net worth trend (0–20)
 *   3. Debt-to-asset ratio (0–20)
 *   4. Budget adherence (0–20)
 *   5. Emergency fund coverage (0–15)
 *
 * Pure function — no side effects or DB access.
 */

export interface HealthScoreInput {
  readonly savingsRate: number; // percentage, e.g. 25 = 25%
  readonly netWorthPrevious: number;
  readonly netWorthCurrent: number;
  readonly totalLiabilities: number;
  readonly totalAssets: number;
  readonly budgets: readonly { spent: number; limit: number }[];
  readonly emergencyFundSaved: number;
  readonly monthlyExpenses: number;
}

export interface HealthSubScore {
  readonly label: string;
  readonly score: number;
  readonly maxScore: number;
  readonly description: string;
}

export interface HealthScoreResult {
  readonly overall: number; // 0–100
  readonly grade: "A" | "B" | "C" | "D" | "F";
  readonly subScores: readonly HealthSubScore[];
}

export function computeHealthScore(input: HealthScoreInput): HealthScoreResult {
  const subScores: HealthSubScore[] = [
    scoreSavingsRate(input.savingsRate),
    scoreNetWorthTrend(input.netWorthPrevious, input.netWorthCurrent),
    scoreDebtToAsset(input.totalLiabilities, input.totalAssets),
    scoreBudgetAdherence(input.budgets),
    scoreEmergencyFund(input.emergencyFundSaved, input.monthlyExpenses),
  ];

  const overall = Math.round(subScores.reduce((s, sub) => s + sub.score, 0));
  const grade = overallToGrade(overall);

  return { overall, grade, subScores };
}

// ---------------------------------------------------------------------------
// Sub-score calculators
// ---------------------------------------------------------------------------

function scoreSavingsRate(rate: number): HealthSubScore {
  const MAX = 25;
  // 20%+ rate → full marks; 0% → 0; linear between
  const score = Math.min(MAX, Math.max(0, (rate / 20) * MAX));
  return {
    label: "Savings Rate",
    score: Math.round(score * 10) / 10,
    maxScore: MAX,
    description: rate >= 20 ? "Excellent saver" : rate >= 10 ? "Good progress" : "Room to improve",
  };
}

function scoreNetWorthTrend(prev: number, current: number): HealthSubScore {
  const MAX = 20;
  if (prev <= 0) {
    // No baseline — give partial credit if current is positive
    const score = current > 0 ? MAX * 0.5 : 0;
    return { label: "Net Worth Trend", score, maxScore: MAX, description: "Not enough history" };
  }
  const growthPct = ((current - prev) / Math.abs(prev)) * 100;
  // 10%+ growth → full marks; negative → 0; linear between
  const score = Math.min(MAX, Math.max(0, (growthPct / 10) * MAX));
  return {
    label: "Net Worth Trend",
    score: Math.round(score * 10) / 10,
    maxScore: MAX,
    description: growthPct >= 10 ? "Strong growth" : growthPct > 0 ? "Growing" : "Declining",
  };
}

function scoreDebtToAsset(liabilities: number, assets: number): HealthSubScore {
  const MAX = 20;
  if (assets <= 0) {
    return { label: "Debt-to-Asset", score: liabilities === 0 ? MAX : 0, maxScore: MAX, description: "No assets tracked" };
  }
  const ratio = liabilities / assets;
  // 0% debt → full marks; ≥60% debt → 0; linear between
  const score = Math.min(MAX, Math.max(0, (1 - ratio / 0.6) * MAX));
  return {
    label: "Debt-to-Asset",
    score: Math.round(score * 10) / 10,
    maxScore: MAX,
    description: ratio < 0.2 ? "Very low debt" : ratio < 0.4 ? "Manageable" : "High debt load",
  };
}

function scoreBudgetAdherence(budgets: readonly { spent: number; limit: number }[]): HealthSubScore {
  const MAX = 20;
  if (budgets.length === 0) {
    return { label: "Budget Discipline", score: 0, maxScore: MAX, description: "No budgets set" };
  }
  const onTrack = budgets.filter((b) => b.spent <= b.limit).length;
  const pct = onTrack / budgets.length;
  const score = pct * MAX;
  return {
    label: "Budget Discipline",
    score: Math.round(score * 10) / 10,
    maxScore: MAX,
    description: pct >= 0.8 ? "On track" : pct >= 0.5 ? "Some overruns" : "Over budget",
  };
}

function scoreEmergencyFund(saved: number, monthlyExpenses: number): HealthSubScore {
  const MAX = 15;
  if (monthlyExpenses <= 0) {
    return { label: "Emergency Fund", score: saved > 0 ? MAX * 0.5 : 0, maxScore: MAX, description: "No expense data" };
  }
  const months = saved / monthlyExpenses;
  // 6+ months → full marks; 0 → 0; linear between
  const score = Math.min(MAX, Math.max(0, (months / 6) * MAX));
  return {
    label: "Emergency Fund",
    score: Math.round(score * 10) / 10,
    maxScore: MAX,
    description: months >= 6 ? "Fully funded" : months >= 3 ? "Partially funded" : "Under-funded",
  };
}

function overallToGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}
