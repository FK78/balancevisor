"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryTemplate {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

interface CategorySelectorProps {
  templates: CategoryTemplate[];
  existingCategories: Array<{ id: string; name: string; color: string }>;
  onAddDefaults: () => void;
  canAddDefaults: boolean;
}

export function CategorySelector({
  templates,
  existingCategories,
  onAddDefaults,
  canAddDefaults,
}: CategorySelectorProps) {
  const existingNames = new Set(existingCategories.map((c) => c.name.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Add recommended categories to get started quickly.
        </p>
        {canAddDefaults && (
          <Button type="button" size="sm" onClick={onAddDefaults}>
            Add all defaults
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {templates.map((template) => {
          const alreadyAdded = existingNames.has(template.name.toLowerCase());
          return (
            <div
              key={template.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-all",
                alreadyAdded ? "bg-muted/50 opacity-60" : "bg-card"
              )}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: template.color }}
              />
              <span className="truncate">{template.name}</span>
              {alreadyAdded && (
                <span className="ml-auto text-[10px] text-muted-foreground">Added</span>
              )}
            </div>
          );
        })}
      </div>

      {existingCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Your categories</p>
          <div className="flex flex-wrap gap-2">
            {existingCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
