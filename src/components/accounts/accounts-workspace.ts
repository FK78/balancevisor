import type { WidgetLayoutItem } from "@/lib/widget-registry";

export type AccountsWorkspaceTab = "summary" | "accounts" | "insights";

export const ACCOUNTS_WORKSPACE_TABS: readonly {
  readonly value: AccountsWorkspaceTab;
  readonly label: string;
  readonly description: string;
}[] = [
  { value: "summary", label: "Summary", description: "Top-line balances and shared updates" },
  { value: "accounts", label: "Accounts", description: "Your account list and balances" },
  { value: "insights", label: "Insights", description: "Charts and health checks" },
] as const;

const ACCOUNTS_WIDGET_TAB_MAP: Record<string, AccountsWorkspaceTab> = {
  "pending-invitations": "summary",
  stats: "summary",
  "account-cards": "accounts",
  "health-check": "insights",
  charts: "insights",
};

export function getAccountsWorkspaceTab(widgetId: string): AccountsWorkspaceTab {
  return ACCOUNTS_WIDGET_TAB_MAP[widgetId] ?? "summary";
}

export function groupAccountsLayoutByTab(layout: readonly WidgetLayoutItem[]) {
  const grouped: Record<AccountsWorkspaceTab, WidgetLayoutItem[]> = {
    summary: [],
    accounts: [],
    insights: [],
  };

  for (const item of layout) {
    grouped[getAccountsWorkspaceTab(item.widgetId)].push(item);
  }

  return grouped;
}
