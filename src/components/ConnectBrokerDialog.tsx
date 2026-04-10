"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2, Unlink, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { connectBroker, disconnectBroker } from "@/db/mutations/investments";
import { toast } from "sonner";
import posthog from "posthog-js";
import { BROKER_LIST } from "@/lib/brokers";
import type { BrokerSource, BrokerMeta, BrokerField } from "@/lib/brokers/types";

type InvestmentAccount = { id: string; accountName: string };

export function ConnectBrokerDialog({
  connectedBrokers = [],
  investmentAccounts = [],
}: {
  connectedBrokers?: BrokerSource[];
  investmentAccounts?: InvestmentAccount[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<BrokerMeta | null>(null);
  const [view, setView] = useState<"list" | "form" | "manage" | "success">("list");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const connectedSet = new Set(connectedBrokers);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setView("list");
      setSelectedBroker(null);
    }
    setOpen(nextOpen);
  }

  function handleSelectBroker(meta: BrokerMeta) {
    setSelectedBroker(meta);
    if (connectedSet.has(meta.source)) {
      setView("manage");
    } else {
      if (meta.authType === "oauth") {
        // OAuth brokers (IBKR) — redirect to auth flow
        router.push(`/api/auth/ibkr`);
        return;
      }
      setView("form");
    }
  }

  function handleConnect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedBroker) return;
    const formData = new FormData(e.currentTarget);
    formData.set("broker", selectedBroker.source);
    startTransition(async () => {
      try {
        await connectBroker(formData);
        posthog.capture("broker_connected", { broker: selectedBroker.source });
        toast.success(`${selectedBroker.label} connected`);
        setView("success");
      } catch {
        toast.error(`Failed to connect ${selectedBroker.label}`);
      }
    });
  }

  function handleDisconnect() {
    if (!selectedBroker) return;
    const formData = new FormData();
    formData.set("broker", selectedBroker.source);
    startTransition(async () => {
      try {
        await disconnectBroker(formData);
        posthog.capture("broker_disconnected", { broker: selectedBroker.source });
        toast.success(`${selectedBroker.label} disconnected`);
        handleOpenChange(false);
      } catch {
        toast.error(`Failed to disconnect ${selectedBroker.label}`);
      }
    });
  }

  const apiKeyBrokers = BROKER_LIST.filter((b) => b.authType === "api_key");
  const oauthBrokers = BROKER_LIST.filter((b) => b.authType === "oauth");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="mr-1 h-4 w-4" />
          {connectedBrokers.length > 0 ? "Manage Brokers" : "Connect Broker"}
        </Button>
      </DialogTrigger>
      <DialogContent mobileLayout="full-height" className="sm:max-w-md">
        {view === "list" && (
          <>
            <DialogHeader>
              <DialogTitle>Connect a Broker</DialogTitle>
              <DialogDescription>
                Choose a broker to connect and sync your investment positions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {apiKeyBrokers.map((meta) => (
                <button
                  key={meta.source}
                  type="button"
                  onClick={() => handleSelectBroker(meta)}
                  className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {meta.label.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">API Key</p>
                    </div>
                  </div>
                  {connectedSet.has(meta.source) && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                </button>
              ))}
              {oauthBrokers.map((meta) => (
                <button
                  key={meta.source}
                  type="button"
                  onClick={() => handleSelectBroker(meta)}
                  className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {meta.label.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">OAuth</p>
                    </div>
                  </div>
                  {connectedSet.has(meta.source) && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {view === "form" && selectedBroker && (
          <>
            <DialogHeader>
              <DialogTitle>Connect {selectedBroker.label}</DialogTitle>
              <DialogDescription>
                Enter your API credentials to sync your positions automatically.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleConnect} className="grid gap-4">
              {selectedBroker.fields.map((field) => (
                <BrokerFieldInput key={field.name} field={field} />
              ))}
              {investmentAccounts.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="account_id">Link to Account</Label>
                  <Select name="account_id" defaultValue="none">
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
                  <p className="text-xs text-muted-foreground">
                    Link to an investment account to track holdings together.
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Get your API credentials from{" "}
                <a
                  href={selectedBroker.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 underline underline-offset-2"
                >
                  {selectedBroker.label} Settings
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              <DialogFooter mobileSticky>
                <Button type="button" variant="outline" onClick={() => setView("list")}>
                  Back
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Connect
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {view === "manage" && selectedBroker && (
          <>
            <DialogHeader>
              <DialogTitle>{selectedBroker.label} Connected</DialogTitle>
              <DialogDescription>
                Your {selectedBroker.label} account is connected and syncing positions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You can reconnect with new credentials or disconnect entirely.
              </p>
              <DialogFooter mobileSticky className="gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Unlink className="mr-1 h-4 w-4" />
                  Disconnect
                </Button>
                <Button
                  type="button"
                  onClick={() => setView("form")}
                >
                  Reconnect
                </Button>
              </DialogFooter>
            </div>
          </>
        )}

        {view === "success" && selectedBroker && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Connected</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">{selectedBroker.label} Connected!</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Your positions will now appear on this page.
                </p>
              </div>
            </div>
            <DialogFooter mobileSticky className="sm:justify-center">
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BrokerFieldInput({ field }: { field: BrokerField }) {
  if (field.type === "select" && field.options) {
    return (
      <div className="grid gap-2">
        <Label htmlFor={field.name}>{field.label}</Label>
        <Select name={field.name} defaultValue={field.options[0]?.value}>
          <SelectTrigger id={field.name}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        id={field.name}
        name={field.name}
        type={field.type}
        placeholder={field.placeholder}
        required={field.required}
      />
    </div>
  );
}
