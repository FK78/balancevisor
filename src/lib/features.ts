import {
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  BarChart3,
  Tags,
  Target,
  Trophy,
  CreditCard,
  Repeat,
  Repeat2,
  type LucideIcon,
} from "lucide-react";

export type FeatureId =
  | "transactions"
  | "accounts"
  | "investments"
  | "reports"
  | "categories"
  | "budgets"
  | "goals"
  | "debts"
  | "subscriptions"
  | "zakat"
  | "recurring";

export interface FeatureDefinition {
  readonly id: FeatureId;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly route: string;
}

export const FEATURE_DEFINITIONS: readonly FeatureDefinition[] = [
  { id: "transactions", label: "Transactions", description: "Track income and expenses", icon: ArrowLeftRight, route: "/dashboard/transactions" },
  { id: "accounts", label: "Accounts", description: "Manage bank accounts and balances", icon: Wallet, route: "/dashboard/accounts" },
  { id: "investments", label: "Investments", description: "Track stocks, crypto, and holdings", icon: TrendingUp, route: "/dashboard/investments" },
  { id: "reports", label: "Reports", description: "View spending reports and analytics", icon: BarChart3, route: "/dashboard/reports" },
  { id: "categories", label: "Categories", description: "Organise transactions by category", icon: Tags, route: "/dashboard/categories" },
  { id: "budgets", label: "Budgets", description: "Set spending limits per category", icon: Target, route: "/dashboard/budgets" },
  { id: "goals", label: "Goals", description: "Set savings targets and track progress", icon: Trophy, route: "/dashboard/goals" },
  { id: "debts", label: "Debts", description: "Monitor loans and payoff progress", icon: CreditCard, route: "/dashboard/debts" },
  { id: "subscriptions", label: "Subscriptions", description: "Track recurring payments", icon: Repeat, route: "/dashboard/subscriptions" },
  { id: "recurring", label: "Recurring", description: "Auto-generate recurring transactions", icon: Repeat2, route: "/dashboard/recurring" },
] as const;

export const ALL_FEATURE_IDS: readonly FeatureId[] = FEATURE_DEFINITIONS.map((f) => f.id);

export const FEATURE_BY_ID: ReadonlyMap<FeatureId, FeatureDefinition> = new Map(
  FEATURE_DEFINITIONS.map((f) => [f.id, f]),
);

export const ROUTE_TO_FEATURE_ID: ReadonlyMap<string, FeatureId> = new Map(
  FEATURE_DEFINITIONS.map((f) => [f.route, f.id]),
);

export function isFeatureEnabled(featureId: FeatureId, disabledFeatures: readonly string[]): boolean {
  return !disabledFeatures.includes(featureId);
}

export function getEnabledFeatureIds(disabledFeatures: readonly string[]): FeatureId[] {
  return ALL_FEATURE_IDS.filter((id) => !disabledFeatures.includes(id));
}
