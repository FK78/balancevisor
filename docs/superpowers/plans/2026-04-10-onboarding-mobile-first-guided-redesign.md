# Onboarding Mobile-First Guided Redesign Implementation Plan

## Scope

Implement the approved onboarding redesign as a three-stage mobile-first flow without changing onboarding persistence or underlying setup actions.

## Files To Touch

- `src/app/onboarding/page.tsx`
  - Collapse five-step routing into three-stage routing.
  - Add compatibility mapping from `step` to `stage`.
  - Compose the new `setup` stage from shared sections.
- `src/components/OnboardingLayout.tsx`
  - Replace the old centered wizard shell with milestone progress, hero framing, and sticky mobile actions support.
- `src/components/WelcomeStep.tsx`
  - Rebuild as the `Basics` stage.
- `src/components/ReviewStep.tsx`
  - Rebuild as a readiness-based summary stage.
- `src/components/AccountQuickAdd.tsx`
  - Refresh quick-add tiles, custom form surface, and existing-account previews.
- `src/components/CategorySelector.tsx`
  - Refresh default-category recommendations and category previews.
- `src/components/OnboardingCategoryForm.tsx`
  - Refresh inline custom-category surface.
- `src/components/FeaturesStep.tsx`
  - Convert from standalone stage card to section content suitable for the unified setup stage.
- `src/components/InterestPicker.tsx`
  - Refresh feature cards and copy hierarchy.
- `src/components/OnboardingSetupStage.tsx`
  - New file to own the unified `setup` stage.
- `src/app/globals.css`
  - Add any onboarding-specific shell helpers if existing workspace tokens are not enough.
- `src/components/__tests__/...`
  - Add coverage for stage mapping, unified setup stage behavior, shell actions, and incomplete review messaging.

## Task 1: Add The New Onboarding Stage Shell Tests

- Write failing tests for:
  - compatibility mapping from `step` to `stage`
  - sticky mobile actions in the onboarding shell
  - review warning state when accounts or categories are missing
- Run only those tests and confirm they fail for the intended reasons.

## Task 2: Build The Onboarding Shell

- Update `src/components/OnboardingLayout.tsx` to support:
  - stage title
  - stage description
  - milestone progress
  - optional sticky action content
- Keep the API simple enough that `basics`, `setup`, and `review` can all reuse it.
- Run the new shell tests and make them pass.

## Task 3: Add The Unified Setup Stage Tests

- Create failing tests for a new `OnboardingSetupStage` component that verify:
  - checklist status labels render correctly
  - incomplete core setup changes the primary CTA copy or helper text
  - all three sections render on one page
- Run the targeted test file and confirm failure.

## Task 4: Implement The Unified Setup Stage

- Add `src/components/OnboardingSetupStage.tsx`.
- Move the existing accounts, categories, and features content into a single guided page using the current server actions and child components.
- Keep the flow inline, not modal.
- Run the new setup-stage tests and make them pass.

## Task 5: Refresh The Section Components

- Update:
  - `src/components/AccountQuickAdd.tsx`
  - `src/components/CategorySelector.tsx`
  - `src/components/OnboardingCategoryForm.tsx`
  - `src/components/FeaturesStep.tsx`
  - `src/components/InterestPicker.tsx`
- Preserve behavior, but upgrade layout hierarchy, mobile spacing, and completion feedback.
- Add focused regression tests where the behavior or semantics changed.

## Task 6: Rebuild Basics And Review

- Update `src/components/WelcomeStep.tsx` into the new `Basics` stage.
- Update `src/components/ReviewStep.tsx` into the new readiness-focused review.
- Add failing tests first for:
  - readiness warning when core setup is incomplete
  - positive ready state when core setup is complete
- Run the targeted tests to see them fail, then implement the minimal code to pass.

## Task 7: Rewire The Route Composition

- Update `src/app/onboarding/page.tsx` to:
  - resolve `stage`
  - map old `step` values forward
  - render `Basics`, `Setup`, and `Review`
  - preserve existing data fetching and action wiring
- Add or update route-level tests if present; otherwise cover the routing helper logic in a colocated test.

## Task 8: Polish Onboarding Styles

- Add any minimal onboarding-specific helpers in `src/app/globals.css` only if the existing workspace tokens are not enough.
- Keep light-theme parity with the rest of the new mobile-first redesign.
- Avoid introducing a separate visual language just for onboarding.

## Task 9: Verify

- Run the targeted onboarding test suite.
- Run `npx tsc --noEmit`.
- Run `npx eslint` on all touched onboarding files and tests.
- If practical, run a live manual check at `375px`, `390px`, `768px`, and desktop on `http://localhost:3000`.

## Task 10: Commit

- Stage only the onboarding spec, plan, implementation files, and tests.
- Commit with a message describing the onboarding redesign.
