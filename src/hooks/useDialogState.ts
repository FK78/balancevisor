"use client";

import { useState, useCallback } from "react";

/**
 * Hook for managing dialog state.
 *
 * Usage:
 *   const { open, data, openDialog, closeDialog } = useDialogState<Transaction>();
 *
 *   // Open with data
 *   openDialog(transaction);
 *
 *   // Open without data
 *   openDialog();
 *
 *   // Close
 *   closeDialog();
 */
export function useDialogState<TData = undefined>() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<TData | undefined>(undefined);

  const openDialog = useCallback((newData?: TData) => {
    setData(newData);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setData(undefined);
  }, []);

  return { open, data, openDialog, closeDialog };
}
