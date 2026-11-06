# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/progress-spinner/` (component, template, styles and tokens, the unit spec, `e2e.ts` and the Playwright spec), the shared color and motion code in `packages/components/core` (`KbqColorDirective`, `kbqAnimationsDisabled()`, the `kbq-animations-off()` mixin), the `progress-spinner.{en,ru}.mdx` and `examples.progress-spinner.{en,ru}.mdx` pages, the two docs examples under `packages/docs-examples/components/progress-spinner/`, the dev app under `packages/components-dev/progress-spinner/` and the API golden file `tools/public_api_guard/components/progress-spinner.api.md`. Every claim was checked against the source. The archived select baseline is the only spec so far and sets the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when progress-spinner behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the private computed members, the inner element classes, the keyframes and timing of the motion, and design tokens.
- The components that render a spinner inside them (`kbq-loader-overlay`, `kbq-select`, `kbq-file-upload`, the tree option, the notification center).
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline** (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at a flat path that matches the entry point, English, quirks documented as they ship, only confirmed behaviour, and the same definition of what counts as contract. Only the decisions specific to this component follow.
2. **The text and caption directives belong to `progress-spinner`.** They ship in the same entry point, have no inputs and do nothing outside a spinner except add a class. A capability of their own was rejected as too thin to review apart.
3. **The arc is specified through `stroke-dashoffset` and the circle radius, not as a share of the circle.** "The arc covers `value` percent of the circle" was considered and rejected: it holds only for the big size (see Findings, suspected defect 1). The numbers in the scenarios are the ones the unit tests assert. A geometry fix changes them through a `MODIFIED` delta of "Determinate arc follows the value" and "Size".
4. **The missing accessibility semantics are stated as a requirement**, not left out. A consumer learns from the spec that they have to supply the semantics themselves, and adding `progressbar` semantics later shows up as a deliberate `MODIFIED` delta instead of passing unnoticed.
5. **Stroke colors and box sizes are styling and stay out of the spec; the host classes that select them are contract.** The colors that add a class but no stroke of their own are a finding.
6. **The behaviour inherited from `KbqColorDirective` is in the spec.** Consumers reach it through the spinner's public `color` input and `color` signal, even though its tests live in `core`.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/progress-spinner` updates `openspec/specs/progress-spinner/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on CSS or on the source rather than on a test: the motion, the direction of the arc, the missing ARIA] → tasks.md checks each of them by hand in `yarn run dev:progress-spinner` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour: the compact arc and the missing ARIA] → Both are listed under Findings as well. Behaviour the spec states can change later through `MODIFIED`.
- [The geometry numbers sit close to the implementation] → They are what the unit tests assert. A rewrite of the SVG replaces them in a delta.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The overview page covers only `value` and `mode`. It does not mention:
    - `size`, `color` and `id`;
    - the text and caption directives;
    - that `value` is clamped for display and that non-numeric values read as 0 (the JSDoc of `value` does say so);
    - motion and accessibility.

    The indeterminate example uses `size="big"` and the colors `contrast` and `contrast-fade`, which the page never explains.

2. The examples tab is a "documentation in progress" stub in both languages. `structure.ts` sets `hasExamples: false`, so it is not routed.
3. The JSDoc of `KbqProgressSpinner` says it "reports the progress of an ongoing operation". It reports it only visually (see suspected defect 2).
4. The tokens file declares `--kbq-progress-spinner-size-compact-stroke-width` (2px) and `--kbq-progress-spinner-size-big-stroke-width` (3px), but the stroke is drawn at 13% and 6% of the box. `--kbq-progress-spinner-size-big-content-gap-vertical` is declared too, while the text of a big spinner uses the compact gap. Overriding these tokens changes nothing.

**Suspected defects (from reading the code, not reproduced)**

1. The compact arc overstates progress. The dash array and the offset are computed for 295 units, the circumference of the big circle (radius 47 in the 100-unit view box, 2π × 47 ≈ 295.3). The compact circle has radius 42.5 and a circumference of about 267. The visible compact arc is therefore about 10.5% longer than `value` says, and it closes from about 90.5%; the e2e grid draws its compact spinners at 44% as about 48.6%. Compact is the default size, so most spinners are affected.
2. Assistive technology gets nothing: no `role="progressbar"`, no `aria-valuenow`, `aria-valuemin` or `aria-valuemax`, no accessible name, and no link from the spinner to its text or caption. An indeterminate spinner is just as silent. `kbq-progress-bar` in the same library has all of these. No axe test renders the spinner.
3. `color` accepts every `KbqComponentColors` value and writes its host class, but only `contrast` and `contrast-fade` change the stroke. `error`, `warning`, `success` and `theme-fade` draw the theme stroke. The loader-overlay spec binds `KbqComponentColors.Error` to a spinner.

**Tests whose name and body disagree, or that cannot fail**

- "should move by default" and "should stand still when animations are disabled" only check that a class is absent or present on two inner elements. jsdom runs no CSS, so neither test observes motion. Both would still pass if the `kbq-animations-off()` mixin or the rotation keyframes were removed.
- "should apply class based on color attribute" binds the `color` input, not an attribute. It walks `Object.values(KbqComponentColors)`, which lists `contrast` twice (`Default` is an alias) and includes `empty`.
- The e2e `states` grid:
    - draws the default size next to `size="compact"`, so two pairs of rows are identical;
    - takes its shots with motion off (the e2e app's `KBQ_ANIMATIONS_CONFIG`, reduced motion in the browser context and Playwright's `animations: 'disabled'`), so a broken rotation would not show;
    - covers only the theme, `contrast` and `contrast-fade` colors.

**Behaviour without a test.** The spec states these from the source:

- the arc starting at the top and running clockwise, the fixed-length indeterminate arc and its rotation, and the transition of a determinate value change, all set in CSS;
- the indeterminate class going away, and the arc coming back, when the mode returns to determinate;
- `value()` keeping an out-of-range number as bound;
- the `theme` fallback for a falsy `color`, and `color.set()` on the spinner — covered only by `core/common-behaviors/color.spec.ts` on a generic host;
- the order of the text and the caption, the dropping of other content and the directive host classes — the e2e grid shows a text and a caption but asserts no DOM;
- turning motion off through `provideNoopAnimations()` or reduced motion;
- the absence of `role`, `aria-*` attributes and a tab stop;
- importing the classes without the module.
