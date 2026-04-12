# BalanceVisor Mobile

React Native (Expo) companion app for [BalanceVisor](../README.md).

## Quick Start

```bash
cd mobile
npm install
npx expo start
```

### Environment Variables

Create `.env` in this directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Architecture

```
mobile/
├── app/              # Expo Router screens (file-based routing)
│   ├── (tabs)/       # Tab navigator: Dashboard, Transactions, Budgets, More
│   ├── (auth)/       # Auth screens: Sign In, Sign Up
│   ├── chat.tsx      # AI assistant chat
│   ├── goals.tsx     # Savings goals
│   ├── debts.tsx     # Debt tracker
│   ├── subscriptions.tsx
│   ├── investments.tsx
│   ├── zakat.tsx     # Zakat calculator
│   ├── retirement.tsx
│   ├── nudges.tsx    # Financial insights
│   └── settings.tsx
├── components/
│   ├── ui/           # Reusable UI primitives
│   │   ├── Card, Button, Input, Badge
│   │   ├── ProgressBar, EmptyState, ListItem
│   │   ├── Separator, ScreenWrapper, Skeleton
│   │   └── index.ts  # Barrel export
│   └── ErrorBoundary.tsx
├── lib/
│   ├── shared/       # Portable business logic & types (no server deps)
│   ├── api-client.ts # Typed fetch client with Bearer auth
│   ├── auth-context.tsx
│   ├── theme-context.tsx
│   ├── supabase.ts   # Supabase client with SecureStore
│   ├── biometric-auth.ts
│   ├── notifications.ts
│   ├── chat-client.ts
│   └── deep-links.ts
├── hooks/
│   └── use-api.ts    # React Query hooks for all API endpoints
└── constants/
    └── theme.ts      # Design tokens (colors, spacing, fonts)
```

## Key Decisions

- **Expo Router** for file-based navigation with typed routes
- **React Query** for data fetching, caching, and optimistic updates
- **Supabase Auth** with `expo-secure-store` for token persistence
- **V1 API** — all data flows through `/api/v1/` endpoints with Bearer token auth
- **Shared logic** — pure functions extracted from web app for currency formatting, date utils, financial health scoring, budget pace, retirement calculations
- **UI primitives** — consistent component library matching web app design tokens

## Screens

| Tab | Features |
|-----|----------|
| Dashboard | Balance summary, health score, budget overview, goals, accounts |
| Transactions | Searchable list with category + date formatting |
| Budgets | Spending progress bars, total spent header |
| More | Navigation hub: Goals, Debts, Subscriptions, Investments, Zakat, Retirement, AI Chat, Insights, Settings |

## Native Features

- **Biometric Auth** — Face ID / Touch ID via `expo-local-authentication`
- **Push Notifications** — `expo-notifications` with Android channels
- **Deep Linking** — `balancevisor://` scheme with URL path routing
- **Secure Storage** — Auth tokens in `expo-secure-store`

## Building

```bash
# Development build
npx expo run:ios
npx expo run:android

# Production build (EAS)
npx eas build --platform ios
npx eas build --platform android
```
