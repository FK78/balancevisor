"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ClipboardCopy, Check, RefreshCw } from "lucide-react";
import { capturePostHogException } from "@/lib/posthog-error-tracking";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    capturePostHogException(error, {
      source: "global_route_error",
      error_digest: error.digest,
    });
  }, [error]);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    router.refresh();
    reset();
    setTimeout(() => setRetrying(false), 1500);
  }, [router, reset]);

  const handleCopyReport = useCallback(async () => {
    const report = [
      "--- BalanceVisor Error Report ---",
      `Time: ${new Date().toISOString()}`,
      `Page: ${window.location.pathname}`,
      `Error: ${error.name ?? "Unknown"}`,
      error.digest ? `Ref: ${error.digest}` : null,
      `Browser: ${navigator.userAgent}`,
      "---",
      "Please send this report to the BalanceVisor team so we can investigate.",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unsupported */
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-foreground">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. This is usually temporary — try
            refreshing, or copy the error report below to share with support.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Ref: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/85 disabled:opacity-40"
          >
            <RefreshCw
              className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
            />
            {retrying ? "Retrying…" : "Try again"}
          </button>
          <button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary/60"
          >
            Back to dashboard
          </button>
        </div>
        <button
          onClick={handleCopyReport}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <ClipboardCopy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied!" : "Copy error report for support"}
        </button>
      </body>
    </html>
  );
}
