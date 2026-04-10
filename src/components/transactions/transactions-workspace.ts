export type TransactionsWorkspaceTab = "feed" | "search" | "review";

export const TRANSACTIONS_WORKSPACE_TABS: readonly {
  readonly value: TransactionsWorkspaceTab;
  readonly label: string;
  readonly description: string;
}[] = [
  { value: "feed", label: "Feed", description: "Live transaction activity and trends" },
  { value: "search", label: "Search", description: "Find transactions with search and filters" },
  { value: "review", label: "Review", description: "Triage uncategorised activity" },
] as const;

interface InitialTransactionsWorkspaceState {
  readonly search?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly accountId?: string;
  readonly uncategorisedCount?: number;
}

export function getInitialTransactionsWorkspaceTab(
  state: InitialTransactionsWorkspaceState,
): TransactionsWorkspaceTab {
  const hasSearchContext = Boolean(
    state.search?.trim() || state.startDate || state.endDate || state.accountId,
  );

  return hasSearchContext ? "search" : "feed";
}
