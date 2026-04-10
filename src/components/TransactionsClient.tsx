"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { TransactionFormDialog } from "@/components/AddTransactionForm";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import { useAiEnabled } from "@/components/AiSettingsProvider";
import { TransferFormDialog } from "@/components/AddTransferForm";
import { ImportCSVDialog } from "@/components/ImportCSVDialog";
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Download, Loader2, Receipt, Search, Sparkles, X, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SplitTransactionDialog } from "@/components/SplitTransactionDialog";
import { WorkspaceTabs } from "@/components/ui/workspace-tabs";
import { formatCurrency } from "@/lib/formatCurrency";
import { toDateString, addDays } from "@/lib/date";
import type { AccountWithDetails, CategoryWithColor, SplitDetail } from "@/lib/types";
import type { DailyCashflowPoint, DailyCategoryExpensePoint } from "@/db/queries/transactions";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { BulkCategoriseButton, DeleteTransactionButton, getPageHref, type Transaction } from "@/components/transactions/TransactionHelpers";
import { TransactionDecisionRow } from "@/components/transactions/TransactionDecisionRow";
import { buildTransactionDecisionState } from "@/components/transactions/transaction-decision";
import { useTransactionColumns } from "@/components/transactions/TransactionColumns";
import {
  getInitialTransactionsWorkspaceTab,
  TRANSACTIONS_WORKSPACE_TABS,
  type TransactionsWorkspaceTab,
} from "@/components/transactions/transactions-workspace";

const TransactionsInsightsCharts = dynamic(
  () => import("@/components/TransactionsInsightsCharts").then((mod) => mod.TransactionsInsightsCharts),
  { loading: () => <ChartSkeleton height={300} /> }
);


