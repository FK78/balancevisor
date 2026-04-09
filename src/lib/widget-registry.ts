export interface WidgetDefinition {
  readonly id: string;
  readonly label: string;
  readonly defaultVisible: boolean;
  readonly colSpan?: 1 | 2;
}

export interface WidgetLayoutItem {
  readonly widgetId: string;
  readonly visible: boolean;
  readonly colSpan?: 1 | 2;
}

export type DashboardPageId =
  | "dashboard"
  | "accounts"
  | "budgets"
  | "categories"
  | "debts"
  | "goals"
  | "investments"
  | "recurring"
  | "reports"
  | "retirement"
  | "subscriptions"
  | "zakat"
  | "transactions";

const DASHBOARD_WIDGETS: readonly WidgetDefinition[] = [
  { id: "insights", label: "Insights", defaultVisible: true, colSpan: 2 },
  { id: "monthly-report", label: "AI Monthly Report", defaultVisible: true, colSpan: 2 },
  { id: "net-worth", label: "Net Worth", defaultVisible: true, colSpan: 2 },
  { id: "net-worth-history", label: "Net Worth History", defaultVisible: true, colSpan: 2 },
  { id: "cashflow", label: "Cashflow Charts", defaultVisible: true, colSpan: 2 },
  { id: "cashflow-forecast", label: "Cash Flow Forecast", defaultVisible: true, colSpan: 2 },
  { id: "anomalies", label: "Spending Anomalies", defaultVisible: true, colSpan: 2 },
  { id: "weekly-digest", label: "Weekly Digest", defaultVisible: true, colSpan: 2 },
  { id: "upcoming-bills", label: "Upcoming Bills", defaultVisible: true, colSpan: 2 },
  { id: "budget-progress", label: "Budget Progress", defaultVisible: true, colSpan: 1 },
  { id: "category-spend", label: "Spending by Category", defaultVisible: true, colSpan: 1 },
  { id: "recent-transactions", label: "Recent Transactions", defaultVisible: true, colSpan: 2 },
  { id: "zakat-summary", label: "Zakat Summary", defaultVisible: true, colSpan: 1 },
  { id: "retirement", label: "Retirement Planner", defaultVisible: true, colSpan: 1 },
] as const;

const ACCOUNTS_WIDGETS: readonly WidgetDefinition[] = [
  { id: "pending-invitations", label: "Pending Invitations", defaultVisible: true, colSpan: 2 },
  { id: "stats", label: "Stats Summary", defaultVisible: true, colSpan: 2 },
  { id: "charts", label: "Account Charts", defaultVisible: true, colSpan: 2 },
  { id: "account-cards", label: "Account Cards", defaultVisible: true, colSpan: 2 },
  { id: "health-check", label: "AI Health Check", defaultVisible: true, colSpan: 2 },
] as const;

const BUDGETS_WIDGETS: readonly WidgetDefinition[] = [
  { id: "pending-invitations", label: "Pending Invitations", defaultVisible: true, colSpan: 2 },
  { id: "stats", label: "Stats Summary", defaultVisible: true, colSpan: 2 },
  { id: "suggestions", label: "Smart Suggestions", defaultVisible: true, colSpan: 2 },
  { id: "charts", label: "Budget Charts", defaultVisible: true, colSpan: 2 },
  { id: "budget-cards", label: "Budget Cards", defaultVisible: true, colSpan: 2 },
] as const;

const CATEGORIES_WIDGETS: readonly WidgetDefinition[] = [
  { id: "charts", label: "Category Charts", defaultVisible: true, colSpan: 2 },
  { id: "all-categories", label: "All Categories", defaultVisible: true, colSpan: 2 },
  { id: "auto-rules", label: "Auto-Categorisation Rules", defaultVisible: true, colSpan: 2 },
] as const;

const DEBTS_WIDGETS: readonly WidgetDefinition[] = [
  { id: "overview", label: "Overview Banner", defaultVisible: true, colSpan: 2 },
  { id: "debt-cards", label: "Debt Cards", defaultVisible: true, colSpan: 2 },
  { id: "payoff-strategies", label: "Payoff Strategies", defaultVisible: true, colSpan: 2 },
  { id: "ai-advisor", label: "AI Debt Advisor", defaultVisible: true, colSpan: 2 },
] as const;

const GOALS_WIDGETS: readonly WidgetDefinition[] = [
  { id: "overview", label: "Overall Progress", defaultVisible: true, colSpan: 2 },
  { id: "forecasts", label: "Goal Forecasts", defaultVisible: true, colSpan: 2 },
  { id: "goals-grid", label: "Goals Grid", defaultVisible: true, colSpan: 2 },
] as const;

const INVESTMENTS_WIDGETS: readonly WidgetDefinition[] = [
  { id: "broker-errors", label: "Broker Errors", defaultVisible: true, colSpan: 2 },
  { id: "summary-cards", label: "Summary Cards", defaultVisible: true, colSpan: 2 },
  { id: "charts", label: "Investment Charts", defaultVisible: true, colSpan: 2 },
  { id: "ai-analysis", label: "AI Portfolio Analysis", defaultVisible: true, colSpan: 2 },
  { id: "holdings-table", label: "Holdings Table", defaultVisible: true, colSpan: 2 },
] as const;

const RECURRING_WIDGETS: readonly WidgetDefinition[] = [
  { id: "stats", label: "Stats Summary", defaultVisible: true, colSpan: 2 },
  { id: "recurring-list", label: "Recurring List", defaultVisible: true, colSpan: 2 },
] as const;

