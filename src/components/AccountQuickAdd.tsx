"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, PiggyBank, CreditCard, TrendingUp, Plus, Trash2 } from "lucide-react";
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
  onDeleteAccount?: (id: string) => void;
  existingAccounts: Array<{ id: string; accountName: string; type: string | null; balance: number }>;
}

export function AccountQuickAdd({ currency, onAddAccount, onDeleteAccount, existingAccounts }: AccountQuickAddProps) {
  const [customForm, setCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState("currentAccount");
  const [customBalance, setCustomBalance] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editingBalance, setEditingBalance] = useState("");

  const addedTypes = new Set(existingAccounts.map((a) => a.type));

  const handleQuickAddClick = (template: AccountTemplate) => {
    setEditingTemplate(template.id);
    setEditingBalance("");
  };

  const handleQuickAddConfirm = (template: AccountTemplate) => {
    onAddAccount({
      name: template.name,
      type: template.type,
      balance: editingBalance || "0",
    });
    setEditingTemplate(null);
    setEditingBalance("");
  };

  const handleQuickAddCancel = () => {
    setEditingTemplate(null);
    setEditingBalance("");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddAccount({
      name: customName,
      type: customType,
      balance: customBalance || "0",
    });
    setCustomName("");
    setCustomType("currentAccount");
    setCustomBalance("");
    setCustomForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Start with a common account template, then add anything custom underneath.
        </p>
        {existingAccounts.length > 0 && (
          <span className="rounded-full bg-[color-mix(in_srgb,var(--workspace-muted-surface)_44%,var(--card))] px-3 py-1 text-xs font-medium text-foreground">
            {existingAccounts.length} ready
          </span>
        )}
      </div>

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
                  "flex flex-col items-center gap-2 rounded-[1.35rem] border p-4 text-center transition-all duration-200",
                  alreadyAdded
                    ? "border-[var(--workspace-card-border)] bg-muted/50 opacity-55"
                    : isEditing
                      ? "border-[var(--workspace-shell)]/30 bg-[color-mix(in_srgb,var(--workspace-shell)_7%,var(--card))] shadow-sm"
                      : "border-[var(--workspace-card-border)] bg-background hover:border-[var(--workspace-shell)]/22 hover:bg-accent/40"
                )}
              >
                <div className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl",
                  alreadyAdded
                    ? "bg-muted"
                    : isEditing
                      ? "bg-[color-mix(in_srgb,var(--workspace-accent)_18%,var(--card))]"
                      : "bg-muted/70",
                )}>
                  <Icon className={cn("h-5 w-5", alreadyAdded ? "text-muted-foreground" : isEditing ? "text-primary" : "text-muted-foreground")} />
                </div>
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
        <form onSubmit={handleCustomSubmit} className="space-y-4 rounded-[1.5rem] border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_34%,var(--card))] p-4">
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
          <div className="grid gap-2 sm:grid-cols-2">
            {existingAccounts.map((account) => (
              <div
                key={account.id}
                className="rounded-2xl border border-[var(--workspace-card-border)] bg-background p-4 text-sm shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{account.accountName}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {account.type}
                    </p>
                  </div>
                  {onDeleteAccount && (
                    <button
                      type="button"
                      onClick={() => onDeleteAccount(account.id)}
                      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${account.accountName}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-4 text-base font-semibold tabular-nums text-foreground">
                  {account.balance.toLocaleString("en-GB", { style: "currency", currency })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
