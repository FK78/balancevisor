"use client";

import { useState, useCallback } from "react";
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
import { addSubscription, editSubscription } from "@/db/mutations/subscriptions";
import type { Account, CategoryWithColor as Category } from "@/lib/types";

type SubscriptionData = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  next_billing_date: string | null;
  category_id: string | null;
  account_id: string | null;
  url: string | null;
  notes: string | null;
  color: string;
  icon: string | null;
};

export function SubscriptionFormDialog({
  subscription,
  categories,
  accounts,
}: {
  subscription?: SubscriptionData;
  categories: Category[];
  accounts: Account[];
}) {
  const isEdit = !!subscription;
  const [billingCycle, setBillingCycle] = useState(subscription?.billing_cycle ?? "monthly");
  const [categoryId, setCategoryId] = useState(subscription?.category_id?.toString() ?? "");
  const [accountId, setAccountId] = useState(subscription?.account_id?.toString() ?? "");

  const handleReset = useCallback(() => {
    if (!isEdit) {
      setBillingCycle("monthly");
      setCategoryId("");
      setAccountId("");
    }
  }, [isEdit]);

  return (
    <FormDialog
      entityName="Subscription"
      isEdit={isEdit}
      onSubmit={(fd) => {
        fd.set("billing_cycle", billingCycle);
        if (categoryId && categoryId !== "none") {
          fd.set("category_id", categoryId);
        } else {
          fd.delete("category_id");
        }
        fd.set("account_id", accountId);
        return isEdit ? editSubscription(subscription.id, fd) : addSubscription(fd);
      }}
      description={{
        create: "Track a recurring subscription.",
        edit: "Update your subscription details.",
      }}
      successDescription={{
        create: "Your subscription is now being tracked.",
        edit: "Your subscription has been updated.",
      }}
      onReset={handleReset}
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Netflix, Spotify, iCloud"
          defaultValue={subscription?.name ?? ""}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            defaultValue={subscription?.amount?.toString() ?? ""}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Billing Cycle</Label>
          <Select value={billingCycle} onValueChange={setBillingCycle}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="next_billing_date">Next Billing Date</Label>
          <Input
            id="next_billing_date"
            name="next_billing_date"
            type="date"
            defaultValue={subscription?.next_billing_date ?? toDateString(new Date())}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Category (optional)</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Account</Label>
        <Select value={accountId} onValueChange={setAccountId} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id.toString()}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="url">Website URL (optional)</Label>
        <Input
          id="url"
          name="url"
          type="url"
          placeholder="https://..."
          defaultValue={subscription?.url ?? ""}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input
          id="notes"
          name="notes"
          type="text"
          placeholder="Any extra details..."
          defaultValue={subscription?.notes ?? ""}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="color">Colour</Label>
        <Input
          id="color"
          name="color"
          type="color"
          defaultValue={subscription?.color ?? "#6366f1"}
          className="h-9 w-full"
        />
      </div>

      <input type="hidden" name="icon" value={subscription?.icon ?? ""} />
    </FormDialog>
  );
}
