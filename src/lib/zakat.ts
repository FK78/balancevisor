import { db } from "@/index";
import { accountsTable, debtsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getInvestmentValue } from "@/lib/investment-value";

// Zakat rate: 2.5% of net zakatable wealth
const ZAKAT_RATE = 0.025;

// Nisab thresholds (approximate — ideally fetched live)
// Gold nisab: 87.48g of gold
// Silver nisab: 612.36g of silver
const GOLD_NISAB_GRAMS = 87.48;
const SILVER_NISAB_GRAMS = 612.36;

// Fallback prices per gram in GBP (updated periodically)
const FALLBACK_GOLD_PRICE_PER_GRAM = 65;
const FALLBACK_SILVER_PRICE_PER_GRAM = 0.65;

export type ZakatBreakdown = {
  cashAndSavings: number;
  investmentValue: number;
  totalAssets: number;
  totalLiabilities: number;
  debtDeductions: number;
  zakatableAmount: number;
  zakatDue: number;
  nisabValue: number;
  aboveNisab: boolean;
  accounts: { name: string; type: string | null; balance: number }[];
  debts: { name: string; remainingAmount: number }[];
};

export async function getNisabValue(
  nisabType: string = "gold"
): Promise<number> {
  // In a production app you'd fetch live gold/silver prices here.
  // For now we use reasonable fallback values.
  if (nisabType === "silver") {
    return SILVER_NISAB_GRAMS * FALLBACK_SILVER_PRICE_PER_GRAM;
  }
  return GOLD_NISAB_GRAMS * FALLBACK_GOLD_PRICE_PER_GRAM;
}

export async function calculateZakat(
  userId: string,
  nisabType: string = "gold"
): Promise<ZakatBreakdown> {
  // 1. Fetch accounts
  const accounts = await db
    .select({
      name: accountsTable.name,
      type: accountsTable.type,
      balance: accountsTable.balance,
    })
    .from(accountsTable)
    .where(eq(accountsTable.user_id, userId));

  // 2. Fetch debts (active only)
  const debts = await db
    .select({
      name: debtsTable.name,
      remaining_amount: debtsTable.remaining_amount,
      is_paid_off: debtsTable.is_paid_off,
    })
    .from(debtsTable)
    .where(eq(debtsTable.user_id, userId));

  const activeDebts = debts.filter((d) => !d.is_paid_off);

  // 3. Categorise accounts
  const liabilityTypes = new Set(["creditCard"]);

  const cashAndSavings = accounts
    .filter((a) => !liabilityTypes.has(a.type ?? "") && a.type !== "investment")
    .reduce((sum, a) => sum + a.balance, 0);

  const accountLiabilities = accounts
    .filter((a) => liabilityTypes.has(a.type ?? ""))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  // 4. Investment value (Trading 212 + manual holdings)
  let investmentVal = 0;
  try {
    investmentVal = await getInvestmentValue(userId);
  } catch {
    /* skip if fetch fails */
  }

  // 5. Debt deductions — short-term debts that are due within the next 12 months
  // For simplicity we deduct all active debt remaining amounts
  const debtDeductions = activeDebts.reduce(
    (sum, d) => sum + d.remaining_amount,
    0
  );

  // 6. Calculate totals
  const totalAssets = cashAndSavings + investmentVal;
  const totalLiabilities = accountLiabilities + debtDeductions;
  const zakatableAmount = Math.max(totalAssets - totalLiabilities, 0);

  // 7. Nisab check
  const nisabValue = await getNisabValue(nisabType);
  const aboveNisab = zakatableAmount >= nisabValue;

  // 8. Zakat due
  const zakatDue = aboveNisab ? zakatableAmount * ZAKAT_RATE : 0;

  return {
    cashAndSavings,
    investmentValue: investmentVal,
    totalAssets,
    totalLiabilities: accountLiabilities,
    debtDeductions,
    zakatableAmount,
    zakatDue,
    nisabValue,
    aboveNisab,
    accounts: accounts.map((a) => ({
      name: a.name,
      type: a.type,
      balance: a.balance,
    })),
    debts: activeDebts.map((d) => ({
      name: d.name,
      remainingAmount: d.remaining_amount,
    })),
  };
}
