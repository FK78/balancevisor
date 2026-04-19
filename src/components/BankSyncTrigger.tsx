"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { syncBankIfNeeded } from "@/db/mutations/truelayer";
import { toast } from "sonner";

/**
 * Triggers a background bank balance sync on mount.
 */
export function BankSyncTrigger({ enabled }: { enabled: boolean }) {
  const ran = useRef(false);
  const router = useRouter();

  const doSync = useCallback(async () => {
    try {
      const res = await syncBankIfNeeded();
      if (res.synced) {
        toast.success(
          `Synced ${res.accountsImported} account${res.accountsImported !== 1 ? "s" : ""}`,
        );
        router.refresh();
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
