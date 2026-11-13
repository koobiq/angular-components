# DS-2467 Popup Arrow Centering Implementation Plan

<!-- cspell:ignore arrowless actuals -->

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add opt-in trigger-centered arrows to edge-aligned popovers and tooltips and prove the behavior in a horizontal navbar.

**Architecture:** Move popover's existing clamped arrow-shift calculation into `core/pop-up` and let `KbqPopUp` render the shift for either component. `KbqPopUpTrigger` resolves the active origin center; popover keeps click-point priority and tooltip overrides origin resolution for caret mode. Public component inputs only opt into the behavior, so existing layouts remain unchanged.

**Tech Stack:** Angular 21, TypeScript, CDK Overlay, SCSS, Vitest, Playwright, MDX.

**Spec:** `docs/superpowers/specs/2026-11-05-ds-2467-popup-arrow-centering-design.md`

## Global Constraints

- New inputs are `kbqPopoverArrowCentered` and `kbqTooltipArrowCentered`, both defaulting to `false`.
- Move only the arrow; never move the panel to center its arrow.
- Preserve current click-point, arrowless, offset, placement and navbar behavior when the option is off.
- Use public `@koobiq/components/core` imports across entry points; no relative cross-entry-point imports and no new dependencies.
- Boolean inputs accept bare attributes through `input<boolean | undefined, boolean | string | null | undefined>(undefined, { transform: booleanAttribute })`.
- Update English and Russian documentation and public JSDoc; do not hand-edit generated API files.
- Do not create screenshot baselines on Windows. New browser checks assert geometry and need no baselines.

## Review Focus

- A panel narrower than twice its arrow inset must center the arrow rather than produce an inverted clamp or an arrow outside the panel; pinned by Task 1 geometry tests.
- Turning centering off, hiding the arrow or sticking a popover to a window edge must remove stale CSS shifts; pinned by Tasks 2 and 3 runtime-input tests.
- Click, caret and explicit rectangle origins must win over the host center; pinned by Task 2 pointer and explicit-origin tests and Task 3 caret tests.
- A fallback placement must recompute the shift from the resolved CSS class, while scroll, resize and RTL keep the current alignment; pinned by Task 2 unit tests and Task 4 browser checks.
- Centering must not compound the legacy narrow-trigger panel offset; pinned by Tasks 2 and 3 assertions that adjusted positions contain neither `offsetX` nor `offsetY`.

## File Map

- Create `packages/components/core/pop-up/pop-up-positioning.ts` and its spec: pure, shared arrow-shift geometry.
- Modify `packages/components/core/pop-up/{index.ts,pop-up.ts,pop-up-trigger.ts}`: shared origin resolution and CSS-shift rendering.
- Delete `packages/components/popover/popover-positioning.ts` and its spec after moving their coverage to core.
- Modify popover component, specs, SCSS consumers, English/Russian MDX and `popover-arrow-and-offset` example: public opt-in and preserved pointer behavior.
- Modify tooltip component, SCSS, specs, English/Russian MDX and `tooltip-arrow` example: public opt-in and caret-origin support.
- Modify `packages/components/navbar/{e2e.ts,e2e.playwright-spec.ts}`: real navbar geometry without screenshots.
- Modify `apps/docs/src/app/structure.ts`: Updated badges expiring on `2026-11-19` for popover and tooltip.
- Regenerate `tools/public_api_guard/components/{core,popover,tooltip}.api.md` through the repository command.

---

### Task 1: Shared popup arrow geometry and rendering

**Files:**

- Create: `packages/components/core/pop-up/pop-up-positioning.ts`
- Create: `packages/components/core/pop-up/pop-up-positioning.spec.ts`
- Modify: `packages/components/core/pop-up/index.ts`
- Modify: `packages/components/core/pop-up/pop-up.ts`
- Modify: `packages/components/core/pop-up/pop-up-trigger.ts`
- Modify: `packages/components/popover/popover.component.ts`
- Delete: `packages/components/popover/popover-positioning.ts`
- Delete: `packages/components/popover/popover-positioning.spec.ts`
- Test: `packages/components/popover/popover.spec.ts`

**Interfaces:**

