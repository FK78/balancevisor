"use client";

import { Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWidgetLayoutContext } from "@/components/WidgetLayoutProvider";

export function EditLayoutToggle() {
  const { isEditing, setIsEditing } = useWidgetLayoutContext();

  return (
    <Button
      variant={isEditing ? "default" : "ghost"}
      size="sm"
      className="gap-1.5 h-8 text-xs"
      onClick={() => setIsEditing(!isEditing)}
    >
      {isEditing ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Done
        </>
      ) : (
        <>
          <Pencil className="h-3.5 w-3.5" />
          Edit Layout
        </>
      )}
    </Button>
  );
}
