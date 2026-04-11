"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InstallGuideDialog,
  detectInstallMethod,
  type InstallMethod,
} from "@/components/InstallGuideDialog";

declare global {
  interface Window {
    __pwaInstallPrompt?: Event | null;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "wealth-install-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [method, setMethod] = useState<InstallMethod>("unsupported");
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if recently dismissed
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DURATION_MS) {
      return;
    }

    const detected = detectInstallMethod();

    // For Chromium, also listen for the event in case it fires after mount
    if (detected === "unsupported" || detected === "native") {
      const handler = (e: Event) => {
        e.preventDefault();
        window.__pwaInstallPrompt = e;
        setMethod("native");
        setVisible(true);
      };

      if (window.__pwaInstallPrompt) {
        setMethod("native");
        setVisible(true);
      } else {
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
      }
    } else {
      // Safari / Android browsers — always show the banner
      setMethod(detected);
      setVisible(true);
    }
  }, []);

  const handleInstall = useCallback(async () => {
    if (method === "native" && window.__pwaInstallPrompt) {
      const prompt = window.__pwaInstallPrompt as BeforeInstallPromptEvent;
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          setVisible(false);
        }
      } catch {
        setVisible(false);
      } finally {
        window.__pwaInstallPrompt = null;
      }
    } else {
      // Show step-by-step guide for non-Chromium browsers
      setGuideOpen(true);
    }
  }, [method]);

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300 md:bottom-4">
        <div className="soft-panel flex items-start gap-3 rounded-[1.6rem] p-4 shadow-[0_24px_56px_rgba(27,36,30,0.18)]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--workspace-accent)_16%,white)]">
            <Download className="h-5 w-5 text-[var(--workspace-shell)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="cockpit-kicker">Install</p>
            <p className="mt-1 text-sm font-semibold text-foreground">Keep Wealth one tap away</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add the app to your home screen for faster check-ins and a calmer mobile experience.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" className="workspace-primary-action" onClick={handleInstall}>
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <InstallGuideDialog
        open={guideOpen}
        onOpenChange={setGuideOpen}
        method={method}
      />
    </>
  );
}
