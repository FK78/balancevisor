import { boolean, date, integer, jsonb, numeric, pgEnum, pgTable, timestamp, varchar, uuid, text, uniqueIndex, index } from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", ["currentAccount", "savings", "creditCard", "investment"]);
export const periodEnum = pgEnum("period", ["monthly", "weekly"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense", "transfer", "sale", "refund"]);
export const recurringPatternEnum = pgEnum("recurring_pattern", ["daily", "weekly", "biweekly", "monthly", "yearly"]);
export const investmentTypeEnum = pgEnum("investment_type", ["stock", "crypto", "etf", "real_estate", "private_equity", "other"]);

export const defaultCategoryTemplatesTable = pgTable("default_category_templates", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  color: varchar({ length: 8 }).notNull(),
  icon: varchar({ length: 255 }),
  sort_order: integer().notNull().default(0),
  is_active: boolean().notNull().default(true),
});

export const userOnboardingTable = pgTable("user_onboarding", {
  user_id: uuid("user_id").primaryKey(),
  base_currency: varchar({ length: 3 }).notNull().default("GBP"),
  use_default_categories: boolean().notNull().default(false),
  completed: boolean().notNull().default(false),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  pending_features: jsonb("pending_features"),
});

export const truelayerConnectionsTable = pgTable("truelayer_connections", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().unique(),
  access_token: text("access_token").notNull(),
  refresh_token: text("refresh_token").notNull(),
  token_expires_at: timestamp("token_expires_at", { withTimezone: true }).notNull(),
  provider_name: varchar("provider_name", { length: 255 }),
  connected_at: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  last_synced_at: timestamp("last_synced_at", { withTimezone: true }),
});

export const accountsTable = pgTable("accounts", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  name: text().notNull(),
  type: accountTypeEnum().notNull(),
  balance: numeric({ mode: "number" }).notNull(),
  currency: varchar({ length: 3 }).notNull(),
  truelayer_id: varchar("truelayer_id", { length: 255 }),
  truelayer_connection_id: uuid("truelayer_connection_id").references(() => truelayerConnectionsTable.id),
}, (table) => [{
  userIdx: index("accounts_user_id_idx").on(table.user_id),
}]);

export const categoriesTable = pgTable("categories", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  name: varchar({ length: 255 }).notNull(),
  color: varchar({ length: 8 }).notNull(),
  icon: varchar({ length: 255 }),
}, (table) => [{
  userIdx: index("categories_user_id_idx").on(table.user_id),
}]);

export const transactionsTable = pgTable("transactions", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  account_id: uuid("account_id").references(() => accountsTable.id, { onDelete: "cascade" }),
  category_id: uuid("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  type: transactionTypeEnum().notNull(),
  amount: numeric({ mode: "number" }).notNull(),
  description: text().notNull(),
  date: date().notNull(),
  is_recurring: boolean().notNull(),
  recurring_pattern: recurringPatternEnum("recurring_pattern"),
  next_recurring_date: date("next_recurring_date"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  transfer_account_id: uuid("transfer_account_id").references(() => accountsTable.id, { onDelete: "set null" }),
  truelayer_id: varchar("truelayer_id", { length: 255 }),
  is_split: boolean("is_split").notNull().default(false),
  subscription_id: uuid("subscription_id").references(() => subscriptionsTable.id, { onDelete: "set null" }),
  linked_debt_id: uuid("linked_debt_id").references(() => debtsTable.id, { onDelete: "set null" }),
  refund_for_transaction_id: uuid("refund_for_transaction_id"),
}, (table) => [{
  userIdx: index("transactions_user_id_idx").on(table.user_id),
  accountIdx: index("transactions_account_id_idx").on(table.account_id),
  categoryIdx: index("transactions_category_id_idx").on(table.category_id),
  dateIdx: index("transactions_date_idx").on(table.date),
  accountDateIdx: index("transactions_account_id_date_idx").on(table.account_id, table.date),
}]);

export const budgetsTable = pgTable("budgets", {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull(),
    category_id: uuid("category_id").references(() => categoriesTable.id, { onDelete: "cascade" }),
    amount: numeric({ mode: "number" }).notNull(),
    period: periodEnum().notNull().default("monthly"),
    start_date: date().notNull()
}, (table) => [{
    userIdx: index("budgets_user_id_idx").on(table.user_id),
    categoryIdx: index("budgets_category_id_idx").on(table.category_id),
    userCategoryUniq: uniqueIndex("budgets_user_category_idx").on(table.user_id, table.category_id),
}])

export const categorisationRulesTable = pgTable("categorisation_rules", {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull(),
    pattern: varchar({ length: 255 }).notNull(),
    category_id: uuid("category_id").references(() => categoriesTable.id, { onDelete: "cascade" }),
    priority: integer().notNull(),
}, (table) => [{
    userIdx: index("categorisation_rules_user_id_idx").on(table.user_id),
    userPatternUniq: uniqueIndex("categorisation_rules_user_pattern_idx").on(table.user_id, table.pattern),
}])

export const goalsTable = pgTable("goals", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  name: varchar({ length: 255 }).notNull(),
  target_amount: numeric("target_amount", { mode: "number" }).notNull(),
  saved_amount: numeric("saved_amount", { mode: "number" }).notNull().default(0),
  target_date: date("target_date"),
  icon: varchar({ length: 255 }),
  color: varchar({ length: 8 }).notNull().default("#6366f1"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  userIdx: index("goals_user_id_idx").on(table.user_id),
}]);