- Produces: `kbqGetPopUpArrowShift(placement: string, panelRect: DOMRect, point: { x: number; y: number }, arrowCenterInset: number): { x: number; y: number }`.
- Produces: `KbqPopUpTrigger.arrowCentered: boolean`, `KbqPopUpTrigger.getArrowPoint(): { x: number; y: number } | null`, and `protected KbqPopUpTrigger.getOriginCenter(): { x: number; y: number }`.
- Produces: `KbqPopUp.arrowCentered: boolean` and `protected KbqPopUp.arrowCenterInset: number`.
- Consumes: existing `KbqPopoverTrigger.getPointerPoint()` and `KbqPopUpTrigger.onPositionChange()` lifecycle.

- [ ] **Step 1: Move the geometry cases into a failing core spec**

Cover all 12 placements using the values currently in `popover-positioning.spec.ts`, passing `30` as `arrowCenterInset`. Add `bottom-right` with a `40px`-wide panel and inset `30`, asserting `{ x: 10, y: 0 }` (the narrow-panel fallback centers the arrow), and a tooltip-sized case with inset `21`, asserting `{ x: -179, y: 0 }` for a `bottom-right` panel at `100..400` and point `x=200`.

- [ ] **Step 2: Run the core spec to verify it fails**

Run: `npx vitest run packages/components/core/pop-up/pop-up-positioning.spec.ts`
Expected: FAIL because `pop-up-positioning.ts` does not exist.

- [ ] **Step 3: Implement and export the pure geometry function**

Move the algorithm from `getPopoverArrowShift`, adding the `arrowCenterInset` parameter. Keep physical viewport coordinates and the existing `min > max` narrow-panel fallback. Export it from `packages/components/core/pop-up/index.ts`.

- [ ] **Step 4: Generalize shared trigger and popup arrow handling**

In `KbqPopUpTrigger`:

- Add `arrowCentered = false`.
- Make `getAdjustedPositions()` skip legacy narrow-anchor offsets when `arrowCentered` is true.
- Implement `getArrowPoint()` to return `null` when centering is off and `getOriginCenter()` otherwise.
- Resolve `getOriginCenter()` from the explicit `origin` or the native host, supporting `ElementRef`, `CdkOverlayOrigin`, `HTMLElement` and `{ x, y, width, height }` without browser globals.

In `KbqPopUp`:

- Record the resolved CSS placement in `updateClassMap()`.
- Add `arrowCentered = false` and `protected arrowCenterInset = 0`.
- Implement `updateArrowPosition()` to translate `--${prefix}-arrow-shift-x/y` through `kbqGetPopUpArrowShift`, skip unchanged writes and remove both properties when no point, no arrow or `stickToWindow` applies.

In popover, set `arrowCenterInset = 30`, override `getArrowPoint()` as `getPointerPoint() ?? super.getArrowPoint()`, delete the component's duplicate shift renderer and replace the old helper with the shared implementation.

- [ ] **Step 5: Run shared and popover regression tests**

Run: `npx vitest run packages/components/core/pop-up/pop-up-positioning.spec.ts packages/components/popover/popover.spec.ts`
Expected: PASS, including existing pointer shift values, stale-shift cleanup and unchanged-write checks.

- [ ] **Step 6: Commit**

```bash
git add packages/components/core/pop-up packages/components/popover/popover.component.ts packages/components/popover/popover-positioning.ts packages/components/popover/popover-positioning.spec.ts
git commit -m "feat(core): add popup arrow centering geometry (#DS-2467)"
```

### Task 2: Popover opt-in input and documentation

**Files:**

- Modify: `packages/components/popover/popover.component.ts`
- Modify: `packages/components/popover/popover.spec.ts`
- Modify: `packages/components/popover/popover.{en,ru}.mdx`
- Modify: `packages/docs-examples/components/popover/popover-arrow-and-offset/popover-arrow-and-offset-example.ts`

**Interfaces:**

- Consumes: Task 1 shared `arrowCentered`, `getArrowPoint()` and `kbqGetPopUpArrowShift()`.
- Produces: `KbqPopoverTrigger.arrowCenteredInput` with alias `kbqPopoverArrowCentered`; the existing public `arrowCentered` field carries the resolved boolean.

