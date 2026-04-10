"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ShareSnapshotCard } from "@/components/ShareSnapshotCard";
import type { Milestone } from "@/lib/milestones";

interface ShareSnapshotDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly milestone: Milestone;
  readonly displayName?: string;
}

export function ShareSnapshotDialog({
  open,
  onOpenChange,
  milestone,
  displayName,
}: ShareSnapshotDialogProps) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    const res = await fetch("/api/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: milestone.kind,
        title: milestone.title,
        subtitle: milestone.subtitle,
        stat: milestone.stat,
        detail: milestone.detail,
        accent: milestone.accent,
        displayName,
      }),
    });

    if (!res.ok) return null;
    return res.blob();
  }, [milestone, displayName]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await generateImage();
      if (!blob) {
        toast.error("Failed to generate image");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `wealth-${milestone.kind}-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch {
      toast.error("Failed to generate image");
    } finally {
      setDownloading(false);
    }
  }, [generateImage, milestone.kind]);

  const handleCopy = useCallback(async () => {
    try {
      const blob = await generateImage();
      if (!blob) {
        toast.error("Failed to generate image");
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy — try downloading instead");
    }
  }, [generateImage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Milestone</DialogTitle>
          <DialogDescription>
            Download or copy this card to share your achievement.
          </DialogDescription>
        </DialogHeader>

        {/* Preview */}
        <div className="flex justify-center overflow-hidden rounded-xl bg-muted/30 p-4">
          <ShareSnapshotCard
            milestone={milestone}
            displayName={displayName}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PNG
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
