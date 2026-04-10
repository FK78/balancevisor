import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";
import { typeIcons } from "@/app/dashboard/accounts/page";
import { Badge } from "./ui/badge";
import { Wallet } from "lucide-react";

export function AccountCard({
  account,
  currency,
}: {
  account: { id: string; accountName: string; type: string | null; balance: number };
  currency: string;
}) {
  const Icon = typeIcons[account.type ?? ""] ?? Wallet;
  return (
    <Link
      href={`/dashboard/accounts/${account.id}`}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        <Icon className="text-primary h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{account.accountName}</p>
          <Badge variant="secondary" className="shrink-0 capitalize text-[10px] px-1.5 py-0">
            {account.type?.replace(/([a-z])([A-Z])/g, "$1 $2")}
          </Badge>
        </div>
        <p
          className={`mt-0.5 text-base font-semibold tabular-nums ${
            account.balance >= 0 ? "text-foreground" : "text-red-600"
          }`}
        >
          {account.balance < 0 ? "−" : ""}
          {formatCurrency(account.balance, currency)}
        </p>
      </div>
    </Link>
  );
}
