import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
} from "lucide-react";
import { getAccountById } from "@/db/queries/accounts";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import {
  getTransactionsWithDetailsPaginated,
  getTransactionsCount,
  getTotalsByType,
  getDailyIncomeExpenseTrend,
  getDailyExpenseByCategory,
  searchTransactions,
} from "@/db/queries/transactions";
import { getCategoriesByUser } from "@/db/queries/categories";
import { getSplitsForTransactions } from "@/db/queries/transaction-splits";
import { getUncategorisedCount } from "@/db/queries/insights";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getSharesForResource } from "@/db/queries/sharing";
import { getCurrentUserId, getCurrentUserEmail } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatCurrency";
import { AccountFormDialog } from "@/components/AddAccountForm";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { ShareDialog } from "@/components/ShareDialog";
import { TransactionsClient } from "@/components/TransactionsClient";
import { DecisionMetricCard } from "@/components/dense-data/DecisionMetricCard";
import { DecisionRow } from "@/components/dense-data/DecisionRow";
import { AccountDetailPageClient } from "@/components/accounts/AccountDetailPageClient";
import {
  buildAccountCardDecision,
  buildVisibleExposureTotal,
} from "@/components/accounts/account-decision";

const typeConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  currentAccount: { label: "Current Account", variant: "secondary" },
  savings: { label: "Savings", variant: "default" },
  creditCard: { label: "Credit Card", variant: "destructive" },
  investment: { label: "Investment", variant: "outline" },
};

const PAGE_SIZE = 10;

function normalizePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

import { requireFeature } from "@/components/FeatureGate";

