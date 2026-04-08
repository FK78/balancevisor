/**
 * Shared domain types for the BalanceVisor application.
 *
 * These types are derived from the Drizzle ORM schema to ensure consistency
 * across the codebase. Use these types instead of defining local duplicates.
 */

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  accountsTable,
  transactionsTable,
  categoriesTable,
  budgetsTable,
  goalsTable,
  debtsTable,
  debtPaymentsTable,
  subscriptionsTable,
  categorisationRulesTable,
  investmentGroupsTable,
  manualHoldingsTable,
  holdingSalesTable,
  truelayerConnectionsTable,
  trading212ConnectionsTable,
  userOnboardingTable,
  budgetAlertPreferencesTable,
  budgetNotificationsTable,
  transactionSplitsTable,
  netWorthSnapshotsTable,
  sharedAccessTable,
  defaultCategoryTemplatesTable,
} from "@/db/schema";

// ---------------------------------------------------------------------------
// Database model types (auto-generated from Drizzle schema)
// ---------------------------------------------------------------------------

export type Account = InferSelectModel<typeof accountsTable>;
export type NewAccount = InferInsertModel<typeof accountsTable>;

export type Transaction = InferSelectModel<typeof transactionsTable>;
export type NewTransaction = InferInsertModel<typeof transactionsTable>;

export type Category = InferSelectModel<typeof categoriesTable>;
export type NewCategory = InferInsertModel<typeof categoriesTable>;

export type Budget = InferSelectModel<typeof budgetsTable>;
export type NewBudget = InferInsertModel<typeof budgetsTable>;

export type Goal = InferSelectModel<typeof goalsTable>;
export type NewGoal = InferInsertModel<typeof goalsTable>;

export type Debt = InferSelectModel<typeof debtsTable>;
export type NewDebt = InferInsertModel<typeof debtsTable>;

export type DebtPayment = InferSelectModel<typeof debtPaymentsTable>;
export type NewDebtPayment = InferInsertModel<typeof debtPaymentsTable>;

export type Subscription = InferSelectModel<typeof subscriptionsTable>;
export type NewSubscription = InferInsertModel<typeof subscriptionsTable>;

export type CategorisationRule = InferSelectModel<typeof categorisationRulesTable>;
export type NewCategorisationRule = InferInsertModel<typeof categorisationRulesTable>;

export type InvestmentGroup = InferSelectModel<typeof investmentGroupsTable>;
export type NewInvestmentGroup = InferInsertModel<typeof investmentGroupsTable>;

export type ManualHolding = InferSelectModel<typeof manualHoldingsTable>;
export type NewManualHolding = InferInsertModel<typeof manualHoldingsTable>;

export type HoldingSale = InferSelectModel<typeof holdingSalesTable>;
export type NewHoldingSale = InferInsertModel<typeof holdingSalesTable>;

export type TrueLayerConnection = InferSelectModel<typeof truelayerConnectionsTable>;
export type NewTrueLayerConnection = InferInsertModel<typeof truelayerConnectionsTable>;

export type Trading212Connection = InferSelectModel<typeof trading212ConnectionsTable>;
export type NewTrading212Connection = InferInsertModel<typeof trading212ConnectionsTable>;

export type UserOnboarding = InferSelectModel<typeof userOnboardingTable>;
export type NewUserOnboarding = InferInsertModel<typeof userOnboardingTable>;

export type BudgetAlertPreference = InferSelectModel<typeof budgetAlertPreferencesTable>;
export type NewBudgetAlertPreference = InferInsertModel<typeof budgetAlertPreferencesTable>;

export type BudgetNotification = InferSelectModel<typeof budgetNotificationsTable>;
export type NewBudgetNotification = InferInsertModel<typeof budgetNotificationsTable>;

export type TransactionSplit = InferSelectModel<typeof transactionSplitsTable>;
export type NewTransactionSplit = InferInsertModel<typeof transactionSplitsTable>;

export type NetWorthSnapshot = InferSelectModel<typeof netWorthSnapshotsTable>;
export type NewNetWorthSnapshot = InferInsertModel<typeof netWorthSnapshotsTable>;

export type SharedAccess = InferSelectModel<typeof sharedAccessTable>;
export type NewSharedAccess = InferInsertModel<typeof sharedAccessTable>;

export type DefaultCategoryTemplate = InferSelectModel<typeof defaultCategoryTemplatesTable>;
export type NewDefaultCategoryTemplate = InferInsertModel<typeof defaultCategoryTemplatesTable>;

// ---------------------------------------------------------------------------
// UI-specific types (with decrypted fields and computed values)
// ---------------------------------------------------------------------------

export type TransactionWithDetails = {
  id: string;
  accountName: string;
  account_id: string | null;
  type: Transaction["type"];
  amount: number;
  category: string | null;
  category_id: string | null;
  description: string;
  date: string | null;
  is_recurring: boolean;
  transfer_account_id: string | null;
  is_split: boolean;
};

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
  transactions: number;
  isShared: boolean;
  sharedBy: string | null;
};

export type BudgetWithProgress = {
  id: string;
  budgetCategory: string;
  budgetAmount: number;
  budgetSpent: number;
  budgetPeriod: string | null;
};

export type GoalWithProgress = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  icon: string | null;
  color: string;
  created_at: Date;
};

export type DebtWithProgress = {
  id: string;
  name: string;
  original_amount: number;
  remaining_amount: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: string | null;
  lender: string | null;
  color: string;
  is_paid_off: boolean;
  created_at: Date;
};

export type SubscriptionWithDetails = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: "weekly" | "monthly" | "quarterly" | "yearly";
  next_billing_date: string;
  category_id: string | null;
  account_id: string;
  url: string | null;
  notes: string | null;
  is_active: boolean;
  color: string;
  icon: string | null;
  created_at: Date;
};

export type CategoryWithColor = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  user_id: string;
};

export type SplitDetail = {
  id: string;
  category_id: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  amount: number;
  description: string | null;
};

// ---------------------------------------------------------------------------
// Enum types for type safety
// ---------------------------------------------------------------------------

export type AccountType = "currentAccount" | "savings" | "creditCard" | "investment";
export type TransactionType = "income" | "expense" | "transfer" | "sale";
export type Period = "monthly" | "weekly";
export type RecurringPattern = "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
export type InvestmentType = "stock" | "real_estate" | "private_equity" | "other";
export type BillingCycle = "weekly" | "monthly" | "quarterly" | "yearly";
export type SharedPermission = "view" | "edit";
export type SharedStatus = "pending" | "accepted" | "declined";
export type SharedResourceType = "account" | "budget";

// ---------------------------------------------------------------------------
// Data export / import
// ---------------------------------------------------------------------------

export const EXPORT_VERSION = 1;

export type ExportData = {
  version: number;
  exported_at: string;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  transactionSplits: TransactionSplit[];
  budgets: Budget[];
  budgetAlertPreferences: BudgetAlertPreference[];
  goals: Goal[];
  debts: Debt[];
  debtPayments: DebtPayment[];
  investmentGroups: InvestmentGroup[];
  manualHoldings: ManualHolding[];
  holdingSales: HoldingSale[];
  subscriptions: Subscription[];
  netWorthSnapshots: NetWorthSnapshot[];
  categorisationRules: CategorisationRule[];
};
