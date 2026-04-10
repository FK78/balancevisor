# Dense Data Decision Cards Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild dashboard widgets, transactions, and account surfaces around a shared decision-support presentation model without changing routes, queries, or business logic.

**Architecture:** Add a small presentation layer for dense-data surfaces first: shared decision row/card primitives, empty/loading states, and helper functions that map existing payloads into signal/context/interpretation/action view models. Then migrate the three surfaces in order: transactions first, accounts second, dashboard widgets third, while keeping existing workspace tabs, feature flags, and server data intact.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, TanStack Table, Recharts, Vitest, Testing Library, ESLint

---

## File Map

- `src/app/globals.css`
  - Add dense-data utility classes for decision rows, decision metric cards, warning chips, and compact watch-list spacing.
- `src/components/ChartSkeleton.tsx`
  - Refresh the generic chart skeleton so loading states resemble the new dense-data hierarchy.
- `src/components/dense-data/DecisionRow.tsx`
  - New shared row primitive for transaction-style decision rows.
- `src/components/dense-data/DecisionMetricCard.tsx`
  - New shared compact metric card for account summaries and dashboard headlines.
- `src/components/dense-data/DecisionEmptyState.tsx`
  - New shared empty-state block that always explains what is missing, why it matters, and what to do next.
- `src/components/dense-data/__tests__/DecisionPrimitives.test.tsx`
  - Shared primitive coverage.
- `src/components/transactions/transaction-decision.ts`
  - New helper that derives transaction-specific status, interpretation, and action metadata from existing transaction payloads.
- `src/components/transactions/TransactionDecisionRow.tsx`
  - New transaction-specific row composed from `DecisionRow`.
- `src/components/TransactionsClient.tsx`
  - Swap mobile feed/search/review internals to decision rows while preserving the current route/query behavior.
- `src/components/transactions/TransactionColumns.tsx`
  - Reuse the same status metadata in the desktop table view so mobile and desktop agree on row semantics.
- `src/components/__tests__/TransactionsClient.test.tsx`
  - Extend coverage for filter chips, search summary, and review-state emphasis.
- `src/components/transactions/__tests__/transactionDecision.test.ts`
  - New mapping tests for transaction decision-state helpers.
- `src/components/transactions/__tests__/TransactionDecisionRow.test.tsx`
  - New rendering tests for the shared row hierarchy.
- `src/components/accounts/account-decision.ts`
  - New helper that computes account summary-card data, account-card interpretation, and account-detail cockpit copy from existing payloads.
- `src/components/AccountCard.tsx`
  - Rebuild the compact account card around the decision-card model.
- `src/components/AccountCharts.tsx`
  - Add chart takeaways and supporting interpretation copy.
- `src/components/AccountHealthCheck.tsx`
  - Bring the AI account health module into the same signal/interpretation/action structure and stabilize its empty/loading/error presentation.
- `src/app/dashboard/accounts/page.tsx`
  - Replace inline generic summary/account-card markup with the new shared account decision components.
- `src/app/dashboard/accounts/[id]/page.tsx`
  - Rework the account header area into a decision-focused cockpit.
- `src/components/accounts/__tests__/accountDecision.test.ts`
  - New helper tests for account decision copy and summary-card ordering.
- `src/components/__tests__/AccountCard.test.tsx`
  - New UI tests for the rebuilt account card.
- `src/components/__tests__/AccountsPageClient.test.tsx`
  - Update existing workspace tests to assert the new summary/account/insight language.
- `src/components/dashboard/dashboard-decision.ts`
  - New helper for dashboard widget takeaways and warning summaries.
- `src/components/dashboard/DashboardRecentTransactions.tsx`
  - Rebuild as a compact watch list using the transaction decision-row model.
- `src/components/dashboard/DashboardBudgetProgress.tsx`
  - Lead with at-risk budget summary and action-driven copy.
- `src/components/dashboard/DashboardAnomalies.tsx`
  - Shift from a raw list to a review-oriented warning module.
- `src/components/dashboard/DashboardUpcomingBills.tsx`
  - Emphasize urgency, total exposure, and the next action.
- `src/components/dashboard/DashboardRetirement.tsx`
  - Add a plain-language takeaway before detailed numbers.
- `src/components/dashboard/__tests__/DashboardDecisionWidgets.test.tsx`
  - New coverage for widget hierarchy, warning copy, and action framing.
- `src/components/dashboard/__tests__/DashboardPageClient.test.tsx`
  - Keep the existing tab test and extend it to assert the new signal-led widget semantics where practical.

## Verification Notes

- Treat `npx vitest run` on the targeted dense-data suites, `npx tsc --noEmit`, and `npx eslint` on touched files as the required gates.
- Do not use `npm test` as the primary pass/fail gate unless the pre-existing baseline failures in `src/lib/__tests__/date.test.ts` and `src/lib/__tests__/encryption.test.ts` have been fixed in the branch first.
- Manual verification must include `http://localhost:3000/dashboard`, `http://localhost:3000/dashboard/transactions`, `http://localhost:3000/dashboard/accounts`, and at least one real account detail route at widths `375px`, `390px`, `768px`, and desktop.

### Task 1: Add Shared Dense-Data Primitives

**Files:**
- Create: `src/components/dense-data/DecisionRow.tsx`
- Create: `src/components/dense-data/DecisionMetricCard.tsx`
- Create: `src/components/dense-data/DecisionEmptyState.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/ChartSkeleton.tsx`
- Test: `src/components/dense-data/__tests__/DecisionPrimitives.test.tsx`

- [ ] **Step 1: Write the failing primitive tests**

