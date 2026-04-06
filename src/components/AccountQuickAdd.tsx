"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, PiggyBank, CreditCard, TrendingUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountTemplate {
  id: string;
  name: string;
  type: string;
  icon: React.ElementType;
  defaultBalance: number;
}

const ACCOUNT_TEMPLATES: AccountTemplate[] = [
  { id: "main", name: "Main Account", type: "currentAccount", icon: Wallet, defaultBalance: 0 },
  { id: "savings", name: "Savings", type: "savings", icon: PiggyBank, defaultBalance: 0 },
  { id: "credit", name: "Credit Card", type: "creditCard", icon: CreditCard, defaultBalance: 0 },
  { id: "investment", name: "Investment", type: "investment", icon: TrendingUp, defaultBalance: 0 },
];

interface AccountQuickAddProps {
  currency: string;
  onAddAccount: (data: { name: string; type: string; balance: string }) => void;
  existingAccounts: Array<{ id: string; accountName: string; type: string | null; balance: number }>;
}

export function AccountQuickAdd({ currency, onAddAccount, existingAccounts }: AccountQuickAddProps) {
  const [customForm, setCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState("currentAccount");
  const [customBalance, setCustomBalance] = useState("0");
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editingBalance, setEditingBalance] = useState("0");

  const addedTypes = new Set(existingAccounts.map((a) => a.type));

  const handleQuickAddClick = (template: AccountTemplate) => {
    setEditingTemplate(template.id);
    setEditingBalance(template.defaultBalance.toString());
  };

  const handleQuickAddConfirm = (template: AccountTemplate) => {
    onAddAccount({
      name: template.name,
      type: template.type,
      balance: editingBalance,
    });
    setEditingTemplate(null);
    setEditingBalance("0");
  };

  const handleQuickAddCancel = () => {
    setEditingTemplate(null);
    setEditingBalance("0");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddAccount({
      name: customName,
      type: customType,
      balance: customBalance,
    });
    setCustomName("");
    setCustomType("currentAccount");
    setCustomBalance("0");
    setCustomForm(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Quick add common accounts, or create a custom one.
      </p>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ACCOUNT_TEMPLATES.map((template) => {
            const alreadyAdded = addedTypes.has(template.type);
            const isEditing = editingTemplate === template.id;
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200",
                  alreadyAdded
                    ? "opacity-50 bg-muted/50"
                    : isEditing
                      ? "border-primary/30 bg-primary/5"
                      : "hover:bg-accent hover:border-primary/30"
                )}
              >
                <Icon className={cn("h-6 w-6", alreadyAdded ? "text-muted-foreground" : isEditing ? "text-primary" : "text-muted-foreground")} />
                <span className="text-xs font-medium">{template.name}</span>
                {alreadyAdded ? (
                  <span className="text-[10px] text-muted-foreground">Added</span>
                ) : isEditing ? (
                  <div className="w-full space-y-1.5">
                    <Input
                      type="number"
                      step="0.01"
                      value={editingBalance}
                      onChange={(e) => setEditingBalance(e.target.value)}
                      className="h-7 text-xs input-no-spinner"
                      placeholder="Balance"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuickAddConfirm(template);
                        if (e.key === "Escape") handleQuickAddCancel();
                      }}
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="xs"
                        className="flex-1 h-6 text-[10px]"
                        onClick={() => handleQuickAddConfirm(template)}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        className="flex-1 h-6 text-[10px]"
                        onClick={handleQuickAddCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-[10px] text-primary hover:underline cursor-pointer"
                    onClick={() => handleQuickAddClick(template)}
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!customForm ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setCustomForm(true)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add custom account
        </Button>
      ) : (
        <form onSubmit={handleCustomSubmit} className="space-y-4 rounded-lg border p-4">
          <div className="grid gap-2">
            <Label htmlFor="custom-name">Account Name</Label>
            <Input
              id="custom-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Joint Account"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="custom-type">Type</Label>
              <select
                id="custom-type"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              >
                <option value="currentAccount">Current</option>
                <option value="savings">Savings</option>
                <option value="creditCard">Credit Card</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="custom-balance">Starting Balance</Label>
              <Input
                id="custom-balance"
                type="number"
                step="0.01"
                value={customBalance}
                onChange={(e) => setCustomBalance(e.target.value)}
                className="input-no-spinner"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Add Account</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCustomForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {existingAccounts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Your accounts</p>
          <div className="space-y-2">
            {existingAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{account.accountName}</span>
                  <span className="text-xs text-muted-foreground capitalize">({account.type})</span>
                </div>
                <span className="text-muted-foreground">
                  {account.balance.toLocaleString("en-GB", { style: "currency", currency })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
