# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/progress-bar/` (component, template, styles, the unit spec, `e2e.ts` and the Playwright spec), the color directive, the animation state helper and the a11y locale code in `packages/components/core`, the `progress-bar.{en,ru}.mdx` pages, the two docs examples under `packages/docs-examples/components/progress-bar/`, and the API golden file `tools/public_api_guard/components/progress-bar.api.md`. Every claim was checked against the source before going into the spec. The general approach follows the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`).

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when progress-bar behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: class and member names, the inner track and fill classes, change-detection details, keyframe timings and design tokens beyond the color classes a consumer sets.
- `kbq-progress-spinner` and the shared color and locale code beyond what a bar exposes.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline**: one capability at a flat path matching the entry point, English, quirks documented as they ship, only confirmed behaviour in the spec, suspected defects under Findings.
2. **The text and caption directives belong to `progress-bar`.** They only mean something inside a bar, which names and describes itself through them. A separate capability for them was considered and rejected.
3. **Motion is in the spec, styling is not.** The unit and e2e tests treat two visual facts as contract: an indeterminate bar never looks complete, and with motion off it pulses in place instead of sweeping, which is the reduced-motion guarantee. The spec states them as what the user sees, without the inner fill class or `kbq-animations-disabled`, which the tests use but consumers do not set. The 0.3 s transition is stated because a user notices it; keyframe durations and easing are not.
4. **Quirks as shipped.** Examples:
    - `Infinity` renders an empty bar, not a full one;
    - any `mode` other than `'indeterminate'` is determinate;
    - the bar has no `localeOverrides` input of its own, so a per-bar override of the fallback name comes from an ancestor `[kbqLocaleOverrides]` or from `aria-label`.

    A fix for any of these belongs in its own change, with a `MODIFIED` delta.

5. **What counts as contract.** These count:
    - the inputs `value`, `mode`, `color`, `id` and `aria-label`, and the `id` inputs of the text and caption;
    - the selectors `kbq-progress-bar`, `[kbq-progress-bar-text]` and `[kbq-progress-bar-caption]`;
    - the host classes `kbq-progress-bar`, `kbq-progress-bar_determinate`, `kbq-progress-bar_indeterminate`, `kbq-<color>`, `kbq-progress-bar-text` and `kbq-progress-bar-caption`;
    - the role, the range attributes, `aria-label`, `aria-labelledby` and `aria-describedby`;
    - the generated id patterns and the locale key `a11y.progressBar`.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/progress-bar` updates `openspec/specs/progress-bar/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [The visual requirements rest on CSS, which a styling-only change can alter] → They are worded by outcome (narrower than the track, sweeps, pulses) rather than by value, and the e2e suite asserts the first two. A styling change that breaks them updates the spec in the same change.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:progress-bar` before archiving. A mismatch is corrected in the spec, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. `Infinity` rendering as zero is stated because the source chose it on purpose; it can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The `color` section of `progress-bar.{en,ru}.mdx` lists four values. The input accepts every `KbqComponentColors` value and any string: `theme-fade`, `warning` and `success` add their `kbq-<color>` class, but the bar paints them with the theme fill, because only `contrast`, `contrast-fade` and `error` redeclare it.
2. The docs say values outside the range are clamped. They do not say that a non-finite value renders as zero, so `Infinity` gives an empty bar rather than a full one.
3. The JSDoc of `ariaLabel` says it takes precedence over the projected text and that the locale name is used "when neither is given". An empty string counts as given for the fallback but not for the precedence (see suspected defect 1).
4. The "Theming" section advises restyling one bar through `--kbq-progress-bar-fill`. The theme declares that property on `.kbq-progress-bar` and again on `.kbq-progress-bar.kbq-contrast`, `.kbq-contrast-fade` and `.kbq-error`, so a consumer rule with one class loses on a colored bar, and on any bar when the component styles load later. Read from the CSS, not reproduced.
5. `examples.progress-bar.{en,ru}.mdx` are "Documentation in progress" stubs. `structure.ts` sets `hasExamples: false`, so they are not routed; the two examples appear only on the overview page.

**Suspected defects (from reading the code, not reproduced)**

1. With `aria-label=""`, the host gets an empty `aria-label`. Without projected text it then has no accessible name at all, because the locale fallback is skipped (axe `aria-progressbar-name`). With projected text it carries both the empty `aria-label` and `aria-labelledby`.
2. `value` has no number transform and the finiteness check does not coerce. A string value — a static `value="30"` in a project without strict template type checking, or a string from a form control — renders an empty bar with `aria-valuenow="0"`.
3. Binding `undefined` to the `id` of a projected text removes its id, because a signal input does not fall back to its default. The bar then has neither `aria-label` nor `aria-labelledby`, since the fallback is skipped whenever a text is projected.
4. In a right-to-left layout the determinate fill grows from the right edge, but the indeterminate sweep is built on `translateX` from a left origin. Read from the CSS, the segment seems to appear in the middle of the track at the start of each iteration and leave to the right. No RTL test or screenshot exists.

**Tests whose name and body disagree, or that cannot fail**

- "should animate a new value by default" only checks that the fill lacks `kbq-animations-disabled`. jsdom runs no transition, so no test observes the animation.
- "should follow a new value without a transition when animations are disabled" only checks the same class. Nothing checks the transition is gone.
- "should pulse the indeterminate fill in place when animations are disabled" checks two classes. Neither the unit nor the e2e suite observes the pulse; the e2e reduced-motion test checks only the width of the fill.
- jsdom has no `matchMedia`, so the unit suite never takes the reduced-motion path of the animation state. Only `KBQ_ANIMATIONS_CONFIG` is exercised.

**Behaviour without a test.** The spec states these from the source:

- the `kbq-progress-bar` host class and the `kbq-progress-bar-text` and `kbq-progress-bar-caption` classes;
- `Infinity` and `-Infinity` rendering as zero;
- an indeterminate fill keeping its width while `value` changes;
- the bar being display-only (not focusable, no outputs, no key or pointer handling);
- projected content outside the two slots not being rendered;
- the width transition with motion on, and its absence with motion off;
- `provideNoopAnimations()` and `prefers-reduced-motion` turning motion off;
- the opacity pulse of the indeterminate fill;
- an `undefined` color falling back to `theme` (the unit test binds `null`, the e2e screenshot `''`);
- the `en-US` fallback name, and the `ru-RU` one without a locale service;
- overriding the fallback name through `kbqA11yLocaleConfigurationProvider` and `[kbqLocaleOverrides]`.
