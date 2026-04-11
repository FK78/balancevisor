"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { importFromTrueLayer } from "@/db/mutations/truelayer";
import { toast } from "sonner";
import posthog from "posthog-js";
import { triggerAiEnrichment } from "@/lib/trigger-ai-enrichment";

/**
 * Detects `?import_pending=true` in the URL (set by the TrueLayer callback)
 * and fires the heavy import in the background while showing a persistent
 * toast. This prevents the white-screen wait that users experienced when
 * the import was blocking the OAuth redirect.
 */
export function TrueLayerImportTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ran = useRef(false);

  const doImport = useCallback(async () => {
    try {
      const res = await importFromTrueLayer();

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

    // Brief dismissible toast — import continues silently in the background
    toast("Importing bank data in the background…", { duration: 3000 });

    // Call directly — NOT inside startTransition — so navigation stays unblocked
    doImport();
  }, [importPending, pathname, router, searchParams, doImport]);

  return null;
}
