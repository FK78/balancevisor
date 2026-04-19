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
  | "investments"
  | "zakat";

const DASHBOARD_WIDGETS: readonly WidgetDefinition[] = [
  { id: "net-worth-history", label: "Net Worth History", defaultVisible: true, colSpan: 2 },
  { id: "summary-cards", label: "Portfolio Metrics", defaultVisible: true, colSpan: 2 },
  { id: "account-cards", label: "Account Balances", defaultVisible: true, colSpan: 2 },
  { id: "zakat-summary", label: "Zakat Summary", defaultVisible: true, colSpan: 1 },
] as const;

const ACCOUNTS_WIDGETS: readonly WidgetDefinition[] = [
  { id: "stats", label: "Stats Summary", defaultVisible: true, colSpan: 2 },
  { id: "charts", label: "Account Charts", defaultVisible: true, colSpan: 2 },
  { id: "account-cards", label: "Account Cards", defaultVisible: true, colSpan: 2 },
] as const;

const INVESTMENTS_WIDGETS: readonly WidgetDefinition[] = [
  { id: "broker-errors", label: "Broker Errors", defaultVisible: true, colSpan: 2 },
  { id: "summary-cards", label: "Portfolio Metrics", defaultVisible: true, colSpan: 2 },
  { id: "charts", label: "Investment Charts", defaultVisible: true, colSpan: 2 },
  { id: "holdings-table", label: "Holdings Roster", defaultVisible: true, colSpan: 2 },
  { id: "ai-analysis", label: "AI Analysis", defaultVisible: true, colSpan: 2 },
  { id: "other-investments", label: "Other Investments", defaultVisible: true, colSpan: 2 },
] as const;

const ZAKAT_WIDGETS: readonly WidgetDefinition[] = [
  { id: "countdown", label: "Anniversary Countdown", defaultVisible: true, colSpan: 2 },
  { id: "summary-cards", label: "Summary Cards", defaultVisible: true, colSpan: 2 },
  { id: "nisab-status", label: "Nisab Status", defaultVisible: true, colSpan: 2 },
  { id: "breakdown", label: "Assets & Deductions Breakdown", defaultVisible: true, colSpan: 2 },
  { id: "formula", label: "Zakat Formula", defaultVisible: true, colSpan: 2 },
  { id: "history", label: "Calculation History", defaultVisible: true, colSpan: 2 },
] as const;

export const PAGE_WIDGETS: Readonly<Record<DashboardPageId, readonly WidgetDefinition[]>> = {
  dashboard: DASHBOARD_WIDGETS,
  accounts: ACCOUNTS_WIDGETS,
  investments: INVESTMENTS_WIDGETS,
  zakat: ZAKAT_WIDGETS,
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
 */
export function reconcileLayout(
  saved: readonly WidgetLayoutItem[],
  pageId: DashboardPageId,
): readonly WidgetLayoutItem[] {
  const definitions = PAGE_WIDGETS[pageId];
  const definitionIds = new Set(definitions.map((d) => d.id));
  const savedIds = new Set(saved.map((s) => s.widgetId));

  const kept = saved.filter((s) => definitionIds.has(s.widgetId));

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
