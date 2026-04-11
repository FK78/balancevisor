import { getCurrentUserId, getCurrentUserIdentity } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { isAiEnabled, getDisabledFeatures } from "@/db/queries/preferences";
import { SUPPORTED_BASE_CURRENCIES } from "@/lib/currency";
import { SettingsClient } from "@/components/SettingsClient";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();

  const [baseCurrency, user, aiEnabled, disabledFeatures] = await Promise.all([
    getUserBaseCurrency(userId),
    getCurrentUserIdentity(),
    isAiEnabled(userId),
    getDisabledFeatures(userId),
  ]);

  const displayName =
    user?.displayName ??
    user?.fullName ??
    "";
  const email = user?.email ?? "";

  return (
    <SettingsClient
      displayName={displayName}
      email={email}
      baseCurrency={baseCurrency}
      supportedCurrencies={SUPPORTED_BASE_CURRENCIES}
      aiEnabled={aiEnabled}
      disabledFeatures={disabledFeatures}
    />
  );
}
