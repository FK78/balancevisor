# Net Worth Tracker Pivot — Implementation Handover

This document records what's **done** and what **remains** for the net-worth tracker pivot (see `/Users/fahad.khan/.windsurf/plans/net-worth-tracker-pivot-182d16.md`).

## ✅ Completed (phases 1–10, partial 11)

### Deletions (phases 1–6)
- Dashboard pages: `transactions`, `budgets`, `categories`, `debts`, `goals`, `subscriptions`, `recurring`, `retirement`, `reports`, `notifications`
- API routes: `ai-enrich-transactions`, `cron`, `debt-advisor`, `enrich-on-login`, `error-report`, `funny-milestones`, `monthly-report`, `parse-csv-columns`, `parse-search`, `parse-transaction`, `retirement-planner`, `savings-tips`, `snapshot`, `subscription-advisor`, `switching-advisor`, `weekly-digest`, `account-health`
- DB mutations: `transactions`, `budgets`, `budget-alerts`, `categories`, `categorisation-rules`, `bulk-categorise`, `check-duplicate`, `debts`, `goals`, `import-csv`, `import-data`, `merchant-mappings`, `brand-dictionary`, `nudge-dismissals`, `recurring`, `retirement`, `review-flags`, `sharing`, `subscriptions` (and mutations/__tests__)
- DB queries: mirror deletions of the above; plus `insights`, `merchant-spend`, `refund-tracking`, `transaction-*`, `duplicate-check`
- Lib files (~45): enrichment pipeline, categorisation, budgets-pace/suggestions, cashflow, savings-rate, subscription/debt/retirement advisors, nudges dir, milestones, funny-milestones, monthly-report-data, weekly-digest-data, financial-health-score, goal-forecast, recurring, matching-utils, merchant-normalise, refund-matcher, trigger-ai-enrichment, etc. — plus their `__tests__`
- Components (~90+): all transactions/budget/category/goal/debt/subscription/recurring/retirement forms + dialogs + charts + advisors, all sharing components (ShareDialog, PendingInvitations, ShareSnapshot*, ShareAchievementButton), NotificationBell + server + page, EnrichmentTrigger, MonthlyAIReport, AccountHealthCheck, 14 dashboard widgets (Anomalies, BillTimeline, BudgetProgress, CashflowForecast, DebtSummary, ExpenseVelocity, GoalsSummary, HealthScore, Insights, Milestones, MonthlyReport, NudgeFeed, RecentTransactions, Retirement, Subscriptions, UpcomingBills, WeeklyDigest), `DashboardAccounts`, subfolder `categories/`, subfolder `reports/`, subfolder `transactions/`, dashboard `dashboard-decision.ts` + `dashboard-workspace.ts`, `AccountsPageClient`, `AccountCard`, `accounts/account-decision.ts`, `accounts/accounts-workspace.ts`, `MobileNavDrawer`, `SpendCategoryRow`.
- Component tests: tests for deleted components removed from `src/components/__tests__/` and `src/components/dashboard/__tests__/`.
- `src/db/seed.ts` deleted (to be recreated with minimal net-worth seed if needed).

### Rewrites (phases 7–9)
- **`src/db/schema.ts`** — slim to only accounts, investments (brokers, holdings, sales, groups), zakat (settings, calculations, other_assets), truelayer, net_worth_snapshots, user_keys, user_preferences, user_onboarding, dashboard_layouts, mfa_backup_codes.
- **`src/lib/types.ts`** — trimmed types; new `ExportData` shape; bumped `EXPORT_VERSION` to 2.
- **`src/lib/features.ts`** — `FeatureId = "accounts" | "investments" | "zakat"`, 3 feature definitions.
- **`src/lib/revalidate.ts`** — domains reduced to `accounts | investments | onboarding | settings | zakat`.
- **`src/lib/rate-limiter.ts`** — removed limiters for deleted features.
- **`src/lib/widget-registry.ts`** — 4 pages (`dashboard | accounts | investments | zakat`), dashboard widgets `net-worth-history`, `summary-cards`, `account-cards`, `zakat-summary`.
- **`src/app/dashboard/layout.tsx`** — removed `EnrichmentTrigger`, `NotificationBellServer`, recurring generation; kept Chat, BankSync, FeatureFlagsProvider.
- **`src/components/DashboardNav.tsx`** — 5 nav items: Dashboard, Accounts, Investments, Zakat, Settings.
- **`src/components/MobileBottomNav.tsx`** — 5 items; no more "More" drawer.
- **`src/app/dashboard/page.tsx`** — fetches accounts, investment value, net-worth history, zakat summary, other assets only.
- **`src/components/dashboard/DashboardPageClient.tsx`** — new net-worth hero, metric cards, account cards widget, zakat summary, NetWorthChart.
- **`src/app/dashboard/accounts/page.tsx`** — removed sharing, health check, pending invitations; simpler layout.
- **`src/app/dashboard/accounts/[id]/page.tsx`** — removed transactions/sharing; shows balance + type metrics only.
- **`src/db/queries/accounts.ts`** — removed `transactions` count + sharing.
- **`src/components/DeleteAccountButton.tsx`** — removed `transactions` prop.
- **`src/db/mutations/accounts.ts`** — removed transactions table refs.
- **`src/db/mutations/truelayer.ts`** — balance-only sync; no transaction import; no enrichment.
- **`src/components/BankSyncTrigger.tsx`** — no AI enrichment fetch.
- **`src/app/api/chat/route.ts`** — system prompt net-worth + portfolio focused (no budgets/goals/debts/subs/transactions).
- **`src/db/mutations/settings.ts`** — `deleteAccount`/`exportUserData` cleaned to kept tables only.
- **`src/db/delete-user.ts`** — same.
- **`src/lib/zakat.ts`** — no debts; uses account credit-card balances as liability deductions.
- **`src/lib/zakat-auto-check.ts`** — simpler anniversary check.
- **`src/components/SettingsClient.tsx`** — removed `ImportDataDialog` import/usage.

