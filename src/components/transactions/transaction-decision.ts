import { formatCurrency } from "@/lib/formatCurrency";
import type { Transaction } from "@/components/transactions/TransactionHelpers";

export type TransactionDecisionState = {
  amountLabel: string;
  amountTone: "neutral" | "positive" | "negative" | "warning";
  statusLabel?: string;
  interpretation?: string;
  meta: string[];
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const dateOnlyFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function formatDecisionDate(date: string | null) {
  if (!date) return "Date unknown";

  const dateOnlyMatch = dateOnlyPattern.exec(date);
  if (dateOnlyMatch) {
    const [, yearRaw, monthRaw, dayRaw] = dateOnlyMatch;
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    return dateOnlyFormatter.format(new Date(Date.UTC(year, month - 1, day)));
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unknown";
  }
  return dateFormatter.format(parsedDate);
}

export function buildTransactionDecisionState(
  transaction: Transaction,
  currency: string,
): TransactionDecisionState {
  const isUncategorisedExpense =
    transaction.type === "expense" && !transaction.category_id;
  const accountLabel = transaction.accountName?.trim() || "Unknown account";
  const dateLabel = formatDecisionDate(transaction.date);

  let amountLabel = `${formatCurrency(transaction.amount, currency)}`;
  let amountTone: TransactionDecisionState["amountTone"] = "neutral";

  if (transaction.type === "income") {
    amountLabel = `+${formatCurrency(transaction.amount, currency)}`;
    amountTone = "positive";
  } else if (transaction.type === "expense") {
    amountLabel = `−${formatCurrency(transaction.amount, currency)}`;
    amountTone = "negative";
  } else if (transaction.type === "refund") {
    amountLabel = `↩ ${formatCurrency(transaction.amount, currency)}`;
    amountTone = "warning";
  } else if (transaction.type === "transfer") {
    amountLabel = `⇄ ${formatCurrency(transaction.amount, currency)}`;
    amountTone = "neutral";
  }

  if (transaction.type === "transfer") {
    return {
      amountLabel,
      amountTone,
      statusLabel: "Transfer",
      interpretation: "Moved between your own accounts.",
      meta: [accountLabel, "Between accounts", dateLabel],
    };
  }

  if (transaction.is_split) {
    return {
      amountLabel,
      amountTone,
      statusLabel: "Split transaction",
      interpretation: "This transaction is split across multiple categories.",
      meta: [accountLabel, transaction.category ?? "Uncategorised", dateLabel],
    };
  }

  if (isUncategorisedExpense) {
    return {
      amountLabel,
      amountTone: "warning",
      statusLabel: "Needs review",
      interpretation: "Uncategorised expense. Review and assign a category.",
      meta: [accountLabel, "Uncategorised", dateLabel],
    };
  }

  return {
    amountLabel,
    amountTone,
    meta: [accountLabel, transaction.category ?? "Uncategorised", dateLabel],
  };
}