export const debtsTable = pgTable("debts", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  name: varchar({ length: 255 }).notNull(),
  original_amount: numeric("original_amount", { mode: "number" }).notNull(),
  remaining_amount: numeric("remaining_amount", { mode: "number" }).notNull(),
  interest_rate: numeric("interest_rate", { mode: "number" }).notNull().default(0),
  minimum_payment: numeric("minimum_payment", { mode: "number" }).notNull().default(0),
  due_date: date("due_date"),
  lender: varchar({ length: 255 }),
  color: varchar({ length: 8 }).notNull().default("#ef4444"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  userIdx: index("debts_user_id_idx").on(table.user_id),
}]);

export const debtPaymentsTable = pgTable("debt_payments", {
  id: uuid().primaryKey().defaultRandom(),
  debt_id: uuid("debt_id").notNull().references(() => debtsTable.id, { onDelete: "cascade" }),
  account_id: uuid("account_id").notNull().references(() => accountsTable.id, { onDelete: "cascade" }),
  amount: numeric({ mode: "number" }).notNull(),
  date: date().notNull(),
  note: text(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  debtIdx: index("debt_payments_debt_id_idx").on(table.debt_id),
  accountIdx: index("debt_payments_account_id_idx").on(table.account_id),
}]);

export const budgetAlertPreferencesTable = pgTable("budget_alert_preferences", {
    id: uuid().primaryKey().defaultRandom(),
    budget_id: uuid("budget_id").notNull().references(() => budgetsTable.id, { onDelete: "cascade" }),
    user_id: uuid("user_id").notNull(),
    threshold: numeric({ mode: "number" }).notNull().default(80),
    browser_alerts: boolean("browser_alerts").notNull().default(true),
    email_alerts: boolean("email_alerts").notNull().default(false),
}, (table) => [{
    userBudgetIdx: index("budget_alert_prefs_user_budget_idx").on(table.user_id, table.budget_id),
}])

export const brokerConnectionsTable = pgTable("broker_connections", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  broker: varchar("broker", { length: 20 }).notNull(),
  credentials_encrypted: text("credentials_encrypted").notNull(),
  environment: varchar({ length: 10 }).notNull().default("live"),
  account_id: uuid("account_id").references(() => accountsTable.id, { onDelete: "set null" }),
  connected_at: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  last_synced_at: timestamp("last_synced_at", { withTimezone: true }),
}, (table) => [{
  uniqueBroker: uniqueIndex("broker_connections_user_broker_idx").on(table.user_id, table.broker),
}]);

export const investmentGroupsTable = pgTable("investment_groups", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  account_id: uuid("account_id").references(() => accountsTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  color: varchar({ length: 8 }).notNull().default("#6366f1"),
  icon: varchar({ length: 255 }),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  userIdx: index("investment_groups_user_id_idx").on(table.user_id),
}]);

export const manualHoldingsTable = pgTable("manual_holdings", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  ticker: varchar({ length: 20 }),
  name: varchar({ length: 255 }).notNull(),
  quantity: numeric({ mode: "number" }).notNull(),
  average_price: numeric("average_price", { mode: "number" }).notNull(),
  current_price: numeric("current_price", { mode: "number" }),
  currency: varchar({ length: 3 }).notNull().default("GBP"),
  investment_type: investmentTypeEnum().default("stock"),
  estimated_return_percent: numeric("estimated_return_percent", { mode: "number" }),
  notes: text("notes"),
  account_id: uuid("account_id").references(() => accountsTable.id, { onDelete: "set null" }),
  group_id: uuid("group_id").references(() => investmentGroupsTable.id, { onDelete: "set null" }),
  last_price_update: timestamp("last_price_update", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  userIdx: index("manual_holdings_user_id_idx").on(table.user_id),
  accountIdx: index("manual_holdings_account_id_idx").on(table.account_id),
}]);

