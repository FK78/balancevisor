# Cockpit Detail And Secondary Finishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the cockpit redesign by upgrading account detail, retirement, settings, and zakat, then polish their dense modules and lock the new routes into responsive Playwright coverage.

**Architecture:** Reuse the existing cockpit primitives instead of inventing route-specific layouts. Extract page-level wrappers only where they materially improve composition or testing, and keep current data queries intact by moving layout responsibility into page/client components rather than backend code.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Playwright, Tailwind CSS, existing cockpit primitives in `src/components/ui/cockpit.tsx`

---

### Task 1: Add failing coverage for the remaining cockpit routes

**Files:**
- Modify: `e2e/cockpit-responsive.spec.ts`
- Modify: `src/components/__tests__/RetirementPageClient.test.tsx`
- Modify: `src/components/__tests__/SettingsClient.test.tsx`
- Modify: `src/components/__tests__/TransactionsClient.test.tsx`
- Create: `src/components/accounts/__tests__/AccountDetailPageClient.test.tsx`
- Create: `src/components/__tests__/ZakatPageContent.test.tsx`

- [ ] Add responsive Playwright expectations for account detail, retirement, settings, and zakat headings.
- [ ] Add a component test for an embedded transactions shell mode so account detail can reuse `TransactionsClient` without nesting a second hero.
- [ ] Add a component test for the new account-detail cockpit wrapper.
- [ ] Add a component test for the new zakat content wrapper.
- [ ] Extend retirement/settings tests to assert the new cockpit summaries.
- [ ] Run the new targeted tests and confirm they fail for the expected missing UI.

### Task 2: Rebuild account detail as a mini cockpit

**Files:**
- Modify: `src/app/dashboard/accounts/[id]/page.tsx`
- Create: `src/components/accounts/AccountDetailPageClient.tsx`
- Modify: `src/components/TransactionsClient.tsx`

- [ ] Introduce an `embedded` or equivalent shell mode in `TransactionsClient` that removes the outer hero/action/priority shell while preserving the workspace tabs and activity tools.
- [ ] Move account-detail page composition into `AccountDetailPageClient` so the page reads as `back link -> hero -> actions -> key signals -> embedded activity workspace`.
- [ ] Keep existing queries, totals, and split handling unchanged.
- [ ] Re-run the account-detail and transactions tests to confirm the new composition works.

### Task 3: Upgrade retirement, settings, and zakat to full cockpit pages

**Files:**
- Modify: `src/components/RetirementPageClient.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `src/components/SettingsClient.tsx`
- Create: `src/components/ZakatPageContent.tsx`
- Modify: `src/app/dashboard/zakat/page.tsx`

- [ ] Refactor `RetirementPageClient` so both setup and full-projection states use cockpit hierarchy and clearer first-screen guidance.
- [ ] Refactor settings so the page opens with a cockpit summary and calmer grouped actions before the deeper forms.
- [ ] Extract zakat page markup into `ZakatPageContent` and recompose it around cockpit hero/action/priority structure.
- [ ] Keep dialogs, mutations, and server queries unchanged except for prop plumbing needed by the new shells.
- [ ] Re-run the focused component tests for retirement, settings, and zakat.

### Task 4: Dense-module polish on the upgraded surfaces

**Files:**
- Modify: `src/components/TransactionsClient.tsx`
- Modify: `src/components/OtherAssetsSection.tsx`
- Modify: `src/components/RetirementPageClient.tsx`
- Modify: `src/components/PendingInvitations.tsx`
- Modify: `src/components/SmartBudgetSuggestions.tsx`
- Modify: `src/app/globals.css`

- [ ] Tighten embedded activity sections so account detail feels like a composed cockpit, not a page inside a page.
- [ ] Polish dense rows and action strips that still behave like desktop toolbars on mobile.
- [ ] Bring the upgraded retirement and zakat metric blocks into the same calmer dense-data language already used on dashboard/accounts/transactions.
- [ ] Re-run targeted Vitest coverage after each dense-module adjustment.

### Task 5: Expand and verify browser QA, then commit and push

**Files:**
- Modify: `e2e/cockpit-responsive.spec.ts`

- [ ] Add the new routes to responsive QA, including dynamic navigation to a real account detail route from `/dashboard/accounts`.
- [ ] Run `npx vitest run ...` for the touched component tests.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npx eslint --no-warn-ignored ...` on the touched files.
- [ ] Run `npx playwright test e2e/auth.spec.ts e2e/cockpit-responsive.spec.ts`.
- [ ] Stage only the redesign files, commit with a cockpit-finishing message, and push `wealth` to `origin/wealth`.
