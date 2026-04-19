import { getCurrentUserId, getCurrentUserEmail } from "@/lib/auth";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getDisabledFeatures } from "@/db/queries/preferences";
import { getInvestmentValue } from "@/lib/investment-value";
import { getNetWorthHistory } from "@/db/queries/net-worth";
import { getLatestZakatCalculation, getZakatSettings } from "@/db/queries/zakat";
import { getOtherAssetsTotalValue } from "@/db/queries/other-assets";
import { calculateNetWorth } from "@/lib/net-worth";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { isFeatureEnabled as checkFeature, type FeatureId } from "@/lib/features";
import { DashboardPageClient } from "@/components/dashboard/DashboardPageClient";

export default async function Home() {
  const userId = await getCurrentUserId();
  const disabledFeatures = await getDisabledFeatures(userId);
  const on = (id: FeatureId) => checkFeature(id, disabledFeatures);

  const [
    userEmail,
    baseCurrency,
    accounts,
    investmentValue,
    otherAssetsValue,
    netWorthHistory,
    zakatSettings,
    latestZakat,
    serverLayout,
  ] = await Promise.all([
    getCurrentUserEmail(),
    getUserBaseCurrency(userId),
    on("accounts") ? getAccountsWithDetails(userId) : Promise.resolve([]),
    on("investments") ? getInvestmentValue(userId) : Promise.resolve(0),
    on("zakat") ? getOtherAssetsTotalValue(userId) : Promise.resolve(0),
    on("accounts") ? getNetWorthHistory(userId, 90) : Promise.resolve([]),
    on("zakat") ? getZakatSettings(userId) : Promise.resolve(null),
    on("zakat") ? getLatestZakatCalculation(userId) : Promise.resolve(null),
    getPageLayout(userId, "dashboard"),
  ]);

  const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(
    accounts,
    investmentValue,
    otherAssetsValue,
  );

  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const zakatData = latestZakat
    ? {
        zakatDue: Number(latestZakat.zakat_due ?? 0),
        zakatableAmount: Number(latestZakat.zakatable_amount ?? 0),
        aboveNisab: !!latestZakat.above_nisab,
        hasSettings: !!zakatSettings,
      }
    : zakatSettings
      ? { zakatDue: 0, zakatableAmount: 0, aboveNisab: false, hasSettings: true }
      : null;

  return (
    <DashboardPageClient
      serverLayout={serverLayout}
      displayName={userEmail?.split("@")[0] ?? ""}
      monthName={monthName}
      baseCurrency={baseCurrency}
      accounts={accounts}
      netWorth={netWorth}
      totalAssets={totalAssets}
      totalLiabilities={totalLiabilities}
      investmentValue={investmentValue}
      netWorthHistory={netWorthHistory}
      zakatEnabled={on("zakat")}
      zakatData={zakatData}
      investmentsEnabled={on("investments")}
      accountsEnabled={on("accounts")}
    />
  );
}
