# Investments, Categories, and Other Assets Portfolio Cockpit Design

## Summary
- Redesign the remaining portfolio-adjacent surfaces around the `Balanced Workspace Cockpit` language already established across dashboard, accounts, transactions, onboarding, and secondary money pages.
- Treat this as the next focused subproject, not a grab-bag redesign. The scope is:
  - `Investments`
  - `Categories`
  - `Other Assets`
- Keep the existing data pipelines, calculations, and feature gates intact. This is a structural and visual UX redesign, not a data-model rewrite.

## Product Intent
- `Investments` should answer: `How healthy is the portfolio?`, `Where is the risk or concentration?`, and `What should I do next?`
- `Categories` should answer: `What spending structure matters most right now?`, `Where is categorisation weak?`, and `What should be tuned next?`
- `Other Assets` should answer: `What wealth sits outside broker feeds?`, `Does it affect zakat or the overall portfolio picture?`, and `What needs maintenance?`

The user should feel like these three surfaces belong to one coherent money system:
- `Investments` = tracked portfolio and market exposure
- `Other Assets` = wealth outside broker feeds
- `Categories` = spending structure that influences how much wealth can grow

## Locked Decisions
- Lead slice: `Investments first`
- Above-the-fold priority for investments: `Portfolio health and risk`
- Holdings interaction model: `Hybrid roster`
  - mobile = decision-style holding cards
  - desktop = denser comparison table
- Categories priority: `Spending structure first`
- Other Assets role: `Portfolio support panel`
- Follow-up phases stay separate:
  - loading / error system expansion
  - visual regression hardening across more routes
  - cockpit primitive cleanup and consolidation

## Shared UX Rules
- Every page should preserve the cockpit order:
  - `status summary`
  - `primary next step`
  - `priority stack`
  - `deeper tools`
- One dominant action only. Secondary actions belong in an action shelf or local controls.
- Dense data should keep `decision support` language:
  - strong headline metric
  - one short interpretation
  - clear next action or implied next action
- Mobile must never feel like a squeezed desktop admin screen.
- Desktop can remain denser where comparison matters, but it should inherit the same hierarchy and calmer visual framing.

## Investments

### Page Role
`Investments` becomes a portfolio cockpit rather than a page that drops quickly from summary cards into management tables.

### Above The Fold
- `Hero`
  - plain-language portfolio read
  - examples:
    - `Portfolio is growing, but too much sits in three holdings`
    - `Returns are positive, but one broker connection needs attention`
    - `Most of the portfolio is healthy, but manual prices are stale`
- `Primary action`
  - exactly one of:
    - `Review concentration`
    - `Reconnect broker`
    - `Refresh prices`
    - `Add holding`
- `Priority stack`
  - concentration or allocation risk
  - broker / sync / stale-price quality issue
  - gain/loss or realized-gains signal
- `Action shelf`
  - connect broker
  - add manual holding
  - add private investment
  - refresh prices
  - manage groups

### Holdings Model
- Mobile uses a `decision-card roster`
  - ticker / name
  - current value as the dominant number
  - gain/loss and return
  - account / group / source context
  - one short interpretation such as:
    - `Largest position in portfolio`
    - `Manual price needs refreshing`
    - `Negative return but small overall exposure`
- Desktop uses a `hybrid table`
  - keep comparison efficiency
  - calmer headers
  - better spacing and status treatment
  - group and account sections should feel curated, not like nested raw tables
- Grouping rules
  - accounts remain the outer organization level
  - groups remain meaningful sections inside an account
  - ungrouped holdings should read as an intentional section, not a fallback dump

### Charts And Analysis
- Charts move below the core risk story instead of leading the page.
- Each chart block should open with a takeaway sentence before the visual.
- AI analysis remains available, but secondary to the page’s main portfolio story.

### Empty / Loading / Error
- Loading state should preview:
  - cockpit hero
  - three priority cards
  - roster / table placeholder
  - chart placeholder
- Empty state should be contextual:
  - `No investments yet`
  - suggest connecting a broker or adding manual holdings
- Broker issues should be framed as recoverable guidance, not just alerts.
- Price-pending and stale-data states should feel informative, not broken.

## Categories

