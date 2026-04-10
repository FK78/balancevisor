import { beforeEach, describe, expect, it, vi } from "vitest";

const getDailyIncomeExpenseTrend = vi.fn();
const getDailyExpenseByCategory = vi.fn();
const searchTransactions = vi.fn();
const getTransactionsWithDetailsPaginated = vi.fn();
const getTransactionsCount = vi.fn();
const getTotalsByType = vi.fn();
const getAccountsWithDetails = vi.fn();
const getCategoriesByUser = vi.fn();
const getSplitsForTransactions = vi.fn();
const getUncategorisedCount = vi.fn();
const getCurrentUserId = vi.fn();
const getUserBaseCurrency = vi.fn();
const detectRecurringCandidates = vi.fn();
const getPendingReviewFlags = vi.fn();
const requireFeature = vi.fn();
const getPageLayout = vi.fn();

vi.mock("@/db/queries/transactions", () => ({
  getDailyIncomeExpenseTrend,
  getDailyExpenseByCategory,
  searchTransactions,
  getTransactionsWithDetailsPaginated,
  getTransactionsCount,
  getTotalsByType,
}));

vi.mock("@/db/queries/accounts", () => ({
  getAccountsWithDetails,
}));

vi.mock("@/db/queries/categories", () => ({
  getCategoriesByUser,
}));

vi.mock("@/db/queries/transaction-splits", () => ({
  getSplitsForTransactions,
}));

vi.mock("@/db/queries/insights", () => ({
  getUncategorisedCount,
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUserId,
}));

vi.mock("@/db/queries/onboarding", () => ({
  getUserBaseCurrency,
}));

vi.mock("@/lib/recurring-detection", () => ({
  detectRecurringCandidates,
}));

vi.mock("@/db/queries/review-flags", () => ({
  getPendingReviewFlags,
}));

vi.mock("@/components/FeatureGate", () => ({
  requireFeature,
}));

vi.mock("@/db/queries/dashboard-layouts", () => ({
  getPageLayout,
}));

vi.mock("@/components/PageWidgetWrapper", () => ({
  PageWidgetWrapper: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/DashboardWidget", () => ({
  DashboardWidget: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/TransactionsClient", () => ({
  TransactionsClient: () => null,
}));

vi.mock("@/components/RecurringDetectionBanner", () => ({
  RecurringDetectionBanner: () => null,
}));

vi.mock("@/components/TransactionReviewBanner", () => ({
  TransactionReviewBanner: () => null,
}));

describe("dashboard transactions page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireFeature.mockResolvedValue(undefined);
    getCurrentUserId.mockResolvedValue("user-1");
    getAccountsWithDetails.mockResolvedValue([]);
    getCategoriesByUser.mockResolvedValue([]);
    getUserBaseCurrency.mockResolvedValue("GBP");
    getUncategorisedCount.mockResolvedValue(0);
    getSplitsForTransactions.mockResolvedValue(new Map());
    detectRecurringCandidates.mockResolvedValue([]);
    getPendingReviewFlags.mockResolvedValue([]);
    getPageLayout.mockResolvedValue([]);
    getDailyIncomeExpenseTrend.mockResolvedValue([{ day: "2026-04-01", income: 0, expenses: 0, refunds: 0, net: 0 }]);
    getDailyExpenseByCategory.mockResolvedValue([]);
    searchTransactions.mockResolvedValue({
      transactions: [],
      totalCount: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalRefunds: 0,
    });
    getTransactionsWithDetailsPaginated.mockResolvedValue([]);
    getTransactionsCount.mockResolvedValue(0);
    getTotalsByType.mockResolvedValue(0);
  });

  it("skips chart fetches when a search query is active", async () => {
    const page = (await import("@/app/dashboard/transactions/page")).default;

    await page({
      searchParams: Promise.resolve({ search: "groceries" }),
    });

    expect(searchTransactions).toHaveBeenCalledWith("user-1", "groceries", 1, 10, undefined, undefined, undefined);
    expect(getDailyIncomeExpenseTrend).not.toHaveBeenCalled();
    expect(getDailyExpenseByCategory).not.toHaveBeenCalled();
  });

  it("still loads charts when there is no search query", async () => {
    const page = (await import("@/app/dashboard/transactions/page")).default;

    await page({
      searchParams: Promise.resolve({}),
    });

    expect(getDailyIncomeExpenseTrend).toHaveBeenCalledWith("user-1", 90);
    expect(getDailyExpenseByCategory).toHaveBeenCalledWith("user-1", 90);
  });
});
