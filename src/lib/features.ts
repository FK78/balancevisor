import {
  Wallet,
  TrendingUp,
  Calculator,
  type LucideIcon,
} from "lucide-react";

export type FeatureId = "accounts" | "investments" | "zakat";

export interface FeatureDefinition {
  readonly id: FeatureId;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly route: string;
}

export const FEATURE_DEFINITIONS: readonly FeatureDefinition[] = [
  { id: "accounts", label: "Accounts", description: "Track bank accounts and balances", icon: Wallet, route: "/dashboard/accounts" },
  { id: "investments", label: "Investments", description: "Track stocks, crypto, and holdings", icon: TrendingUp, route: "/dashboard/investments" },
  { id: "zakat", label: "Zakat", description: "Calculate annual zakat obligation", icon: Calculator, route: "/dashboard/zakat" },
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
