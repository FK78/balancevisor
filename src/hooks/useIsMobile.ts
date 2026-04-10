"use client";

import { useCallback, useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = "(max-width: 767px)";

function getSnapshot(): boolean {
  return window.matchMedia(MOBILE_BREAKPOINT).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsMobile(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    mql.addEventListener("change", onStoreChange);
    return () => mql.removeEventListener("change", onStoreChange);
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
