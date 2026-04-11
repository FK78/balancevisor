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
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
      </div>

      <SettingsClient
        displayName={displayName}
        email={email}
        baseCurrency={baseCurrency}
        supportedCurrencies={SUPPORTED_BASE_CURRENCIES}
        aiEnabled={aiEnabled}
        disabledFeatures={disabledFeatures}
      />
    </div>
  );
}
