/**
 * Shared domain types for the BalanceVisor net-worth tracker.
 *
 * These types are derived from the Drizzle ORM schema to ensure consistency
 * across the codebase.
 */

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  accountsTable,
  investmentGroupsTable,
  manualHoldingsTable,
  holdingSalesTable,
  truelayerConnectionsTable,
  brokerConnectionsTable,
  userOnboardingTable,
  netWorthSnapshotsTable,
  zakatSettingsTable,
  zakatCalculationsTable,
  dashboardLayoutsTable,
  otherAssetsTable,
} from "@/db/schema";

// ---------------------------------------------------------------------------
// Database model types
// ---------------------------------------------------------------------------

export type Account = InferSelectModel<typeof accountsTable>;
export type NewAccount = InferInsertModel<typeof accountsTable>;

export type InvestmentGroup = InferSelectModel<typeof investmentGroupsTable>;
export type NewInvestmentGroup = InferInsertModel<typeof investmentGroupsTable>;

export type ManualHolding = InferSelectModel<typeof manualHoldingsTable>;
export type NewManualHolding = InferInsertModel<typeof manualHoldingsTable>;

export type HoldingSale = InferSelectModel<typeof holdingSalesTable>;
export type NewHoldingSale = InferInsertModel<typeof holdingSalesTable>;

export type TrueLayerConnection = InferSelectModel<typeof truelayerConnectionsTable>;
export type NewTrueLayerConnection = InferInsertModel<typeof truelayerConnectionsTable>;

export type BrokerConnection = InferSelectModel<typeof brokerConnectionsTable>;
export type NewBrokerConnection = InferInsertModel<typeof brokerConnectionsTable>;

export type UserOnboarding = InferSelectModel<typeof userOnboardingTable>;
export type NewUserOnboarding = InferInsertModel<typeof userOnboardingTable>;

export type NetWorthSnapshot = InferSelectModel<typeof netWorthSnapshotsTable>;
export type NewNetWorthSnapshot = InferInsertModel<typeof netWorthSnapshotsTable>;

export type ZakatSettings = InferSelectModel<typeof zakatSettingsTable>;
export type NewZakatSettings = InferInsertModel<typeof zakatSettingsTable>;
export type ZakatCalculation = InferSelectModel<typeof zakatCalculationsTable>;
export type NewZakatCalculation = InferInsertModel<typeof zakatCalculationsTable>;

export type DashboardLayoutRow = InferSelectModel<typeof dashboardLayoutsTable>;

export type OtherAsset = InferSelectModel<typeof otherAssetsTable>;
export type NewOtherAsset = InferInsertModel<typeof otherAssetsTable>;

// ---------------------------------------------------------------------------
// UI-specific types
// ---------------------------------------------------------------------------

export type AccountWithDetails = {
  id: string;
  accountName: string;
  name: string; // alias for compatibility
  type: Account["type"];
  balance: number;
  currency: string;
  user_id: string;
  truelayer_id: string | null;
  truelayer_connection_id: string | null;
};

// ---------------------------------------------------------------------------
// Enum types for type safety
// ---------------------------------------------------------------------------

export type AccountType = "currentAccount" | "savings" | "creditCard" | "investment";
export type InvestmentType = "stock" | "crypto" | "etf" | "real_estate" | "private_equity" | "other";

// ---------------------------------------------------------------------------
// Data export
// ---------------------------------------------------------------------------

export const EXPORT_VERSION = 2;

export type ExportData = {
  version: number;
  exported_at: string;
  accounts: Account[];
  investmentGroups: InvestmentGroup[];
  manualHoldings: ManualHolding[];
  holdingSales: HoldingSale[];
  netWorthSnapshots: NetWorthSnapshot[];
  zakatSettings: ZakatSettings[];
  zakatCalculations: ZakatCalculation[];
  otherAssets: OtherAsset[];
  dashboardLayouts: DashboardLayoutRow[];
};
