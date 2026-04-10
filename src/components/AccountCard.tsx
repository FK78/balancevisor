import Link from "next/link";
import { CreditCard, PiggyBank, TrendingUp, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DecisionRow } from "@/components/dense-data/DecisionRow";
import {
  buildAccountCardDecision,
  formatAccountTypeLabel,
} from "@/components/accounts/account-decision";

const typeIcons: Record<string, typeof Wallet> = {
  currentAccount: Wallet,
  savings: PiggyBank,
  creditCard: CreditCard,
  investment: TrendingUp,
};

export function AccountCard({
  account,
  currency,
  totalAbsoluteBalance = 0,
  shareCount,
}: {
  account: {
    id: string;
    accountName: string;
    type: string | null;
    balance: number;
    transactions?: number;
    isShared?: boolean;
  };
  currency: string;
  totalAbsoluteBalance?: number;
  shareCount?: number;
}) {
  const Icon = typeIcons[account.type ?? ""] ?? Wallet;
  const decision = buildAccountCardDecision(account, {
    currency,
    totalAbsoluteBalance,
    shareCount,
  });

  return (
    <Link
      href={`/dashboard/accounts/${account.id}`}
      className="group block rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/35 hover:bg-accent/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Icon className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {account.accountName}
            </p>
            <p className="text-xs text-muted-foreground">
              {decision.transactionsLabel}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {formatAccountTypeLabel(account.type)}
        </Badge>
      </div>
      <DecisionRow
        className="mt-3 border-none bg-transparent p-0 shadow-none"
        title="Decision snapshot"
        amount={decision.amountLabel}
        amountTone={decision.amountTone}
        statusLabel={decision.statusLabel}
        interpretation={decision.interpretation}
        meta={[
          decision.typeLabel,
          decision.shareLabel,
          decision.balanceShareLabel,
        ]}
      />
    </Link>
  );
}
