"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { markFeatureVisited } from "@/db/mutations/onboarding";

const FEATURE_ROUTES: Record<string, string> = {
  budgets: "/dashboard/budgets",
  goals: "/dashboard/goals",
  debts: "/dashboard/debts",
  subscriptions: "/dashboard/subscriptions",
  investments: "/dashboard/investments",
};

const FEATURE_LABELS: Record<string, string> = {
  budgets: "Budgets",
  goals: "Goals",
  debts: "Debts",
  subscriptions: "Subscriptions",
  investments: "Investments",
};

const ROUTE_TO_FEATURE: Record<string, string> = Object.fromEntries(
  Object.entries(FEATURE_ROUTES).map(([k, v]) => [v, k])
);

export function NextFeatureButtonClient({ pendingFeatures }: { pendingFeatures: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const currentFeature = ROUTE_TO_FEATURE[pathname] || "";
  const remainingFeatures = pendingFeatures.filter((f) => f !== currentFeature);
  const nextFeature = remainingFeatures[0];

  useEffect(() => {
    // Mark current feature as visited
    if (currentFeature) {
      markFeatureVisited(currentFeature);
    }
    
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, [currentFeature]);

  if (!nextFeature || isDismissed) return null;

  const handleNext = () => {
    const route = FEATURE_ROUTES[nextFeature];
    if (route) {
      router.push(route);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          onClick={handleNext}
          size="lg"
          className="shadow-lg shadow-primary/20"
        >
          Set up {FEATURE_LABELS[nextFeature]}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          onClick={handleDismiss}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
