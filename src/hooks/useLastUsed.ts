"use client";

import { useCallback } from "react";

const STORAGE_PREFIX = "bv_last_";

/**
 * Reads/writes last-used form values to localStorage.
 * Stores only IDs/enums — never financial data.
 */
export function useLastUsed(key: string) {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  const get = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }, [storageKey]);

  const set = useCallback(
    (value: string) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(storageKey, value);
      } catch {
        // localStorage full or unavailable — ignore
      }
    },
    [storageKey],
  );

  return { get, set };
}
