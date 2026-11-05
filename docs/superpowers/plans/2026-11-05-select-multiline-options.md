# Select Multiline Options Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing Select two-line-option example so long option labels wrap and options have different heights.

**Architecture:** The change is confined to a docs example and its MDX pages. A panel-specific class overrides the option text's default truncation; the component API and shared styles remain unchanged.

**Tech Stack:** Angular standalone components, TypeScript, CSS, MDX, Koobiq docs tooling.

**Spec:** `docs/superpowers/specs/2026-11-05-select-multiline-options-design.md`

## Global Constraints

- Keep the existing `select-two-line-option` example and its option captions.
- Use `panelClass="example-select-multiline-options"` and `panelWidth="auto"`; do not change library code or add an API input. `panelWidth="auto"` keeps the panel at the field width, so the panel cannot auto-size to the longest label.
- Set only `white-space: normal` and `overflow-wrap: break-word` on the panel's `.kbq-option-text` for wrapping.
- Update Russian and English documentation alike and set Select's `isUpdated` expiry to `2026-11-19`.
- Do not commit unless the user explicitly asks.

## Review Focus

- A short label must remain on one line while a long label wraps; check both in the browser step.
- Captions must remain visible below labels of both heights; check them in the browser step.
- A long selected value must retain the trigger's existing single-line truncation; check it after selecting the long option.
- The CSS override must affect only this example's overlay panel; verify the selector includes `example-select-multiline-options`.
- Russian and English pages must present the same example and mechanism; build both through `build:docs-content`.

---

### Task 1: Demonstrate wrapping in the existing Select example

**Files:**

- Modify: `packages/docs-examples/components/select/select-two-line-option/select-two-line-option-example.ts`
- Modify: `packages/components/select/select.ru.mdx:228-230`
- Modify: `packages/components/select/select.en.mdx:229-231`
- Modify: `apps/docs/src/app/structure.ts:912-922`

**Interfaces:**

- Consumes: existing `KbqSelect` `panelClass` and `panelWidth` inputs and `.kbq-option-text` overlay markup.
- Produces: panel class `example-select-multiline-options`; no new public API or example registration.

- [ ] **Step 1: Add the reproduction data and panel hook**

In `select-two-line-option-example.ts`, keep the current component and captions, replace the generated labels with a short literal array containing `Option #0` through `Option #4`, and make at least two labels long enough to wrap at the existing 320 px width. Add `panelClass="example-select-multiline-options"` and `panelWidth="auto"` to `<kbq-select>` without adding imports.

- [ ] **Step 2: Confirm the current CSS does not satisfy the requirement**

Run the docs app with `yarn run docs`, open the Select overview and the example's panel. Expected before the CSS override: long labels are truncated rather than wrapping. Stop the server after this check.

- [ ] **Step 3: Enable wrapping only for this example**

In the example's `styles`, add a `::ng-deep` rule scoped to `.example-select-multiline-options .kbq-option-text` with `white-space: normal` and `overflow-wrap: break-word`. Do not change widths, heights, shared component styles or trigger styles.

- [ ] **Step 4: Document the mechanism and updated state**

Under the existing option-caption section in both Select MDX overviews, explain that the default single-line truncation can be replaced with wrapping through `panelWidth="auto"`, `panelClass` and the example's `.kbq-option-text` override. Keep the existing example ID and add no duplicate section. Add `isUpdated: expiresAt('2026-11-19')` as the last property of the Select item in `apps/docs/src/app/structure.ts`, without a trailing comma.

- [ ] **Step 5: Run automated verification**

Run, sequentially:

```bash
yarn run build:docs-examples
yarn run build:docs-content
yarn exec prettier --check packages/docs-examples/components/select/select-two-line-option/select-two-line-option-example.ts packages/components/select/select.ru.mdx packages/components/select/select.en.mdx apps/docs/src/app/structure.ts docs/superpowers/specs/2026-11-05-select-multiline-options-design.md docs/superpowers/plans/2026-11-05-select-multiline-options.md
```

Expected: all commands exit with code 0. If Prettier reports a file, run the same command with `--write`, then repeat `--check`.

- [ ] **Step 6: Verify the delivered example in the docs app**

Run `yarn run docs`, open the Russian Select overview, and inspect the `select-two-line-option` panel. Expected: long labels wrap, short labels stay on one line, captions remain visible, and rows have different heights. Select a long option and confirm the trigger retains its normal truncation. Switch to English and confirm the same example and explanation are present. Stop the server and remove any temporary verification files.
