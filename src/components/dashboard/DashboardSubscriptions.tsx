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
import { CalendarClock, Repeat } from "lucide-react";

type UpcomingRenewal = {
  id: string;
  name: string;
  amount: number;
  color: string;
  next_billing_date: string;
};

type SubscriptionTotals = {
  monthly: number;
  count: number;
};

type DashboardSubscriptionsProps = {
  upcomingRenewals: UpcomingRenewal[];
  subscriptionTotals: SubscriptionTotals;
  currency: string;
};

export function DashboardSubscriptions({
  upcomingRenewals,
  subscriptionTotals,
  currency,
}: DashboardSubscriptionsProps) {
  if (upcomingRenewals.length === 0 && subscriptionTotals.count === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Subscriptions
            </CardTitle>
            <CardDescription>
              {formatCurrency(subscriptionTotals.monthly, currency)}/mo · {subscriptionTotals.count} active
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/subscriptions">View all</Link>
          </Button>
        </div>
      </CardHeader>
      {upcomingRenewals.length > 0 && (
        <CardContent className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Due in the next 14 days</p>
          {upcomingRenewals.slice(0, 5).map((sub) => (
            <div key={sub.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: sub.color + "18" }}
                >
                  <Repeat className="h-3.5 w-3.5" style={{ color: sub.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" />
                    {new Date(sub.next_billing_date + "T00:00:00").toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(sub.amount, currency)}
              </span>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
