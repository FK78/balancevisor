"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/FormDialog";
import { addGoal, editGoal } from "@/db/mutations/goals";
import type { GoalWithProgress } from "@/lib/types";

type GoalFormData = Omit<GoalWithProgress, "created_at">;

export function GoalFormDialog({ goal }: { goal?: GoalFormData }) {
  const isEdit = !!goal;

  return (
    <FormDialog
      entityName="Goal"
      isEdit={isEdit}
      onSubmit={(fd) => isEdit ? editGoal(goal.id, fd) : addGoal(fd)}
      title={{ create: "Create a Savings Goal", edit: "Edit Goal" }}
      description={{ create: "Set a target and track your progress.", edit: "Update your goal details." }}
      successDescription={{ create: "Start saving towards your new goal.", edit: "Your goal has been updated." }}
      submitLabel={{ create: "Create Goal", edit: "Save Changes" }}
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Holiday fund, Emergency fund"
          defaultValue={goal?.name ?? ""}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="target_amount">Target Amount</Label>
          <Input
            id="target_amount"
            name="target_amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            defaultValue={goal?.target_amount?.toString() ?? ""}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="saved_amount">Saved So Far</Label>
          <Input
            id="saved_amount"
            name="saved_amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={goal?.saved_amount?.toString() ?? "0"}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="target_date">Target Date (optional)</Label>
          <Input
            id="target_date"
            name="target_date"
            type="date"
            defaultValue={goal?.target_date ?? ""}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="color">Colour</Label>
          <Input
            id="color"
            name="color"
            type="color"
            defaultValue={goal?.color ?? "#6366f1"}
            className="h-9 w-full"
          />
        </div>
      </div>

      <input type="hidden" name="icon" value={goal?.icon ?? ""} />
    </FormDialog>
  );
}
