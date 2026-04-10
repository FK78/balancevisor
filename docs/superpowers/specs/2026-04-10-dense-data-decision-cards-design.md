# Dense Data Decision Cards Redesign

## Summary

Apply the next major slice of the mobile-first UX redesign to the inside of the app's dense-data surfaces: dashboard widgets, transactions, and accounts.

The page shells, workspace tabs, and mobile dialog patterns are already in place. This redesign updates the internals of those surfaces so they feel like decision-support tools instead of older desktop tables and generic cards compressed into a phone layout.

The redesign keeps the existing routes, queries, feature flags, widget system, and core behaviors. This is primarily a presentation, information hierarchy, and interaction-structure refactor.

## Goals

- Make dense-data screens support fast financial decisions on mobile without forcing immediate drill-down.
- Establish one shared `Decision Card` language across dashboard widgets, transaction rows, account cards, and insight modules.
- Surface the most relevant next action on each dense surface without turning every card into a crowded control panel.
- Preserve desktop usefulness while making mobile the primary design target.
- Reduce the visual gap between the new mobile shells and the older inner modules that still feel generic.

## Non-Goals

- No new backend queries, data models, or financial calculations.
- No new dashboard tabs, accounts tabs, or transactions tabs.
- No replacement of pagination, sorting, or filtering logic beyond presentation and interaction framing.
- No introduction of swipe-heavy mobile gestures or hidden action systems as a primary interaction model.
- No full re-architecture of dashboard widgets or account-detail data loading.

## Current Context

Phase 1 and Phase 2 established the mobile shell direction:

- workspace tabs now structure dashboard, transactions, and accounts
- filter-heavy flows already moved toward mobile-friendly sheets and focused workspaces
- dashboard has a fixed overview hero
- accounts and transactions have clearer workspace separation

The remaining design problem is inside the content modules:

- transaction content still leans on table conventions
- account surfaces still read as a stack of generic widgets
- dashboard widgets are still inconsistent in hierarchy and action framing

The result is that the shell feels intentional, but the content inside it does not yet fully match that standard.

## Shared Design Principle

The redesign should optimize for `decision support` first.

Every dense module should answer the same questions in the same order:

1. What changed or matters right now?
2. Why should the user care?
3. What is the best next action?

This produces a shared pattern across all three surfaces without making them visually identical.

## Shared Pattern: Decision Card

### Core Anatomy

Each dense module should be expressed as a `Decision Card` or `Decision Row` with four layers:

1. `Signal`
   - the dominant number, label, or status
   - examples: amount, balance, budget status, anomaly count, trend delta
2. `Context`
   - the supporting metadata needed to interpret the signal
   - examples: category, account, date, trend period, sync state
3. `Interpretation`
   - one short line explaining why the signal matters
   - examples: `Needs category review`, `Cash buffer is holding steady`, `Bills due in the next 7 days`
4. `Action`
   - one primary next step or one clearly dominant drill-in
   - secondary actions should stay quieter or move into overflow

### Visual Rules

- The first line should be scannable in under a second.
- Financial numbers should carry stronger visual weight than descriptive copy.
- Status and urgency should be visible without requiring color alone.
- Cards should feel quieter than the hero surfaces but more intentional than plain default cards.
- The existing editorial finance direction should continue:
  - deep olive or charcoal anchors
  - warm gold for emphasis and warnings
  - soft blue for utility and supporting chart states
  - calm neutral surfaces as the default card background

### Action Rules

- One visible primary action per card or row at rest.
- Additional actions may appear as a low-emphasis inline link, overflow menu, or row detail affordance.
- Resting states should not show a full toolbar for every item.
- Mobile actions must remain reachable without precision tapping.

### Responsive Rules

- Mobile uses stacked card or row patterns first.
- Tablet can introduce denser two-column moments only when content remains legible.
- Desktop may keep table affordances where appropriate, but the information hierarchy should match the mobile Decision Card model.

## Transactions

### Design Goal

Transactions should feel like an action queue and financial activity stream, not a desktop data grid squeezed into a smaller space.

### Feed Tab

The `Feed` tab becomes a stream of decision rows.

Each transaction row should prioritize:

- description
- signed amount
- category or transaction type
- account
- date

Optional state should appear only when relevant:

- uncategorised
- split
- transfer
- refund
- AI-relevant or suggested-review state

Row structure on mobile:

- top line: description and signed amount
- second line: category or type, account, and date
- third line only when a review signal or action state exists
- trailing or lower action slot for the most relevant next action

Behavior:

- rows should feel tappable and action-oriented, not like static table cells
- active-row emphasis should come from stronger hierarchy and surface feedback, not heavy borders
- sorting remains available where already supported, but it should not dominate the first screen on mobile

### Search Tab

The `Search` workspace should feel like a refinement surface, not a duplicate of the feed.

Layout:

- prominent search input
- compact active-filter chips
- result summary line
- one clear refine action
- results in the same decision-row style as the feed

Behavior:

- active filters should be removable individually
- empty results should explain what was searched and provide a reset path
- export controls should remain available, but visually secondary to search and filtering

### Review Tab

The `Review` workspace should become a true cleanup queue.

It should emphasize:

- uncategorised transactions
- items needing manual review
- bulk categorisation opportunities
- recurring or pattern-based cleanup where already available

Presentation:

