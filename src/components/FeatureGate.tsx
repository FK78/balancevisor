import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getDisabledFeatures } from "@/db/queries/preferences";
import { isFeatureEnabled } from "@/lib/features";
import type { FeatureId } from "@/lib/features";

/**
 * Call at the top of a server page function to redirect if the feature is disabled.
 * Usage: `await requireFeature("budgets");`
 */
export async function requireFeature(feature: FeatureId) {
  const userId = await getCurrentUserId();
  const disabledFeatures = await getDisabledFeatures(userId);

  if (!isFeatureEnabled(feature, disabledFeatures)) {
    redirect("/dashboard");
  }
}

/**
 * Server component that redirects to /dashboard if the given feature is disabled.
 * Place at the top of any feature page: `<FeatureGate feature="budgets" />`
 */
export async function FeatureGate({ feature }: { feature: FeatureId }) {
  await requireFeature(feature);
  return null;
}
