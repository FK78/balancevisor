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
  dashboardLayoutsTable,
  userPreferencesTable,
  transactionReviewFlagsTable,
  sharedAccessTable,
  merchantMappingsTable,
} from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isLocalhost = /localhost|127\.0\.0\.1/.test(DATABASE_URL);
const client = postgres(DATABASE_URL, {
  ssl: isLocalhost ? false : process.env.DATABASE_CA_CERT
    ? { ca: process.env.DATABASE_CA_CERT }
    : 'require',
  max: 1,
});
const db = drizzle(client);

// ── Constants ────────────────────────────────────────────────────────
const USER_ID = "f02d2f39-74f1-4771-b70c-92d708a83890";
const MONTHS_OF_DATA = 36; // 3 years of history

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

/** Deterministic pseudo-random (mulberry32) so seed data is reproducible */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = makeRng(42);

/** Random float in [min, max] */
function rand(min: number, max: number): number {
  return +(min + rng() * (max - min)).toFixed(2);
}

/** Random integer in [min, max] */
function randInt(min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1));
}

/** Pick a random item from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Get a date string for a specific day within a given month offset */
function dateInMonth(monthOffset: number, day: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthOffset);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return d.toISOString().slice(0, 10);
}

/** Get the month name for a given month offset (e.g. 0 = current month) */
function monthName(monthOffset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthOffset);
  return d.toLocaleString("en-GB", { month: "long", year: "numeric" });
}

