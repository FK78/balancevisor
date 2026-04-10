import { describe, it, expect } from "vitest";
import { computeHealthScore, type HealthScoreInput } from "@/lib/financial-health-score";

function makeInput(overrides: Partial<HealthScoreInput> = {}): HealthScoreInput {
  return {
    savingsRate: 0,
    netWorthPrevious: 0,
    netWorthCurrent: 0,
    totalLiabilities: 0,
    totalAssets: 0,
    budgets: [],
    emergencyFundSaved: 0,
    monthlyExpenses: 0,
    ...overrides,
  };
}

describe("computeHealthScore", () => {
  it("returns grade F when all inputs are zero", () => {
    const result = computeHealthScore(makeInput());
    expect(result.grade).toBe("F");
    expect(result.overall).toBeLessThanOrEqual(20);
    expect(result.subScores).toHaveLength(5);
  });

  it("returns grade A for excellent financial health", () => {
    const result = computeHealthScore(
      makeInput({
        savingsRate: 25,
        netWorthPrevious: 50000,
        netWorthCurrent: 60000,
        totalLiabilities: 5000,
        totalAssets: 100000,
        budgets: [
          { spent: 400, limit: 500 },
          { spent: 350, limit: 500 },
          { spent: 200, limit: 300 },
        ],
        emergencyFundSaved: 18000,
        monthlyExpenses: 2500,
      }),
    );

    expect(result.grade).toBe("A");
    expect(result.overall).toBeGreaterThanOrEqual(85);
  });

  // ── Savings rate sub-score ──

  it("gives full savings rate score at 20%+", () => {
    const result = computeHealthScore(makeInput({ savingsRate: 25 }));
    const sub = result.subScores.find((s) => s.label === "Savings Rate")!;
    expect(sub.score).toBe(sub.maxScore);
  });

  it("gives zero savings rate score at 0%", () => {
    const result = computeHealthScore(makeInput({ savingsRate: 0 }));
    const sub = result.subScores.find((s) => s.label === "Savings Rate")!;
    expect(sub.score).toBe(0);
  });

  // ── Net worth trend sub-score ──

  it("gives full net worth trend score at 10%+ growth", () => {
    const result = computeHealthScore(
      makeInput({ netWorthPrevious: 50000, netWorthCurrent: 56000 }),
    );
    const sub = result.subScores.find((s) => s.label === "Net Worth Trend")!;
    expect(sub.score).toBe(sub.maxScore);
  });

  it("gives zero net worth trend score when declining", () => {
    const result = computeHealthScore(
      makeInput({ netWorthPrevious: 50000, netWorthCurrent: 45000 }),
    );
    const sub = result.subScores.find((s) => s.label === "Net Worth Trend")!;
    expect(sub.score).toBe(0);
  });

  it("gives partial credit with no baseline but positive net worth", () => {
    const result = computeHealthScore(
      makeInput({ netWorthPrevious: 0, netWorthCurrent: 10000 }),
    );
    const sub = result.subScores.find((s) => s.label === "Net Worth Trend")!;
    expect(sub.score).toBeGreaterThan(0);
    expect(sub.score).toBeLessThan(sub.maxScore);
  });

  // ── Debt-to-asset sub-score ──

  it("gives full debt score when zero liabilities", () => {
    const result = computeHealthScore(
      makeInput({ totalAssets: 100000, totalLiabilities: 0 }),
    );
    const sub = result.subScores.find((s) => s.label === "Debt-to-Asset")!;
    expect(sub.score).toBe(sub.maxScore);
  });

  it("gives zero debt score when liabilities >= 60% of assets", () => {
    const result = computeHealthScore(
      makeInput({ totalAssets: 100000, totalLiabilities: 70000 }),
    );
    const sub = result.subScores.find((s) => s.label === "Debt-to-Asset")!;
    expect(sub.score).toBe(0);
  });

  // ── Budget adherence sub-score ──

  it("gives zero budget score when no budgets exist", () => {
    const result = computeHealthScore(makeInput({ budgets: [] }));
    const sub = result.subScores.find((s) => s.label === "Budget Discipline")!;
    expect(sub.score).toBe(0);
  });

  it("gives full budget score when all budgets on track", () => {
    const result = computeHealthScore(
      makeInput({
        budgets: [
          { spent: 80, limit: 100 },
          { spent: 90, limit: 100 },
        ],
      }),
    );
    const sub = result.subScores.find((s) => s.label === "Budget Discipline")!;
    expect(sub.score).toBe(sub.maxScore);
  });

  // ── Emergency fund sub-score ──

  it("gives full emergency fund score at 6+ months coverage", () => {
    const result = computeHealthScore(
      makeInput({ emergencyFundSaved: 15000, monthlyExpenses: 2000 }),
    );
    const sub = result.subScores.find((s) => s.label === "Emergency Fund")!;
    expect(sub.score).toBe(sub.maxScore);
  });

  it("gives zero emergency fund score with nothing saved", () => {
    const result = computeHealthScore(
      makeInput({ emergencyFundSaved: 0, monthlyExpenses: 2000 }),
    );
    const sub = result.subScores.find((s) => s.label === "Emergency Fund")!;
    expect(sub.score).toBe(0);
  });

  // ── Grade boundaries ──

  it("returns correct grade boundaries", () => {
    // The score mapping: A >= 85, B >= 70, C >= 55, D >= 40, F < 40
    const gradeA = computeHealthScore(
      makeInput({
        savingsRate: 25,
        netWorthPrevious: 50000,
        netWorthCurrent: 60000,
        totalAssets: 100000,
        totalLiabilities: 5000,
        budgets: [{ spent: 50, limit: 100 }, { spent: 50, limit: 100 }],
        emergencyFundSaved: 15000,
        monthlyExpenses: 2000,
      }),
    );
    expect(gradeA.grade).toBe("A");

    const gradeF = computeHealthScore(makeInput());
    expect(gradeF.grade).toBe("F");
  });

  it("overall score is sum of sub-scores, rounded", () => {
    const result = computeHealthScore(
      makeInput({
        savingsRate: 10,
        netWorthPrevious: 50000,
        netWorthCurrent: 52500,
        totalAssets: 80000,
        totalLiabilities: 20000,
        budgets: [{ spent: 80, limit: 100 }],
        emergencyFundSaved: 6000,
        monthlyExpenses: 2000,
      }),
    );
    const sumOfSubs = result.subScores.reduce((s, sub) => s + sub.score, 0);
    expect(result.overall).toBe(Math.round(sumOfSubs));
  });
});
