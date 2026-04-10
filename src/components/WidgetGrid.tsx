"use client";

import { type ReactNode, type ReactElement, Children, useMemo } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";
import { mobileFriendlySensors } from "@/lib/dnd-sensors";
import { useIsMobile } from "@/hooks/useIsMobile";

interface WidgetGridProps {
  readonly children: ReactNode;
}

/**
 * Sorts children (DashboardWidget elements) according to the current layout order.
 * In edit mode, wraps them in a DnD context for reordering.
 */
export function WidgetGrid({ children }: WidgetGridProps) {
  const { layout, reorder, isEditing } = useWidgetLayoutContext();
  const isMobile = useIsMobile();

  // Map children by their `id` prop
  const childMap = useMemo(() => {
    const map = new Map<string, ReactElement>();
    Children.forEach(children, (child) => {
      if (child && typeof child === "object" && "props" in child) {
        const props = (child as ReactElement<{ id?: string }>).props;
        if (props.id) {
          map.set(props.id, child as ReactElement);
        }
      }
    });
    return map;
  }, [children]);

  // Order children based on layout
  const orderedChildren = useMemo(() => {
    const result: ReactElement[] = [];
    for (const item of layout) {
      const child = childMap.get(item.widgetId);
      if (child) result.push(child);
    }
    // Append any children not in layout (safety net)
    for (const [id, child] of childMap) {
      if (!layout.some((l) => l.widgetId === id)) {
        result.push(child);
      }
    }
    return result;
  }, [layout, childMap]);

  if (!isEditing) {
    return <>{orderedChildren}</>;
  }

  // Mobile: plain list — reordering uses ▲/▼ buttons inside DashboardWidget
  if (isMobile) {
    return (
      <div className="space-y-6">
        {orderedChildren}
      </div>
    );
  }

  // Desktop: DnD-powered reordering
  return (
    <DragDropProvider
      sensors={mobileFriendlySensors}
      onDragEnd={(event) => {
        if (event.canceled) return;
        const { source } = event.operation;
        if (isSortable(source)) {
          const { initialIndex, index } = source;
          if (initialIndex !== index) {
            reorder(initialIndex, index);
          }
        }
      }}
    >
      <div className="space-y-6 md:space-y-8">
        {orderedChildren}
      </div>
    </DragDropProvider>
  );
}