export default async function AccountDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    page?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>;
}) {
  await requireFeature("accounts");
  const { id: accountId } = await params;
  const resolvedSearchParams = await searchParams;
  const requestedPage = normalizePage(resolvedSearchParams?.page);
  const startDate = normalizeDate(resolvedSearchParams?.startDate);
  const endDate = normalizeDate(resolvedSearchParams?.endDate);
  const search = resolvedSearchParams?.search?.trim() || undefined;

  const userId = await getCurrentUserId();
  const email = await getCurrentUserEmail();

  const account = await getAccountById(userId, email, accountId);
  if (!account) notFound();

  const config = typeConfig[account.type ?? ""] ?? {
    label: account.type,
    variant: "secondary" as const,
  };

  // Fetch transactions + supporting data in parallel
  const sharedFetches = [
    getAccountsWithDetails(userId),
    getCategoriesByUser(userId),
    getDailyIncomeExpenseTrend(userId, 90),
    getDailyExpenseByCategory(userId, 90),
    getUserBaseCurrency(userId),
    getUncategorisedCount(userId),
    !account.isShared
      ? getSharesForResource(userId, "account", accountId)
      : Promise.resolve([]),
  ] as const;

  let transactions;
  let totalTransactions: number;
  let totalIncome: number;
  let totalExpenses: number;
  let totalRefunds: number;
  let allAccounts;
  let categories;
  let dailyTrend;
  let dailyCategoryExpenses;
  let baseCurrency;
  let uncategorisedCount: number = 0;
  let shares: Awaited<ReturnType<typeof getSharesForResource>>;

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
    [allAccounts, categories, dailyTrend, dailyCategoryExpenses, baseCurrency, uncategorisedCount, shares] = shared;
  } else {
    const [txns, count, inc, exp, ref, ...shared] = await Promise.all([
      getTransactionsWithDetailsPaginated(userId, requestedPage, PAGE_SIZE, startDate, endDate, accountId),
      getTransactionsCount(userId, startDate, endDate, accountId),
      getTotalsByType(userId, "income", startDate, endDate, accountId),
      getTotalsByType(userId, "expense", startDate, endDate, accountId),
      getTotalsByType(userId, "refund", startDate, endDate, accountId),
      ...sharedFetches,
    ]);
    transactions = txns;
    totalTransactions = count;
    totalIncome = inc;
    totalExpenses = exp;
    totalRefunds = ref;
    [allAccounts, categories, dailyTrend, dailyCategoryExpenses, baseCurrency, uncategorisedCount, shares] = shared;
  }

  const totalPages = Math.max(1, Math.ceil(totalTransactions / PAGE_SIZE));
  const totalAbsoluteBalance = buildVisibleExposureTotal(allAccounts, {
    id: account.id,
    balance: account.balance,
  });

  if (totalTransactions > 0 && requestedPage > totalPages) {
    const p = new URLSearchParams();
    if (totalPages > 1) p.set("page", String(totalPages));
    if (startDate) p.set("startDate", startDate);
    if (endDate) p.set("endDate", endDate);
    if (search) p.set("search", search);
    const qs = p.toString();
    redirect(`/dashboard/accounts/${accountId}${qs ? `?${qs}` : ""}`);
  }

  // Fetch splits for split transactions on this page
  const splitTxnIds = transactions.filter((t) => t.is_split).map((t) => t.id);
  const splitsMap = await getSplitsForTransactions(splitTxnIds);
  const serializedSplits: Record<
    string,
    {
      id: string;
      category_id: string | null;
      categoryName: string | null;
      categoryColor: string | null;
      amount: number;
      description: string | null;
    }[]
  > = {};
  for (const [txnId, rows] of splitsMap) {
    serializedSplits[txnId] = rows;
  }

  const accountDecision = buildAccountCardDecision(account, {
    currency: baseCurrency,
    totalAbsoluteBalance,
    shareCount: shares.length,
  });
  const netFlow = totalIncome - totalExpenses + totalRefunds;
  const accountActions = (
    <div className="space-y-4">
      <DecisionRow
        title="Account decision snapshot"
        amount={accountDecision.amountLabel}
        amountTone={accountDecision.amountTone}
        statusLabel={accountDecision.statusLabel}
        interpretation={accountDecision.interpretation}
        meta={[
          accountDecision.typeLabel,
          accountDecision.transactionsLabel,
          accountDecision.shareLabel,
          accountDecision.balanceShareLabel,
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        {!account.isShared ? (
          <ShareDialog
            resourceType="account"
            resourceId={account.id}
            resourceName={account.accountName}
            existingShares={shares.map((s) => ({
              id: s.id,
              shared_with_email: s.shared_with_email,
              permission: s.permission,
              status: s.status,
            }))}
          />
        ) : null}
        {!account.isShared ? <AccountFormDialog account={account} /> : null}
        {!account.isShared ? <DeleteAccountButton account={account} /> : null}
        <Button asChild variant="outline" size="sm">
          <a href="#account-activity">Jump to activity</a>
        </Button>
      </div>
    </div>
  );
  const accountPriorities = (
    <>
      <DecisionMetricCard
        eyebrow="Income"
        title={formatCurrency(totalIncome, baseCurrency)}
        subtitle="Money in during selected period"
        interpretation="Use this to verify salary and recurring inflows landed on schedule."
      />
      <DecisionMetricCard
        eyebrow="Spend"
        title={formatCurrency(totalExpenses, baseCurrency)}
        subtitle="Outflows during selected period"
        interpretation="Compare spend against planned monthly thresholds before adding commitments."
      />
      <DecisionMetricCard
        eyebrow="Refunds"
        title={formatCurrency(totalRefunds, baseCurrency)}
        subtitle="Recovered spend"
        interpretation="Refunds offset expenses, but they are less predictable than regular income."
      />
      <DecisionMetricCard
        eyebrow="Net flow"
        title={`${netFlow < 0 ? "−" : ""}${formatCurrency(Math.abs(netFlow), baseCurrency)}`}
        subtitle="Income − spend + refunds"
        interpretation={
          netFlow >= 0
            ? "Positive period cash flow supports savings or debt paydown."
            : "Negative period cash flow. Review recent spending pressure."
        }
      />
    </>
  );

  return (
    <AccountDetailPageClient
      breadcrumbHref="/dashboard/accounts"
      accountName={account.accountName}
      heroAside={(
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={config.variant}>{config.label}</Badge>
            {account.isShared ? (
              <Badge variant="outline" className="gap-1 text-[10px] text-white/90">
                <Users className="h-3 w-3" />
                Shared
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-white/90">
                Private
              </Badge>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="workspace-hero-panel rounded-2xl p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Balance</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {formatCurrency(account.balance, baseCurrency)}
              </p>
            </div>
            <div className="workspace-hero-panel rounded-2xl p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Transactions</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {account.transactions}
              </p>
            </div>
          </div>
        </div>
      )}
      actionShelf={accountActions}
      priorityCards={accountPriorities}
      activity={(
        <div id="account-activity">
          <TransactionsClient
            transactions={transactions}
            accounts={allAccounts}
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
            shellMode="embedded"
          />
        </div>
      )}
    />
  );
}
