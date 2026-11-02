# Popover Relative to Pointer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in popover mode that opens at a real click point and keeps its arrow aimed at that point after scrolling, flipping and viewport pushing.

**Architecture:** Reuse the existing connected-overlay origin API with a private dynamic zero-size pointer origin. Keep arrow geometry in an internal pure helper and apply its result through two CSS custom properties after each CDK position change. Preserve all existing defaults and give explicit `kbqPopoverOrigin` precedence.

**Tech Stack:** Angular 21, TypeScript, Angular CDK Overlay, SCSS, Vitest, Playwright, MDX.

**Spec:** `docs/superpowers/specs/2026-11-02-popover-relative-to-pointer-design.md`

## Global Constraints

- `kbqRelativeToPointer` defaults to `false`; current consumers see no behavior change.
- Only `MouseEvent.detail > 0` activates pointer positioning; `kbqPopoverOrigin` has priority over the pointer origin.
- Keep the existing 8px offset and add no dependencies or public geometry helpers.
- Write EN/RU documentation and JSDoc; use Docker for screenshot baselines.
- Do not commit or push unless explicitly requested.

## Review Focus

- Keyboard or programmatic clicks with `detail === 0`: expect host/explicit-origin anchoring; pinned by Task 1 event-filter tests.
- Scroll/resize after a pointer open: expect the point to follow the host; pinned by Task 1 dynamic-origin tests and Task 3 browser coverage.
- CDK push near every viewport edge: expect a clamped arrow shift, never a detached arrow; pinned by Task 2 geometry tests and Task 3 browser coverage.
- Repeated clicks while attached and delayed hide/show work: expect the latest real click to win without stale work; pinned by Task 1 repeated-click tests.
- Explicit origin changed while open and arrow disabled/stick-to-window: expect no stale pointer shift; pinned by Task 1 precedence and Task 2 cleanup tests.

---

### Task 1: Cursor-relative origin and public input

**Files:**

- Modify: `packages/components/core/pop-up/pop-up-trigger.ts:1063-1081`
- Modify: `packages/components/popover/popover.component.ts:614-639,795-835,934-990`
- Test: `packages/components/popover/popover.spec.ts`

**Interfaces:**

- Consumes: existing `KbqOverlayOrigin`, `KbqCaretRect`, `kbqCreateCaretOrigin`, `updateOrigin()`, `getResolvedOrigin()` and `getAnchorSize()`.
- Produces: `KbqPopoverTrigger.relativeToPointer: boolean`, signal input alias `kbqRelativeToPointer`, and docs-private `getPointerPoint(): { x: number; y: number } | null` for Task 2.

- [ ] **Step 1: Write failing pointer-origin specs**

Add specs proving that a click with `detail: 1`, `clientX: 80`, `clientY: 60` on a host at `(10, 20)` produces a zero-size origin at `(80, 60)`; moving the host rectangle to `(30, 50)` moves the same origin by `(20, 30)`. Add cases for `detail: 0`, Enter/Space, programmatic show, hover, explicit-origin precedence and a second real click while attached.

- [ ] **Step 2: Run the specs and verify the new cases fail**

Run: `npx vitest run packages/components/popover/popover.spec.ts -t "kbqRelativeToPointer"`
Expected: FAIL because the input and pointer origin do not exist.

- [ ] **Step 3: Implement click capture and pointer origin**

Record click events in the base listener. In `KbqPopoverTrigger`, add the boolean member and transformed signal input, consume the mouse event once, store pointer coordinates relative to the host, and expose the current dynamic point through `getPointerPoint()`. Override origin and anchor-size resolution with the precedence explicit origin → pointer origin → host. Reposition an attached popover on a new real click.

- [ ] **Step 4: Run focused and regression unit suites**

Run: `npx vitest run packages/components/popover/popover.spec.ts packages/components/core/pop-up/pop-up.spec.ts packages/components/tooltip/tooltip.spec.ts`
Expected: PASS.

### Task 2: Exact arrow geometry and rendering hook

**Files:**

- Create: `packages/components/popover/popover-positioning.ts`
- Create: `packages/components/popover/popover-positioning.spec.ts`
- Modify: `packages/components/core/pop-up/pop-up.ts`
- Modify: `packages/components/core/pop-up/pop-up-trigger.ts:831-864`
- Modify: `packages/components/popover/popover.component.ts`
- Modify: `packages/components/popover/popover.scss:143-154`
- Test: `packages/components/popover/popover.spec.ts`

**Interfaces:**

- Consumes: `KbqPopoverTrigger.getPointerPoint()` from Task 1 and resolved CSS placement passed to `KbqPopoverComponent.updateClassMap()`.
- Produces: internal `getPopoverArrowShift(placement: string, panelRect: DOMRect, point: { x: number; y: number }): { x: number; y: number }`; CSS variables `--kbq-popover-arrow-shift-x/y`; docs-private `KbqPopUp.updateArrowPosition(): void`.

- [ ] **Step 1: Write failing pure geometry specs**

Cover center, start and end variants of all four placement families. Use a panel `(100, 100, 300, 160)` and verify shifts toward the point, clamping to the 30px center inset, zero shifts on the non-parallel axis and centered fallback for a panel narrower than 60px.

- [ ] **Step 2: Run geometry specs and verify they fail**

Run: `npx vitest run packages/components/popover/popover-positioning.spec.ts`
Expected: FAIL because `getPopoverArrowShift` does not exist.

- [ ] **Step 3: Implement the pure helper and arrow styles**

