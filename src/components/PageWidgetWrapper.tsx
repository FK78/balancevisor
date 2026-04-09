"use client";

import { type ReactNode } from "react";
import { WidgetLayoutProvider } from "@/components/WidgetLayoutProvider";
import { WidgetGrid } from "@/components/WidgetGrid";
import { CustomiseDrawer } from "@/components/CustomiseDrawer";
import { EditLayoutToggle } from "@/components/EditLayoutToggle";
import type { DashboardPageId, WidgetLayoutItem } from "@/lib/widget-registry";

interface PageWidgetWrapperProps {
  readonly pageId: DashboardPageId;
  readonly serverLayout: readonly WidgetLayoutItem[];
  readonly header?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function PageWidgetWrapper({
  pageId,
  serverLayout,
  header,
  children,
  className = "mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10",
}: PageWidgetWrapperProps) {
  return (
    <WidgetLayoutProvider pageId={pageId} serverLayout={serverLayout}>
      <div className={className}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">{header}</div>
          <div className="flex items-center gap-1.5 shrink-0">
            <EditLayoutToggle />
            <CustomiseDrawer />
          </div>
        </div>
        <WidgetGrid>
          {children}
        </WidgetGrid>
      </div>
    </WidgetLayoutProvider>
  );
}
