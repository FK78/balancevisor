<p align="center">
  <img src="public/logo.svg" alt="Wealth logo" width="120" height="120" />
</p>

<h1 align="center">Wealth</h1>

<p align="center">
  Personal finance dashboard for accounts, budgets, transactions, investments, goals, debt tracking, and an AI assistant.<br/>
  Next.js 16 · Drizzle ORM · Supabase · Groq AI
</p>

---

I built this because I wanted one place to see everything: bank balances, investments, budgets, and debt, without paying for an app that does half of what I need.

You can connect your bank via TrueLayer Open Banking, or just add accounts manually. There's an AI assistant (Groq) that understands plain English, type "£45 groceries yesterday" and it figures out the rest.

## Features

**Dashboard** - Net worth, month-over-month trends, cashflow chart, spending breakdown, budget progress, and savings goals. Everything on one page.

**Accounts** - Current accounts, savings, credit cards, and investments. Balances update automatically when you add, edit, or delete transactions.

**Transactions** - Income and expense tracking with categories, recurring transaction support (daily through yearly), CSV import with flexible column mapping, and export. Split transactions work too.

**Budgets** - Weekly or monthly limits per category. Alerts fire via browser notification and email when you're close to the edge.

**Goals** - Savings targets with deadlines and contribution history.

**Debt Tracker** - Interest rates, minimum payments, payoff progress.

**Investments** - Connect Trading 212 with your API key, or add holdings manually. Prices pull from Yahoo Finance and refresh when they're stale. You can group holdings however you want.

**Open Banking** - TrueLayer OAuth flow for UK bank accounts. Transactions sync on connect and on each login (throttled to hourly). There's a manual sync button if you don't want to wait.

**AI** - Three things:
- Auto-categorisation: when no rule matches, Groq picks the best category from your list
- Natural language input: describe a transaction in plain English and it parses into a structured record
- Chat assistant: slide-out panel for financial questions, available on every dashboard page

**PWA** - Installable on mobile and desktop. Offline fallback, font caching, stale-while-revalidate for static assets.

**Security** - Account names, transaction descriptions, and all OAuth tokens are encrypted at rest with AES-256-GCM. The key lives in your environment, not the codebase.

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
│   │   ├── chat/               # AI chat assistant route (streaming)
│   │   ├── parse-transaction/  # NL → structured transaction route
│   │   └── truelayer/          # OAuth connect + callback
│   ├── auth/                   # Login, sign-up, password reset
│   ├── dashboard/
│   │   ├── accounts/
│   │   ├── budgets/
│   │   ├── categories/         # Categories + auto-categorisation rules
│   │   ├── goals/
│   │   ├── investments/        # T212 + manual holdings
│   │   ├── transactions/       # Table, CSV import/export
│   │   ├── layout.tsx          # Shell, navbar, bank sync trigger
│   │   └── page.tsx            # Overview
│   ├── onboarding/             # First-run setup wizard
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── BankSyncTrigger.tsx     # Background auto-sync on login
│   ├── ChatPanel.tsx           # AI assistant slide-out
│   ├── ConnectBankButton.tsx   # TrueLayer open banking dialog
│   ├── ConnectTrading212Dialog.tsx
│   ├── InstallPrompt.tsx       # PWA install banner
│   ├── ServiceWorkerRegistrar.tsx
│   └── ...
├── db/
│   ├── schema.ts               # Drizzle table definitions
│   ├── queries/                # Read-only data access
│   ├── mutations/              # Server actions (writes)
│   └── migrations/             # One-off migration scripts
├── lib/
│   ├── auto-categorise.ts      # Rule matching + AI fallback
│   ├── encryption.ts           # AES-256-GCM
│   ├── trading212.ts           # T212 API client (Basic Auth)
│   ├── truelayer.ts            # TrueLayer API client
│   ├── yahoo-finance.ts        # Quote + ticker search
│   ├── budget-alerts.ts        # Threshold checks + email
│   ├── recurring-transactions.ts
│   └── supabase/               # Server, browser, middleware clients
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── icons/                  # App icons (192, 512, maskable)
└── index.ts                    # Shared DB instance
```

## Getting Started

You'll need Node.js 20+ and a Supabase project (or any Postgres instance).

```bash
git clone https://github.com/FK78/BalanceVisor.git
cd BalanceVisor
npm install
cp .env.example .env
```

   ```bash
   git clone https://github.com/FK78/wealth.git
   cd wealth
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
| `user_onboarding` | Onboarding state and base currency |
| `default_category_templates` | Built-in category templates |

## License

MIT
