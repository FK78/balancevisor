/**
 * Centralised revalidation helper.
 */

import { revalidatePath } from "next/cache";

export type Domain =
  | "accounts"
  | "investments"
  | "onboarding"
  | "settings"
  | "zakat";

const DOMAIN_PATHS: Record<Domain, readonly string[]> = {
  accounts: ["/dashboard/accounts"],
  investments: ["/dashboard/investments"],
  onboarding: ["/onboarding"],
  settings: ["/dashboard/settings"],
  zakat: ["/dashboard/zakat"],
};

/** Domains whose mutations affect data displayed on the main dashboard page. */
const DASHBOARD_AFFECTING: ReadonlySet<Domain> = new Set<Domain>([
  "accounts",
  "investments",
  "zakat",
]);

/**
 * Revalidate all paths associated with the given domains.
 * Also revalidates `/dashboard` when at least one domain affects the dashboard.
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
