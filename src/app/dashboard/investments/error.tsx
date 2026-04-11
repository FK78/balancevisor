"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { capturePostHogException } from "@/lib/posthog-error-tracking";
import { logger } from "@/lib/logger";

export default function InvestmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    capturePostHogException(error, {
      source: "investments_route_error",
      error_digest: error.digest,
    });
    logger.error("investments", "Investments page error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-10">
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Investments cockpit
            </p>
            <CardTitle>We hit a snag loading your portfolio</CardTitle>
            <CardDescription>
              Your investments data has not been changed. Try loading the cockpit again, or return to the dashboard while broker feeds and manual holdings settle.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => reset()}>Try investments again</Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
          {error.digest ? (
            <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
