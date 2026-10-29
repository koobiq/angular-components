# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/app-switcher/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Placement": in `packages/components/core/pop-up/pop-up-trigger.ts`, verify that `createOverlay()` locks the position (line 560) and that `onPositionChange` (lines 617-650) emits `placementChange` only when the position strategy reports a change; then verify in the overlay bundle of `@angular/cdk` (`_overlay-module-chunk.mjs`) that a locked strategy re-applies its last position (line 1150) and that `_applyPosition` emits `positionChanges` only for a new position or a changed scroll visibility (lines 1459-1461), while the reposition scroll strategy re-applies on every `ScrollDispatcher` scroll (line 203)
- [ ] 1.2 "Outer scroll closes the switcher": verify that `closingActions()` and `isInnerScroll()` in `packages/components/app-switcher/app-switcher.ts` (lines 953-971) close only on `ScrollDispatcher.scrolled()`, that the dispatcher listens to `scroll` on the document without capture (the `scrolling.mjs` bundle of `@angular/cdk`, line 225), and that `KbqScrollbarViewport` registers through its `CdkScrollable` host directive (`packages/components/scrollbar/scrollbar.ts` line 299)
- [ ] 1.3 "Inline icon sanitization": in `packages/components/app-switcher/app-switcher-icon-sanitizer.ts`, verify that `sanitizeChildren()` matches elements by `localName` only (line 210), that `title` is on the allow-list (line 45), and that the URL check covers `href` and `xlink:href` alone (line 156)
- [ ] 1.4 "Grouping by type": in `defaultGroupBy()` in `packages/components/app-switcher/app-switcher.ts`, verify that a falsy `type` goes to the untyped list (line 126) and that groups are keyed and named by `type.toString()` (line 129)
- [ ] 1.5 "Row order": in `makeGroupsForApps()` in `packages/components/app-switcher/app-switcher.ts`, verify that groups are collected in a plain object (line 159) and read back with `Object.values()` (line 165), whose integer-like keys come first in ascending order, and that the small groups are appended after the untyped applications
- [ ] 1.6 "Flyout follows the row that opened it": in `packages/components/dropdown/dropdown.component.ts`, verify that `activateSafeArea()` (lines 474-531) switches on the first pointer movement outside the triangle of `getSafeTriangleVertices()` (`packages/components/core/overlay/safe-area.ts` lines 57-64) and waits for `NESTED_HOVER_SWITCH_DELAY` only for a nested item hovered inside it; and that `handleMouseLeave()` and `handleHover()` in `dropdown-trigger.directive.ts` (lines 522-536, 878-908) start that safe area and open the new row on the switch
- [ ] 1.7 Run `openspec validate correct-app-switcher-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
