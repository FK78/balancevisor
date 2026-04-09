"use client";

import { type ReactNode, useMemo } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, EyeOff } from "lucide-react";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";

interface DashboardWidgetProps {
  readonly id: string;
  readonly children: ReactNode;
}

export function DashboardWidget({ id, children }: DashboardWidgetProps) {
  const { layout, isEditing, toggleVisibility } = useWidgetLayoutContext();
  const item = layout.find((l) => l.widgetId === id);

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
        <button
          ref={handleRef}
          className="flex items-center gap-1 rounded-full bg-card border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground shadow-sm cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3" />
          Drag
        </button>
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
