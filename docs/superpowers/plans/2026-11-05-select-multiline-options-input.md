# Select multilineOptions Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public `multilineOptions` switch to `KbqSelect` that wraps option text and defaults the panel to trigger width without consumer CSS.

**Architecture:** `KbqSelect` owns a boolean input and provider default, appends a panel modifier and resolves a nullish `panelWidth` to `auto` only while multiline options are enabled. Explicit panel sizing and the existing trigger-oriented `multiline` remain independent.

**Tech Stack:** Angular signal inputs, TypeScript, SCSS, Vitest, Playwright, MDX, Koobiq API tooling.

**Spec:** `docs/superpowers/specs/2026-11-05-select-multiline-options-input-design.md`

## Global Constraints

- Use the public name `multilineOptions`, defaulting to `false`, and the panel modifier `kbq-select__panel_multiline`.
- Declare the input as `input<boolean, boolean | string | null | undefined>(…, { transform: booleanAttribute })` with a JSDoc default.
- Preserve custom `panelClass` and explicit `panelWidth`; only a nullish width falls back to `auto` under `multilineOptions`.
- Set only `white-space: normal` and `overflow-wrap: break-word` under the modifier, preserving the existing overflow behavior.
- Do not change the existing `multiline` trigger input or default single-line option behavior.
- Support `multilineOptions` in `KbqSelectOptions` and `kbqSelectOptionsProvider`.
- Replace the DS-3000 CSS recipe in PR #2325 and remove its superseded plan/spec files.
- Commit and push tasks into the existing `fix/DS-3000` / PR #2325 workflow; no AI attribution and no direct pushes to `main`.

## Review Focus

- False or absent `multilineOptions` must preserve current classes, width and truncation; pin with Task 1 unit tests and Task 2's short-option measurements.
- A custom `panelClass` must coexist with the modifier; pin with a Task 1 assertion containing both custom classes and `kbq-select__panel_multiline`.
- An explicit numeric `panelWidth` must beat the automatic fallback; pin with a Task 1 overlay-width assertion.
- Provider-enabled multiline behavior must match attribute-enabled behavior; pin with a Task 1 provider test.
- Long unbroken text must wrap rather than overflow, and `multilineOptions` must not add the trigger's `kbq-select_multiline`; pin both with Task 2 Playwright assertions.

---

### Task 1: Public input, panel modifier and width fallback

**Files:**

- Modify: `packages/components/select/select.component.ts`
- Modify: `packages/components/select/select.scss`
- Test: `packages/components/select/select.component.spec.ts`

**Interfaces:**

- Consumes: existing `panelWidth`, `panelClass`, `getPanelClasses()` and `updateOverlayWidth()` flow.
- Produces: `KbqSelect.multilineOptions(): boolean`; `KbqSelectOptions.multilineOptions?: boolean`; panel class `kbq-select__panel_multiline`.

- [ ] **Step 1: Add failing unit coverage**

Add a focused `describe('multilineOptions')` with a 300 px test host supporting `[multilineOptions]`, `[panelWidth]` and `[panelClass]`. Cover: no modifier by default; modifier plus both custom classes when enabled; overlay width 300 px with no explicit width; overlay width 344 px when `panelWidth=344`; provider-enabled modifier using `kbqSelectOptionsProvider({ multilineOptions: true })`.

- [ ] **Step 2: Verify the tests fail for the missing API**

Run `npx vitest run packages/components/select/select.component.spec.ts -t "multilineOptions"`. Expected: compilation or assertion failures because the input and modifier do not exist; do not proceed on an unrelated failure.

- [ ] **Step 3: Implement the input and behavior**

Add `multilineOptions?: boolean` to `KbqSelectOptions` and the public signal input to `KbqSelect`, using `this.defaultOptions?.multilineOptions ?? false`. Append the modifier in `getPanelClasses()` without dropping custom classes. Pass `panelWidth() ?? (multilineOptions() ? 'auto' : null)` to `updateOverlayWidth`. Add the nested modifier rule in `select.scss` with exactly the two wrapping declarations.

- [ ] **Step 4: Verify focused tests and component compilation**

Run the Step 2 command again, then `yarn run build:components`. Expected: focused tests pass and the package builds with exit code 0.

- [ ] **Step 5: Commit the API slice**

Commit the three files as `feat(select): add multilineOptions input (#DS-3000)` without attribution.

