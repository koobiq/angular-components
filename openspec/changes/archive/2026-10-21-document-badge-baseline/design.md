# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/badge/` (component, module, styles, theme and tokens, the unit spec, `e2e.ts` and the Playwright spec), the `getNodesWithoutComments` helper and `kbqInjectNativeElement` in `packages/components/core`, `KbqIcon` in `packages/components/icon` (the class the icon spacing query matches), the `badge.{en,ru}.mdx` and `examples.badge.{en,ru}.mdx` pages, the six docs examples under `packages/docs-examples/components/badge/`, the dev app in `packages/components-dev/badge/`, the badge entry of `apps/docs/src/app/structure.ts`, and the API golden file `tools/public_api_guard/components/badge.api.md`. Every claim was checked against the source. The tooltip trigger in `packages/components/tooltip` was read only to confirm that it does not make a plain badge focusable.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when badge behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the class name constants marked `@internal`, the effect and the query behind the icon spacing, and the module's unused imports.
- Visual styling and design tokens: colors, heights, paddings, radii and typography. The spec names only the host classes, the color and fill combinations the theme supports, and the one icon margin the e2e suite asserts.
- `kbq-tag`, `kbq-icon`, the tooltip of the docs example and deprecated APIs.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at a flat path named after the entry point, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and the same rule for what counts as contract. Badge-specific decisions:

1. **One capability covers all three declarations.** `KbqBadge`, `KbqBadgeCaption` and `KbqBadgeCssStyler` ship in one entry point and one module, and the icon spacing only makes sense on a badge, so they share the `badge` capability rather than getting one each.
2. **Host classes are the contract.** The badge has no outputs, no methods and no ARIA, so what a consumer styles and tests against is its classes: `kbq-badge`, `kbq-badge-filled` / `kbq-badge-outline`, `kbq-badge_compact`, `kbq-badge_<color>`, `kbq-badge-icon_left` / `kbq-badge-icon_right` on the host, `kbq-icon_left` / `kbq-icon_right` on icons and `kbq-badge-caption`. Each gets a requirement. The mixed separators (`kbq-badge-filled` against `kbq-badge_compact`) are documented as they ship.
3. **The supported color and fill combinations are stated, the rest of the theme is not.** The e2e screenshot renders exactly eleven filled colors and six outlined ones, and the theme defines rules for exactly those. Stating the combinations tells a consumer which ones are styled without pinning tokens; the unstyled outlined solid colors are a quirk, recorded in the spec and listed under Findings.
4. **The standalone gap of the icon spacing is stated as behaviour.** That `KbqBadge` alone applies no icon class is read directly from the source (the styler is a separate directive, not a host directive), so the spec states it, the same way button needs `KbqButtonCssStyler`. Whether it should change is a Finding.
5. **The non-behaviour is stated too.** "Not interactive" and "no accessibility semantics" are requirements, so a later change that adds focus, a role or a disabled state shows up as a `MODIFIED` delta instead of passing silently.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/badge` updates `openspec/specs/badge/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:badge` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → The outlined solid colors and the standalone icon spacing gap are stated as shipped and also listed under Findings, so a fix lands as a `MODIFIED` delta. Suspected defects that were not confirmed stay out of the spec.
- [The theme requirement leans on styling] → It names only which combinations are styled, backed by the e2e screenshot, not the colors themselves.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. "Tooltip with explanation" in `badge.en.mdx` and `badge.ru.mdx` says the tooltip opens on hover or focus. The badge sets no `tabindex`, the tooltip trigger adds one only for a disabled wrapped control, and the `badge-tooltip` example adds none, so a keyboard user cannot reach the tooltip.
2. `KbqBadgeCssStyler` is `@docs-private`, yet a standalone consumer has to import it next to `KbqBadge` to get the icon spacing. No docs page says so; `dl/e2e.ts` and the `file-upload-primitive` example import `KbqBadge` alone (neither has an icon inside the badge).
3. The "Content" example writes the caption as `<div class="kbq-badge-caption">` and never shows the `kbq-badge-caption` directive, which the docs do not mention at all.
4. Nothing on the docs page or in the JSDoc says that `outline` is styled only for the fade colors and `disabled`. The members of `KbqBadgeColors` have no JSDoc; the golden file marks each one `(undocumented)`.
5. `examples.badge.en.mdx` and `examples.badge.ru.mdx` are "documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so they are not routed, but they are kept in the tree.

**Suspected defects (from reading the code, not reproduced)**

1. An outlined badge in a solid color gets no theme rule. It inherits its text color, has a transparent background, and keeps the base `border-style: solid` with no border color, so the border is drawn in the inherited text color. Nothing warns about the combination.
2. Icon position counts whitespace-only text nodes; only comments are skipped. Button, button toggle and the deprecated link use `getContentNodes`, which skips both. With `preserveWhitespaces: true`, a leading icon after a line break sits at index 1 and gets no class.
3. The icon classes are recomputed only when the set of projected icons changes. Text or a caption added or removed later, for example by its own `@if`, leaves the icon classes as they were.
4. When a recomputation finds one child node or fewer, it removes the host classes but not `kbq-icon_left` / `kbq-icon_right` from the remaining icon. Removing one of two adjacent icons leaves a stale class on the other.
5. A `badgeColor` string with whitespace in it is split by the class binding into several classes, so `success foo` adds `kbq-badge_success` and `foo`.
6. `KbqBadgeModule` imports `A11yModule` and `PlatformModule`, which the badge does not use and the module does not export.

**Tests whose name and body disagree, or that cannot fail**

- "should fall back to fade-contrast color" under "basic styles" renders a badge with no `badgeColor` binding, so it checks the default, not a fallback. The fallback is covered by "should fall back to fade-contrast for an empty value".
- "should not render an icon before it is projected" mostly asserts that the fixture's own `@if` hides the icon; only its second assertion concerns the badge.
- "should add left icon class to a leading icon" sits under a `beforeEach` that builds the async-icon fixture, then discards it with `TestBed.resetTestingModule()` and builds its own.
- "boolean attribute coercion" checks the string `'false'` only for `compact`, not for `outline`.
- The e2e test "adds icon spacing when the icon is projected asynchronously" reads the computed margin once with a plain `expect`, not a retrying assertion, right after the click.

**Behaviour without a test.** The spec states these from the source:

- the element-only selector and the module's exports;
- a non-enum color string rendered as a class, and the `null` and `undefined` fallback;
- toggling `outline` and `compact` at runtime, and `outline` bound to `'false'`;
- the `disabled` color setting no `disabled` or `aria-disabled` attribute;
- content projected without a wrapper;
- the `kbq-badge-caption` directive adding its class;
- `KbqBadge` imported alone applying no icon spacing;
- no class for an icon-only badge, an icon in the middle or a nested icon;
- the host class removed when the icon is removed again;
- no `tabindex`, `role` or ARIA attribute on the host.

The color and fill combinations rest on the e2e screenshot "styles" alone, and the outlined solid colors are read from the theme, as no test renders them.
