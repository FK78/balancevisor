"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import type { FeatureId } from "@/lib/features";

interface BottomNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  featureId?: FeatureId;
}

const bottomNavItems: BottomNavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight, featureId: "transactions" },
  { href: "/dashboard/accounts", label: "Accounts", icon: Wallet, featureId: "accounts" },
  { href: "/dashboard/investments", label: "Investments", icon: TrendingUp, featureId: "investments" },
];

const drawerRoutes = [
  "/dashboard/reports",
  "/dashboard/categories",
  "/dashboard/budgets",
  "/dashboard/goals",
  "/dashboard/debts",
  "/dashboard/subscriptions",
  "/dashboard/zakat",
  "/dashboard/recurring",
  "/dashboard/settings",
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isFeatureEnabled } = useFeatureFlags();

  const visibleBottomItems = bottomNavItems.filter((item) => !item.featureId || isFeatureEnabled(item.featureId));
  const colCount = visibleBottomItems.length + 1;

  const moreIsActive = drawerRoutes.some(
    (route) => pathname?.startsWith(route)
  );

  return (
    <>
      {/* iOS-style tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 bg-card/80 backdrop-blur-xl md:hidden" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div
          className="mx-auto grid max-w-lg"
          style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)`, paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {visibleBottomItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-[2px] pb-1 pt-2 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={active ? 2.2 : 1.5}
                />
                <span
                  className={`text-[10px] leading-tight ${
                    active ? "font-semibold" : "font-normal"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center justify-center gap-[2px] pb-1 pt-2 transition-colors ${
              moreIsActive
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <MoreHorizontal
              className="h-[22px] w-[22px]"
              strokeWidth={moreIsActive ? 2.2 : 1.5}
            />
            <span
              className={`text-[10px] leading-tight ${
                moreIsActive ? "font-semibold" : "font-normal"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      <MobileNavDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
