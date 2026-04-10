"use client";

import { type ReactNode, useMemo } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";
import { useIsMobile } from "@/hooks/useIsMobile";

interface DashboardWidgetProps {
  readonly id: string;
  readonly children: ReactNode;
}

export function DashboardWidget({ id, children }: DashboardWidgetProps) {
  const { layout, isEditing, toggleVisibility, reorder } = useWidgetLayoutContext();
  const item = layout.find((l) => l.widgetId === id);
  const isMobile = useIsMobile();

  const index = useMemo(
    () => layout.findIndex((l) => l.widgetId === id),
    [layout, id],
  );

  const { ref, handleRef, isDragging } = useSortable({
    id,
    index,
    disabled: !isEditing,
  });

  // Hidden widgets are not rendered at all in normal mode
  if (!item?.visible && !isEditing) return null;

  if (!isEditing) {
    // Zero-overhead pass-through in normal mode
    return <>{children}</>;
  }

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : !item?.visible ? 0.4 : 1,
      }}
      className={`relative rounded-xl transition-all ${
        isDragging ? "z-50 shadow-2xl" : ""
      } ${!item?.visible ? "opacity-40 grayscale" : ""} ${
        isEditing ? "ring-2 ring-primary/20 ring-offset-2 ring-offset-background" : ""
      }`}
    >
      {/* Drag handle & controls overlay */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
        {isMobile ? (
          <>
            <button
              disabled={index === 0}
              onClick={() => reorder(index, index - 1)}
              className="flex items-center justify-center rounded-full bg-card border border-border h-8 w-8 text-muted-foreground hover:text-foreground shadow-sm disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              disabled={index === layout.length - 1}
              onClick={() => reorder(index, index + 1)}
              className="flex items-center justify-center rounded-full bg-card border border-border h-8 w-8 text-muted-foreground hover:text-foreground shadow-sm disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            ref={handleRef}
            className="flex items-center gap-1.5 rounded-full bg-card border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground shadow-sm cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-3 w-3" />
            Drag
          </button>
        )}
        <button
          onClick={() => toggleVisibility(id)}
          className="flex items-center gap-1 rounded-full bg-card border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground shadow-sm"
        >
          <EyeOff className="h-3 w-3" />
          {item?.visible ? "Hide" : "Show"}
        </button>
      </div>
      <div className={!item?.visible ? "pointer-events-none" : ""}>
        {children}
      </div>
    </div>
  );
}
