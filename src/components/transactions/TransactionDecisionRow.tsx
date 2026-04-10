import type { ReactNode } from "react";

import { DecisionRow } from "@/components/dense-data/DecisionRow";
import type { Transaction } from "@/components/transactions/TransactionHelpers";
import { buildTransactionDecisionState } from "@/components/transactions/transaction-decision";

type TransactionDecisionRowProps = {
  transaction: Transaction;
  currency: string;
  action?: ReactNode;
};

export function TransactionDecisionRow({
  transaction,
  currency,
  action,
}: TransactionDecisionRowProps) {
  const decision = buildTransactionDecisionState(transaction, currency);
  const title = transaction.description?.trim() || "Transaction";

  return (
    <DecisionRow
      title={title}
      amount={decision.amountLabel}
      amountTone={decision.amountTone}
      statusLabel={decision.statusLabel}
      interpretation={decision.interpretation}
      meta={decision.meta}
      action={action}
    />
  );
}
