/**
 * Shared net-worth calculation helper.
 *
 * Eliminates duplication across dashboard/page.tsx, retirement/page.tsx,
 * and retirement-planner/route.ts.
 */

interface AccountLike {
  readonly type: string | null;
  readonly balance: number;
}

const LIABILITY_TYPES = new Set(["creditCard"]);

export interface NetWorthBreakdown {
  readonly totalAssets: number;
  readonly totalLiabilities: number;
  readonly netWorth: number;
}

/**
 * Calculate net worth from a list of accounts, investment value, and other assets.
 * Credit-card accounts are treated as liabilities; everything else is an asset.
 */
export function calculateNetWorth(
  accounts: readonly AccountLike[],
  investmentValue: number,
  otherAssetsValue: number = 0,
): NetWorthBreakdown {
  const totalAssets = accounts
    .filter((a) => !LIABILITY_TYPES.has(a.type ?? ""))
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => LIABILITY_TYPES.has(a.type ?? ""))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities + investmentValue + otherAssetsValue,
  };
}
