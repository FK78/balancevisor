"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DashboardPageId, WidgetLayoutItem } from "@/lib/widget-registry";
import { getDefaultLayout, reconcileLayout } from "@/lib/widget-registry";
import { logger } from "@/lib/logger";

const STORAGE_PREFIX = "bv_layout_";

function readLocalStorage(pageId: DashboardPageId): readonly WidgetLayoutItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + pageId);
    if (!raw) return null;
    return JSON.parse(raw) as WidgetLayoutItem[];
  } catch {
    return null;
  }
}

function writeLocalStorage(pageId: DashboardPageId, layout: readonly WidgetLayoutItem[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + pageId, JSON.stringify(layout));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

function clearLocalStorage(pageId: DashboardPageId) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + pageId);
  } catch {
    // ignore
  }
}

export function useWidgetLayout(pageId: DashboardPageId, serverLayout: readonly WidgetLayoutItem[]) {
  const [layout, setLayout] = useState<readonly WidgetLayoutItem[]>(() => {
    // Use server-provided layout as initial (SSR-safe)
    return serverLayout;
  });
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // On mount, check localStorage for a more recent version
  useEffect(() => {
    const cached = readLocalStorage(pageId);
    if (cached) {
      const reconciled = reconcileLayout(cached, pageId);
      setLayout(reconciled);
    }
  }, [pageId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const persistLayout = useCallback(
    (nextLayout: readonly WidgetLayoutItem[]) => {
      writeLocalStorage(pageId, nextLayout);

      // Debounce DB save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        if (!mountedRef.current) return;
        setSaving(true);
        try {
          await fetch("/api/dashboard-layout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: pageId, layout: nextLayout }),
          });
        } catch {
          logger.warn("useWidgetLayout", "Failed to persist layout to server");
        } finally {
          if (mountedRef.current) setSaving(false);
        }
      }, 800);
    },
    [pageId],
  );

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setLayout((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        persistLayout(next);
        return next;
      });
    },
    [persistLayout],
  );

  const toggleVisibility = useCallback(
    (widgetId: string) => {
      setLayout((prev) => {
        const next = prev.map((item) =>
          item.widgetId === widgetId
            ? { ...item, visible: !item.visible }
            : item,
        );
        persistLayout(next);
        return next;
      });
    },
    [persistLayout],
  );

  const resetToDefault = useCallback(async () => {
    const defaults = getDefaultLayout(pageId);
    setLayout(defaults);
    clearLocalStorage(pageId);
    setSaving(true);
    try {
      await fetch(`/api/dashboard-layout?page=${pageId}`, { method: "DELETE" });
    } catch {
      // ignore
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [pageId]);

  const isCustomised = useMemo(() => {
    const defaults = getDefaultLayout(pageId);
    return layout.some((item, i) => {
      const def = defaults[i];
      return (
        !def ||
        def.widgetId !== item.widgetId ||
        def.visible !== item.visible
      );
    });
  }, [layout, pageId]);

  return { layout, reorder, toggleVisibility, resetToDefault, isCustomised, saving } as const;
}
