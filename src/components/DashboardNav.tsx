"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Tags,
  Trophy,
  TrendingUp,
  CreditCard,
  Repeat,
  Repeat2,
  BarChart3,
  Timer,
  Settings,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import type { FeatureId } from "@/lib/features";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  featureId?: FeatureId;
}

const primaryItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight, featureId: "transactions" },
  { href: "/dashboard/accounts", label: "Accounts", icon: Wallet, featureId: "accounts" },
  { href: "/dashboard/investments", label: "Investments", icon: TrendingUp, featureId: "investments" },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, featureId: "reports" },
];

const moreItems: NavItem[] = [
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

const linkClass = (active: boolean) =>
  `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-foreground"
  }`;

export function DashboardNav() {
  const pathname = usePathname();
  const { isFeatureEnabled } = useFeatureFlags();

  const visiblePrimary = primaryItems.filter((item) => !item.featureId || isFeatureEnabled(item.featureId));
  const visibleMore = moreItems.filter((item) => !item.featureId || isFeatureEnabled(item.featureId));

  const moreIsActive = visibleMore.some((item) => isActive(item.href, pathname));

  return (
    <>
      {/* Desktop: primary links + "More" dropdown */}
      <div className="hidden items-center gap-1 md:flex">
        {visiblePrimary.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link key={item.href} href={item.href} className={linkClass(active)}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`${linkClass(moreIsActive)} cursor-pointer select-none`}
            >
              More
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {visibleMore.map((item) => {
              const active = isActive(item.href, pathname);
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={`flex w-full items-center gap-2 ${active ? "font-semibold text-foreground" : ""}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </>
  );
}
