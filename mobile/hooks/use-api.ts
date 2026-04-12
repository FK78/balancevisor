import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api-client";

// ─── Query keys ──────────────────────────────────────────────────────────────

export const queryKeys = {
  accounts: ["accounts"] as const,
  categories: ["categories"] as const,
  transactions: (params?: Record<string, string | number | undefined>) =>
    ["transactions", params] as const,
  budgets: ["budgets"] as const,
  debts: ["debts"] as const,
  goals: ["goals"] as const,
  subscriptions: ["subscriptions"] as const,
  holdings: ["investments", "holdings"] as const,
  portfolio: ["investments", "portfolio"] as const,
  retirement: ["retirement"] as const,
  zakat: ["zakat"] as const,
  dashboardSummary: ["dashboard", "summary"] as const,
  dashboardCashflow: ["dashboard", "cashflow"] as const,
  dashboardHealth: ["dashboard", "health"] as const,
  onboarding: ["onboarding"] as const,
  nudges: ["nudges"] as const,
};

// ─── Generic hooks ───────────────────────────────────────────────────────────

export function useApiQuery<T>(
  key: readonly unknown[],
  path: string,
  params?: Record<string, string | number | undefined>,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const res = await api.get<T>(path, params);
      return res.data;
    },
    ...options,
  });
}

export function useApiMutation<TBody, TResult = unknown>(
  method: "post" | "patch" | "put" | "delete",
  path: string,
  invalidateKeys?: readonly (readonly unknown[])[],
) {
  const qc = useQueryClient();

  return useMutation<TResult, Error, TBody>({
    mutationFn: async (body) => {
      const fn = api[method] as <T>(path: string, body?: unknown) => Promise<ApiResponse<T>>;
      const res = await fn<TResult>(path, method === "delete" ? undefined : body);
      return res.data;
    },
    onSuccess: () => {
      if (invalidateKeys) {
        for (const key of invalidateKeys) {
          qc.invalidateQueries({ queryKey: key });
        }
      }
    },
  });
}

// ─── Entity hooks ────────────────────────────────────────────────────────────

export function useAccounts() {
  return useApiQuery(queryKeys.accounts, "/accounts");
}

export function useCategories() {
  return useApiQuery(queryKeys.categories, "/categories");
}

export function useBudgets() {
  return useApiQuery(queryKeys.budgets, "/budgets");
}

export function useDebts() {
  return useApiQuery(queryKeys.debts, "/debts");
}

export function useGoals() {
  return useApiQuery(queryKeys.goals, "/goals");
}

export function useSubscriptions() {
  return useApiQuery(queryKeys.subscriptions, "/subscriptions");
}

export function useHoldings() {
  return useApiQuery(queryKeys.holdings, "/investments/holdings");
}

export function usePortfolio() {
  return useApiQuery(queryKeys.portfolio, "/investments/portfolio");
}

export function useRetirement() {
  return useApiQuery(queryKeys.retirement, "/retirement");
}

export function useZakat() {
  return useApiQuery(queryKeys.zakat, "/zakat");
}

export function useTransactions(page = 1, limit = 20) {
  return useApiQuery(
    queryKeys.transactions({ page, limit }),
    "/transactions",
    { page, limit },
  );
}

export function useDashboardSummary() {
  return useApiQuery(queryKeys.dashboardSummary, "/dashboard/summary");
}

export function useDashboardHealth() {
  return useApiQuery(queryKeys.dashboardHealth, "/dashboard/health");
}

export function useNudges() {
  return useApiQuery(queryKeys.nudges, "/nudges");
}
