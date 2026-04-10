import { getMonthlyCategorySpendTrend, type MonthlyCategorySpendPoint } from "@/db/queries/transactions";
import { getMonthKey } from "@/lib/date";

export type SpendingAnomaly = {
  category: string;
  color: string;
  currentSpend: number;
  avgSpend: number;
  /** How much above average as a percentage (e.g. 75 means 75% above) */
  pctAbove: number;
  /** Absolute increase over average */
  increaseAmount: number;
};

interface AnomalyOptions {
  prefetchedCategoryTrend?: MonthlyCategorySpendPoint[];
}

/**
 * Detects categories where current-month spending is significantly above
 * the 3-month rolling average of completed months.
 * Returns anomalies sorted by pctAbove descending, capped at 5.
 */
export async function getSpendingAnomalies(userId: string, opts: AnomalyOptions = {}): Promise<SpendingAnomaly[]> {
  // Fetch 4 months so we get current + 3 completed
  const trend = opts.prefetchedCategoryTrend ?? await getMonthlyCategorySpendTrend(userId, 4);
  const currentMonthKey = getMonthKey(new Date());

  // Separate current month from history
  const currentMonth = trend.filter((r) => r.month === currentMonthKey);
  const history = trend.filter((r) => r.month !== currentMonthKey);

  const completedMonths = new Set(history.map((r) => r.month));
  const monthCount = Math.max(completedMonths.size, 1);

  // Build average spend per category from completed months
  const avgByCategory = new Map<string, { total: number; color: string }>();
  for (const row of history) {
    const existing = avgByCategory.get(row.category);
    if (existing) {
      existing.total += row.total;
    } else {
      avgByCategory.set(row.category, { total: row.total, color: row.color });
    }
  }

  const anomalies: SpendingAnomaly[] = [];

  for (const row of currentMonth) {
    const hist = avgByCategory.get(row.category);
    if (!hist) continue; // New category this month — not an anomaly

    const avgSpend = hist.total / monthCount;
    // Only flag if avg is meaningful (>10) and current is >50% above
    if (avgSpend < 10) continue;

    const pctAbove = ((row.total - avgSpend) / avgSpend) * 100;
    if (pctAbove < 50) continue;

    anomalies.push({
      category: row.category,
      color: row.color,
      currentSpend: row.total,
      avgSpend: Math.round(avgSpend * 100) / 100,
      pctAbove: Math.round(pctAbove),
      increaseAmount: Math.round((row.total - avgSpend) * 100) / 100,
    });
  }

  anomalies.sort((a, b) => b.pctAbove - a.pctAbove);
  return anomalies.slice(0, 5);
}
