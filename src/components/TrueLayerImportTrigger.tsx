"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { fetchAndCacheTrueLayerData, importFromCache } from "@/db/mutations/truelayer";
import type { TlAccountPreview } from "@/db/mutations/truelayer";
import { TrueLayerAccountSelectorContent } from "@/components/TrueLayerAccountSelector";
import posthog from "posthog-js";
import { triggerAiEnrichment } from "@/lib/trigger-ai-enrichment";
import { IMPORT_FUN_FACTS } from "@/lib/import-fun-facts";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Overlay phase enum
// ---------------------------------------------------------------------------

type OverlayPhase =
  | { stage: "hidden" }
  | { stage: "fetching"; status: string }
  | { stage: "selecting"; accounts: TlAccountPreview[] }
  | { stage: "writing"; status: string }
  | { stage: "success"; summary: string }
  | { stage: "error"; message: string };

// ---------------------------------------------------------------------------
// Rotating fun-fact hook
// ---------------------------------------------------------------------------

function useRotatingFact(active: boolean) {
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * IMPORT_FUN_FACTS.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      // Fade out → swap → fade in
      setVisible(false);
      setTimeout(() => {
        setFactIndex((prev) => (prev + 1) % IMPORT_FUN_FACTS.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [active]);

  return { fact: IMPORT_FUN_FACTS[factIndex], visible };
}

// ---------------------------------------------------------------------------
// Full-page overlay
// ---------------------------------------------------------------------------

function ImportOverlay({
  phase,
  onSelectAccounts,
  onCancel,
  importing,
}: {
  phase: OverlayPhase;
  onSelectAccounts: (ids: string[]) => void;
  onCancel: () => void;
  importing: boolean;
}) {
  const showFacts = phase.stage === "fetching" || phase.stage === "writing";
  const { fact, visible } = useRotatingFact(showFacts);

  if (phase.stage === "hidden") return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/98 backdrop-blur-sm">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logo.svg"
          alt="Wealth"
          width={48}
          height={48}
          className="animate-pulse"
        />
      </div>

      {/* Phase: Fetching */}
      {phase.stage === "fetching" && (
        <div className="flex flex-col items-center gap-6 px-4 text-center">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-lg font-medium">{phase.status}</p>
          </div>
        </div>
      )}

      {/* Phase: Account selector (inline) */}
      {phase.stage === "selecting" && (
        <div className="w-full px-4">
          <TrueLayerAccountSelectorContent
            accounts={phase.accounts}
            onConfirm={onSelectAccounts}
            onCancel={onCancel}
            loading={importing}
          />
        </div>
      )}

      {/* Phase: Writing to DB */}
      {phase.stage === "writing" && (
        <div className="flex flex-col items-center gap-6 px-4 text-center">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-lg font-medium">{phase.status}</p>
          </div>
        </div>
      )}

      {/* Phase: Success */}
      {phase.stage === "success" && (
        <div className="flex flex-col items-center gap-4 px-4 text-center animate-in fade-in-0 zoom-in-95 duration-500">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-lg font-medium">{phase.summary}</p>
        </div>
      )}

      {/* Phase: Error */}
      {phase.stage === "error" && (
        <div className="flex flex-col items-center gap-4 px-4 text-center animate-in fade-in-0 duration-300">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-xl font-bold">!</span>
          </div>
          <p className="text-lg font-medium">{phase.message}</p>
          <p className="text-sm text-muted-foreground">You can retry from the Accounts page.</p>
        </div>
      )}

      {/* Rotating fun fact (only during loading phases) */}
      {showFacts && (
        <div className="absolute bottom-12 left-0 right-0 px-8 text-center">
          <p
            className={`text-sm text-muted-foreground italic transition-opacity duration-400 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {fact}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main trigger component
// ---------------------------------------------------------------------------

/**
 * Three-phase bank import with full-page lock-screen:
 *  1. Full-screen overlay → fetches ALL data from TrueLayer, caches in memory
 *  2. Account selector (inside overlay) if pots detected
 *  3. Writes selected accounts from cache to DB
 *  4. Shows success summary → auto-dismiss after 2s
 */
export function TrueLayerImportTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ran = useRef(false);

  const [phase, setPhase] = useState<OverlayPhase>({ stage: "hidden" });
  const [importing, setImporting] = useState(false);

  // Phase 3: write cached data to DB for selected accounts
  const doImportFromCache = useCallback(async (selectedTlIds: string[]) => {
    setImporting(true);
    setPhase({ stage: "writing", status: "Importing your data\u2026" });

    try {
      const res = await importFromCache(selectedTlIds);

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

      const summary =
        parts.length > 0
          ? `Imported ${parts.join(", ")}`
          : "Bank connected \u2014 no new data to import";

      setPhase({ stage: "success", summary });

      // Fire AI enrichment in the background (non-blocking)
      triggerAiEnrichment(res.transactionIds);

      // Auto-dismiss after 2 seconds
      setTimeout(() => {
        setPhase({ stage: "hidden" });
        router.refresh();
      }, 2000);
    } catch {
      setPhase({ stage: "error", message: "Bank import failed" });
      setTimeout(() => setPhase({ stage: "hidden" }), 4000);
    } finally {
      setImporting(false);
    }
  }, [router]);

  const importPending = searchParams.get("import_pending") === "true";

  useEffect(() => {
    if (!importPending || ran.current) return;
    ran.current = true;

    // Clean import_pending from the URL without triggering a React navigation.
    // Using router.replace() here would cause a server re-render that resets
    // the overlay state mid-fetch, silently dropping the import.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("import_pending");
    const cleaned = params.toString();
    window.history.replaceState(null, "", cleaned ? `${pathname}?${cleaned}` : pathname);

    // Phase 1: show overlay and fetch everything
    setPhase({ stage: "fetching", status: "Connecting to your bank\u2026" });

    fetchAndCacheTrueLayerData()
      .then((previews) => {
        if (previews.length === 0) {
          setPhase({ stage: "error", message: "No accounts found from your bank connection." });
          setTimeout(() => setPhase({ stage: "hidden" }), 4000);
          return;
        }

        // If no pots, skip selector and import all
        const hasPots = previews.some((a) => a.likelyPot);
        if (!hasPots) {
          doImportFromCache(previews.map((a) => a.tlId));
          return;
        }

        // Phase 2: show account selector inside overlay
        setPhase({ stage: "selecting", accounts: previews });
      })
      .catch(() => {
        setPhase({ stage: "error", message: "Failed to fetch bank accounts" });
        setTimeout(() => setPhase({ stage: "hidden" }), 4000);
      });
  }, [importPending, pathname, searchParams, doImportFromCache]);

  return (
    <ImportOverlay
      phase={phase}
      onSelectAccounts={doImportFromCache}
      onCancel={() => setPhase({ stage: "hidden" })}
      importing={importing}
    />
  );
}
