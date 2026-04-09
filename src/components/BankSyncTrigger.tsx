"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { syncBankIfNeeded } from "@/db/mutations/truelayer";
import { toast } from "sonner";

/**
 * Triggers a background bank sync on mount and shows a sonner toast
 * with the result. Only attempts sync when `enabled` is true (i.e. user
 * has at least one TrueLayer connection).
 */
export function BankSyncTrigger({ enabled }: { enabled: boolean }) {
  const ran = useRef(false);
  const router = useRouter();

  const doSync = useCallback(async () => {
    try {
      const res = await syncBankIfNeeded();
      if (res.synced) {
        toast.success(
          `Synced ${res.accountsImported} account${res.accountsImported !== 1 ? "s" : ""}, ${res.transactionsImported} transaction${res.transactionsImported !== 1 ? "s" : ""}`,
        );

        // Refresh the current page so updated data is visible immediately
        router.refresh();

        // Fire-and-forget AI enrichment for synced transactions
        if (res.transactionIds && res.transactionIds.length > 0) {
          fetch("/api/ai-enrich-transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionIds: res.transactionIds }),
          }).catch(() => {});
        }
      }
    } catch {
      toast.error("Bank sync failed — try manual sync");
    }
  }, [router]);

  useEffect(() => {
    if (!enabled || ran.current) return;
    ran.current = true;
    queueMicrotask(doSync);
  }, [enabled, doSync]);

  return null;
}
