# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/loader-overlay/` (component, template, styles, the unit spec with its snapshot, `e2e.ts` and the Playwright spec), the parts of `kbq-progress-spinner` the overlay configures, the `loader-overlay.{en,ru}.mdx` pages, the seven examples under `packages/docs-examples/components/loader-overlay/`, the dev app in `packages/components-dev/loader-overlay/` and the API golden file `tools/public_api_guard/components/loader-overlay.api.md`. Every claim was checked against the source. The examples tab (`examples.loader-overlay.{en,ru}.mdx`) is a placeholder and `structure.ts` does not route it (`hasExamples: false`), so the overview page is the only docs page.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when loader-overlay behaviour changes, in particular when the deprecated inputs are removed in 22.0.0.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the computed signals behind the host bindings, the change-detection strategy, and the CSS structure beyond the host classes a consumer can style or test against.
- The deprecated `transparent` and `card` inputs as an API: how they map to a surface when `surface` is not set (`transparent` `true` to `bg`, `false` to `solid`, `card` to `card` and ahead of `transparent`). The unit tests pin that mapping down until the inputs are removed.
- The `kbqDelayLoadingIndicator` operator that the docs page recommends. It lives in `core`, the overlay does not use it, and it has its own spec in `core/utils/delay-loading-indicator.spec.ts`.
- `kbq-progress-spinner` itself beyond the mode and size the overlay gives it.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`) apply here too: one capability at a flat path named after the entry point, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and the same list of what counts as contract. Component-specific decisions:

1. **Deprecated inputs appear only where `surface` overrides them.** The task scope leaves deprecated APIs out, but the default surface comes from the default of `transparent`, and a consumer migrating to `surface` needs to know that `surface` wins whatever the deprecated inputs say. So the spec states the default surface and that precedence, and leaves the fallback mapping to the tests (see Non-Goals). The alternative, a requirement per deprecated input, would be deleted again by the 22.0.0 change.
2. **Layout that defines the component counts as behaviour; the rest is styling.** That the overlay covers its parent, sits above the in-flow content, centers its column, inherits the parent's corners and blocks pointer input is what the component is for, so it is in the spec. Paddings, gaps, type scale per size, colors and opacity are design tokens and stay out; the spec says only that `solid` is opaque and the other surfaces are translucent tints of their surface, because that is what `surface` is documented to choose.
3. **Missing behaviour is stated when consumers would otherwise assume it.** The docs page promises a default text, focus blocking and alignment modes that the overlay does not have. The spec says what ships — no built-in text, keyboard focus not blocked, no accessibility semantics, no hide input — so that a change adding any of them is a visible `MODIFIED` delta. The docs claims are listed under Findings.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/loader-overlay` updates `openspec/specs/loader-overlay/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Many requirements rest on the source rather than on a test: 8 of 23 have no unit or e2e assertion at all, and 7 more are only partly covered] → tasks.md checks each of them by hand in `yarn run dev:loader-overlay` before archiving. A mismatch is corrected in the spec, not in the code.
- [A defect gets recorded as intended behaviour] → "Keyboard focus is not blocked" and "No accessibility semantics of its own" describe gaps that look like defects. They are in the spec because consumers have to work around them today; the suspected consequences are listed under Findings, and a fix changes the requirement through `MODIFIED`.
- [The layout requirements depend on global CSS] → The overlay uses `ViewEncapsulation.None`; a consumer rule on the parent's `position` can defeat the covering. The spec states the default; Findings records the conflict.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Both overview pages say the default text is "Loading" («Загрузка»). The overlay has no default text: `text` defaults to `undefined`, and without it only the spinner shows. The `loader-overlay-default` example passes "Загрузка" itself.
2. "Elements behind the overlay must not be accessible for focus, selection, or clicking" and "The system prevents focusing on form elements covered by the overlay". The overlay only intercepts pointer input over its area. It does not trap focus or make the covered content inert, so Tab still reaches covered controls.
3. "Vertical alignment" describes centering with optical compensation (40% of the content height) and a fixed top offset of 72 px. The overlay only centers its column. The `fixed-top` attribute in the `loader-overlay-fixed-top` example and in the dev app matches no input, directive or style and changes nothing; the example renders the same as a centered overlay.
4. "Padding from the overlay edges is 10% of its width" and "Maximum width of the text and caption under the spinner is 480px". The overlay has one horizontal padding token (`--kbq-size-3xl` for every size), its column is 80% wide, and the text and caption are capped at 90% of the column. Nothing limits them to 480 px.
5. The JSDoc of `size` says it sets the size "of its default indicator". For `normal` the indicator is the big spinner, since the spinner has no normal size.
6. The JSDoc of `surface` and the class `kbq-loader-overlay_transparent` call the non-solid surfaces transparent. They are translucent tints of the surface at `--kbq-opacity-overlay`.

**Suspected defects (from reading the code, not reproduced)**

1. The overlay gives assistive technology no signal: no `aria-busy` on the parent, no live region, no role or name on the spinner. With the covered content still focusable and in the accessibility tree, a screen reader user can operate a block that sighted users see as blocked. No axe test renders the overlay.
2. Two overlays in one parent: destroying either removes `kbq-loader-overlay_parent` while the other is still shown, and the remaining overlay loses its containing block. The same happens when the consumer put that class on the parent themselves.
3. A marker attribute whose directive is not imported, for example by a standalone consumer that imports only `KbqLoaderOverlay`, is not recognized: the default part is shown and the marked element is silently dropped. A marker nested inside a wrapper element is recognized by the content query, which hides the default part, but projection matches only top-level nodes, so nothing is shown.
4. `.kbq-loader-overlay_parent { position: relative }` has the specificity of one class. Depending on stylesheet order, it can override a parent that is `absolute`, `fixed` or `sticky`, and move that parent.
5. `KbqLoaderOverlayModule` imports `A11yModule` and `PlatformModule`, which the overlay does not use. They appear in the public typings of the module.

**Tests whose name and body disagree, or that cannot fail**

- "should render params" and "should render only spinner with modifier" assert `expect(indicatorElement).toBeDefined()`. `DebugElement.query` returns `null`, never `undefined`, when nothing matches, so these assertions cannot fail.
- "should render external params" does not check that the default spinner is gone once an indicator is projected, nor that a bound `text` or `caption` would be ignored.
- "should preserve the transparent input behavior without a background" asserts the opaque `filled` surface, which is the one variant with a full background. "Without a surface" seems to be meant.
- The e2e test "card" covers only the deprecated `card` input inside a modal. `surface="card"` is covered by the "surfaces" screenshot, so the "card" test loses its purpose when the input is removed.

**Behaviour without a test.** The spec states these from the source:

- the indeterminate mode of the default spinner;
- an empty `text` or `caption` rendering nothing, and a caption without text;
- the fixed order of indicator, text and caption;
- a projected caption alone clearing `kbq-loader-overlay_empty`;
- `kbq-loader-overlay_parent` being added to and removed from the parent (the screenshots depend on it only indirectly);
- covering the parent and inheriting its corners (backed only by the screenshots);
- disappearing at once when removed, with no animation;
- pointer input landing on the overlay;
- keyboard focus not being blocked;
- the default spinner not being rendered next to a projected indicator;
- a projected text or caption winning over a bound input;
- the marker classes on projected elements;
- unmarked content not being rendered;
- the absence of `role`, `aria-busy` and `aria-live`.
