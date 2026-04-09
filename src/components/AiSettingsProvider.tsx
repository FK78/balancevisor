"use client";

import { createContext, useContext, type ReactNode } from "react";

type AiSettingsContextValue = {
  aiEnabled: boolean;
};

const AiSettingsContext = createContext<AiSettingsContextValue>({ aiEnabled: true });

export function AiSettingsProvider({
  aiEnabled,
  children,
}: {
  aiEnabled: boolean;
  children: ReactNode;
}) {
  return (
    <AiSettingsContext.Provider value={{ aiEnabled }}>
      {children}
    </AiSettingsContext.Provider>
  );
}

export function useAiEnabled(): boolean {
  return useContext(AiSettingsContext).aiEnabled;
}
