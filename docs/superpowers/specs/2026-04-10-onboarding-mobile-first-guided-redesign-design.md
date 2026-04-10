# Onboarding Mobile-First Guided Redesign

## Summary

Replace the current five-step onboarding wizard with a guided three-stage flow that is calmer on mobile, more coherent as a first-run experience, and more opinionated about finishing core setup before sending users to the dashboard.

The redesign keeps the existing data model and server actions. This is primarily a structure, navigation, and presentation refactor.

## Goals

- Make onboarding feel like a guided product setup flow rather than a stack of generic cards.
- Prioritize mobile with sticky actions, clearer progress, and less repeated navigation friction.
- Reduce perceived setup time by collapsing related setup tasks into one guided `Money setup` stage.
- Nudge users to finish core setup, especially accounts and categories, before landing in the dashboard.
- Preserve the ability to finish onboarding with partial setup, but make incomplete setup visibly second-best.

## Non-Goals

- No new onboarding data model.
- No new required fields.
- No modal onboarding.
- No adaptive branching wizard logic.
- No backend changes to accounts, categories, features, or completion behavior beyond query-param mapping and presentation helpers.

## Flow

### Stages

The onboarding route moves from five steps to three stages:

- `basics`
- `setup`
- `review`

Existing `step` query params remain supported as a compatibility shim:

- `welcome -> basics`
- `accounts -> setup`
- `categories -> setup`
- `features -> setup`
- `review -> review`

### Stage 1: Basics

This stage introduces the product, sets the base currency, and lets the user opt in or out of AI-powered features.

Layout:

- compact stage header with milestone progress
- lightweight hero copy
- reassurance points such as editable later, quick setup, and private by default
- primary interaction block for base currency and AI preference
- sticky mobile action footer

Behavior:

- primary action saves the selected currency and AI preference, then continues to `setup`
- secondary action skips onboarding and goes straight to the dashboard

### Stage 2: Money Setup

This stage becomes a single guided page instead of separate `accounts`, `categories`, and `features` screens.

Layout:

- completion checklist summary at the top
- three stacked sections:
  - accounts
  - categories
  - features
- sticky mobile footer with a single primary CTA

Behavior:

- the checklist is informative, not interactive chrome
- accounts and categories are treated as core setup
- features are optional and framed as “what would you like help with next?”
- the primary CTA continues to `review`
- if accounts or categories are empty, the CTA remains available but makes the incomplete state explicit

### Stage 3: Review

This stage becomes a readiness screen rather than a simple counts card.

Layout:

- summary header
- core setup section
- optional setup section
- preferences section
- sticky mobile action footer

Behavior:

- if accounts or categories are missing, show a warm warning callout and label the setup as incomplete
- if core setup is present, show a confident ready state
- primary action completes onboarding and sends the user to the dashboard
- secondary action goes back to `setup`

## Shell And Navigation

### Onboarding Shell

The onboarding shell replaces the current centered-card treatment with a full-page mobile-first layout:

- compact top bar with stage metadata and skip
- milestone-style progress row instead of only a thin progress bar
- stage hero with title and short guidance
- single content column with wider breathing room on desktop
- sticky bottom actions on mobile

### Progress

Progress is milestone-based:

- three stage chips or segmented progress
- current stage emphasized
- completed stages look settled rather than celebratory

### Navigation Rules

- `basics -> setup -> review`
- back from `review` returns to `setup`
- back from `setup` returns to `basics`
- skip remains available from every stage but stays visually secondary

## Section Designs

### Accounts Section

Keep `AccountQuickAdd`, but redesign it as a clearer tap-friendly setup section:

- stronger quick-add tile hierarchy
- inline custom account creation
- compact existing-account preview cards
- stronger recommendation when the section is empty

### Categories Section

Keep the current default-templates path and custom category creation:

- defaults become the recommended path
- custom category form remains inline and visually secondary
- existing categories show as a more intentional preview instead of a loose list

### Features Section

Keep the current feature-interest selection:

- reframe it as optional guidance
- explain how AI being disabled affects these choices
- do not block completion if nothing is selected

## Empty-State Rules

- Empty accounts: strong recommendation plus fastest next action.
- Empty categories: recommend defaults first.
- Empty features: neutral optional state.
- Review with missing core setup: visible amber warning and clear route back.

## Components And Files

### Primary Files

- `src/app/onboarding/page.tsx`
- `src/components/OnboardingLayout.tsx`
- `src/components/WelcomeStep.tsx`
- `src/components/ReviewStep.tsx`
- `src/components/AccountQuickAdd.tsx`
- `src/components/CategorySelector.tsx`
- `src/components/OnboardingCategoryForm.tsx`
- `src/components/FeaturesStep.tsx`
- `src/components/InterestPicker.tsx`

### New Files

- `src/components/OnboardingSetupStage.tsx`

### Responsibilities

- `page.tsx` owns stage resolution, query-param compatibility, data loading, and server actions
- `OnboardingLayout.tsx` owns shell, progress, and sticky actions framing
- `WelcomeStep.tsx` becomes the `Basics` stage
- `OnboardingSetupStage.tsx` owns the unified `Money setup` stage
- `ReviewStep.tsx` becomes the final readiness stage
- section components keep their existing business logic but are refreshed to match the new shell

## Testing

- add or update component tests for stage compatibility mapping and navigation
- add tests for the new onboarding setup stage rendering checklist and incomplete-core messaging
- add tests for sticky mobile actions in the new onboarding shell
- add responsive verification at `375px`, `390px`, `768px`, and desktop

## Assumptions

- Server actions such as setting currency, continuing from categories, and completing onboarding remain unchanged.
- Selected feature interests continue to travel through query params into the review and completion steps.
- Desktop should remain simple and focused, not become a complex multi-panel layout.
