import { formatCurrency } from "@/lib/formatCurrency";

export type AccountDecisionInput = {
  id: string;
  accountName: string;
  type: string | null;
  balance: number;
  transactions?: number | null;
  isShared?: boolean;
};

export type AccountSummaryDecisionCard = {
  id: "net-worth" | "liquid-cash" | "liabilities";
  eyebrow: string;
  title: string;
  subtitle: string;
  interpretation: string;
};

export type AccountCardDecisionState = {
  amountLabel: string;
  amountTone: "neutral" | "positive" | "negative" | "warning";
  statusLabel?: string;
  interpretation: string;
  shareLabel: string;
  balanceShareLabel: string;
  typeLabel: string;
  transactionsLabel: string;
};

const LIABILITY_TYPES = new Set(["creditCard"]);
const LIQUID_TYPES = new Set(["currentAccount", "savings"]);

function formatSignedCurrency(value: number, currency: string) {
  if (value < 0) {
    return `−${formatCurrency(Math.abs(value), currency)}`;
  }
  return formatCurrency(value, currency);
}

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatAccountTypeLabel(type: string | null) {
  if (!type) return "Other";
  if (type === "currentAccount") return "Current Account";
  if (type === "creditCard") return "Credit Card";
  if (type === "investment") return "Investment";
  if (type === "savings") return "Savings";

  return type
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function buildAccountSummaryCards(
  accounts: readonly AccountDecisionInput[],
  currency: string,
): AccountSummaryDecisionCard[] {
  const assets = accounts
    .filter((account) => !LIABILITY_TYPES.has(account.type ?? ""))
    .reduce((sum, account) => sum + account.balance, 0);
  const liabilities = accounts
    .filter((account) => LIABILITY_TYPES.has(account.type ?? ""))
    .reduce((sum, account) => sum + Math.abs(account.balance), 0);
  const netWorth = assets - liabilities;
  const liquidCash = accounts
    .filter((account) => LIQUID_TYPES.has(account.type ?? ""))
    .reduce((sum, account) => sum + account.balance, 0);

  const netWorthInterpretation =
    netWorth >= 0
      ? "Positive net position. Keep liabilities from expanding faster than assets."
      : "Net position is negative. Prioritise reducing liabilities and rebuilding cash.";

  const liquidCashInterpretation =
    liabilities === 0
      ? "No recorded liabilities. Liquid cash is fully available for flexibility."
      : liquidCash >= liabilities
        ? "Liquid cash currently covers all liabilities."
        : "Liquid cash does not yet cover liabilities. Strengthen near-term buffer.";

  const liabilitiesInterpretation =
    liabilities === 0
      ? "No liability exposure detected across your tracked accounts."
      : "Liabilities need active paydown to protect your monthly cash flow.";

  return [
    {
      id: "net-worth",
      eyebrow: "Net worth",
      title: formatSignedCurrency(netWorth, currency),
      subtitle: `${pluralize(accounts.length, "account", "accounts")} tracked`,
      interpretation: netWorthInterpretation,
    },
    {
      id: "liquid-cash",
      eyebrow: "Liquid cash",
      title: formatSignedCurrency(liquidCash, currency),
      subtitle: "Current + savings balances",
      interpretation: liquidCashInterpretation,
    },
    {
      id: "liabilities",
      eyebrow: "Liability load",
      title: formatCurrency(liabilities, currency),
      subtitle: "Credit balances requiring payoff",
      interpretation: liabilitiesInterpretation,
    },
  ];
}

export function buildAccountCardDecision(
  account: AccountDecisionInput,
  context: {
    currency: string;
    totalAbsoluteBalance: number;
    shareCount?: number;
  },
): AccountCardDecisionState {
  const accountType = account.type ?? "";
  const isLiability = LIABILITY_TYPES.has(accountType);

  let amountTone: AccountCardDecisionState["amountTone"] = "neutral";
  if (account.balance < 0) {
    amountTone = isLiability ? "negative" : "warning";
  } else if (account.balance > 0) {
    amountTone = "positive";
  }

  let statusLabel: string | undefined;
  let interpretation: string;

  if (accountType === "creditCard") {
    if (account.balance < 0) {
      statusLabel = "Liability watch";
      interpretation = "Outstanding card balance. Track utilisation and prioritise paydown.";
    } else if (account.balance === 0) {
      statusLabel = "Cleared cycle";
      interpretation = "No outstanding card liability right now.";
    } else {
      statusLabel = "Card in credit";
      interpretation = "Positive card balance detected. Confirm this reflects refunds or overpayment.";
    }
  } else if (accountType === "currentAccount" || accountType === "savings") {
    statusLabel = account.balance <= 0 ? "Low cash buffer" : "Cash ready";
    interpretation = account.balance <= 0
      ? "Cash balance is low. Protect essential payments first."
      : "Cash account available to cover near-term spending buffer.";
  } else if (accountType === "investment") {
    statusLabel = "Growth allocation";
    interpretation = "Long-term capital account. Review risk and diversification regularly.";
  } else {
    interpretation = "Monitor this account and confirm it still matches your plan.";
  }

  const shareLabel = account.isShared
    ? "Shared with you"
    : context.shareCount && context.shareCount > 0
      ? `Shared with ${context.shareCount} ${context.shareCount === 1 ? "person" : "people"}`
      : "Private account";

  const balanceShare = context.totalAbsoluteBalance > 0
    ? ((Math.abs(account.balance) / context.totalAbsoluteBalance) * 100).toFixed(1)
    : "0.0";
  const transactionCount = account.transactions ?? 0;

  return {
    amountLabel: formatSignedCurrency(account.balance, context.currency),
    amountTone,
    statusLabel,
    interpretation,
    shareLabel,
    balanceShareLabel: `${balanceShare}% of total exposure`,
    typeLabel: formatAccountTypeLabel(account.type),
    transactionsLabel: `${pluralize(transactionCount, "transaction", "transactions")}`,
  };
}

export function buildVisibleExposureTotal(
  visibleAccounts: readonly AccountDecisionInput[],
  currentAccount?: Pick<AccountDecisionInput, "id" | "balance">,
) {
  const total = visibleAccounts.reduce((sum, account) => sum + Math.abs(account.balance), 0);
  if (!currentAccount) return total;

  const isCurrentIncluded = visibleAccounts.some((account) => account.id === currentAccount.id);
  if (isCurrentIncluded) return total;

  return total + Math.abs(currentAccount.balance);
}
