import { redirect } from "next/navigation";
import {
  getDailyExpenseByCategory,
  getDailyIncomeExpenseTrend,
  getTransactionsCount,
  getTransactionsWithDetailsPaginated,
  getTotalsByType,
  searchTransactions,
} from "@/db/queries/transactions";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getCategoriesByUser } from "@/db/queries/categories";
import { getSplitsForTransactions } from "@/db/queries/transaction-splits";
import { getUncategorisedCount } from "@/db/queries/insights";
import { TransactionsClient } from "@/components/TransactionsClient";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { detectRecurringCandidates } from "@/lib/recurring-detection";
import { RecurringDetectionBanner } from "@/components/RecurringDetectionBanner";
import { TransactionReviewBanner } from "@/components/TransactionReviewBanner";
import { getPendingReviewFlags } from "@/db/queries/review-flags";
import { requireFeature } from "@/components/FeatureGate";

const PAGE_SIZE = 10;

function normalizePage(value?: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

export default async function Transactions({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; startDate?: string; endDate?: string; search?: string; account?: string }>;
}) {
  await requireFeature("transactions");
  const resolvedSearchParams = await searchParams;
  const requestedPage = normalizePage(resolvedSearchParams?.page);
  const startDate = normalizeDate(resolvedSearchParams?.startDate);
  const endDate = normalizeDate(resolvedSearchParams?.endDate);
  const search = resolvedSearchParams?.search?.trim() || undefined;
  const accountId = resolvedSearchParams?.account || undefined;
  const userId = await getCurrentUserId();

  let transactions;
  let totalTransactions: number;
  let totalIncome: number;
  let totalExpenses: number;
  let totalRefunds: number;
  let accounts;
  let categories;
  let dailyTrend;
  let dailyCategoryExpenses;
  let baseCurrency;
  let uncategorisedCount: number = 0;

  // Shared fetches that are always needed regardless of search
  const sharedFetches = [
    getAccountsWithDetails(userId),
    getCategoriesByUser(userId),
    getDailyIncomeExpenseTrend(userId, 90),
    getDailyExpenseByCategory(userId, 90),
    getUserBaseCurrency(userId),
    getUncategorisedCount(userId),
  ] as const;

  if (search) {
    const [result, ...shared] = await Promise.all([
      searchTransactions(userId, search, requestedPage, PAGE_SIZE, startDate, endDate, accountId),
      ...sharedFetches,
    ]);
    transactions = result.transactions;
    totalTransactions = result.totalCount;
    totalIncome = result.totalIncome;
    totalExpenses = result.totalExpenses;
    totalRefunds = result.totalRefunds;
    [accounts, categories, dailyTrend, dailyCategoryExpenses, baseCurrency, uncategorisedCount] = shared;
  } else {
    const [txns, count, inc, exp, ref, ...shared] = await Promise.all([
      getTransactionsWithDetailsPaginated(userId, requestedPage, PAGE_SIZE, startDate, endDate, accountId),
      getTransactionsCount(userId, startDate, endDate, accountId),
      getTotalsByType(userId, 'income', startDate, endDate, accountId),
      getTotalsByType(userId, 'expense', startDate, endDate, accountId),
      getTotalsByType(userId, 'refund', startDate, endDate, accountId),
      ...sharedFetches,
    ]);
    transactions = txns;
    totalTransactions = count;
    totalIncome = inc;
    totalExpenses = exp;
    totalRefunds = ref;
    [accounts, categories, dailyTrend, dailyCategoryExpenses, baseCurrency] = shared;
  }

  const totalPages = Math.max(1, Math.ceil(totalTransactions / PAGE_SIZE));

  if (totalTransactions > 0 && requestedPage > totalPages) {
    const params = new URLSearchParams();
    if (totalPages > 1) params.set("page", String(totalPages));
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (search) params.set("search", search);
    if (accountId) params.set("account", accountId);
    const qs = params.toString();
    redirect(`/dashboard/transactions${qs ? `?${qs}` : ""}`);
  }

  // Fetch splits for any split transactions on this page
  const splitTxnIds = transactions.filter((t) => t.is_split).map((t) => t.id);
  const splitsMap = await getSplitsForTransactions(splitTxnIds);
  const serializedSplits: Record<string, { id: string; category_id: string | null; categoryName: string | null; categoryColor: string | null; amount: number; description: string | null }[]> = {};
  for (const [txnId, rows] of splitsMap) {
    serializedSplits[txnId] = rows;
  }

  // Detect recurring patterns (only on unfiltered first page)
  const [recurringCandidates, reviewFlags] = await Promise.all([
    (!search && !startDate && !endDate && requestedPage === 1)
      ? detectRecurringCandidates(userId)
      : Promise.resolve([]),
    (!search && !startDate && !endDate && requestedPage === 1)
      ? getPendingReviewFlags(userId)
      : Promise.resolve([]),
  ]);

  return (
    <>
    {(recurringCandidates.length > 0 || reviewFlags.length > 0) && (
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-10 md:pt-10 space-y-4">
        {reviewFlags.length > 0 && (
          <TransactionReviewBanner flags={reviewFlags} currency={baseCurrency} />
        )}
        {recurringCandidates.length > 0 && (
          <RecurringDetectionBanner candidates={recurringCandidates} currency={baseCurrency} />
        )}
      </div>
    )}
    <TransactionsClient
      transactions={transactions}
      accounts={accounts}
      categories={categories}
      currentPage={requestedPage}
      pageSize={PAGE_SIZE}
      totalTransactions={totalTransactions}
      totalIncome={totalIncome}
      totalExpenses={totalExpenses}
      totalRefunds={totalRefunds}
      startDate={startDate}
      endDate={endDate}
      search={search}
      accountId={accountId}
      dailyTrend={dailyTrend}
      dailyCategoryExpenses={dailyCategoryExpenses}
      currency={baseCurrency}
      splits={serializedSplits}
      uncategorisedCount={uncategorisedCount}
    />
    </>
  );
}
