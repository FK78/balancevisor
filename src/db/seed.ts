import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql } from "drizzle-orm";
import postgres from "postgres";
import {
  defaultCategoryTemplatesTable,
  userOnboardingTable,
  accountsTable,
  categoriesTable,
  transactionsTable,
  budgetsTable,
  categorisationRulesTable,
  goalsTable,
  debtsTable,
  debtPaymentsTable,
  budgetAlertPreferencesTable,
  investmentGroupsTable,
  manualHoldingsTable,
  holdingSalesTable,
  subscriptionsTable,
  transactionSplitsTable,
  netWorthSnapshotsTable,
  budgetNotificationsTable,
  zakatSettingsTable,
  zakatCalculationsTable,
  retirementProfilesTable,
} from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isLocalhost = /localhost|127\.0\.0\.1/.test(DATABASE_URL);
const client = postgres(DATABASE_URL, {
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
  max: 1,
});
const db = drizzle(client);

// ── Constants ────────────────────────────────────────────────────────
const USER_ID = "f02d2f39-74f1-4771-b70c-92d708a83890";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ── Seed function ────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Seeding database...");

  // ── Cleanup existing data (FK-safe order) ─────────────────────
  console.log("  🗑  Clearing existing data for user...");
  await db.delete(zakatCalculationsTable).where(eq(zakatCalculationsTable.user_id, USER_ID));
  await db.delete(zakatSettingsTable).where(eq(zakatSettingsTable.user_id, USER_ID));
  await db.delete(retirementProfilesTable).where(eq(retirementProfilesTable.user_id, USER_ID));
  await db.delete(budgetNotificationsTable).where(eq(budgetNotificationsTable.user_id, USER_ID));
  await db.delete(budgetAlertPreferencesTable).where(eq(budgetAlertPreferencesTable.user_id, USER_ID));
  await db.delete(holdingSalesTable).where(eq(holdingSalesTable.user_id, USER_ID));
  await db.delete(manualHoldingsTable).where(eq(manualHoldingsTable.user_id, USER_ID));
  await db.delete(investmentGroupsTable).where(eq(investmentGroupsTable.user_id, USER_ID));
  await db.delete(netWorthSnapshotsTable).where(eq(netWorthSnapshotsTable.user_id, USER_ID));
  await db.delete(subscriptionsTable).where(eq(subscriptionsTable.user_id, USER_ID));
  // Delete splits for transactions owned by user's accounts
  await db.execute(sql`
    DELETE FROM transaction_splits WHERE transaction_id IN (
      SELECT t.id FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = ${USER_ID}
    )
  `);
  await db.execute(sql`
    DELETE FROM transactions WHERE account_id IN (
      SELECT id FROM accounts WHERE user_id = ${USER_ID}
    )
  `);
  await db.delete(debtPaymentsTable).where(
    sql`debt_id IN (SELECT id FROM debts WHERE user_id = ${USER_ID})`
  );
  await db.delete(debtsTable).where(eq(debtsTable.user_id, USER_ID));
  await db.delete(budgetsTable).where(eq(budgetsTable.user_id, USER_ID));
  await db.delete(categorisationRulesTable).where(eq(categorisationRulesTable.user_id, USER_ID));
  await db.delete(goalsTable).where(eq(goalsTable.user_id, USER_ID));
  await db.delete(accountsTable).where(eq(accountsTable.user_id, USER_ID));
  await db.delete(categoriesTable).where(eq(categoriesTable.user_id, USER_ID));
  await db.delete(userOnboardingTable).where(eq(userOnboardingTable.user_id, USER_ID));
  await db.delete(defaultCategoryTemplatesTable);
  console.log("  ✓ cleanup done");

  // ── Default category templates ───────────────────────────────────
  const categoryTemplates = await db
    .insert(defaultCategoryTemplatesTable)
    .values([
      { name: "Groceries", color: "#22c55e", icon: "ShoppingCart", sort_order: 1 },
      { name: "Transport", color: "#3b82f6", icon: "Car", sort_order: 2 },
      { name: "Entertainment", color: "#a855f7", icon: "Tv", sort_order: 3 },
      { name: "Dining Out", color: "#f97316", icon: "UtensilsCrossed", sort_order: 4 },
      { name: "Bills & Utilities", color: "#ef4444", icon: "Zap", sort_order: 5 },
      { name: "Health", color: "#14b8a6", icon: "Heart", sort_order: 6 },
      { name: "Shopping", color: "#ec4899", icon: "ShoppingBag", sort_order: 7 },
      { name: "Salary", color: "#10b981", icon: "Banknote", sort_order: 8 },
      { name: "Freelance", color: "#06b6d4", icon: "Laptop", sort_order: 9 },
      { name: "Investments", color: "#6366f1", icon: "TrendingUp", sort_order: 10 },
    ])
    .returning();
  console.log(`  ✓ ${categoryTemplates.length} default category templates`);

  // ── User onboarding ──────────────────────────────────────────────
  await db.insert(userOnboardingTable).values({
    user_id: USER_ID,
    base_currency: "GBP",
    use_default_categories: true,
    completed: true,
    completed_at: new Date(),
  });
  console.log("  ✓ user onboarding");

  // ── Categories ───────────────────────────────────────────────────
  const categories = await db
    .insert(categoriesTable)
    .values([
      { user_id: USER_ID, name: "Groceries", color: "#22c55e", icon: "ShoppingCart" },
      { user_id: USER_ID, name: "Transport", color: "#3b82f6", icon: "Car" },
      { user_id: USER_ID, name: "Entertainment", color: "#a855f7", icon: "Tv" },
      { user_id: USER_ID, name: "Dining Out", color: "#f97316", icon: "UtensilsCrossed" },
      { user_id: USER_ID, name: "Bills & Utilities", color: "#ef4444", icon: "Zap" },
      { user_id: USER_ID, name: "Health", color: "#14b8a6", icon: "Heart" },
      { user_id: USER_ID, name: "Shopping", color: "#ec4899", icon: "ShoppingBag" },
      { user_id: USER_ID, name: "Salary", color: "#10b981", icon: "Banknote" },
      { user_id: USER_ID, name: "Freelance", color: "#06b6d4", icon: "Laptop" },
      { user_id: USER_ID, name: "Investments", color: "#6366f1", icon: "TrendingUp" },
    ])
    .returning();
  console.log(`  ✓ ${categories.length} categories`);

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // ── Accounts ─────────────────────────────────────────────────────
  const accounts = await db
    .insert(accountsTable)
    .values([
      { user_id: USER_ID, name: "Monzo Current", type: "currentAccount" as const, balance: 2450.83, currency: "GBP" },
      { user_id: USER_ID, name: "Chase Saver", type: "savings" as const, balance: 12500.0, currency: "GBP" },
      { user_id: USER_ID, name: "Amex Gold", type: "creditCard" as const, balance: -743.21, currency: "GBP" },
      { user_id: USER_ID, name: "Vanguard ISA", type: "investment" as const, balance: 34200.0, currency: "GBP" },
      { user_id: USER_ID, name: "Starling Joint", type: "currentAccount" as const, balance: 1820.55, currency: "GBP" },
    ])
    .returning();
  console.log(`  ✓ ${accounts.length} accounts`);

  const acctMap = Object.fromEntries(accounts.map((a) => [a.name, a.id]));

  // ── Transactions ─────────────────────────────────────────────────
  const txValues = [
    // Salary
    { account_id: acctMap["Monzo Current"], category_id: catMap["Salary"], type: "income" as const, amount: 3800, description: "Monthly Salary - April", date: daysAgo(2), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(28) },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Salary"], type: "income" as const, amount: 3800, description: "Monthly Salary - March", date: daysAgo(32), is_recurring: true, recurring_pattern: "monthly" as const },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Salary"], type: "income" as const, amount: 3800, description: "Monthly Salary - February", date: daysAgo(60), is_recurring: true, recurring_pattern: "monthly" as const },
    // Freelance
    { account_id: acctMap["Monzo Current"], category_id: catMap["Freelance"], type: "income" as const, amount: 750, description: "Web design project - ClientCo", date: daysAgo(10), is_recurring: false },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Freelance"], type: "income" as const, amount: 500, description: "Logo design - BrandX", date: daysAgo(45), is_recurring: false },
    // Groceries
    { account_id: acctMap["Monzo Current"], category_id: catMap["Groceries"], type: "expense" as const, amount: 67.42, description: "Tesco Weekly Shop", date: daysAgo(1), is_recurring: false },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Groceries"], type: "expense" as const, amount: 52.18, description: "Sainsbury's", date: daysAgo(5), is_recurring: false },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Groceries"], type: "expense" as const, amount: 23.99, description: "Aldi top-up shop", date: daysAgo(8), is_recurring: false },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Groceries"], type: "expense" as const, amount: 89.34, description: "Ocado delivery", date: daysAgo(15), is_recurring: false },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Groceries"], type: "expense" as const, amount: 45.60, description: "M&S Food Hall", date: daysAgo(22), is_recurring: false },
    // Transport
    { account_id: acctMap["Monzo Current"], category_id: catMap["Transport"], type: "expense" as const, amount: 160, description: "Monthly Oyster card", date: daysAgo(3), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(27) },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Transport"], type: "expense" as const, amount: 45.00, description: "Uber to Heathrow", date: daysAgo(12), is_recurring: false },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Transport"], type: "expense" as const, amount: 65.50, description: "Train to Manchester", date: daysAgo(20), is_recurring: false },
    // Entertainment
    { account_id: acctMap["Amex Gold"], category_id: catMap["Entertainment"], type: "expense" as const, amount: 15.99, description: "Netflix", date: daysAgo(4), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(26) },
    { account_id: acctMap["Amex Gold"], category_id: catMap["Entertainment"], type: "expense" as const, amount: 10.99, description: "Spotify Premium", date: daysAgo(6), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(24) },
    { account_id: acctMap["Amex Gold"], category_id: catMap["Entertainment"], type: "expense" as const, amount: 42.50, description: "Vue Cinema - 2 tickets", date: daysAgo(9), is_recurring: false },
    { account_id: acctMap["Amex Gold"], category_id: catMap["Entertainment"], type: "expense" as const, amount: 89.00, description: "Concert tickets - O2", date: daysAgo(18), is_recurring: false },
    // Dining Out
    { account_id: acctMap["Amex Gold"], category_id: catMap["Dining Out"], type: "expense" as const, amount: 78.50, description: "Dishoom - dinner", date: daysAgo(3), is_recurring: false },
    { account_id: acctMap["Amex Gold"], category_id: catMap["Dining Out"], type: "expense" as const, amount: 34.20, description: "Pret A Manger - lunch x3", date: daysAgo(7), is_recurring: false },
    { account_id: acctMap["Amex Gold"], category_id: catMap["Dining Out"], type: "expense" as const, amount: 125.00, description: "Birthday dinner - Nobu", date: daysAgo(14), is_recurring: false },
    { account_id: acctMap["Amex Gold"], category_id: catMap["Dining Out"], type: "expense" as const, amount: 22.80, description: "Five Guys", date: daysAgo(21), is_recurring: false },
    // Bills & Utilities
    { account_id: acctMap["Monzo Current"], category_id: catMap["Bills & Utilities"], type: "expense" as const, amount: 1200, description: "Rent - April", date: daysAgo(1), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(29) },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Bills & Utilities"], type: "expense" as const, amount: 85.00, description: "EDF Energy", date: daysAgo(5), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(25) },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Bills & Utilities"], type: "expense" as const, amount: 32.00, description: "Three Mobile", date: daysAgo(7), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(23) },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Bills & Utilities"], type: "expense" as const, amount: 55.00, description: "Sky Broadband", date: daysAgo(10), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(20) },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Bills & Utilities"], type: "expense" as const, amount: 28.50, description: "Thames Water", date: daysAgo(12), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(18) },
    // Health
    { account_id: acctMap["Monzo Current"], category_id: catMap["Health"], type: "expense" as const, amount: 39.99, description: "PureGym membership", date: daysAgo(2), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(28) },
    { account_id: acctMap["Monzo Current"], category_id: catMap["Health"], type: "expense" as const, amount: 12.50, description: "Boots pharmacy", date: daysAgo(11), is_recurring: false },
    // Shopping
    { account_id: acctMap["Amex Gold"], category_id: catMap["Shopping"], type: "expense" as const, amount: 59.99, description: "Amazon - headphones", date: daysAgo(6), is_recurring: false },
    { account_id: acctMap["Amex Gold"], category_id: catMap["Shopping"], type: "expense" as const, amount: 89.00, description: "Uniqlo - jacket", date: daysAgo(16), is_recurring: false },
    { account_id: acctMap["Amex Gold"], category_id: catMap["Shopping"], type: "expense" as const, amount: 24.99, description: "WHSmith - books", date: daysAgo(25), is_recurring: false },
    // Transfers
    { account_id: acctMap["Monzo Current"], type: "transfer" as const, amount: 500, description: "Monthly savings transfer", date: daysAgo(2), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(28), transfer_account_id: acctMap["Chase Saver"] },
    { account_id: acctMap["Monzo Current"], type: "transfer" as const, amount: 500, description: "Savings transfer - March", date: daysAgo(32), is_recurring: true, recurring_pattern: "monthly" as const, transfer_account_id: acctMap["Chase Saver"] },
    // Investment
    { account_id: acctMap["Monzo Current"], category_id: catMap["Investments"], type: "transfer" as const, amount: 300, description: "ISA contribution", date: daysAgo(2), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(28), transfer_account_id: acctMap["Vanguard ISA"] },
    // Joint account
    { account_id: acctMap["Starling Joint"], category_id: catMap["Groceries"], type: "expense" as const, amount: 112.30, description: "Costco bulk shop", date: daysAgo(4), is_recurring: false },
    { account_id: acctMap["Starling Joint"], category_id: catMap["Bills & Utilities"], type: "expense" as const, amount: 14.99, description: "Council tax share", date: daysAgo(6), is_recurring: true, recurring_pattern: "monthly" as const, next_recurring_date: daysFromNow(24) },
    // A split transaction
    { account_id: acctMap["Monzo Current"], category_id: catMap["Groceries"], type: "expense" as const, amount: 156.80, description: "Big Tesco shop (split)", date: daysAgo(13), is_recurring: false, is_split: true },
  ];

  const transactions = await db.insert(transactionsTable).values(txValues.map(v => ({ ...v, user_id: USER_ID }))).returning();
  console.log(`  ✓ ${transactions.length} transactions`);

  // ── Transaction splits ───────────────────────────────────────────
  const splitTx = transactions.find((t) => t.is_split);
  if (splitTx) {
    const splits = await db
      .insert(transactionSplitsTable)
      .values([
        { transaction_id: splitTx.id, category_id: catMap["Groceries"], amount: 98.50, description: "Food items" },
        { transaction_id: splitTx.id, category_id: catMap["Health"], amount: 32.30, description: "Vitamins & supplements" },
        { transaction_id: splitTx.id, category_id: catMap["Shopping"], amount: 26.00, description: "Household items" },
      ])
      .returning();
    console.log(`  ✓ ${splits.length} transaction splits`);
  }

  // ── Budgets ──────────────────────────────────────────────────────
  const budgets = await db
    .insert(budgetsTable)
    .values([
      { user_id: USER_ID, category_id: catMap["Groceries"], amount: 400, period: "monthly" as const, start_date: monthsAgo(0) },
      { user_id: USER_ID, category_id: catMap["Transport"], amount: 250, period: "monthly" as const, start_date: monthsAgo(0) },
      { user_id: USER_ID, category_id: catMap["Entertainment"], amount: 200, period: "monthly" as const, start_date: monthsAgo(0) },
      { user_id: USER_ID, category_id: catMap["Dining Out"], amount: 300, period: "monthly" as const, start_date: monthsAgo(0) },
      { user_id: USER_ID, category_id: catMap["Shopping"], amount: 200, period: "monthly" as const, start_date: monthsAgo(0) },
      { user_id: USER_ID, category_id: catMap["Health"], amount: 100, period: "monthly" as const, start_date: monthsAgo(0) },
    ])
    .returning();
  console.log(`  ✓ ${budgets.length} budgets`);

  const budgetMap = Object.fromEntries(
    budgets.map((b) => {
      const catName = categories.find((c) => c.id === b.category_id)?.name ?? "unknown";
      return [catName, b.id];
    })
  );

  // ── Budget alert preferences ─────────────────────────────────────
  const alertPrefs = await db
    .insert(budgetAlertPreferencesTable)
    .values([
      { budget_id: budgetMap["Groceries"], user_id: USER_ID, threshold: 80, browser_alerts: true, email_alerts: false },
      { budget_id: budgetMap["Dining Out"], user_id: USER_ID, threshold: 75, browser_alerts: true, email_alerts: true },
      { budget_id: budgetMap["Entertainment"], user_id: USER_ID, threshold: 90, browser_alerts: true, email_alerts: false },
    ])
    .returning();
  console.log(`  ✓ ${alertPrefs.length} budget alert preferences`);

  // ── Budget notifications ─────────────────────────────────────────
  const notifications = await db
    .insert(budgetNotificationsTable)
    .values([
      { user_id: USER_ID, budget_id: budgetMap["Dining Out"], alert_type: "threshold_warning" as const, message: "You've used 80% of your Dining Out budget this month.", is_read: true, emailed: false },
      { user_id: USER_ID, budget_id: budgetMap["Dining Out"], alert_type: "over_budget" as const, message: "You've exceeded your Dining Out budget for this month!", is_read: false, emailed: true },
      { user_id: USER_ID, budget_id: budgetMap["Groceries"], alert_type: "threshold_warning" as const, message: "You've used 85% of your Groceries budget this month.", is_read: false, emailed: false },
    ])
    .returning();
  console.log(`  ✓ ${notifications.length} budget notifications`);

  // ── Categorisation rules ─────────────────────────────────────────
  const rules = await db
    .insert(categorisationRulesTable)
    .values([
      { user_id: USER_ID, pattern: "tesco", category_id: catMap["Groceries"], priority: 1 },
      { user_id: USER_ID, pattern: "sainsbury", category_id: catMap["Groceries"], priority: 2 },
      { user_id: USER_ID, pattern: "aldi", category_id: catMap["Groceries"], priority: 3 },
      { user_id: USER_ID, pattern: "uber", category_id: catMap["Transport"], priority: 4 },
      { user_id: USER_ID, pattern: "tfl", category_id: catMap["Transport"], priority: 5 },
      { user_id: USER_ID, pattern: "netflix", category_id: catMap["Entertainment"], priority: 6 },
      { user_id: USER_ID, pattern: "spotify", category_id: catMap["Entertainment"], priority: 7 },
      { user_id: USER_ID, pattern: "amazon", category_id: catMap["Shopping"], priority: 8 },
      { user_id: USER_ID, pattern: "pret", category_id: catMap["Dining Out"], priority: 9 },
      { user_id: USER_ID, pattern: "puregym", category_id: catMap["Health"], priority: 10 },
    ])
    .returning();
  console.log(`  ✓ ${rules.length} categorisation rules`);

  // ── Goals ────────────────────────────────────────────────────────
  const goals = await db
    .insert(goalsTable)
    .values([
      { user_id: USER_ID, name: "Emergency Fund", target_amount: 10000, saved_amount: 6500, target_date: daysFromNow(180), icon: "Shield", color: "#22c55e" },
      { user_id: USER_ID, name: "Holiday - Japan", target_amount: 5000, saved_amount: 2200, target_date: daysFromNow(270), icon: "Plane", color: "#3b82f6" },
      { user_id: USER_ID, name: "New Laptop", target_amount: 2000, saved_amount: 1400, target_date: daysFromNow(90), icon: "Laptop", color: "#a855f7" },
      { user_id: USER_ID, name: "House Deposit", target_amount: 50000, saved_amount: 18000, target_date: daysFromNow(730), icon: "Home", color: "#f97316" },
    ])
    .returning();
  console.log(`  ✓ ${goals.length} goals`);

  // ── Debts ────────────────────────────────────────────────────────
  const debts = await db
    .insert(debtsTable)
    .values([
      { user_id: USER_ID, name: "Student Loan", original_amount: 42000, remaining_amount: 28500, interest_rate: 6.3, minimum_payment: 150, due_date: daysFromNow(15), lender: "Student Loans Company", color: "#ef4444" },
      { user_id: USER_ID, name: "Car Finance", original_amount: 15000, remaining_amount: 8200, interest_rate: 4.9, minimum_payment: 285, due_date: daysFromNow(10), lender: "Black Horse", color: "#f97316" },
      { user_id: USER_ID, name: "Personal Loan", original_amount: 5000, remaining_amount: 1200, interest_rate: 3.4, minimum_payment: 200, due_date: daysFromNow(20), lender: "Monzo", color: "#eab308" },
    ])
    .returning();
  console.log(`  ✓ ${debts.length} debts`);

  // ── Debt payments ────────────────────────────────────────────────
  const debtPayments = await db
    .insert(debtPaymentsTable)
    .values([
      { debt_id: debts[0].id, account_id: acctMap["Monzo Current"], amount: 150, date: daysAgo(5), note: "April student loan payment" },
      { debt_id: debts[0].id, account_id: acctMap["Monzo Current"], amount: 150, date: daysAgo(35), note: "March student loan payment" },
      { debt_id: debts[0].id, account_id: acctMap["Monzo Current"], amount: 150, date: daysAgo(65), note: "February student loan payment" },
      { debt_id: debts[1].id, account_id: acctMap["Monzo Current"], amount: 285, date: daysAgo(8), note: "April car payment" },
      { debt_id: debts[1].id, account_id: acctMap["Monzo Current"], amount: 285, date: daysAgo(38), note: "March car payment" },
      { debt_id: debts[2].id, account_id: acctMap["Monzo Current"], amount: 200, date: daysAgo(3), note: "April personal loan" },
      { debt_id: debts[2].id, account_id: acctMap["Monzo Current"], amount: 200, date: daysAgo(33), note: "March personal loan" },
      { debt_id: debts[2].id, account_id: acctMap["Monzo Current"], amount: 400, date: daysAgo(25), note: "Extra payment toward personal loan" },
    ])
    .returning();
  console.log(`  ✓ ${debtPayments.length} debt payments`);

  // ── Investment groups ────────────────────────────────────────────
  const investmentGroups = await db
    .insert(investmentGroupsTable)
    .values([
      { user_id: USER_ID, account_id: acctMap["Vanguard ISA"], name: "Tech Stocks", color: "#6366f1", icon: "Cpu", sort_order: 1 },
      { user_id: USER_ID, account_id: acctMap["Vanguard ISA"], name: "Index Funds", color: "#22c55e", icon: "BarChart3", sort_order: 2 },
      { user_id: USER_ID, account_id: acctMap["Vanguard ISA"], name: "UK Equities", color: "#3b82f6", icon: "Building2", sort_order: 3 },
    ])
    .returning();
  console.log(`  ✓ ${investmentGroups.length} investment groups`);

  const groupMap = Object.fromEntries(investmentGroups.map((g) => [g.name, g.id]));

  // ── Manual holdings ──────────────────────────────────────────────
  const holdings = await db
    .insert(manualHoldingsTable)
    .values([
      { user_id: USER_ID, ticker: "AAPL", name: "Apple Inc.", quantity: 15, average_price: 142.50, current_price: 178.30, currency: "USD", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Tech Stocks"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "MSFT", name: "Microsoft Corp.", quantity: 10, average_price: 285.00, current_price: 412.60, currency: "USD", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Tech Stocks"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "NVDA", name: "NVIDIA Corp.", quantity: 8, average_price: 450.00, current_price: 875.40, currency: "USD", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Tech Stocks"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "VWRL", name: "Vanguard FTSE All-World ETF", quantity: 50, average_price: 82.40, current_price: 96.20, currency: "GBP", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Index Funds"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "VUSA", name: "Vanguard S&P 500 ETF", quantity: 30, average_price: 62.10, current_price: 78.50, currency: "GBP", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Index Funds"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "LLOY", name: "Lloyds Banking Group", quantity: 500, average_price: 0.48, current_price: 0.56, currency: "GBP", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["UK Equities"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "BP", name: "BP plc", quantity: 200, average_price: 4.80, current_price: 5.15, currency: "GBP", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["UK Equities"], last_price_update: new Date() },
      { user_id: USER_ID, name: "BTL Property - Manchester", quantity: 1, average_price: 185000, current_price: 210000, currency: "GBP", investment_type: "real_estate" as const, estimated_return_percent: 6.2, notes: "2-bed flat, Ancoats. Rental yield ~6.2%" },
    ])
    .returning();
  console.log(`  ✓ ${holdings.length} manual holdings`);

  // ── Holding sales ────────────────────────────────────────────────
  const sales = await db
    .insert(holdingSalesTable)
    .values([
      { holding_id: holdings.find((h) => h.ticker === "AAPL")!.id, user_id: USER_ID, date: daysAgo(30), quantity: 5, price_per_unit: 170.25, realized_gain: 138.75, cash_account_id: acctMap["Monzo Current"], notes: "Partial profit-taking" },
      { holding_id: holdings.find((h) => h.ticker === "LLOY")!.id, user_id: USER_ID, date: daysAgo(60), quantity: 200, price_per_unit: 0.53, realized_gain: 10, cash_account_id: acctMap["Monzo Current"], notes: "Rebalancing UK equities" },
    ])
    .returning();
  console.log(`  ✓ ${sales.length} holding sales`);

  // ── Subscriptions ────────────────────────────────────────────────
  const subscriptions = await db
    .insert(subscriptionsTable)
    .values([
      { user_id: USER_ID, name: "Netflix Standard", amount: 15.99, currency: "GBP", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(26), category_id: catMap["Entertainment"], account_id: acctMap["Amex Gold"], url: "https://netflix.com", color: "#e50914", icon: "Tv" },
      { user_id: USER_ID, name: "Spotify Premium", amount: 10.99, currency: "GBP", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(24), category_id: catMap["Entertainment"], account_id: acctMap["Amex Gold"], url: "https://spotify.com", color: "#1db954", icon: "Music" },
      { user_id: USER_ID, name: "PureGym", amount: 39.99, currency: "GBP", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(28), category_id: catMap["Health"], account_id: acctMap["Monzo Current"], url: "https://puregym.com", color: "#fbbf24", icon: "Dumbbell" },
      { user_id: USER_ID, name: "Sky Broadband", amount: 55.00, currency: "GBP", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(20), category_id: catMap["Bills & Utilities"], account_id: acctMap["Monzo Current"], color: "#0072c6", icon: "Wifi" },
      { user_id: USER_ID, name: "Three Mobile", amount: 32.00, currency: "GBP", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(23), category_id: catMap["Bills & Utilities"], account_id: acctMap["Monzo Current"], color: "#ff6600", icon: "Smartphone" },
      { user_id: USER_ID, name: "Amazon Prime", amount: 95.00, currency: "GBP", billing_cycle: "yearly" as const, next_billing_date: daysFromNow(195), category_id: catMap["Shopping"], account_id: acctMap["Amex Gold"], url: "https://amazon.co.uk", color: "#ff9900", icon: "Package" },
      { user_id: USER_ID, name: "iCloud+ 200GB", amount: 2.99, currency: "GBP", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(18), category_id: catMap["Bills & Utilities"], account_id: acctMap["Monzo Current"], color: "#007aff", icon: "Cloud" },
      { user_id: USER_ID, name: "ChatGPT Plus", amount: 20.00, currency: "USD", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(12), category_id: catMap["Bills & Utilities"], account_id: acctMap["Amex Gold"], url: "https://chat.openai.com", color: "#10a37f", icon: "Bot" },
    ])
    .returning();
  console.log(`  ✓ ${subscriptions.length} subscriptions`);

  // ── Net worth snapshots (last 12 months) ─────────────────────────
  const snapshotValues = Array.from({ length: 12 }, (_, i) => {
    const monthOffset = 11 - i;
    const baseAssets = 42000 + i * 1800;
    const baseLiabilities = 38500 - i * 600;
    const investmentValue = 28000 + i * 520;
    return {
      user_id: USER_ID,
      date: monthsAgo(monthOffset),
      net_worth: baseAssets - baseLiabilities + investmentValue,
      total_assets: baseAssets,
      total_liabilities: baseLiabilities,
      investment_value: investmentValue,
    };
  });

  const snapshots = await db.insert(netWorthSnapshotsTable).values(snapshotValues).returning();
  console.log(`  ✓ ${snapshots.length} net worth snapshots`);

  // ── Zakat settings & sample calculation ────────────────────────────
  await db.insert(zakatSettingsTable).values({
    user_id: USER_ID,
    anniversary_date: daysFromNow(45),
    nisab_type: "gold",
    use_lunar_calendar: false,
  });
  console.log("  \u2713 zakat settings");

  await db.insert(zakatCalculationsTable).values({
    user_id: USER_ID,
    is_auto: false,
    nisab_value: 5686,
    total_assets: 16771.38,
    cash_and_savings: 16771.38,
    investment_value: 0,
    total_liabilities: 743.21,
    debt_deductions: 37900,
    zakatable_amount: 0,
    zakat_due: 0,
    above_nisab: false,
    breakdown_json: {
      accounts: [
        { name: "Monzo Current", type: "currentAccount", balance: 2450.83 },
        { name: "Chase Saver", type: "savings", balance: 12500 },
        { name: "Starling Joint", type: "currentAccount", balance: 1820.55 },
      ],
      debts: [
        { name: "Student Loan", remainingAmount: 28500 },
        { name: "Car Finance", remainingAmount: 8200 },
        { name: "Personal Loan", remainingAmount: 1200 },
      ],
    },
  });
  console.log("  \u2713 zakat sample calculation");

  // ── Retirement profile ──────────────────────────────────────────────
  await db.insert(retirementProfilesTable).values({
    user_id: USER_ID,
    current_age: 30,
    target_retirement_age: 60,
    desired_annual_spending: 35000,
    expected_pension_annual: 9500,
    expected_investment_return: 6.0,
    inflation_rate: 2.5,
    life_expectancy: 90,
  });
  console.log("  ✓ retirement profile");

  console.log("\n\u2705 Seed complete!");
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
