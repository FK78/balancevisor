"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";
import { deleteTransaction } from "@/db/mutations/transactions";
import { bulkAutoCategorise } from "@/db/mutations/bulk-categorise";
import { Loader2, Tag } from "lucide-react";
import type { TransactionWithDetails } from "@/lib/types";

export type Transaction = TransactionWithDetails;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(date: string | null) {
  if (!date) return "—";
  return dateFormatter.format(new Date(date));
}

export function getPageHref(page: number, startDate?: string, endDate?: string, search?: string, accountId?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (search) params.set("search", search);
  if (accountId) params.set("account", accountId);
  const qs = params.toString();
  return `/dashboard/transactions${qs ? `?${qs}` : ""}`;
}

export function DeleteTransactionButton({
  transaction,
}: {
  transaction: Transaction;
}) {
  return (
    <DeleteConfirmButton
      dialogTitle="Delete transaction?"
      dialogDescription={
        <>This will permanently delete &ldquo;{transaction.description}&rdquo;. This action cannot be undone.</>
      }
      onDelete={() => deleteTransaction(transaction.id)}
      successTitle="Transaction deleted"
      successDescription="The transaction has been removed."
    />
  );
}

export function BulkCategoriseButton({ count }: { count: number }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    try {
      const result = await bulkAutoCategorise();
      if (result.categorised > 0) {
        const { toast } = await import("sonner");
        toast.success(`Auto-categorised ${result.categorised} transaction${result.categorised !== 1 ? "s" : ""}${result.remaining > 0 ? ` (${result.remaining} unmatched)` : ""}`);
        router.refresh();
      } else {
        const { toast } = await import("sonner");
        toast.info("No matching rules found. Create rules by editing transaction categories.");
      }
    } catch {
      const { toast } = await import("sonner");
      toast.error("Failed to auto-categorise");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Tag className="mr-1 h-3.5 w-3.5" />}
      Categorise {count}
    </Button>
  );
}
