"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { capturePostHogException } from "@/lib/posthog-error-tracking";
import PageError from "@/components/PageError";

export default function CategoriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    capturePostHogException(error, {
      source: "categories_route_error",
      error_digest: error.digest,
    });
    logger.error("categories", "Categories page error", error);
  }, [error]);

  return (
    <PageError
      title="Couldn't load categories"
      description="We couldn't fetch your category structure. This is usually temporary — try refreshing, or copy the error report below to share with support."
      error={error}
      reset={reset}
    />
  );
}
