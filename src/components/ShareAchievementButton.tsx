"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { ShareSnapshotDialog } from "@/components/ShareSnapshotDialog";
import type { Milestone } from "@/lib/milestones";

interface ShareAchievementButtonProps {
  readonly milestone: Milestone;
  readonly displayName?: string;
  readonly className?: string;
}

export function ShareAchievementButton({
  milestone,
  displayName,
  className,
}: ShareAchievementButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={className ?? "h-8 w-8 shrink-0"}
        onClick={() => setOpen(true)}
      >
        <Share2 className="h-3.5 w-3.5" />
        <span className="sr-only">Share</span>
      </Button>

      {open && (
        <ShareSnapshotDialog
          open={open}
          onOpenChange={setOpen}
          milestone={milestone}
          displayName={displayName}
        />
      )}
    </>
  );
}
