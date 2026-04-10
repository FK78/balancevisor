"use client";

import { type ReactNode, type ReactElement, Children, useMemo } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { ChevronDown, ChevronUp, EyeOff, GripVertical } from "lucide-react";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";
import { mobileFriendlySensors } from "@/lib/dnd-sensors";
import { useIsMobile } from "@/hooks/useIsMobile";

interface WidgetGridProps {
  readonly children: ReactNode;
}

function SortableWidget({
  id,
  index,
  visible,
  onToggle,
  children,
}: {
  id: string;
  index: number;
  visible: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id, index });

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : !visible ? 0.4 : 1 }}
      className={`relative rounded-xl transition-all ${
        isDragging ? "z-50 shadow-2xl" : ""
      } ${!visible ? "opacity-40 grayscale" : ""} ring-2 ring-primary/20 ring-offset-2 ring-offset-background`}
    >
      <div className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
        <button
          ref={handleRef}
          className="flex cursor-grab items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground active:cursor-grabbing md:px-2 md:py-1 md:text-xs touch-none"
        >
          <GripVertical className="h-4 w-4 md:h-3 md:w-3" />
          Drag
        </button>
        <button
          onClick={onToggle}
          className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
        >
          <EyeOff className="h-3 w-3" />
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <div className={!visible ? "pointer-events-none" : ""}>{children}</div>
    </div>
  );
}

function MobileWidget({
  index,
  total,
  visible,
  onMoveUp,
  onMoveDown,
  onToggle,
  children,
}: {
  index: number;
  total: number;
  visible: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative rounded-xl transition-all ${
        !visible ? "opacity-40 grayscale" : ""
      } ring-2 ring-primary/20 ring-offset-2 ring-offset-background`}
    >
      <div className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
        <button
          disabled={index === 0}
          onClick={onMoveUp}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-30"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          disabled={index === total - 1}
          onClick={onMoveDown}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-30"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={onToggle}
          className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
        >
          <EyeOff className="h-3 w-3" />
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <div className={!visible ? "pointer-events-none" : ""}>{children}</div>
    </div>
  );
}

export function WidgetGrid({ children }: WidgetGridProps) {
  const { layout, reorder, toggleVisibility } = useWidgetLayoutContext();
  const isMobile = useIsMobile();

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

  const orderedChildren = useMemo(() => {
    const result: Array<{ id: string; child: ReactElement; visible: boolean; index: number }> = [];

    layout.forEach((item, index) => {
      const child = childMap.get(item.widgetId);
      if (child) {
        result.push({
          id: item.widgetId,
          child,
          visible: item.visible,
          index,
        });
      }
    });

    let extraIndex = layout.length;
    for (const [id, child] of childMap) {
      if (!layout.some((item) => item.widgetId === id)) {
        result.push({
          id,
          child,
          visible: true,
          index: extraIndex++,
        });
      }
    }

    return result;
  }, [layout, childMap]);

  if (isMobile) {
    return (
      <div className="space-y-6">
        {orderedChildren.map(({ id, child, visible, index }) => (
          <MobileWidget
            key={id}
            index={index}
            total={orderedChildren.length}
            visible={visible}
            onMoveUp={() => reorder(index, index - 1)}
            onMoveDown={() => reorder(index, index + 1)}
            onToggle={() => toggleVisibility(id)}
          >
            {child}
          </MobileWidget>
        ))}
      </div>
    );
  }
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
        {orderedChildren.map(({ id, child, visible, index }) => (
          <SortableWidget
            key={id}
            id={id}
            index={index}
            visible={visible}
            onToggle={() => toggleVisibility(id)}
          >
            {child}
          </SortableWidget>
        ))}
      </div>
    </DragDropProvider>
  );
}
