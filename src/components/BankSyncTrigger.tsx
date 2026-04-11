"use client";

import { useEffect, useRef, useCallback } from "react";
import { syncBankIfNeeded } from "@/db/mutations/truelayer";
import { toast } from "sonner";
import posthog from "posthog-js";
import { triggerAiEnrichment } from "@/lib/trigger-ai-enrichment";

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
        triggerAiEnrichment(res.transactionIds);
      }
    } catch {
      toast.error("Bank sync failed — try manual sync");
    }
  }, []);

  useEffect(() => {
    if (!enabled || ran.current) return;
    ran.current = true;
    setTimeout(doSync, 100);
  }, [enabled, doSync]);

  return null;
}