Implement default centers and clamping from the spec. Add `translate: var(--kbq-popover-arrow-shift-x, 0px) var(--kbq-popover-arrow-shift-y, 0px)` to `.kbq-popover__arrow`, preserving the existing rotation.

- [ ] **Step 4: Write failing rendering-hook specs**

Verify that a position change writes the expected X shift for `top`, Y shift for `right`, and removes both variables when the pointer is inactive, the arrow is hidden or stick-to-window removes the arrow.

- [ ] **Step 5: Implement the post-position hook**

Call `instance.updateArrowPosition()` after position-driven `detectChanges()`. Keep the base implementation empty; in `KbqPopoverComponent`, use the resolved placement, current panel rectangle and `getPointerPoint()` to write or clear the two variables.

- [ ] **Step 6: Run unit and style checks**

Run: `npx vitest run packages/components/popover/popover-positioning.spec.ts packages/components/popover/popover.spec.ts packages/components/core/pop-up/pop-up.spec.ts`
Expected: PASS.
Run: `npx stylelint packages/components/popover/popover.scss --max-warnings=0`
Expected: PASS.

### Task 3: Docs example and browser scenarios

**Files:**

- Create: `packages/docs-examples/components/popover/popover-relative-to-pointer/popover-relative-to-pointer-example.ts`
- Modify: `packages/docs-examples/components/popover/index.ts`
- Modify: `packages/components/popover/popover.en.mdx`
- Modify: `packages/components/popover/popover.ru.mdx`
- Modify: `packages/components/popover/e2e.ts`
- Modify: `packages/components/popover/e2e.playwright-spec.ts`
- Modify: `apps/docs/src/app/structure.ts` (popover `isUpdated: expiresAt('2026-11-16')`)
- Generate: `packages/docs-examples/example-module.ts`, `packages/docs-examples/loader/index.ts`, `apps/docs/src/llms.txt`
- Create in Docker: `packages/components/popover/__screenshots__/03-relative-to-pointer-light.png` and `03-relative-to-pointer-dark.png`

**Interfaces:**

- Consumes: public `kbqRelativeToPointer` and the arrow behavior from Tasks 1–2.
- Produces: example id `popover-relative-to-pointer` and route `/E2ePopoverRelativeToPointer`.

- [ ] **Step 1: Add assertion-based Playwright scenarios first**

Create a long trigger with known click locations. Assert that two clicks produce different arrow shifts, Enter keeps zero shifts, scrolling preserves the arrow-to-point delta, and clicks near viewport edges keep the arrow within the panel and aligned on the parallel axis. Run the new spec natively with `--update-snapshots=none` before adding screenshot assertions.

- [ ] **Step 2: Add the live example and EN/RU section**

Demonstrate `kbqRelativeToPointer` on a long text trigger, document keyboard/programmatic fallback, explicit-origin precedence and the shared input name with tooltip. Register the example and add the 14-day Updated badge.

- [ ] **Step 3: Generate example registries and validate compilation**

Run: `yarn run build:docs-examples-module`
Run: `yarn run build:docs-examples`
Run: `npx tsc --noEmit -p packages/e2e/tsconfig.app.json`
Run: `yarn run check-e2e-types`
Expected: all PASS with the new example and route.

- [ ] **Step 4: Add stable light/dark screenshots and generate Linux baselines**

Park the pointer away from the scenario and assert settled panel/arrow geometry before each screenshot.
Run: `yarn run e2e:docker:update-snapshots yarn playwright test packages/components/popover/e2e.playwright-spec.ts -g "relative to pointer"`
Expected: new Linux baselines and PASS.

### Task 4: Public API, generated docs and full verification

**Files:**

- Build: `dist/components`
- Update as produced by guards: `tools/public_api_guard/components/core.api.md`, `tools/public_api_guard/components/popover.api.md`, API documentation baselines if their counts change.

**Interfaces:**

- Consumes: all previous tasks.
- Produces: verified public declarations and generated documentation for `kbqRelativeToPointer` and the docs-private arrow hook.

- [ ] **Step 1: Format and lint every changed source file**

Run targeted Prettier, ESLint and stylelint fixes, then `yarn run check-spec-types`.
Expected: no warnings or formatting diffs.

- [ ] **Step 2: Build and refresh public API snapshots**

Run: `yarn run styles:build-all`
Run: `yarn run build:components`
Run: `yarn run approve-api "components/core"`
Run: `yarn run approve-api "components/popover"`
Run: `yarn run check-api && yarn run check-public-api-any && yarn run check-typings`
Expected: PASS; inspect snapshots so only the intended input/hook changes appear.

- [ ] **Step 3: Regenerate and check documentation metadata**

Run: `yarn run docs:api-gen`
Run: `yarn run check-api-docs`
If the documented-member counts changed intentionally, run `yarn run approve-api-docs` and repeat the check.
Run: `yarn run docs:generate-llms && yarn run check-llms`
Expected: PASS.

- [ ] **Step 4: Run final component and browser verification**

Run: `npx vitest run packages/components/popover packages/components/core/pop-up packages/components/tooltip`
Run: `yarn run e2e:docker yarn playwright test packages/components/popover/e2e.playwright-spec.ts`
Run: `yarn run docs:build`
Expected: all PASS.

- [ ] **Step 5: Audit the deliverable**

Run: `git status --short`
Expected: only intended source, docs, generated metadata and Linux baselines; delete temporary native screenshots/logs created by this work. Report any pre-existing or unrelated failures rather than fixing them.
