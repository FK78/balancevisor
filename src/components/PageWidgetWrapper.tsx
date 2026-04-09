"use client";

import { type ReactNode } from "react";
import { WidgetLayoutProvider } from "@/components/WidgetLayoutProvider";
import { WidgetGrid } from "@/components/WidgetGrid";
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
        {header}
        <WidgetGrid>
          {children}
        </WidgetGrid>
      </div>
    </WidgetLayoutProvider>
  );
}
