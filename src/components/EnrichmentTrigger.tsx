"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes — matches server cooldown

function showEnrichmentToast(result: Record<string, number>) {
  const parts: string[] = [];
  const totalCategorised = (result.ruleCategorised ?? 0) + (result.aiCategorised ?? 0);
  if (totalCategorised > 0)
    parts.push(`${totalCategorised} categorised`);
  if (result.categoriesCreated > 0)
    parts.push(`${result.categoriesCreated} new categories`);
  if (result.subscriptionsCreated > 0)
    parts.push(`${result.subscriptionsCreated} subscriptions detected`);
  if (result.recurringDetected > 0)
    parts.push(`${result.recurringDetected} recurring`);
  if (result.budgetsCreated > 0)
    parts.push(`${result.budgetsCreated} budgets created`);

  if (parts.length > 0) {
    toast.success(`Auto-enrichment: ${parts.join(" · ")}`, { duration: 6000 });
  }
}

/**
 * Auto-repeating background enrichment (every 30 min) plus a manual
 * trigger button for the nav bar.
 */
export function EnrichmentTrigger() {
  const mounted = useRef(false);
  const [running, setRunning] = useState(false);

  const runEnrichment = useCallback((force = false) => {
    return fetch("/api/enrich-on-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((result) => {
        if (!result || result.skipped) return result;
        showEnrichmentToast(result);
        return result;
      })
      .catch(() => null);
  }, []);

  // Auto-trigger on mount; only start repeating interval if initial call ran
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    let interval: ReturnType<typeof setInterval> | null = null;

    const initial = setTimeout(() => {
      runEnrichment(false).then((result) => {
        // Only set up the repeating interval if the initial call wasn't skipped
        // (i.e. the cooldown hadn't expired yet — no point polling again soon)
        if (result && !result.skipped) {
          interval = setInterval(() => runEnrichment(false), INTERVAL_MS);
        }
      });
    }, 5000);

    return () => {
      clearTimeout(initial);
      if (interval) clearInterval(interval);
    };
  }, [runEnrichment]);

  const handleManualTrigger = useCallback(() => {
    if (running) return;
    setRunning(true);
    toast.loading("Running AI enrichment…", { id: "manual-enrich" });
    runEnrichment(true).then((result) => {
      setRunning(false);
      if (result && !result.skipped) {
        toast.dismiss("manual-enrich");
      } else {
        toast.success("Enrichment complete — nothing new to process", {
          id: "manual-enrich",
        });
      }
    });
  }, [running, runEnrichment]);

  return (
    <button
      onClick={handleManualTrigger}
      disabled={running}
      title="Run AI enrichment now"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
    >
      <Sparkles className={`h-4 w-4 ${running ? "animate-pulse" : ""}`} />
    </button>
  );
}
