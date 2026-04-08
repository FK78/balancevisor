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

const bottomNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/accounts", label: "Accounts", icon: Wallet },
  { href: "/dashboard/investments", label: "Investments", icon: TrendingUp },
];

const drawerRoutes = [
  "/dashboard/reports",
  "/dashboard/categories",
  "/dashboard/budgets",
  "/dashboard/goals",
  "/dashboard/debts",
  "/dashboard/subscriptions",
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

  const moreIsActive = drawerRoutes.some(
    (route) => pathname?.startsWith(route)
  );

  return (
    <>
      {/* iOS-style tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/70 backdrop-blur-2xl backdrop-saturate-150 md:hidden">
        <div
          className="mx-auto grid max-w-lg grid-cols-5"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {bottomNavItems.map((item) => {
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
