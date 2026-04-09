"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tags,
  Target,
  Trophy,
  CreditCard,
  Repeat,
  Repeat2,
  BarChart3,
  Timer,
  Settings,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import type { FeatureId } from "@/lib/features";

interface DrawerItem {
  href: string;
  label: string;
  icon: typeof BarChart3;
  featureId?: FeatureId;
}

const drawerItems: DrawerItem[] = [
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, featureId: "reports" },
  { href: "/dashboard/categories", label: "Categories", icon: Tags, featureId: "categories" },
  { href: "/dashboard/budgets", label: "Budgets", icon: Target, featureId: "budgets" },
  { href: "/dashboard/goals", label: "Goals", icon: Trophy, featureId: "goals" },
  { href: "/dashboard/debts", label: "Debts", icon: CreditCard, featureId: "debts" },
  { href: "/dashboard/subscriptions", label: "Subscriptions", icon: Repeat, featureId: "subscriptions" },
  { href: "/dashboard/recurring", label: "Recurring", icon: Repeat2, featureId: "recurring" },
  { href: "/dashboard/retirement", label: "Retirement", icon: Timer },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

export function MobileNavDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const { isFeatureEnabled } = useFeatureFlags();

  const visibleItems = drawerItems.filter((item) => !item.featureId || isFeatureEnabled(item.featureId));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[14px] px-0 pb-[env(safe-area-inset-bottom)]"
      >
        {/* iOS-style grabber handle */}
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-[5px] w-9 rounded-full bg-muted-foreground/30" />
        </div>

        <SheetTitle className="sr-only">More</SheetTitle>
        <SheetDescription className="sr-only">
          Additional navigation options
        </SheetDescription>

        {/* iOS-style grouped list */}
        <nav className="mx-4 mb-4 overflow-hidden rounded-xl bg-card">
          {visibleItems.map((item, i) => {
            const active = isActive(item.href, pathname);
            const isLast = i === visibleItems.length - 1;
            return (
              <SheetClose key={item.href} asChild>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors active:bg-secondary ${
                    !isLast ? "border-b border-border/60" : ""
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-md ${
                      active ? "bg-primary/15" : "bg-muted"
                    }`}
                  >
                    <item.icon
                      className={`h-[16px] w-[16px] ${
                        active ? "text-primary" : "text-foreground"
                      }`}
                      strokeWidth={1.6}
                    />
                  </div>
                  <span
                    className={`flex-1 text-[15px] ${
                      active
                        ? "font-semibold text-primary"
                        : "font-normal text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
