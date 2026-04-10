"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRightLeft, ArrowUpDown, ChevronDown, ChevronRight, RefreshCw, Split } from "lucide-react";
import { InlineCategoryPicker } from "@/components/InlineCategoryPicker";
import { TransactionFormDialog } from "@/components/AddTransactionForm";
import { DeleteTransactionButton, formatDate, type Transaction } from "./TransactionHelpers";
import { buildTransactionDecisionState } from "./transaction-decision";
import type { AccountWithDetails, CategoryWithColor } from "@/lib/types";

interface UseTransactionColumnsArgs {
  accounts: AccountWithDetails[];
  categories: CategoryWithColor[];
  currency: string;
  expandedSplits: Set<string>;
  setExpandedSplits: Dispatch<SetStateAction<Set<string>>>;
  handleTransactionEdited: (id: string) => void;
}

export function useTransactionColumns({
  accounts,
  categories,
  currency,
  expandedSplits,
  setExpandedSplits,
  handleTransactionEdited,
}: UseTransactionColumnsArgs) {
  return useMemo<ColumnDef<Transaction>[]>(() => ([
    {
      accessorKey: "accountName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Account Name
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.accountName}</span>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.description}</span>
      ),
    },
    {
      accessorFn: (row) => row.category ?? "—",
      id: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <InlineCategoryPicker
          transactionId={row.original.id}
          currentCategoryId={row.original.category_id}
          categorySource={row.original.category_source}
          merchantName={row.original.merchant_name}
          categories={categories}
        />
      ),
    },
    {
      accessorFn: (row) => row.date ?? "",
      id: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.date)}</span>
      ),
    },
    {
      accessorKey: "amount",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const t = row.original;
        const decision = buildTransactionDecisionState(t, currency);
        const colorClass = decision.amountTone === "positive"
          ? "text-emerald-600"
          : decision.amountTone === "negative"
            ? "text-red-600"
            : decision.amountTone === "warning"
              ? "text-amber-600"
              : "text-foreground";
        return (
          <span className={`font-semibold tabular-nums ${colorClass}`}>
            {decision.amountLabel}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableGlobalFilter: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const t = row.original;
        const decision = buildTransactionDecisionState(t, currency);
        const transferToName = t.type === "transfer" && t.transfer_account_id
          ? accounts.find((a) => a.id === t.transfer_account_id)?.accountName
          : null;
        return (
          <div className="flex items-center gap-2">
            {t.type === "transfer" && decision.statusLabel && (
              <Badge variant="outline" className="gap-1 text-foreground border-border">
                <ArrowRightLeft className="h-3 w-3" />
                {transferToName ? `Transfer → ${transferToName}` : decision.statusLabel}
              </Badge>
            )}
            {t.is_split && decision.statusLabel === "Split transaction" && (
              <Badge
                variant="outline"
                className="gap-1 cursor-pointer text-foreground border-border hover:bg-secondary/60"
                onClick={() => {
                  setExpandedSplits((prev) => {
                    const next = new Set(prev);
                    if (next.has(t.id)) next.delete(t.id);
                    else next.add(t.id);
                    return next;
                  });
                }}
              >
                <Split className="h-3 w-3" />
                {decision.statusLabel}
                {expandedSplits.has(t.id) ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Badge>
            )}
            {t.type !== "transfer" && !t.is_split && decision.statusLabel && (
              <Badge variant="outline" className="gap-1 text-amber-700 border-amber-200">
                {decision.statusLabel}
              </Badge>
            )}
            {t.is_recurring && (
              <Badge variant="secondary" className="gap-1">
                <RefreshCw className="h-3 w-3" />
                Recurring
              </Badge>
            )}
            {t.type !== "transfer" && (
              <TransactionFormDialog
                transaction={t}
                accounts={accounts}
                categories={categories}
                onSaved={(ids) => {
                  const [editedId] = ids;
                  if (editedId !== undefined) {
                    handleTransactionEdited(editedId);
                  }
                }}
              />
            )}
            <DeleteTransactionButton
              transaction={t}
            />
          </div>
        );
      },
    },
  ]), [accounts, categories, currency, handleTransactionEdited, expandedSplits, setExpandedSplits]);
}
