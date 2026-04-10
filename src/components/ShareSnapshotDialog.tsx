"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;

    return toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
    });
  }, []);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const link = document.createElement("a");
      link.download = `wealth-${milestone.kind}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded");
    } catch {
      toast.error("Failed to generate image");
    } finally {
      setDownloading(false);
    }
  }, [generateImage, milestone.kind]);

  const handleCopy = useCallback(async () => {
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const res = await fetch(dataUrl);
      const blob = await res.blob();
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
            ref={cardRef}
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
