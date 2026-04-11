"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { capturePostHogException } from "@/lib/posthog-error-tracking";
import PageError from "@/components/PageError";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    capturePostHogException(error, {
      source: "dashboard_route_error",
      error_digest: error.digest,
    });
    logger.error("dashboard", "Dashboard error", error);
  }, [error]);

  return (
    <PageError
      title="Couldn't load dashboard data"
      description="Something went wrong while loading your dashboard. This is usually temporary — try refreshing, or copy the error report below to share with support."
      error={error}
      reset={reset}
      backHref="/dashboard"
      backLabel="Reload dashboard"
    />
  );
}