### SQL migration (phase 10)
`src/db/migrations/drop-non-net-worth-tables.sql` — raw SQL script to `DROP TABLE ... CASCADE` in order + drop enums. Run manually after code is deployed.

---

## ⚠ Remaining work (phase 9c + phase 11)

**Run `npx tsc --noEmit` (or `npm run build`) after `npm install` to get the full list. Expect the following categories of errors:**

### 1. Still-broken imports in kept files (likely)
- `src/app/dashboard/investments/page.tsx` — may reference deleted queries (`getTransactionsWithDetailsPaginated`, `getSharesForResource`, etc.). Audit its imports.
- `src/app/dashboard/zakat/page.tsx` — may reference deleted `debts` queries or removed zakat fields.
- `src/app/dashboard/settings/page.tsx` — may reference deleted types.
- `src/app/onboarding/page.tsx` — needs simplification (drop category/budget/goal/debt/subscription/recurring stages). Currently still imports deleted queries.
- `src/lib/onboarding-flow.ts` — stages list needs reduction.
- `src/components/OnboardingFeaturesStage.tsx` / `OnboardingAccountsStage.tsx` / `WelcomeStep.tsx` / `FeaturesStep.tsx` / `AccountMethodStep.tsx` — likely reference removed FeatureIds.
- `src/db/mutations/investments.ts` — imported `@/db/mutations/categories` (now deleted). Remove that import.
- `src/db/mutations/onboarding.ts` — removes category/budget seeding.
- `src/db/queries/preferences.ts` — `disabled_features` JSON may contain deleted feature ids; harmless but can filter.
- `src/lib/trading212.ts` — keep as-is.
- `src/lib/portfolio-data.ts` — usually fine; check for any `trading212ConnectionsTable` refs (removed from schema).
- `src/lib/investment-value.ts` — check refs.
- `src/lib/snapshot-net-worth.ts` — likely OK; verify.
- `src/components/AddAccountForm.tsx` — ensure its `Account` prop shape works with the new `AccountWithDetails` (no `transactions` / `isShared`).

### 2. Test files referencing deleted entities
Delete or update:
- `src/db/queries/transactions-search.test.ts` (already deleted)
- `src/components/__tests__/RecurringClient.test.tsx`, `RetirementPageClient.test.tsx`, `SplitTransactionDialog.test.tsx`, `TransactionFormDialog.test.tsx`, `TransactionReviewBanner.test.tsx`, `TransactionsClient.test.tsx`, `TransferFormDialog.test.tsx`, `ImportCSVDialog.test.tsx`, `ImportDataDialog.test.tsx`, `ReviewFlagCard.test.tsx`, `ShareDialog.test.tsx`, `BudgetAlertSettings.test.tsx`, `CategorisationRuleForm.test.tsx`, `ContributeGoalDialog.test.tsx`, `DebtPaymentDialog.test.tsx`, `QuickAddTransaction.test.tsx`, `ReviewStep.test.tsx` — already removed.
- `src/lib/__tests__/auth.test.ts`, `security-audit.test.ts`, `onboarding-flow.test.ts` — may reference removed features; verify and patch.

### 3. Storybook stories for deleted components (`.stories.tsx`)
Most deleted alongside their components; if build-storybook fails, scan for orphan `.stories.tsx`.

### 4. Dashboard subpages (kept, simplified)
Investments page + Zakat page may still work but verify their queries don't pull deleted things.

### 5. `ChatPanel.tsx`
No server-side change needed; the system prompt is server-side (done).

### 6. Onboarding
- Simplify `src/app/onboarding/page.tsx` to only: welcome → accounts → (optional) features toggle → complete.
- Remove `OnboardingCategoriesStage`, `OnboardingCategoryForm` (already deleted).
- `src/lib/onboarding-flow.ts` stages list.

### 7. Verify run
```bash
npm install
npx tsc --noEmit          # fix any remaining errors iteratively
npm run lint              # clean up unused imports/vars
npm run test              # fix/delete broken tests
npm run build             # production build
```

### 8. DB Migration
After code is merged:
```bash
psql "$DATABASE_URL" -f src/db/migrations/drop-non-net-worth-tables.sql
```

---

## Key design decisions captured

- **Credit-card balances** treated as liabilities in net-worth calc.
- **Zakat** now only deducts credit-card liabilities (no debts table).
- **TrueLayer** imports account balances only — no transactions.
- **AI chat** scoped to net-worth / portfolio questions; refuses spending/transactions questions.
- **Notifications bell removed** (was budget-only).
- **Onboarding** simplified to account-setup only; no category/budget/debt/subscription/recurring setup.
- **ExportData v2** schema changed — old exports incompatible.

## Files likely needing an early pass
1. `src/app/dashboard/investments/page.tsx`
2. `src/app/dashboard/zakat/page.tsx`
3. `src/app/onboarding/page.tsx`
4. `src/db/mutations/investments.ts`
5. `src/db/mutations/onboarding.ts`
6. `src/lib/onboarding-flow.ts`
7. Test files in `src/lib/__tests__/`

---

Generated as part of the net-worth tracker pivot. Good luck!
