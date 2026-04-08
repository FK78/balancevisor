"use client";

import { useState, useRef } from "react";
import { toDateString } from "@/lib/date";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/FormDialog";
import { addBudget, editBudget } from "@/db/mutations/budgets";

type Category = {
  id: string;
  name: string;
  color: string;
};

type Budget = {
  id: string;
  budgetCategory: string;
  budgetColor: string;
  budgetAmount: number;
  budgetSpent: number;
  budgetPeriod: string | null;
  category_id: string | null;
  start_date: string | null;
};

export function BudgetFormDialog({
  categories,
  budget,
  avgSpendByCategory,
}: {
  categories: Category[];
  budget?: Budget;
  avgSpendByCategory?: Record<string, number>;
}) {
  const isEdit = !!budget;
  const today = toDateString(new Date());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
    budget?.category_id ?? undefined
  );
  const amountRef = useRef<HTMLInputElement>(null);

  const suggestedAmount = selectedCategoryId && avgSpendByCategory
    ? avgSpendByCategory[selectedCategoryId]
    : undefined;

  return (
    <FormDialog
      entityName="Budget"
      isEdit={isEdit}
      onSubmit={(fd) => isEdit ? editBudget(budget.id, fd) : addBudget(fd)}
      description={{
        create: "Set a spending limit for a category.",
        edit: "Update the budget details.",
      }}
    >
      {/* Category */}
      <div className="grid gap-2">
        <Label htmlFor="category_id">Category</Label>
        <Select
          name="category_id"
          defaultValue={budget ? String(budget.category_id) : undefined}
          onValueChange={setSelectedCategoryId}
          required
        >
          <SelectTrigger id="category_id">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div className="grid gap-2">
        <Label htmlFor="amount">Budget Amount</Label>
        <Input
          ref={amountRef}
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={budget?.budgetAmount?.toString() ?? ""}
          placeholder="0.00"
          required
        />
        {!isEdit && suggestedAmount && suggestedAmount > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            <span>Avg spend: £{suggestedAmount.toFixed(0)}/mo</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-[11px] text-primary"
              onClick={() => {
                if (amountRef.current) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value'
                  )?.set;
                  nativeInputValueSetter?.call(amountRef.current, suggestedAmount.toFixed(2));
                  amountRef.current.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }}
            >
              Use suggested
            </Button>
          </div>
        )}
      </div>

      {/* Period */}
      <div className="grid gap-2">
        <Label htmlFor="period">Period</Label>
        <Select name="period" defaultValue={budget?.budgetPeriod ?? "monthly"}>
          <SelectTrigger id="period">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div className="grid gap-2">
        <Label htmlFor="start_date">Start Date</Label>
        <Input
          id="start_date"
          name="start_date"
          type="date"
          defaultValue={budget?.start_date ?? today}
          required
        />
      </div>
    </FormDialog>
  );
}
