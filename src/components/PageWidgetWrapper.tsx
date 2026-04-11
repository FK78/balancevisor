"use client";

import { type ReactNode } from "react";
import { LazyWidgetCustomizer } from "@/components/LazyWidgetCustomizer";
import type { DashboardPageId, WidgetLayoutItem } from "@/lib/widget-registry";

interface PageWidgetWrapperProps {
  readonly pageId: DashboardPageId;
  readonly serverLayout: readonly WidgetLayoutItem[];
  readonly header?: ReactNode;
  readonly intro?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function PageWidgetWrapper({
  pageId,
  serverLayout,
  header,
  intro,
  children,
  className = "mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10",
}: PageWidgetWrapperProps) {
  return (
    <LazyWidgetCustomizer
      pageId={pageId}
      serverLayout={serverLayout}
      header={header}
      intro={intro}
      className={className}
    >
      {children}
    </LazyWidgetCustomizer>
  );
}
