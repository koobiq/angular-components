# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/divider/` (the component, the module, `divider.scss` for the layout rules, the unit spec, `e2e.ts` and the Playwright spec), `kbqOptionalNumberAttribute` in `packages/components/core/utils/utils.ts` together with Angular's `numberAttribute` it builds on, the `divider.{en,ru}.mdx` and `examples.divider.{en,ru}.mdx` pages, the two docs examples under `packages/docs-examples/components/divider/`, the `divider` entry of `apps/docs/src/app/structure.ts`, the dev app in `packages/components-dev/divider/`, and the API golden file `tools/public_api_guard/components/divider.api.md`. Every claim was checked against the source. The general approach follows the archived select baseline (`2026-10-21-document-select-baseline`).

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when divider behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- The color, the thickness of the line and the size of the spacing, which come from design tokens.
- How other components place or restyle a divider (for example the `.kbq-divider` rules in `dropdown.scss`).
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline.** One capability at the flat path `divider`, written in English; the spec describes what ships, quirks included; only behaviour confirmed by a test or read in the source goes in; suspected defects and unbacked docs claims go to Findings.
2. **The host classes are contract.** `kbq-divider`, `kbq-divider_horizontal`, `kbq-divider_vertical` and `kbq-divider_paddings` are what the unit tests assert and what consumers style against, so the spec names them. The four inputs, `role`, `aria-orientation` and the inline `width` / `height` written for `length` are contract for the same reason.
3. **Layout rules are in, token values are out.** The docs page has sections on length and spacing, and consumers lay out around them, so the spec states where the spacing goes (margins on the cross axis, none along the line, none with `paddings` off) and how a divider without `length` is sized (block width, 100% height). It does not state the 1 px thickness, the 4 px margin or the color: those are token values a theme can change without changing behaviour.
4. **`paddings` is described as margins.** The input name says padding, but the stylesheet and the input's JSDoc say margins. The spec follows the code.
5. **Negative lengths stay out of the spec.** `-5` passes the parser, but what reaches the page depends on the browser rejecting a negative size. It is listed under Findings instead of being written down as behaviour.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/divider` updates `openspec/specs/divider/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source or on a screenshot rather than on an assertion] → tasks.md checks each of them by hand in `yarn run dev:divider` before archiving. A mismatch is corrected in the delta, not in the code.
- [Layout rules read as styling] → Only the direction of the spacing and the sizing model are stated; any token value can change without a delta.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Length" section says a divider "takes its length from the layout around it". A vertical divider only does so in a container with a definite height (its height is `100%`), and a horizontal one only in a block container. See suspected defect 1.
2. The JSDoc of `decorative` says a decorative divider is "hidden from assistive technology". The code sets `role="presentation"`, which hides only a bare divider: ARIA's conflict resolution ignores `presentation` once the element gets a global ARIA attribute such as `aria-label`, or becomes focusable.
3. The "Spacing" section does not say that `paddings` adds margins, so a consumer's own `margin` replaces the spacing. Both docs examples set `style="margin: 20px"`, so the page never shows the default spacing.
4. `examples.divider.en.mdx` and `examples.divider.ru.mdx` are "documentation in progress" stubs, while `structure.ts` sets `hasExamples: false` for the divider, so they are never routed.

**Suspected defects (from reading the code, not reproduced)**

1. A vertical divider without `length` in a container with no definite height gets a height of `auto`, and an empty element is then 0 px tall, so the line disappears. A horizontal divider in a flex row shrinks to 0 px wide the same way.
2. A negative `length` is a finite number, so it passes the parser and is written as, for example, `-5px`. Browsers reject a negative `width` or `height`, so the divider silently falls back to its layout length.
3. The divider always writes `role`, so a `role` the caller puts on the element is replaced by `separator` or `presentation`. A caller's `aria-orientation` is removed from horizontal and decorative dividers in the same way.

**Tests whose name and body disagree, or that cannot fail**

- "should drop a decorative divider out of the accessibility tree" asserts only `role="presentation"`; jsdom has no accessibility tree to check.
- No test was found that cannot fail.

**Behaviour without a test.** The spec states these from the source:

- content inside `<kbq-divider>` is not rendered;
- the divider is not focusable and has no outputs or interaction;
- `"false"` coerced to `false` for `vertical` and `decorative` (only `paddings="false"` is tested; all three share the same transform);
- an empty string or `null` for `length` meaning no length (only `"tall"` is tested);
- the default length: a block-width horizontal divider and a 100% tall vertical one (the e2e screenshot shows it but asserts nothing about sizes);
- the spacing margins on the cross axis (shown only by the e2e screenshot);
- a runtime change of `paddings` or `decorative` (only a change of `vertical` is tested).