```tsx
// src/components/dense-data/__tests__/DecisionPrimitives.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DecisionRow } from "@/components/dense-data/DecisionRow";
import { DecisionMetricCard } from "@/components/dense-data/DecisionMetricCard";
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";

describe("Decision primitives", () => {
  it("renders a decision row with signal, context, interpretation, and action", () => {
    render(
      <DecisionRow
        title="Tesco"
        amount="−£45.20"
        amountTone="negative"
        meta={["Groceries", "Main Account", "10 Apr 2026"]}
        interpretation="Needs category review"
        statusLabel="Needs review"
        action={<button type="button">Categorise</button>}
      />,
    );

    expect(screen.getByText("Tesco")).toBeInTheDocument();
    expect(screen.getByText("Needs category review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Categorise" })).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("renders a metric card with interpretation and action", () => {
    render(
      <DecisionMetricCard
        eyebrow="Cash position"
        title="£4,280"
        subtitle="Across current accounts"
        interpretation="Enough to cover upcoming bills."
        action={<a href="/dashboard/accounts">Review accounts</a>}
      />,
    );

    expect(screen.getByText("Cash position")).toBeInTheDocument();
    expect(screen.getByText("Enough to cover upcoming bills.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review accounts" })).toHaveAttribute("href", "/dashboard/accounts");
  });

  it("renders an empty state with reason and next step", () => {
    render(
      <DecisionEmptyState
        title="No budgets yet"
        description="You cannot spot overspend until at least one budget exists."
        action={<button type="button">Create budget</button>}
      />,
    );

    expect(screen.getByText("No budgets yet")).toBeInTheDocument();
    expect(screen.getByText("You cannot spot overspend until at least one budget exists.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create budget" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the primitive tests and verify the missing-component failure**

Run:

```bash
npx vitest run src/components/dense-data/__tests__/DecisionPrimitives.test.tsx
```

Expected: FAIL with module-resolution errors for the new dense-data components.

- [ ] **Step 3: Implement the shared primitives and supporting styles**

```tsx
// src/components/dense-data/DecisionRow.tsx
import type { ReactNode } from "react";

type DecisionRowProps = {
  title: string;
  amount: string;
  amountTone?: "neutral" | "positive" | "negative" | "warning";
  meta: string[];
  interpretation?: string;
  statusLabel?: string;
  action?: ReactNode;
  className?: string;
};

const amountToneClass = {
  neutral: "text-foreground",
  positive: "text-emerald-600",
  negative: "text-rose-600",
  warning: "text-amber-600",
} satisfies Record<NonNullable<DecisionRowProps["amountTone"]>, string>;

