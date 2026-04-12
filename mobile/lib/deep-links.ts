/**
 * Deep link configuration for Expo Router.
 *
 * Supported links:
 *   balancevisor://dashboard     → /(tabs)/
 *   balancevisor://transactions  → /(tabs)/transactions
 *   balancevisor://budgets       → /(tabs)/budgets
 *   balancevisor://goals         → /goals
 *   balancevisor://debts         → /debts
 *   balancevisor://chat          → /chat
 *   balancevisor://settings      → /settings
 *
 * Expo Router handles deep linking automatically via the file-based routing,
 * so this module just exports the scheme for reference.
 */

export const DEEP_LINK_SCHEME = "balancevisor";

export const DEEP_LINK_PREFIXES = [
  `${DEEP_LINK_SCHEME}://`,
  "https://balancevisor.com",
];
