"use client";

import { type ReactNode } from "react";
import { WidgetLayoutProvider } from "@/components/WidgetLayoutProvider";
import { WidgetGrid } from "@/components/WidgetGrid";
import { DashboardWidget } from "@/components/DashboardWidget";
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
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
        {header}
        <WidgetGrid>
          <DashboardWidget id="pending-invitations">{pendingInvitations}</DashboardWidget>
          <DashboardWidget id="stats">{stats}</DashboardWidget>
          <DashboardWidget id="charts">{charts}</DashboardWidget>
          <DashboardWidget id="account-cards">{accountCards}</DashboardWidget>
          <DashboardWidget id="health-check">{healthCheck}</DashboardWidget>
        </WidgetGrid>
      </div>
    </WidgetLayoutProvider>
  );
}
