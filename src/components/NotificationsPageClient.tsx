"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Bell,
  TrendingUp,
  Check,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ReviewFlagCard } from "@/components/ReviewFlagCard";
import { markNotificationRead, markAllNotificationsRead } from "@/db/mutations/budget-alerts";
import type { ReviewFlag } from "@/db/queries/review-flags";

type BudgetNotification = {
  id: string;
  user_id: string;
  budget_id: string;
  alert_type: "threshold_warning" | "over_budget";
  message: string;
  is_read: boolean;
  emailed: boolean;
  created_at: Date;
};

type NotificationsPageClientProps = {
  reviewFlags: ReviewFlag[];
  budgetNotifications: BudgetNotification[];
  currency: string;
};

export function NotificationsPageClient({
  reviewFlags: initialFlags,
  budgetNotifications: initialNotifications,
  currency,
}: NotificationsPageClientProps) {
  const [flags, setFlags] = useState(initialFlags);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  function handleFlagResolved(flagId: string) {
    setFlags((prev) => prev.filter((f) => f.id !== flagId));
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  }

  const unreadBudgetCount = notifications.filter((n) => !n.is_read).length;
  const hasContent = flags.length > 0 || notifications.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review flagged transactions and budget alerts in one place.
        </p>
      </div>

      {!hasContent && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">All clear</p>
            <p className="text-xs text-muted-foreground">
              No pending reviews or alerts right now.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transaction Reviews */}
      {flags.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Link2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Transaction Reviews</h2>
              <p className="text-xs text-muted-foreground">
                {flags.length} transaction{flags.length !== 1 ? "s" : ""} may be linked to subscriptions or debts
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {flags.map((flag) => (
              <ReviewFlagCard
                key={flag.id}
                flag={flag}
                currency={currency}
                onResolved={handleFlagResolved}
              />
            ))}
          </div>
        </section>
      )}

      {/* Budget Alerts */}
      {notifications.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Budget Alerts</h2>
                <p className="text-xs text-muted-foreground">
                  {unreadBudgetCount > 0
                    ? `${unreadBudgetCount} unread alert${unreadBudgetCount !== 1 ? "s" : ""}`
                    : "All caught up"}
                </p>
              </div>
            </div>
            {unreadBudgetCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleMarkAllRead}
                disabled={isPending}
              >
                Mark all read
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="divide-y p-0">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 ${
                    n.is_read ? "opacity-60" : "bg-muted/30"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.alert_type === "over_budget" ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-relaxed">{n.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => handleMarkRead(n.id)}
                      disabled={isPending}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
