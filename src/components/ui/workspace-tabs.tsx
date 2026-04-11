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
        "workspace-tablist-scroll flex w-full items-center gap-2 overflow-x-auto rounded-[1.35rem] border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--card)_82%,var(--workspace-muted-surface)_18%)] p-1.5 shadow-sm",
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
              "min-h-11 shrink-0 rounded-[1rem] px-4 py-2.5 text-sm font-semibold transition-all duration-200",
              selected
                ? "bg-[var(--workspace-shell)] text-[var(--workspace-shell-foreground)] shadow-[0_14px_28px_rgba(27,36,30,0.16)]"
                : "text-muted-foreground hover:bg-white/65 hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
