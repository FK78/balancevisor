"use client";

import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";
import { deleteInvestmentGroup } from "@/db/mutations/investment-groups";

export function DeleteGroupButton({
  group,
}: {
  group: { id: string; name: string };
}) {
  return (
    <DeleteConfirmButton
      dialogTitle={`Delete \u201c${group.name}\u201d?`}
      dialogDescription={
        <>
          This will delete the group. Holdings inside it will be moved to
          ungrouped &mdash; they won&apos;t be deleted.
        </>
      }
      onDelete={() => deleteInvestmentGroup(group.id)}
      entityName="Investment Group"
      successTitle="Group deleted"
      successDescription="The investment group has been removed."
    />
  );
}
