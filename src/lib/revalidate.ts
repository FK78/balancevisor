/**
 * Centralised revalidation helper.
 *
 * Instead of scattering ad-hoc `revalidatePath()` calls across every mutation,
 * mutations declare which domains they affect and this module handles the mapping.
 */

import { revalidatePath } from "next/cache";

export type Domain =
  | "accounts"
  | "transactions"
  | "budgets"
  | "goals"
  | "debts"
  | "subscriptions"
  | "recurring"
  | "investments"
  | "onboarding"
  | "sharing"
  | "categories"
  | "settings"
  | "zakat"
  | "reports"
  | "retirement";

const DOMAIN_PATHS: Record<Domain, readonly string[]> = {
  accounts: ["/dashboard/accounts"],
  transactions: ["/dashboard/transactions"],
  budgets: ["/dashboard/budgets"],
  goals: ["/dashboard/goals"],
  debts: ["/dashboard/debts"],
  subscriptions: ["/dashboard/subscriptions"],
  recurring: ["/dashboard/recurring"],
  investments: ["/dashboard/investments"],
  onboarding: ["/onboarding"],
  sharing: ["/dashboard/accounts", "/dashboard/budgets"],
  categories: ["/dashboard/categories"],
  settings: ["/dashboard/settings"],
  zakat: ["/dashboard/zakat"],
  reports: ["/dashboard/reports"],
  retirement: ["/dashboard/retirement"],
};

/**
 * Revalidate all paths associated with the given domains, plus `/dashboard`.
 *
 * @example
 *   revalidateDomains("accounts");                     // accounts + dashboard
 *   revalidateDomains("debts", "transactions", "accounts"); // all three + dashboard
 */
export function revalidateDomains(...domains: Domain[]): void {
  const paths = new Set<string>(["/dashboard"]);

  for (const domain of domains) {
    for (const path of DOMAIN_PATHS[domain]) {
      paths.add(path);
    }
  }

  for (const path of paths) {
    revalidatePath(path);
  }
}
