"use client";

import { type ReactNode, useState } from "react";
import { ReadOnlyWidgetGrid } from "@/components/ReadOnlyWidgetGrid";
import { WidgetLayoutProvider } from "@/components/WidgetLayoutProvider";
import { DashboardWidget } from "@/components/DashboardWidget";
import { WorkspaceTabs } from "@/components/ui/workspace-tabs";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";
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
}

export function AccountsPageClient({
  serverLayout,
  header,
  pendingInvitations,
  stats,
  charts,
  accountCards,
  healthCheck,
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
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      {header}
      <section className="space-y-4">
        <div className="workspace-panel-surface space-y-3 rounded-[28px] border border-[var(--workspace-card-border)] px-4 py-4 shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Workspace
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Jump between your account summary, account list, and insights.
            </h2>
          </div>
          <WorkspaceTabs
            ariaLabel="Accounts workspace tabs"
            tabs={ACCOUNTS_WORKSPACE_TABS}
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as AccountsWorkspaceTab)}
            className="bg-muted/50"
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
