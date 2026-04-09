<p align="center">
  <img src="public/logo.svg" alt="BalanceVisor logo" width="120" height="120" />
</p>

<h1 align="center">BalanceVisor</h1>

<p align="center">
  Open-source personal finance dashboard with 30+ features, 6 AI-powered tools, and bank-grade encryption.<br/>
  Next.js 16 · Drizzle ORM · Supabase · Groq AI · TrueLayer · Trading 212 · Yahoo Finance
</p>

---

I built this because I wanted one place to see everything: bank balances, investments, budgets, and debt, without paying for an app that does half of what I need.

You can connect your bank via TrueLayer Open Banking, or just add accounts manually. There's an AI assistant (Groq) that understands plain English — type "£45 groceries yesterday" and it figures out the rest.

## Features

### Core

**Dashboard** — Net worth, month-over-month trends, cashflow chart, spending breakdown, budget progress, savings goals, upcoming bills, smart insights, spending anomaly alerts, and cashflow forecast with confidence scoring. Everything on one page.

**Accounts** — Current accounts, savings, credit cards, and investment accounts. Balances update automatically when you add, edit, or delete transactions. Share accounts with family or a partner (view-only or edit permissions).

**Transactions** — Income and expense tracking with categories, recurring transaction support (daily through yearly), CSV import with flexible column mapping, drag-and-drop upload, and export. Split transactions across multiple categories. Full-text search, date and account filtering, pagination, and sorting.

**Budgets** — Weekly or monthly limits per category with real-time progress bars. Alerts fire via browser push notification and email when you approach or exceed your threshold.

**Goals** — Savings targets with deadlines and contribution tracking.

**Debt Tracker** — Loans, credit cards, and finance agreements with interest rates, minimum payments, remaining balance, and payoff progress. Debt payments are recorded automatically when review flags are accepted.

**Investments** — Connect Trading 212 with your API key and secret, or add holdings manually. Live prices from Yahoo Finance refresh when stale. Group holdings however you want.

**Subscriptions** — Track Netflix, Spotify, gym memberships, and more. See monthly and yearly cost totals, upcoming renewals, overdue alerts, and pause/resume individual subscriptions.

**Recurring Transactions** — Set up daily, weekly, monthly, or yearly recurring income and expenses. They auto-generate when due on each dashboard load.

**Reports** — 12-month income vs expense trends, monthly category spend analysis, and daily cashflow charts with rolling averages. Dedicated reports page with interactive Recharts visualisations.

**Categories** — Custom categories with colours and icons, or start with sensible built-in defaults. Auto-categorisation rules with pattern matching.

### AI-Powered (Groq)

**AI Chat Assistant** — Slide-out panel available on every dashboard page. Ask financial questions, get insights, and explore your data in plain English.

**Natural Language Transactions** — Type "£45 groceries yesterday" and the AI parses it into a structured record with the right category, account, and date. Quick-add dialog with real-time preview.

**Auto-Categorisation** — Pattern-matching rules first, then AI fallback when no rule matches. Groq picks the best category from your list.

**AI Monthly Report** — Streaming AI-generated summary of your month — spending patterns, budget performance, and personalised recommendations. Displayed on the dashboard.

**Weekly Digest** — AI-powered weekly financial digest with highlights, warnings, and actionable advice based on recent activity.

**Subscription Savings Advisor** — AI analyses your active subscriptions and suggests where you could save money or consolidate services.

### Smart Automation

**Spending Anomaly Detection** — Automatically flags categories where you spent significantly more than your historical average.

**Cashflow Forecast** — Projected income and expenses for the month ahead with high/medium/low confidence scoring based on your transaction history.

**Recurring Pattern Detection** — Scans your transactions and surfaces recurring patterns (weekly, bi-weekly, monthly, yearly) so you can convert them to tracked recurring transactions.

**Transaction Review Flags** — Flags transactions that look like subscription payments or debt repayments. Accept to link them automatically, or dismiss.

