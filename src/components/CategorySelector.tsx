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
      <div className="rounded-[1.5rem] border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_34%,white)] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Recommended starting point</p>
              <span className="rounded-full bg-[color-mix(in_srgb,var(--workspace-accent)_18%,white)] px-2.5 py-1 text-[11px] font-medium text-[var(--workspace-shell)]">
                Fastest path
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Add the default categories first, then layer in custom ones if you need them.
            </p>
          </div>
          {canAddDefaults && (
            <Button type="button" size="sm" onClick={onAddDefaults}>
              Add all defaults
            </Button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {templates.map((template) => {
            const alreadyAdded = existingNames.has(template.name.toLowerCase());
            return (
              <div
                key={template.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-2.5 text-sm transition-all",
                  alreadyAdded
                    ? "border-[var(--workspace-card-border)] bg-muted/50 opacity-60"
                    : "border-[var(--workspace-card-border)] bg-background shadow-sm",
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
      </div>

      {existingCategories.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Your categories</p>
            <span className="text-xs text-muted-foreground">
              {existingCategories.length} ready
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {existingCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 rounded-full border border-[var(--workspace-card-border)] bg-background px-3 py-1.5 text-sm shadow-sm"
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
