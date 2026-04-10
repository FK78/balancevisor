"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Fires a background enrichment call on first dashboard visit per session.
 * The API has a 1-hour cooldown so repeated mounts are cheap no-ops.
 * Shows a toast only when enrichment actually did something.
 */
export function EnrichmentTrigger() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const timer = setTimeout(() => {
      fetch("/api/enrich-on-login", { method: "POST" })
        .then((r) => (r.ok ? r.json() : null))
        .then((result) => {
          if (!result || result.skipped) return;

          const parts: string[] = [];
          if (result.aiCategorised > 0)
            parts.push(`${result.aiCategorised} categorised`);
          if (result.categoriesCreated > 0)
            parts.push(`${result.categoriesCreated} new categories`);
          if (result.subscriptionsCreated > 0)
            parts.push(`${result.subscriptionsCreated} subscriptions detected`);
          if (result.recurringDetected > 0)
            parts.push(`${result.recurringDetected} recurring`);
          if (result.budgetsCreated > 0)
            parts.push(`${result.budgetsCreated} budgets created`);

          if (parts.length > 0) {
            toast.success(`Auto-enrichment: ${parts.join(" · ")}`, {
              duration: 6000,
            });
          }
        })
        .catch(() => {});
    }, 5000); // Delay 5s to avoid competing with initial page load + bank sync

    return () => clearTimeout(timer);
  }, []);

  return null;
}
