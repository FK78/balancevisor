"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Check, X, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { acceptReviewFlag, dismissReviewFlag } from "@/db/mutations/review-flags";
import type { ReviewFlag } from "@/db/queries/review-flags";
import { toast } from "sonner";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

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

export function TransactionReviewBanner({
  flags: initialFlags,
  currency,
}: {
  flags: ReviewFlag[];
  currency: string;
}) {
  const [flags, setFlags] = useState(initialFlags);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (flags.length === 0) return null;

  function handleAccept(flagId: string) {
    setProcessingId(flagId);
    startTransition(async () => {
      try {
        await acceptReviewFlag(flagId);
        setFlags((prev) => prev.filter((f) => f.id !== flagId));
        toast.success("Transaction linked successfully");
      } catch {
        toast.error("Failed to accept — please try again");
      } finally {
        setProcessingId(null);
      }
    });
  }

  function handleDismiss(flagId: string) {
    setProcessingId(flagId);
    startTransition(async () => {
      try {
        await dismissReviewFlag(flagId);
        setFlags((prev) => prev.filter((f) => f.id !== flagId));
        toast.success("Flag dismissed");
      } catch {
        toast.error("Failed to dismiss — please try again");
      } finally {
        setProcessingId(null);
      }
    });
  }

  return (
    <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-base">Transactions to Review</CardTitle>
        </div>
        <CardDescription>
          {flags.length} transaction{flags.length !== 1 ? "s" : ""} may be
          linked to your subscriptions or debts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {flags.map((flag) => {
          const isProcessing = processingId === flag.id && isPending;
          return (
            <div
              key={flag.id}
              className="flex flex-col gap-2 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">
                    {flag.transactionDescription}
                  </span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {flagLabel(flag.flag_type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    Amount: {formatCurrency(flag.actual_amount, currency)}
                  </span>
                  {flag.expected_amount !== null && (
                    <span>
                      Expected: {formatCurrency(flag.expected_amount, currency)}
                    </span>
                  )}
                  {flag.subscriptionName && (
                    <span className="flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      {flag.subscriptionName}
                    </span>
                  )}
                  {flag.debtName && (
                    <span className="flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      {flag.debtName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => handleDismiss(flag.id)}
                  className="gap-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleAccept(flag.id)}
                  className="gap-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Link
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
