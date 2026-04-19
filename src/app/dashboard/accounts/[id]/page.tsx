import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getAccountById } from "@/db/queries/accounts";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getCurrentUserId } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatCurrency";
import { AccountFormDialog } from "@/components/AddAccountForm";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { DecisionMetricCard } from "@/components/dense-data/DecisionMetricCard";
import { AccountDetailPageClient } from "@/components/accounts/AccountDetailPageClient";
import { requireFeature } from "@/components/FeatureGate";

const typeConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  currentAccount: { label: "Current Account", variant: "secondary" },
  savings: { label: "Savings", variant: "default" },
  creditCard: { label: "Credit Card", variant: "destructive" },
  investment: { label: "Investment", variant: "outline" },
};

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireFeature("accounts");
  const { id: accountId } = await params;

  const userId = await getCurrentUserId();

  const [account, baseCurrency] = await Promise.all([
    getAccountById(userId, accountId),
    getUserBaseCurrency(userId),
  ]);

  if (!account) return notFound();

  const config = typeConfig[account.type ?? ""] ?? {
    label: account.type ?? "Other",
    variant: "secondary" as const,
  };

  const actionShelf = (
    <div className="flex flex-wrap items-center gap-2">
      <AccountFormDialog account={account} />
      <DeleteAccountButton account={account} />
    </div>
  );

  const priorityCards = (
    <>
      <DecisionMetricCard
        eyebrow="Balance"
        title={formatCurrency(account.balance, baseCurrency)}
        subtitle="Current balance"
        interpretation="Balance is synced from your bank (TrueLayer) or maintained manually."
      />
      <DecisionMetricCard
        eyebrow="Type"
        title={config.label}
        subtitle="Account classification"
        interpretation={
          account.type === "creditCard"
            ? "Credit card balances reduce your net worth."
            : "Cash and savings contribute positively to your net worth."
        }
      />
      <DecisionMetricCard
        eyebrow="Currency"
        title={account.currency ?? baseCurrency}
        subtitle="Account currency"
        interpretation="Values on the dashboard are displayed in your base currency."
      />
    </>
  );

  return (
    <AccountDetailPageClient
      breadcrumbHref="/dashboard/accounts"
      accountName={account.accountName}
      heroAside={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="workspace-hero-panel rounded-2xl p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Balance</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {formatCurrency(account.balance, baseCurrency)}
              </p>
            </div>
            <div className="workspace-hero-panel rounded-2xl p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Currency</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {account.currency ?? baseCurrency}
              </p>
            </div>
          </div>
        </div>
      }
      actionShelf={actionShelf}
      priorityCards={priorityCards}
      activity={null}
    />
  );
}