### Task 2: Prove real wrapping in Playwright

**Files:**

- Modify: `packages/components/select/e2e.ts`
- Test: `packages/components/select/e2e.playwright-spec.ts`

**Interfaces:**

- Consumes: Task 1's bare-attribute `multilineOptions` input and panel modifier.
- Produces: scenario `E2eSelectMultilineOptions`; no screenshot baselines.

- [ ] **Step 1: Write the failing browser test**

In an `E2eSelectMultilineOptions` Playwright describe, navigate to that scenario, open its Select and assert `white-space: normal`, `overflow-wrap: break-word`, overlay width 200 px, long option taller than short option, no horizontal text overflow, and absence of `kbq-select_multiline` on the trigger. Do not add the fixture yet.

- [ ] **Step 2: Verify the browser test fails because the scenario is missing**

Run `yarn run e2e:docker yarn playwright test packages/components/select/e2e.playwright-spec.ts -g "E2eSelectMultilineOptions"`. Expected: failure to open the missing route. Do not create or update screenshots.

- [ ] **Step 3: Add the scenario and verify the test passes**

Add `E2eSelectMultilineOptions` with a 200 px form field, a bare `multilineOptions` Select, one short option and one long option containing both spaces and a long unbroken token. Rerun the Step 2 command; correct only fixture/test mistakes without changing Task 1 behavior. Expected: the focused test passes in Docker with no snapshot updates.

- [ ] **Step 4: Type-check and commit**

Run `yarn run check-e2e-types`, then commit the two files as `test(select): cover multiline options (#DS-3000)` without attribution.

### Task 3: Simplify the docs and publish the API surface

**Files:**

- Modify: `packages/docs-examples/components/select/select-two-line-option/select-two-line-option-example.ts`
- Modify: `packages/components/select/select.ru.mdx`
- Modify: `packages/components/select/select.en.mdx`
- Modify: `tools/public_api_guard/components/select.api.md` via `approve-api`
- Delete: `docs/superpowers/specs/2026-11-05-select-multiline-options-design.md`
- Delete: `docs/superpowers/plans/2026-11-05-select-multiline-options.md`
- Modify: `apps/docs/src/llms.txt` only if generation reports a required change

**Interfaces:**

- Consumes: Tasks 1-2's verified public input.
- Produces: docs recipe `<kbq-select multilineOptions>` with no wrapping-specific `panelClass`, `panelWidth` or consumer CSS.

- [ ] **Step 1: Replace the example and both localized recipes**

Use bare `multilineOptions` in `select-two-line-option`; remove its `panelClass`, `panelWidth` and `::ng-deep` rule while retaining labels, captions and the 320 px field. Rewrite the RU/EN paragraphs to say the input wraps option text and defaults the panel to trigger width, while explicit `panelWidth` remains an override.

- [ ] **Step 2: Remove superseded process documents**

Delete the old CSS-based DS-3000 design and plan listed above. Keep this input design and plan as the sole current versions.

- [ ] **Step 3: Regenerate and verify the public API**

Run `yarn run approve-api "components/select"`, then `yarn run check-api`, `yarn run check-public-api-any`, `yarn run check-typings`, `yarn run docs:api-gen`, and `yarn run check-api-docs`. Expected: only the new documented input/provider member changes the Select golden; every command exits 0. Do not approve unrelated API diffs.

- [ ] **Step 4: Run documentation and static verification**

Run `yarn run build:docs-examples`, `yarn run build:docs-content`, `yarn run check-llms`, `yarn run check-spec-types`, and targeted Prettier/ESLint/stylelint checks for files changed by all tasks. Expected: exit code 0 and no stale CSS-based recipe.

- [ ] **Step 5: Verify the final user scenario**

Serve the docs and inspect the example in RU and EN. Confirm only `multilineOptions` is needed, long labels wrap, short labels remain one-line, captions and different row heights remain visible, trigger truncation is unchanged, and no example-specific wrapping CSS remains.

- [ ] **Step 6: Run the final regression gate and commit**

Run `yarn run unit:all` and the focused Playwright command from Task 2 again. Expected: all unit tests and the focused browser test pass. Commit the docs/API changes as `docs(select): document multiline options (#DS-3000)` without attribution, push `fix/DS-3000`, and verify PR #2325 reflects all three commits.