// ── Seed function ────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Seeding database...");

  // ── Cleanup existing data (FK-safe order) ─────────────────────
  console.log("  🗑  Clearing existing data for user...");
  await db.execute(sql`DELETE FROM transaction_review_flags WHERE user_id = ${USER_ID}`);
  await db.execute(sql`
    DELETE FROM shared_access
    WHERE owner_id = ${USER_ID} OR shared_with_email = 'dev@balancevisor.local'
  `);
  await db.delete(dashboardLayoutsTable).where(eq(dashboardLayoutsTable.user_id, USER_ID));
  await db.delete(userPreferencesTable).where(eq(userPreferencesTable.user_id, USER_ID));
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
  await db.delete(merchantMappingsTable).where(eq(merchantMappingsTable.user_id, USER_ID));
  await db.execute(sql`
    DELETE FROM transaction_splits WHERE transaction_id IN (
      SELECT t.id FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE a.user_id = ${USER_ID}
    )
  `);
  await db.execute(sql`
    DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE user_id = ${USER_ID})
  `);
  await db.delete(debtPaymentsTable).where(sql`debt_id IN (SELECT id FROM debts WHERE user_id = ${USER_ID})`);
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
  const CATEGORY_DEFS = [
    { name: "Groceries", color: "#22c55e", icon: "ShoppingCart" },
    { name: "Transport", color: "#3b82f6", icon: "Car" },
    { name: "Entertainment", color: "#a855f7", icon: "Tv" },
    { name: "Dining Out", color: "#f97316", icon: "UtensilsCrossed" },
    { name: "Bills & Utilities", color: "#ef4444", icon: "Zap" },
    { name: "Health", color: "#14b8a6", icon: "Heart" },
    { name: "Shopping", color: "#ec4899", icon: "ShoppingBag" },
    { name: "Salary", color: "#10b981", icon: "Banknote" },
    { name: "Freelance", color: "#06b6d4", icon: "Laptop" },
    { name: "Investments", color: "#6366f1", icon: "TrendingUp" },
    { name: "Education", color: "#8b5cf6", icon: "GraduationCap" },
    { name: "Gifts & Charity", color: "#f43f5e", icon: "Gift" },
    { name: "Personal Care", color: "#d946ef", icon: "Sparkles" },
    { name: "Insurance", color: "#0ea5e9", icon: "ShieldCheck" },
    { name: "Childcare", color: "#fb923c", icon: "Baby" },
  ];

  const categoryTemplates = await db
    .insert(defaultCategoryTemplatesTable)
    .values(CATEGORY_DEFS.map((c, i) => ({ ...c, sort_order: i + 1 })))
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
    .values(CATEGORY_DEFS.map((c) => ({ user_id: USER_ID, ...c })))
    .returning();
  console.log(`  ✓ ${categories.length} categories`);

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // ── Accounts (8 accounts, multi-currency) ─────────────────────────
  const accounts = await db
    .insert(accountsTable)
    .values([
      { user_id: USER_ID, name: "Monzo Current", type: "currentAccount" as const, balance: 3285.47, currency: "GBP" },
      { user_id: USER_ID, name: "Chase Saver", type: "savings" as const, balance: 18750.0, currency: "GBP" },
      { user_id: USER_ID, name: "Amex Gold", type: "creditCard" as const, balance: -1243.67, currency: "GBP" },
      { user_id: USER_ID, name: "Vanguard ISA", type: "investment" as const, balance: 52800.0, currency: "GBP" },
      { user_id: USER_ID, name: "Starling Joint", type: "currentAccount" as const, balance: 2120.33, currency: "GBP" },
      { user_id: USER_ID, name: "Wise EUR", type: "currentAccount" as const, balance: 1450.0, currency: "EUR" },
      { user_id: USER_ID, name: "Wise USD", type: "currentAccount" as const, balance: 2200.0, currency: "USD" },
      { user_id: USER_ID, name: "Marcus Savings", type: "savings" as const, balance: 8500.0, currency: "GBP" },
    ])
    .returning();
  console.log(`  ✓ ${accounts.length} accounts`);

  const acctMap = Object.fromEntries(accounts.map((a) => [a.name, a.id]));

  // ── Transactions (3 years, programmatically generated) ─────────────
  type TxInput = {
    account_id: string;
    category_id?: string;
    type: "income" | "expense" | "transfer" | "sale" | "refund";
    amount: number;
    description: string;
    date: string;
    is_recurring: boolean;
    recurring_pattern?: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
    next_recurring_date?: string;
    transfer_account_id?: string;
    is_split?: boolean;
    merchant_name?: string;
    category_source?: string;
  };
  const txValues: TxInput[] = [];

  const groceryMerchants = ["Tesco", "Sainsbury's", "Aldi", "Lidl", "Ocado", "M&S Food", "Waitrose", "Asda", "Morrisons", "Co-op"];
  const diningMerchants = ["Pret A Manger", "Dishoom", "Wagamama", "Nando's", "Five Guys", "Pizza Express", "Hawksmoor", "Nobu", "Leon", "Itsu", "Franco Manca", "Honest Burgers", "Byron Burger", "Chipotle", "GBK"];
  const shoppingMerchants = ["Amazon", "ASOS", "Uniqlo", "John Lewis", "Currys", "TK Maxx", "WHSmith", "Argos", "Zara", "H&M", "IKEA", "Boots", "Superdrug"];
  const entertainmentItems = ["Vue Cinema tickets", "Concert tickets", "Theatre tickets", "Comedy show", "Bowling", "Escape room", "Museum entry", "Art exhibition", "Gig tickets"];
  const transportItems = ["Uber ride", "Bolt ride", "Train to Manchester", "Train to Birmingham", "Train to Bristol", "Uber to Heathrow", "Uber to Gatwick", "National Express coach", "Lime scooter"];
  const healthItems = ["Boots pharmacy", "Superdrug", "Holland & Barrett", "Dentist appointment", "Optician appointment", "Physiotherapy session"];
  const educationItems = ["Udemy course", "Coursera subscription", "O'Reilly Books", "Pluralsight", "AWS certification exam", "Conference ticket", "Technical book"];
  const giftItems = ["Birthday present", "Wedding gift", "Charity donation - UNICEF", "Charity donation - Macmillan", "Christmas presents", "Baby shower gift", "Housewarming gift", "JustGiving donation"];
  const personalCareItems = ["Haircut - barber", "Skincare products", "Dry cleaning", "Laundry service", "Perfume"];
  const freelanceClients = ["Web design - ClientCo", "Logo design - BrandX", "React consulting - TechCorp", "UI audit - StartupY", "Shopify store - LocalBiz", "WordPress site - CafeZ", "App design - FinCo", "Landing page - SaaSX"];
  const insuranceItems = ["Car Insurance - Admiral", "Home Contents Insurance", "Life Insurance premium", "Travel Insurance - annual", "Pet Insurance"];

  // Salary got a raise 18 months ago (3500→3800) and another 6 months ago (3800→4200)
  for (let m = MONTHS_OF_DATA - 1; m >= 0; m--) {
    const isCurrentMonth = m === 0;
    const salaryAmount = m >= 18 ? 3500 : m >= 6 ? 3800 : 4200;

    // ─── INCOME: Salary (25th of each month) ───
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Salary"], type: "income",
      amount: salaryAmount, description: `Monthly Salary - ${monthName(m)}`,
      date: dateInMonth(m, 25), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(25) } : {}),
      merchant_name: "Acme Corp Ltd", category_source: "rule",
    });

    // ─── INCOME: Freelance (sporadic, ~60% of months) ───
    if (rng() < 0.6) {
      txValues.push({
        account_id: acctMap["Monzo Current"], category_id: catMap["Freelance"], type: "income",
        amount: rand(300, 2500), description: pick(freelanceClients),
        date: dateInMonth(m, randInt(5, 20)), is_recurring: false,
        category_source: "ai",
      });
    }
    // Second freelance gig ~25% of months
    if (rng() < 0.25) {
      txValues.push({
        account_id: acctMap["Monzo Current"], category_id: catMap["Freelance"], type: "income",
        amount: rand(200, 1500), description: pick(freelanceClients),
        date: dateInMonth(m, randInt(10, 28)), is_recurring: false,
        category_source: "ai",
      });
    }

    // ─── EXPENSE: Rent (1st of month) ───
    const rentAmount = m >= 24 ? 1100 : m >= 12 ? 1200 : 1350;
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Bills & Utilities"], type: "expense",
      amount: rentAmount, description: `Rent - ${monthName(m)}`,
      date: dateInMonth(m, 1), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(29) } : {}),
      merchant_name: "Landlord - OpenRent", category_source: "rule",
    });

    // ─── EXPENSE: Energy bill (5th) ───
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Bills & Utilities"], type: "expense",
      amount: rand(65, 130), description: "EDF Energy",
      date: dateInMonth(m, 5), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(25) } : {}),
      merchant_name: "EDF Energy", category_source: "rule",
    });

    // ─── EXPENSE: Mobile phone (8th) ───
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Bills & Utilities"], type: "expense",
      amount: m >= 12 ? 28 : 32, description: "Three Mobile",
      date: dateInMonth(m, 8), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(23) } : {}),
      merchant_name: "Three Mobile", category_source: "rule",
    });

    // ─── EXPENSE: Broadband (10th) ───
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Bills & Utilities"], type: "expense",
      amount: 55, description: "Sky Broadband",
      date: dateInMonth(m, 10), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(20) } : {}),
      merchant_name: "Sky Broadband", category_source: "rule",
    });

    // ─── EXPENSE: Water (12th) ───
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Bills & Utilities"], type: "expense",
      amount: rand(25, 35), description: "Thames Water",
      date: dateInMonth(m, 12), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(18) } : {}),
      merchant_name: "Thames Water", category_source: "rule",
    });

    // ─── EXPENSE: Council tax (joint, 15th) ───
    txValues.push({
      account_id: acctMap["Starling Joint"], category_id: catMap["Bills & Utilities"], type: "expense",
      amount: m >= 12 ? 162 : 175, description: "Council Tax",
      date: dateInMonth(m, 15), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(15) } : {}),
      merchant_name: "Council Tax", category_source: "rule",
    });

    // ─── EXPENSE: Oyster/transport card (3rd) ───
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Transport"], type: "expense",
      amount: m >= 18 ? 145 : 160, description: "Monthly Oyster card",
      date: dateInMonth(m, 3), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(27) } : {}),
      merchant_name: "TfL", category_source: "rule",
    });

    // ─── EXPENSE: Gym (2nd) ───
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Health"], type: "expense",
      amount: m >= 24 ? 29.99 : 39.99, description: "PureGym membership",
      date: dateInMonth(m, 2), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(28) } : {}),
      merchant_name: "PureGym", category_source: "rule",
    });

    // ─── EXPENSE: Netflix (4th, on Amex) ───
    txValues.push({
      account_id: acctMap["Amex Gold"], category_id: catMap["Entertainment"], type: "expense",
      amount: m >= 18 ? 13.99 : 15.99, description: "Netflix",
      date: dateInMonth(m, 4), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(26) } : {}),
      merchant_name: "Netflix", category_source: "rule",
    });

    // ─── EXPENSE: Spotify (6th, on Amex) ───
    txValues.push({
      account_id: acctMap["Amex Gold"], category_id: catMap["Entertainment"], type: "expense",
      amount: 10.99, description: "Spotify Premium",
      date: dateInMonth(m, 6), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(24) } : {}),
      merchant_name: "Spotify", category_source: "rule",
    });

    // ─── EXPENSE: Groceries (4-6 trips per month) ───
    const groceryTrips = randInt(4, 6);
    for (let g = 0; g < groceryTrips; g++) {
      const merchant = pick(groceryMerchants);
      const acct = rng() < 0.7 ? "Monzo Current" : "Starling Joint";
      txValues.push({
        account_id: acctMap[acct], category_id: catMap["Groceries"], type: "expense",
        amount: rand(18, 135), description: `${merchant} weekly shop`,
        date: dateInMonth(m, randInt(1, 28)), is_recurring: false,
        merchant_name: merchant, category_source: "merchant",
      });
    }

    // ─── EXPENSE: Dining out (3-5 per month) ───
    const diningTrips = randInt(3, 5);
    for (let d = 0; d < diningTrips; d++) {
      const merchant = pick(diningMerchants);
      txValues.push({
        account_id: acctMap["Amex Gold"], category_id: catMap["Dining Out"], type: "expense",
        amount: rand(8, 145), description: `${merchant}${rng() < 0.3 ? " - dinner" : ""}`,
        date: dateInMonth(m, randInt(1, 28)), is_recurring: false,
        merchant_name: merchant, category_source: "merchant",
      });
    }

    // ─── EXPENSE: Shopping (1-3 per month) ───
    const shoppingTrips = randInt(1, 3);
    for (let s = 0; s < shoppingTrips; s++) {
      const merchant = pick(shoppingMerchants);
      txValues.push({
        account_id: acctMap["Amex Gold"], category_id: catMap["Shopping"], type: "expense",
        amount: rand(12, 250), description: `${merchant} purchase`,
        date: dateInMonth(m, randInt(1, 28)), is_recurring: false,
        merchant_name: merchant, category_source: "merchant",
      });
    }

    // ─── EXPENSE: Transport (1-3 misc per month) ───
    const transportTrips = randInt(1, 3);
    for (let t = 0; t < transportTrips; t++) {
      txValues.push({
        account_id: acctMap["Monzo Current"], category_id: catMap["Transport"], type: "expense",
        amount: rand(5, 85), description: pick(transportItems),
        date: dateInMonth(m, randInt(1, 28)), is_recurring: false,
        category_source: "rule",
      });
    }

    // ─── EXPENSE: Entertainment (1-2 per month) ───
    const entertainmentEvents = randInt(1, 2);
    for (let e = 0; e < entertainmentEvents; e++) {
      txValues.push({
        account_id: acctMap["Amex Gold"], category_id: catMap["Entertainment"], type: "expense",
        amount: rand(10, 120), description: pick(entertainmentItems),
        date: dateInMonth(m, randInt(1, 28)), is_recurring: false,
        category_source: "ai",
      });
    }

    // ─── EXPENSE: Health (0-2 per month) ───
    const healthVisits = randInt(0, 2);
    for (let h = 0; h < healthVisits; h++) {
      txValues.push({
        account_id: acctMap["Monzo Current"], category_id: catMap["Health"], type: "expense",
        amount: rand(5, 85), description: pick(healthItems),
        date: dateInMonth(m, randInt(1, 28)), is_recurring: false,
        category_source: "ai",
      });
    }

    // ─── EXPENSE: Education (~40% of months) ───
    if (rng() < 0.4) {
      txValues.push({
        account_id: acctMap["Monzo Current"], category_id: catMap["Education"], type: "expense",
        amount: rand(10, 200), description: pick(educationItems),
        date: dateInMonth(m, randInt(1, 28)), is_recurring: false,
        category_source: "ai",
      });
    }

    // ─── EXPENSE: Gifts & Charity (~35% of months, more in Dec) ───
    const giftChance = m % 12 === 0 ? 0.9 : 0.35; // December boost
    if (rng() < giftChance) {
      const giftCount = m % 12 === 0 ? randInt(2, 5) : 1; // More gifts in Dec
      for (let gi = 0; gi < giftCount; gi++) {
        txValues.push({
          account_id: acctMap["Amex Gold"], category_id: catMap["Gifts & Charity"], type: "expense",
          amount: rand(15, 200), description: pick(giftItems),
          date: dateInMonth(m, randInt(1, 28)), is_recurring: false,
          category_source: "ai",
        });
      }
    }

    // ─── EXPENSE: Personal Care (~50% of months) ───
    if (rng() < 0.5) {
      txValues.push({
        account_id: acctMap["Monzo Current"], category_id: catMap["Personal Care"], type: "expense",
        amount: rand(15, 80), description: pick(personalCareItems),
        date: dateInMonth(m, randInt(1, 28)), is_recurring: false,
        category_source: "ai",
      });
    }

    // ─── EXPENSE: Childcare (started 8 months ago, nursery fees) ───
    if (m <= 8) {
      txValues.push({
        account_id: acctMap["Starling Joint"], category_id: catMap["Childcare"], type: "expense",
        amount: 950, description: "Little Stars Nursery",
        date: dateInMonth(m, 1), is_recurring: true, recurring_pattern: "monthly",
        ...(isCurrentMonth ? { next_recurring_date: daysFromNow(28) } : {}),
        merchant_name: "Little Stars Nursery", category_source: "rule",
      });
    }

    // ─── TRANSFER: Savings (2nd of month) ───
    const savingsAmount = m >= 18 ? 400 : m >= 6 ? 500 : 650;
    txValues.push({
      account_id: acctMap["Monzo Current"], type: "transfer",
      amount: savingsAmount, description: `Savings transfer - ${monthName(m)}`,
      date: dateInMonth(m, 2), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(28) } : {}),
      transfer_account_id: acctMap["Chase Saver"],
    });

    // ─── TRANSFER: ISA contribution (2nd of month) ───
    const isaAmount = m >= 18 ? 200 : m >= 6 ? 300 : 400;
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Investments"], type: "transfer",
      amount: isaAmount, description: `ISA contribution - ${monthName(m)}`,
      date: dateInMonth(m, 2), is_recurring: true, recurring_pattern: "monthly",
      ...(isCurrentMonth ? { next_recurring_date: daysFromNow(28) } : {}),
      transfer_account_id: acctMap["Vanguard ISA"],
    });

    // ─── TRANSFER: Marcus savings (~every other month) ───
    if (m % 2 === 0) {
      txValues.push({
        account_id: acctMap["Monzo Current"], type: "transfer",
        amount: rand(100, 500), description: `Marcus top-up - ${monthName(m)}`,
        date: dateInMonth(m, 15), is_recurring: false,
        transfer_account_id: acctMap["Marcus Savings"],
      });
    }

    // ─── EXPENSE: EUR spending on Wise (~30% of months) ───
    if (rng() < 0.3) {
      txValues.push({
        account_id: acctMap["Wise EUR"], category_id: catMap["Dining Out"], type: "expense",
        amount: rand(20, 150), description: `Restaurant in ${pick(["Paris", "Amsterdam", "Berlin", "Barcelona", "Rome", "Lisbon"])}`,
        date: dateInMonth(m, randInt(10, 25)), is_recurring: false,
        category_source: "ai",
      });
    }

    // ─── EXPENSE: USD spending on Wise (~20% of months) ───
    if (rng() < 0.2) {
      txValues.push({
        account_id: acctMap["Wise USD"], category_id: catMap["Shopping"], type: "expense",
        amount: rand(30, 200), description: `Online purchase (USD) - ${pick(["Newegg", "Best Buy", "B&H Photo", "Apple Store US"])}`,
        date: dateInMonth(m, randInt(5, 25)), is_recurring: false,
        category_source: "ai",
      });
    }

    // ─── Costco joint shop (monthly) ───
    txValues.push({
      account_id: acctMap["Starling Joint"], category_id: catMap["Groceries"], type: "expense",
      amount: rand(80, 200), description: "Costco bulk shop",
      date: dateInMonth(m, randInt(14, 20)), is_recurring: false,
      merchant_name: "Costco", category_source: "merchant",
    });
  }

  // ─── FUNNY MILESTONE PATTERNS ──────────────────────────────────────

  // ─── EXPENSE: Deliveroo habit (last 3 months, 4-5x per week) ───
  for (let w = 0; w < 13; w++) {
    const ordersThisWeek = randInt(4, 5);
    for (let d = 0; d < ordersThisWeek; d++) {
      txValues.push({
        account_id: acctMap["Monzo Current"], category_id: catMap["Dining Out"], type: "expense",
        amount: rand(8, 22), description: "Deliveroo order",
        date: daysAgo(w * 7 + d), is_recurring: false,
        merchant_name: "Deliveroo", category_source: "merchant",
      });
    }
  }

  // ─── EXPENSE: Coffee addiction (last 60 weekdays) ───
  const coffeeShops = ["Costa Coffee", "Starbucks", "Pret A Manger", "Caffe Nero", "Black Sheep Coffee"];
  for (let d = 0; d < 60; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Dining Out"], type: "expense",
      amount: rand(3, 5.5), description: `${pick(coffeeShops)} - coffee`,
      date: date.toISOString().slice(0, 10), is_recurring: false,
      merchant_name: pick(coffeeShops), category_source: "merchant",
    });
  }

  // ─── EXPENSE: Micro transactions under £5 (last 30 days) ───
  const microItems = [
    "Vending machine", "Parking meter", "Newspaper", "Chewing gum",
    "Water bottle", "Bus single", "Contactless - corner shop",
    "Bakery - pastry", "Fruit stand", "Meal deal top-up",
  ];
  for (let d = 0; d < 30; d++) {
    if (rng() < 0.75) {
      txValues.push({
        account_id: acctMap["Monzo Current"], category_id: catMap["Shopping"], type: "expense",
        amount: rand(0.80, 4.99), description: pick(microItems),
        date: daysAgo(d), is_recurring: false,
        category_source: "ai",
      });
    }
  }

  // ─── EXPENSE: Amazon shopping spree (last 2 months) ───
  const amazonItems = [
    "Amazon - tech accessories", "Amazon - kitchen gadget", "Amazon - book",
    "Amazon - household", "Amazon - electronics", "Amazon - gift",
    "Amazon - clothing", "Amazon - office supplies",
  ];
  for (let d = 0; d < 60; d += randInt(2, 5)) {
    txValues.push({
      account_id: acctMap["Amex Gold"], category_id: catMap["Shopping"], type: "expense",
      amount: rand(15, 120), description: pick(amazonItems),
      date: daysAgo(d), is_recurring: false,
      merchant_name: "Amazon", category_source: "merchant",
    });
  }

  // ─── YEARLY: Insurance payments (once per year) ───
  for (let y = 0; y < 3; y++) {
    const mOff = y * 12 + 3; // March each year
    if (mOff < MONTHS_OF_DATA) {
      for (const ins of insuranceItems) {
        txValues.push({
          account_id: acctMap["Monzo Current"], category_id: catMap["Insurance"], type: "expense",
          amount: rand(150, 650), description: ins,
          date: dateInMonth(mOff, randInt(1, 15)), is_recurring: true, recurring_pattern: "yearly",
          ...(y === 0 ? { next_recurring_date: daysFromNow(320) } : {}),
          category_source: "rule",
        });
      }
    }
  }

  // ─── WEEKLY: Pret coffee (last 6 months of Mondays) ───
  for (let w = 0; w < 26; w++) {
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Dining Out"], type: "expense",
      amount: rand(4, 6), description: "Pret coffee",
      date: daysAgo(w * 7), is_recurring: true, recurring_pattern: "weekly",
      ...(w === 0 ? { next_recurring_date: daysFromNow(7) } : {}),
      merchant_name: "Pret A Manger", category_source: "rule",
    });
  }

  // ─── REFUNDS (scattered across history) ───
  const refundDescriptions = [
    { desc: "Amazon refund - item returned", cat: "Shopping", amount: 59.99 },
    { desc: "ASOS refund - wrong size", cat: "Shopping", amount: 42.00 },
    { desc: "Uber refund - cancelled ride", cat: "Transport", amount: 15.00 },
    { desc: "Train refund - delay compensation", cat: "Transport", amount: 32.50 },
    { desc: "Netflix refund - billing error", cat: "Entertainment", amount: 15.99 },
    { desc: "Restaurant overcharge refund", cat: "Dining Out", amount: 24.50 },
    { desc: "Gym refund - closed facility", cat: "Health", amount: 39.99 },
    { desc: "John Lewis refund - faulty item", cat: "Shopping", amount: 89.99 },
    { desc: "Currys refund - price match", cat: "Shopping", amount: 30.00 },
    { desc: "Zara refund - exchange", cat: "Shopping", amount: 55.00 },
  ];
  for (const ref of refundDescriptions) {
    txValues.push({
      account_id: ref.cat === "Shopping" ? acctMap["Amex Gold"] : acctMap["Monzo Current"],
      category_id: catMap[ref.cat], type: "refund",
      amount: ref.amount, description: ref.desc,
      date: dateInMonth(randInt(0, 24), randInt(1, 28)), is_recurring: false,
    });
  }

  // ─── SALES (investment proceeds, a few per year) ───
  const saleDescriptions = [
    { desc: "Sold 5x AAPL shares", amount: 851.25, monthOff: 2 },
    { desc: "Sold 100x LLOY shares", amount: 56.00, monthOff: 8 },
    { desc: "Sold 3x NVDA shares", amount: 2420.00, monthOff: 14 },
    { desc: "Sold 10x VWRL units", amount: 962.00, monthOff: 20 },
    { desc: "Sold 0.05 BTC", amount: 3120.00, monthOff: 26 },
    { desc: "Sold 1x ETH", amount: 2850.00, monthOff: 32 },
  ];
  for (const sale of saleDescriptions) {
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Investments"], type: "sale",
      amount: sale.amount, description: sale.desc,
      date: dateInMonth(sale.monthOff, 15), is_recurring: false,
    });
  }

  // ─── One split transaction per quarter ───
  for (let q = 0; q < 12; q++) {
    txValues.push({
      account_id: acctMap["Monzo Current"], category_id: catMap["Groceries"], type: "expense",
      amount: rand(120, 220), description: `Big Tesco shop (split) Q${(q % 4) + 1}`,
      date: dateInMonth(q * 3, 13), is_recurring: false, is_split: true,
    });
  }

  // Insert all transactions in batches of 500
  const allTxInserts = txValues.map(v => ({ ...v, user_id: USER_ID }));
  let transactions: (typeof transactionsTable.$inferSelect)[] = [];
  for (let i = 0; i < allTxInserts.length; i += 500) {
    const batch = allTxInserts.slice(i, i + 500);
    const result = await db.insert(transactionsTable).values(batch).returning();
    transactions = transactions.concat(result);
  }
  console.log(`  ✓ ${transactions.length} transactions (${MONTHS_OF_DATA} months of data)`);

  // ── Transaction splits (for each split transaction) ────────────────
  const splitTxns = transactions.filter((t) => t.is_split);
  let splitCount = 0;
  for (const splitTx of splitTxns) {
    const total = Number(splitTx.amount);
    const foodPortion = +(total * rand(0.5, 0.65)).toFixed(2);
    const healthPortion = +(total * rand(0.1, 0.2)).toFixed(2);
    const shopPortion = +(total - foodPortion - healthPortion).toFixed(2);
    const splits = await db.insert(transactionSplitsTable).values([
      { transaction_id: splitTx.id, category_id: catMap["Groceries"], amount: foodPortion, description: "Food items" },
      { transaction_id: splitTx.id, category_id: catMap["Health"], amount: healthPortion, description: "Vitamins & supplements" },
      { transaction_id: splitTx.id, category_id: catMap["Shopping"], amount: shopPortion, description: "Household items" },
    ]).returning();
    splitCount += splits.length;
  }
  console.log(`  ✓ ${splitCount} transaction splits (${splitTxns.length} split transactions)`);

  // ── Budgets (expanded with new categories) ─────────────────────────
  const budgets = await db
    .insert(budgetsTable)
    .values([
      { user_id: USER_ID, category_id: catMap["Groceries"], amount: 450, period: "monthly" as const, start_date: monthsAgo(24) },
      { user_id: USER_ID, category_id: catMap["Transport"], amount: 280, period: "monthly" as const, start_date: monthsAgo(24) },
      { user_id: USER_ID, category_id: catMap["Entertainment"], amount: 200, period: "monthly" as const, start_date: monthsAgo(18) },
      { user_id: USER_ID, category_id: catMap["Dining Out"], amount: 300, period: "monthly" as const, start_date: monthsAgo(24) },
      { user_id: USER_ID, category_id: catMap["Bills & Utilities"], amount: 1800, period: "monthly" as const, start_date: monthsAgo(24) },
      { user_id: USER_ID, category_id: catMap["Health"], amount: 100, period: "monthly" as const, start_date: monthsAgo(12) },
      { user_id: USER_ID, category_id: catMap["Education"], amount: 100, period: "monthly" as const, start_date: monthsAgo(6) },
      { user_id: USER_ID, category_id: catMap["Personal Care"], amount: 60, period: "monthly" as const, start_date: monthsAgo(6) },
      { user_id: USER_ID, category_id: catMap["Childcare"], amount: 1000, period: "monthly" as const, start_date: monthsAgo(8) },
      { user_id: USER_ID, category_id: catMap["Insurance"], amount: 250, period: "monthly" as const, start_date: monthsAgo(12) },
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
      { budget_id: budgetMap["Bills & Utilities"], user_id: USER_ID, threshold: 95, browser_alerts: true, email_alerts: true },
      { budget_id: budgetMap["Childcare"], user_id: USER_ID, threshold: 100, browser_alerts: true, email_alerts: true },
      { budget_id: budgetMap["Transport"], user_id: USER_ID, threshold: 85, browser_alerts: true, email_alerts: false },
    ])
    .returning();
  console.log(`  ✓ ${alertPrefs.length} budget alert preferences`);

  // ── Budget notifications (recent month + older) ───────────────────
  const notifications = await db
    .insert(budgetNotificationsTable)
    .values([
      { user_id: USER_ID, budget_id: budgetMap["Dining Out"], alert_type: "threshold_warning" as const, message: "You've used 80% of your Dining Out budget this month.", is_read: true, emailed: false },
      { user_id: USER_ID, budget_id: budgetMap["Dining Out"], alert_type: "over_budget" as const, message: "You've exceeded your Dining Out budget for this month!", is_read: false, emailed: true },
      { user_id: USER_ID, budget_id: budgetMap["Groceries"], alert_type: "threshold_warning" as const, message: "You've used 85% of your Groceries budget this month.", is_read: false, emailed: false },
      { user_id: USER_ID, budget_id: budgetMap["Entertainment"], alert_type: "over_budget" as const, message: "Entertainment budget exceeded — concert tickets pushed it over.", is_read: false, emailed: false },
      { user_id: USER_ID, budget_id: budgetMap["Transport"], alert_type: "threshold_warning" as const, message: "Transport spending at 90% of budget.", is_read: true, emailed: false },
      { user_id: USER_ID, budget_id: budgetMap["Bills & Utilities"], alert_type: "threshold_warning" as const, message: "Bills & Utilities at 95% — energy bill was higher than usual.", is_read: false, emailed: true },
    ])
    .returning();
  console.log(`  ✓ ${notifications.length} budget notifications`);

  // ── Categorisation rules (expanded) ──────────────────────────────
  const rulePatterns: [string, string, number][] = [
    // Groceries
    ["tesco", "Groceries", 1], ["sainsbury", "Groceries", 2], ["aldi", "Groceries", 3],
    ["ocado", "Groceries", 4], ["m&s food", "Groceries", 5], ["costco", "Groceries", 6],
    ["lidl", "Groceries", 7], ["waitrose", "Groceries", 8], ["asda", "Groceries", 9],
    ["morrisons", "Groceries", 10], ["co-op", "Groceries", 11],
    // Transport
    ["uber", "Transport", 20], ["tfl", "Transport", 21], ["oyster", "Transport", 22],
    ["train", "Transport", 23], ["bolt", "Transport", 24], ["lime", "Transport", 25],
    ["national express", "Transport", 26],
    // Entertainment
    ["netflix", "Entertainment", 30], ["spotify", "Entertainment", 31],
    ["vue cinema", "Entertainment", 32], ["concert", "Entertainment", 33],
    ["odeon", "Entertainment", 34], ["theatre", "Entertainment", 35],
    // Shopping
    ["amazon", "Shopping", 40], ["asos", "Shopping", 41], ["tk maxx", "Shopping", 42],
    ["currys", "Shopping", 43], ["uniqlo", "Shopping", 44], ["john lewis", "Shopping", 45],
    ["whsmith", "Shopping", 46], ["argos", "Shopping", 47], ["zara", "Shopping", 48],
    ["h&m", "Shopping", 49], ["ikea", "Shopping", 50], ["superdrug", "Shopping", 51],
    // Dining Out
    ["pret", "Dining Out", 60], ["dishoom", "Dining Out", 61], ["nando", "Dining Out", 62],
    ["wagamama", "Dining Out", 63], ["five guys", "Dining Out", 64],
    ["pizza express", "Dining Out", 65], ["hawksmoor", "Dining Out", 66],
    ["nobu", "Dining Out", 67], ["leon", "Dining Out", 68], ["itsu", "Dining Out", 69],
    ["franco manca", "Dining Out", 70], ["honest burgers", "Dining Out", 71],
    ["chipotle", "Dining Out", 72], ["gbk", "Dining Out", 73],
    // Health
    ["puregym", "Health", 80], ["boots pharmacy", "Health", 81], ["pharmacy", "Health", 82],
    ["holland & barrett", "Health", 83], ["dentist", "Health", 84], ["optician", "Health", 85],
    // Bills & Utilities
    ["edf", "Bills & Utilities", 90], ["sky", "Bills & Utilities", 91],
    ["three mobile", "Bills & Utilities", 92], ["thames water", "Bills & Utilities", 93],
    ["council tax", "Bills & Utilities", 94], ["admiral", "Bills & Utilities", 95],
    ["broadband", "Bills & Utilities", 96], ["rent", "Bills & Utilities", 97],
    // Education
    ["udemy", "Education", 100], ["coursera", "Education", 101], ["pluralsight", "Education", 102],
    // Gifts & Charity
    ["justgiving", "Gifts & Charity", 110], ["unicef", "Gifts & Charity", 111],
    ["macmillan", "Gifts & Charity", 112],
    // Personal Care
    ["barber", "Personal Care", 120], ["dry cleaning", "Personal Care", 121],
    // Childcare
    ["nursery", "Childcare", 130],
    // Insurance
    ["admiral", "Insurance", 140], ["life insurance", "Insurance", 141],
    ["travel insurance", "Insurance", 142], ["pet insurance", "Insurance", 143],
  ];
  const rules = await db
    .insert(categorisationRulesTable)
    .values(rulePatterns.map(([pattern, cat, priority]) => ({
      user_id: USER_ID, pattern, category_id: catMap[cat], priority,
    })))
    .returning();
  console.log(`  ✓ ${rules.length} categorisation rules`);

  // ── Merchant mappings ──────────────────────────────────────────────
  const merchantMappingDefs: [string, string][] = [
    ["Tesco", "Groceries"], ["Sainsbury's", "Groceries"], ["Aldi", "Groceries"],
    ["Lidl", "Groceries"], ["Ocado", "Groceries"], ["M&S Food", "Groceries"],
    ["Waitrose", "Groceries"], ["Asda", "Groceries"], ["Morrisons", "Groceries"],
    ["Co-op", "Groceries"], ["Costco", "Groceries"],
    ["Pret A Manger", "Dining Out"], ["Dishoom", "Dining Out"], ["Wagamama", "Dining Out"],
    ["Nando's", "Dining Out"], ["Five Guys", "Dining Out"], ["Pizza Express", "Dining Out"],
    ["Leon", "Dining Out"], ["Itsu", "Dining Out"], ["Franco Manca", "Dining Out"],
    ["Amazon", "Shopping"], ["ASOS", "Shopping"], ["Uniqlo", "Shopping"],
    ["John Lewis", "Shopping"], ["Currys", "Shopping"], ["TK Maxx", "Shopping"],
    ["Zara", "Shopping"], ["H&M", "Shopping"], ["IKEA", "Shopping"],
    ["Netflix", "Entertainment"], ["Spotify", "Entertainment"],
    ["PureGym", "Health"], ["TfL", "Transport"],
    ["EDF Energy", "Bills & Utilities"], ["Sky Broadband", "Bills & Utilities"],
    ["Three Mobile", "Bills & Utilities"], ["Thames Water", "Bills & Utilities"],
    ["Little Stars Nursery", "Childcare"], ["Acme Corp Ltd", "Salary"],
    ["Deliveroo", "Dining Out"], ["Costa Coffee", "Dining Out"],
    ["Starbucks", "Dining Out"], ["Caffe Nero", "Dining Out"],
    ["Black Sheep Coffee", "Dining Out"],
  ];
  const merchantRows = await db
    .insert(merchantMappingsTable)
    .values(merchantMappingDefs.map(([merchant, cat]) => ({
      user_id: USER_ID, merchant, category_id: catMap[cat], source: "correction" as const,
    })))
    .returning();
  console.log(`  ✓ ${merchantRows.length} merchant mappings`);

  // ── Goals (expanded) ──────────────────────────────────────────────
  const goals = await db
    .insert(goalsTable)
    .values([
      { user_id: USER_ID, name: "Emergency Fund", target_amount: 15000, saved_amount: 9200, target_date: daysFromNow(180), icon: "Shield", color: "#22c55e" },
      { user_id: USER_ID, name: "Holiday - Japan", target_amount: 5000, saved_amount: 3800, target_date: daysFromNow(200), icon: "Plane", color: "#3b82f6" },
      { user_id: USER_ID, name: "New Laptop", target_amount: 2500, saved_amount: 2500, target_date: daysFromNow(0), icon: "Laptop", color: "#a855f7" },
      { user_id: USER_ID, name: "House Deposit", target_amount: 60000, saved_amount: 24500, target_date: daysFromNow(730), icon: "Home", color: "#f97316" },
      { user_id: USER_ID, name: "New Phone", target_amount: 1200, saved_amount: 1200, target_date: daysFromNow(0), icon: "Smartphone", color: "#06b6d4" },
      { user_id: USER_ID, name: "Rainy Day Fund", target_amount: 3000, saved_amount: 1650, icon: "Umbrella", color: "#64748b" },
      { user_id: USER_ID, name: "Wedding Fund", target_amount: 25000, saved_amount: 8200, target_date: daysFromNow(540), icon: "Heart", color: "#ec4899" },
      { user_id: USER_ID, name: "Baby Fund", target_amount: 10000, saved_amount: 4500, target_date: daysFromNow(365), icon: "Baby", color: "#fb923c" },
      { user_id: USER_ID, name: "Car Replacement", target_amount: 20000, saved_amount: 6800, target_date: daysFromNow(900), icon: "Car", color: "#0ea5e9" },
      { user_id: USER_ID, name: "Course: MBA", target_amount: 35000, saved_amount: 5000, target_date: daysFromNow(1460), icon: "GraduationCap", color: "#8b5cf6" },
    ])
    .returning();
  console.log(`  ✓ ${goals.length} goals`);

  // ── Debts (expanded with credit card debt + 0% balance transfer) ──
  const debts = await db
    .insert(debtsTable)
    .values([
      { user_id: USER_ID, name: "Student Loan", original_amount: 42000, remaining_amount: 28500, interest_rate: 6.3, minimum_payment: 150, due_date: daysFromNow(15), lender: "Student Loans Company", color: "#ef4444" },
      { user_id: USER_ID, name: "Car Finance", original_amount: 15000, remaining_amount: 8200, interest_rate: 4.9, minimum_payment: 285, due_date: daysFromNow(10), lender: "Black Horse", color: "#f97316" },
      { user_id: USER_ID, name: "Personal Loan", original_amount: 5000, remaining_amount: 1200, interest_rate: 3.4, minimum_payment: 200, due_date: daysFromNow(20), lender: "Monzo", color: "#eab308" },
      { user_id: USER_ID, name: "Amex Balance", original_amount: 3500, remaining_amount: 1243.67, interest_rate: 22.9, minimum_payment: 50, due_date: daysFromNow(22), lender: "American Express", color: "#2563eb" },
      { user_id: USER_ID, name: "0% Balance Transfer", original_amount: 4000, remaining_amount: 2100, interest_rate: 0, minimum_payment: 100, due_date: daysFromNow(180), lender: "Barclaycard", color: "#14b8a6" },
    ])
    .returning();
  console.log(`  ✓ ${debts.length} debts`);

  // ── Debt payments (36 months for student loan & car, 24 for personal) ──
  const debtPaymentValues: { debt_id: string; account_id: string; amount: number; date: string; note: string }[] = [];
  // Student loan: 36 months
  for (let m = 0; m < MONTHS_OF_DATA; m++) {
    debtPaymentValues.push({
      debt_id: debts[0].id, account_id: acctMap["Monzo Current"],
      amount: 150, date: dateInMonth(m, 20),
      note: `Student loan - ${monthName(m)}`,
    });
  }
  // Car finance: 30 months (started 30 months ago)
  for (let m = 0; m < 30; m++) {
    debtPaymentValues.push({
      debt_id: debts[1].id, account_id: acctMap["Monzo Current"],
      amount: 285, date: dateInMonth(m, 18),
      note: `Car finance - ${monthName(m)}`,
    });
  }
  // Personal loan: 20 months (nearly paid off)
  for (let m = 0; m < 20; m++) {
    debtPaymentValues.push({
      debt_id: debts[2].id, account_id: acctMap["Monzo Current"],
      amount: 200, date: dateInMonth(m, 22),
      note: `Personal loan - ${monthName(m)}`,
    });
  }
  // Extra lump-sum payments on personal loan
  debtPaymentValues.push(
    { debt_id: debts[2].id, account_id: acctMap["Monzo Current"], amount: 500, date: dateInMonth(6, 15), note: "Extra payment - bonus" },
    { debt_id: debts[2].id, account_id: acctMap["Monzo Current"], amount: 400, date: dateInMonth(12, 10), note: "Extra payment toward personal loan" },
  );
  // Amex minimum payments: 12 months
  for (let m = 0; m < 12; m++) {
    debtPaymentValues.push({
      debt_id: debts[3].id, account_id: acctMap["Monzo Current"],
      amount: m < 6 ? 50 : rand(75, 200), date: dateInMonth(m, 25),
      note: `Amex payment - ${monthName(m)}`,
    });
  }
  // Balance transfer: 10 months
  for (let m = 0; m < 10; m++) {
    debtPaymentValues.push({
      debt_id: debts[4].id, account_id: acctMap["Monzo Current"],
      amount: 190, date: dateInMonth(m, 5),
      note: `Balance transfer - ${monthName(m)}`,
    });
  }
  const debtPayments = await db.insert(debtPaymentsTable).values(debtPaymentValues).returning();
  console.log(`  ✓ ${debtPayments.length} debt payments`);

  // ── Investment groups (added Crypto + Alternatives) ────────────────
  const investmentGroups = await db
    .insert(investmentGroupsTable)
    .values([
      { user_id: USER_ID, account_id: acctMap["Vanguard ISA"], name: "Tech Stocks", color: "#6366f1", icon: "Cpu", sort_order: 1 },
      { user_id: USER_ID, account_id: acctMap["Vanguard ISA"], name: "Index Funds", color: "#22c55e", icon: "BarChart3", sort_order: 2 },
      { user_id: USER_ID, account_id: acctMap["Vanguard ISA"], name: "UK Equities", color: "#3b82f6", icon: "Building2", sort_order: 3 },
      { user_id: USER_ID, name: "Crypto", color: "#f59e0b", icon: "Bitcoin", sort_order: 4 },
      { user_id: USER_ID, name: "Alternatives", color: "#8b5cf6", icon: "Gem", sort_order: 5 },
    ])
    .returning();
  console.log(`  ✓ ${investmentGroups.length} investment groups`);

  const groupMap = Object.fromEntries(investmentGroups.map((g) => [g.name, g.id]));

  // ── Manual holdings (expanded with more stocks + grouped crypto) ───
  const holdings = await db
    .insert(manualHoldingsTable)
    .values([
      { user_id: USER_ID, ticker: "AAPL", name: "Apple Inc.", quantity: 15, average_price: 142.50, current_price: 178.30, currency: "USD", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Tech Stocks"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "MSFT", name: "Microsoft Corp.", quantity: 10, average_price: 285.00, current_price: 412.60, currency: "USD", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Tech Stocks"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "NVDA", name: "NVIDIA Corp.", quantity: 8, average_price: 450.00, current_price: 875.40, currency: "USD", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Tech Stocks"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "GOOGL", name: "Alphabet Inc.", quantity: 5, average_price: 125.00, current_price: 172.80, currency: "USD", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Tech Stocks"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "AMZN", name: "Amazon.com Inc.", quantity: 12, average_price: 135.00, current_price: 186.50, currency: "USD", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Tech Stocks"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "VWRL", name: "Vanguard FTSE All-World ETF", quantity: 80, average_price: 82.40, current_price: 96.20, currency: "GBP", investment_type: "etf" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Index Funds"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "VUSA", name: "Vanguard S&P 500 ETF", quantity: 45, average_price: 62.10, current_price: 78.50, currency: "GBP", investment_type: "etf" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Index Funds"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "VHYL", name: "Vanguard High Dividend Yield ETF", quantity: 30, average_price: 48.20, current_price: 55.80, currency: "GBP", investment_type: "etf" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["Index Funds"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "LLOY", name: "Lloyds Banking Group", quantity: 500, average_price: 0.48, current_price: 0.56, currency: "GBP", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["UK Equities"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "BP", name: "BP plc", quantity: 200, average_price: 4.80, current_price: 5.15, currency: "GBP", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["UK Equities"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "GSK", name: "GSK plc", quantity: 150, average_price: 14.20, current_price: 16.85, currency: "GBP", investment_type: "stock" as const, account_id: acctMap["Vanguard ISA"], group_id: groupMap["UK Equities"], last_price_update: new Date() },
      { user_id: USER_ID, ticker: "BTC", name: "Bitcoin", quantity: 0.15, average_price: 28500, current_price: 62400, currency: "USD", investment_type: "crypto" as const, group_id: groupMap["Crypto"], notes: "Self-custody cold wallet" },
      { user_id: USER_ID, ticker: "ETH", name: "Ethereum", quantity: 2.5, average_price: 1650, current_price: 3420, currency: "USD", investment_type: "crypto" as const, group_id: groupMap["Crypto"], notes: "Coinbase" },
      { user_id: USER_ID, ticker: "SOL", name: "Solana", quantity: 25, average_price: 22.00, current_price: 145.00, currency: "USD", investment_type: "crypto" as const, group_id: groupMap["Crypto"], notes: "Phantom wallet" },
      { user_id: USER_ID, name: "Seedrs - FinTech Fund", quantity: 1, average_price: 5000, current_price: 5800, currency: "GBP", investment_type: "private_equity" as const, estimated_return_percent: 12.0, group_id: groupMap["Alternatives"], notes: "Seedrs fund of 8 early-stage FinTech startups" },
      { user_id: USER_ID, name: "BTL Property - Manchester", quantity: 1, average_price: 185000, current_price: 210000, currency: "GBP", investment_type: "real_estate" as const, estimated_return_percent: 6.2, group_id: groupMap["Alternatives"], notes: "2-bed flat, Ancoats. Rental yield ~6.2%" },
    ])
    .returning();
  console.log(`  ✓ ${holdings.length} manual holdings`);

  // ── Holding sales (spread across 3 years) ──────────────────────────
  const sales = await db
    .insert(holdingSalesTable)
    .values([
      { holding_id: holdings.find((h) => h.ticker === "AAPL")!.id, user_id: USER_ID, date: dateInMonth(2, 15), quantity: 5, price_per_unit: 170.25, realized_gain: 138.75, cash_account_id: acctMap["Monzo Current"], notes: "Partial profit-taking" },
      { holding_id: holdings.find((h) => h.ticker === "LLOY")!.id, user_id: USER_ID, date: dateInMonth(8, 10), quantity: 200, price_per_unit: 0.53, realized_gain: 10, cash_account_id: acctMap["Monzo Current"], notes: "Rebalancing UK equities" },
      { holding_id: holdings.find((h) => h.ticker === "NVDA")!.id, user_id: USER_ID, date: dateInMonth(14, 20), quantity: 3, price_per_unit: 720.00, realized_gain: 810.00, cash_account_id: acctMap["Monzo Current"], notes: "Lock in NVDA gains" },
      { holding_id: holdings.find((h) => h.ticker === "VWRL")!.id, user_id: USER_ID, date: dateInMonth(20, 12), quantity: 10, price_per_unit: 91.50, realized_gain: 91.00, cash_account_id: acctMap["Monzo Current"], notes: "Rebalancing" },
      { holding_id: holdings.find((h) => h.ticker === "BTC")!.id, user_id: USER_ID, date: dateInMonth(26, 8), quantity: 0.05, price_per_unit: 58000, realized_gain: 1475.00, cash_account_id: acctMap["Monzo Current"], notes: "Took some BTC profits" },
      { holding_id: holdings.find((h) => h.ticker === "ETH")!.id, user_id: USER_ID, date: dateInMonth(32, 18), quantity: 1, price_per_unit: 2850, realized_gain: 1200.00, cash_account_id: acctMap["Monzo Current"], notes: "ETH partial exit" },
      { holding_id: holdings.find((h) => h.ticker === "SOL")!.id, user_id: USER_ID, date: dateInMonth(5, 22), quantity: 10, price_per_unit: 130, realized_gain: 1080.00, cash_account_id: acctMap["Monzo Current"], notes: "SOL profit-taking" },
    ])
    .returning();
  console.log(`  ✓ ${sales.length} holding sales`);

  // ── Subscriptions (expanded) ──────────────────────────────────────
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
      { user_id: USER_ID, name: "ChatGPT Plus", amount: 20.00, currency: "USD", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(12), category_id: catMap["Education"], account_id: acctMap["Amex Gold"], url: "https://chat.openai.com", color: "#10a37f", icon: "Bot" },
      { user_id: USER_ID, name: "Hover Domain Renewal", amount: 45.00, currency: "GBP", billing_cycle: "quarterly" as const, next_billing_date: daysFromNow(60), category_id: catMap["Bills & Utilities"], account_id: acctMap["Monzo Current"], url: "https://hover.com", color: "#333333", icon: "Globe" },
      { user_id: USER_ID, name: "Disney+", amount: 7.99, currency: "GBP", billing_cycle: "monthly" as const, next_billing_date: daysAgo(15), category_id: catMap["Entertainment"], account_id: acctMap["Amex Gold"], url: "https://disneyplus.com", color: "#113ccf", icon: "Film", is_active: false },
      { user_id: USER_ID, name: "YouTube Premium", amount: 12.99, currency: "GBP", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(15), category_id: catMap["Entertainment"], account_id: acctMap["Amex Gold"], url: "https://youtube.com/premium", color: "#ff0000", icon: "Youtube" },
      { user_id: USER_ID, name: "Coursera Plus", amount: 49.00, currency: "USD", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(8), category_id: catMap["Education"], account_id: acctMap["Amex Gold"], url: "https://coursera.org", color: "#0056d2", icon: "GraduationCap" },
      { user_id: USER_ID, name: "Little Stars Nursery", amount: 950.00, currency: "GBP", billing_cycle: "monthly" as const, next_billing_date: daysFromNow(28), category_id: catMap["Childcare"], account_id: acctMap["Starling Joint"], color: "#fb923c", icon: "Baby" },
      { user_id: USER_ID, name: "Headspace", amount: 9.99, currency: "GBP", billing_cycle: "monthly" as const, next_billing_date: daysAgo(45), category_id: catMap["Health"], account_id: acctMap["Monzo Current"], url: "https://headspace.com", color: "#f97316", icon: "Brain", is_active: false },
    ])
    .returning();
  console.log(`  ✓ ${subscriptions.length} subscriptions`);

  // ── Net worth snapshots (36 months with realistic growth curve) ────
  const snapshotValues = Array.from({ length: MONTHS_OF_DATA }, (_, i) => {
    const monthOffset = MONTHS_OF_DATA - 1 - i;
    // Gradual growth with some seasonal dips (post-Christmas, summer holidays)
    const seasonalDip = (monthOffset % 12 === 1) ? -3000 : (monthOffset % 12 === 7) ? -1500 : 0;
    const baseAssets = 35000 + i * 1600 + seasonalDip;
    const baseLiabilities = 42000 - i * 500;
    const investmentGrowth = 22000 + i * 680 + (i > 18 ? i * 200 : 0); // accelerating investment growth
    return {
      user_id: USER_ID,
      date: monthsAgo(monthOffset),
      net_worth: baseAssets - baseLiabilities + investmentGrowth,
      total_assets: baseAssets + investmentGrowth,
      total_liabilities: baseLiabilities,
      investment_value: investmentGrowth,
    };
  });
  const snapshots = await db.insert(netWorthSnapshotsTable).values(snapshotValues).returning();
  console.log(`  ✓ ${snapshots.length} net worth snapshots`);

  // ── Zakat settings & multiple historical calculations ──────────────
  await db.insert(zakatSettingsTable).values({
    user_id: USER_ID,
    anniversary_date: daysFromNow(45),
    nisab_type: "gold",
    use_lunar_calendar: false,
  });
  console.log("  ✓ zakat settings");

  const zakatCalcValues = [
    {
      user_id: USER_ID, is_auto: false, nisab_value: 5686,
      total_assets: 24535.80, cash_and_savings: 24535.80, investment_value: 0,
      total_liabilities: 1243.67, debt_deductions: 40043.67,
      zakatable_amount: 0, zakat_due: 0, above_nisab: false,
      breakdown_json: {
        accounts: [
          { name: "Monzo Current", type: "currentAccount", balance: 3285.47 },
          { name: "Chase Saver", type: "savings", balance: 18750 },
          { name: "Starling Joint", type: "currentAccount", balance: 2120.33 },
          { name: "Marcus Savings", type: "savings", balance: 8500 },
        ],
        debts: [
          { name: "Student Loan", remainingAmount: 28500 },
          { name: "Car Finance", remainingAmount: 8200 },
          { name: "Personal Loan", remainingAmount: 1200 },
          { name: "Amex Balance", remainingAmount: 1243.67 },
          { name: "0% Balance Transfer", remainingAmount: 2100 },
        ],
      },
    },
    {
      user_id: USER_ID, is_auto: true, nisab_value: 5200,
      total_assets: 18200.50, cash_and_savings: 18200.50, investment_value: 0,
      total_liabilities: 900.00, debt_deductions: 35900,
      zakatable_amount: 0, zakat_due: 0, above_nisab: false,
      breakdown_json: {
        accounts: [
          { name: "Monzo Current", type: "currentAccount", balance: 2100 },
          { name: "Chase Saver", type: "savings", balance: 14500 },
          { name: "Starling Joint", type: "currentAccount", balance: 1600.50 },
        ],
        debts: [
          { name: "Student Loan", remainingAmount: 30000 },
          { name: "Car Finance", remainingAmount: 10000 },
          { name: "Personal Loan", remainingAmount: 3000 },
        ],
      },
    },
    {
      user_id: USER_ID, is_auto: true, nisab_value: 4950,
      total_assets: 12500.00, cash_and_savings: 12500.00, investment_value: 0,
      total_liabilities: 500.00, debt_deductions: 38500,
      zakatable_amount: 0, zakat_due: 0, above_nisab: false,
      breakdown_json: {
        accounts: [
          { name: "Monzo Current", type: "currentAccount", balance: 1800 },
          { name: "Chase Saver", type: "savings", balance: 9200 },
          { name: "Starling Joint", type: "currentAccount", balance: 1500 },
        ],
        debts: [
          { name: "Student Loan", remainingAmount: 32000 },
          { name: "Car Finance", remainingAmount: 12500 },
          { name: "Personal Loan", remainingAmount: 4500 },
        ],
      },
    },
  ];
  for (const calc of zakatCalcValues) {
    await db.insert(zakatCalculationsTable).values(calc);
  }
  console.log(`  ✓ ${zakatCalcValues.length} zakat calculations`);

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

  // ── User preferences ──────────────────────────────────────────────
  await db.insert(userPreferencesTable).values({
    user_id: USER_ID,
    disabled_features: null,
  }).onConflictDoNothing();
  console.log("  ✓ user preferences");

  // ── Link transactions to subscriptions (all Netflix + Spotify txns) ─
  const subMap = Object.fromEntries(subscriptions.map((s) => [s.name, s.id]));
  const netflixTxns = transactions.filter((t) => t.description === "Netflix" && t.type === "expense");
  const spotifyTxns = transactions.filter((t) => t.description === "Spotify Premium" && t.type === "expense");
  const pureGymTxns = transactions.filter((t) => t.description === "PureGym membership" && t.type === "expense");
  const skyTxns = transactions.filter((t) => t.description === "Sky Broadband" && t.type === "expense");
  const threeTxns = transactions.filter((t) => t.description === "Three Mobile" && t.type === "expense");
  const nurseryTxns = transactions.filter((t) => t.description === "Little Stars Nursery" && t.type === "expense");

  const subLinks: { txIds: string[]; subName: string }[] = [
    { txIds: netflixTxns.map(t => t.id), subName: "Netflix Standard" },
    { txIds: spotifyTxns.map(t => t.id), subName: "Spotify Premium" },
    { txIds: pureGymTxns.map(t => t.id), subName: "PureGym" },
    { txIds: skyTxns.map(t => t.id), subName: "Sky Broadband" },
    { txIds: threeTxns.map(t => t.id), subName: "Three Mobile" },
    { txIds: nurseryTxns.map(t => t.id), subName: "Little Stars Nursery" },
  ];
  let linkedCount = 0;
  for (const link of subLinks) {
    if (!subMap[link.subName]) continue;
    for (const txId of link.txIds) {
      await db.update(transactionsTable)
        .set({ subscription_id: subMap[link.subName] })
        .where(eq(transactionsTable.id, txId));
      linkedCount++;
    }
  }
  console.log(`  ✓ ${linkedCount} transactions linked → subscriptions`);

  // ── Transaction review flags ──────────────────────────────────────
  const netflixSub = subscriptions.find((s) => s.name === "Netflix Standard");
  const possibleSubTxn = transactions.find((t) => t.description === "PureGym membership" && !t.subscription_id);

  type ReviewFlag = {
    user_id: string; transaction_id: string;
    flag_type: "subscription_amount_mismatch" | "possible_debt_payment" | "possible_subscription";
    suggested_subscription_id?: string; suggested_debt_id?: string;
    expected_amount?: number; actual_amount: number;
  };
  const reviewFlagValues: ReviewFlag[] = [];

  if (netflixSub) {
    const mismatchTx = transactions.find((t) => t.description === "Netflix" && t.type === "expense");
    if (mismatchTx) {
      reviewFlagValues.push({
        user_id: USER_ID, transaction_id: mismatchTx.id,
        flag_type: "subscription_amount_mismatch",
        suggested_subscription_id: netflixSub.id,
        expected_amount: 15.99, actual_amount: 17.99,
      });
    }
  }
  if (possibleSubTxn) {
    const pureGymSub = subscriptions.find((s) => s.name === "PureGym");
    reviewFlagValues.push({
      user_id: USER_ID, transaction_id: possibleSubTxn.id,
      flag_type: "possible_subscription",
      suggested_subscription_id: pureGymSub?.id,
      expected_amount: 39.99, actual_amount: 39.99,
    });
  }
  // Flag a dining out txn as possible debt payment
  const possibleDebtTxn = transactions.find((t) => t.description?.includes("Wagamama") && t.type === "expense");
  if (possibleDebtTxn) {
    reviewFlagValues.push({
      user_id: USER_ID, transaction_id: possibleDebtTxn.id,
      flag_type: "possible_debt_payment",
      suggested_debt_id: debts[2].id,
      expected_amount: 200, actual_amount: Number(possibleDebtTxn.amount),
    });
  }

  if (reviewFlagValues.length > 0) {
    const flags = await db.insert(transactionReviewFlagsTable).values(reviewFlagValues).returning();
    console.log(`  ✓ ${flags.length} transaction review flags`);
  }

  // ── Shared access (pending invitations) ───────────────────────────
  const sharedRows = await db
    .insert(sharedAccessTable)
    .values([
      { owner_id: "00000000-0000-0000-0000-000000000001", shared_with_email: "dev@balancevisor.local", resource_type: "account" as const, resource_id: accounts[0].id, permission: "view" as const, status: "pending" as const },
      { owner_id: "00000000-0000-0000-0000-000000000002", shared_with_email: "dev@balancevisor.local", resource_type: "budget" as const, resource_id: budgets[0].id, permission: "edit" as const, status: "pending" as const },
    ])
    .returning();
  console.log(`  ✓ ${sharedRows.length} shared access invitations`);

  // ── Dashboard layouts (all pages) ─────────────────────────────────
  const layouts = [
    { page: "dashboard", widgets: [
      { widgetId: "insights", visible: true }, { widgetId: "monthly-report", visible: true },
      { widgetId: "net-worth", visible: true }, { widgetId: "net-worth-history", visible: true },
      { widgetId: "cashflow", visible: true }, { widgetId: "cashflow-forecast", visible: true },
      { widgetId: "anomalies", visible: true }, { widgetId: "weekly-digest", visible: true },
      { widgetId: "upcoming-bills", visible: true }, { widgetId: "budget-progress", visible: true },
      { widgetId: "category-spend", visible: true }, { widgetId: "recent-transactions", visible: true },
      { widgetId: "zakat-summary", visible: true }, { widgetId: "retirement", visible: true },
    ]},
    { page: "accounts", widgets: [
      { widgetId: "pending-invitations", visible: true }, { widgetId: "stats", visible: true },
      { widgetId: "charts", visible: true }, { widgetId: "account-cards", visible: true },
      { widgetId: "health-check", visible: true },
    ]},
    { page: "budgets", widgets: [
      { widgetId: "pending-invitations", visible: true }, { widgetId: "stats", visible: true },
      { widgetId: "suggestions", visible: true }, { widgetId: "charts", visible: true },
      { widgetId: "budget-cards", visible: true },
    ]},
    { page: "categories", widgets: [
      { widgetId: "charts", visible: true }, { widgetId: "all-categories", visible: true },
      { widgetId: "auto-rules", visible: true },
    ]},
    { page: "debts", widgets: [
      { widgetId: "overview", visible: true }, { widgetId: "debt-cards", visible: true },
      { widgetId: "payoff-strategies", visible: true }, { widgetId: "ai-advisor", visible: true },
    ]},
    { page: "goals", widgets: [
      { widgetId: "overview", visible: true }, { widgetId: "forecasts", visible: true },
      { widgetId: "goals-grid", visible: true },
    ]},
    { page: "investments", widgets: [
      { widgetId: "broker-errors", visible: true }, { widgetId: "summary-cards", visible: true },
      { widgetId: "charts", visible: true }, { widgetId: "ai-analysis", visible: true },
      { widgetId: "holdings-table", visible: true },
    ]},
    { page: "recurring", widgets: [
      { widgetId: "stats", visible: true }, { widgetId: "recurring-list", visible: true },
    ]},
    { page: "reports", widgets: [
      { widgetId: "ai-monthly-report", visible: true }, { widgetId: "savings-rate", visible: true },
      { widgetId: "kpi-stats", visible: true }, { widgetId: "income-vs-expenses", visible: true },
      { widgetId: "net-savings-trend", visible: true }, { widgetId: "spending-by-category", visible: true },
      { widgetId: "monthly-category-breakdown", visible: true }, { widgetId: "top-categories", visible: true },
    ]},
    { page: "subscriptions", widgets: [
      { widgetId: "stats", visible: true }, { widgetId: "subscription-cards", visible: true },
      { widgetId: "ai-advisor", visible: true },
    ]},
    { page: "zakat", widgets: [
      { widgetId: "countdown", visible: true }, { widgetId: "summary-cards", visible: true },
      { widgetId: "nisab-status", visible: true }, { widgetId: "breakdown", visible: true },
      { widgetId: "formula", visible: true }, { widgetId: "history", visible: true },
    ]},
    { page: "retirement", widgets: [
      { widgetId: "countdown", visible: true }, { widgetId: "progress", visible: true },
      { widgetId: "snapshot", visible: true }, { widgetId: "projection-chart", visible: true },
      { widgetId: "scenarios", visible: true }, { widgetId: "ai-advisor", visible: true },
    ]},
    { page: "transactions", widgets: [
      { widgetId: "review-banners", visible: true }, { widgetId: "transactions-client", visible: true },
    ]},
  ];

  await db.insert(dashboardLayoutsTable).values(
    layouts.map((l) => ({ user_id: USER_ID, page: l.page, layout_json: JSON.stringify(l.widgets) }))
  );
  console.log(`  ✓ ${layouts.length} dashboard layouts (all pages)`);

  console.log("\n✅ Seed complete!");
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
