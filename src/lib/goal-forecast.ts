import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getMonthKey } from "@/lib/date";

export type GoalForecastStatus = "on_track" | "at_risk" | "behind" | "completed" | "no_deadline";

export type GoalForecast = {
  goalId: string;
  goalName: string;
  goalColor: string;
  targetAmount: number;
  savedAmount: number;
  remaining: number;
  targetDate: string | null;
  /** Average monthly net savings (from completed months) */
  avgMonthlySavings: number;
  /** Estimated months to reach target at current savings rate */
  estimatedMonths: number | null;
  /** Estimated completion date */
  estimatedDate: string | null;
  /** Required monthly savings to hit target by deadline */
  requiredMonthlySavings: number | null;
  /** Months remaining until deadline */
  monthsUntilDeadline: number | null;
  /** Status relative to target date */
  status: GoalForecastStatus;
};

type GoalInput = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  color: string;
};

export async function getGoalForecasts(
  userId: string,
  goals: GoalInput[],
): Promise<GoalForecast[]> {
  const trend = await getMonthlyIncomeExpenseTrend(userId, 6);

  const currentMonthKey = getMonthKey(new Date());
  const completedMonths = trend.filter((m) => m.month !== currentMonthKey);
  const monthCount = Math.max(completedMonths.length, 1);

  const avgMonthlySavings = completedMonths.reduce((s, m) => s + m.net, 0) / monthCount;

  const now = new Date();

  return goals.map((goal) => {
    const remaining = Math.max(goal.target_amount - goal.saved_amount, 0);
    const isComplete = remaining <= 0;

    if (isComplete) {
      return {
        goalId: goal.id,
        goalName: goal.name,
        goalColor: goal.color,
        targetAmount: goal.target_amount,
        savedAmount: goal.saved_amount,
        remaining: 0,
        targetDate: goal.target_date,
        avgMonthlySavings: Math.round(avgMonthlySavings * 100) / 100,
        estimatedMonths: 0,
        estimatedDate: null,
        requiredMonthlySavings: null,
        monthsUntilDeadline: null,
        status: "completed",
      };
    }

    // Estimate months to completion
    const estimatedMonths = avgMonthlySavings > 0
      ? Math.ceil(remaining / avgMonthlySavings)
      : null;

    // Estimated completion date
    let estimatedDate: string | null = null;
    if (estimatedMonths !== null) {
      const est = new Date(now.getFullYear(), now.getMonth() + estimatedMonths, 1);
      estimatedDate = est.toISOString().split("T")[0];
    }

    // Deadline analysis
    let monthsUntilDeadline: number | null = null;
    let requiredMonthlySavings: number | null = null;
    let status: GoalForecastStatus = "no_deadline";

    if (goal.target_date) {
      const deadline = new Date(goal.target_date + "T00:00:00");
      const diffMs = deadline.getTime() - now.getTime();
      monthsUntilDeadline = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.44)));

      if (monthsUntilDeadline <= 0) {
        requiredMonthlySavings = remaining;
        status = remaining > 0 ? "behind" : "completed";
      } else {
        requiredMonthlySavings = Math.ceil((remaining / monthsUntilDeadline) * 100) / 100;

        if (estimatedMonths !== null && estimatedMonths <= monthsUntilDeadline) {
          status = "on_track";
        } else if (
          avgMonthlySavings > 0 &&
          estimatedMonths !== null &&
          estimatedMonths <= monthsUntilDeadline * 1.5
        ) {
          status = "at_risk";
        } else {
          status = "behind";
        }
      }
    } else {
      status = avgMonthlySavings > 0 ? "on_track" : "at_risk";
    }

    return {
      goalId: goal.id,
      goalName: goal.name,
      goalColor: goal.color,
      targetAmount: goal.target_amount,
      savedAmount: goal.saved_amount,
      remaining,
      targetDate: goal.target_date,
      avgMonthlySavings: Math.round(avgMonthlySavings * 100) / 100,
      estimatedMonths,
      estimatedDate,
      requiredMonthlySavings,
      monthsUntilDeadline,
      status,
    };
  });
}