export function DecisionRow({
  title,
  amount,
  amountTone = "neutral",
  meta,
  interpretation,
  statusLabel,
  action,
  className = "",
}: DecisionRowProps) {
  return (
    <div className={`decision-row ${className}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {statusLabel ? <p className="decision-eyebrow">{statusLabel}</p> : null}
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <p className={`decision-amount ${amountToneClass[amountTone]}`}>{amount}</p>
      </div>

      <div className="decision-meta">
        {meta.filter(Boolean).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      {interpretation ? <p className="decision-interpretation">{interpretation}</p> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
```

```tsx
// src/components/dense-data/DecisionMetricCard.tsx
import type { ReactNode } from "react";

type DecisionMetricCardProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  interpretation?: string;
  action?: ReactNode;
};

export function DecisionMetricCard({
  eyebrow,
  title,
  subtitle,
  interpretation,
  action,
}: DecisionMetricCardProps) {
  return (
    <div className="decision-metric-card">
      <p className="decision-eyebrow">{eyebrow}</p>
      <p className="decision-metric-title">{title}</p>
      {subtitle ? <p className="decision-metric-subtitle">{subtitle}</p> : null}
      {interpretation ? <p className="decision-interpretation">{interpretation}</p> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
```

```tsx
// src/components/dense-data/DecisionEmptyState.tsx
import type { ReactNode } from "react";

export function DecisionEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="decision-empty-state">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
```

```css
/* src/app/globals.css */
.decision-row {
  @apply rounded-2xl border border-[var(--workspace-card-border)] bg-card/90 p-4 shadow-sm;
}

.decision-eyebrow {
  @apply text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground;
}

.decision-amount {
  @apply shrink-0 text-sm font-semibold tabular-nums;
}

.decision-meta {
  @apply mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground;
}

.decision-interpretation {
  @apply mt-2 text-sm text-foreground/85;
}

.decision-metric-card {
  @apply rounded-[24px] border border-[var(--workspace-card-border)] bg-card/95 p-4 shadow-sm;
}

.decision-empty-state {
  @apply flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--workspace-card-border)] bg-muted/25 px-4 py-8 text-center;
}
```

```tsx
// src/components/ChartSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-4 rounded-[24px] border border-[var(--workspace-card-border)] bg-card/90 p-4 shadow-sm" style={{ minHeight: height }}>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-[180px] w-full rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the primitive tests again and verify they pass**

Run:

```bash
npx vitest run src/components/dense-data/__tests__/DecisionPrimitives.test.tsx
```

Expected: PASS with `3 passed`.

- [ ] **Step 5: Commit the primitive layer**

```bash
git add src/app/globals.css src/components/ChartSkeleton.tsx src/components/dense-data/DecisionRow.tsx src/components/dense-data/DecisionMetricCard.tsx src/components/dense-data/DecisionEmptyState.tsx src/components/dense-data/__tests__/DecisionPrimitives.test.tsx
git commit -m "feat: add dense data decision primitives"
```

### Task 2: Rebuild Transactions Around Decision Rows

**Files:**
- Create: `src/components/transactions/transaction-decision.ts`
- Create: `src/components/transactions/TransactionDecisionRow.tsx`
- Modify: `src/components/TransactionsClient.tsx`
- Modify: `src/components/transactions/TransactionColumns.tsx`
- Test: `src/components/transactions/__tests__/transactionDecision.test.ts`
- Test: `src/components/transactions/__tests__/TransactionDecisionRow.test.tsx`
- Modify: `src/components/__tests__/TransactionsClient.test.tsx`

- [ ] **Step 1: Write failing tests for transaction decision-state mapping and UI**

```ts
// src/components/transactions/__tests__/transactionDecision.test.ts
import { describe, expect, it } from "vitest";
import { buildTransactionDecisionState } from "@/components/transactions/transaction-decision";

describe("buildTransactionDecisionState", () => {
  it("marks uncategorised expenses as review items", () => {
    const state = buildTransactionDecisionState({
      id: "txn_1",
      description: "Tesco",
      category: null,
      category_id: null,
      accountName: "Main Account",
      date: "2026-04-10",
      amount: 45.2,
      type: "expense",
      is_split: false,
      is_recurring: false,
      transfer_account_id: null,
    } as never, "GBP");

    expect(state.statusLabel).toBe("Needs review");
    expect(state.interpretation).toBe("Add a category before month-end reporting.");
    expect(state.amountLabel).toBe("−£45.20");
  });

  it("marks transfers as watch-only items instead of warnings", () => {
    const state = buildTransactionDecisionState({
      id: "txn_2",
      description: "Transfer to savings",
      category: null,
      category_id: null,
      accountName: "Main Account",
      date: "2026-04-11",
      amount: 200,
      type: "transfer",
      is_split: false,
      is_recurring: false,
      transfer_account_id: "acc_savings",
    } as never, "GBP");

    expect(state.statusLabel).toBe("Transfer");
    expect(state.amountTone).toBe("neutral");
  });
});
```

```tsx
// src/components/transactions/__tests__/TransactionDecisionRow.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TransactionDecisionRow } from "@/components/transactions/TransactionDecisionRow";

describe("TransactionDecisionRow", () => {
  it("renders hierarchy for mobile transaction scanning", () => {
    render(
      <TransactionDecisionRow
        transaction={{
          id: "txn_1",
          accountName: "Main Account",
          description: "Tesco",
          category: null,
          category_id: null,
          category_source: "manual",
          merchant_name: "Tesco",
          date: "2026-04-10",
          amount: 45.2,
          type: "expense",
          is_split: false,
          is_recurring: false,
          transfer_account_id: null,
        } as never}
        currency="GBP"
        action={<button type="button">Review</button>}
      />,
    );

    expect(screen.getByText("Tesco")).toBeInTheDocument();
    expect(screen.getByText("Needs category review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review" })).toBeInTheDocument();
  });
});
```

```tsx
// src/components/__tests__/TransactionsClient.test.tsx
it("shows active filter chips and a result summary in the search workspace", async () => {
  const user = userEvent.setup();

  render(
    <TransactionsClient
      transactions={[{ id: "txn_1", accountName: "Main Account", description: "Tesco", category: null, category_id: null, category_source: "manual", merchant_name: "Tesco", date: "2026-04-10", amount: 45.2, type: "expense", is_split: false, is_recurring: false, transfer_account_id: null } as never]}
      accounts={[{ id: "acc_1", accountName: "Main Account" } as never]}
      categories={[{ id: "cat_1", name: "Groceries" } as never]}
      currentPage={1}
      pageSize={10}
      totalTransactions={1}
      totalIncome={0}
      totalExpenses={45.2}
      totalRefunds={0}
      startDate="2026-04-01"
      endDate="2026-04-10"
      search="tesco"
      accountId="acc_1"
      dailyTrend={[]}
      dailyCategoryExpenses={[]}
      currency="GBP"
      splits={{}}
      uncategorisedCount={1}
    />,
  );

  await user.click(screen.getByRole("tab", { name: "Search" }));

  expect(screen.getByText("Showing 1 transaction")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Remove search filter tesco" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Remove account filter Main Account" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the targeted transaction tests and confirm failure**

Run:

```bash
npx vitest run src/components/transactions/__tests__/transactionDecision.test.ts src/components/transactions/__tests__/TransactionDecisionRow.test.tsx src/components/__tests__/TransactionsClient.test.tsx
```

Expected: FAIL because the new helper, row component, and chip summary UI do not exist yet.

- [ ] **Step 3: Implement transaction decision-state helpers and render them in the client**

```ts
// src/components/transactions/transaction-decision.ts
import { formatCurrency } from "@/lib/formatCurrency";
import type { Transaction } from "@/components/transactions/TransactionHelpers";

export type TransactionDecisionState = {
  amountLabel: string;
  amountTone: "neutral" | "positive" | "negative" | "warning";
  statusLabel?: string;
  interpretation?: string;
  meta: string[];
};

export function buildTransactionDecisionState(transaction: Transaction, currency: string): TransactionDecisionState {
  const prefix =
    transaction.type === "income"
      ? "+"
      : transaction.type === "refund"
        ? "↩ "
        : transaction.type === "transfer"
          ? "⇄ "
          : "−";

  if (transaction.type === "transfer") {
    return {
      amountLabel: `${prefix}${formatCurrency(transaction.amount, currency)}`,
      amountTone: "neutral",
      statusLabel: "Transfer",
      interpretation: "Money moved between accounts.",
      meta: ["Transfer", transaction.accountName, transaction.date ?? ""],
    };
  }

  if (!transaction.category_id && transaction.type === "expense") {
    return {
      amountLabel: `${prefix}${formatCurrency(transaction.amount, currency)}`,
      amountTone: "warning",
      statusLabel: "Needs review",
      interpretation: "Add a category before month-end reporting.",
      meta: ["Uncategorised", transaction.accountName, transaction.date ?? ""],
    };
  }

  return {
    amountLabel: `${prefix}${formatCurrency(transaction.amount, currency)}`,
    amountTone: transaction.type === "income" ? "positive" : "negative",
    statusLabel: transaction.is_split ? "Split" : undefined,
    interpretation: transaction.is_split ? "Multiple categories are attached to this transaction." : undefined,
    meta: [transaction.category ?? transaction.type, transaction.accountName, transaction.date ?? ""],
  };
}
```

```tsx
// src/components/transactions/TransactionDecisionRow.tsx
import type { ReactNode } from "react";
import { DecisionRow } from "@/components/dense-data/DecisionRow";
import { buildTransactionDecisionState } from "@/components/transactions/transaction-decision";
import type { Transaction } from "@/components/transactions/TransactionHelpers";

export function TransactionDecisionRow({
  transaction,
  currency,
  action,
}: {
  transaction: Transaction;
  currency: string;
  action?: ReactNode;
}) {
  const state = buildTransactionDecisionState(transaction, currency);

  return (
    <DecisionRow
      title={transaction.description}
      amount={state.amountLabel}
      amountTone={state.amountTone}
      meta={state.meta}
      interpretation={state.interpretation}
      statusLabel={state.statusLabel}
      action={action}
    />
  );
}
```

```tsx
// src/components/TransactionsClient.tsx
function renderActiveFilterChips() {
  const chips = [
    activeSearch ? { key: "search", label: `Search: ${activeSearch}`, ariaLabel: `Remove search filter ${activeSearch}` } : null,
    activeAccountId ? { key: "account", label: `Account: ${accounts.find((account) => account.id === activeAccountId)?.accountName ?? activeAccountId}`, ariaLabel: `Remove account filter ${accounts.find((account) => account.id === activeAccountId)?.accountName ?? activeAccountId}` } : null,
    activeStartDate || activeEndDate ? { key: "date", label: `${activeStartDate ?? "Any"} to ${activeEndDate ?? "Any"}`, ariaLabel: "Remove date filter" } : null,
  ].filter(Boolean);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button key={chip.key} type="button" className="rounded-full border px-3 py-1 text-xs" aria-label={chip.ariaLabel}>
          {chip.label}
        </button>
      ))}
    </div>
  );
}

function renderDecisionRows() {
  if (transactions.length === 0) {
    return (
      <DecisionEmptyState
        title="No transactions yet"
        description="Add or import transactions to unlock trends, reviews, and budget tracking."
        action={<TransactionFormDialog accounts={accounts} categories={categories} />}
      />
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {transactions.map((transaction) => (
        <TransactionDecisionRow
          key={transaction.id}
          transaction={transaction}
          currency={currency}
          action={transaction.type === "transfer" ? undefined : <TransactionFormDialog transaction={transaction} accounts={accounts} categories={categories} onSaved={() => handleTransactionEdited(transaction.id)} />}
        />
      ))}
    </div>
  );
}
```

```tsx
// src/components/transactions/TransactionColumns.tsx
import { buildTransactionDecisionState } from "@/components/transactions/transaction-decision";

cell: ({ row }) => {
  const state = buildTransactionDecisionState(row.original, currency);
  return (
    <div className="space-y-1 text-right">
      <span className={`font-semibold tabular-nums ${state.amountTone === "positive" ? "text-emerald-600" : state.amountTone === "warning" ? "text-amber-600" : state.amountTone === "negative" ? "text-rose-600" : "text-foreground"}`}>
        {state.amountLabel}
      </span>
      {state.statusLabel ? <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{state.statusLabel}</span> : null}
    </div>
  );
}
```

- [ ] **Step 4: Run the transaction tests again and verify they pass**

Run:

```bash
npx vitest run src/components/transactions/__tests__/transactionDecision.test.ts src/components/transactions/__tests__/TransactionDecisionRow.test.tsx src/components/__tests__/TransactionsClient.test.tsx
```

Expected: PASS with the new transaction helper tests plus the updated client tests.

- [ ] **Step 5: Commit the transaction redesign slice**

```bash
git add src/components/transactions/transaction-decision.ts src/components/transactions/TransactionDecisionRow.tsx src/components/TransactionsClient.tsx src/components/transactions/TransactionColumns.tsx src/components/transactions/__tests__/transactionDecision.test.ts src/components/transactions/__tests__/TransactionDecisionRow.test.tsx src/components/__tests__/TransactionsClient.test.tsx
git commit -m "feat: redesign transactions as decision rows"
```

### Task 3: Rebuild Accounts As Decision Cards

**Files:**
- Create: `src/components/accounts/account-decision.ts`
- Modify: `src/components/AccountCard.tsx`
- Modify: `src/components/AccountCharts.tsx`
- Modify: `src/components/AccountHealthCheck.tsx`
- Modify: `src/app/dashboard/accounts/page.tsx`
- Modify: `src/app/dashboard/accounts/[id]/page.tsx`
- Test: `src/components/accounts/__tests__/accountDecision.test.ts`
- Test: `src/components/__tests__/AccountCard.test.tsx`
- Modify: `src/components/__tests__/AccountsPageClient.test.tsx`

- [ ] **Step 1: Write failing tests for account summary mapping and UI**

```ts
// src/components/accounts/__tests__/accountDecision.test.ts
import { describe, expect, it } from "vitest";
import { buildAccountsSummaryCards, buildAccountCardModel } from "@/components/accounts/account-decision";

describe("account decision helpers", () => {
  it("orders summary cards by highest-value account signals", () => {
    const cards = buildAccountsSummaryCards(
      [
        { id: "acc_1", accountName: "Main Account", type: "currentAccount", balance: 4200 } as never,
        { id: "acc_2", accountName: "Amex", type: "creditCard", balance: -750 } as never,
      ],
      "GBP",
    );

    expect(cards[0]?.eyebrow).toBe("Net worth");
    expect(cards.some((card) => card.interpretation.includes("Liabilities"))).toBe(true);
  });

  it("builds a warning card model for negative balances", () => {
    const model = buildAccountCardModel(
      { id: "acc_1", accountName: "Amex", type: "creditCard", balance: -750 } as never,
      "GBP",
      5000,
    );

    expect(model.statusLabel).toBe("Needs attention");
    expect(model.interpretation).toBe("This balance is pulling down your current net position.");
  });
});
```

```tsx
// src/components/__tests__/AccountCard.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccountCard } from "@/components/AccountCard";

describe("AccountCard", () => {
  it("renders a decision-style account card", () => {
    render(
      <AccountCard
        account={{ id: "acc_1", accountName: "Emergency Fund", type: "savings", balance: 2200 }}
        currency="GBP"
        interpretation="Largest savings buffer."
        statusLabel="On track"
        shareLabel="44% of tracked balances"
      />,
    );

    expect(screen.getByText("Emergency Fund")).toBeInTheDocument();
    expect(screen.getByText("Largest savings buffer.")).toBeInTheDocument();
    expect(screen.getByText("44% of tracked balances")).toBeInTheDocument();
  });
});
```

```tsx
// src/components/__tests__/AccountsPageClient.test.tsx
expect(screen.getByText("Jump between your account summary, account list, and insights.")).toBeInTheDocument();
expect(screen.getByText("Stats Summary Widget")).toBeInTheDocument();
```

- [ ] **Step 2: Run the account tests and verify they fail for the new helpers**

Run:

```bash
npx vitest run src/components/accounts/__tests__/accountDecision.test.ts src/components/__tests__/AccountCard.test.tsx src/components/__tests__/AccountsPageClient.test.tsx
```

Expected: FAIL because the new helper file and expanded `AccountCard` API do not exist yet.

- [ ] **Step 3: Implement account decision helpers, summary cards, and the account cockpit**

```ts
// src/components/accounts/account-decision.ts
import { formatCurrency } from "@/lib/formatCurrency";

export function buildAccountsSummaryCards(accounts: { balance: number; type: string | null; accountName: string }[], currency: string) {
  const liabilities = accounts.filter((account) => account.balance < 0).reduce((sum, account) => sum + Math.abs(account.balance), 0);
  const total = accounts.reduce((sum, account) => sum + account.balance, 0);
  const liquid = accounts
    .filter((account) => account.type === "currentAccount" || account.type === "savings")
    .reduce((sum, account) => sum + account.balance, 0);

  return [
    {
      eyebrow: "Net worth",
      title: formatCurrency(total, currency),
      subtitle: `${accounts.length} tracked account${accounts.length === 1 ? "" : "s"}`,
      interpretation: liabilities > 0 ? `Liabilities total ${formatCurrency(liabilities, currency)}.` : "No liabilities recorded.",
    },
    {
      eyebrow: "Liquid cash",
      title: formatCurrency(liquid, currency),
      subtitle: "Current and savings accounts",
      interpretation: liquid > 0 ? "Cash is available for upcoming spending and bills." : "Add a funded cash account to improve short-term visibility.",
    },
  ];
}

export function buildAccountCardModel(account: { accountName: string; balance: number; type: string | null }, currency: string, totalAbsolute: number) {
  const share = totalAbsolute > 0 ? Math.round((Math.abs(account.balance) / totalAbsolute) * 100) : 0;

  if (account.balance < 0) {
    return {
      formattedBalance: `−${formatCurrency(Math.abs(account.balance), currency)}`,
      statusLabel: "Needs attention",
      interpretation: "This balance is pulling down your current net position.",
      shareLabel: `${share}% of tracked balances`,
    };
  }

  return {
    formattedBalance: formatCurrency(account.balance, currency),
    statusLabel: "On track",
    interpretation: share >= 25 ? "One of your largest balance holders." : "Part of your broader account mix.",
    shareLabel: `${share}% of tracked balances`,
  };
}
```

```tsx
// src/components/AccountCard.tsx
import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";
import { typeIcons } from "@/app/dashboard/accounts/page";
import { Wallet } from "lucide-react";

export function AccountCard({
  account,
  currency,
  interpretation,
  statusLabel,
  shareLabel,
}: {
  account: { id: string; accountName: string; type: string | null; balance: number };
  currency: string;
  interpretation?: string;
  statusLabel?: string;
  shareLabel?: string;
}) {
  const Icon = typeIcons[account.type ?? ""] ?? Wallet;

  return (
    <Link href={`/dashboard/accounts/${account.id}`} className="decision-row block">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          {statusLabel ? <p className="decision-eyebrow">{statusLabel}</p> : null}
          <p className="truncate text-sm font-semibold text-foreground">{account.accountName}</p>
          <p className={`mt-1 text-xl font-semibold tabular-nums ${account.balance < 0 ? "text-rose-600" : "text-foreground"}`}>
            {account.balance < 0 ? "−" : ""}
            {formatCurrency(Math.abs(account.balance), currency)}
          </p>
          <div className="decision-meta">
            <span>{account.type?.replace(/([a-z])([A-Z])/g, "$1 $2") ?? "Account"}</span>
            {shareLabel ? <span>{shareLabel}</span> : null}
          </div>
          {interpretation ? <p className="decision-interpretation">{interpretation}</p> : null}
        </div>
      </div>
    </Link>
  );
}
```

```tsx
// src/app/dashboard/accounts/page.tsx
import { DecisionMetricCard } from "@/components/dense-data/DecisionMetricCard";
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";
import { buildAccountsSummaryCards, buildAccountCardModel } from "@/components/accounts/account-decision";

const summaryCards = buildAccountsSummaryCards(accounts, baseCurrency);

const statsEl = (
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    {summaryCards.map((card) => (
      <DecisionMetricCard
        key={card.eyebrow}
        eyebrow={card.eyebrow}
        title={card.title}
        subtitle={card.subtitle}
        interpretation={card.interpretation}
      />
    ))}
  </div>
);

const accountCardsEl = accounts.length === 0 ? (
  <DecisionEmptyState
    title="No accounts yet"
    description="Create your first account to unlock balance trends, health checks, and portfolio summaries."
    action={<AccountFormDialog />}
  />
) : (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {accounts.map((account) => {
      const model = buildAccountCardModel(account, baseCurrency, totalAbsolute);
      return (
        <AccountCard
          key={account.id}
          account={account}
          currency={baseCurrency}
          interpretation={model.interpretation}
          statusLabel={model.statusLabel}
          shareLabel={model.shareLabel}
        />
      );
    })}
  </div>
);
```

```tsx
// src/components/AccountCharts.tsx
const largestAccount = balanceShareData[0];
const concentrationLabel = largestAccount
  ? `${largestAccount.accountName} holds ${largestAccount.share.toFixed(0)}% of tracked balances.`
  : "Add funded accounts to see allocation and balance concentration.";

<CardHeader>
  <CardTitle>Account Balance Share</CardTitle>
  <CardDescription>{concentrationLabel}</CardDescription>
</CardHeader>
```

```tsx
// src/components/AccountHealthCheck.tsx
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";

<Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
  <CardHeader>
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
          <HeartPulse className="h-4 w-4 text-rose-500" />
        </div>
        <div>
          <CardTitle className="text-lg">AI Account Health Check</CardTitle>
          <CardDescription>
            {state.loading
              ? "Reviewing balance mix and possible blind spots."
              : state.error
                ? "Health insight is temporarily unavailable."
                : "AI summary of your current account structure."}
          </CardDescription>
        </div>
      </div>
      <Button size="sm" variant="outline" disabled={state.loading} onClick={() => fetchHealth()} className="gap-1.5">
        {state.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        {state.loading ? "Refreshing" : "Refresh"}
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    {state.error ? (
      <DecisionEmptyState
        title="Health check unavailable"
        description="We could not load an account health summary right now. Try again after your account data refreshes."
        action={<Button type="button" size="sm" variant="outline" onClick={() => fetchHealth()}>Try again</Button>}
      />
    ) : state.loading && !state.text ? (
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    ) : (
      <div
        className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(state.text) }}
      />
    )}
  </CardContent>
</Card>
```

```tsx
// src/app/dashboard/accounts/[id]/page.tsx
<CardHeader className="space-y-4">
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="space-y-2">
      <p className="decision-eyebrow">{config.label}</p>
      <CardTitle className="text-3xl font-semibold tabular-nums">
        {account.balance < 0 ? "−" : ""}
        {formatCurrency(Math.abs(account.balance), baseCurrency)}
      </CardTitle>
      <CardDescription>
        {account.transactions} transaction{account.transactions === 1 ? "" : "s"} on this account.
      </CardDescription>
    </div>
    <div className="flex flex-wrap gap-2">
      {!account.isShared && <ShareDialog resourceType="account" resourceId={account.id} resourceName={account.accountName} existingShares={shares.map((share) => ({ id: share.id, shared_with_email: share.shared_with_email, permission: share.permission, status: share.status }))} />}
      {!account.isShared && <AccountFormDialog account={account} />}
      {!account.isShared && <DeleteAccountButton account={account} />}
    </div>
  </div>
</CardHeader>
```

- [ ] **Step 4: Run the account tests again and verify they pass**

Run:

```bash
npx vitest run src/components/accounts/__tests__/accountDecision.test.ts src/components/__tests__/AccountCard.test.tsx src/components/__tests__/AccountsPageClient.test.tsx
```

Expected: PASS with the new helper and UI coverage.

- [ ] **Step 5: Commit the accounts redesign slice**

```bash
git add src/components/accounts/account-decision.ts src/components/AccountCard.tsx src/components/AccountCharts.tsx src/components/AccountHealthCheck.tsx src/app/dashboard/accounts/page.tsx src/app/dashboard/accounts/[id]/page.tsx src/components/accounts/__tests__/accountDecision.test.ts src/components/__tests__/AccountCard.test.tsx src/components/__tests__/AccountsPageClient.test.tsx
git commit -m "feat: redesign account surfaces as decision cards"
```

### Task 4: Rebuild Dashboard Widgets As Signal-Led Modules

**Files:**
- Create: `src/components/dashboard/dashboard-decision.ts`
- Modify: `src/components/dashboard/DashboardRecentTransactions.tsx`
- Modify: `src/components/dashboard/DashboardBudgetProgress.tsx`
- Modify: `src/components/dashboard/DashboardAnomalies.tsx`
- Modify: `src/components/dashboard/DashboardUpcomingBills.tsx`
- Modify: `src/components/dashboard/DashboardRetirement.tsx`
- Test: `src/components/dashboard/__tests__/DashboardDecisionWidgets.test.tsx`
- Modify: `src/components/dashboard/__tests__/DashboardPageClient.test.tsx`

- [ ] **Step 1: Write failing tests for dashboard widget interpretation and actions**

```tsx
// src/components/dashboard/__tests__/DashboardDecisionWidgets.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardRecentTransactions } from "@/components/dashboard/DashboardRecentTransactions";
import { DashboardBudgetProgress } from "@/components/dashboard/DashboardBudgetProgress";
import { DashboardUpcomingBills } from "@/components/dashboard/DashboardUpcomingBills";

describe("Dashboard decision widgets", () => {
  it("renders recent transactions as a watch list", () => {
    render(
      <DashboardRecentTransactions
        transactions={[
          { id: "txn_1", description: "Tesco", amount: 45.2, type: "expense", category: null, accountName: "Main Account", date: "2026-04-10", category_id: null } as never,
        ]}
        currency="GBP"
      />,
    );

    expect(screen.getByText("Watch recent activity and catch items needing review.")).toBeInTheDocument();
    expect(screen.getByText("Tesco")).toBeInTheDocument();
  });

  it("surfaces at-risk budgets before detailed bars", () => {
    render(
      <DashboardBudgetProgress
        budgets={[{ id: "budget_1", budgetCategory: "Groceries", budgetAmount: 500, budgetSpent: 460 }]}
        budgetsAtRisk={[{ id: "budget_1", budgetCategory: "Groceries", budgetAmount: 500, budgetSpent: 460 }]}
        currency="GBP"
      />,
    );

    expect(screen.getByText("1 budget needs attention")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("calls out total upcoming bill exposure", () => {
    render(
      <DashboardUpcomingBills
        renewals={[{ id: "sub_1", name: "Spotify", amount: 12.99, next_billing_date: "2026-04-11", color: "#00d95f" } as never]}
        currency="GBP"
      />,
    );

    expect(screen.getByText("Upcoming bills total")).toBeInTheDocument();
    expect(screen.getByText("Spotify")).toBeInTheDocument();
  });
});
```

```tsx
// src/components/dashboard/__tests__/DashboardPageClient.test.tsx
expect(screen.getByText("Welcome back, Fahad")).toBeInTheDocument();
expect(screen.getByText("Recent Transactions Widget")).toBeInTheDocument();
```

- [ ] **Step 2: Run the dashboard widget tests and verify they fail**

Run:

```bash
npx vitest run src/components/dashboard/__tests__/DashboardDecisionWidgets.test.tsx src/components/dashboard/__tests__/DashboardPageClient.test.tsx
```

Expected: FAIL because the new interpretation copy and widget structures do not exist yet.

- [ ] **Step 3: Implement dashboard decision helpers and apply them to the highest-traffic widgets**

```ts
// src/components/dashboard/dashboard-decision.ts
export function getBudgetSummary(budgetCount: number, atRiskCount: number) {
  if (budgetCount === 0) {
    return {
      headline: "No budgets set",
      interpretation: "Create a budget to catch overspend before month-end closes.",
      actionLabel: "Set up budgets",
    };
  }

  if (atRiskCount > 0) {
    return {
      headline: `${atRiskCount} budget${atRiskCount === 1 ? "" : "s"} need${atRiskCount === 1 ? "s" : ""} attention`,
      interpretation: "Review these categories before they tip over their limit.",
      actionLabel: "Review budgets",
    };
  }

  return {
    headline: "Budgets are on track",
    interpretation: "No categories are near their limit right now.",
    actionLabel: "View budgets",
  };
}

export function getUpcomingBillsSummary(total: number, billCount: number) {
  return {
    headline: "Upcoming bills total",
    amountLabel: total,
    interpretation: `${billCount} bill${billCount === 1 ? "" : "s"} due in the next seven days.`,
  };
}
```

```tsx
// src/components/dashboard/DashboardRecentTransactions.tsx
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";
import { TransactionDecisionRow } from "@/components/transactions/TransactionDecisionRow";

<Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
  <CardHeader>
    <div className="flex items-start justify-between gap-3">
      <div>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Watch recent activity and catch items needing review.</CardDescription>
      </div>
      <Button asChild size="sm" variant="ghost">
        <Link href="/dashboard/transactions">View all</Link>
      </Button>
    </div>
  </CardHeader>
  <CardContent className="space-y-3">
    {transactions.length === 0 ? (
      <DecisionEmptyState
        title="No transactions yet"
        description="Add activity to see watch-list items and review cues here."
        action={<Button asChild size="sm" variant="outline"><Link href="/dashboard/transactions">Go to transactions</Link></Button>}
      />
    ) : (
      transactions.map((transaction) => (
        <TransactionDecisionRow key={transaction.id} transaction={transaction as never} currency={currency} />
      ))
    )}
  </CardContent>
</Card>
```

```tsx
// src/components/dashboard/DashboardBudgetProgress.tsx
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";
import { getBudgetSummary } from "@/components/dashboard/dashboard-decision";

const summary = getBudgetSummary(budgets.length, budgetsAtRisk.length);

<Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
  <CardHeader>
    <div className="flex items-start justify-between gap-3">
      <div>
        <CardTitle>{summary.headline}</CardTitle>
        <CardDescription>{summary.interpretation}</CardDescription>
      </div>
      <Button asChild size="sm" variant="ghost">
        <Link href="/dashboard/budgets">{summary.actionLabel}</Link>
      </Button>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    {budgets.length === 0 ? (
      <DecisionEmptyState
        title="No budgets yet"
        description="Create a budget to see warning states before spending gets away from you."
        action={<Button asChild size="sm" variant="outline"><Link href="/dashboard/budgets">Set up budgets</Link></Button>}
      />
    ) : (
      [...budgetsAtRisk, ...budgets.filter((budget) => !budgetsAtRisk.some((atRisk) => atRisk.id === budget.id))]
        .slice(0, 5)
        .map((budget) => {
          const pct = budget.budgetAmount > 0 ? Math.min((budget.budgetSpent / budget.budgetAmount) * 100, 100) : 0;
          const isOver = budget.budgetSpent > budget.budgetAmount;
          const isWarning = pct >= 80 && !isOver;

          return (
            <div key={budget.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{budget.budgetCategory}</span>
                <span className={`text-xs tabular-nums ${isOver ? "font-semibold text-rose-600" : isWarning ? "text-amber-600" : "text-muted-foreground"}`}>
                  {formatCurrency(budget.budgetSpent, currency)} / {formatCurrency(budget.budgetAmount, currency)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })
    )}
  </CardContent>
</Card>
```

```tsx
// src/components/dashboard/DashboardAnomalies.tsx
import Link from "next/link";

<Card className="workspace-card border border-amber-500/20 shadow-sm">
  <CardHeader className="pb-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <CardTitle className="text-base">{anomalies.length} spending alert{anomalies.length === 1 ? "" : "s"}</CardTitle>
          <CardDescription>
            {anomalies.length === 1
              ? "One category is running well above its normal pattern."
              : "Several categories are running above their normal pattern. Review the biggest jumps first."}
          </CardDescription>
        </div>
      </div>
      <Link href="/dashboard/transactions" className="text-xs text-muted-foreground hover:text-foreground">
        Review activity
      </Link>
    </div>
  </CardHeader>
  <CardContent className="space-y-2.5">
    {anomalies.map((anomaly) => (
      <div key={anomaly.category} className="rounded-xl bg-amber-500/[0.06] px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{anomaly.category}</span>
              <span className="rounded-full border border-amber-200 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                +{anomaly.pctAbove}%
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(anomaly.currentSpend, currency)} this month vs {formatCurrency(anomaly.avgSpend, currency)} usual spend.
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums text-amber-700">
            +{formatCurrency(anomaly.increaseAmount, currency)}
          </span>
        </div>
      </div>
    ))}
  </CardContent>
</Card>
```

```tsx
// src/components/dashboard/DashboardUpcomingBills.tsx
import { getUpcomingBillsSummary } from "@/components/dashboard/dashboard-decision";

const total = renewals.reduce((sum, renewal) => sum + renewal.amount, 0);
const summary = getUpcomingBillsSummary(total, renewals.length);

<Card className="workspace-card border border-[var(--workspace-card-border)] shadow-sm">
  <CardContent className="space-y-4 py-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="decision-eyebrow">Watch</p>
        <p className="text-lg font-semibold text-foreground">{summary.headline}</p>
        <p className="text-sm text-muted-foreground">{summary.interpretation}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(summary.amountLabel, currency)}</p>
        <Link href="/dashboard/subscriptions" className="text-xs text-muted-foreground hover:text-foreground">Review bills</Link>
      </div>
    </div>
    {/* existing renewal rows continue here */}
  </CardContent>
</Card>
```

```tsx
// src/components/dashboard/DashboardRetirement.tsx
const takeaway = projection?.canRetireOnTarget
  ? "You are currently on track for your target retirement age."
  : "Your current savings pace falls short of the target retirement path.";

<CardHeader>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
        <Timer className="h-4 w-4 text-primary" />
      </div>
      <div>
        <CardTitle className="text-lg">Retirement</CardTitle>
        <p className="text-sm text-muted-foreground">{takeaway}</p>
      </div>
    </div>
    <Button asChild size="sm" variant="ghost" className="gap-1">
      <Link href="/dashboard/retirement">Details <ArrowRight className="h-3.5 w-3.5" /></Link>
    </Button>
  </div>
</CardHeader>
```

- [ ] **Step 4: Run the dashboard widget tests again and verify they pass**

Run:

```bash
npx vitest run src/components/dashboard/__tests__/DashboardDecisionWidgets.test.tsx src/components/dashboard/__tests__/DashboardPageClient.test.tsx
```

Expected: PASS with the widget interpretation and action hierarchy covered.

- [ ] **Step 5: Commit the dashboard widget redesign slice**

```bash
git add src/components/dashboard/dashboard-decision.ts src/components/dashboard/DashboardRecentTransactions.tsx src/components/dashboard/DashboardBudgetProgress.tsx src/components/dashboard/DashboardAnomalies.tsx src/components/dashboard/DashboardUpcomingBills.tsx src/components/dashboard/DashboardRetirement.tsx src/components/dashboard/__tests__/DashboardDecisionWidgets.test.tsx src/components/dashboard/__tests__/DashboardPageClient.test.tsx
git commit -m "feat: redesign dashboard widgets for decision support"
```

### Task 5: Run Integrated Verification And Responsive QA

**Files:**
- Modify: any touched dense-data files that need final polish after manual QA
- Test: `src/components/dense-data/__tests__/DecisionPrimitives.test.tsx`
- Test: `src/components/transactions/__tests__/transactionDecision.test.ts`
- Test: `src/components/transactions/__tests__/TransactionDecisionRow.test.tsx`
- Test: `src/components/__tests__/TransactionsClient.test.tsx`
- Test: `src/components/accounts/__tests__/accountDecision.test.ts`
- Test: `src/components/__tests__/AccountCard.test.tsx`
- Test: `src/components/__tests__/AccountsPageClient.test.tsx`
- Test: `src/components/dashboard/__tests__/DashboardDecisionWidgets.test.tsx`
- Test: `src/components/dashboard/__tests__/DashboardPageClient.test.tsx`

- [ ] **Step 1: Run the full dense-data targeted test suite**

Run:

```bash
npx vitest run \
  src/components/dense-data/__tests__/DecisionPrimitives.test.tsx \
  src/components/transactions/__tests__/transactionDecision.test.ts \
  src/components/transactions/__tests__/TransactionDecisionRow.test.tsx \
  src/components/__tests__/TransactionsClient.test.tsx \
  src/components/accounts/__tests__/accountDecision.test.ts \
  src/components/__tests__/AccountCard.test.tsx \
  src/components/__tests__/AccountsPageClient.test.tsx \
  src/components/dashboard/__tests__/DashboardDecisionWidgets.test.tsx \
  src/components/dashboard/__tests__/DashboardPageClient.test.tsx
```

Expected: PASS for all targeted dense-data suites.

- [ ] **Step 2: Run TypeScript verification**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 3: Run ESLint on every touched dense-data file**

Run:

```bash
npx eslint \
  src/app/globals.css \
  src/components/ChartSkeleton.tsx \
  src/components/dense-data/DecisionRow.tsx \
  src/components/dense-data/DecisionMetricCard.tsx \
  src/components/dense-data/DecisionEmptyState.tsx \
  src/components/transactions/transaction-decision.ts \
  src/components/transactions/TransactionDecisionRow.tsx \
  src/components/TransactionsClient.tsx \
  src/components/transactions/TransactionColumns.tsx \
  src/components/accounts/account-decision.ts \
  src/components/AccountCard.tsx \
  src/components/AccountCharts.tsx \
  src/components/AccountHealthCheck.tsx \
  src/app/dashboard/accounts/page.tsx \
  'src/app/dashboard/accounts/[id]/page.tsx' \
  src/components/dashboard/dashboard-decision.ts \
  src/components/dashboard/DashboardRecentTransactions.tsx \
  src/components/dashboard/DashboardBudgetProgress.tsx \
  src/components/dashboard/DashboardAnomalies.tsx \
  src/components/dashboard/DashboardUpcomingBills.tsx \
  src/components/dashboard/DashboardRetirement.tsx \
  src/components/dense-data/__tests__/DecisionPrimitives.test.tsx \
  src/components/transactions/__tests__/transactionDecision.test.ts \
  src/components/transactions/__tests__/TransactionDecisionRow.test.tsx \
  src/components/__tests__/TransactionsClient.test.tsx \
  src/components/accounts/__tests__/accountDecision.test.ts \
  src/components/__tests__/AccountCard.test.tsx \
  src/components/__tests__/AccountsPageClient.test.tsx \
  src/components/dashboard/__tests__/DashboardDecisionWidgets.test.tsx \
  src/components/dashboard/__tests__/DashboardPageClient.test.tsx
```

Expected: PASS with no lint errors.

- [ ] **Step 4: Run manual responsive QA against the live app**

Check these routes on `http://localhost:3000`:

```text
/dashboard
/dashboard/transactions
/dashboard/accounts
/dashboard/accounts/<real-account-id>
```

Verify at widths `375px`, `390px`, `768px`, and desktop:

- transaction rows show signal first, context second, and review/action messaging only when relevant
- search chips and review queue messaging do not wrap awkwardly or clip
- account summary cards read in priority order and account cards keep balances dominant
- charts have visible takeaway copy before the graph
- dashboard widgets expose one obvious action and one clear reason to care
- empty and loading states look intentional instead of generic

- [ ] **Step 5: Commit final polish and verification-ready changes**

```bash
git add src/app/globals.css src/components/ChartSkeleton.tsx src/components/dense-data/DecisionRow.tsx src/components/dense-data/DecisionMetricCard.tsx src/components/dense-data/DecisionEmptyState.tsx src/components/transactions/transaction-decision.ts src/components/transactions/TransactionDecisionRow.tsx src/components/TransactionsClient.tsx src/components/transactions/TransactionColumns.tsx src/components/accounts/account-decision.ts src/components/AccountCard.tsx src/components/AccountCharts.tsx src/components/AccountHealthCheck.tsx src/app/dashboard/accounts/page.tsx 'src/app/dashboard/accounts/[id]/page.tsx' src/components/dashboard/dashboard-decision.ts src/components/dashboard/DashboardRecentTransactions.tsx src/components/dashboard/DashboardBudgetProgress.tsx src/components/dashboard/DashboardAnomalies.tsx src/components/dashboard/DashboardUpcomingBills.tsx src/components/dashboard/DashboardRetirement.tsx src/components/dense-data/__tests__/DecisionPrimitives.test.tsx src/components/transactions/__tests__/transactionDecision.test.ts src/components/transactions/__tests__/TransactionDecisionRow.test.tsx src/components/__tests__/TransactionsClient.test.tsx src/components/accounts/__tests__/accountDecision.test.ts src/components/__tests__/AccountCard.test.tsx src/components/__tests__/AccountsPageClient.test.tsx src/components/dashboard/__tests__/DashboardDecisionWidgets.test.tsx src/components/dashboard/__tests__/DashboardPageClient.test.tsx
git commit -m "feat: finish dense data decision card redesign"
```
