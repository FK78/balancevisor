"use client";

import { useState, useTransition } from "react";
import { Plus, CheckCircle2, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addManualHolding, editManualHolding } from "@/db/mutations/investments";
import { toast } from "sonner";
import posthog from "posthog-js";

type InvestmentAccount = { id: string; accountName: string };
type InvestmentGroupOption = { id: string; name: string; color: string; account_id: string | null };

type PrivateHolding = {
  id: string;
  name: string;
  quantity: number;
  average_price: number;
  investment_type: "real_estate" | "private_equity" | "other";
  estimated_return_percent?: number | null;
  notes?: string | null;
  account_id?: string | null;
  group_id?: string | null;
};

export function AddPrivateInvestmentDialog({
  holding,
  investmentAccounts = [],
  groups = [],
}: {
  holding?: PrivateHolding;
  investmentAccounts?: InvestmentAccount[];
  groups?: InvestmentGroupOption[];
}) {
  const isEdit = !!holding;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"form" | "success">("form");
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setView("form");
    }
    setOpen(nextOpen);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Ticker is not required for private investments, set empty string
    formData.set("ticker", "");
    // Name is already from input
    startTransition(async () => {
      try {
        if (isEdit) {
          await editManualHolding(holding.id, formData);
          toast.success("Private investment updated");
        } else {
          await addManualHolding(formData);
          posthog.capture("private_investment_added", {
            investment_type: formData.get("investment_type"),
          });
          toast.success("Private investment added");
        }
        setView("success");
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  function handleAddAnother() {
    setFormKey((k) => k + 1);
    setView("form");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Private Investment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent mobileLayout="full-height" className="sm:max-w-md">
        {view === "success" ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{isEdit ? "Private investment updated" : "Private investment added"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {isEdit ? "Private investment updated!" : "Private investment added!"}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Your private investment has been {isEdit ? "updated" : "added to your portfolio"}.
                  You can update its value manually.
                </p>
              </div>
            </div>
            <DialogFooter mobileSticky className="flex gap-2 sm:justify-center">
              {!isEdit && (
                <Button variant="outline" onClick={handleAddAnother}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Another
                </Button>
              )}
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Private Investment" : "Add Private Investment"}</DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update the private investment details."
                  : "Enter details for your private investment (real estate, private equity, etc.)."}
              </DialogDescription>
            </DialogHeader>
            <form key={formKey} onSubmit={handleSubmit} className="grid gap-4">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Investment Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={holding?.name ?? ""}
                  placeholder="e.g., House in London, Startup ABC"
                  required
                />
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="investment_type">Category</Label>
                <Select name="investment_type" defaultValue={holding?.investment_type ?? "real_estate"}>
                  <SelectTrigger id="investment_type">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="private_equity">Private Equity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity (Units) */}
              <div className="grid gap-2">
                <Label htmlFor="quantity">Units / Shares</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="any"
                  min="0"
                  defaultValue={holding?.quantity?.toString() ?? "1"}
                  placeholder="e.g., 1"
                  required
                />
              </div>

              {/* Amount invested (average price) */}
              <div className="grid gap-2">
                <Label htmlFor="averagePrice">Amount Invested (Total)</Label>
                <Input
                  id="averagePrice"
                  name="averagePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={holding?.average_price?.toString() ?? ""}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Estimated return percentage */}
              <div className="grid gap-2">
                <Label htmlFor="estimated_return_percent">Estimated Annual Return % (Optional)</Label>
                <Input
                  id="estimated_return_percent"
                  name="estimated_return_percent"
                  type="number"
                  step="0.01"
                  defaultValue={holding?.estimated_return_percent?.toString() ?? ""}
                  placeholder="e.g., 5.5"
                />
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  defaultValue={holding?.notes ?? ""}
                  placeholder="Any additional details..."
                  rows={2}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {investmentAccounts.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="account_id">Account</Label>
                  <Select name="account_id" defaultValue={holding?.account_id ?? "none"}>
                    <SelectTrigger id="account_id">
                      <SelectValue placeholder="Select account (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No account</SelectItem>
                      {investmentAccounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {groups.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="group_id">Group / Pie</Label>
                  <Select name="group_id" defaultValue={holding?.group_id ?? "none"}>
                    <SelectTrigger id="group_id">
                      <SelectValue placeholder="Select group (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ungrouped</SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: g.color }}
                            />
                            {g.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Hidden fields */}
              <input type="hidden" name="currency" value="GBP" />

              <DialogFooter mobileSticky>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Save Changes" : "Add Private Investment"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
