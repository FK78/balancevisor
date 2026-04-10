"use client";

import { Zap, Store, Landmark, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SOURCE_CONFIG: Record<string, { icon: typeof Zap; label: string; className: string }> = {
  rule:     { icon: Zap,      label: "Auto-categorised by rule",            className: "text-amber-500" },
  merchant: { icon: Store,    label: "Auto-categorised by merchant memory", className: "text-blue-500" },
  bank:     { icon: Landmark, label: "Categorised from bank data",          className: "text-emerald-500" },
  ai:       { icon: Sparkles, label: "AI-categorised",                      className: "text-violet-500" },
};

export function CategorySourceBadge({ source }: { source: string | null }) {
  if (!source || source === "manual") return null;

  const config = SOURCE_CONFIG[source];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex cursor-default">
            <Icon className={`h-3 w-3 shrink-0 ${config.className}`} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {config.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
