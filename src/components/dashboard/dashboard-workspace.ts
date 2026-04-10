import type { WidgetLayoutItem } from "@/lib/widget-registry";

export type DashboardWorkspaceTab = "overview" | "activity" | "planning" | "health";

export const DASHBOARD_WORKSPACE_TABS: readonly {
  readonly value: DashboardWorkspaceTab;
  readonly label: string;
  readonly description: string;
}[] = [
  { value: "overview", label: "Overview", description: "Snapshot of your current position" },
  { value: "activity", label: "Activity", description: "Recent movement and updates" },
  { value: "planning", label: "Planning", description: "Budgets, goals, and upcoming items" },
  { value: "health", label: "Health", description: "Warnings, checks, and maintenance items" },
] as const;

const DASHBOARD_WIDGET_TAB_MAP: Record<string, DashboardWorkspaceTab> = {
  insights: "overview",
  "net-worth-history": "overview",
  cashflow: "overview",
  "category-spend": "overview",
  "monthly-report": "activity",
  "recent-transactions": "activity",
  "weekly-digest": "activity",
  "budget-progress": "planning",
  "upcoming-bills": "planning",
  "cashflow-forecast": "planning",
  retirement: "planning",
  anomalies: "health",
  "zakat-summary": "health",
  milestones: "health",
};

export function getDashboardWorkspaceTab(widgetId: string): DashboardWorkspaceTab {
  return DASHBOARD_WIDGET_TAB_MAP[widgetId] ?? "overview";
}

export function groupDashboardLayoutByTab(layout: readonly WidgetLayoutItem[]) {
  const grouped: Record<DashboardWorkspaceTab, WidgetLayoutItem[]> = {
    overview: [],
    activity: [],
    planning: [],
    health: [],
  };

  for (const item of layout) {
    grouped[getDashboardWorkspaceTab(item.widgetId)].push(item);
  }

  return grouped;
}
