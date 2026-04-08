"use client";

import { useState, useTransition, useCallback } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { importUserData } from "@/db/mutations/import-data";
import { toast } from "sonner";
import { EXPORT_VERSION } from "@/lib/types";

type Step = "upload" | "preview" | "importing" | "result";

type PreviewCounts = Record<string, number>;

type ImportResult = {
  imported: Record<string, number>;
  skipped: Record<string, number>;
  errors: string[];
};

const ENTITY_LABELS: Record<string, string> = {
  accounts: "Accounts",
  categories: "Categories",
  transactions: "Transactions",
  transactionSplits: "Transaction Splits",
  budgets: "Budgets",
  budgetAlertPreferences: "Budget Alerts",
  goals: "Goals",
  debts: "Debts",
  debtPayments: "Debt Payments",
  investmentGroups: "Investment Groups",
  manualHoldings: "Holdings",
  holdingSales: "Holding Sales",
  subscriptions: "Subscriptions",
  netWorthSnapshots: "Net Worth Snapshots",
  categorisationRules: "Categorisation Rules",
};

function countEntities(data: Record<string, unknown>): PreviewCounts {
  const counts: PreviewCounts = {};
  for (const key of Object.keys(ENTITY_LABELS)) {
    const arr = data[key];
    if (Array.isArray(arr) && arr.length > 0) {
      counts[key] = arr.length;
    }
  }
  return counts;
}

function totalCount(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, n) => sum + n, 0);
}

export function ImportDataDialog({ onImported }: { onImported?: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<PreviewCounts>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetState() {
    setStep("upload");
    setFileName("");
    setPreview({});
    setWarnings([]);
    setParsedData(null);
    setResult(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      if (result && totalCount(result.imported) > 0) {
        onImported?.();
      }
      resetState();
    }
    setOpen(nextOpen);
  }

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const data = JSON.parse(text) as Record<string, unknown>;

          // Basic validation
          const w: string[] = [];
          if (typeof data.version !== "number") {
            w.push("File is missing a version field — it may not be a valid export.");
          } else if ((data.version as number) > EXPORT_VERSION) {
            w.push(
              `Export version ${data.version} is newer than supported (${EXPORT_VERSION}). Some data may not import correctly.`,
            );
          }

          if (typeof data.exported_at === "string") {
            const d = new Date(data.exported_at as string);
            if (!isNaN(d.getTime())) {
              w.push(`Exported on ${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`);
            }
          }

          const counts = countEntities(data);
          if (Object.keys(counts).length === 0) {
            w.push("No importable data found in this file.");
          }

          setPreview(counts);
          setWarnings(w);
          setParsedData(data);
          setStep("preview");
        } catch {
          toast.error("Could not parse file. Please use a valid JSON export.");
        }
      };
      reader.readAsText(file);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file || !file.name.endsWith(".json")) return;

      const input = document.createElement("input");
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      handleFileSelect({
        target: input,
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    },
    [handleFileSelect],
  );

  function handleImport() {
    if (!parsedData) return;

    startTransition(async () => {
      setStep("importing");
      try {
        const res = await importUserData(parsedData);
        setResult(res);
        setStep("result");

        const total = totalCount(res.imported);
        if (total > 0) {
          toast.success(`Imported ${total} record${total !== 1 ? "s" : ""}`);
        }
        if (res.errors.length > 0) {
          toast.error(
            `${res.errors.length} error${res.errors.length !== 1 ? "s" : ""} during import`,
          );
        }
      } catch (err) {
        setResult({
          imported: {},
          skipped: {},
          errors: [
            err instanceof Error ? err.message : "An unexpected error occurred.",
          ],
        });
        setStep("result");
        toast.error("Import failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Data (JSON)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "upload" && (
          <>
            <DialogHeader>
              <DialogTitle>Import Data</DialogTitle>
              <DialogDescription>
                Upload a previously exported BalanceVisor JSON file to restore
                your data. Existing records will be kept; duplicates are skipped.
              </DialogDescription>
            </DialogHeader>
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 transition-colors hover:border-muted-foreground/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drag & drop your JSON export here
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  or click below to browse
                </p>
              </div>
              <label>
                <input
                  type="file"
                  accept=".json"
                  className="sr-only"
                  onChange={handleFileSelect}
                />
                <Button variant="outline" size="sm" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "preview" && (
          <>
            <DialogHeader>
              <DialogTitle>Review Import</DialogTitle>
              <DialogDescription>
                {fileName && (
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {fileName}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {Object.keys(preview).length > 0 && (
              <div className="rounded-md border p-4 space-y-2">
                <p className="text-sm font-medium mb-2">Data to import:</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {Object.entries(preview).map(([key, count]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {ENTITY_LABELS[key] ?? key}
                      </span>
                      <span className="font-mono tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2 flex items-center justify-between text-sm font-medium">
                  <span>Total</span>
                  <span className="font-mono tabular-nums">
                    {totalCount(preview)}
                  </span>
                </div>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-0.5">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Existing records with the same IDs will be skipped (not
              overwritten).
            </p>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => resetState()}>
                <X className="mr-1 h-4 w-4" />
                Start Over
              </Button>
              <Button
                onClick={handleImport}
                disabled={Object.keys(preview).length === 0 || isPending}
              >
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Import Data
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "importing" && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Importing...</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Importing data...</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  This may take a moment for large exports.
                </p>
              </div>
            </div>
          </>
        )}

        {step === "result" && result && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Import Complete</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-8">
              {totalCount(result.imported) > 0 ? (
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              )}
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {totalCount(result.imported) > 0
                    ? "Import Complete!"
                    : "No Records Imported"}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {totalCount(result.imported)} imported
                  {totalCount(result.skipped) > 0 &&
                    `, ${totalCount(result.skipped)} skipped`}
                  .
                </p>
              </div>

              {/* Breakdown */}
              {totalCount(result.imported) > 0 && (
                <div className="w-full rounded-md border p-3">
                  <p className="text-xs font-medium mb-1.5">Breakdown:</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                    {Object.entries(result.imported)
                      .filter(([, count]) => count > 0)
                      .map(([key, count]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">
                            {ENTITY_LABELS[key] ?? key}
                          </span>
                          <span className="font-mono tabular-nums">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="w-full rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3 max-h-40 overflow-y-auto">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Issues ({result.errors.length}):
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-0.5">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-center">
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
