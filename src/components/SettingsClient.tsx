"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Download,
  Loader2,
  Moon,
  Sparkles,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { toDateString } from "@/lib/date";
import { MFASettings } from "@/components/MFASettings";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ImportDataDialog } from "@/components/ImportDataDialog";
import { Switch } from "@/components/ui/switch";
import {
  ActionShelf,
  CockpitHero,
  PriorityCard,
  PriorityStack,
} from "@/components/ui/cockpit";
import {
  updateDisplayName,
  updateBaseCurrency,
  deleteAccount,
  exportUserData,
} from "@/db/mutations/settings";
import { toggleAiEnabled, updateDisabledFeatures } from "@/db/mutations/preferences";
import { currencyLabels } from "@/lib/labels";
import { FEATURE_DEFINITIONS } from "@/lib/features";
import { LayoutGrid } from "lucide-react";
import posthog from "posthog-js";

type Props = {
  displayName: string;
  email: string;
  baseCurrency: string;
  supportedCurrencies: readonly string[];
  aiEnabled: boolean;
  disabledFeatures: string[];
};

export function SettingsClient({
  displayName,
  email,
  baseCurrency,
  supportedCurrencies,
  aiEnabled,
  disabledFeatures: initialDisabled,
}: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Profile
  const [profilePending, startProfileTransition] = useTransition();

  // Currency
  const [currencyValue, setCurrencyValue] = useState(baseCurrency);
  const [currencyPending, startCurrencyTransition] = useTransition();

  // AI
  const [aiValue, setAiValue] = useState(aiEnabled);
  const [aiPending, startAiTransition] = useTransition();

  // Features
  const [disabledSet, setDisabledSet] = useState<Set<string>>(() => new Set(initialDisabled));
  const [featuresPending, startFeaturesTransition] = useTransition();

  // Export
  const [exportPending, startExportTransition] = useTransition();

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePending, startDeleteTransition] = useTransition();
  const hiddenFeaturesCount = disabledSet.size;

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startProfileTransition(async () => {
      const result = await updateDisplayName(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        posthog.capture("display_name_updated");
        toast.success("Display name updated");
      }
    });
  }

  function handleCurrencySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("base_currency", currencyValue);
    startCurrencyTransition(async () => {
      const result = await updateBaseCurrency(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        posthog.capture("base_currency_updated", { currency: currencyValue });
        toast.success("Base currency updated");
      }
    });
  }

  function handleExport() {
    startExportTransition(async () => {
      try {
        const data = await exportUserData();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wealth-export-${toDateString(new Date())}.json`;
        a.click();
        URL.revokeObjectURL(url);
        posthog.capture("data_exported");
        toast.success("Data exported");
      } catch {
        toast.error("Failed to export data");
      }
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteAccount();
      if (result.error) {
        toast.error(result.error);
      } else {
        posthog.capture("account_deleted_permanently");
        posthog.reset();
        router.push("/auth/login");
      }
    });
  }

  return (
    <div className="cockpit-page mx-auto max-w-5xl px-4 py-6 md:px-10 md:py-10">
      <div className="space-y-6 md:space-y-8">
      <CockpitHero
        eyebrow="Settings"
        title="Keep the essentials easy to adjust"
        description="Profile, preferences, security, and data controls stay grouped in a calmer workspace so routine changes never feel heavier than they need to."
        aside={(
          <div className="space-y-3">
            <div>
              <p className="cockpit-kicker text-[10px] text-white/70">At a glance</p>
              <p className="text-sm font-medium text-white/80">
                {aiValue ? "AI enabled" : "AI paused"} · {theme} theme
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="workspace-hero-panel rounded-2xl p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Currency</p>
                <p className="mt-1 text-lg font-semibold text-white">{currencyValue}</p>
              </div>
              <div className="workspace-hero-panel rounded-2xl p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Hidden features</p>
                <p className="mt-1 text-lg font-semibold text-white">{hiddenFeaturesCount}</p>
              </div>
            </div>
          </div>
        )}
      />

      <ActionShelf
        eyebrow="Workspace rhythm"
        title="Settings should stay calm and low-friction"
        description="The quickest adjustments stay visible first, while deeper account security and data controls sit further down instead of competing for attention."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--workspace-card-border)] bg-background/90 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Profile
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">{displayName || "Add your name"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="rounded-2xl border border-[var(--workspace-card-border)] bg-background/90 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Appearance
            </p>
            <p className="mt-2 text-base font-semibold text-foreground capitalize">{theme} mode</p>
            <p className="mt-1 text-sm text-muted-foreground">Base currency set to {currencyValue}.</p>
          </div>
          <div className="rounded-2xl border border-[var(--workspace-card-border)] bg-background/90 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Controls
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {hiddenFeaturesCount === 0 ? "Everything visible" : `${hiddenFeaturesCount} features hidden`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Security and export tools stay below when you need them.
            </p>
          </div>
        </div>
      </ActionShelf>

      <PriorityStack
        eyebrow="What to review"
        title="Start with the settings that change day-to-day comfort"
        description="These priorities keep appearance, automation, and account safety easy to find before the more infrequent actions."
      >
        <PriorityCard
          eyebrow="Identity"
          title="Profile stays simple"
          description="Name and base preferences should be quick to check so the rest of the app reflects the right defaults."
        />
        <PriorityCard
          eyebrow="Controls"
          title={aiValue ? "AI and features are currently active" : "AI is currently paused"}
          description="Feature visibility and AI controls are grouped together so you can shape the workspace without hunting around."
        />
        <PriorityCard
          eyebrow="Safety"
          title="Security and data tools stay one section lower"
          description="Password, MFA, export, and deletion remain easy to reach without dominating the page."
        />
      </PriorityStack>

      <div className="space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            Profile
          </CardTitle>
          <CardDescription>
            Manage your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                defaultValue={displayName}
                placeholder="Your name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here.
              </p>
            </div>
            <Button type="submit" disabled={profilePending}>
              {profilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Name
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customise how the app works for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base Currency */}
          <form onSubmit={handleCurrencySubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label>Base Currency</Label>
              <Select value={currencyValue} onValueChange={setCurrencyValue}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedCurrencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {currencyLabels[c] ?? c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Changing this will update all your account currencies.
              </p>
            </div>
            <Button type="submit" variant="outline" disabled={currencyPending}>
              {currencyPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Currency
            </Button>
          </form>

          {/* Theme */}
          <div className="space-y-3">
            <Label>Appearance</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="mr-1.5 h-3.5 w-3.5" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="mr-1.5 h-3.5 w-3.5" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            AI Features
          </CardTitle>
          <CardDescription>
            Control AI-powered features across the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="ai_toggle">Enable AI-powered features</Label>
              <p className="text-xs text-muted-foreground">
                When disabled, AI chat, smart transaction parsing, advisor
                features, and LLM-based auto-categorisation are turned off.
                Rule-based features continue to work.
              </p>
            </div>
            <Switch
              id="ai_toggle"
              checked={aiValue}
              disabled={aiPending}
              onCheckedChange={(checked) => {
                setAiValue(checked);
                startAiTransition(async () => {
                  const result = await toggleAiEnabled(checked);
                  if (result.error) {
                    toast.error(result.error);
                    setAiValue(!checked);
                  } else {
                    posthog.capture("ai_toggled", { enabled: checked });
                    toast.success(
                      checked ? "AI features enabled" : "AI features disabled",
                    );
                  }
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            Features
          </CardTitle>
          <CardDescription>
            Choose which features are visible in your dashboard and navigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {FEATURE_DEFINITIONS.map((feature) => {
            const enabled = !disabledSet.has(feature.id);
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-foreground" strokeWidth={1.6} />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor={`feature_${feature.id}`} className="text-sm font-medium">
                      {feature.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Switch
                  id={`feature_${feature.id}`}
                  checked={enabled}
                  disabled={featuresPending}
                  onCheckedChange={(checked) => {
                    const next = new Set(disabledSet);
                    if (checked) {
                      next.delete(feature.id);
                    } else {
                      next.add(feature.id);
                    }
                    setDisabledSet(next);
                    startFeaturesTransition(async () => {
                      const result = await updateDisabledFeatures(Array.from(next));
                      if (result.error) {
                        toast.error(result.error);
                        // rollback
                        const rollback = new Set(next);
                        if (checked) rollback.add(feature.id);
                        else rollback.delete(feature.id);
                        setDisabledSet(rollback);
                      } else {
                        posthog.capture("feature_toggled", {
                          feature: feature.id,
                          enabled: checked,
                        });
                        toast.success(
                          checked
                            ? `${feature.label} enabled`
                            : `${feature.label} disabled`,
                        );
                      }
                    });
                  }}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data</CardTitle>
          <CardDescription>Export or manage your data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport} disabled={exportPending}>
              {exportPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export All Data (JSON)
            </Button>
            <ImportDataDialog onImported={() => router.refresh()} />
          </div>
          <p className="text-xs text-muted-foreground">
            Export downloads all your data as unencrypted JSON. Import merges data from a
            previously exported file — existing records are kept and duplicates are skipped.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ChangePasswordForm email={email} />
          <hr className="border-border" />
          <MFASettings />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions — please be certain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent mobileLayout="full-height" className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your data including accounts,
                  transactions, budgets, goals, categories, and subscriptions.
                  This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="confirm_delete">
                  Type <strong>delete my account</strong> to confirm
                </Label>
                <Input
                  id="confirm_delete"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="delete my account"
                />
              </div>
              <DialogFooter mobileSticky>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirm !== "delete my account" || deletePending}
                  onClick={handleDelete}
                >
                  {deletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Permanently Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <p className="mt-2 text-xs text-muted-foreground">
            This deletes all your data and signs you out.
          </p>
        </CardContent>
      </Card>
      </div>
      </div>
    </div>
  );
}