export function TransactionsClient({
  transactions,
  accounts,
  categories,
  currentPage,
  pageSize,
  totalTransactions,
  totalIncome,
  totalExpenses,
  totalRefunds = 0,
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
  totalRefunds?: number;
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
  const aiEnabled = useAiEnabled();
  const [expandedSplits, setExpandedSplits] = useState<Set<string>>(new Set());
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState(activeSearch ?? "");
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(activeStartDate ?? "");
  const [filterEndDate, setFilterEndDate] = useState(activeEndDate ?? "");
  const [filterAccountId, setFilterAccountId] = useState(activeAccountId ?? "__all__");
  const [activeTab, setActiveTab] = useState<TransactionsWorkspaceTab>(() => getInitialTransactionsWorkspaceTab({
    search: activeSearch,
    startDate: activeStartDate,
    endDate: activeEndDate,
    accountId: activeAccountId,
    uncategorisedCount,
  }));
  const [exportStartDate, setExportStartDate] = useState(() => toDateString(addDays(new Date(), -30)));
  const [exportEndDate, setExportEndDate] = useState(() => toDateString(new Date()));
  const isAccountFilterActive = !!activeAccountId;
  const isDateFilterActive = !!activeStartDate || !!activeEndDate;
  const isFilterActive = isDateFilterActive || isAccountFilterActive;
  const isSearchActive = !!activeSearch;
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
  const activeAccountName = activeAccountId
    ? accounts.find((account) => account.id === activeAccountId)?.accountName ?? "Selected account"
    : null;
  const reviewTransactions = transactions.filter(
    (transaction) => buildTransactionDecisionState(transaction, currency).statusLabel === "Needs review",
  );
  const hasReviewItemsOutsideCurrentQueue = (uncategorisedCount ?? 0) > 0 && reviewTransactions.length === 0;
  const searchResultSummary = `Showing ${totalTransactions} transaction${totalTransactions === 1 ? "" : "s"}`;

  useEffect(() => {
    if (highlightedIds.size === 0) return;
    const timer = setTimeout(() => {
      setHighlightedIds(new Set());
    }, 3000);
    return () => clearTimeout(timer);
  }, [highlightedIds]);

  useEffect(() => {
    setActiveTab(getInitialTransactionsWorkspaceTab({
      search: activeSearch,
      startDate: activeStartDate,
      endDate: activeEndDate,
      accountId: activeAccountId,
      uncategorisedCount,
    }));
  }, [activeAccountId, activeEndDate, activeSearch, activeStartDate, uncategorisedCount]);

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

  const columns = useTransactionColumns({
    accounts,
    categories,
    currency,
    expandedSplits,
    setExpandedSplits,
    handleTransactionEdited,
  });

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
  const appliedFilterAccountId = filterAccountId === "__all__" ? undefined : filterAccountId;
  const searchHref = getPageHref(
    1,
    filterStartDate || undefined,
    filterEndDate || undefined,
    searchInput.trim() || undefined,
    appliedFilterAccountId,
  );
  const filterHref = getPageHref(
    1,
    filterStartDate || undefined,
    filterEndDate || undefined,
    activeSearch,
    appliedFilterAccountId,
  );

  function renderTransactionsTable({
    title,
    description,
    showExportControls,
  }: {
    title: string;
    description: string;
    showExportControls: boolean;
  }) {
    return (
      <Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {showExportControls && (
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
          )}
          {transactions.length === 0 ? (
            <>
              <div className="sm:hidden">
                {totalTransactions === 0 ? (
                  <DecisionEmptyState
                    title="No transactions yet"
                    description="Add your first transaction to start tracking activity."
                    action={canCreateTransaction ? (
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
                  />
                ) : (
                  <DecisionEmptyState
                    title="No transactions on this page"
                    description="Try going back to an earlier page."
                    action={(
                      <Button asChild size="sm" variant="outline">
                        <Link href={getPageHref(1, undefined, undefined, undefined, activeAccountId)}>Go to first page</Link>
                      </Button>
                    )}
                  />
                )}
              </div>

              {totalTransactions === 0 ? (
                <div className="text-muted-foreground hidden flex-col items-center justify-center gap-3 py-12 text-center sm:flex">
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
                <div className="text-muted-foreground hidden flex-col items-center justify-center gap-3 py-12 text-center sm:flex">
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
              )}
            </>
          ) : (
            <>
              <div className="space-y-3 sm:hidden">
                {transactions.map((transaction) => (
                  <TransactionDecisionRow
                    key={transaction.id}
                    transaction={transaction}
                    currency={currency}
                    action={transaction.type !== "transfer" ? (
                      <div className="flex items-center justify-end gap-2">
                        <TransactionFormDialog
                          transaction={transaction}
                          accounts={accounts}
                          categories={categories}
                          onSaved={(ids) => {
                            const [editedId] = ids;
                            if (editedId !== undefined) {
                              handleTransactionEdited(editedId);
                            }
                          }}
                        />
                        <DeleteTransactionButton transaction={transaction} />
                      </div>
                    ) : (
                      <DeleteTransactionButton transaction={transaction} />
                    )}
                  />
                ))}
              </div>

              <div className="hidden sm:block">
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
              </div>
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
    );
  }

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
            {(uncategorisedCount ?? 0) > 0 && activeTab !== "review" && (
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

      <section className="space-y-4">
        <div className="workspace-panel-surface space-y-3 rounded-[28px] border border-[var(--workspace-card-border)] px-4 py-4 shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Workspace
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Switch between your feed, search tools, and review queue.
            </h2>
          </div>
          <WorkspaceTabs
            ariaLabel="Transactions workspace tabs"
            tabs={TRANSACTIONS_WORKSPACE_TABS}
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TransactionsWorkspaceTab)}
            className="bg-muted/50"
          />
        </div>

        {TRANSACTIONS_WORKSPACE_TABS.map((tab) => (
          <div
            key={tab.value}
            id={`workspace-panel-${tab.value}`}
            role="tabpanel"
            aria-labelledby={`workspace-tab-${tab.value}`}
            hidden={tab.value !== activeTab}
          >
            {tab.value === "feed" && activeTab === "feed" ? (
              <div className="space-y-4">
                <Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
                  <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-5 sm:gap-0 sm:divide-x">
                    <div className="px-4 text-center">
                      <p className="text-xs text-muted-foreground">Transactions</p>
                      <p className="text-base font-semibold tabular-nums sm:text-lg">{totalTransactions}</p>
                    </div>
                    <div className="px-4 text-center">
                      <p className="text-xs text-muted-foreground">Income</p>
                      <p className="text-base font-semibold tabular-nums text-emerald-600 sm:text-lg">{formatCurrency(totalIncome, currency)}</p>
                    </div>
                    <div className="px-4 text-center">
                      <p className="text-xs text-muted-foreground">Spend</p>
                      <p className="text-base font-semibold tabular-nums text-red-600 sm:text-lg">{formatCurrency(totalExpenses, currency)}</p>
                    </div>
                    <div className="px-4 text-center">
                      <p className="text-xs text-muted-foreground">Refunds</p>
                      <p className="text-base font-semibold tabular-nums text-amber-600 sm:text-lg">{formatCurrency(totalRefunds, currency)}</p>
                    </div>
                    <div className="col-span-2 px-4 text-center sm:col-span-1">
                      <p className="text-xs text-muted-foreground">Net Spend</p>
                      <p className="text-base font-semibold tabular-nums text-red-600 sm:text-lg">{formatCurrency(totalExpenses - totalRefunds, currency)}</p>
                    </div>
                  </CardContent>
                </Card>

                <TransactionsInsightsCharts
                  dailyTrend={dailyTrend}
                  dailyCategoryExpenses={dailyCategoryExpenses}
                  currency={currency}
                />

                {renderTransactionsTable({
                  title: "Recent Transactions",
                  description: "A paginated list of your recent transactions.",
                  showExportControls: true,
                })}
              </div>
            ) : null}

            {tab.value === "search" && activeTab === "search" ? (
              <div className="space-y-4">
                <Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
                  <CardHeader>
                    <CardTitle>Search your transactions</CardTitle>
                    <CardDescription>
                      Search by merchant, category, or account and refine with date filters.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        router.push(searchHref);
                      }}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by description, account, or category..."
                            className="pl-9"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button type="submit">
                            Search
                          </Button>
                          {aiEnabled && (
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
                          )}
                          {isSearchActive && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setSearchInput("");
                                router.push(getPageHref(
                                  1,
                                  filterStartDate || undefined,
                                  filterEndDate || undefined,
                                  undefined,
                                  appliedFilterAccountId,
                                ));
                              }}
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    </form>

                    <p className="text-sm text-muted-foreground">
                      {searchResultSummary}
                    </p>

                    {(isSearchActive || isFilterActive) && (
                      <div className="flex flex-wrap gap-2">
                        {isSearchActive && activeSearch ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={`Remove search filter ${activeSearch}`}
                            onClick={() => {
                              setSearchInput("");
                              router.push(getPageHref(
                                1,
                                activeStartDate,
                                activeEndDate,
                                undefined,
                                activeAccountId,
                              ));
                            }}
                          >
                            Search: {activeSearch}
                            <X className="ml-1 h-3 w-3" />
                          </Button>
                        ) : null}
                        {isAccountFilterActive && activeAccountName ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={`Remove account filter ${activeAccountName}`}
                            onClick={() => {
                              router.push(getPageHref(
                                1,
                                activeStartDate,
                                activeEndDate,
                                activeSearch,
                                undefined,
                              ));
                            }}
                          >
                            Account: {activeAccountName}
                            <X className="ml-1 h-3 w-3" />
                          </Button>
                        ) : null}
                        {activeStartDate ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={`Remove start date filter ${activeStartDate}`}
                            onClick={() => {
                              router.push(getPageHref(
                                1,
                                undefined,
                                activeEndDate,
                                activeSearch,
                                activeAccountId,
                              ));
                            }}
                          >
                            From: {activeStartDate}
                            <X className="ml-1 h-3 w-3" />
                          </Button>
                        ) : null}
                        {activeEndDate ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={`Remove end date filter ${activeEndDate}`}
                            onClick={() => {
                              router.push(getPageHref(
                                1,
                                activeStartDate,
                                undefined,
                                activeSearch,
                                activeAccountId,
                              ));
                            }}
                          >
                            To: {activeEndDate}
                            <X className="ml-1 h-3 w-3" />
                          </Button>
                        ) : null}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={() => setFiltersOpen(true)}>
                        Open filters
                      </Button>
                      {(isFilterActive || isSearchActive) && (
                        <Button variant="ghost" asChild>
                          <Link href="/dashboard/transactions">Clear all</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetContent side="bottom" className="rounded-t-[28px] border-t border-[var(--workspace-card-border)]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Narrow the feed by date range or a specific account.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 px-4 pb-6">
                      <div className="grid gap-4 sm:grid-cols-3">
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
                      <div className="flex flex-wrap gap-2">
                        <Button asChild className="flex-1 sm:flex-none">
                          <Link href={filterHref} onClick={() => setFiltersOpen(false)}>
                            Apply Filter
                          </Link>
                        </Button>
                        {(isFilterActive || isSearchActive) && (
                          <Button variant="outline" asChild>
                            <Link href="/dashboard/transactions" onClick={() => setFiltersOpen(false)}>
                              Clear All
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {renderTransactionsTable({
                  title: "Search results",
                  description: "Review and refine matching transactions.",
                  showExportControls: false,
                })}
              </div>
            ) : null}

            {tab.value === "review" && activeTab === "review" ? (
              <div className="space-y-4">
                <Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
                  <CardHeader>
                    <CardTitle>Transactions to review</CardTitle>
                    <CardDescription>
                      Focus on uncategorised activity and clean up your feed in batches.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {(uncategorisedCount ?? 0) > 0
                          ? `${uncategorisedCount} transactions are ready for categorisation.`
                          : "Nothing needs review right now."}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Use this queue to quickly move ambiguous transactions out of your main feed.
                      </p>
                    </div>
                    {(uncategorisedCount ?? 0) > 0 ? (
                      <BulkCategoriseButton count={uncategorisedCount ?? 0} />
                    ) : (
                      <Button asChild variant="outline">
                        <Link href="/dashboard/categories">Manage categories</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-3 sm:hidden">
                  {reviewTransactions.length > 0 ? (
                    reviewTransactions.map((transaction) => (
                      <TransactionDecisionRow
                        key={transaction.id}
                        transaction={transaction}
                        currency={currency}
                      />
                    ))
                  ) : hasReviewItemsOutsideCurrentQueue ? (
                    <DecisionEmptyState
                      title="Review items exist outside this page"
                      description="There are uncategorised transactions not shown in this page's review queue. Open the first page to continue reviewing."
                      action={(
                        <Button asChild size="sm" variant="outline">
                          <Link href={getPageHref(1, activeStartDate, activeEndDate, activeSearch, activeAccountId)}>
                            Open first page
                          </Link>
                        </Button>
                      )}
                    />
                  ) : (
                    <DecisionEmptyState
                      title="Nothing needs review right now"
                      description="All visible transactions already have categories."
                      action={(
                        <Button asChild size="sm" variant="outline">
                          <Link href="/dashboard/categories">Manage categories</Link>
                        </Button>
                      )}
                    />
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}
