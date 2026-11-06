# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/button-toggle/` (the component and module, the styles where they decide layout and hit testing, the unit spec, `e2e.ts` and the Playwright spec), the `button-toggle.{en,ru}.mdx` and `examples.button-toggle.{en,ru}.mdx` pages, the five docs examples under `packages/docs-examples/components/button-toggle/`, the dev app in `packages/components-dev/button-toggle/`, the API golden file `tools/public_api_guard/components/button-toggle.api.md`, and the parts of other entry points a toggle exposes: `KbqButton` (disabled state, `tabindex`, focus methods), `KbqButtonPrefix` / `KbqButtonSuffix`, and `KbqTitleDirective` for the truncation tooltip. Every claim in the spec was checked against the source. The only other spec is `select`; this change follows its pattern.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when button-toggle behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the group–toggle synchronization protocol, change-detection details, CSS structure, colors, sizes and design tokens.
- `kbq-button`, `kbq-button-group` and `kbq-title` as components of their own.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the select baseline apply unchanged: one capability at a flat path matching the entry point, English, quirks documented as they ship, only confirmed behaviour in the spec, and public names, selectors, host classes, ARIA attributes, thrown messages and exports counted as contract. The decisions below are specific to this component.

1. **One capability for the group and the toggle.** A grouped toggle derives its state, role, tab stop and keyboard handling from its group, and a standalone toggle is the same class without a group. Separate `button-toggle-group` and `button-toggle` capabilities would split almost every requirement in two.
2. **Value, events and forms get their own section.** The docs page says nothing about them, but they are what most consumers depend on and where most of the quirks are. They follow the selection requirements, before the disabled, layout, content and accessibility sections, which keep the order of the docs page.
3. **Layout, hit area and truncation are in scope; styling is not.** Where a click lands, whether the gutter between toggles is clickable, whether the label is cut with an ellipsis and whether a tooltip appears change what a user can do and read, and the Playwright spec asserts them. Colors, sizes, the state classes the e2e harness fakes (`kbq-hover`, `kbq-active`) and the tokens stay out.
4. **Public plumbing is described through its effect, not by name.** `syncButtonToggle()`, `emitChangeEvent()`, `isSelected()`, the method a toggle calls on initialization to learn whether it starts selected, `controlValueAccessorChangeFn`, `onTouched`, `updateIconType()`, `markForCheck()`, `buttonToggles`, the `valueInput` / `checkedInput` / `disabledInput` members behind the input aliases and `KBQ_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR` are in the typings, several without `@docs-private`, but they are how the group and its toggles talk to each other. `onToggleClick()` is named once, because a unit test drives it from an `effect()`.
5. **Changes made in code are documented as not reaching the form.** Selecting a toggle with `checked`, renaming the selected value and removing the selected toggle all change the group value and `valueChange`, but never the bound form control. Part of this is deliberate (a code comment says a report "would mark the control dirty"), part looks accidental (see Findings). The spec states it as it ships, so that a fix shows up as a `MODIFIED` delta.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/button-toggle` updates `openspec/specs/button-toggle/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:button-toggle` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Where the spec has to state a quirk to be complete, such as the form not hearing about changes made in code, a later change can alter it through `MODIFIED`.
- [Layout requirements depend on the stylesheet] → They are limited to what the Playwright spec asserts geometrically, not what only a baseline image shows.
- [47 requirements, 89 scenarios for a 900-line component] → Most of the length is the value and event contract, which the docs page does not cover at all.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. Both docs pages say that when "the pressed button is blocked, the entire group is styled as unavailable". Nothing styles the group as a whole: disabling the pressed toggle disables that toggle only, as the `button-toggle-disabled-partial-overview` example just above the sentence shows. Disabling the group disables each toggle; the group element gets no disabled class.
2. The JSDoc of the toggle's `change` says "Event emitted when the group value changes". It fires on every activation, including a click on the selected toggle of a single group that changes nothing, and on a standalone toggle that has no group. It carries the toggle's own value, not the group's.
3. The JSDoc of the group's `change` says "Event emitted when the group's value changes". It fires only for a user interaction; a value assigned in code, a toggle checked in code, a renamed or removed selected toggle change the value without it.
4. The JSDoc of `controlValueAccessorChangeFn` says "`ngModel` binding is not supported in multiple selection mode". A multiple group writes arrays to its form control, and the unit suite drives one through `formControl`.
5. The JSDoc of the toggle's `tabIndex` says `null` "leaves the toggle at its default position in the tab order". In a single group every toggle except the tab stop gets `-1` whatever its `tabIndex`.
6. The docs say the tooltip of a truncated label opens "on hover or focus". It opens on keyboard focus only; focus from a click or from code hides it.
7. The docs say an unnamed icon-only toggle "logs a warning until it is named". It warns once per toggle instance.
8. The docs ask to name the group and to mark icons with `kbqButtonPrefix` / `kbqButtonSuffix`, but most live examples do neither: only one group of the overview example and one of the alignment example has an `aria-label`, and only the tooltip example uses a slot marker.
9. `examples.button-toggle.{en,ru}.mdx` are "Documentation in progress" placeholders. `structure.ts` sets `hasExamples: false`, so the tab is not routed. The Russian overview keeps the English heading "Disabled".

**Suspected defects (from reading the code, not reproduced)**

1. Changing `multiple` after initialization updates the roles, `aria-orientation` and `type`, but the selection keeps the mode it was created with in `ngOnInit`. A group switched from multiple to single would keep several toggles selected and report the one selected first. The select throws in this case; the toggle group says nothing.
2. Changes made in code never reach the form control. After the selected toggle is removed, the group value is empty while the control still holds the old value, and a toggle rendered again with that value is not reselected, because the group dropped the value when the toggle left.
3. Assigning an array in an order other than the toggles' through `[(value)]` makes the group emit the reordered array during change detection. With the exhaustive `checkNoChanges` of development mode this probably throws `NG0100`.
4. The array check accepts falsy non-arrays. Assigning `0` or `false` to a multiple group after initialization fails with a `TypeError` from `includes` instead of the documented message; assigned before initialization, it preselects the toggle with that value.
5. The arrow, Home and End handler ignores modifier keys, so Alt + Left (browser back) and Ctrl or Shift with an arrow are prevented and move the selection.
6. Nothing marks the control touched on blur. A required group the user tabs through without choosing stays untouched, so an error shown on touched never appears.
7. The right-to-left swap of Left and Right comes from the CDK `Directionality`, while the layout and the hit area follow the CSS `dir`. A `dir="rtl"` on a container that the CDK `Dir` directive does not pick up mirrors the layout but not the keys.

**Tests whose name and body disagree, or that cannot fail**

- "should update the model before firing change event" checks the model and the event only after both happened, so it cannot detect the order.
- "should register the on change callback" registers a spy on the `FormControl` and calls `setValue()`; the control calls the spy itself, whatever the group does.
- "should update the model if a selected toggle is removed" asserts the group's `value` and `selected`, never the bound `groupValue`.
- Both "should disable click interactions when the group is disabled" tests click a natively disabled button, which jsdom does not dispatch; the toggle's own disabled guard is never reached.
- The two "should emit a change event for state changes" tests explain the second event with a `checkbox` input type that the toggle does not render.
- "should follow the mode when it changes at runtime" checks roles and `type` only, which is how suspected defect 1 goes unnoticed.
- The e2e "paints the hover state from a real pointer" says it uses the "normal" column, but its `.first()` group is the "disabled" column; it hovers that group's last, enabled toggle, so the test still holds.
- The `kbq-title` tests under "KbqButtonToggle label" read private members of `KbqTitleDirective` (`childElements`, `parent`, `handleElementEnter`) and break on a refactor of that directive.

**Behaviour without a test.** The spec states these from the source:

- a click on the selected toggle of a single group keeps it selected, emits no group `change` and does not mark the control touched;
- the order of the form write, the group `change`, `valueChange`, touched and the toggle `change`;
- a toggle checked in code leaves the form model's value unchanged; blur does not mark the control touched;
- an arrow-key move emits `change` and writes the form;
- `type="button"` on the inner button, and activation by Enter and Space;
- the order of values in multiple mode, and `valueChange` after an out-of-order assignment;
- only the first of several toggles sharing a value is selected; `null` assigned to a single group is reported as `null`;
- `selected` as an array in multiple mode;
- `[checked]` and `[disabled]` bound to `undefined` are ignored;
- a toggle's own `disabled` survives enabling the group, and the group element gets no disabled class;
- a disabled toggle can be selected in code, and its `focus()` does nothing;
- the tab stop moves to the first enabled toggle when the selected toggle is disabled;
- forwarding of `aria-labelledby`;
- the tooltip on keyboard focus;
- `iconType` following a change of content;
- `kbq-selected`, `kbq-disabled` and `kbq-button-toggle-group_stretched`, which only the screenshot baselines show;
- the re-export of `KbqButtonPrefix` and `KbqButtonSuffix` from the module, which no test can tell apart from the plain attribute selectors of the slots;
- one warning per toggle.
