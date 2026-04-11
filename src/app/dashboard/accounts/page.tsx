import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { getAccountsWithDetails, getSharedAccounts } from "@/db/queries/accounts";
import { AccountFormDialog } from "@/components/AddAccountForm";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { ConnectBankButton } from "@/components/ConnectBankButton";
import { ShareDialog } from "@/components/ShareDialog";
import { PendingInvitations } from "@/components/PendingInvitations";
import { getCurrentUserId, getCurrentUserEmail } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getSharesByOwner, getPendingInvitations } from "@/db/queries/sharing";
import dynamic from "next/dynamic";

import { ChartSkeleton } from "@/components/ChartSkeleton";
const AccountCharts = dynamic(
  () => import("@/components/AccountCharts").then((mod) => mod.AccountCharts),
  { loading: () => <ChartSkeleton height={300} /> }
);
import { AccountHealthCheck } from "@/components/AccountHealthCheck";
import { getTrueLayerConnections } from "@/db/mutations/truelayer";
import { getManualHoldings, getBrokerConnections } from "@/db/queries/investments";
import { BROKER_META } from "@/lib/brokers";
import type { BrokerSource } from "@/lib/brokers/types";
import Link from "next/link";
import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { AccountsPageClient } from "@/components/AccountsPageClient";
import { DecisionMetricCard } from "@/components/dense-data/DecisionMetricCard";
import { AccountCard } from "@/components/AccountCard";
import {
  buildAccountSummaryCards,
  formatAccountTypeLabel,
} from "@/components/accounts/account-decision";
import { getOtherAssets } from "@/db/queries/other-assets";
import { OtherAssetsSection } from "@/components/OtherAssetsSection";

export default async function Accounts() {
  await requireFeature("accounts");
  const userId = await getCurrentUserId();

  const email = await getCurrentUserEmail();

  const [ownedAccounts, sharedAccounts, baseCurrency, truelayerConnections, manualHoldings, brokerConnections, pendingInvitationsData, serverLayout, allShares, otherAssets] = await Promise.all([
    getAccountsWithDetails(userId),
    getSharedAccounts(userId, email),
    getUserBaseCurrency(userId),
    getTrueLayerConnections(),
    getManualHoldings(userId),
    getBrokerConnections(userId),
    getPendingInvitations(userId, email),
    getPageLayout(userId, "accounts"),
    getSharesByOwner(userId),
    getOtherAssets(userId),
  ]);

  const accounts = [...ownedAccounts, ...sharedAccounts];
  const accountPendingInvitations = pendingInvitationsData.filter(i => i.resource_type === "account");

  // Build shares map: accountId -> shares[]
  const accountSharesMap = new Map<string, typeof allShares>();
  for (const share of allShares) {
    if (share.resource_type !== "account") continue;
    const existing = accountSharesMap.get(share.resource_id) ?? [];
    existing.push(share);
    accountSharesMap.set(share.resource_id, existing);
  }

  // Build a map of account_id -> count of linked investments
  const investmentCountByAccount = new Map<string, { manual: number; brokers: string[] }>();
  for (const h of manualHoldings) {
    if (h.account_id) {
      const existing = investmentCountByAccount.get(h.account_id) ?? { manual: 0, brokers: [] };
      existing.manual++;
      investmentCountByAccount.set(h.account_id, existing);
    }
  }
  for (const conn of brokerConnections) {
    if (conn.account_id) {
      const existing = investmentCountByAccount.get(conn.account_id) ?? { manual: 0, brokers: [] };
      const label = BROKER_META[conn.broker as BrokerSource]?.label ?? conn.broker;
      existing.brokers.push(label);
      investmentCountByAccount.set(conn.account_id, existing);
    }
  }

  const summaryCards = buildAccountSummaryCards(accounts, baseCurrency);
  const totalAbsolute = accounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const headerEl = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Accounts</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <ConnectBankButton connections={truelayerConnections} />
        <AccountFormDialog />
      </div>
    </div>
  );

  const pendingInvitationsEl = accountPendingInvitations.length > 0 ? (
    <PendingInvitations invitations={accountPendingInvitations} />
  ) : null;

  const statsEl = (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {summaryCards.map((card) => (
        <DecisionMetricCard
          key={card.id}
          eyebrow={card.eyebrow}
          title={card.title}
          subtitle={card.subtitle}
          interpretation={card.interpretation}
        />
      ))}
    </div>
  );

  const chartsEl = accounts.length > 0 ? (
    <AccountCharts accounts={accounts} currency={baseCurrency} />
  ) : null;

  const accountCardsEl = accounts.length === 0 ? (
    <Card>
      <CardContent className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12 text-center">
        <Wallet className="h-10 w-10 opacity-40" />
        <div>
          <p className="text-sm font-medium text-foreground">No accounts yet</p>
          <p className="text-xs">Create your first account to start tracking balances.</p>
        </div>
        <AccountFormDialog />
      </CardContent>
    </Card>
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {accounts.map((account) => {
        const existingShares = accountSharesMap.get(account.id) ?? [];
        return (
          <Card key={account.id} className="overflow-hidden border-border/70">
            <CardContent className="space-y-3 p-4">
              <AccountCard
                account={account}
                currency={baseCurrency}
                totalAbsoluteBalance={totalAbsolute}
                shareCount={existingShares.length}
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {formatAccountTypeLabel(account.type)}
                  </Badge>
                  {account.isShared ? (
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Users className="h-3 w-3" />
                      Shared
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {!account.isShared && (
                    <ShareDialog
                      resourceType="account"
                      resourceId={account.id}
                      resourceName={account.accountName}
                      existingShares={existingShares.map((s) => ({
                        id: s.id,
                        shared_with_email: s.shared_with_email,
                        permission: s.permission,
                        status: s.status,
                      }))}
                    />
                  )}
                  {!account.isShared && <AccountFormDialog account={account} />}
                  {!account.isShared && <DeleteAccountButton account={account} />}
                </div>
              </div>

              {account.type === "investment" && investmentCountByAccount.has(account.id) && (() => {
                const info = investmentCountByAccount.get(account.id)!;
                const parts: string[] = [];
                for (const b of info.brokers) parts.push(b);
                if (info.manual > 0) parts.push(`${info.manual} manual holding${info.manual !== 1 ? "s" : ""}`);
                return (
                  <Link
                    href="/dashboard/investments"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <TrendingUp className="h-3 w-3" />
                    {parts.join(" · ")}
                  </Link>
                );
              })()}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const healthCheckEl = accounts.length > 0 ? <AccountHealthCheck /> : null;

  const otherAssetsEl = (
    <OtherAssetsSection assets={otherAssets} baseCurrency={baseCurrency} />
  );

  return (
    <AccountsPageClient
      serverLayout={serverLayout}
      header={headerEl}
      pendingInvitations={pendingInvitationsEl}
      stats={statsEl}
      charts={chartsEl}
      accountCards={accountCardsEl}
      healthCheck={healthCheckEl}
      otherAssets={otherAssetsEl}
      primaryAccountLink={accounts[0]
        ? {
            href: `/dashboard/accounts/${accounts[0].id}`,
            label: `Open ${accounts[0].accountName}`,
          }
        : undefined}
    />
  );
}
