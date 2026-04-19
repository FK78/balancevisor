import { boolean, date, integer, numeric, pgEnum, pgTable, timestamp, varchar, uuid, text, uniqueIndex, index } from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", ["currentAccount", "savings", "creditCard", "investment"]);
export const investmentTypeEnum = pgEnum("investment_type", ["stock", "crypto", "etf", "real_estate", "private_equity", "other"]);

export const userOnboardingTable = pgTable("user_onboarding", {
  user_id: uuid("user_id").primaryKey(),
  base_currency: varchar({ length: 3 }).notNull().default("GBP"),
  use_default_categories: boolean().notNull().default(false),
  completed: boolean().notNull().default(false),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  pending_features: text("pending_features"),
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
  type: accountTypeEnum(),
  balance: numeric({ mode: "number" }).notNull(),
  currency: varchar({ length: 3 }).notNull(),
  truelayer_id: varchar("truelayer_id", { length: 255 }),
  truelayer_connection_id: uuid("truelayer_connection_id").references(() => truelayerConnectionsTable.id),
}, (table) => [{
  userIdx: index("accounts_user_id_idx").on(table.user_id),
}]);

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

// User encryption keys table (envelope encryption)
export const userKeysTable = pgTable("user_keys", {
  user_id: uuid("user_id").primaryKey(),
  encrypted_key: text("encrypted_key").notNull(),
  key_version: integer("key_version").notNull().default(1),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

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
}]);

export const userPreferencesTable = pgTable("user_preferences", {
  user_id: uuid("user_id").primaryKey(),
  ai_enabled: boolean("ai_enabled").notNull().default(true),
  disabled_features: text("disabled_features"),
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

// Zakat

export const zakatSettingsTable = pgTable("zakat_settings", {
  user_id: uuid("user_id").primaryKey(),
  anniversary_date: date("anniversary_date").notNull(),
  nisab_type: varchar("nisab_type", { length: 10 }).notNull().default("gold"),
  use_lunar_calendar: boolean("use_lunar_calendar").notNull().default(false),
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
  cash_and_savings: numeric("cash_and_savings", { mode: "number" }).notNull(),
  investment_value: numeric("investment_value", { mode: "number" }).notNull(),
  other_assets_value: numeric("other_assets_value", { mode: "number" }).notNull().default(0),
  total_liabilities: numeric("total_liabilities", { mode: "number" }).notNull(),
  debt_deductions: numeric("debt_deductions", { mode: "number" }).notNull(),
  zakatable_amount: numeric("zakatable_amount", { mode: "number" }).notNull(),
  zakat_due: numeric("zakat_due", { mode: "number" }).notNull(),
  above_nisab: boolean("above_nisab").notNull(),
  breakdown_json: text("breakdown_json"),
}, (table) => [{
  userIdx: index("zakat_calculations_user_id_idx").on(table.user_id),
}]);

export const otherAssetsTable = pgTable("other_assets", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  name: varchar({ length: 255 }).notNull(),
  asset_type: varchar("asset_type", { length: 30 }).notNull(),
  value: numeric({ mode: "number" }).notNull().default(0),
  weight_grams: numeric("weight_grams", { mode: "number" }),
  is_zakatable: boolean("is_zakatable").notNull().default(false),
  notes: text(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [{
  userIdx: index("other_assets_user_id_idx").on(table.user_id),
}]);