- [ ] **Step 1: Add failing popover behavior tests**

Bind `arrowCentered` in `PopoverPlacement`. For a `bottomRight` popover with trigger rect `left=100, right=300` and panel rect `left=100, right=500`, assert `--kbq-popover-arrow-shift-x: -270px`, `0px` on Y and no `offsetX/offsetY` in adjusted positions. Resolve the same panel as `top-left` and assert a recalculated `70px` shift; then use explicit origin `{ x: 400, y: 160, width: 0, height: 0 }` and assert its center wins over the host. Toggle the input off while open and assert both CSS properties are removed. Retain the existing click-point test proving pointer priority.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npx vitest run packages/components/popover/popover.spec.ts -t "arrow centering"`
Expected: FAIL because the new input is unknown and no shift is synchronized.

- [ ] **Step 3: Implement the public popover input**

Add `arrowCenteredInput` with the standard boolean transform and `kbqPopoverArrowCentered` alias, restore `false` for a bound `undefined`, synchronize it into the open component in `pushData()` and include it in reactive input updates. Document that it centers the arrow on the trigger while preserving panel placement and defaults to `false`.

- [ ] **Step 4: Run popover and shared tests**

Run: `npx vitest run packages/components/core/pop-up/pop-up-positioning.spec.ts packages/components/popover/popover.spec.ts`
Expected: PASS.

- [ ] **Step 5: Document the option in both locales**

Extend the existing arrow-and-offset example with an `Arrow centered` toggle and an edge placement that makes the effect visible. Explain under Alignment that the panel stays edge-aligned while the arrow moves to the trigger center; keep the existing default behavior description explicit.

- [ ] **Step 6: Commit**

```bash
git add packages/components/popover packages/docs-examples/components/popover/popover-arrow-and-offset
git commit -m "feat(popover): center arrow on trigger (#DS-2467)"
```

### Task 3: Tooltip opt-in input, caret support and documentation

**Files:**

- Modify: `packages/components/tooltip/tooltip.component.ts`
- Modify: `packages/components/tooltip/tooltip.scss`
- Modify: `packages/components/tooltip/tooltip.spec.ts`
- Modify: `packages/components/tooltip/tooltip.{en,ru}.mdx`
- Modify: `packages/docs-examples/components/tooltip/tooltip-arrow/tooltip-arrow-example.ts`

**Interfaces:**

- Consumes: Task 1 shared popup rendering and origin methods.
- Produces: `KbqTooltipTrigger.arrowCenteredInput` with alias `kbqTooltipArrowCentered`; `protected KbqTooltipTrigger.getOriginCenter()` uses the caret origin when `relativeToCaret` is true.

- [ ] **Step 1: Add failing tooltip behavior tests**

Extend the arrow/offset host with centering and placement bindings. For `bottomRight`, assert `--kbq-tooltip-arrow-shift-x: -179px` using the same trigger/panel geometry as Task 2 and inset `21`, no legacy position offsets and cleanup after turning centering off. Add a narrow-panel clamp case, an arrowless case with no shift, and a caret case whose stubbed caret rect is `{ x: 160, y: 90, width: 0, height: 20 }`, asserting arrow point `{ x: 160, y: 100 }` rather than the host center.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npx vitest run packages/components/tooltip/tooltip.spec.ts -t "arrow centering"`
Expected: FAIL because the input, CSS translation and caret override do not exist.

- [ ] **Step 3: Implement tooltip centering**

Set the component's `arrowCenterInset` to `21`, add the standard boolean `arrowCenteredInput`, synchronize it in `updateData()` and reactive changes, and override `getOriginCenter()` to use `caretOrigin` in caret mode. Add `translate(var(--kbq-tooltip-arrow-shift-x, 0px), var(--kbq-tooltip-arrow-shift-y, 0px))` before the existing arrow rotation.

- [ ] **Step 4: Run tooltip and shared tests**

Run: `npx vitest run packages/components/core/pop-up/pop-up-positioning.spec.ts packages/components/tooltip/tooltip.spec.ts`
Expected: PASS, including existing navbar-owned tooltip and arrow/offset tests.

