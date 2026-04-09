import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { isAiEnabled, getDisabledFeatures } from "@/db/queries/preferences";
import { createClient } from "@/lib/supabase/server";
import { SUPPORTED_BASE_CURRENCIES } from "@/lib/currency";
import { SettingsClient } from "@/components/SettingsClient";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  const supabase = await createClient();

  const [baseCurrency, { data }, aiEnabled, disabledFeatures] = await Promise.all([
    getUserBaseCurrency(userId),
    supabase.auth.getUser(),
    isAiEnabled(userId),
    getDisabledFeatures(userId),
  ]);

  const user = data.user;
  const displayName =
    user?.user_metadata?.display_name ??
    user?.user_metadata?.full_name ??
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
