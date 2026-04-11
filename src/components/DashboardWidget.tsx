"use client";

import { type ReactNode } from "react";

interface DashboardWidgetProps {
  readonly id: string;
  readonly children: ReactNode;
}

export function DashboardWidget({ children }: DashboardWidgetProps) {
  return (
    <div className="space-y-0">
      {children}
    </div>
  );
}
