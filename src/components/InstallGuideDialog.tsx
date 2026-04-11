"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/cockpit";
import { Share, Plus, MoreVertical, Monitor } from "lucide-react";

export type InstallMethod =
  | "native"
  | "ios-safari"
  | "macos-safari"
  | "android-browser"
  | "unsupported";

export function detectInstallMethod(): InstallMethod {
  if (typeof window === "undefined") return "unsupported";

  // Chromium browsers that captured the beforeinstallprompt event
  if (window.__pwaInstallPrompt) return "native";

  // Chromium but event hasn't fired yet — still treat as native-capable
  if ("BeforeInstallPromptEvent" in window) return "native";

  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);

  if (isIOS && isSafari) return "ios-safari";
  if (isSafari) return "macos-safari";

  // Firefox / other mobile browsers that don't support beforeinstallprompt
  if (/Android/.test(ua)) return "android-browser";

  return "unsupported";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method: InstallMethod;
}

export function InstallGuideDialog({ open, onOpenChange, method }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobileLayout="full-height" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install Wealth</DialogTitle>
          <DialogDescription>
            Add Wealth to your home screen so quick money check-ins feel more like an app and less like reopening the browser.
          </DialogDescription>
        </DialogHeader>

        <SoftPanel
          eyebrow="Install guide"
          title="A calmer way back into your dashboard"
          description="The steps below vary by browser, but the goal is the same: keep Wealth close when you need it."
          titleAs="h3"
        >
          <div className="space-y-4 py-1">
          {method === "ios-safari" && <IosSafariGuide />}
          {method === "macos-safari" && <MacosSafariGuide />}
          {method === "android-browser" && <AndroidBrowserGuide />}
          {method === "unsupported" && <UnsupportedGuide />}
          </div>
        </SoftPanel>

        <DialogFooter mobileSticky>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepRow({
  step,
  icon,
  children,
}: {
  step: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[1.25rem] border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--card)_94%,white_6%)] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--workspace-accent)_16%,white)] text-[var(--workspace-shell)]">
        {icon}
      </div>
      <div className="pt-0.5">
        <p className="text-sm font-medium text-foreground">Step {step}</p>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function IosSafariGuide() {
  return (
    <>
      <StepRow step={1} icon={<Share className="h-4 w-4" />}>
        Tap the <strong>Share</strong> button at the bottom of Safari (the
        square with an upward arrow).
      </StepRow>
      <StepRow step={2} icon={<Plus className="h-4 w-4" />}>
        Scroll down and tap <strong>Add to Home Screen</strong>.
      </StepRow>
      <StepRow step={3} icon={<span className="text-sm font-bold">+</span>}>
        Tap <strong>Add</strong> in the top-right corner to confirm.
      </StepRow>
    </>
  );
}

function MacosSafariGuide() {
  return (
    <>
      <StepRow step={1} icon={<Monitor className="h-4 w-4" />}>
        In the menu bar, click <strong>File</strong>.
      </StepRow>
      <StepRow step={2} icon={<Plus className="h-4 w-4" />}>
        Select <strong>Add to Dock</strong> (Safari 17+).
      </StepRow>
      <StepRow step={3} icon={<span className="text-sm font-bold">+</span>}>
        Click <strong>Add</strong> to confirm. The app will appear in your Dock.
      </StepRow>
    </>
  );
}

function AndroidBrowserGuide() {
  return (
    <>
      <StepRow step={1} icon={<MoreVertical className="h-4 w-4" />}>
        Tap the <strong>menu</strong> button (three dots) in the top-right
        corner.
      </StepRow>
      <StepRow step={2} icon={<Plus className="h-4 w-4" />}>
        Tap <strong>Add to Home screen</strong> or{" "}
        <strong>Install app</strong>.
      </StepRow>
      <StepRow step={3} icon={<span className="text-sm font-bold">+</span>}>
        Tap <strong>Add</strong> to confirm.
      </StepRow>
    </>
  );
}

function UnsupportedGuide() {
  return (
    <div className="rounded-lg border border-dashed p-4 text-center">
      <p className="text-sm text-muted-foreground">
        Your browser doesn&apos;t support installing web apps directly. Try
        opening Wealth in <strong>Safari</strong> or{" "}
        <strong>Google Chrome</strong> to install it.
      </p>
    </div>
  );
}
