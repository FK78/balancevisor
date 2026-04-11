import Link from "next/link";
import { CreditCard, PiggyBank, TrendingUp, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  buildAccountCardDecision,
  formatAccountTypeLabel,
} from "@/components/accounts/account-decision";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, typeof Wallet> = {
  currentAccount: Wallet,
  savings: PiggyBank,
  creditCard: CreditCard,
  investment: TrendingUp,
};

const amountToneClassMap = {
  neutral: "text-foreground",
  positive: "text-emerald-700 dark:text-emerald-400",
  negative: "text-rose-700 dark:text-rose-400",
  warning: "text-amber-700 dark:text-amber-400",
} as const;

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
      className="group block rounded-[1.6rem] border border-[var(--workspace-card-border)] bg-card/95 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-accent/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
            <Icon className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight text-foreground">
              {account.accountName}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {formatAccountTypeLabel(account.type)}
            </p>
          </div>
        </div>
        <p className="text-right text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          Open account cockpit
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0 space-y-2">
          {decision.statusLabel ? (
            <Badge variant="outline" className="text-[10px]">
              {decision.statusLabel}
            </Badge>
          ) : null}
          <p className={cn("text-2xl font-semibold tracking-tight sm:text-[1.75rem]", amountToneClassMap[decision.amountTone])}>
            {decision.amountLabel}
          </p>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {decision.interpretation}
          </p>
        </div>
        <div className="hidden rounded-2xl border border-[var(--workspace-card-border)] bg-background/85 px-3 py-2 text-right sm:block">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Exposure</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{decision.balanceShareLabel}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-[10px]">
          {decision.transactionsLabel}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {decision.shareLabel}
        </Badge>
        <Badge variant="outline" className="text-[10px] sm:hidden">
          Exposure share
        </Badge>
      </div>
    </Link>
  );
}
