"use client";

import { useEffect, useRef } from "react";
import { syncBankIfNeeded } from "@/db/mutations/truelayer";

/**
 * Invisible component that triggers a background bank sync on mount.
 * Placed in the dashboard layout so it runs on every login / page load.
 * syncBankIfNeeded is a no-op if there are no connections or if the
 * last sync was less than 1 hour ago.
 */
export function BankSyncTrigger() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    syncBankIfNeeded().catch(() => {
      // Non-critical — swallow errors silently
    });
  }, []);

  return null;
}
