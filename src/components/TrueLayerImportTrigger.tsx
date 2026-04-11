"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { importFromTrueLayer, previewTrueLayerAccounts } from "@/db/mutations/truelayer";
import type { TlAccountPreview } from "@/db/mutations/truelayer";
import { TrueLayerAccountSelector } from "@/components/TrueLayerAccountSelector";
import { toast } from "sonner";
import posthog from "posthog-js";
import { triggerAiEnrichment } from "@/lib/trigger-ai-enrichment";

/**
 * Two-phase bank import:
 *  1. Detects `?import_pending=true`, fetches account list from TrueLayer
 *  2. Shows account selector so user can deselect pots / spaces
 *  3. Imports only the confirmed accounts
 */
export function TrueLayerImportTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ran = useRef(false);

  const [accounts, setAccounts] = useState<TlAccountPreview[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const doImport = useCallback(async (selectedTlIds: string[]) => {
    setImporting(true);
    try {
      const res = await importFromTrueLayer(selectedTlIds);

      posthog.capture("bank_initial_import_completed", {
        accounts_imported: res.accountsImported,
        transactions_imported: res.transactionsImported,
      });

      const parts: string[] = [];
      if (res.accountsImported > 0) {
        parts.push(
          `${res.accountsImported} account${res.accountsImported !== 1 ? "s" : ""}`,
        );
      }
      if (res.transactionsImported > 0) {
        parts.push(
          `${res.transactionsImported} transaction${res.transactionsImported !== 1 ? "s" : ""}`,
        );
      }

      toast.success(
        parts.length > 0
          ? `Imported ${parts.join(", ")}`
          : "Bank connected — no new data to import",
        { duration: 5000 },
      );

      // Fire AI enrichment in the background (non-blocking)
      triggerAiEnrichment(res.transactionIds);
    } catch {
      toast.error("Bank import failed — you can retry from Accounts", {
        duration: 8000,
      });
    } finally {
      setImporting(false);
      setSelectorOpen(false);
    }
  }, []);

  const importPending = searchParams.get("import_pending") === "true";

  useEffect(() => {
    if (!importPending || ran.current) return;
    ran.current = true;

    // Clean import_pending from the URL immediately so a refresh doesn't re-trigger
    const params = new URLSearchParams(searchParams.toString());
    params.delete("import_pending");
    const cleaned = params.toString();
    router.replace(cleaned ? `${pathname}?${cleaned}` : pathname, { scroll: false });

    toast("Fetching your bank accounts…", { duration: 3000 });

    // Phase 1: fetch account list for user confirmation
    previewTrueLayerAccounts()
      .then((previews) => {
        if (previews.length === 0) {
          toast.error("No accounts found from your bank connection.");
          return;
        }

        // If no accounts are flagged as likely pots, skip the selector and import all
        const hasPots = previews.some((a) => a.likelyPot);
        if (!hasPots) {
          toast("Importing bank data in the background…", { duration: 3000 });
          doImport(previews.map((a) => a.tlId));
          return;
        }

        // Show account picker
        setAccounts(previews);
        setSelectorOpen(true);
      })
      .catch(() => {
        toast.error("Failed to fetch bank accounts — you can retry from Accounts", {
          duration: 8000,
        });
      });
  }, [importPending, pathname, router, searchParams, doImport]);

  return (
    <TrueLayerAccountSelector
      open={selectorOpen}
      accounts={accounts}
      onConfirm={doImport}
      onCancel={() => setSelectorOpen(false)}
      loading={importing}
    />
  );
}
