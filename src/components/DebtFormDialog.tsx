"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/FormDialog";
import { addDebt, editDebt } from "@/db/mutations/debts";
import type { DebtWithProgress } from "@/lib/types";

type DebtFormData = Omit<DebtWithProgress, "created_at">;

export function DebtFormDialog({ debt }: { debt?: DebtFormData }) {
  const isEdit = !!debt;

  return (
    <FormDialog
      entityName="Debt"
      isEdit={isEdit}
      onSubmit={(fd) => isEdit ? editDebt(debt.id, fd) : addDebt(fd)}
      description={{
        create: "Track a new debt to monitor your payoff progress.",
        edit: "Update the details for this debt.",
      }}
      successDescription={{
        create: "Your debt has been added to the tracker.",
        edit: "Your changes have been saved.",
      }}
      trigger={isEdit ? (
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      ) : undefined}
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={debt?.name}
          placeholder="e.g. Student Loan"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="original_amount">Original Amount</Label>
          <Input
            id="original_amount"
            name="original_amount"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={debt?.original_amount}
            placeholder="0.00"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="remaining_amount">Remaining</Label>
          <Input
            id="remaining_amount"
            name="remaining_amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={debt?.remaining_amount}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="interest_rate">Interest Rate (%)</Label>
          <Input
            id="interest_rate"
            name="interest_rate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={debt?.interest_rate ?? 0}
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="minimum_payment">Min. Payment</Label>
          <Input
            id="minimum_payment"
            name="minimum_payment"
            type="number"
            step="0.01"
            min="0"
            defaultValue={debt?.minimum_payment ?? 0}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="lender">Lender</Label>
          <Input
            id="lender"
            name="lender"
            defaultValue={debt?.lender ?? ""}
            placeholder="e.g. Barclays"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="due_date">Target Payoff Date</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={debt?.due_date ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="color">Colour</Label>
        <div className="flex items-center gap-2">
          <Input
            id="color"
            name="color"
            type="color"
            defaultValue={debt?.color ?? "#ef4444"}
            className="h-10 w-14 p-1"
          />
          <span className="text-xs text-muted-foreground">
            Pick a colour for this debt card
          </span>
        </div>
      </div>
    </FormDialog>
  );
}
