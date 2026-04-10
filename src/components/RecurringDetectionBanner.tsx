"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Repeat, ArrowRight, Calendar, Check, Loader2, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { confirmRecurringCandidate, dismissRecurringCandidate } from "@/db/mutations/recurring";
import type { RecurringCandidate } from "@/lib/recurring-detection";

const patternLabels: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function ConfirmCandidateButton({
  candidate,
  onHidden,
}: {
  candidate: RecurringCandidate;
  onHidden: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1 text-xs border-sky-200 text-sky-700 hover:bg-sky-50"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await confirmRecurringCandidate(
            candidate.latestTransactionId,
            candidate.suggestedPattern,
          );
          onHidden(candidate.latestTransactionId);
        });
      }}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Check className="h-3 w-3" />
      )}
      Confirm
    </Button>
  );
}

function DismissCandidateButton({
  candidate,
  onHidden,
}: {
  candidate: RecurringCandidate;
  onHidden: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
      disabled={isPending}
      aria-label="Dismiss suggestion"
      onClick={() => {
        startTransition(async () => {
          await dismissRecurringCandidate(candidate.latestTransactionId);
          onHidden(candidate.latestTransactionId);
        });
      }}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

export function RecurringDetectionBanner({
  candidates: initialCandidates,
  currency,
}: {
  candidates: RecurringCandidate[];
  currency: string;
}) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const candidates = initialCandidates.filter(
    (c) => !hidden.has(c.latestTransactionId),
  );

  function handleHidden(id: string) {
    setHidden((prev) => new Set(prev).add(id));
  }

  if (candidates.length === 0) return null;

  return (
    <Card className="border-sky-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10">
              <Repeat className="h-4 w-4 text-sky-600" />
            </div>
            <div>
              <CardTitle className="text-base">Recurring Patterns Detected</CardTitle>
              <CardDescription className="text-xs">
                {candidates.length} transaction{candidates.length !== 1 ? "s" : ""} look like recurring payments
              </CardDescription>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href="/dashboard/recurring">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {candidates.slice(0, 4).map((c) => (
          <div
            key={`${c.description}-${c.type}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Repeat className="h-3.5 w-3.5 text-sky-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.description}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-2.5 w-2.5" />
                  {c.occurrences} times · ~{c.avgDaysBetween} days apart
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant="outline"
                className="text-[10px] border-sky-200 text-sky-600 bg-sky-500/5"
              >
                {patternLabels[c.suggestedPattern] ?? c.suggestedPattern}
              </Badge>
              <span className={`text-sm font-semibold tabular-nums ${c.type === "income" ? "text-emerald-600" : ""}`}>
                {c.type === "income" ? "+" : ""}
                {formatCurrency(c.amount, currency)}
              </span>
              <DismissCandidateButton candidate={c} onHidden={handleHidden} />
              <ConfirmCandidateButton candidate={c} onHidden={handleHidden} />
            </div>
          </div>
        ))}
        {candidates.length > 4 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            +{candidates.length - 4} more detected — view in{" "}
            <Link href="/dashboard/recurring" className="text-primary underline underline-offset-2">
              Recurring
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
