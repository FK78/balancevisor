"use client";

import { useState, useTransition } from "react";
import {
  Check,
  X,
  Loader2,
  Link2,
  ArrowRight,
  CircleDot,
  CalendarClock,
  BarChart3,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { acceptReviewFlag, dismissReviewFlag } from "@/db/mutations/review-flags";
import type { ReviewFlag } from "@/db/queries/review-flags";
import { formatCurrency } from "@/lib/formatCurrency";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function flagLabel(type: ReviewFlag["flag_type"]): string {
  switch (type) {
    case "subscription_amount_mismatch":
      return "Subscription amount differs";
    case "possible_debt_payment":
      return "Possible debt payment";
    case "possible_subscription":
      return "Possible subscription";
  }
}

function getLinkTargetName(flag: ReviewFlag): string {
  return flag.subscriptionName ?? flag.debtName ?? "Unknown";
}

function isDebtFlag(flag: ReviewFlag): boolean {
  return flag.flag_type === "possible_debt_payment";
}

type ReviewFlagCardProps = {
  flag: ReviewFlag;
  currency: string;
  onResolved: (flagId: string) => void;
};

export function ReviewFlagCard({ flag, currency, onResolved }: ReviewFlagCardProps) {
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"accept" | "dismiss" | null>(null);

  const targetName = getLinkTargetName(flag);
  const debt = isDebtFlag(flag);

  function handleAccept() {
    setAction("accept");
    startTransition(async () => {
      try {
        await acceptReviewFlag(flag.id);
        onResolved(flag.id);
        toast.success("Transaction linked successfully");
      } catch {
        toast.error("Failed to link — please try again");
      } finally {
        setAction(null);
      }
    });
  }

  function handleDismiss() {
    setAction("dismiss");
    startTransition(async () => {
      try {
        await dismissReviewFlag(flag.id);
        onResolved(flag.id);
        toast.success("Flag dismissed");
      } catch {
        toast.error("Failed to dismiss — please try again");
      } finally {
        setAction(null);
      }
    });
  }

  const isProcessing = isPending && action !== null;

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        {/* Header: transaction info */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground">
                {flag.transactionDescription || "Transaction"}
              </h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                {flagLabel(flag.flag_type)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span>Amount: {formatCurrency(flag.actual_amount, currency)}</span>
              {flag.expected_amount !== null && (
                <span>Expected: {formatCurrency(flag.expected_amount, currency)}</span>
              )}
              {flag.transactionDate && (
                <span>
                  {new Date(flag.transactionDate + "T00:00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground shrink-0">
            <Link2 className="h-3.5 w-3.5" />
            {targetName}
          </div>
        </div>

        {/* Visual before/after example */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            What linking does
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {/* Before */}
            <div className="flex-1 rounded-md border border-border/50 bg-background p-2.5 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Before
              </p>
              <div className="flex items-center gap-2">
                <CircleDot className="h-3.5 w-3.5 text-muted-foreground/50" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">
                    {flag.transactionDescription || "Transaction"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatCurrency(flag.actual_amount, currency)} · Unlinked expense
                  </p>
                </div>
              </div>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 rotate-90 self-center sm:hidden" />

            {/* After */}
            <div className="flex-1 rounded-md border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                After
              </p>
              <div className="flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">
                    {flag.transactionDescription || "Transaction"}
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(flag.actual_amount, currency)} → {targetName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation bullets */}
          <ul className="space-y-1 text-xs text-muted-foreground">
            {debt ? (
              <>
                <li className="flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3 shrink-0" />
                  Records a debt payment and reduces remaining balance
                </li>
                <li className="flex items-center gap-1.5">
                  <BarChart3 className="h-3 w-3 shrink-0" />
                  Transaction appears under the linked debt in reports
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-1.5">
                  <CalendarClock className="h-3 w-3 shrink-0" />
                  Updates the subscription&apos;s next billing date
                </li>
                <li className="flex items-center gap-1.5">
                  <BarChart3 className="h-3 w-3 shrink-0" />
                  Transaction appears under the linked subscription in reports
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            disabled={isProcessing}
            onClick={handleDismiss}
            className={cn("gap-1.5", isProcessing && action === "dismiss" && "opacity-70")}
          >
            {isProcessing && action === "dismiss" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Dismiss
          </Button>
          <Button
            size="sm"
            disabled={isProcessing}
            onClick={handleAccept}
            className={cn("gap-1.5", isProcessing && action === "accept" && "opacity-70")}
          >
            {isProcessing && action === "accept" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Link transaction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
