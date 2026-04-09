"use client";

import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";
import { deleteCategorisationRule } from "@/db/mutations/categorisation-rules";

export function DeleteRuleButton({ ruleId }: { ruleId: string }) {
  return (
    <DeleteConfirmButton
      dialogTitle="Delete rule?"
      dialogDescription="Are you sure you want to delete this categorisation rule? This action cannot be undone."
      onDelete={() => deleteCategorisationRule(ruleId)}
      entityName="Categorisation Rule"
      successTitle="Rule deleted"
      successDescription="The categorisation rule has been removed."
      triggerClassName="h-7 w-7 text-muted-foreground hover:text-destructive"
      triggerIconClassName="h-3.5 w-3.5"
    />
  );
}
