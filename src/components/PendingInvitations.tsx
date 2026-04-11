"use client";

import { useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { acceptInvitation, declineInvitation } from "@/db/mutations/sharing";

type Invitation = {
  id: string;
  resource_type: "account" | "budget";
  resourceName: string;
  permission: "view" | "edit";
  shared_with_email: string;
};

export function PendingInvitations({
  invitations,
}: {
  invitations: Invitation[];
}) {
  const [isPending, startTransition] = useTransition();

  if (invitations.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <p className="text-sm font-semibold mb-3">
        Pending invitations ({invitations.length})
      </p>
      <div className="space-y-2">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex flex-col gap-3 rounded-md border bg-background p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="font-medium truncate">{inv.resourceName}</span>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {inv.resource_type}
              </Badge>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {inv.permission}
              </Badge>
            </div>
            <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:justify-end">
              <Button
                size="sm"
                variant="default"
                className="h-7 flex-1 px-2 sm:flex-none"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await acceptInvitation(inv.id);
                  })
                }
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span className="ml-1">Accept</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 flex-1 px-2 sm:flex-none"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await declineInvitation(inv.id);
                  })
                }
              >
                <X className="h-3.5 w-3.5" />
                <span className="ml-1">Decline</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
