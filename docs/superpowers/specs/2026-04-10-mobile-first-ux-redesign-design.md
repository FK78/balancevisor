# Mobile-First UX Redesign Design

## Goal

Redesign the app's UX with mobile as the primary target, starting with navigation and page flow, while preserving desktop usability. The redesign should feel materially more intentional and premium than the current Apple-inspired interface, not just tighter spacing on small screens.

## Product Direction

The approved direction is `Workspace Tabs`.

This direction favors a structured mobile shell with strong wayfinding, one focused view at a time, and a clearer distinction between app-level navigation and page-level modes. It is intentionally a bigger visual redesign than the current UI.

The target balance is:

- Fast glanceability
- Fast actions
- Fast drill-down

The redesign should support all three instead of over-optimizing for only one.

## Current Context

The current app already has several mobile-friendly foundations:

- Sticky top navigation in the dashboard shell
- Mobile bottom navigation
- Safe-area handling
- Some existing card-based responsive patterns

The main UX issue is not the absence of mobile primitives. It is that many pages still behave like compressed desktop layouts:

- Page headers often compete with too many actions
- Dense pages expose too many controls at once
- Widgets and sections do not always establish a clear priority order on narrow screens
- Filtering, charting, and management flows take up too much persistent space on mobile
- Visual language is too close to generic iOS styling to give the app a distinct product identity

## Core UX Principles

### 1. One focused mobile workspace per page

Each page should answer three questions before the user scrolls:

1. Where am I?
2. What matters most here?
3. What can I do next?

The first screenful should be designed explicitly around those questions.

### 2. Two navigation layers, each with one job

The redesign should separate global movement from in-page mode switching:

- `Bottom navigation` is for app-level section switching
- `Workspace tabs` are for switching between major modes within the current page

This keeps navigation understandable on phones without overloading the header or the main content area.

### 3. Single-column priority on mobile

Mobile should feel intentionally single-column, not like a squeezed version of desktop.

Priority order:

- Hero summary or primary workspace band
- Quick actions and compact stats
- Full-width modules, lists, and charts
- Secondary controls and customization affordances

### 4. Stronger product identity

The redesign should move away from pure Apple mimicry and toward an editorial finance workspace aesthetic:

- More deliberate hierarchy
- Stronger hero surfaces
- Warmer accent system
- Clearer visual contrast between sections

## Navigation Architecture

### App-Level Navigation

The mobile bottom navigation remains the main app switcher.

Recommended primary items:

- Dashboard
- Transactions
- Accounts
- More

This keeps the most frequent destinations directly reachable while retaining a compact tab bar footprint.

The `More` destination remains the overflow entry point for lower-frequency pages such as reports, budgets, goals, debts, recurring, retirement, zakat, settings, and related sections.

### Page-Level Navigation

Key pages gain horizontal workspace tabs directly below the page header. These tabs switch between distinct page modes, not minor filters.

Recommended tab models:

- `Dashboard`: Overview, Activity, Planning, Health
- `Transactions`: Feed, Search, Review
- `Accounts`: Summary, Accounts, Insights

Rules for workspace tabs:

- Tabs must switch meaningfully different content groups
- Tabs should simplify the page, not add another layer of clutter
- The default tab must represent the highest-frequency use case
- Tabs should remain visible near the top of the page and be easy to scan and tap on small screens

### Header Model

Headers should become more compact and action-led.

Each mobile page header should include:

- One clear page title
- Optional small context label or subtitle
- One dominant primary action
- At most one additional always-visible utility action

All other actions should move into:

- Overflow menus
- Bottom sheets
- Lower action clusters below the hero

This is especially important on dense pages like transactions and accounts, where the current header/action combination risks crowding the first screen.

## Cross-Page Layout System

Each major page should follow a shared mobile structure.

### Tier 1: Hero band

Each tab gets one hero area above the fold.

Examples:

- Dashboard Overview: net worth or high-level financial status
- Transactions Feed: search entry or recent activity summary
- Accounts Summary: assets, liabilities, and account health

The hero can be:

- A strong solid card
- A summary band
- A compact high-contrast module

It should never be visually interchangeable with every other card on the page.

### Tier 2: Quick actions and compact metrics

Directly below the hero:

- 2-3 high-value actions
- Small stat cards or indicators
- Immediate navigation to common next steps

These elements should be horizontally balanced but still easy to tap on touch devices.

### Tier 3: Full-width modules

Below the quick-action band:

- Charts
- Lists
- Widget modules
- Pinned content blocks

These should stack full-width on mobile. Avoid side-by-side dense modules unless the content is genuinely scannable in that format.

## Page-Specific Behavior

### Dashboard

The dashboard becomes a guided mobile workspace rather than an undifferentiated stack of widgets.

#### Dashboard Overview tab

Should include:

- Hero net worth summary
- Compact supporting financial metrics
- Quick actions such as quick add, transfer, or review
- Pinned high-priority modules underneath

#### Dashboard Activity tab

Should group:

- Recent transactions
- Alerts
- Anomalies
- Time-sensitive updates

#### Dashboard Planning tab

Should group:

- Budgets
- Goals
- Forecasting
- Upcoming bills

#### Dashboard Health tab

Should group:

- Account health
- Risk or warning signals
- Review queues
- Maintenance-oriented insights

