import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { ReviewFlag } from "@/db/queries/review-flags";

export function TransactionReviewBanner({
  flags,
}: {
  flags: ReviewFlag[];
  currency: string;
}) {
  if (flags.length === 0) return null;

  return (
    <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              {flags.length} transaction{flags.length !== 1 ? "s" : ""} to review
            </p>
            <p className="text-xs text-muted-foreground">
              May be linked to your subscriptions or debts.
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="gap-1.5 shrink-0">
          <Link href="/dashboard/notifications">
            Review all <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
