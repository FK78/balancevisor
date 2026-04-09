"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { FeatureId } from "@/lib/features";

interface FeatureFlagsContextValue {
  readonly disabledFeatures: readonly string[];
  isFeatureEnabled: (id: FeatureId) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({
  disabledFeatures: [],
  isFeatureEnabled: () => true,
});

export function FeatureFlagsProvider({
  disabledFeatures,
  children,
}: {
  disabledFeatures: readonly string[];
  children: ReactNode;
}) {
  const value = useMemo<FeatureFlagsContextValue>(() => {
    const set = new Set(disabledFeatures);
    return {
      disabledFeatures,
      isFeatureEnabled: (id: FeatureId) => !set.has(id),
    };
  }, [disabledFeatures]);

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
