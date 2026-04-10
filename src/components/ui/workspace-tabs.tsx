"use client";

import { cn } from "@/lib/utils";

export interface WorkspaceTabOption {
  readonly value: string;
  readonly label: string;
}

interface WorkspaceTabsProps {
  readonly ariaLabel: string;
  readonly tabs: readonly WorkspaceTabOption[];
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly className?: string;
}

export function WorkspaceTabs({
  ariaLabel,
  tabs,
  value,
  onValueChange,
  className,
}: WorkspaceTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "workspace-tablist-scroll flex w-full items-center gap-2 overflow-x-auto rounded-full bg-background/80 p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;

        return (
          <button
            key={tab.value}
            id={`workspace-tab-${tab.value}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`workspace-panel-${tab.value}`}
            data-state={selected ? "active" : "inactive"}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
              selected
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
