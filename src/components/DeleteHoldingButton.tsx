"use client";

import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";
import { deleteManualHolding } from "@/db/mutations/investments";
import type { ManualHolding } from "@/lib/types";

export function DeleteHoldingButton({ holding }: { holding: Pick<ManualHolding, "id" | "ticker" | "name"> }) {
  return (
    <DeleteConfirmButton
      onDelete={() => deleteManualHolding(holding.id)}
      entityName="Holding"
      dialogTitle="Delete holding?"
      dialogDescription={
        <>
          This will permanently remove &ldquo;{holding.name}&rdquo;{holding.ticker ? ` (${holding.ticker})` : ''} from your portfolio. This action cannot be undone.
        </>
      }
      successTitle="Holding deleted"
      successDescription={
        <>
          &ldquo;{holding.name}&rdquo; has been removed from your portfolio.
        </>
      }
    />
  );
}
