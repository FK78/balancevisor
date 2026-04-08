import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { Trophy } from "lucide-react";

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  color: string;
};

type DashboardGoalsSummaryProps = {
  goals: Goal[];
  currency: string;
};

export function DashboardGoalsSummary({
  goals,
  currency,
}: DashboardGoalsSummaryProps) {
  if (goals.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Progress towards your targets.</CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/goals">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.slice(0, 4).map((goal) => {
          const pct = goal.target_amount > 0
            ? Math.min(Math.round((goal.saved_amount / goal.target_amount) * 100), 100)
            : 0;
          const isComplete = goal.saved_amount >= goal.target_amount;
          return (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="h-3.5 w-3.5" style={{ color: goal.color }} />
                  <span className="font-medium">{goal.name}</span>
                </div>
                <span className={`text-xs tabular-nums ${isComplete ? "text-emerald-600 font-semibold" : "text-muted-foreground"}`}>
                  {isComplete ? "Complete!" : `${formatCurrency(goal.saved_amount, currency)} / ${formatCurrency(goal.target_amount, currency)}`}
                </span>
              </div>
              <div className="bg-muted h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isComplete ? "bg-emerald-400" : ""}`}
                  style={{ width: `${pct}%`, backgroundColor: isComplete ? undefined : goal.color }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
