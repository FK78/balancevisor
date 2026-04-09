"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
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
  readonly isEditing: boolean;
  readonly setIsEditing: (v: boolean) => void;
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
  const [isEditing, setIsEditing] = useState(false);

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
        isEditing,
        setIsEditing,
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