### Page Role
`Categories` becomes a spending-structure cockpit instead of a simple admin page with a chart and two lists.

### Above The Fold
- `Hero`
  - examples:
    - `Most spending sits in four categories, and two rules could reduce manual cleanup`
    - `Your category structure is stable, but dining and shopping moved sharply this month`
- `Primary action`
  - usually `Add category` or `Add rule`
  - only one is visually dominant at a time, based on the biggest gap
- `Priority stack`
  - spend concentration
  - sharp category movement
  - rule coverage or missing-rule opportunity
- `Action shelf`
  - add category
  - add categorisation rule
  - possibly a direct shortcut to review uncategorised activity if that supports the story

### Deeper Tools
- Charts and spending structure view come first.
- Full category grid comes second.
- Auto-categorisation rules come third.
- The page should visually say:
  - `understand structure first`
  - `manage taxonomy second`
  - `tune automation third`

### Category Grid
- Move away from simple admin tiles.
- Each category card should foreground:
  - category identity
  - where it sits in current spending structure
  - whether it is quiet, rising, or dominant
- Edit and delete stay present, but visually secondary.

### Rules
- Rules should feel like automation quality control, not the page’s main story.
- Missing-rule opportunities and rule coverage should be surfaced above the full rules list.
- Existing rules should be easier to scan by:
  - pattern
  - destination category
  - priority
  - whether the rule is likely covering meaningful spend or edge-case cleanup

### Empty / Loading / Error
- Loading state should preview:
  - hero
  - structure priority cards
  - category grid skeleton
  - rules section skeleton
- Empty states should stay action-oriented:
  - `No categories yet`
  - `No rules yet`
- The page should never look like a blank admin surface with one lonely button.

## Other Assets

### Role In The System
`Other Assets` should stay tied to the portfolio story as `assets outside broker feeds`.

### Presentation Rules
- Rename or reframe the section to read as part of the wealth picture, not a miscellaneous bucket.
- Emphasize:
  - total value
  - asset type
  - zakat relevance
  - upkeep / update needs
- Cards should show:
  - value first
  - asset name and type
  - short notes or tags
  - whether the asset is zakatable or likely needs a review

### UX Positioning
- On the accounts / portfolio-adjacent surfaces, `Other Assets` should read as a support panel rather than a separate mini-product.
- The section should help users understand off-platform wealth in the context of total portfolio health.

### Empty / Loading
- Empty state should frame this as a useful extension of the portfolio, not optional clutter.
- Example language:
  - `Track assets outside broker feeds, like property, gold, pensions, and business interests`

## Loading, Empty, and Error Boundaries For This Slice
- This spec defines cockpit-ready states for the scoped pages only:
  - investments
  - categories
  - other assets
- These states should preview final page structure rather than generic cards.
- Error framing should prefer:
  - recoverable
  - calm
  - action-oriented
- Do not try to redesign every app loading or error path inside this slice. App-wide systemization belongs to the next dedicated spec.

## Browser QA And Acceptance
- Add or extend responsive QA for:
  - `/dashboard/investments`
  - `/dashboard/categories`
- Verify at:
  - `375`
  - `390`
  - `768`
  - `1024`
  - desktop
- Acceptance checks:
  - investments hero explains portfolio health in plain language
  - holdings feel scannable on mobile and efficient on desktop
  - categories lead with spending structure, not admin maintenance
  - other assets visually support the wealth picture instead of feeling miscellaneous
  - loading / empty / error states mirror final layout intent

## Boundaries And Follow-Up Specs
- This subproject stops at:
  - investments
  - categories
  - other assets
- The following are explicitly deferred:
  - app-wide loading / empty / error design system
  - broader screenshot-based visual regression strategy
  - shared cockpit primitive cleanup / refactor

## Assumptions
- Existing data fetching, broker integrations, grouping logic, and calculations remain unchanged unless a small presentation-specific helper is required.
- AI remains available on investments, but visually secondary to the page’s non-AI interpretation layer.
- Categories does not become a multi-tab workspace in this slice unless the existing page shape truly demands it during implementation.
- Other Assets remains connected to portfolio surfaces rather than becoming a stand-alone dashboard section in this phase.
