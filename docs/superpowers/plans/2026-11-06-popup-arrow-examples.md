# Popup Arrow Examples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make centered arrows directly observable in the existing popover and tooltip documentation examples.

**Architecture:** Extend the two examples already referenced beside the centered-arrow explanations. No new example IDs, runtime changes or generated example registrations are needed.

**Tech Stack:** Angular standalone example components, Playwright browser smoke checks, MDX documentation builds.

**Spec:** `docs/superpowers/specs/2026-11-06-popup-arrow-examples-design.md`

## Global Constraints

- `Arrow centered` defaults to `false` in the popover example.
- Apply the popover toggle only to placements that already render an arrow; placements without arrows stay unchanged.
- Ordinary and centered tooltip arrows both use `bottomRight`.
- Do not add example IDs, change runtime code or duplicate examples between documentation tabs.

## Review Focus

- Initial popover rendering must retain its previous appearance; the browser smoke check verifies the toggle starts off.
- Enabling centering must not add arrows to left/right placements that deliberately hide them; the browser smoke check covers this.
- Tooltip comparison must differ only in arrow alignment, not placement; the browser smoke check verifies both panels use `bottom-right`.

---

### Task 1: Extend the existing popover and tooltip examples

**Files:**

- Modify: `packages/docs-examples/components/popover/popover-placement-edges/popover-placement-edges-example.ts`
- Modify: `packages/docs-examples/components/popover/popover-placement-edges/popover-placement-edges-example.html`
- Modify: `packages/docs-examples/components/tooltip/tooltip-arrow/tooltip-arrow-example.ts`
- Document: `docs/superpowers/specs/2026-11-06-popup-arrow-examples-design.md`
- Document: `docs/superpowers/plans/2026-11-06-popup-arrow-examples.md`

**Interfaces:**

- Consumes: public `kbqPopoverArrowCentered` and `kbqTooltipArrowCentered` inputs from DS-2467.
- Produces: a local `arrowCentered = false` example property and template bindings; no public runtime API.

- [ ] **Step 1: Capture the failing browser smoke expectations**

Against the current documentation examples, assert that `popover-placement-edges` exposes an unchecked `Arrow centered` control and that the ordinary tooltip uses `bottomRight`, just like the centered one. Record the expected RED: the popover control is absent and the ordinary tooltip has no explicit edge placement.

- [ ] **Step 2: Extend the popover example**

Add the `arrowCentered = false` property and an `Arrow centered` toggle using the repository's existing toggle pattern. Bind `[kbqPopoverArrowCentered]="arrowCentered"` to every placement that currently renders an arrow; do not add the binding to placements marked `[kbqPopoverArrow]="false"`.

- [ ] **Step 3: Align the tooltip comparison**

Add `kbqPlacement="bottomRight"` to the ordinary `With arrow` button while retaining the centered button's existing inputs. Keep the no-arrow button unchanged.

- [ ] **Step 4: Build and verify the browser comparison**

Run `yarn run build:docs-examples` and `yarn run build:docs-content`. Serve the docs with `yarn run docs:start:dev` and verify:

- the popover toggle starts off and moves only the arrow when enabled;
- popover placements without arrows remain without arrows;
- ordinary and centered tooltips both render `kbq-tooltip_placement-bottom-right`, with only their arrow alignment differing.

- [ ] **Step 5: Run static checks and review**

Run Prettier and cspell on the changed files, inspect the diff for the two examples plus approved design/plan only, and ensure no generated module or runtime component changed.

- [ ] **Step 6: Commit**

```bash
git add packages/docs-examples/components/popover/popover-placement-edges packages/docs-examples/components/tooltip/tooltip-arrow docs/superpowers/specs/2026-11-06-popup-arrow-examples-design.md docs/superpowers/plans/2026-11-06-popup-arrow-examples.md
git commit -m "docs(examples): demonstrate centered popup arrows (#DS-2467)"
```