export const holdingSalesTable = pgTable("holding_sales", {
  id: uuid().primaryKey().defaultRandom(),
  holding_id: uuid("holding_id").notNull().references(() => manualHoldingsTable.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull(),
  date: date().notNull(),
  quantity: numeric({ mode: "number" }).notNull(),
  price_per_unit: numeric("price_per_unit", { mode: "number" }).notNull(),
  realized_gain: numeric("realized_gain", { mode: "number" }).notNull(),
  cash_account_id: uuid("cash_account_id").references(() => accountsTable.id, { onDelete: "set null" }),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  userIdx: index("holding_sales_user_id_idx").on(table.user_id),
  holdingIdx: index("holding_sales_holding_id_idx").on(table.holding_id),
}]);

export const billingCycleEnum = pgEnum("billing_cycle", ["weekly", "monthly", "quarterly", "yearly"]);

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  name: varchar({ length: 255 }).notNull(),
  amount: numeric({ mode: "number" }).notNull(),
  currency: varchar({ length: 3 }).notNull().default("GBP"),
  billing_cycle: billingCycleEnum("billing_cycle").notNull().default("monthly"),
  next_billing_date: date("next_billing_date").notNull(),
  category_id: uuid("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  account_id: uuid("account_id").notNull().references(() => accountsTable.id, { onDelete: "cascade" }),
  url: text(),
  notes: text(),
  is_active: boolean("is_active").notNull().default(true),
  color: varchar({ length: 8 }).notNull().default("#6366f1"),
  icon: varchar({ length: 255 }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  userIdx: index("subscriptions_user_id_idx").on(table.user_id),
  accountIdx: index("subscriptions_account_id_idx").on(table.account_id),
  categoryIdx: index("subscriptions_category_id_idx").on(table.category_id),
}]);

export const transactionSplitsTable = pgTable("transaction_splits", {
  id: uuid().primaryKey().defaultRandom(),
  transaction_id: uuid("transaction_id").notNull().references(() => transactionsTable.id, { onDelete: "cascade" }),
  category_id: uuid("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  amount: numeric({ mode: "number" }).notNull(),
  description: text(),
}, (table) => [{
  transactionIdx: index("transaction_splits_transaction_id_idx").on(table.transaction_id),
}]);

export const netWorthSnapshotsTable = pgTable("net_worth_snapshots", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  date: date().notNull(),
  net_worth: numeric("net_worth", { mode: "number" }).notNull(),
  total_assets: numeric("total_assets", { mode: "number" }).notNull().default(0),
  total_liabilities: numeric("total_liabilities", { mode: "number" }).notNull().default(0),
  investment_value: numeric("investment_value", { mode: "number" }).notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  userDateIdx: uniqueIndex("net_worth_snapshots_user_id_date_idx").on(table.user_id, table.date),
}]);

export const sharedResourceTypeEnum = pgEnum("shared_resource_type", ["account", "budget"]);
export const sharedPermissionEnum = pgEnum("shared_permission", ["view", "edit"]);
export const sharedStatusEnum = pgEnum("shared_status", ["pending", "accepted", "declined"]);

export const sharedAccessTable = pgTable("shared_access", {
  id: uuid().primaryKey().defaultRandom(),
  owner_id: uuid("owner_id").notNull(),
  shared_with_id: uuid("shared_with_id"),
  shared_with_email: varchar("shared_with_email", { length: 255 }).notNull(),
  resource_type: sharedResourceTypeEnum("resource_type").notNull(),
  resource_id: uuid("resource_id").notNull(),
  permission: sharedPermissionEnum("permission").notNull().default("edit"),
  status: sharedStatusEnum("status").notNull().default("pending"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  accepted_at: timestamp("accepted_at", { withTimezone: true }),
}, (table) => [{
  uniqueShare: uniqueIndex("unique_share").on(table.shared_with_email, table.resource_type, table.resource_id),
}]);

export const alertTypeEnum = pgEnum("alert_type", ["threshold_warning", "over_budget"]);

export const budgetNotificationsTable = pgTable("budget_notifications", {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull(),
    budget_id: uuid("budget_id").notNull().references(() => budgetsTable.id, { onDelete: "cascade" }),
    alert_type: alertTypeEnum("alert_type").notNull(),
    message: text().notNull(),
    is_read: boolean("is_read").notNull().default(false),
    emailed: boolean().notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
    userBudgetIdx: index("budget_notifications_user_budget_idx").on(table.user_id, table.budget_id),
}])

