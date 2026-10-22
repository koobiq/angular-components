# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/skeleton/`: the directive and the shared wave in `skeleton.ts`, the presets and their configuration in `skeleton-presets.ts`, `module.ts`, the styles where they define behaviour (`skeleton.scss`, `skeleton-presets.scss`), the unit specs `skeleton.spec.ts` and `skeleton-presets.spec.ts`, `e2e.ts` with `e2e.playwright-spec.ts`, and the `skeleton.{en,ru}.mdx` pages. Also read: the docs examples under `packages/docs-examples/components/skeleton/`, the dev app in `packages/components-dev/skeleton/`, `kbqAnimationsDisabled()` and `KBQ_ANIMATIONS_CONFIG` in `packages/components/core/animation/animations-state.ts`, the `kbq-animations-off()` mixin, the `reducedMotion: 'reduce'` setting in `playwright.config.ts`, and the API golden file `tools/public_api_guard/components/skeleton.api.md`. Every claim in the spec was checked against the source.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the directive or the preset, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when the skeleton or a preset changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the shared wave service, the style loader component, frame batching, the custom property that carries the host offset, class names of the parts inside a preset beyond those a consumer tests against.
- Design tokens, colors and the timing of the wave.
- The components the presets stand in for, and changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at the flat path of the entry point, English, quirks documented as they ship, only confirmed behaviour in the spec, and public names, selectors, host classes and ARIA counted as contract. The skeleton adds these:

1. **The directive and all fourteen presets form one capability, `skeleton`.** The presets are built from the directive, share one configuration token and ship in one entry point. Splitting `skeleton/presets` off was considered and rejected: a change to the directive (how it paints, `inert`, the wave) changes every preset at once.
2. **Geometry the e2e suite asserts is contract.** A preset exists so that the page does not move when the real component replaces it, and `e2e.playwright-spec.ts` measures exactly that. The spec states it relative to the real component ("has the box of a `kbq-form-field` label") rather than in pixels. The one exception is the element presets, whose pixel sizes the e2e suite pins and the docs promise ("match the height of their components").
3. **Styles that change behaviour are contract, tokens are not.** `inert`, the transparent text, the flat fill, the radius fallback, the block display of `kbq-skeleton` and the pause outside the viewport decide what a user sees and can do, so they are in. Token values, colors and the wave duration are not.
4. **The wave is described by its outcome.** The spec says that every skeleton shows the same band at the same moment and that the host position is measured on every pass. It does not name the start-time pinning, the batched measurement or the `--kbq-skeleton-offset` property, which can change without a visible difference. `kbq-skeleton_offscreen` is named, because the unit tests assert it and it sits on a consumer's host.
5. **Layout presets are named by element, and their inner part classes only where a test asserts them.** `kbq-skeleton-table__cell_selection`, `kbq-skeleton-table__cell_pinned-edge`, `kbq-skeleton-tabs__tab_selected` and `kbq-skeleton-tree__node_nested` are in the spec; the other part classes are internal.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/skeleton` updates `openspec/specs/skeleton/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Geometry requirements depend on other components] → A change to the row height of `kbq-table` or to the label of `kbq-form-field` breaks a skeleton requirement, and the e2e suite fails with it. This coupling is intended: the preset has to follow the component.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:skeleton` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings.
- [Visual requirements are hard to assert] → The fill, the bars per line and the still fill under reduced motion rest on the e2e screenshots and on a hand check, not on an assertion.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The typography section of `skeleton.en.mdx` says the widths of several lines "alternate randomly", and `skeleton.ru.mdx` says the same. The widths are fixed: 80 %, 100 % and 60 % in turn, through `nth-child` rules, and 50 % for a single line. The e2e test "should repeat the lengths of the lines of a paragraph" asserts that sequence.
2. The JSDoc of `KbqSkeletonTable.columns` and the docs ("the width of each column") do not say that the widths must be an array. A string such as `columns="160px 1fr"` is read as a number, which fails, so the table gets a single column.
3. The docs do not mention several inputs: `header` and `pinnedColumns` of the table, `vertical` of the tabs, and `label`, `labelClass` and `contentClass` of the form field.
4. The page has no accessibility section. An active skeleton is `inert`, so its content leaves the accessibility tree, and the skeleton announces nothing. The docs do not tell consumers to mark the loading region themselves, for example with `aria-busy`.
5. `examples.skeleton.en.mdx` and `examples.skeleton.ru.mdx` are "documentation in progress" stubs. `structure.ts` sets `hasExamples: false`, so they are not routed; every example lives on the overview page.

**Suspected defects (from reading the code, not reproduced)**

1. The element presets apply the skeleton as a host directive without exposing its input. Binding `[kbqSkeleton]` on one of them either fails to compile or, with `KbqSkeleton` imported, matches the directive twice on one element, which Angular rejects.
2. `toColumns` passes any object through. `[columns]="null"`, possible in a template without strict type checking, then reaches the grid-template computation, which spreads it and throws.
3. Providing `KBQ_SKELETON_PRESETS_CONFIGURATION` directly with a partial object, as the unit test does with a cast, leaves the missing keys `undefined` for presets right below it. They then render a single item instead of the default count. Only `kbqSkeletonPresetsConfigurationProvider()` fills in the defaults.
4. Once off, a `kbq-skeleton` element loses its block display and minimum height and becomes an empty inline element, so the width and height a consumer class gives it no longer apply. That is harmless when the element is swapped out with `@if`, but `[kbqSkeleton]` on the element only hides it.

**Tests whose name and body disagree, or that cannot fail**

- "should keep the wave running where IntersectionObserver is missing": both assertions hold whatever the code does. `env.observed` belongs to the fake observer that the overridden window no longer provides, and nothing can add the offscreen class without an observer. The test fails only if creating the skeleton throws, and it never checks the wave.
- "should run the wave by default" checks only that `kbq-animations-disabled` is absent. The fake window has no `matchMedia`, so reduced motion is never exercised, and nothing about the wave is asserted.
- "should keep the fill still when animations are disabled" asserts the class, not that the fill stands still; that rests on the CSS.
- "should put the label of a form field to the left, under a hint and around a textarea on demand": the name puts the label "under a hint". The body checks the horizontal and textarea classes and that a hint follows the control.
- The e2e screenshot "of every preset" has only the light baseline (`02-light.png`), while the other screenshot test also takes the dark one.

**Behaviour without a test.** The spec states these from the source:

- the `kbqSkeleton` export name, the `kbq-skeleton` class on a host that is off, and `null` or `undefined` turning a skeleton off;
- the transparent text, ignored pointer and selection, and one bar per line of an inline host (the e2e screenshots show the fill but assert nothing);
- the minimum height of the `kbq-skeleton` element and its collapse once off;
- motion turned off by `provideNoopAnimations()` and by a reduced-motion preference;
- the 100 px margin before the wave pauses outside the viewport;
- the styles loading without a skeleton stylesheet, and the absence of any ARIA;
- element presets having no `kbqSkeleton` input, and layout preset hosts not being inert;
- `preset` of `kbq-skeleton-group` being required;
- the parsing of `count`, `columns`, `contentLines` and `children` (only `lines` and `rows` are tested), and the default `treeChildren`;
- what `KbqSkeletonModule` exports.