- [ ] **Step 5: Document the option in both locales**

Extend `tooltip-arrow` with an edge-aligned centered-arrow example and explain in the Arrow section that `kbqTooltipArrowCentered` requires a visible arrow, defaults to `false` and does not change panel alignment.

- [ ] **Step 6: Commit**

```bash
git add packages/components/tooltip packages/docs-examples/components/tooltip/tooltip-arrow
git commit -m "feat(tooltip): center arrow on trigger (#DS-2467)"
```

### Task 4: Navbar integration, generated API and full verification

**Files:**

- Modify: `packages/components/navbar/e2e.ts`
- Modify: `packages/components/navbar/e2e.playwright-spec.ts`
- Modify: `apps/docs/src/app/structure.ts`
- Generate: `tools/public_api_guard/components/{core,popover,tooltip}.api.md`

**Interfaces:**

- Consumes: the two public inputs from Tasks 2 and 3.
- Produces: no new runtime API; adds the DS-2467 end-to-end scenario and updated public API snapshots.

- [ ] **Step 1: Add the navbar browser scenario and geometry test**

Create `E2eNavbarPopupArrowCentering` with a popover and a tooltip on wide buttons in a horizontal navbar. Both use `bottomRight` and their new centered-arrow input. In Playwright assert within `1px` that each arrow's center equals its trigger's center and that the panel preserves CDK's logical end alignment: right edges match in LTR, left edges match in RTL. Repeat after vertical scroll and viewport resize, and run one LTR and one RTL case. Do not add screenshots.

- [ ] **Step 2: Run the new browser test against the fresh e2e build**

Run: `yarn run e2e:docker yarn playwright test packages/components/navbar/e2e.playwright-spec.ts -g "popup arrow centering"`
Expected: PASS after the standard Docker webServer flow rebuilds the app with Tasks 1–3; a stale build must be rebuilt before diagnosing the test.

- [ ] **Step 3: Mark the documentation items Updated**

Set `isUpdated: expiresAt('2026-11-19')` on the Popover and Tooltip structure entries, preserving any live New badge rules and existing property order.

- [ ] **Step 4: Run component and documentation verification**

Run sequentially:

```bash
yarn run styles:build-all
npx vitest run packages/components/core/pop-up/pop-up-positioning.spec.ts packages/components/popover/popover.spec.ts packages/components/tooltip/tooltip.spec.ts packages/components/navbar/navbar.component.spec.ts
yarn run check-spec-types
npx tsc --noEmit -p packages/e2e/tsconfig.app.json
yarn run check-e2e-types
yarn run build:docs-examples
```

Expected: all PASS with no new warnings.

- [ ] **Step 5: Build and refresh intended public API snapshots**

Run: `yarn run build:components`, then `yarn run approve-api "components/core"`, `yarn run approve-api "components/popover"` and `yarn run approve-api "components/tooltip"`.
Verify the diffs contain only the shared centering members and new inputs, then run `yarn run check-api`, `yarn run check-public-api-any` and `yarn run check-typings`.

- [ ] **Step 6: Verify docs and browser behavior**

Run sequentially:

```bash
yarn run build:docs-content
yarn run check-api-docs
yarn run check-llms
yarn run e2e:docker yarn playwright test packages/components/navbar/e2e.playwright-spec.ts packages/components/popover/e2e.playwright-spec.ts packages/components/tooltip/e2e.playwright-spec.ts
```

Expected: all PASS in Linux Docker with zero new baselines. If a documentation ratchet changes only because members gained descriptions, inspect and approve that intended baseline change.

- [ ] **Step 7: Run final static checks and clean task artifacts**

Run `yarn run eslint`, `yarn run stylelint`, `yarn run prettier` and `yarn run cspell`. Remove `tmp/ds-2467/` and any native Playwright actuals, then inspect `git status --short` for generated files not required by the change.

- [ ] **Step 8: Commit**

```bash
git add packages/components/navbar apps/docs/src/app/structure.ts tools/public_api_guard/components
git commit -m "test(navbar): cover centered popup arrows (#DS-2467)"
```
