# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/top-bar/`: the component and both directives (`top-bar.ts`), `module.ts`, the stylesheet and its custom properties (`top-bar.scss`, `top-bar-tokens.scss`), the unit spec, the e2e scenarios and the Playwright spec, and the `top-bar.{en,ru}.mdx` pages;
- the seven docs examples under `packages/docs-examples/components/top-bar/`;
- the API golden file `tools/public_api_guard/components/top-bar.api.md`;
- from `packages/components/core`: `kbqAnimationsDisabled()`, the `kbq-animations-off()` mixin, `kbqOverlayLayer` and `kbqOverlayLayerExclude`, and the "Panels under a sticky header" section of the core overview;
- the host classes of `kbqOverflowItems`, which the bar's stylesheet targets.

Every claim was checked against the source. The component has 15 unit tests and two Playwright screenshots, each taken in a light and a dark theme. jsdom applies no layout, so everything the bar does through CSS rests on those two screenshots or on the source.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand.
- One place to diff against when top bar behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the overlay layer registry, and how `kbqOverflowItems` decides which items to hide.
- Appearance-only tokens: background, padding, corner radius, typography and the shadow's color.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`):

- one capability at a flat path matching the entry point;
- English;
- quirks documented as they ship;
- only behaviour confirmed by a test or read in the source;
- the same rule for what counts as contract.

These decisions are specific to the top bar:

1. **Layout custom properties count as contract.** Most of what the bar does is CSS. These custom properties change behaviour a consumer relies on, so their defaults and effects are in the spec:
    - `--kbq-top-bar-position`, `--kbq-top-bar-inset-block-start` and `--kbq-top-bar-z-index`;
    - `--kbq-top-bar-spacer-min-width` and `--kbq-top-bar-container-start-min-width`;
    - the two container gaps;
    - `--kbq-top-bar-shadow-transition`.

    Leaving all tokens out, as the select baseline does for its look, was rejected: the spec would be left with four classes and an `aria-label`. Changing one of these defaults is a behaviour change and goes through a `MODIFIED` delta.

2. **Layering is stated from the bar's side only.** The spec states the bar's own `z-index` and that it applies `kbqOverlayLayerExclude`. It does not state how `kbqOverlayLayer` moves panels: that belongs to a spec of `core`, so the overlay layer can change without editing this capability.
3. **What the bar does not do is part of the contract.** The docs make the consumer responsible for the landmark role, the accessible name of the icon buttons and roving focus. So the spec states that the bar sets no role, adds no tab stop and handles no keys. It also states that the bar never sets its shadow on its own. A later change that adds any of these then shows up as a `MODIFIED` delta instead of passing unnoticed.
4. **The overflow spacing is stated only for the forms a test renders.** The e2e screenshot renders an overflow host as a direct child of a container and one nested a level deeper. Neither the e2e scenarios nor the examples render the third form, with `kbqOverflowItems` on the container itself. Reading the CSS suggests that form spaces its items twice (Findings, suspected defect 1), so the spec leaves it out.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/top-bar` updates `openspec/specs/top-bar/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Most layout requirements rest on two screenshots or on the source] → tasks.md runs the Playwright spec in Docker and checks the rest by hand before archiving. A mismatch is corrected in the delta, not in the code.
- [Pixel and timing values (80 px, 990, 300 ms) are defaults of custom properties a theme can override] → The spec names the custom property next to every value, so a consumer reads them as defaults.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Both overview pages open by calling the bar a toolbar that "always remains visible on the page". By default it scrolls away with the content: it only stays visible outside the scrolling area or with `--kbq-top-bar-inset-block-start` set. The scroll section further down says so.
2. "Responsive mode" presents the 80 px between the two sides as a property of the bar. It exists only when a `[kbqTopBarSpacer]` is placed between the containers. The JSDoc of `KbqTopBar` calls the spacer optional, and without it the containers touch.
3. The CSS variables section says the custom properties are set on `kbq-top-bar` itself. Every example that sets `--kbq-top-bar-container-start-min-width` sets it on the start container instead. Both work, because the start container is the element that reads it, but the guidance and the examples differ.
4. The table describes `--kbq-top-bar-shadow-transition` as the "transition of that shadow". It applies only to the shadow appearing: the transition is declared on the shadow modifier, so removing `withShadow` drops the shadow at once.
5. The JSDoc of `withShadow` says the shadow signals "that page content is scrolled under the bar". It can read as if the bar detects that itself. The consumer has to set it, as the overflow example does on scroll.
6. In `top-bar.ru.mdx` the link to the breadcrumb compression explanation sits under the page title variant, after the title-counter example. The English page has it under the breadcrumbs variant.

**Suspected defects (from reading the code, not reproduced)**

1. For a container that is itself the `kbqOverflowItems` host, the stylesheet sets `gap: unset`. The placement rules come later with the same specificity and set the gap again. That form then seems to space its items twice, with the flex gap and the margins the bar adds. No example or e2e scenario renders that form.
2. `aria-label` is rendered on a bar without a role. ARIA 1.2 does not allow naming a generic element, and screen readers ignore that name. The JSDoc asks for a landmark role alongside the name, but nothing warns, and axe is not run on a named bar without a role.
3. A `placement` outside `'start' | 'end'` is caught only by strict template type checking. In a template compiled without `strictTemplates`, `placement="center"` compiles and leaves the container with no layout at all.
4. `kbq-animations-disabled` reads the reduced-motion setting once, when the bar is created. The stylesheet's media query still turns the transition off when the setting changes later, so only a consumer styling against the class sees a stale value.

**Tests whose name and body disagree, or that cannot fail**

- "shadow modifier › should be absent by default" binds `withShadow` to `false` explicitly. The input's own default is not exercised by any test that asserts the class.
- "aria-label › should not be rendered when it is not set" binds `[aria-label]` to `null`. The unbound input is never checked.
- "motion › should fade the shadow in by default" asserts only that `kbq-animations-disabled` is absent. jsdom renders no transition, and without `matchMedia` in jsdom the reduced-motion branch never runs.
- "should never apply both placement modifiers to the same container" asserts exactly one modifier per container, which is more than its name says. It is correct, only named for half of what it checks.

**Behaviour without a test.** The spec states these from the source:

- the slots rendered as direct children of the bar, in the order written;
- `placement` being a required input, which the golden file shows as `"required": true`;
- `KbqTopBarModule` exporting all three classes: the unit tests import the standalone classes, and only the docs examples use the module;
- a spacer width other than the default, and the start container shrinking to no width by default;
- the default bar scrolling away with the content;
- the bar not setting its shadow on its own;
- the shadow fading in over 300 ms and disappearing at once;
- the `provideNoopAnimations()` and reduced-motion paths of `kbq-animations-disabled`;
- a panel opened from page content painting over the bar;
- a custom property set on an ancestor not reaching the bar, and one set on the start container applying there;
- the host having no `role`, and a written `role` rendered as is;
- the bar adding no tab stop or keyboard handling.