**AI-Enriched CSV Imports** — After CSV import, a background job sends new transactions to the AI for auto-categorisation.

### Platform

**Open Banking** — TrueLayer OAuth flow for UK bank accounts. Transactions sync on connect and on each login (throttled to hourly). Manual sync button available.

**PWA** — Installable on mobile and desktop. Offline fallback page, font caching, stale-while-revalidate for static assets. Service worker with custom install prompt.

**Dark Mode** — System-aware or manual dark/light theme toggle with full support across all pages and charts.

**Multi-Currency** — Choose your base currency during onboarding (GBP, USD, EUR, and more). All amounts format accordingly throughout the app.

**Guided Onboarding** — Step-by-step wizard: currency selection, account creation, category setup (defaults or custom), feature discovery, and review summary.

**Mobile-First Navigation** — iOS-style bottom tab bar on mobile with a "More" drawer for secondary pages. Full desktop nav with dropdown menu.

**Account Sharing** — Share accounts and budgets with other users via email invitation. View-only or edit permissions with revocation.

**Security** — Account names, transaction descriptions, and all OAuth tokens encrypted at rest with AES-256-GCM. Supabase row-level security isolates user data. Encryption key lives in your environment, not the codebase.

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (SSR) |
| AI | Vercel AI SDK v6, Groq (`openai/gpt-oss-20b`) |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui, Radix UI, Lucide |
| Charts | Recharts |
| Tables | TanStack Table |
| Banking | TrueLayer Open Banking |
| Investments | Trading 212 API, Yahoo Finance |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/                  # AI chat assistant (streaming)
│   │   ├── parse-transaction/     # NL → structured transaction
│   │   ├── parse-csv-columns/     # AI CSV column auto-detect
│   │   ├── ai-enrich-transactions/# Post-import AI categorisation
│   │   ├── monthly-report/        # AI monthly summary (streaming)
│   │   ├── weekly-digest/         # AI weekly digest (streaming)
│   │   ├── subscription-advisor/  # AI subscription savings advice
│   │   └── truelayer/             # OAuth connect + callback
│   ├── auth/                      # Login, sign-up, password reset
│   ├── dashboard/
│   │   ├── accounts/
│   │   ├── budgets/
│   │   ├── categories/            # Categories + auto-categorisation rules
│   │   ├── debts/                 # Debt tracker with payments
│   │   ├── goals/                 # Savings goals + contributions
│   │   ├── investments/           # T212 + manual holdings + groups
│   │   ├── recurring/             # Recurring transaction management
│   │   ├── reports/               # 12-month analytics page
│   │   ├── settings/              # User settings
│   │   ├── subscriptions/         # Subscription tracker + AI advisor
│   │   ├── transactions/          # Table, CSV import/export
│   │   │   └── export/            # CSV export route
│   │   ├── layout.tsx             # Shell, navbar, chat, bank sync
│   │   └── page.tsx               # Overview dashboard
│   ├── onboarding/                # Multi-step setup wizard
│   └── page.tsx                   # Landing page
├── components/
│   ├── dashboard/                 # Dashboard widgets (charts, insights, forecasts)
│   ├── ui/                        # shadcn/ui primitives
│   ├── BankSyncTrigger.tsx        # Background auto-sync on login
│   ├── ChatPanel.tsx              # AI assistant slide-out
│   ├── ConnectBankButton.tsx      # TrueLayer open banking dialog
│   ├── ConnectTrading212Dialog.tsx
│   ├── ImportCSVDialog.tsx        # CSV import with column mapping
│   ├── InstallPrompt.tsx          # PWA install banner
│   ├── MobileBottomNav.tsx        # iOS-style bottom tab bar
│   ├── MobileNavDrawer.tsx        # Secondary pages drawer
│   ├── QuickAddTransaction.tsx    # NL quick-add dialog
│   ├── RecurringDetectionBanner.tsx
│   ├── ShareDialog.tsx            # Account/budget sharing
│   ├── SplitTransactionDialog.tsx
│   ├── SubscriptionAIAdvisor.tsx  # AI subscription savings
│   ├── ThemeToggle.tsx            # Dark/light mode toggle
│   ├── TransactionReviewBanner.tsx
│   └── ...
├── db/
│   ├── schema.ts                  # Drizzle table definitions
│   ├── queries/                   # Read-only data access
│   ├── mutations/                 # Server actions (writes)
│   └── migrations/                # One-off migration scripts
├── lib/
│   ├── auto-categorise.ts         # Rule matching + AI fallback
│   ├── cashflow-forecast.ts       # Projected income/expenses
│   ├── encryption.ts              # AES-256-GCM
│   ├── recurring-detection.ts     # Pattern detection engine
│   ├── recurring-transactions.ts  # Due transaction generator
│   ├── spending-anomalies.ts      # Anomaly detection
│   ├── trading212.ts              # T212 API client (Basic Auth)
│   ├── truelayer.ts               # TrueLayer API client
│   ├── yahoo-finance.ts           # Quote + ticker search
│   ├── budget-alerts.ts           # Threshold checks + email
│   └── supabase/                  # Server, browser, middleware clients
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   └── icons/                     # App icons (192, 512, maskable)
└── index.ts                       # Shared DB instance
```

## Getting Started

You'll need Node.js 20+ and a Supabase project (or any Postgres instance).

```bash
git clone https://github.com/FK78/BalanceVisor.git
cd BalanceVisor
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Supabase Postgres connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3000` for dev |
| `ENCRYPTION_KEY` | Yes | 32-byte hex - see below |
| `GROQ_API_KEY` | No | AI categorisation, NL transactions, chat |
| `SMTP_HOST` | No | SMTP server for email alerts (+ `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) |
| `TRUELAYER_CLIENT_ID` | No | Open banking |
| `TRUELAYER_CLIENT_SECRET` | No | Open banking |
| `TRUELAYER_SANDBOX` | No | Set `true` for sandbox mode |

