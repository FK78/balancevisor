"use client";

import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";
import { deleteAccount } from "@/db/mutations/accounts";
import type { AccountWithDetails } from "@/lib/types";

export function DeleteAccountButton({ account }: { account: Pick<AccountWithDetails, "id" | "accountName"> }) {
  return (
    <DeleteConfirmButton
      onDelete={() => deleteAccount(account.id)}
      entityName="Account"
      dialogTitle="Delete account?"
      dialogDescription={
        <>
          This will permanently delete &ldquo;{account.accountName}&rdquo;. This action cannot be undone.
        </>
      }
      successTitle="Account deleted"
      successDescription={
        <>
          &ldquo;{account.accountName}&rdquo; has been removed.
        </>
      }
    />
  );
}
