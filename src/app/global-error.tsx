"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Send, Check, RefreshCw, Loader2 } from "lucide-react";
import { capturePostHogException } from "@/lib/posthog-error-tracking";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
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

  const handleSendReport = useCallback(async () => {
    setSending(true);
    try {
      const res = await fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: window.location.pathname,
          errorName: error.name ?? "Unknown",
          digest: error.digest ?? undefined,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });
      if (res.ok) {
        setSent(true);
      }
    } catch {
      /* network error — fail silently */
    } finally {
      setSending(false);
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
          onClick={handleSendReport}
          disabled={sending || sent}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          {sent ? (
            <Check className="h-3.5 w-3.5" />
          ) : sending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {sent
            ? "Report sent!"
            : sending
              ? "Sending…"
              : "Send report to team"}
        </button>
      </body>
    </html>
  );
}
