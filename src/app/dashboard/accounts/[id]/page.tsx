import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  PiggyBank,
  TrendingUp,
  Users,
  Wallet,
  ChevronLeft,
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

const typeConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  currentAccount: { label: "Current Account", variant: "secondary" },
  savings: { label: "Savings", variant: "default" },
  creditCard: { label: "Credit Card", variant: "destructive" },
  investment: { label: "Investment", variant: "outline" },
};

const typeIcons: Record<string, typeof Wallet> = {
  currentAccount: Wallet,
  savings: PiggyBank,
  creditCard: CreditCard,
  investment: TrendingUp,
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

  const Icon = typeIcons[account.type ?? ""] ?? Wallet;
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
    [allAccounts, categories, dailyTrend, dailyCategoryExpenses, baseCurrency, uncategorisedCount, shares] = shared;
  } else {
    const [txns, count, inc, exp, ...shared] = await Promise.all([
      getTransactionsWithDetailsPaginated(userId, requestedPage, PAGE_SIZE, startDate, endDate, accountId),
      getTransactionsCount(userId, startDate, endDate, accountId),
      getTotalsByType(userId, "income", startDate, endDate, accountId),
      getTotalsByType(userId, "expense", startDate, endDate, accountId),
      ...sharedFetches,
    ]);
    transactions = txns;
    totalTransactions = count;
    totalIncome = inc;
    totalExpenses = exp;
    [allAccounts, categories, dailyTrend, dailyCategoryExpenses, baseCurrency, uncategorisedCount, shares] = shared;
  }

  const totalPages = Math.max(1, Math.ceil(totalTransactions / PAGE_SIZE));

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

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      {/* Breadcrumb */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1 px-2 text-muted-foreground">
          <Link href="/dashboard/accounts">
            <ChevronLeft className="h-4 w-4" />
            Accounts
          </Link>
        </Button>
      </div>

      {/* Account header card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
              <Icon className="text-primary h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{account.accountName}</CardTitle>
              <CardDescription className="text-sm">
                {account.transactions} transaction{account.transactions !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={config.variant}>{config.label}</Badge>
            {account.isShared && (
              <Badge variant="outline" className="gap-1 text-[10px]">
                <Users className="h-3 w-3" />
                Shared
              </Badge>
            )}
            {!account.isShared && (
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
            )}
            {!account.isShared && <AccountFormDialog account={account} />}
            {!account.isShared && <DeleteAccountButton account={account} />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 divide-x">
            <div className="px-4 text-center">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p
                className={`text-lg font-semibold tabular-nums ${
                  account.balance < 0 ? "text-red-600" : ""
                }`}
              >
                {account.balance < 0 ? "−" : ""}
                {formatCurrency(account.balance, baseCurrency)}
              </p>
            </div>
            <div className="px-4 text-center">
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-600">
                {formatCurrency(totalIncome, baseCurrency)}
              </p>
            </div>
            <div className="px-4 text-center">
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-lg font-semibold tabular-nums text-red-600">
                {formatCurrency(totalExpenses, baseCurrency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions list (pre-filtered to this account) */}
      <TransactionsClient
        transactions={transactions}
        accounts={allAccounts}
        categories={categories}
        currentPage={requestedPage}
        pageSize={PAGE_SIZE}
        totalTransactions={totalTransactions}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
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
    </div>
  );
}
