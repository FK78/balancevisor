"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Calculator,
  Settings,
} from "lucide-react";
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
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", icon: Wallet, featureId: "accounts" },
  { href: "/dashboard/investments", label: "Invest", icon: TrendingUp, featureId: "investments" },
  { href: "/dashboard/zakat", label: "Zakat", icon: Calculator, featureId: "zakat" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isFeatureEnabled } = useFeatureFlags();

  const visibleItems = bottomNavItems.filter((item) => !item.featureId || isFeatureEnabled(item.featureId));
  const colCount = visibleItems.length;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--background)_88%,var(--card)_12%)]/95 backdrop-blur-xl xl:hidden"
    >
      <div
        className="mx-auto grid max-w-lg px-2 pt-2"
        style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)`, paddingBottom: "calc(env(safe-area-inset-bottom) + 0.45rem)" }}
      >
        {visibleItems.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[70px] flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 py-2 transition-all",
                active
                  ? "bg-[color-mix(in_srgb,var(--workspace-shell)_10%,var(--card))] text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
              )}
            >
              <item.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.5} />
              <span className={`text-[10px] leading-tight ${active ? "font-semibold" : "font-normal"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
