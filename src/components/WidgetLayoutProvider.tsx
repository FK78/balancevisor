"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
import type { DashboardPageId, WidgetLayoutItem } from "@/lib/widget-registry";

interface WidgetLayoutContextValue {
  readonly pageId: DashboardPageId;
  readonly layout: readonly WidgetLayoutItem[];
  readonly reorder: (fromIndex: number, toIndex: number) => void;
  readonly toggleVisibility: (widgetId: string) => void;
  readonly resetToDefault: () => Promise<void>;
  readonly isCustomised: boolean;
  readonly saving: boolean;
}

const WidgetLayoutContext = createContext<WidgetLayoutContextValue | null>(null);

export function WidgetLayoutProvider({
  pageId,
  serverLayout,
  children,
}: {
  pageId: DashboardPageId;
  serverLayout: readonly WidgetLayoutItem[];
  children: ReactNode;
}) {
  const { layout, reorder, toggleVisibility, resetToDefault, isCustomised, saving } =
    useWidgetLayout(pageId, serverLayout);

  return (
    <WidgetLayoutContext.Provider
      value={{
        pageId,
        layout,
        reorder,
        toggleVisibility,
        resetToDefault,
        isCustomised,
        saving,
      }}
    >
      {children}
    </WidgetLayoutContext.Provider>
  );
}

export function useWidgetLayoutContext() {
  const ctx = useContext(WidgetLayoutContext);
  if (!ctx) {
    throw new Error("useWidgetLayoutContext must be used within a WidgetLayoutProvider");
  }
  return ctx;
}

/**
 * Safe version that returns null when used outside a WidgetLayoutProvider.
 * Used by the CustomiseDrawer in the nav (which is outside page-level providers).
 */
export function useOptionalWidgetLayoutContext() {
  return useContext(WidgetLayoutContext);
}
