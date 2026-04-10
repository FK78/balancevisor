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
      <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-sm md:bottom-4">
        <div className="flex items-start gap-3 rounded-xl border bg-background p-4 shadow-lg">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Install Wealth</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add to your home screen for quick access and a native app experience.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" onClick={handleInstall}>
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
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
