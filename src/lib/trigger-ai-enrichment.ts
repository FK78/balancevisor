import { toast } from "sonner";

/**
 * Fire AI enrichment for a set of transaction IDs and show a toast with results.
 * Shared by TrueLayerImportTrigger and BankSyncTrigger.
 */
export function triggerAiEnrichment(transactionIds: string[]): void {
  if (!transactionIds || transactionIds.length === 0) return;

  fetch("/api/ai-enrich-transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactionIds }),
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
    .catch((err) => console.warn("[AI enrichment] failed:", err));
}
