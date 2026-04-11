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
  Calculator,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  { href: "/dashboard/zakat", label: "Zakat", icon: Calculator, featureId: "zakat" },
  { href: "/dashboard/recurring", label: "Recurring", icon: Repeat2, featureId: "recurring" },
  { href: "/dashboard/retirement", label: "Retirement", icon: Timer, featureId: "retirement" },
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
      ? "bg-[color-mix(in_srgb,var(--workspace-shell)_10%,white)] text-foreground shadow-sm ring-1 ring-[color:color-mix(in_srgb,var(--workspace-shell)_16%,transparent)]"
      : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
  );

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
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={linkClass(active)}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`${linkClass(moreIsActive)} cursor-pointer select-none`}
            >
              More
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-52 rounded-2xl border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--card)_96%,white_4%)] p-1.5 shadow-[0_18px_38px_rgba(27,36,30,0.12)]"
          >
            {visibleMore.map((item) => {
              const active = isActive(item.href, pathname);
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 ${active ? "bg-[color-mix(in_srgb,var(--workspace-shell)_10%,white)] font-semibold text-foreground" : ""}`}
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