- group the queue by issue type or urgency when helpful
- stronger warm warning treatment for items needing attention
- batch actions anchored clearly above the queue, not buried in the list
- clearer completion feedback as the queue empties

### Desktop Adaptation

Desktop may continue to use a table for broad scanning, but it should inherit:

- stronger amount and status hierarchy
- better row-state styling
- more deliberate action emphasis
- the same status chips and review messaging used on mobile

## Accounts

### Design Goal

Accounts should feel like a portfolio of financial decisions and health signals rather than a collection of generic widgets.

### Summary Tab

The `Summary` tab should prioritize a small number of high-value decision cards:

- net worth or total balance context
- liquid cash position
- assets versus liabilities balance
- high-priority account-health warnings

Each summary card should include:

- a dominant headline amount or state
- one line of interpretation
- one next action or drill-in

### Accounts Tab

The `Accounts` workspace should present account cards as a scan-friendly roster.

Each account card should emphasize:

- account name
- account type
- current balance
- recent movement or trend indicator when available
- connected, shared, stale, or warning state where relevant

Behavior:

- the balance remains the dominant element
- secondary metadata should be quieter and more compact
- edit/share/manage actions should not visually overpower the card
- empty or low-activity accounts should still communicate their role clearly

### Insights Tab

The `Insights` workspace should turn charts and health modules into decision-support views.

Charts should gain:

- a headline takeaway above the chart
- a short interpretation line below or beside it
- a small related action where meaningful

Examples:

- `Cash is down 12% this month`
- `Savings contributions are steady`
- `Most assets are concentrated in one account group`

### Account Detail Pages

Account detail screens should adopt the same system.

The area above transaction history should become an account cockpit:

- current balance as the dominant signal
- account type and ownership/connection state as compact metadata
- short-term change or activity summary
- quick actions before deeper history and charts

## Dashboard Widgets

### Design Goal

The dashboard should feel curated and signal-led rather than like a loose pile of interchangeable cards.

### Widget Hierarchy

Each widget should follow a shared internal structure:

- headline metric or status
- short `why it matters` sentence
- one most relevant action or drill-in

Charts should no longer be the only thing competing for attention. The takeaway should be visible before a user reads the chart.

### Widget Categories

Widgets should visually distinguish between a few recurring modes:

- `Status`: current financial position or health
- `Watch`: recent activity and things to monitor
- `Plan`: budgets, bills, forecasting, retirement
- `Act`: review queues, anomalies, missing setup, follow-up actions

This is not a new user-facing taxonomy. It is an internal visual guide so widgets feel related instead of arbitrary.

### Specific Widget Expectations

- `Recent transactions` becomes a compact watch list with faster amount scanning and clearer issue states.
- `Budget progress` should emphasize at-risk budgets first and make the warning state legible before the bars.
- `Anomalies` should read like a review module, not just a data note.
- `Upcoming bills` should foreground urgency and payment timing.
- `Retirement`, `forecast`, and `zakat` should lead with a plain-language takeaway before detailed numbers.

### Widget Chrome

Widget cards should become more uniform in spacing, header density, and action placement.

Rules:

- stronger title-to-body hierarchy
- less dead space around small datasets
- consistent action placement
- empty states that explain the missing signal and the fastest recovery path

## Supporting States

### Loading

Loading skeletons should mimic the shape of the new Decision Card layouts rather than generic blocks.

### Empty

Empty states should answer:

- what is missing
- why that matters
- what the next step is

### Error And Partial Data

When data is missing or incomplete:

- keep the module frame stable
- explain the issue in plain language
- preserve any useful partial signal
- offer retry, setup, or drill-in actions only when they are meaningful

## Data Flow And Component Boundaries

The redesign should keep existing server data sources intact.

Implementation should add presentation-layer helpers that map raw data into decision-oriented view models such as:

- headline values
- deltas and status labels
- interpretation copy
- action metadata

This keeps the transformation logic out of the visual JSX and allows dashboard, accounts, and transactions to share status conventions without coupling their data-fetching code.

Likely component areas:

- `src/components/TransactionsClient.tsx`
- `src/components/transactions/TransactionColumns.tsx`
- `src/components/transactions/TransactionHelpers.tsx`
- `src/components/AccountsPageClient.tsx`
- `src/components/AccountCard.tsx`
- `src/components/AccountCharts.tsx`
- `src/components/AccountHealthCheck.tsx`
- `src/app/dashboard/accounts/[id]/page.tsx`
- `src/components/dashboard/DashboardPageClient.tsx`
- high-traffic dashboard widgets such as recent transactions, budget progress, anomalies, upcoming bills, and retirement

## Testing And Verification

- add component tests for transaction decision-row hierarchy, status states, and action visibility
- add tests for filter-chip summaries and review-queue emphasis
- add tests for account card hierarchy, warning states, and chart takeaway rendering
- add tests for dashboard widget consistency, especially recent transactions and warning-oriented widgets
- do responsive verification at `375px`, `390px`, `768px`, and desktop
- verify that dense screens still support keyboard navigation, visible focus, and readable tab order

## Assumptions

- Existing data payloads are sufficient for the first pass of interpretation copy and status framing.
- Transaction pagination and sorting behavior remain intact.
- Desktop does not need a ground-up redesign, but it should inherit the improved hierarchy and action semantics.
- The existing mobile shell tokens and editorial finance palette remain the source of truth.
