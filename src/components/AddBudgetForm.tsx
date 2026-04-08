"use client";

import { toDateString } from "@/lib/date";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function BudgetFormDialog({ categories, budget }: { categories: Category[]; budget?: Budget }) {
  const isEdit = !!budget;
  const today = toDateString(new Date());

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
        <Select name="category_id" defaultValue={budget ? String(budget.category_id) : undefined} required>
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
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={budget?.budgetAmount?.toString() ?? ""}
          placeholder="0.00"
          required
        />
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
