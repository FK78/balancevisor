"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Settings,
  Calculator,
} from "lucide-react";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import type { FeatureId } from "@/lib/features";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  featureId?: FeatureId;
}

const primaryItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", icon: Wallet, featureId: "accounts" },
  { href: "/dashboard/investments", label: "Investments", icon: TrendingUp, featureId: "investments" },
  { href: "/dashboard/zakat", label: "Zakat", icon: Calculator, featureId: "zakat" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

const linkClass = (active: boolean) =>
  cn(
    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
    active
      ? "bg-[color-mix(in_srgb,var(--workspace-shell)_10%,var(--card))] text-foreground shadow-sm ring-1 ring-[color:color-mix(in_srgb,var(--workspace-shell)_16%,transparent)]"
      : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
  );

export function DashboardNav() {
  const pathname = usePathname();
  const { isFeatureEnabled } = useFeatureFlags();

  const visible = primaryItems.filter((item) => !item.featureId || isFeatureEnabled(item.featureId));

  return (
    <div className="hidden items-center gap-1 xl:flex">
      {visible.map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={linkClass(active)}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
