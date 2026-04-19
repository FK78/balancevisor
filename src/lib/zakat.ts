import { db } from "@/index";
import { accountsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getInvestmentValue } from "@/lib/investment-value";
import { fetchGoldPrice, fetchSilverPrice, calculateNisabValue } from "@/lib/nisab-prices";
import { getUserKey, decryptForUser } from "@/lib/encryption";
import { getZakatableOtherAssets } from "@/db/queries/other-assets";

// Zakat rate: 2.5% of net zakatable wealth
const ZAKAT_RATE = 0.025;

export type ZakatBreakdown = {
  cashAndSavings: number;
  investmentValue: number;
  otherAssetsValue: number;
  totalAssets: number;
  totalLiabilities: number;
  debtDeductions: number;
  zakatableAmount: number;
  zakatDue: number;
  nisabValue: number;
  aboveNisab: boolean;
  accounts: { name: string; type: string | null; balance: number }[];
  debts: { name: string; remainingAmount: number }[];
  otherAssets: { name: string; assetType: string; value: number }[];
};

export async function getNisabValue(
  nisabType: string = "gold"
): Promise<number> {
  const priceData = nisabType === "silver"
    ? await fetchSilverPrice()
    : await fetchGoldPrice();

  return calculateNisabValue(priceData.pricePerGram, nisabType as "gold" | "silver");
}

export async function calculateZakat(
  userId: string,
  nisabType: string = "gold",
): Promise<ZakatBreakdown> {
  const userKey = await getUserKey(userId);

  // 1. Fetch accounts
  const accounts = await db
    .select({
      name: accountsTable.name,
      type: accountsTable.type,
      balance: accountsTable.balance,
    })
    .from(accountsTable)
    .where(eq(accountsTable.user_id, userId));

  // 2. Categorise accounts
  const liabilityTypes = new Set(["creditCard"]);

  const cashAndSavings = accounts
    .filter((a) => !liabilityTypes.has(a.type ?? "") && a.type !== "investment")
    .reduce((sum, a) => sum + a.balance, 0);

  const accountLiabilities = accounts
    .filter((a) => liabilityTypes.has(a.type ?? ""))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  // 3. Investment value
  let investmentVal = 0;
  try {
    investmentVal = await getInvestmentValue(userId);
  } catch {
    investmentVal = 0;
  }

  // 4. Other zakatable assets (physical gold, silver, etc.)
  const otherAssetsRaw = await getZakatableOtherAssets(userId);
  const otherAssets = otherAssetsRaw.map((a) => ({
    name: a.name,
    assetType: a.asset_type,
    value: a.value,
  }));
  const otherAssetsValue = otherAssets.reduce((sum, a) => sum + a.value, 0);

  // 5. Totals
  const totalAssets = cashAndSavings + investmentVal + otherAssetsValue;
  const totalLiabilities = accountLiabilities;
  const debtDeductions = totalLiabilities; // credit card balances count as immediate liabilities
  const zakatableAmount = Math.max(0, totalAssets - debtDeductions);

  // 6. Nisab + due
  const nisabValue = await getNisabValue(nisabType);
  const aboveNisab = zakatableAmount >= nisabValue;
  const zakatDue = aboveNisab ? zakatableAmount * ZAKAT_RATE : 0;

  const decryptedAccounts = accounts.map((a) => ({
    name: a.name ? decryptForUser(a.name, userKey) : "Account",
    type: a.type,
    balance: a.balance,
  }));

  return {
    cashAndSavings,
    investmentValue: investmentVal,
    otherAssetsValue,
    totalAssets,
    totalLiabilities,
    debtDeductions,
    zakatableAmount,
    zakatDue,
    nisabValue,
    aboveNisab,
    accounts: decryptedAccounts,
    debts: [], // debts removed in net-worth tracker pivot
    otherAssets,
  };
}
