"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { ReadOnlyWidgetGrid } from "@/components/ReadOnlyWidgetGrid";
import { WidgetLayoutProvider } from "@/components/WidgetLayoutProvider";
import { DashboardWidget } from "@/components/DashboardWidget";
import { WorkspaceTabs } from "@/components/ui/workspace-tabs";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";
import { ActionShelf, CockpitHero, SoftPanel } from "@/components/ui/cockpit";
import { Button } from "@/components/ui/button";
import {
  ACCOUNTS_WORKSPACE_TABS,
  type AccountsWorkspaceTab,
  groupAccountsLayoutByTab,
} from "@/components/accounts/accounts-workspace";
import type { WidgetLayoutItem } from "@/lib/widget-registry";

interface AccountsPageClientProps {
  readonly serverLayout: readonly WidgetLayoutItem[];
  readonly header: ReactNode;
  readonly pendingInvitations: ReactNode;
  readonly stats: ReactNode;
  readonly charts: ReactNode;
  readonly accountCards: ReactNode;
  readonly healthCheck: ReactNode;
  readonly primaryAccountLink?: {
    readonly href: string;
    readonly label: string;
  };
}

export function AccountsPageClient({
  serverLayout,
  header,
  pendingInvitations,
  stats,
  charts,
  accountCards,
  healthCheck,
  primaryAccountLink,
}: AccountsPageClientProps) {
  return (
    <WidgetLayoutProvider pageId="accounts" serverLayout={serverLayout}>
      <AccountsPageContent
        header={header}
        pendingInvitations={pendingInvitations}
        stats={stats}
        charts={charts}
        accountCards={accountCards}
        healthCheck={healthCheck}
        primaryAccountLink={primaryAccountLink}
      />
    </WidgetLayoutProvider>
  );
}

function AccountsPageContent({
  header,
  pendingInvitations,
  stats,
  charts,
  accountCards,
  healthCheck,
  primaryAccountLink,
}: Omit<AccountsPageClientProps, "serverLayout">) {
  const { layout } = useWidgetLayoutContext();
  const [activeTab, setActiveTab] = useState<AccountsWorkspaceTab>("summary");
  const groupedLayout = groupAccountsLayoutByTab(layout);
  const activeLayout = groupedLayout[activeTab];

  function renderWidget(widgetId: string) {
    switch (widgetId) {
      case "pending-invitations":
        return pendingInvitations;
      case "stats":
        return stats;
      case "charts":
        return charts;
      case "account-cards":
        return accountCards;
      case "health-check":
        return healthCheck;
      default:
        return null;
    }
  }

  const activeWidgets = activeLayout
    .map((item) => {
      if (item.widgetId === "stats" || item.widgetId === "pending-invitations") {
        return null;
      }
      const content = renderWidget(item.widgetId);
      if (!content) return null;

      return (
        <DashboardWidget key={item.widgetId} id={item.widgetId}>
          {content}
        </DashboardWidget>
      );
    })
    .filter(Boolean);

  return (
    <div className="cockpit-page mx-auto max-w-7xl px-4 py-6 md:px-10 md:py-10">
      <div className="cockpit-topbar">{header}</div>

      <CockpitHero
        eyebrow="Accounts"
        title="Your money, organised"
        description="Keep balances, account roster, and insights in clear workspaces, with the most important shifts above the fold."
        titleAs="h2"
        action={primaryAccountLink ? (
          <Button asChild variant="outline">
            <Link href={primaryAccountLink.href}>{primaryAccountLink.label}</Link>
          </Button>
        ) : null}
        aside={(
          <div className="space-y-2">
            <p className="cockpit-kicker text-[10px] text-white/70">Workspace</p>
            <p className="text-sm font-medium text-white/80">
              Summary first, deeper tools second.
            </p>
          </div>
        )}
      />

      <ActionShelf
        eyebrow="Portfolio position"
        title="Start with the balance picture"
        description="These top metrics give you the quickest read on cash, liabilities, and the overall shape of your accounts."
      >
        {stats}
      </ActionShelf>

      {pendingInvitations ? (
        <SoftPanel
          eyebrow="Shared accounts"
          title="Collaboration is kept nearby, not in the way"
          description="Review invitations or account-sharing updates without losing your place in the main workspace."
        >
          {pendingInvitations}
        </SoftPanel>
      ) : null}

      <section className="space-y-4">
        <div className="workspace-surface space-y-3 rounded-[28px] border border-[var(--workspace-card-border)] px-4 py-4 shadow-sm">
          <div className="space-y-1">
            <p className="cockpit-kicker">Workspace</p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Jump between your summary, account roster, and insights.
            </h2>
          </div>
          <WorkspaceTabs
            ariaLabel="Accounts workspace tabs"
            tabs={ACCOUNTS_WORKSPACE_TABS}
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as AccountsWorkspaceTab)}
          />
        </div>

        {ACCOUNTS_WORKSPACE_TABS.map((tab) => (
          <div
            key={tab.value}
            id={`workspace-panel-${tab.value}`}
            role="tabpanel"
            aria-labelledby={`workspace-tab-${tab.value}`}
            hidden={tab.value !== activeTab}
          >
            {tab.value === activeTab ? <ReadOnlyWidgetGrid>{activeWidgets}</ReadOnlyWidgetGrid> : null}
          </div>
        ))}
      </section>
    </div>
  );
}
