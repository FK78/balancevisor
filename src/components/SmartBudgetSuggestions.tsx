"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Plus,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { applyBudgetSuggestion } from "@/db/mutations/budgets";
import { toast } from "sonner";
import type { BudgetSuggestion } from "@/lib/budget-suggestions";

const typeConfig = {
  new: {
    label: "New Budget",
    icon: Plus,
    badgeClass: "border-sky-200 text-sky-600 bg-sky-500/5",
    iconClass: "text-sky-500",
  },
  increase: {
    label: "Increase",
    icon: TrendingUp,
    badgeClass: "border-amber-200 text-amber-600 bg-amber-500/5",
    iconClass: "text-amber-500",
  },
  decrease: {
    label: "Decrease",
    icon: TrendingDown,
    badgeClass: "border-emerald-200 text-emerald-600 bg-emerald-500/5",
    iconClass: "text-emerald-500",
  },
} as const;

function SuggestionCard({
  suggestion,
  currency,
}: {
  suggestion: BudgetSuggestion;
  currency: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [applied, setApplied] = useState(false);

  const config = typeConfig[suggestion.type];
  const Icon = config.icon;

  const actionLabel =
    suggestion.type === "new"
      ? "Add Budget"
      : suggestion.type === "increase"
        ? "Increase"
        : "Decrease";

  function handleApply() {
    startTransition(async () => {
      try {
        await applyBudgetSuggestion(
          suggestion.type,
          suggestion.categoryId,
          suggestion.suggestedAmount,
          suggestion.budgetId,
        );
        setApplied(true);
        toast.success(
          suggestion.type === "new"
            ? `Budget added for ${suggestion.categoryName}`
            : `Budget ${suggestion.type === "increase" ? "increased" : "decreased"} for ${suggestion.categoryName}`,
        );
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-border/50 px-3 py-3"
    >
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: suggestion.categoryColor + "15" }}
      >
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: suggestion.categoryColor }}
        />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {suggestion.categoryName}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] gap-1 shrink-0 ${config.badgeClass}`}
          >
            <Icon className={`h-2.5 w-2.5 ${config.iconClass}`} />
            {config.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {suggestion.reason}
        </p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs">
            <span className="tabular-nums">
              <span className="text-muted-foreground">Avg: </span>
              <span className="font-medium">
                {formatCurrency(suggestion.avgMonthlySpend, currency)}/mo
              </span>
            </span>
            {suggestion.currentAmount !== null && (
              <span className="tabular-nums">
                <span className="text-muted-foreground">Current: </span>
                <span className="font-medium">
                  {formatCurrency(suggestion.currentAmount, currency)}
                </span>
              </span>
            )}
            <span className="tabular-nums">
              <span className="text-muted-foreground">Suggested: </span>
              <span className="font-semibold text-primary">
                {formatCurrency(suggestion.suggestedAmount, currency)}
              </span>
            </span>
          </div>
          <Button
            size="sm"
            variant={applied ? "ghost" : "outline"}
            className="h-7 shrink-0 text-xs gap-1"
            disabled={isPending || applied}
            onClick={handleApply}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : applied ? (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                Applied
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SmartBudgetSuggestions({
  suggestions,
  currency,
}: {
  suggestions: BudgetSuggestion[];
  currency: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (suggestions.length === 0) return null;

  const visible = expanded ? suggestions : suggestions.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Smart Budget Suggestions</CardTitle>
            <CardDescription className="text-xs">
              {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""} based on your spending patterns
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.map((suggestion) => (
          <SuggestionCard
            key={`${suggestion.type}-${suggestion.categoryName}`}
            suggestion={suggestion}
            currency={currency}
          />
        ))}

        {suggestions.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs gap-1"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Show {suggestions.length - 3} more <ChevronDown className="h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