Generate the encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Push the schema and start the dev server:

```bash
npx drizzle-kit push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Database

Schema lives in `src/db/schema.ts`, managed by Drizzle.

| Table | What it stores |
| --- | --- |
| `accounts` | Financial accounts with encrypted names |
| `transactions` | Income/expense records, encrypted descriptions, recurring patterns |
| `categories` | Spending categories (colour, icon) |
| `categorisation_rules` | Pattern → category mappings for auto-categorisation |
| `budgets` | Spending limits per category |
| `budget_alert_preferences` | Per-budget alert thresholds |
| `budget_notifications` | Alert dispatch history |
| `goals` | Savings goals with contributions |
| `debts` | Debt tracking with interest rates |
| `debt_payments` | Debt payment history |
| `subscriptions` | Recurring subscriptions |
| `net_worth_snapshots` | Historical net worth data points |
| `truelayer_connections` | Encrypted OAuth tokens, last sync timestamp |
| `trading212_connections` | Encrypted API key + secret |
| `manual_holdings` | Investment positions with cached prices |
| `investment_groups` | Portfolio grouping |
| `shared_access` | Account sharing between users |
| `transaction_review_flags` | Flags for subscription/debt transaction linking |
| `user_onboarding` | Onboarding state and base currency |
| `default_category_templates` | Built-in category templates |

## Mock Mode (No Supabase)

Set `MOCK_AUTH=true` and `NEXT_PUBLIC_MOCK_AUTH=true` in `.env` to skip Supabase auth entirely. Middleware bypasses all checks, and a hardcoded mock user is used. Useful for local development without a Supabase project.

```bash
npx drizzle-kit push   # Push schema
npx tsx src/db/seed.ts  # Populate with fake data for the mock user
npm run dev
```

## License

MIT
