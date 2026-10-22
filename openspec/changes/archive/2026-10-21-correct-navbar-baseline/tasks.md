# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Horizontal navbar collapses items to fit" and "Collapsed vertical navbar shows icons only" and verify that only `.kbq-navbar-item__container` is hidden: `_navbar-item_horizontal.scss` and `_navbar-item_vertical.scss` (collapsed rules and the badge offsets), `navbar-item.component.html` (default slot outside the container), the collapsed title rule in `navbar-brand.scss`, and the badge in the collapsed navbar of `E2eVerticalNavbarStates`
- [ ] 1.2 Re-read `observeLongTitle()` and `measureNeedsLongTitle()` in `navbar-brand.component.ts` and verify that a collapsed title is not measured and keeps the last presentation, as "When the brand title is measured" now states
- [ ] 1.3 Re-read `updateTooltip()` and `resolvedAriaLabel` in `navbar-item.component.ts` and `navbar-brand.component.ts` and verify that `collapsedText` replaces `tooltipText` and names a collapsed element without a title, as "Automatic tooltip of items and brands" and "Accessible name of items" now state
- [ ] 1.4 Re-read the `KbqNavbarFocusableItem` selector and `ngAfterContentInit()` in `navbar-item.component.ts` and the toggle visibility rule in `vertical-navbar.scss`, and verify that a `<button kbq-navbar-toggle>` and a `kbq-form-field` control keep their own tab stops, as "One tab stop per navbar" and "Leaving the navbar with Tab" now state
- [ ] 1.5 Re-read `focus()` in `navbar.component.ts` and the brand's `decorative` flag in `navbar-brand.component.ts` and verify that a link brand placed first receives the focus, as "Entering the navbar" now states
- [ ] 1.6 Re-read `onKeyDown()` in `navbar-item.component.ts` and `init()` and `autoFocus` in `dropdown-trigger.directive.ts` and verify that Down or Right on a dropdown trigger item moves focus into the panel, as both arrow key requirements now state
- [ ] 1.7 Re-read `onFocusHandler()`, `focus()` and `blur()` in `navbar-item.component.ts` and `blur()` and `onKeyDown()` in `navbar.component.ts` and verify that a click on a nested control leaves the active element unchanged and that the field edges move relative to it, as "Clicked item becomes the active item" and "Text fields in a horizontal navbar" now state
- [ ] 1.8 Re-read the z-index rules of `navbar.scss`, `vertical-navbar.scss`, `navbar-toggle.scss` and `navbar-tokens.scss` and verify that the container opened over the content forms the stacking context the toggle sits in, as "Stacking of the navbar" now states
- [ ] 1.9 Run `openspec validate correct-navbar-baseline --strict` and verify that it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
