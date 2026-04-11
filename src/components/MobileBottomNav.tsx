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
import { cn } from "@/lib/utils";

interface BottomNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  featureId?: FeatureId;
}

const bottomNavItems: BottomNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
  "/dashboard/retirement",
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
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--background)_88%,white_12%)]/95 backdrop-blur-xl md:hidden"
      >
        <div
          className="mx-auto grid max-w-lg px-2 pt-2"
          style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)`, paddingBottom: "calc(env(safe-area-inset-bottom) + 0.45rem)" }}
        >
          {visibleBottomItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[70px] flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 py-2 transition-all",
                  active
                    ? "bg-[color-mix(in_srgb,var(--workspace-shell)_10%,white)] text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
                )}
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
            type="button"
            aria-label="More"
            aria-expanded={drawerOpen}
            className={cn(
              "flex min-h-[70px] flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 py-2 transition-all",
              moreIsActive || drawerOpen
                ? "bg-[color-mix(in_srgb,var(--workspace-shell)_10%,white)] text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
            )}
          >
            <MoreHorizontal
              className="h-[22px] w-[22px]"
              strokeWidth={moreIsActive || drawerOpen ? 2.2 : 1.5}
            />
            <span
              className={cn(
                "text-[10px] leading-tight",
                moreIsActive || drawerOpen ? "font-semibold" : "font-normal",
              )}
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
