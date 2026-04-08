"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { TransactionFormDialog } from "@/components/AddTransactionForm";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import { TransferFormDialog } from "@/components/AddTransferForm";
import { ImportCSVDialog } from "@/components/ImportCSVDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowRightLeft, ArrowUpDown, ChevronDown, ChevronRight, Download, Loader2, Receipt, RefreshCw, Search, Sparkles, Split, Tag, X, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SplitTransactionDialog } from "@/components/SplitTransactionDialog";
import { deleteTransaction } from "@/db/mutations/transactions";
import { bulkAutoCategorise } from "@/db/mutations/bulk-categorise";
import { formatCurrency } from "@/lib/formatCurrency";
import { toDateString, addDays } from "@/lib/date";
import type { AccountWithDetails, CategoryWithColor, TransactionWithDetails, SplitDetail } from "@/lib/types";
import { TransactionsInsightsCharts } from "@/components/TransactionsInsightsCharts";
import type { DailyCashflowPoint, DailyCategoryExpensePoint } from "@/db/queries/transactions";

function DeleteTransactionButton({
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

function BulkCategoriseButton({ count }: { count: number }) {
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

// Use shared types from @/lib/types
type Transaction = TransactionWithDetails;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: string | null) {
  if (!date) return "—";
  return dateFormatter.format(new Date(date));
}

function getPageHref(page: number, startDate?: string, endDate?: string, search?: string, accountId?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (search) params.set("search", search);
  if (accountId) params.set("account", accountId);
  const qs = params.toString();
  return `/dashboard/transactions${qs ? `?${qs}` : ""}`;
}


export function TransactionsClient({
  transactions,
  accounts,
  categories,
  currentPage,
  pageSize,
  totalTransactions,
  totalIncome,
  totalExpenses,
  startDate: activeStartDate,
  endDate: activeEndDate,
  search: activeSearch,
  accountId: activeAccountId,
  dailyTrend,
  dailyCategoryExpenses,
  currency,
  splits,
  uncategorisedCount,
}: {
  transactions: Transaction[];
  accounts: AccountWithDetails[];
  categories: CategoryWithColor[];
  currentPage: number;
  pageSize: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  accountId?: string;
  dailyTrend: DailyCashflowPoint[];
  dailyCategoryExpenses: DailyCategoryExpensePoint[];
  currency: string;
  splits?: Record<string, SplitDetail[]>;
  uncategorisedCount?: number;
}) {
  const router = useRouter();
  const [expandedSplits, setExpandedSplits] = useState<Set<string>>(new Set());
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState(activeSearch ?? "");
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(activeStartDate ?? "");
  const [filterEndDate, setFilterEndDate] = useState(activeEndDate ?? "");
  const [filterAccountId, setFilterAccountId] = useState(activeAccountId ?? "__all__");
  const [exportStartDate, setExportStartDate] = useState(() => toDateString(addDays(new Date(), -30)));
  const [exportEndDate, setExportEndDate] = useState(() => toDateString(new Date()));
  const isAccountFilterActive = !!activeAccountId;
  const isDateFilterActive = !!activeStartDate || !!activeEndDate;
  const isFilterActive = isDateFilterActive || isAccountFilterActive;
  const isSearchActive = !!activeSearch;
  const dateLabel = isDateFilterActive
    ? `${activeStartDate ?? "start"} to ${activeEndDate ?? "now"}`
    : "All time";
  const canCreateTransaction = accounts.length > 0 && categories.length > 0;
  const isExportRangeValid = exportStartDate !== ""
    && exportEndDate !== ""
    && exportStartDate <= exportEndDate;
  const resolvedCurrentPage = totalTransactions > 0 ? currentPage : 1;
  const totalPages = Math.max(1, Math.ceil(totalTransactions / pageSize));
  const startIndex = totalTransactions > 0 ? (resolvedCurrentPage - 1) * pageSize + 1 : 0;
  const endIndex = totalTransactions > 0
    ? Math.min(resolvedCurrentPage * pageSize, totalTransactions)
    : 0;

  useEffect(() => {
    if (highlightedIds.size === 0) return;
    const timer = setTimeout(() => {
      setHighlightedIds(new Set());
    }, 3000);
    return () => clearTimeout(timer);
  }, [highlightedIds]);

  const handleTransactionsAdded = useCallback((ids: string[]) => {
    setHighlightedIds(new Set(ids));
  }, []);

  const handleTransactionEdited = useCallback((id: string) => {
    setHighlightedIds(new Set([id]));
  }, []);

  const handleExportCsv = useCallback(() => {
    if (!isExportRangeValid) {
      return;
    }

    const params = new URLSearchParams({
      startDate: exportStartDate,
      endDate: exportEndDate,
    });
    window.location.href = `/dashboard/transactions/export?${params.toString()}`;
  }, [exportEndDate, exportStartDate, isExportRangeValid]);

  const columns = useMemo<ColumnDef<Transaction>[]>(() => ([
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
        <span className="text-muted-foreground">{row.original.category ?? "—"}</span>
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
        const colorClass =
          t.type === "income"
            ? "text-emerald-600"
            : t.type === "transfer"
              ? "text-blue-600"
              : "text-red-600";
        const prefix =
          t.type === "income" ? "+" : t.type === "transfer" ? "⇄ " : "−";
        return (
          <span className={`font-semibold tabular-nums ${colorClass}`}>
            {prefix}
            {formatCurrency(t.amount, currency)}
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
        const transferToName = t.type === "transfer" && t.transfer_account_id
          ? accounts.find((a) => a.id === t.transfer_account_id)?.accountName
          : null;
        return (
          <div className="flex items-center gap-2">
            {t.type === "transfer" && (
              <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200">
                <ArrowRightLeft className="h-3 w-3" />
                {transferToName ? `→ ${transferToName}` : "Transfer"}
              </Badge>
            )}
            {t.is_split && (
              <Badge
                variant="outline"
                className="gap-1 cursor-pointer text-violet-600 border-violet-200 hover:bg-violet-50"
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
                Split
                {expandedSplits.has(t.id) ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
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
  ]), [accounts, categories, currency, handleTransactionEdited, expandedSplits]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: transactions,
    columns,
    getRowId: (row) => String(row.id),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transactions</h1>
        </div>
        {canCreateTransaction ? (
          <div className="flex flex-wrap items-center gap-2">
            <ImportCSVDialog
              accounts={accounts}
              onImported={() => router.refresh()}
            />
            {accounts.length >= 2 && (
              <TransferFormDialog
                accounts={accounts}
                onSaved={(id) => handleTransactionsAdded([id])}
              />
            )}
            <SplitTransactionDialog
              accounts={accounts}
              categories={categories}
              onSaved={() => router.refresh()}
            />
            {(uncategorisedCount ?? 0) > 0 && (
              <BulkCategoriseButton count={uncategorisedCount ?? 0} />
            )}
            <QuickAddTransaction
              onSaved={handleTransactionsAdded}
            />
            <TransactionFormDialog
              accounts={accounts}
              categories={categories}
              onSaved={handleTransactionsAdded}
            />
          </div>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href={accounts.length === 0 ? "/dashboard/accounts" : "/dashboard/categories"}>
              {accounts.length === 0 ? "Create Account to Start" : "Create Category to Start"}
            </Link>
          </Button>
        )}
      </div>

      {/* Search & date range filter */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = searchInput.trim();
              router.push(getPageHref(1, activeStartDate, activeEndDate, trimmed || undefined, activeAccountId));
            }}
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by description, account, or category..."
                  className="pl-9"
                />
              </div>
              <Button type="submit">
                Search
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={aiSearchLoading || !searchInput.trim()}
                title="AI-powered natural language search"
                onClick={async () => {
                  const query = searchInput.trim();
                  if (!query) return;
                  setAiSearchLoading(true);
                  try {
                    const res = await fetch("/api/parse-search", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ query }),
                    });
                    if (!res.ok) throw new Error();
                    const filters = await res.json();
                    router.push(getPageHref(
                      1,
                      filters.startDate ?? undefined,
                      filters.endDate ?? undefined,
                      filters.search ?? undefined,
                      filters.accountId ?? undefined,
                    ));
                  } catch {
                    const { toast } = await import("sonner");
                    toast.error("Could not parse your query. Try a simpler search.");
                  } finally {
                    setAiSearchLoading(false);
                  }
                }}
              >
                {aiSearchLoading ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                )}
                AI
              </Button>
              {isSearchActive && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchInput("");
                    router.push(getPageHref(1, activeStartDate, activeEndDate, undefined, activeAccountId));
                  }}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </form>
          {isSearchActive && (
            <p className="text-sm text-muted-foreground">
              Showing results for <span className="font-medium text-foreground">&ldquo;{activeSearch}&rdquo;</span>
              {" "}&mdash; {totalTransactions} match{totalTransactions !== 1 ? "es" : ""}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="filter-start-date">From</Label>
                <Input
                  id="filter-start-date"
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="filter-end-date">To</Label>
                <Input
                  id="filter-end-date"
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Account</Label>
                <Select
                  value={filterAccountId}
                  onValueChange={setFilterAccountId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">
                      <Wallet className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      All accounts
                    </SelectItem>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={getPageHref(1, filterStartDate || undefined, filterEndDate || undefined, activeSearch, filterAccountId === "__all__" ? undefined : filterAccountId)}>
                  Apply Filter
                </Link>
              </Button>
              {(isFilterActive || isSearchActive) && (
                <Button variant="outline" asChild>
                  <Link href="/dashboard/transactions">Clear All</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact stats */}
      <Card>
        <CardContent className="grid grid-cols-3 divide-x py-4">
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-lg font-semibold tabular-nums">{totalTransactions}</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-lg font-semibold tabular-nums text-emerald-600">{formatCurrency(totalIncome, currency)}</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-lg font-semibold tabular-nums text-red-600">{formatCurrency(totalExpenses, currency)}</p>
          </div>
        </CardContent>
      </Card>

      <TransactionsInsightsCharts
        dailyTrend={dailyTrend}
        dailyCategoryExpenses={dailyCategoryExpenses}
        currency={currency}
      />

      {/* Transactions table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            A paginated list of your recent transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-lg border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="csv-export-start-date">From</Label>
                  <Input
                    id="csv-export-start-date"
                    type="date"
                    value={exportStartDate}
                    onChange={(event) => setExportStartDate(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="csv-export-end-date">To</Label>
                  <Input
                    id="csv-export-end-date"
                    type="date"
                    value={exportEndDate}
                    onChange={(event) => setExportEndDate(event.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleExportCsv}
                disabled={!isExportRangeValid}
                className="sm:ml-3"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            {!isExportRangeValid && (
              <p className="text-destructive mt-2 text-xs">
                The start date must be on or before the end date.
              </p>
            )}
          </div>
          {transactions.length === 0 ? (
            totalTransactions === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12 text-center">
                <Receipt className="h-10 w-10 opacity-40" />
                <div>
                  <p className="text-sm font-medium">No transactions yet</p>
                  <p className="text-xs">
                    Add your first transaction to start tracking activity.
                  </p>
                </div>
                {canCreateTransaction ? (
                  <TransactionFormDialog
                    accounts={accounts}
                    categories={categories}
                    onSaved={handleTransactionsAdded}
                  />
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link href={accounts.length === 0 ? "/dashboard/accounts" : "/dashboard/categories"}>
                      {accounts.length === 0 ? "Add an account first" : "Add a category first"}
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12 text-center">
                <Receipt className="h-10 w-10 opacity-40" />
                <div>
                  <p className="text-sm font-medium">No transactions on this page</p>
                  <p className="text-xs">
                    Try going back to an earlier page.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={getPageHref(1, undefined, undefined, undefined, activeAccountId)}>Go to first page</Link>
                </Button>
              </div>
            )
          ) : (
            <>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={header.column.id === "amount" ? "text-right" : header.column.id === "actions" ? "w-[80px]" : undefined}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {rows.flatMap((row) => {
                    const t = row.original;
                    const txnSplits = splits?.[t.id];
                    const isExpanded = expandedSplits.has(t.id);
                    const elements = [
                      <TableRow
                        key={row.id}
                        className={
                          highlightedIds.has(t.id)
                            ? "animate-highlight-row"
                            : ""
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cell.column.id === "amount" ? "text-right" : undefined}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>,
                    ];
                    if (t.is_split && isExpanded && txnSplits && txnSplits.length > 0) {
                      elements.push(
                        <TableRow key={`${row.id}-splits`} className="bg-muted/30 hover:bg-muted/40">
                          <TableCell colSpan={columns.length} className="py-2 px-6">
                            <div className="space-y-1.5">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Split breakdown</p>
                              {txnSplits.map((s: SplitDetail) => (
                                <div key={s.id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    {s.categoryColor && (
                                      <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: s.categoryColor }}
                                      />
                                    )}
                                    <span className="font-medium">{s.categoryName ?? "Uncategorised"}</span>
                                    {s.description && (
                                      <span className="text-muted-foreground">— {s.description}</span>
                                    )}
                                  </div>
                                  <span className="font-mono tabular-nums font-medium">
                                    {formatCurrency(s.amount, currency)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>,
                      );
                    }
                    return elements;
                  })}
                </TableBody>
              </Table>
              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">
                    Showing {startIndex}–{endIndex} of {totalTransactions} transactions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {resolvedCurrentPage > 1 ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={getPageHref(resolvedCurrentPage - 1, activeStartDate, activeEndDate, activeSearch, activeAccountId)}>Previous</Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Previous
                    </Button>
                  )}
                  <p className="text-muted-foreground min-w-28 text-center text-xs">
                    Page {resolvedCurrentPage} of {totalPages}
                  </p>
                  {resolvedCurrentPage < totalPages ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={getPageHref(resolvedCurrentPage + 1, activeStartDate, activeEndDate, activeSearch, activeAccountId)}>Next</Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
