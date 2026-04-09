"use client";

import { useState, useTransition } from "react";
import { toDateString } from "@/lib/date";
import { Plus, Pencil, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addTransaction, editTransaction } from "@/db/mutations/transactions";
import { learnCategorisationRule } from "@/db/mutations/categorisation-rules";
import type { AccountWithDetails, CategoryWithColor, TransactionWithDetails } from "@/lib/types";
import { toast } from "sonner";
import { useLastUsed } from "@/hooks/useLastUsed";
import { checkForDuplicate } from "@/db/mutations/check-duplicate";
import type { PotentialDuplicate } from "@/db/queries/duplicate-check";
import { AlertTriangle } from "lucide-react";

export function TransactionFormDialog({
  transaction,
  accounts,
  categories,
  onSaved,
}: {
  transaction?: TransactionWithDetails;
  accounts: AccountWithDetails[];
  categories: CategoryWithColor[];
  onSaved?: (ids: string[]) => void;
}) {
  const isEdit = !!transaction;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"form" | "success">("form");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);
  const [isRecurring, setIsRecurring] = useState(transaction?.is_recurring ?? false);
  const [ruleSuggestion, setRuleSuggestion] = useState<{ description: string; categoryId: string; categoryName: string } | null>(null);
  const [ruleSaved, setRuleSaved] = useState(false);
  const [isSavingRule, startSavingRule] = useTransition();
  const [duplicateWarning, setDuplicateWarning] = useState<PotentialDuplicate[] | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const lastAccount = useLastUsed("txn_account");
  const lastType = useLastUsed("txn_type");

  // Resolve smart defaults for new transactions
  const defaultAccountId = transaction?.account_id != null
    ? String(transaction.account_id)
    : lastAccount.get() ?? undefined;
  const defaultType = transaction?.type ?? lastType.get() ?? "expense";

  const [selectedType, setSelectedType] = useState(defaultType);

  const today = toDateString(new Date());

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      if (savedIds.length > 0) {
        onSaved?.(savedIds);
      }
      setSavedIds([]);
      setView("form");
      setRuleSuggestion(null);
      setRuleSaved(false);
    }
    setOpen(nextOpen);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (isEdit) {
      formData.set("id", String(transaction.id));
    }

    // For new transactions, check for duplicates first
    if (!isEdit) {
      const accountId = formData.get("account_id") as string;
      const amount = parseFloat(formData.get("amount") as string);
      const date = formData.get("date") as string;
      const type = formData.get("type") as string;

      if (accountId && amount > 0 && date) {
        startTransition(async () => {
          try {
            const dupes = await checkForDuplicate(
              accountId, amount, date,
              type as 'income' | 'expense' | 'transfer' | 'sale' | 'refund',
            );
            if (dupes.length > 0) {
              setDuplicateWarning(dupes);
              setPendingFormData(formData);
              return;
            }
          } catch {
            // If duplicate check fails, proceed anyway
          }
          await saveTransaction(formData);
        });
        return;
      }
    }

    startTransition(() => saveTransaction(formData));
  }

  function handleConfirmDuplicate() {
    if (!pendingFormData) return;
    setDuplicateWarning(null);
    startTransition(() => saveTransaction(pendingFormData));
  }

  async function saveTransaction(formData: FormData) {
    const newCategoryId = formData.get("category_id") as string | null;
    const description = formData.get("description") as string;

    try {
      const result = isEdit
        ? await editTransaction(formData)
        : await addTransaction(formData);
      setSavedIds((prev) => [...prev, result.id]);
      toast.success(isEdit ? "Transaction updated" : "Transaction added");

      // Remember last-used values for next time
      if (!isEdit) {
        const acctId = formData.get("account_id") as string;
        const txnType = formData.get("type") as string;
        if (acctId) lastAccount.set(acctId);
        if (txnType) lastType.set(txnType);
      }

      // Check if category changed during edit — offer to create a rule
      if (isEdit && newCategoryId && newCategoryId !== transaction!.category_id && description) {
        const cat = categories.find((c) => c.id === newCategoryId);
        if (cat) {
          setRuleSuggestion({ description, categoryId: newCategoryId, categoryName: cat.name });
        }
      }

      setPendingFormData(null);
      setDuplicateWarning(null);
      setView("success");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  function handleLearnRule() {
    if (!ruleSuggestion) return;
    startSavingRule(async () => {
      await learnCategorisationRule(ruleSuggestion.description, ruleSuggestion.categoryId);
      setRuleSaved(true);
    });
  }

  function handleAddAnother() {
    setFormKey((k) => k + 1);
    setView("form");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {view === "success" ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>
                {isEdit ? "Transaction updated" : "Transaction added"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {isEdit ? "Transaction updated!" : "Transaction added!"}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {isEdit
                    ? "Your changes have been saved."
                    : savedIds.length === 1
                      ? "Your transaction has been recorded."
                      : `${savedIds.length} transactions added in this session.`}
                </p>
              </div>

              {ruleSuggestion && !ruleSaved && (
                <div className="w-full rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Create a rule?
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Always categorise &ldquo;{ruleSuggestion.description}&rdquo; as <span className="font-medium text-foreground">{ruleSuggestion.categoryName}</span>?
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setRuleSuggestion(null)}>
                      No thanks
                    </Button>
                    <Button size="sm" onClick={handleLearnRule} disabled={isSavingRule}>
                      {isSavingRule && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                      Create rule
                    </Button>
                  </div>
                </div>
              )}

              {ruleSaved && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Rule created — future transactions will auto-categorise.
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-2 sm:justify-center">
              {!isEdit && (
                <Button variant="outline" onClick={handleAddAnother}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Another
                </Button>
              )}
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update the details for this transaction."
                  : "Enter the details for a new transaction."}
              </DialogDescription>
            </DialogHeader>
            <form
              key={formKey}
              onSubmit={handleSubmit}
              className="grid gap-4"
            >
              {/* Type */}
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  name="type"
                  defaultValue={defaultType}
                  onValueChange={(v) => setSelectedType(v)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Refund auto-match note */}
              {selectedType === "refund" && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    ↩ Refund
                  </p>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll automatically try to match this refund to the original expense based on description and amount. Refunds are tracked separately from income and reduce your net spend.
                  </p>
                  {isEdit && transaction?.refund_for_transaction_id && (
                    <input type="hidden" name="refund_for_transaction_id" value={transaction.refund_for_transaction_id} />
                  )}
                </div>
              )}

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={transaction?.description}
                  placeholder="e.g. Grocery shopping"
                  required
                />
              </div>

              {/* Amount */}
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={transaction?.amount}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Account */}
              <div className="grid gap-2">
                <Label htmlFor="account_id">Account</Label>
                <Select name="account_id" defaultValue={defaultAccountId}>
                  <SelectTrigger id="account_id">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="category_id">Category</Label>
                <Select name="category_id" defaultValue={transaction?.category_id != null ? String(transaction.category_id) : undefined}>
                  <SelectTrigger id="category_id">
                    <SelectValue placeholder="Skip — auto-detect" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isEdit && (
                  <p className="text-[11px] text-muted-foreground">Leave blank to auto-categorise</p>
                )}
              </div>

              {/* Date */}
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  max={today}
                  defaultValue={transaction?.date ?? today}
                  required
                />
              </div>

              {/* Recurring */}
              <div className="grid gap-2">
                <Label htmlFor="is_recurring">Recurring</Label>
                <Select
                  name="is_recurring"
                  defaultValue={String(transaction?.is_recurring ?? false)}
                  onValueChange={(v) => setIsRecurring(v === "true")}
                >
                  <SelectTrigger id="is_recurring">
                    <SelectValue placeholder="Is this recurring?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recurring Pattern */}
              {isRecurring && (
                <div className="grid gap-2">
                  <Label htmlFor="recurring_pattern">Frequency</Label>
                  <Select name="recurring_pattern" defaultValue="monthly">
                    <SelectTrigger id="recurring_pattern">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Duplicate warning */}
              {duplicateWarning && duplicateWarning.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Possible duplicate
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A similar transaction already exists:
                  </p>
                  {duplicateWarning.map((d) => (
                    <p key={d.id} className="text-xs">
                      &ldquo;{d.description}&rdquo; &mdash; {d.date}
                    </p>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => { setDuplicateWarning(null); setPendingFormData(null); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleConfirmDuplicate}
                      disabled={isPending}
                    >
                      {isPending && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                      Add anyway
                    </Button>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Save Changes" : "Add Transaction"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
