# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/tooltip/`: the directive and overlay component, the template, the styles where they define behaviour (`tooltip.scss`, `_tooltip-theme.scss`, `tooltip-tokens.scss`), the registry, the unit spec, `e2e.ts` and the Playwright spec;
- the shared pop-up base in `packages/components/core/pop-up/` (the trigger and pop-up classes, the constants and the margin helper), the position maps in `core/overlay/overlay-position-map.ts`, the caret helpers in `core/form-field/` and the animation state in `core/animation/`;
- the `tooltip.{en,ru}.mdx` and `examples.tooltip.{en,ru}.mdx` pages, the docs examples under `packages/docs-examples/components/tooltip/`, and the API golden file `tools/public_api_guard/components/tooltip.api.md`.

Every claim was checked against the source. `openspec/specs/` holds only the select baseline, whose conventions this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the directive, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when tooltip behaviour changes later, including changes made in the shared pop-up base in `core`.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the overlay component class and its `kbq-tooltip-component` selector, the registry and delay-tracker services, timers, change-detection details and CSS structure beyond the classes and custom properties a consumer uses.
- Components that build on the tooltip (`kbq-title`, `kbqEllipsisCenter`, the option and timezone-option hints, the navbar item, the validation tooltips of datepicker, timepicker and inline edit), `kbq-popover`, and the deprecated `KBQ_TOOLTIP_OPEN_TIME` and `KBQ_TOOLTIP_OPEN_TIME_PROVIDER`.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline**: one capability at a flat path matching the entry point (`tooltip`), English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and the same rules decide what counts as contract (public inputs, outputs and methods, selectors, classes a consumer styles or tests against, ARIA attributes, logged and thrown messages, exported tokens and constants).
2. **The shared pop-up base is described through the tooltip, not as a capability of its own.** `KbqPopUpTrigger` and `KbqPopUp` in `core` carry most of the timing, hover and Escape behaviour, but no consumer uses them directly, and the popover overrides much of it (focus trap, backdrop, closing rules). A separate `pop-up` capability was rejected: its contract would be whatever the two subclasses happen to share. A change in `core/pop-up` that alters what a tooltip does updates this spec.
3. **Members marked `@docs-private` stay out**, even though they are in the typings: the `kbqTooltipScrollStrategy` input, `hideAsInactive()`, `setOverlayPanelClass()`, `updateData()` and the `*Input` signals. They are reachable but documented as not to be relied on. The registry and the delay tracker are public services, but the spec states their effect only through the tokens that configure them (`KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT`, `KBQ_TOOLTIP_INSTANT_SHOW_WINDOW`).
4. **Delays are contract; task timing is contract only where a test pins it.** The 400 ms enter delay, the 2000 ms instant-show window and the leave delay are documented and tested. That a close happens "in a later task" even with a leave delay of 0 is stated because the unit suite asserts it and consumer tests depend on it.
5. **`kbqTrigger` is specified by its documented names.** The directive matches them as substrings (`trigger.includes('hover')`), so other strings that contain them also bind events; the spec does not promise that.
6. **The no-arrow class is described, not named.** The repository's spell checker rejects the suffix of that class, and its dictionaries are not part of this change, so the spec calls it "the no-arrow modifier class of `.kbq-tooltip`": the class the template binds to the arrow being off, which the Playwright spec selects.
7. **Subclass hooks stay out.** `derivedDisabledWins`, `setDerivedDisabled()` and the precedence they give to `kbq-title` belong to the components that use them; the spec states only the precedence a consumer sees with `forDisabledComponent`.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/tooltip` or `packages/components/core/pop-up` updates `openspec/specs/tooltip/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [The pop-up base is shared with the popover, so a popover change can alter the tooltip silently] → tasks.md maps each requirement to a test; a `core/pop-up` change that breaks one shows up in the tooltip suite, and the rest are listed below for hand checks.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:tooltip` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [The spec is long: 55 requirements, 104 scenarios] → It is grouped in the order of the docs page: opening and closing, width, color, arrow, positioning, offset, delay, moving onto the tooltip, one tooltip at a time, disabled state, content, programmatic API, accessibility.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `kbqTooltipModifier` says `warning` renders a warning tooltip, and the v20 migration rewrites `kbqWarningTooltip` to it. The modifier only adds `kbq-tooltip_warning` (or `kbq-tooltip_extended`), and no stylesheet in the library targets either class; the look comes from `kbqTooltipColor` alone. The timepicker and datepicker docs examples set `kbqTooltipModifier="warning"` without a color, so their hints render in the default contrast color.
2. The "Delay" section says the 0.4 s delay comes back once the previous tooltip "has disappeared and more than 2 seconds have passed". The window is measured from the moment the previous show started, not from when it disappeared, so a tooltip kept open for more than 2 s is followed by a full delay.
3. "Moving the Cursor onto the Tooltip" opens by saying that moving the cursor onto the tooltip does not close it. With the defaults (no `hideWithTimeout`, `kbqLeaveDelay` 0) the close scheduled on `mouseleave` still runs in the next task; only `hideWithTimeout` with a leave delay keeps the tooltip, as the second half of the paragraph says.
4. The "Interactive Tooltip" example sets `[hideWithTimeout]="true"` without `kbqLeaveDelay`, so the delay it describes is 0 ms. The JSDoc of `hideWithTimeout` ("will delay tooltip hiding") does not say that the delay is `kbqLeaveDelay`.
5. The JSDoc of `kbqTooltipHeader` says it is "only meaningful" with the `extended` modifier; the header is rendered with any modifier.
6. The JSDoc of `kbqRelativeToPointer` says it "does not work with kbqPlacementPriority". Both are applied together, and the unit fixture combines them.
7. The docs say `kbqPlacementPriority` configures "fallback positions". The list replaces the whole order, `kbqPlacement` included, so its first entry is tried first.
8. The caret section says the tooltip anchors to the field when the caret cannot be located. It anchors to the trigger element's box, which is a wrapper, not the field, when the directive sits on a container.
9. The "Delay" section shows the `tooltip-hide-with-timeout` example, which does not use `hideWithTimeout` at all.
10. These have no place on the tooltip pages: `kbqTooltipModifier`, `kbqTooltipHeader`, `kbqVisible` and `kbqVisibleChange`, `kbqPlacementChange`, `KBQ_TOOLTIP_INSTANT_SHOW_WINDOW`, `KBQ_TOOLTIP_SCROLL_STRATEGY`, `showForElement()`, and `forDisabledComponent` outside the examples.

**Suspected defects (from reading the code, not reproduced)**

1. Escape on the trigger element of a pinned (`manual`) tooltip, or bubbling from inside it, closes the tooltip through the trigger's own `keydown` handler and marks the key as handled, although the document-level handler deliberately skips pinned tooltips. The validation tooltip sits on the `kbq-form-field` around the input, so Escape typed in the input closes it and an enclosing modal does not close on that press.
2. A cancelled show counts for the instant-show window: the timestamp is taken when a show starts, so a pointer that crosses a trigger in less than the enter delay makes the next tooltip within 2 s appear at once although nothing was shown. Pinned tooltips shown from code count too.
3. With `kbqTooltipOffset` set, the margin is written on the side of the placement the tooltip has at that moment. When a fallback then flips the tooltip, the custom gap is lost: the stylesheet gap applies on the new side and the old margin stays.
4. Changing `kbqTooltipColor` while the tooltip is open does not recolor it until it is repositioned or reopened; clearing `kbqTooltipClass` while open does not remove the class either. `kbqTooltipModifier` refreshes at once.
5. Clearing the content of an open tooltip leaves an empty tooltip on screen until it is closed.
6. `showForElement()` writes `aria-describedby` on the directive's own host, not on the element the tooltip is anchored to, unlike `showForMouseEvent()`.
7. The pane classes (`ignoreTooltipPointerEvents`, and the click-through rule for pinned `kbqTrigger` values) and the scroll strategy are read when the overlay is first created. The overlay is reused, so changing them after the first show has no effect.
8. A `kbqPlacementPriority` made only of unknown names leaves the position strategy without positions; in dev mode CDK then throws "At least one position is required" on open.
9. `show()` or `kbqVisible` called right after a pointer-originated focus is swallowed by the keyboard-focus gate, because the gate reads the name of the last trigger event, which is still `focus`.
10. `kbqTooltipColor` accepts every `KbqComponentColors` value, but only `contrast`, `contrast-fade`, `theme`, `warning` and `error` are styled; `success`, `theme-fade` and `empty` render an unstyled tooltip.

**Tests whose name and body disagree, or that cannot fail**

- "should anchor the tooltip to the caret of the host field" and "should anchor the tooltip to the field the host wraps" only check that the origin has numeric coordinates. The caret origin always has them, also when it falls back to the trigger's box, so neither test can tell where the tooltip is anchored; "should anchor to the caret line of a textarea by default" asserts a height other than 80, which the fallback to the wrapper's empty box also satisfies. The Playwright spec covers real caret positions, but only for fields that carry the directive themselves.
- "should not leave an inline outline behind after a disable/enable cycle": nothing writes an inline outline, so the `style.outlineColor` assertion cannot fail; the class and role assertions carry the test.
- "should anchor the tooltip to the cursor instead of the host element" checks only that some origin with a numeric `y` was set, not that its `x` comes from the pointer.
- "should keep [kbqPlacementPriority] intact across a cursor-relative show" reads the private field and does not check that the priority is used for positioning.
- "should show/hide normal tooltip" and "should show/hide tooltip by focus" wait `defaultLeaveDelay` (100 ms) although the default leave delay is 0, and the comment on `tooltipDefaultEnterDelayWithDefer` credits the 400 ms default to `KbqPopUpTrigger`, whose own default is 0.

**Behaviour without a test.** The spec states these from the source:

- closing a click-triggered tooltip on an outside click, Space for the `keydown` trigger, and the end of a touch on the trigger;
- hover and focus being ignored for a `manual` tooltip;
- scrolling itself and `KBQ_TOOLTIP_SCROLL_STRATEGY` (the unit test detaches the overlay directly);
- the 300 px width limit and kept line breaks (the Playwright screenshot shows wrapping only);
- the unknown-placement warning, the default fallback order, `kbqPlacementPriority` replacing the order, and `kbqPlacementChange`;
- the pointer's horizontal position for `kbqRelativeToPointer`, and the trigger anchor for other placements and triggers;
- the close running despite the pointer on the tooltip without `hideWithTimeout`, the pointer leaving the tooltip, and the returning pointer without `hideWithTimeout`;
- the instant-show window for `show(delay)` and `kbqVisible`;
- `kbqTooltipDisabled` set to `true` while open (only the `forDisabledComponent` path is tested);
- content changes while open, a header with a modifier other than `extended`, and `kbqTooltipClass` reaching the element;
- the `kbq-tooltip_open` class and `kbqVisible` set to `false`;
- negative offsets and reduced motion.
