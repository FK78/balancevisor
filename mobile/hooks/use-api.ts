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

export function useDashboardCashflow() {
  return useApiQuery(queryKeys.dashboardCashflow, "/dashboard/cashflow");
}

// ─── Mutation hooks ─────────────────────────────────────────────────────────

export function useCreateAccount() {
  return useApiMutation<Partial<{ name: string; type: string; balance: number; currency: string; institution: string; color: string }>>(
    "post", "/accounts", [queryKeys.accounts, queryKeys.dashboardSummary],
  );
}

export function useUpdateAccount(id: string) {
  return useApiMutation<Partial<{ name: string; type: string; balance: number; currency: string; institution: string; color: string }>>(
    "patch", `/accounts/${id}`, [queryKeys.accounts, queryKeys.dashboardSummary],
  );
}

export function useDeleteAccount(id: string) {
  return useApiMutation<void>(
    "delete", `/accounts/${id}`, [queryKeys.accounts, queryKeys.dashboardSummary],
  );
}

export function useCreateTransaction() {
  return useApiMutation<Partial<{ accountId: string; description: string; amount: number; type: string; date: string; categoryId: string }>>(
    "post", "/transactions", [queryKeys.budgets, queryKeys.dashboardSummary],
  );
}

export function useUpdateTransaction(id: string) {
  return useApiMutation<Partial<{ description: string; amount: number; type: string; date: string; categoryId: string }>>(
    "patch", `/transactions/${id}`, [queryKeys.budgets, queryKeys.dashboardSummary],
  );
}

export function useDeleteTransaction(id: string) {
  return useApiMutation<void>(
    "delete", `/transactions/${id}`, [queryKeys.budgets, queryKeys.dashboardSummary],
  );
}

export function useCreateBudget() {
  return useApiMutation<Partial<{ categoryId: string; amount: number; period: string }>>(
    "post", "/budgets", [queryKeys.budgets, queryKeys.dashboardSummary],
  );
}

export function useUpdateBudget(id: string) {
  return useApiMutation<Partial<{ amount: number; period: string }>>(
    "patch", `/budgets/${id}`, [queryKeys.budgets, queryKeys.dashboardSummary],
  );
}

export function useDeleteBudget(id: string) {
  return useApiMutation<void>(
    "delete", `/budgets/${id}`, [queryKeys.budgets, queryKeys.dashboardSummary],
  );
}

export function useCreateDebt() {
  return useApiMutation<Partial<{ name: string; type: string; total_amount: number; remaining_amount: number; interest_rate: number; minimum_payment: number; lender: string }>>(
    "post", "/debts", [queryKeys.debts, queryKeys.dashboardSummary],
  );
}

export function useUpdateDebt(id: string) {
  return useApiMutation<Partial<{ name: string; remaining_amount: number; interest_rate: number; minimum_payment: number }>>(
    "patch", `/debts/${id}`, [queryKeys.debts, queryKeys.dashboardSummary],
  );
}

export function useDeleteDebt(id: string) {
  return useApiMutation<void>(
    "delete", `/debts/${id}`, [queryKeys.debts, queryKeys.dashboardSummary],
  );
}

export function useCreateGoal() {
  return useApiMutation<Partial<{ name: string; target_amount: number; target_date: string; icon: string; color: string }>>(
    "post", "/goals", [queryKeys.goals, queryKeys.dashboardSummary],
  );
}

export function useUpdateGoal(id: string) {
  return useApiMutation<Partial<{ name: string; target_amount: number; target_date: string }>>(
    "patch", `/goals/${id}`, [queryKeys.goals, queryKeys.dashboardSummary],
  );
}

export function useDeleteGoal(id: string) {
  return useApiMutation<void>(
    "delete", `/goals/${id}`, [queryKeys.goals, queryKeys.dashboardSummary],
  );
}

export function useContributeToGoal(id: string) {
  return useApiMutation<{ amount: number }>(
    "post", `/goals/${id}/contribute`, [queryKeys.goals, queryKeys.dashboardSummary],
  );
}
