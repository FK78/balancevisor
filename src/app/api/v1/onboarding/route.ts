import { v1Handler, dataResponse } from "@/lib/api-v1";
import { getOnboardingState, getDefaultCategoryTemplates } from "@/db/queries/onboarding";

export const GET = v1Handler(async ({ userId }) => {
  const [state, templates] = await Promise.all([
    getOnboardingState(userId),
    getDefaultCategoryTemplates(),
  ]);
  return dataResponse({ state, templates });
});
