/**
 * Shared net-worth calculation used by dashboard, retirement page, and retirement API.
 */

interface AccountLike {
  readonly type: string | null;
  readonly balance: number;
}

const LIABILITY_TYPES = new Set(["creditCard"]);

export function calculateNetWorth(
  accounts: readonly AccountLike[],
  investmentValue: number,
): { netWorth: number; totalAssets: number; totalLiabilities: number } {
  const totalAssets = accounts
    .filter((a) => !LIABILITY_TYPES.has(a.type ?? ""))
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => LIABILITY_TYPES.has(a.type ?? ""))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  return {
    netWorth: totalAssets - totalLiabilities + investmentValue,
    totalAssets,
    totalLiabilities,
  };
}