const REPORTS_WIDGETS: readonly WidgetDefinition[] = [
  { id: "ai-monthly-report", label: "AI Monthly Report", defaultVisible: true, colSpan: 2 },
  { id: "savings-rate", label: "Savings Rate", defaultVisible: true, colSpan: 2 },
  { id: "kpi-stats", label: "KPI Stats", defaultVisible: true, colSpan: 2 },
  { id: "income-vs-expenses", label: "Income vs Expenses", defaultVisible: true, colSpan: 2 },
  { id: "net-savings-trend", label: "Net Savings Trend", defaultVisible: true, colSpan: 1 },
  { id: "spending-by-category", label: "Spending by Category", defaultVisible: true, colSpan: 1 },
  { id: "monthly-category-breakdown", label: "Monthly Category Breakdown", defaultVisible: true, colSpan: 2 },
  { id: "top-categories", label: "Top Spending Categories", defaultVisible: true, colSpan: 2 },
] as const;

const SUBSCRIPTIONS_WIDGETS: readonly WidgetDefinition[] = [
  { id: "stats", label: "Stats Summary", defaultVisible: true, colSpan: 2 },
  { id: "subscription-cards", label: "Subscription Cards", defaultVisible: true, colSpan: 2 },
  { id: "ai-advisor", label: "AI Savings Advisor", defaultVisible: true, colSpan: 2 },
] as const;

const ZAKAT_WIDGETS: readonly WidgetDefinition[] = [
  { id: "countdown", label: "Anniversary Countdown", defaultVisible: true, colSpan: 2 },
  { id: "summary-cards", label: "Summary Cards", defaultVisible: true, colSpan: 2 },
  { id: "nisab-status", label: "Nisab Status", defaultVisible: true, colSpan: 2 },
  { id: "breakdown", label: "Assets & Deductions Breakdown", defaultVisible: true, colSpan: 2 },
  { id: "formula", label: "Zakat Formula", defaultVisible: true, colSpan: 2 },
  { id: "history", label: "Calculation History", defaultVisible: true, colSpan: 2 },
] as const;

const RETIREMENT_WIDGETS: readonly WidgetDefinition[] = [
  { id: "countdown", label: "Retirement Countdown", defaultVisible: true, colSpan: 2 },
  { id: "progress", label: "Fund Progress", defaultVisible: true, colSpan: 2 },
  { id: "snapshot", label: "Financial Snapshot", defaultVisible: true, colSpan: 2 },
  { id: "projection-chart", label: "Projection Chart", defaultVisible: true, colSpan: 2 },
  { id: "scenarios", label: "What-If Scenarios", defaultVisible: true, colSpan: 2 },
  { id: "ai-advisor", label: "AI Retirement Advisor", defaultVisible: true, colSpan: 2 },
] as const;

const TRANSACTIONS_WIDGETS: readonly WidgetDefinition[] = [
  { id: "review-banners", label: "Review Banners", defaultVisible: true, colSpan: 2 },
  { id: "transactions-client", label: "Transactions Table", defaultVisible: true, colSpan: 2 },
] as const;

export const PAGE_WIDGETS: Readonly<Record<DashboardPageId, readonly WidgetDefinition[]>> = {
  dashboard: DASHBOARD_WIDGETS,
  accounts: ACCOUNTS_WIDGETS,
  budgets: BUDGETS_WIDGETS,
  categories: CATEGORIES_WIDGETS,
  debts: DEBTS_WIDGETS,
  goals: GOALS_WIDGETS,
  investments: INVESTMENTS_WIDGETS,
  recurring: RECURRING_WIDGETS,
  reports: REPORTS_WIDGETS,
  retirement: RETIREMENT_WIDGETS,
  zakat: ZAKAT_WIDGETS,
  subscriptions: SUBSCRIPTIONS_WIDGETS,
  transactions: TRANSACTIONS_WIDGETS,
} as const;

/**
 * Build the default layout for a page from its widget definitions.
 */
export function getDefaultLayout(pageId: DashboardPageId): readonly WidgetLayoutItem[] {
  return PAGE_WIDGETS[pageId].map((w) => ({
    widgetId: w.id,
    visible: w.defaultVisible,
    colSpan: w.colSpan,
  }));
}

/**
 * Reconcile a saved layout with the current widget registry.
 * - Preserves user order/visibility for known widgets
 * - Appends newly added widgets at the end (visible by default)
 * - Strips widgets that no longer exist in the registry
 */
export function reconcileLayout(
  saved: readonly WidgetLayoutItem[],
  pageId: DashboardPageId,
): readonly WidgetLayoutItem[] {
  const definitions = PAGE_WIDGETS[pageId];
  const definitionIds = new Set(definitions.map((d) => d.id));
  const savedIds = new Set(saved.map((s) => s.widgetId));

  // Keep saved items that still exist in the registry
  const kept = saved.filter((s) => definitionIds.has(s.widgetId));

  // Append new widgets not in saved layout
  const added: WidgetLayoutItem[] = definitions
    .filter((d) => !savedIds.has(d.id))
    .map((d) => ({ widgetId: d.id, visible: d.defaultVisible, colSpan: d.colSpan }));

  return [...kept, ...added];
}

/**
 * Resolve the pathname to a DashboardPageId.
 */
export function pathToPageId(pathname: string): DashboardPageId | null {
  if (pathname === "/dashboard") return "dashboard";
  const match = pathname.match(/^\/dashboard\/([a-z]+)/);
  if (!match) return null;
  const segment = match[1] as DashboardPageId;
  return segment in PAGE_WIDGETS ? segment : null;
}