This gives the dashboard clearer structure without removing the flexibility of the widget system.

### Transactions

Transactions is currently one of the strongest candidates for mobile restructuring.

#### Transactions Feed tab

Should focus on:

- Recent transactions
- Compact totals
- Fast visibility into what just happened

Rows should be presented as mobile-friendly cards or list rows rather than full desktop table treatments.

Each row should prioritize:

- Description
- Amount
- Category or type
- Account
- Date

Secondary details should move into expandable row content, a detail view, or inline actions.

#### Transactions Search tab

Should focus on:

- Search input
- Filter summaries
- Search result list

#### Transactions Review tab

Should focus on:

- Uncategorised items
- Review flags
- Recurring suggestions
- Bulk actions

#### Filter behavior

Filters should move into a bottom sheet on mobile rather than occupying persistent page space.

The page should show:

- A concise filter trigger
- Active filter summary
- Clear reset controls

This reduces clutter while preserving power.

### Accounts

Accounts should also adopt clearer mobile modes.

#### Summary tab

Should prioritize:

- Net worth
- Assets
- Liabilities
- High-level health or balance signals

#### Accounts tab

Should present account cards in a more uniform, compact mobile list.

Each account card should emphasize:

- Account name
- Type
- Balance
- Shared/connected state where relevant

Actions like edit, share, and delete should be discoverable but not visually dominant in the resting state.

#### Insights tab

Should group:

- Charts
- Distribution views
- Health check modules

This reduces the need to show every account management surface at once.

## Forms, Sheets, and Dialogs

The app currently uses dialogs in many places. Mobile needs a more deliberate split between small and large workflows.

### Keep as compact dialogs or sheets

Use compact presentations for:

- Small confirmations
- Simple toggles
- One-field or low-complexity actions

### Move to full-height mobile sheets or stepped flows

Use larger mobile flows for:

- Add transaction
- Account setup
- Import flows
- Multi-field editors
- Any form with dense validation or multiple decision points

Guidelines:

- One obvious primary action per screen
- Secondary actions de-emphasized
- Safe-area aware sticky action footers where helpful
- Inputs should avoid crowding and preserve thumb-friendly spacing

## Widget and Customization Behavior

The existing widget layout system should remain, but mobile presentation should be more opinionated.

Rules:

- Users can still customize layout and visibility
- Editing state should remain possible on mobile, but the resting state should prioritize clarity over configurability
- Customization controls should not compete with primary page actions
- Widget editing affordances should appear only when explicitly entering edit mode

For the dashboard in particular, pinned or high-priority modules should surface earlier in the mobile stack while lower-priority modules remain further down.

## Visual Language

The redesign should intentionally move beyond a generic iOS clone.

### Target aesthetic

Premium editorial finance workspace.

### Palette direction

- Deep olive or charcoal for hero surfaces and anchors
- Warm gold for emphasis and premium accents
- Soft blue for utility states, secondary emphasis, and chart support
- Calm neutrals for the base surfaces

### Typography direction

- Larger, more deliberate page and section titles
- Strong number styling for balances, totals, and financial states
- Supporting copy that is quieter and clearly subordinate

### Surface treatment

- Hero cards should feel distinct from standard cards
- Standard cards should remain quiet and readable
- Contrast should communicate priority, not just theme

## Motion

Motion should be purposeful and restrained.

Allowed motion patterns:

- Page-intro stagger
- Tab transitions
- Bottom-sheet entrances
- Widget reordering feedback

Motion rules:

- Short duration
- Low amplitude
- No decorative looping behavior
- Always subordinate to responsiveness and clarity

## Rollout Plan

Implementation should be phased to reduce risk and keep the redesign coherent.

### Phase 1: Shell and dashboard foundation

Includes:

- Mobile shell refinements
- Header model updates
- Bottom navigation polish
- Workspace tabs foundation
- Dashboard mobile restructuring
- Initial visual language update

### Phase 2: Dense page restructuring

Includes:

- Transactions mobile mode split
- Filter sheet behavior
- Card/list treatment for dense data
- Accounts restructuring around Summary, Accounts, and Insights

### Phase 3: Forms and consistency pass

Includes:

- Dialog-to-sheet/full-screen flow review
- Consistent action hierarchy
- Remaining page polish
- Style unification across secondary screens

## Testing And Verification

Each phase should be verified on narrow mobile widths before signoff, then checked for desktop stability.

Verification focus areas:

- Navigation clarity
- Tab switching behavior
- Bottom-sheet usability
- Touch target sizes
- Text overflow
- Clipped labels or actions
- Action discoverability
- Scroll rhythm and visual hierarchy

Where practical, interaction tests should cover:

- Navigation between app sections
- Workspace tab switching
- Filter sheet opening and applying
- Primary page actions
- Dense-list interaction patterns

## Non-Goals

This redesign does not require:

- A full information architecture rewrite
- Rebuilding desktop layouts from scratch in the first phase
- Turning every page into a visually unique one-off
- Decorative motion or branding that undermines legibility

## Summary

The redesign should make the app feel like a mobile-first financial workspace:

- Structured instead of crowded
- Guided instead of compressed
- Branded instead of generic

The approved solution keeps bottom navigation for global movement, adds workspace tabs for page-level modes, restructures dense pages around focused tasks, and introduces a more distinct editorial visual language delivered in phased implementation.
