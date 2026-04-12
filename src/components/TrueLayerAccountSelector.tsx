"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Landmark, CreditCard, PiggyBank, TrendingUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { TlAccountPreview } from "@/db/mutations/truelayer";

const ACCOUNT_TYPE_META: Record<string, { label: string; icon: typeof Landmark }> = {
  currentAccount: { label: "Current Account", icon: Landmark },
  savings: { label: "Savings", icon: PiggyBank },
  creditCard: { label: "Credit Card", icon: CreditCard },
  investment: { label: "Investment", icon: TrendingUp },
};

type Props = {
  readonly open: boolean;
  readonly accounts: TlAccountPreview[];
  readonly onConfirm: (selectedTlIds: string[]) => void;
  readonly onCancel: () => void;
  readonly loading?: boolean;
};

/**
 * Inline content (no dialog wrapper) — used inside the full-page import overlay.
 */
export function TrueLayerAccountSelectorContent({ accounts, onConfirm, onCancel, loading }: Omit<Props, "open">) {
  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const a of accounts) {
      if (!a.likelyPot) initial.add(a.tlId);
    }
    return initial;
  });

  const toggle = (tlId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tlId)) {
        next.delete(tlId);
      } else {
        next.add(tlId);
      }
      return next;
    });
  };

  const pots = accounts.filter((a) => a.likelyPot);
  const nonPots = accounts.filter((a) => !a.likelyPot);

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Choose accounts to import</h2>
        <p className="text-sm text-muted-foreground">
          We found {accounts.length} account{accounts.length !== 1 ? "s" : ""}. Toggle off any you don&apos;t want to track.
        </p>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        {nonPots.length > 0 && (
          <AccountGroup label="Accounts" items={nonPots} selected={selected} onToggle={toggle} />
        )}
        {pots.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-muted-foreground">
                These look like Monzo Pots / Starling Spaces — importing them may create duplicate transfers.
              </p>
            </div>
            <AccountGroup label="Likely Pots / Spaces" items={pots} selected={selected} onToggle={toggle} />
          </>
        )}
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(Array.from(selected))}
          disabled={selected.size === 0 || loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Import {selected.size} account{selected.size !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}

/**
 * Dialog-wrapped version — kept for standalone usage (e.g. settings page).
 */
export function TrueLayerAccountSelector({ open, accounts, onConfirm, onCancel, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) onCancel(); }}>
      <DialogContent className="max-w-lg">
        <TrueLayerAccountSelectorContent
          accounts={accounts}
          onConfirm={onConfirm}
          onCancel={onCancel}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}

function AccountGroup({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: TlAccountPreview[];
  selected: Set<string>;
  onToggle: (tlId: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      {items.map((a) => {
        const meta = ACCOUNT_TYPE_META[a.accountType] ?? ACCOUNT_TYPE_META.currentAccount;
        const Icon = meta.icon;
        return (
          <label
            key={a.tlId}
            className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
          >
            <Switch
              checked={selected.has(a.tlId)}
              onCheckedChange={() => onToggle(a.tlId)}
            />
            <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{a.displayName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {meta.label}
                </Badge>
                {a.providerName && <span>{a.providerName}</span>}
              </div>
            </div>
            <span className="text-sm font-medium tabular-nums whitespace-nowrap">
              {formatCurrency(a.balance, a.currency)}
            </span>
          </label>
        );
      })}
    </div>
  );
}
