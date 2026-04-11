import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, TrendingUp, PieChart, Shield, Landmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  { icon: TrendingUp, text: "Calm money overview with clear next steps", color: "bg-[color-mix(in_srgb,var(--workspace-accent)_16%,white)] text-[var(--workspace-accent)]" },
  { icon: PieChart, text: "Simple spending breakdowns that stay easy to scan", color: "bg-[color-mix(in_srgb,var(--workspace-blue)_30%,white)] text-[#4f6e84]" },
  { icon: Landmark, text: "Accounts, budgets, and goals in one organised cockpit", color: "bg-[color-mix(in_srgb,var(--workspace-shell)_10%,white)] text-[var(--workspace-shell)]" },
  { icon: Shield, text: "Bank-grade protection with quiet, trustworthy design", color: "bg-[color-mix(in_srgb,var(--workspace-danger)_12%,white)] text-[var(--workspace-danger)]" },
];

export function AuthLayout({
  children,
  backHref = "/",
  backLabel = "Back to home",
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="soft-brand-shell min-h-svh bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--workspace-blue)_18%,transparent)_0%,transparent_38%),linear-gradient(180deg,color-mix(in_srgb,var(--workspace-muted-surface)_42%,transparent)_0%,transparent_42%)] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]">
      <div className="relative hidden min-h-svh flex-col justify-between px-10 py-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold">
          <Image src="/logo.svg" alt="Wealth" width={32} height={32} />
          <span>Wealth</span>
        </Link>

        <div className="space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--workspace-accent)_16%,white)] px-4 py-2 text-sm font-medium text-[var(--workspace-shell)]">
            <Sparkles className="h-3.5 w-3.5" />
            Calm money clarity
          </div>
          <h2 className="font-display text-4xl leading-tight tracking-tight text-foreground xl:text-5xl">
            See what matters.
            <br />
            Do the next right thing.
          </h2>
          <p className="max-w-md text-base leading-7 text-muted-foreground">
            BalanceVisor brings your money into a calmer workspace, so accounts, budgets, and goals feel easy to understand instead of noisy.
          </p>
          <div className="grid gap-3 pt-2">
            {highlights.map((h) => (
              <div key={h.text} className="flex items-center gap-3 rounded-[1.4rem] border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--card)_92%,white_8%)] px-4 py-3 text-sm shadow-sm">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${h.color}`}>
                  <h.icon className="h-4 w-4" />
                </div>
                <span className="leading-6 text-muted-foreground">{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Wealth. A softer way to stay on top of your money.
        </p>
      </div>

      <div className="relative flex min-h-svh flex-1 flex-col items-center justify-center px-5 py-20 sm:px-8 md:px-10">
        <Button asChild variant="ghost" size="sm" className="absolute left-5 top-5 md:left-10 md:top-10">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>

        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <Image src="/logo.svg" alt="Wealth" width={30} height={30} />
          <span className="text-lg font-semibold">Wealth</span>
        </div>

        <div className="w-full max-w-md rounded-[2rem] border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--card)_94%,white_6%)] p-4 shadow-[0_24px_56px_rgba(27,36,30,0.12)] sm:p-5">
          <div className="mb-4 space-y-2 lg:hidden">
            <p className="cockpit-kicker">Simple money clarity</p>
            <h1 className="font-display text-3xl leading-tight tracking-tight text-foreground">
              Welcome to a calmer money workspace
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in or create an account to get your dashboard, plans, and decisions lined up in one place.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
