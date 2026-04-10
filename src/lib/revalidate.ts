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

/** Domains whose mutations affect data displayed on the main dashboard page. */
const DASHBOARD_AFFECTING: ReadonlySet<Domain> = new Set<Domain>([
  "accounts",
  "transactions",
  "budgets",
  "categories",
  "subscriptions",
  "investments",
  "goals",
  "reports",
  "debts",
  "zakat",
  "retirement",
]);

/**
 * Revalidate all paths associated with the given domains.
 * Also revalidates `/dashboard` when at least one domain affects the dashboard.
 *
 * @example
 *   revalidateDomains("accounts");                     // accounts + dashboard
 *   revalidateDomains("settings");                     // settings only (no dashboard)
 */
export function revalidateDomains(...domains: Domain[]): void {
  const paths = new Set<string>();

  let affectsDashboard = false;
  for (const domain of domains) {
    for (const path of DOMAIN_PATHS[domain]) {
      paths.add(path);
    }
    if (DASHBOARD_AFFECTING.has(domain)) {
      affectsDashboard = true;
    }
  }

  if (affectsDashboard) {
    paths.add("/dashboard");
  }

  for (const path of paths) {
    revalidatePath(path);
  }
}
