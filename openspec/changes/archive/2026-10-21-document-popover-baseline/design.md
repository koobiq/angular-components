# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/popover/` (the trigger and panel components, the confirmation variant, both templates, the styles where they define behaviour, the unit spec, `e2e.ts` and the Playwright spec), the shared pop-up base classes, overlay helpers, reposition scroll strategy, overlay layers and the `a11y` and `popoverConfirm` locale sections in `packages/components/core`, the `popover.{en,ru}.mdx` and `examples.popover.{en,ru}.mdx` pages, the examples under `packages/docs-examples/components/popover/`, and the API golden file `tools/public_api_guard/components/popover.api.md`. Every claim was checked against the source; docs and test names were not taken on trust. The general approach follows the `select` baseline, which is already in `openspec/specs/`.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the directives, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when popover behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: class and method names below the public API, timers, change-detection details, CSS structure, the entrance animation and design tokens beyond the defaults a consumer sees.
- `kbqTooltip` and the other pop-ups built on the same base classes, except for how a tooltip yields to a popover on the same element.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the `select` baseline apply unchanged: one capability at a flat path matching the entry point, English, quirks described as they ship, only confirmed behaviour in the spec, and the same definition of what counts as contract. The popover adds these:

1. **`kbqPopoverConfirm` belongs to the `popover` capability.** It subclasses the popover trigger and panel, accepts all their inputs and shares every opening and closing path, so a separate `popover-confirm` capability would have to restate most of this spec. Its own behaviour — the texts, their fallbacks and the `confirm` output — gets requirements of its own.
2. **Behaviour of the shared pop-up base is specified as popover behaviour.** Opening, delays, hover handling and Escape on the host live in `core`, but a consumer meets them only through `kbqPopover` or `kbqTooltip`. Each component's spec states them for itself; a change to the base updates both specs.
3. **Defaults that come from design tokens are stated "by default".** The preset widths (200, 400 and 640 px) and the 480 px maximum height are token values, so they can change without a code change, but they are what a consumer sees and what the docs page describes.
4. **Timing after the pointer leaves the panel of a hover popover is left out.** The unit test and the code disagree on it (suspected defect 1), so the spec only says that the popover closes once the pointer has left both the host and the panel.
5. **Requirements that jsdom cannot show rest on Playwright or on a hand check.** jsdom lays nothing out: focus never lands in the panel, nothing overflows, nothing scrolls out of view. The unit tests assert the decision (a call to the focus trap, a flag) and the spec states the outcome; tasks.md checks the outcome by hand.
6. **`KbqPopoverComponent` rendered on its own gets one requirement.** It is exported, and the e2e states page renders it without a trigger; only what a test covers (Escape does not throw) is stated.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/popover`, or to the pop-up base in `core`, updates `openspec/specs/popover/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:popover` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Quirks the spec does state, such as a bound `undefined` turning a boolean input off or outside clicks ignored by non-click popovers, can change later through `MODIFIED`.
- [Base-class behaviour is stated twice, here and in a future tooltip spec] → Accepted: the two components expose it through different inputs and defaults, and a consumer reads one spec at a time.
- [The spec is long: 59 requirements, 105 scenarios] → It is grouped in the order of the docs page: content, size, paddings, arrow and offset, placement, scrolling, layering, close button, confirmation, origin, opening and closing, accessibility, classes, localization, input defaults.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. "Hiding the arrow" says that hiding the arrow lets the popover sit closer to the trigger. `kbqPopoverArrow` does not change the distance; only `kbqPopoverOffset` does, 8 px either way, and the example in that section binds no offset.
2. The accessibility section says that a popover opened by hover or focus does not take focus. A popover whose `kbqTrigger` also includes `click` takes focus however it was opened.
3. The accessibility section says that every closing path returns focus to the trigger. Focus is returned only when it is inside the panel at the moment the popover closes.
4. "Opening and closing" says that the popover closes on a click outside it, and the JSDoc of `hasBackdrop` says that it closes on a backdrop click. Both hold only when `kbqTrigger` includes `click`; a `hover`, `focus` or `manual` popover ignores both.
5. "Behavior when scrolling the page" says that a popover with `kbqPopoverCloseOnScroll` set to `false` never closes on a scroll. `kbqPopoverHideIfNotInViewPort`, `true` by default and never mentioned on the page, still closes a popover whose trigger scrolls out of its `cdkScrollable` container. The layering example turns it off without saying why.
6. The JSDoc of `closeOnScroll` presents `null` as the default third state. The input's `booleanAttribute` transform turns a bound `null` or `undefined` into `false`, which also switches off the `kbq-hide-nested-popup` rule; only an unbound input keeps `null`. The docs page, which says "left unbound", is accurate.
7. The JSDoc of `kbqPopoverOrigin` says to bind it before `kbqPopoverVisible`. `ngOnChanges` applies the origin before the visibility whatever the attribute order, so the advice matters only for code that writes the setters.
8. The page lists `manual` among the `kbqTrigger` values. `PopUpTriggers` has no such member (it has `program`); `manual` works only because the value is matched by substring and contains none of the listened-for names.
9. `show()` and `hide()` are `@docs-private`, so the API tab hides them, while the examples close their popovers with `popover.hide(0)`.
10. The page names neither the content inputs nor `kbqPopoverSize`, `kbqPopoverPlacement`, `kbqPopoverPlacementPriority`, `kbqPopoverHasCloseButton`, `kbqPopoverHasBackdrop`, `kbqPopoverBackdropClass`, `kbqPopoverPreventClose`, `kbqPopoverDisabled`, `kbqPopoverVisible`, `kbqPopoverContainer`, `kbqPopoverHideIfNotInViewPort` or the two outputs; they appear only in examples or on the API tab.
11. The confirmation section says that the panel has no header and no footer. It does not say that `kbqPopoverContent` and `kbqPopoverHasCloseButton`, which the directive accepts, are ignored too.

**Suspected defects (from reading the code, not reproduced)**

1. When a hover-opened panel has been entered, the pop-up base binds a `mouseleave` listener on `.kbq-popover` that hides it at once. Leaving the panel therefore seems to bypass `kbqLeaveDelay` and `kbqPopoverPreventClose`. The unit test dispatches `mouseleave` on the component host, not on `.kbq-popover`, so it never runs that listener.
2. The confirm button closes the popover with `hide()`, which does nothing while the pointer rests on the panel of a hover popover — the case the close button avoids by calling `close()`. A hover-opened confirmation popover seems to emit `confirm` and stay open.
3. A custom `kbqPopoverOffset` is written as an inline margin only when the panel becomes visible. After a later flip of the placement, on scroll or resize, the margin stays on the old side and the new side gets the 8 px of the stylesheet.
4. A `hover`, `focus` or `manual` popover with `kbqPopoverHasBackdrop` renders a backdrop over the page that no click closes; only Escape in the panel or code does.
5. Whether the `kbq-hide-nested-popup` rule applies is decided once, after the first render. Writing `closeOnScroll` in code later neither adds the rule nor removes it.
6. A `kbqPopoverPlacementPriority` made only of unknown names leaves the position strategy without positions, which the CDK rejects when it positions the panel.

**Tests whose name and body disagree, or that cannot fail**

- "should hold the panel open for the default leave delay": its comment says the scheduled hide hands the delay on to the panel for a second period, while the code hides with `hide(0)` after one. The test checks for the close only after 1,000 ms, so it cannot tell a 500 ms close from a doubled one.
- "kbqTrigger = hover" asserts a leave delay after the pointer leaves the panel, and its comment credits "the panel's own zero-delay hide" — the listener of suspected defect 1, which the test never triggers.
- "kbqTrigger = focus" checks the content right after the `focus` event, before the panel's show timer has run. The content is in the DOM as soon as the overlay attaches, so the test passes even if the panel never becomes visible.
- "should arm the focus trap and claim focus for a click open" says that the Playwright suite covers focus landing in the panel. No Playwright test asserts it: the one e2e panel closed with Escape has nothing tabbable, so focus stays on the trigger there.
- "Can set kbqPopoverHeader", "Can set kbqPopoverContent" and "Can set kbqPopoverFooter" destroy the fixture because "a hover popover keeps a watchdog interval running". There is no interval any more; the hover hide is driven by events.

**Behaviour without a test.** The spec states these from the source:

- closing from a template reference with `popover.hide(0)`;
- re-applying the position when an input changes while the panel is open;
- the preset widths, the `custom` size and the 480 px maximum height (the widths only in a screenshot);
- the distance kept when the arrow is hidden, and a custom `kbqPopoverOffset` value;
- the fallback list, the push into the viewport and unknown names in `kbqPopoverPlacementPriority`;
- following the page scroll by default, and `KBQ_POPOVER_SCROLL_STRATEGY`;
- the `kbq-hide-nested-popup` rule;
- `kbqPopoverHideIfNotInViewPort` (only its default is tested);
- pinning to a window or container edge (only the dropped arrow is tested);
- `kbqPopoverConfirm` ignoring the header, footer, content and close button, and the `role` and `aria-label` of its panel (covered only by axe);
- the first half of "Repositioning on request";
- `kbqTrigger` configuring a `kbqTooltip` on the same element;
- the pointer returning to the host within the leave delay;
- the default delays of `show()` and `hide()`;
- an outside click on the host itself, clicks in overlays opened after the popover, and non-click popovers ignoring outside clicks;
- an Escape already spent, on the host or in the panel;
- `kbqPopoverPreventClose` against the close and confirm buttons, `close()`, `hide()`, `kbqPopoverVisible`, a touch, a scroll and disabling;
- a disabled popover not opening;
- Tab cycling inside the panel;
- focus landing in the panel (only the call to the focus trap is tested);
- the scrollable content region;
- `kbq-popover_open`, the whitespace-separated `kbqPopoverClass` and the pane class `kbq-popover__panel`;
- the locale name of the close button (axe only checks that it has one);
- boolean inputs bound to `null` or `undefined`.
