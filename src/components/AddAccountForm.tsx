"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { addAccount, editAccount } from "@/db/mutations/accounts";

type Account = {
  id: string;
  accountName: string;
  type: string | null;
  balance: number;
};

export function AccountFormDialog({ account }: { account?: Account } = {}) {
  const isEdit = !!account;

  return (
    <FormDialog
      entityName="Account"
      isEdit={isEdit}
      onSubmit={(fd) => isEdit ? editAccount(account.id, fd) : addAccount(fd)}
      description={{
        create: "Enter the details for a new account. Currency follows your onboarding base currency.",
        edit: "Update the account details. Currency follows your onboarding base currency.",
      }}
      trigger={isEdit ? (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
        </Button>
      ) : undefined}
    >
      {/* Name */}
      <div className="grid gap-2">
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Main Current Account"
          defaultValue={account?.accountName ?? ""}
          required
        />
      </div>

      {/* Type */}
      <div className="grid gap-2">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue={account?.type ?? "currentAccount"}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="currentAccount">Current Account</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
            <SelectItem value="creditCard">Credit Card</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Balance */}
      <div className="grid gap-2">
        <Label htmlFor="balance">Starting Balance</Label>
        <Input
          id="balance"
          name="balance"
          type="number"
          step="0.01"
          defaultValue={account?.balance?.toString() ?? "0.00"}
          placeholder="0.00"
          required
        />
      </div>
    </FormDialog>
  );
}
