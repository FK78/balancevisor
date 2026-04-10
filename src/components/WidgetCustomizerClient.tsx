"use client";

import { type ReactNode } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomiseDrawer } from "@/components/CustomiseDrawer";
import { EditLayoutToggle } from "@/components/EditLayoutToggle";
import { WidgetGrid } from "@/components/WidgetGrid";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";

interface WidgetCustomizerControlsProps {
  readonly isEditing: boolean;
  readonly setIsEditing: (value: boolean) => void;
  readonly drawerOpen: boolean;
  readonly setDrawerOpen: (value: boolean) => void;
}

export function WidgetCustomizerControls({
  isEditing,
  setIsEditing,
  drawerOpen,
  setDrawerOpen,
}: WidgetCustomizerControlsProps) {
  const { isCustomised } = useWidgetLayoutContext();

  return (
    <>
      <EditLayoutToggle
        isEditing={isEditing}
        onToggle={() => setIsEditing(!isEditing)}
      />
      <Button
        aria-label="Customize layout"
        variant="ghost"
        size="icon"
        className="relative h-8 w-8"
        onClick={() => setDrawerOpen(true)}
      >
        <Settings2 className="h-4 w-4" />
        {isCustomised && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
        )}
      </Button>
      <CustomiseDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}

export function EditableWidgetGrid({ children }: { children: ReactNode }) {
  return <WidgetGrid>{children}</WidgetGrid>;
}
