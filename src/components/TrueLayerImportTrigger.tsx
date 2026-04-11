"use client";

import { useEffect, useRef, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { importFromTrueLayer } from "@/db/mutations/truelayer";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
  const [, startTransition] = useTransition();

  const importPending = searchParams.get("import_pending") === "true";

  useEffect(() => {
    if (!importPending || ran.current) return;
    ran.current = true;

    // Clean import_pending from the URL immediately so a refresh doesn't re-trigger
    const params = new URLSearchParams(searchParams.toString());
    params.delete("import_pending");
    const cleaned = params.toString();
    router.replace(cleaned ? `${pathname}?${cleaned}` : pathname, { scroll: false });

    const toastId = toast.loading(
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Importing your bank accounts and transactions…</span>
      </div>,
      { duration: Infinity },
    );

    startTransition(async () => {
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
          { id: toastId, duration: 5000 },
        );

        // Fire AI enrichment in the background (non-blocking)
        triggerAiEnrichment(res.transactionIds);
      } catch {
        toast.error("Bank import failed — you can retry from Accounts", {
          id: toastId,
          duration: 8000,
        });
      }
    });
  }, [importPending, pathname, router, searchParams, startTransition]);

  return null;
}
