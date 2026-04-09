"use client";

import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings2, GripVertical, RotateCcw, Loader2 } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { PAGE_WIDGETS } from "@/lib/widget-registry";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";
import { mobileFriendlySensors } from "@/lib/dnd-sensors";

function SortableItem({
  widgetId,
  index,
  label,
  visible,
  onToggle,
}: {
  widgetId: string;
  index: number;
  label: string;
  visible: boolean;
  onToggle: () => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id: widgetId, index });

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 transition-shadow ${
        isDragging ? "shadow-lg z-50" : ""
      } ${!visible ? "opacity-60" : ""}`}
    >
      <button
        ref={handleRef}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-2 -m-1 rounded-md touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="flex-1 text-sm font-medium truncate">{label}</span>
      <Switch checked={visible} onCheckedChange={onToggle} />
    </div>
  );
}

export function CustomiseDrawer() {
  const {
    pageId,
    layout,
    reorder,
    toggleVisibility,
    resetToDefault,
    isCustomised,
    saving,
  } = useWidgetLayoutContext();

  const definitions = PAGE_WIDGETS[pageId];

  const labelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of definitions) {
      map.set(d.id, d.label);
    }
    return map;
  }, [definitions]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Settings2 className="h-4 w-4" />
          {isCustomised && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[340px] sm:w-[380px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Customise Layout
          </SheetTitle>
          <SheetDescription>
            Drag to reorder. Toggle to show or hide widgets.
          </SheetDescription>
        </SheetHeader>

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
          <div className="space-y-2">
            {layout.map((item, idx) => (
              <SortableItem
                key={item.widgetId}
                widgetId={item.widgetId}
                index={idx}
                label={labelMap.get(item.widgetId) ?? item.widgetId}
                visible={item.visible}
                onToggle={() => toggleVisibility(item.widgetId)}
              />
            ))}
          </div>
        </DragDropProvider>

        <div className="mt-6 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={resetToDefault}
            disabled={!isCustomised || saving}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Default
          </Button>
          {saving && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </span>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
