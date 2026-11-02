# Search Expandable Clear Before Close Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the search-expandable suffix clear a non-empty query without collapsing or losing input focus, and collapse only when the query is empty.

**Architecture:** A dedicated internal suffix handler chooses between a shared synchronous reset and the existing `toggle()`. The existing close path reuses that reset, while `Escape`, public `toggle()`, forms integration, and rendering remain unchanged.

**Tech Stack:** Angular standalone components and signals, Reactive Forms, RxJS, Vitest, Playwright, MDX.

**Spec:** `docs/superpowers/specs/2026-11-02-search-expandable-clear-before-close-design.md`

## Global Constraints

- Keep the exact empty value `defaultValue = ''` and the existing `defaultEmitValueTimeout = 200` behavior.
- Do not change published API, `Escape`, `toggle(): void`, styles, or screenshot baselines.
- Clear immediately through the existing `emitValue` path and cancel `cancelPendingEmit` before resetting.
- Return focus synchronously to `KbqInput` after clearing; use the existing focus handoff when collapsing.
- Keep code comments in English and update both English and Russian documentation.
- Do not create commits unless explicitly requested.

## Review Focus

- A query typed less than 200 ms before clearing must not reappear in the bound control later; Task 1 adds a fake-timer regression test.
- Enter-only mode must still clear the bound control immediately; Task 1 tests clearing after `pressEnter`.
- Pointer and keyboard activation must leave focus in the input after clearing; Task 1 checks focus and Task 2 exercises the real browser.
- `Escape` and external `toggle()` must retain close-and-reset behavior; Task 1 runs their existing regression tests.
- A programmatic model clear must not collapse the field; Task 1 runs the existing auto-open/model-clear suite.

---

### Task 1: Clear-or-close suffix behavior

**Files:**

- Modify: `packages/components/search-expandable/search-expandable.ts:462-526`
- Modify: `packages/components/search-expandable/search-expandable.html:35-42`
- Test: `packages/components/search-expandable/search-expandable.spec.ts`

**Interfaces:**

- Consumes: existing `value`, `control`, `input`, `cancelPendingEmit`, `emitValue`, `setOpened`, and `toggle()` members.
- Produces: `protected onSuffixClick(): void` marked `@internal`; `private resetValue(): void`; no published API changes.

- [ ] **Step 1: Write failing unit tests**

Add a suffix-action describe block using `TestSearchExpandableWithFormControl` and the existing DOM helpers. Test these exact behaviors:

- After `typeIntoInput(..., 'typed')` and suffix click, `isOpened` is `true`, `value()` and `searchControl.value` are `''`, the input remains rendered and focused, and `isOpenedChange` has not emitted.
- Clicking the suffix after the clear collapses the field and focuses `.kbq-search-expandable__button`.
- Clicking before the 200 ms debounce expires, then advancing beyond 200 ms, leaves both values `''`.
- With `TestSearchExpandableWithEmitByEnter`, type `typed`, press Enter, click the suffix, and assert immediate `''` in the bound control with the field still open.
- The suffix accessible name is `ruRULocaleData.a11y.clear` for `typed` and `ruRULocaleData.a11y.close` for `''`.

- [ ] **Step 2: Run the unit tests and verify the new behavior fails**

Run: `npx vitest run packages/components/search-expandable/search-expandable.spec.ts`

Expected: the existing empty-field close tests pass; the new non-empty clear, focus, and accessible-name assertions fail because the suffix still calls `toggle()`.

- [ ] **Step 3: Implement the shared reset and suffix handler**

In `search-expandable.ts`, extract the close-time cancellation/reset/emission sequence into `private resetValue(): void` without changing its values or emission options. Call it from `setOpened(false)`.

Add `protected onSuffixClick(): void` marked `@internal`: when `value()` is non-empty, call `resetValue()` and then `input()?.focus()`; otherwise call `toggle()`.

In `search-expandable.html`, bind suffix click to `onSuffixClick()` and choose `a11yLocaleConfiguration().clear` or `.close` by `value()`.

- [ ] **Step 4: Run the complete component unit spec**

Run: `npx vitest run packages/components/search-expandable/search-expandable.spec.ts`

Expected: all existing and new tests pass, including Escape, external toggle, model clearing, and modal behavior.

### Task 2: Browser regression coverage and documentation

**Files:**

- Test: `packages/components/search-expandable/e2e.playwright-spec.ts`
- Modify: `packages/components/search-expandable/search-expandable.en.mdx`
- Modify: `packages/components/search-expandable/search-expandable.ru.mdx`

**Interfaces:**

- Consumes: the suffix behavior produced by Task 1 and the existing `E2eSearchExpandableStates` scenario.
- Produces: one browser regression test and matching English/Russian behavior descriptions; no component API changes.

- [ ] **Step 1: Add the two-click Playwright regression test**

Open `E2eSearchExpandableStates`, expand `e2eSearchExpandableCollapsed`, fill `query`, and click the suffix. Assert the input still exists, has value `''`, and is focused. Click the suffix again and assert the input is removed and the collapsed button is focused.

- [ ] **Step 2: Document the behavior in both languages**

Add one sentence to each overview page: a non-empty suffix activation clears while preserving expansion and focus, and an empty suffix activation collapses the search.

- [ ] **Step 3: Run targeted and static verification**

Run:

```bash
npx vitest run packages/components/search-expandable/search-expandable.spec.ts
yarn run check-spec-types
yarn run check-e2e-types
npx eslint packages/components/search-expandable/search-expandable.ts packages/components/search-expandable/search-expandable.spec.ts packages/components/search-expandable/e2e.playwright-spec.ts
npx prettier --check packages/components/search-expandable/search-expandable.ts packages/components/search-expandable/search-expandable.html packages/components/search-expandable/search-expandable.spec.ts packages/components/search-expandable/e2e.playwright-spec.ts packages/components/search-expandable/search-expandable.en.mdx packages/components/search-expandable/search-expandable.ru.mdx
yarn run e2e:docker yarn playwright test packages/components/search-expandable/e2e.playwright-spec.ts
```

Expected: all commands exit successfully; the Playwright run passes both existing screenshot tests and all interaction tests without updating baselines.

- [ ] **Step 4: Review the final diff and workspace**

Run `git diff --check`, inspect `git diff`, and run `git status --short`. Confirm that only the planned component, tests, documentation, and Superpowers plan/spec files changed and no generated outputs were left behind.
