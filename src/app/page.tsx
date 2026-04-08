import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  CreditCard,
  Filter,
  Heart,
  Landmark,
  LineChart,
  PieChart,
  Receipt,
  Repeat,
  Shield,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: TrendingUp,
    color: "text-[#34C759]",
    bg: "bg-[#34C759]/10 dark:bg-[#30D158]/15",
    title: "Smart Budget Tracking",
    description:
      "Set monthly or weekly budgets per category with real-time progress bars. Get nudges before you overspend.",
  },
  {
    icon: PieChart,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10 dark:bg-[#0A84FF]/15",
    title: "Spending Breakdown",
    description:
      "Beautiful colour-coded charts that show exactly where every penny goes.",
  },
  {
    icon: CreditCard,
    color: "text-[#AF52DE]",
    bg: "bg-[#AF52DE]/10 dark:bg-[#BF5AF2]/15",
    title: "Multi-Account Management",
    description:
      "Current accounts, savings, credit cards, and investment accounts — all in one cosy place.",
  },
  {
    icon: LineChart,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10 dark:bg-[#0A84FF]/15",
    title: "Investment Portfolio",
    description:
      "Connect Trading 212 to auto-sync positions, or track manual holdings with live Yahoo Finance prices.",
  },
  {
    icon: Target,
    color: "text-[#FF2D55]",
    bg: "bg-[#FF2D55]/10 dark:bg-[#FF375F]/15",
    title: "Savings Goals",
    description:
      "Set targets with deadlines, track contributions, and watch your progress bar fill up over time.",
  },
  {
    icon: Wallet,
    color: "text-[#FF3B30]",
    bg: "bg-[#FF3B30]/10 dark:bg-[#FF453A]/15",
    title: "Debt Tracker",
    description:
      "Track loans, credit cards, and finance with interest rates, minimum payments, and payoff progress.",
  },
  {
    icon: CalendarClock,
    color: "text-[#AF52DE]",
    bg: "bg-[#AF52DE]/10 dark:bg-[#BF5AF2]/15",
    title: "Subscription Manager",
    description:
      "Keep tabs on Netflix, Spotify, gym — see monthly and yearly costs at a glance with renewal reminders.",
  },
  {
    icon: Repeat,
    color: "text-[#34C759]",
    bg: "bg-[#34C759]/10 dark:bg-[#30D158]/15",
    title: "Recurring Transactions",
    description:
      "Set up daily, weekly, or monthly recurring income and expenses that auto-generate when due.",
  },
  {
    icon: BarChart3,
    color: "text-[#FF9500]",
    bg: "bg-[#FF9500]/10 dark:bg-[#FF9F0A]/15",
    title: "Cashflow Charts",
    description:
      "Income vs expenses over time with trends and rolling averages. Spot patterns early.",
  },
  {
    icon: Bell,
    color: "text-[#FF2D55]",
    bg: "bg-[#FF2D55]/10 dark:bg-[#FF375F]/15",
    title: "Budget Alerts",
    description:
      "Browser and email notifications when you&apos;re approaching your budget limit.",
  },
  {
    icon: Tag,
    color: "text-[#5AC8FA]",
    bg: "bg-[#5AC8FA]/10 dark:bg-[#64D2FF]/15",
    title: "Custom Categories",
    description:
      "Your own categories with custom colours and icons, or start with sensible defaults.",
  },
  {
    icon: Filter,
    color: "text-[#FF9500]",
    bg: "bg-[#FF9500]/10 dark:bg-[#FF9F0A]/15",
    title: "Auto-Categorisation",
    description:
      "Pattern-matching rules so Tesco → Groceries and Netflix → Subscriptions, automatically.",
  },
  {
    icon: Receipt,
    color: "text-[#5AC8FA]",
    bg: "bg-[#5AC8FA]/10 dark:bg-[#64D2FF]/15",
    title: "Transaction Management",
    description:
      "Full pagination, search, sorting, date filtering, CSV import & export.",
  },
  {
    icon: Landmark,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10 dark:bg-[#0A84FF]/15",
    title: "Net Worth Dashboard",
    description:
      "Your complete financial picture — net worth, investments, budgets, spending, and goals on one screen.",
  },
];

const steps = [
  {
    step: "1",
    emoji: "👋",
    title: "Create your account",
    description: "Sign up in seconds with email. No credit card, no trial — just free.",
  },
  {
    step: "2",
    emoji: "🏦",
    title: "Set up your finances",
    description: "Add accounts, budgets, goals, debts, subscriptions, and investments in a guided onboarding flow.",
  },
  {
    step: "3",
    emoji: "✨",
    title: "Track everything",
    description: "Log transactions, watch budgets, grow investments, and crush your financial goals.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl" style={{ borderBottom: '0.5px solid var(--border)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
            <Image src="/logo.svg" alt="BalanceVisor logo" width={30} height={30} />
            <span>BalanceVisor</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            100% free — no ads, no premium tier
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
            Your money, finally{" "}
            <span className="text-primary">
              under control
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            BalanceVisor helps you track spending, set budgets, manage investments,
            crush savings goals, and see your full financial picture in one beautifully simple dashboard.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto px-8">
              <Link href="/auth/sign-up">
                Start tracking for free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/auth/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Social proof stats */}
      <section className="px-6 py-14" style={{ borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {[
            { value: 14, label: "Feature areas", prefix: "" },
            { value: 5, label: "Account types", prefix: "" },
            { value: 6, label: "Chart views", prefix: "" },
            { value: 0, label: "Forever", prefix: "£" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-3xl font-bold text-primary">
                {stat.prefix}{stat.value}
              </p>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage your money
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No bloat, no upsells. Every feature is included from day one.
            </p>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up-stagger">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-card p-5 transition-colors"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.bg}`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 sm:py-32" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No complicated setup. Just start adding your data.
            </p>
          </div>
          <div className="mt-16 grid gap-10 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  {s.emoji}
                </div>
                <h3 className="mt-4 text-[15px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security callout */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl bg-card p-8 sm:p-12">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Your data stays yours</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                BalanceVisor uses Supabase with row-level security — your financial data is
                isolated and encrypted. We don&apos;t sell data, serve ads, or share anything
                with third parties. Ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 sm:py-32" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to take control?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join BalanceVisor today — it takes less than a minute and
            it&apos;s completely free. No catches.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto px-8">
              <Link href="/auth/sign-up">
                Create your free account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <Image src="/logo.svg" alt="BalanceVisor" width={22} height={22} />
            BalanceVisor
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 text-primary fill-primary" /> using Next.js &amp; Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
