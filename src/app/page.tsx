import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  CalendarClock,
  CreditCard,
  Filter,
  Globe,
  Heart,
  Landmark,
  LineChart,
  MessageSquareText,
  Moon,
  PieChart,
  Receipt,
  Repeat,
  Repeat2,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
  Split,
  Tag,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const coreFeatures = [
  {
    icon: Landmark,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10 dark:bg-[#0A84FF]/15",
    title: "Net Worth Dashboard",
    description:
      "Your complete financial picture — net worth, assets, liabilities, investments, and spending on one screen with month-over-month trends.",
  },
  {
    icon: CreditCard,
    color: "text-[#AF52DE]",
    bg: "bg-[#AF52DE]/10 dark:bg-[#BF5AF2]/15",
    title: "Multi-Account Management",
    description:
      "Current accounts, savings, credit cards, and investments. Balances update automatically as you add, edit, or delete transactions.",
  },
  {
    icon: Receipt,
    color: "text-[#5AC8FA]",
    bg: "bg-[#5AC8FA]/10 dark:bg-[#64D2FF]/15",
    title: "Transaction Management",
    description:
      "Full pagination, search, sorting, date and account filtering, CSV import with flexible column mapping, and export.",
  },
  {
    icon: TrendingUp,
    color: "text-[#34C759]",
    bg: "bg-[#34C759]/10 dark:bg-[#30D158]/15",
    title: "Smart Budget Tracking",
    description:
      "Set weekly or monthly budgets per category with real-time progress bars. Get nudges before you overspend.",
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
      "Track loans, credit cards, and finance agreements with interest rates, minimum payments, and payoff progress.",
  },
  {
    icon: LineChart,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10 dark:bg-[#0A84FF]/15",
    title: "Investment Portfolio",
    description:
      "Connect Trading 212 to auto-sync positions, or add manual holdings with live prices from Yahoo Finance. Group holdings however you like.",
  },
  {
    icon: CalendarClock,
    color: "text-[#AF52DE]",
    bg: "bg-[#AF52DE]/10 dark:bg-[#BF5AF2]/15",
    title: "Subscription Manager",
    description:
      "Keep tabs on Netflix, Spotify, gym memberships — see monthly and yearly costs at a glance with upcoming renewal alerts.",
  },
  {
    icon: Repeat,
    color: "text-[#34C759]",
    bg: "bg-[#34C759]/10 dark:bg-[#30D158]/15",
    title: "Recurring Transactions",
    description:
      "Set up daily, weekly, monthly, or yearly recurring income and expenses that auto-generate when due.",
  },
  {
    icon: PieChart,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10 dark:bg-[#0A84FF]/15",
    title: "Spending Breakdown",
    description:
      "Beautiful colour-coded charts that show exactly where every penny goes, by category and over time.",
  },
  {
    icon: BarChart3,
    color: "text-[#FF9500]",
    bg: "bg-[#FF9500]/10 dark:bg-[#FF9F0A]/15",
    title: "Reports & Analytics",
    description:
      "12-month income vs expense trends, category spend analysis, daily and monthly cashflow charts with rolling averages.",
  },
  {
    icon: Tag,
    color: "text-[#5AC8FA]",
    bg: "bg-[#5AC8FA]/10 dark:bg-[#64D2FF]/15",
    title: "Custom Categories",
    description:
      "Your own categories with custom colours and icons, or start with sensible built-in defaults during onboarding.",
  },
];

const aiFeatures = [
  {
    icon: MessageSquareText,
    color: "text-[#AF52DE]",
    bg: "bg-[#AF52DE]/10 dark:bg-[#BF5AF2]/15",
    title: "AI Chat Assistant",
    description:
      "Slide-out AI panel on every dashboard page. Ask financial questions, get insights, and explore your data in plain English.",
  },
  {
    icon: Sparkles,
    color: "text-[#FF9500]",
    bg: "bg-[#FF9500]/10 dark:bg-[#FF9F0A]/15",
    title: "Natural Language Transactions",
    description:
      "Type \"£45 groceries yesterday\" and the AI parses it into a structured record with the right category, account, and date.",
  },
  {
    icon: Filter,
    color: "text-[#34C759]",
    bg: "bg-[#34C759]/10 dark:bg-[#30D158]/15",
    title: "Auto-Categorisation",
    description:
      "Pattern-matching rules first, then AI fallback — so Tesco maps to Groceries and Netflix maps to Subscriptions, automatically.",
  },
  {
    icon: BrainCircuit,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10 dark:bg-[#0A84FF]/15",
    title: "AI Monthly Report",
    description:
      "A streaming AI-generated summary of your month — spending patterns, budget performance, and personalised recommendations.",
  },
  {
    icon: Zap,
    color: "text-[#FF2D55]",
    bg: "bg-[#FF2D55]/10 dark:bg-[#FF375F]/15",
    title: "Weekly Digest",
    description:
      "AI-powered weekly financial digest with highlights, warnings, and actionable advice based on your recent activity.",
  },
  {
    icon: Bot,
    color: "text-[#5AC8FA]",
    bg: "bg-[#5AC8FA]/10 dark:bg-[#64D2FF]/15",
    title: "Subscription Savings Advisor",
    description:
      "AI analyses your subscriptions and suggests where you could save money or consolidate services.",
  },
];

const smartFeatures = [
  {
    icon: AlertTriangle,
    color: "text-[#FF9500]",
    bg: "bg-[#FF9500]/10 dark:bg-[#FF9F0A]/15",
    title: "Spending Anomaly Detection",
    description:
      "Automatically flags unusual spending — categories where you spent significantly more than your average.",
  },
  {
    icon: TrendingUp,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10 dark:bg-[#0A84FF]/15",
    title: "Cashflow Forecast",
    description:
      "Projected income and expenses for the month ahead with confidence scoring based on your history.",
  },
  {
    icon: Repeat2,
    color: "text-[#34C759]",
    bg: "bg-[#34C759]/10 dark:bg-[#30D158]/15",
    title: "Recurring Pattern Detection",
    description:
      "Scans your transactions and surfaces recurring patterns — weekly, bi-weekly, monthly, or yearly — so you can convert them.",
  },
  {
    icon: Bell,
    color: "text-[#FF2D55]",
    bg: "bg-[#FF2D55]/10 dark:bg-[#FF375F]/15",
    title: "Budget Alerts",
    description:
      "Browser push and email notifications when you approach or exceed your budget thresholds.",
  },
  {
    icon: Split,
    color: "text-[#AF52DE]",
    bg: "bg-[#AF52DE]/10 dark:bg-[#BF5AF2]/15",
    title: "Split Transactions",
    description:
      "Split a single payment across multiple categories — perfect for supermarket shops or mixed business expenses.",
  },
  {
    icon: Share2,
    color: "text-[#5AC8FA]",
    bg: "bg-[#5AC8FA]/10 dark:bg-[#64D2FF]/15",
    title: "Account Sharing",
    description:
      "Share accounts and budgets with family or a partner. Set view-only or edit permissions with invitation management.",
  },
];

const platformFeatures = [
  {
    icon: Landmark,
    color: "text-[#007AFF]",
    bg: "bg-[#007AFF]/10 dark:bg-[#0A84FF]/15",
    title: "Open Banking",
    description: "TrueLayer integration for UK bank accounts. Transactions sync automatically and on each login.",
  },
  {
    icon: Smartphone,
    color: "text-[#34C759]",
    bg: "bg-[#34C759]/10 dark:bg-[#30D158]/15",
    title: "PWA — Install Anywhere",
    description: "Installable on mobile and desktop with offline fallback, font caching, and stale-while-revalidate.",
  },
  {
    icon: Moon,
    color: "text-[#AF52DE]",
    bg: "bg-[#AF52DE]/10 dark:bg-[#BF5AF2]/15",
    title: "Dark Mode",
    description: "System-aware or manual dark/light theme toggle. Looks great day and night.",
  },
  {
    icon: Globe,
    color: "text-[#FF9500]",
    bg: "bg-[#FF9500]/10 dark:bg-[#FF9F0A]/15",
    title: "Multi-Currency",
    description: "Choose your base currency during onboarding — GBP, USD, EUR and more. All amounts format accordingly.",
  },
  {
    icon: Users,
    color: "text-[#5AC8FA]",
    bg: "bg-[#5AC8FA]/10 dark:bg-[#64D2FF]/15",
    title: "Guided Onboarding",
    description: "Step-by-step setup wizard — currency, accounts, categories, and feature discovery in under two minutes.",
  },
  {
    icon: Shield,
    color: "text-[#FF2D55]",
    bg: "bg-[#FF2D55]/10 dark:bg-[#FF375F]/15",
    title: "Encrypted & Secure",
    description: "AES-256-GCM encryption for account names, descriptions, and OAuth tokens. Row-level security via Supabase.",
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
    description: "A guided wizard walks you through currency, accounts, categories, budgets, goals, debts, and investments.",
  },
  {
    step: "3",
    emoji: "🤖",
    title: "Let AI do the heavy lifting",
    description: "Type transactions in plain English, auto-categorise imports, and get weekly AI insights on your spending.",
  },
  {
    step: "4",
    emoji: "📊",
    title: "See the full picture",
    description: "Net worth trends, cashflow forecasts, spending anomalies, and budget progress — all on one dashboard.",
  },
];

function FeatureGrid({ features }: { features: typeof coreFeatures }) {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up-stagger">
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
  );
}

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
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Accounts, budgets, investments, debts, goals, subscriptions, and an AI assistant
            that understands plain English — all in one beautifully simple dashboard.
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

      {/* Stats */}
      <section className="px-6 py-14" style={{ borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {[
            { value: "30+", label: "Features" },
            { value: "6", label: "AI-powered tools" },
            { value: "5", label: "Account types" },
            { value: "£0", label: "Forever" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
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
          <FeatureGrid features={coreFeatures} />
        </div>
      </section>

      {/* AI Section */}
      <section className="px-6 py-24 sm:py-32" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#AF52DE]/10 px-4 py-2 text-sm font-medium text-[#AF52DE]">
              <Sparkles className="h-4 w-4" />
              Powered by Groq AI
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI that actually helps with your finances
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Six AI-powered tools built in — from natural language transaction entry to personalised monthly reports.
            </p>
          </div>
          <FeatureGrid features={aiFeatures} />
        </div>
      </section>

      {/* Smart Features */}
      <section className="px-6 py-24 sm:py-32" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Smart automation that saves you time
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Anomaly detection, cashflow forecasting, recurring pattern recognition, and more — working quietly in the background.
            </p>
          </div>
          <FeatureGrid features={smartFeatures} />
        </div>
      </section>

      {/* Platform / Integration features */}
      <section className="px-6 py-24 sm:py-32" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for real life
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Open banking, dark mode, multi-currency, PWA support, and bank-grade encryption.
            </p>
          </div>
          <FeatureGrid features={platformFeatures} />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 sm:py-32" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No complicated setup. A guided wizard gets you from zero to full dashboard in under two minutes.
            </p>
          </div>
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
                Account names, transaction descriptions, and all OAuth tokens are encrypted at rest
                with AES-256-GCM. Supabase row-level security isolates your data completely.
                We don&apos;t sell data, serve ads, or share anything with third parties. Ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="px-6 py-14" style={{ borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Built with Next.js 16 &middot; TypeScript &middot; Tailwind CSS 4 &middot; Drizzle ORM &middot; PostgreSQL &middot; Supabase Auth &middot; Groq AI &middot; Recharts &middot; TanStack Table &middot; Radix UI
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 sm:py-32">
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
