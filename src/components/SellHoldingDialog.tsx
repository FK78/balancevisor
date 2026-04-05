"use client";

import { useState, useTransition } from "react";
import { Calculator, Loader2 } from "lucide-react";
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
import { recordHoldingSale } from "@/db/mutations/investments";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatCurrency";

type InvestmentAccount = { id: string; accountName: string };

type Holding = {
  id: string;
  ticker: string | null;
  name: string;
  quantity: number;
  average_price: number;
  current_price: number | null;
  currency: string;
};

export function SellHoldingDialog({
  holding,
  investmentAccounts = [],
}: {
  holding: Holding;
  investmentAccounts?: InvestmentAccount[];
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"form" | "success">("form");
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  const defaultPrice = holding.current_price ?? holding.average_price;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setView("form");
      setFormKey((prev) => prev + 1);
    }
    setOpen(nextOpen);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("holding_id", holding.id);
    startTransition(async () => {
      try {
        await recordHoldingSale(formData);
        toast.success("Sale recorded");
        setView("success");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to record sale");
      }
    });
  }

  function handleAddAnother() {
    setView("form");
    setFormKey((prev) => prev + 1);
    // keep dialog open
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Calculator className="mr-2 h-3.5 w-3.5" />
          Sell
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {view === "success" ? (
          <>
            <DialogHeader>
              <DialogTitle>Sale Recorded</DialogTitle>
              <DialogDescription>
                The sale has been successfully recorded. The holding's quantity has been updated.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:justify-center">
              <Button variant="outline" onClick={handleAddAnother}>
                Sell More
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Sell {holding.ticker ?? holding.name}</DialogTitle>
              <DialogDescription>
                Enter the details of the sale. The holding's quantity will be reduced accordingly.
              </DialogDescription>
            </DialogHeader>
            <form key={formKey} onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="any"
                  min="0.0001"
                  max={holding.quantity}
                  defaultValue={holding.quantity}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Available: {holding.quantity.toFixed(4)} shares
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price_per_unit">Price per unit</Label>
                <Input
                  id="price_per_unit"
                  name="price_per_unit"
                  type="number"
                  step="any"
                  min="0.0001"
                  defaultValue={defaultPrice}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Average price: {formatCurrency(holding.average_price, holding.currency)}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              {investmentAccounts.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="cash_account_id">Credit proceeds to account (optional)</Label>
                  <Select name="cash_account_id" defaultValue="none">
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No cash account</SelectItem>
                      {investmentAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input id="notes" name="notes" placeholder="E.g., Sold on market peak" />
              </div>
              <div className="rounded-md bg-muted p-3 text-sm">
                <div className="flex justify-between">
                  <span>Total amount</span>
                  <span className="font-medium" id="totalPreview">
                    {/* Will be filled by JS later, but we can leave empty */}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated realized gain/loss</span>
                  <span className="font-medium" id="gainPreview">
                    {/* Will be filled by JS later */}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Sale
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}