// User encryption keys table (envelope encryption)
export const userKeysTable = pgTable("user_keys", {
  user_id: uuid("user_id").primaryKey(),
  encrypted_key: text("encrypted_key").notNull(),
  key_version: integer("key_version").notNull().default(1),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

// MFA backup codes table
export const mfaBackupCodesTable = pgTable("mfa_backup_codes", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  code_hash: text("code_hash").notNull(),
  used: boolean().notNull().default(false),
  used_at: timestamp("used_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  userIdx: index("mfa_backup_codes_user_id_idx").on(table.user_id),
}])

export const zakatSettingsTable = pgTable("zakat_settings", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().unique(),
  anniversary_date: date("anniversary_date").notNull(),
  use_lunar_calendar: boolean("use_lunar_calendar").notNull().default(false),
  nisab_type: varchar("nisab_type", { length: 10 }).notNull().default("gold"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const zakatCalculationsTable = pgTable("zakat_calculations", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  calculated_at: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
  is_auto: boolean("is_auto").notNull().default(false),
  nisab_value: numeric("nisab_value", { mode: "number" }).notNull(),
  total_assets: numeric("total_assets", { mode: "number" }).notNull(),
  cash_and_savings: numeric("cash_and_savings", { mode: "number" }).notNull().default(0),
  investment_value: numeric("investment_value", { mode: "number" }).notNull().default(0),
  total_liabilities: numeric("total_liabilities", { mode: "number" }).notNull().default(0),
  debt_deductions: numeric("debt_deductions", { mode: "number" }).notNull().default(0),
  zakatable_amount: numeric("zakatable_amount", { mode: "number" }).notNull(),
  zakat_due: numeric("zakat_due", { mode: "number" }).notNull(),
  above_nisab: boolean("above_nisab").notNull(),
  breakdown_json: jsonb("breakdown_json"),
}, (table) => [{
  userIdx: index("zakat_calculations_user_id_idx").on(table.user_id),
}]);

export const userPreferencesTable = pgTable("user_preferences", {
  user_id: uuid("user_id").primaryKey(),
  ai_enabled: boolean("ai_enabled").notNull().default(true),
  disabled_features: text("disabled_features"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviewFlagTypeEnum = pgEnum("review_flag_type", [
  "subscription_amount_mismatch",
  "possible_debt_payment",
  "possible_subscription",
]);

export const transactionReviewFlagsTable = pgTable("transaction_review_flags", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  transaction_id: uuid("transaction_id").notNull().references(() => transactionsTable.id, { onDelete: "cascade" }),
  flag_type: reviewFlagTypeEnum("flag_type").notNull(),
  suggested_subscription_id: uuid("suggested_subscription_id").references(() => subscriptionsTable.id, { onDelete: "cascade" }),
  suggested_debt_id: uuid("suggested_debt_id").references(() => debtsTable.id, { onDelete: "cascade" }),
  expected_amount: numeric("expected_amount", { mode: "number" }),
  actual_amount: numeric("actual_amount", { mode: "number" }).notNull(),
  is_resolved: boolean("is_resolved").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  userIdx: index("review_flags_user_id_idx").on(table.user_id),
  transactionIdx: index("review_flags_transaction_id_idx").on(table.transaction_id),
  unresolvedIdx: index("review_flags_unresolved_idx").on(table.user_id, table.is_resolved),
}]);

export const retirementProfilesTable = pgTable("retirement_profiles", {
  user_id: uuid("user_id").primaryKey(),
  current_age: integer("current_age").notNull(),
  target_retirement_age: integer("target_retirement_age").notNull().default(65),
  desired_annual_spending: numeric("desired_annual_spending", { mode: "number" }).notNull(),
  expected_pension_annual: numeric("expected_pension_annual", { mode: "number" }).notNull().default(0),
  expected_investment_return: numeric("expected_investment_return", { mode: "number" }).notNull().default(5.0),
  inflation_rate: numeric("inflation_rate", { mode: "number" }).notNull().default(2.5),
  life_expectancy: integer("life_expectancy").notNull().default(90),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dashboardLayoutsTable = pgTable("dashboard_layouts", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  page: varchar({ length: 50 }).notNull(),
  layout_json: text("layout_json").notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  uniqueUserPage: uniqueIndex("dashboard_layouts_user_page_idx").on(table.user_id, table.page),
}]);
