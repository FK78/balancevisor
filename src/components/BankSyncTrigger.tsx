"use client";

import { useEffect, useRef, useCallback } from "react";
import { syncBankIfNeeded } from "@/db/mutations/truelayer";
import { toast } from "sonner";
import posthog from "posthog-js";

/**
 * Triggers a background bank sync on mount and shows a sonner toast
 * with the result. Only attempts sync when `enabled` is true (i.e. user
 * has at least one TrueLayer connection).
 */
export function BankSyncTrigger({ enabled }: { enabled: boolean }) {
  const ran = useRef(false);

  const doSync = useCallback(async () => {
    try {
      const res = await syncBankIfNeeded();
      if (res.synced) {
        posthog.capture("bank_auto_sync_completed", {
          accounts_imported: res.accountsImported,
          transactions_imported: res.transactionsImported,
        });
        toast.success(
          `Synced ${res.accountsImported} account${res.accountsImported !== 1 ? "s" : ""}, ${res.transactionsImported} transaction${res.transactionsImported !== 1 ? "s" : ""}`,
        );

        // Run AI enrichment and show detailed results
        if (res.transactionIds && res.transactionIds.length > 0) {
          fetch("/api/ai-enrich-transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionIds: res.transactionIds }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((enrichResult) => {
              if (!enrichResult) return;
              const parts: string[] = [];
              if (enrichResult.aiCategorised > 0)
                parts.push(`${enrichResult.aiCategorised} categorised`);
              if (enrichResult.categoriesCreated > 0)
                parts.push(`${enrichResult.categoriesCreated} new categories`);
              if (enrichResult.subscriptionsCreated > 0)
                parts.push(`${enrichResult.subscriptionsCreated} subscriptions detected`);
              if (enrichResult.recurringDetected > 0)
                parts.push(`${enrichResult.recurringDetected} recurring`);
              if (parts.length > 0) {
                toast.success(`AI enrichment: ${parts.join(" · ")}`, { duration: 6000 });
              }
            })
            .catch(() => {});
        }
      }
    } catch {
      toast.error("Bank sync failed — try manual sync");
    }
  }, []);

  useEffect(() => {
    if (!enabled || ran.current) return;
    ran.current = true;
    queueMicrotask(doSync);
  }, [enabled, doSync]);

  return null;
}
