# button-toggle Specification

## Purpose

Describes what `kbq-button-toggle-group` and `kbq-button-toggle` from `@koobiq/components/button-toggle` guarantee to consumers: how users select toggles with a pointer, the keyboard or assistive technology, how the group value maps to its toggles and reaches Angular forms, which events fire, and how the group lays out, truncates and names its toggles.

## Requirements

### Requirement: Single selection by pointer

In a group without `multiple`, clicking an enabled toggle SHALL select it and deselect the toggle that was selected before. Clicking the toggle that is already selected MUST NOT deselect it. The selection keeps the mode the group had when it initialized: in a group whose `multiple` is turned off afterwards, a click adds the toggle to those selected before, and the group value stays that of the toggle selected first.

#### Scenario: Clicking another toggle

- **WHEN** toggle A is selected and the user clicks toggle B
- **THEN** B is selected and A is not
- **AND** the group value is B's value

#### Scenario: Clicking the selected toggle again

- **WHEN** the user clicks the toggle that is already selected
- **THEN** it stays selected and the group value does not change

#### Scenario: Multiple turned off after initialization

- **WHEN** a group initialized with `multiple` has it turned off, and the user clicks toggle A and then toggle B
- **THEN** both A and B are selected
- **AND** the group value is A's value

### Requirement: Multiple selection by pointer

With `multiple` set on the group, clicking an enabled toggle SHALL flip its selection without affecting the other toggles. The selection keeps the mode the group had when it initialized: in a group that gets `multiple` only afterwards, selecting a toggle still deselects the toggle selected before.

#### Scenario: Selecting and deselecting

- **WHEN** the user clicks two toggles of a multiple group and then clicks the first one again
- **THEN** only the second toggle is selected
- **AND** the group value holds only its value

#### Scenario: Multiple turned on after initialization

- **WHEN** a group initialized without `multiple` gets it, and the user clicks toggle A and then toggle B
- **THEN** only B is selected
- **AND** the group value holds only B's value

### Requirement: Standalone toggle

A `kbq-button-toggle` outside any group SHALL keep its own `checked` state, and each click SHALL flip it.

#### Scenario: Clicking a standalone toggle twice

- **WHEN** the user clicks a standalone toggle twice
- **THEN** `checked` is `true` after the first click and `false` after the second

### Requirement: Toggle type

The `type` property of a toggle SHALL be `'radio'` while the toggle is in a group without `multiple`, and `'checkbox'` in a multiple group or outside any group. It SHALL follow a change of `multiple` made after initialization.

#### Scenario: Switching the group mode

- **WHEN** `multiple` of a group changes from `true` to `false` after the first render
- **THEN** the `type` of its toggles changes from `'checkbox'` to `'radio'`

### Requirement: Native button activation

Each toggle SHALL render a native `button` with `type="button"`, and its activation — a click, or Enter or Space while it has focus — SHALL act as a click on the toggle. A toggle MUST NOT submit an enclosing form.

#### Scenario: Toggle inside a form

- **WHEN** a toggle inside a `form` element is clicked
- **THEN** the toggle is selected and the form is not submitted

#### Scenario: Space on a focused toggle

- **WHEN** a toggle of a multiple group has focus and the user presses Space
- **THEN** its selection flips

### Requirement: Group value in single mode

Without `multiple`, the group `value` SHALL be the value of the selected toggle and `selected` SHALL be that toggle. With nothing selected and no value assigned, `value` SHALL be `undefined` and `selected` SHALL be `null`.

#### Scenario: Reading the value after a click

- **WHEN** the user clicks the toggle whose value is `'test1'`
- **THEN** the group `value` is `'test1'` and `selected` is that toggle

### Requirement: Group value in multiple mode

With `multiple`, the group `value` SHALL be an array of the selected toggles' values, `[]` when nothing is selected, and `selected` SHALL be an array of the selected toggles. Reading `value` MUST NOT hand back the array instance the consumer assigned.

#### Scenario: Unset value

- **WHEN** a multiple group has no value assigned and nothing is selected
- **THEN** `value` is `[]`

#### Scenario: Assigned array

- **WHEN** the consumer assigns an array to `value`
- **THEN** reading `value` returns an equal array that is a different instance

### Requirement: Order of values in multiple mode

Values of toggles the user selects SHALL be appended in the order of selection. A value assigned from code SHALL be reported in the order of the toggles, followed by the assigned values no toggle matches; when that order differs from the assigned array and from the value the group reported last, the group SHALL emit `valueChange` with the reordered array. When the reordered array is the value reported last, nothing is emitted and a `[(value)]` binding keeps the assigned order.

#### Scenario: Selecting in reverse order

- **WHEN** the user selects the third toggle of a multiple group and then the first
- **THEN** `value` lists the third toggle's value before the first's

#### Scenario: Assigning out of order

- **WHEN** the toggles have the values `'a'` and `'b'` in that order, nothing is selected, and the consumer assigns `['b', 'a']`
- **THEN** `value` is `['a', 'b']`
- **AND** `valueChange` emits `['a', 'b']`

#### Scenario: Reordered value already reported

- **WHEN** the user has selected `'a'` and then `'b'`, and the consumer assigns `['b', 'a']`
- **THEN** `value` is `['a', 'b']`
- **AND** `valueChange` does not emit

### Requirement: Multiple mode requires an array

Assigning a truthy value that is not an array to the `value` of a multiple group, from code, a template binding or a form, SHALL throw the error "Value must be an array in multiple-selection mode."

#### Scenario: Scalar assigned in code

- **WHEN** code assigns `'not-an-array'` to the value of a multiple group
- **THEN** the assignment throws that error

#### Scenario: Scalar assigned from a binding

- **WHEN** the `[value]` binding of a multiple group changes to `'one'`
- **THEN** change detection throws that error

### Requirement: Matching values to toggles

An assigned value SHALL select the toggles whose `value` is strictly equal to it, or to one of its items in multiple mode, falsy values such as `0` and `false` included. A toggle whose `value` is `null` or `undefined` MUST NOT be selected by a value. In single mode, when several toggles share the value, a value assigned while they exist SHALL select only the first of them, and a value in place before they initialize SHALL end up on the last of them, because each selects itself as it initializes.

#### Scenario: Falsy values in multiple mode

- **WHEN** a multiple group with toggles valued `0`, `null` and `false` and one toggle without a value is assigned `[0, false]`
- **THEN** the toggles valued `0` and `false` are selected
- **AND** the toggle valued `null` and the toggle without a value are not

#### Scenario: Shared value assigned after initialization

- **WHEN** a single group holds two toggles valued `'v'` and code then assigns `'v'` to the group value
- **THEN** only the first of the two toggles is selected

#### Scenario: Shared value bound before initialization

- **WHEN** a single group with `[value]="'v'"` renders two toggles valued `'v'`
- **THEN** only the second of the two toggles is selected

### Requirement: Value waiting for its toggle

A value that no rendered toggle matches SHALL be kept and reported by `value`, while `selected` reports only existing toggles. A toggle rendered later with a matching value SHALL become selected. Once the user changes the selection, a value assigned before MUST NOT select a toggle rendered afterwards.

#### Scenario: Unmatched value

- **WHEN** the group is assigned `'missing'` and no toggle has that value
- **THEN** `value` is `'missing'` and `selected` is `null`

#### Scenario: Toggle rendered after the value

- **WHEN** the group is assigned `'late'` and a toggle with that value is rendered later
- **THEN** that toggle becomes selected and `value` is `'late'`

#### Scenario: Toggle remounted after the user moved off its value

- **WHEN** a form control holding `'red'` is bound, the user clicks the `'green'` toggle, and the `'red'` toggle is removed and rendered again
- **THEN** `'green'` stays the only selected toggle and the control value stays `'green'`

### Requirement: Clearing the value

Assigning `null` or `undefined` to the group value SHALL deselect every toggle and set `selected` to `null`, or to `[]` with `multiple`. Without `multiple`, `value` SHALL then report the assigned `null` or `undefined`; with `multiple`, it SHALL be `[]`.

#### Scenario: Bound value reset to undefined

- **WHEN** `[(value)]` holds `'test2'` and the consumer sets it to `undefined`
- **THEN** no toggle is selected, `selected` is `null` and `value` is `undefined`

### Requirement: Selecting a toggle from code

Setting `checked` on a grouped toggle, in code or through its `checked` input, SHALL select or deselect it in the group and emit `valueChange` when the group value changes. It MUST NOT emit `change`, MUST NOT write the new value to a bound form control and MUST NOT mark that control dirty or touched.

#### Scenario: Toggle checked in code inside a form

- **WHEN** a group bound with `ngModel` is pristine and code sets `checked = true` on one of its toggles
- **THEN** that toggle is selected and the control stays pristine and untouched
- **AND** the model keeps its previous value

#### Scenario: Toggle preselected through its input

- **WHEN** a group whose `[(value)]` holds `undefined` renders a toggle with value `'green'` and `[checked]="true"`
- **THEN** the group emits `valueChange` once, with `'green'`, and the bound value becomes `'green'`

### Requirement: Value of a selected toggle changes

When the `value` of a selected toggle changes, the group value SHALL follow it and the group SHALL emit `valueChange` with the new value after the current change detection pass. A bound form control MUST NOT receive the new value or become dirty. A change to the value of a toggle that is not selected MUST NOT change the group value.

#### Scenario: Renaming the selected value

- **WHEN** the selected toggle's value changes from `'red'` to `'crimson'`
- **THEN** the group `value` is `'crimson'`, `valueChange` emits `'crimson'` and a `[(value)]` binding receives it
- **AND** a bound form control keeps `'red'` and stays pristine

#### Scenario: Renaming a toggle that is not selected

- **WHEN** `'green'` is selected and the value of the `'red'` toggle changes to `'crimson'`
- **THEN** the group value stays `'green'` and `valueChange` does not emit

### Requirement: Removing the selected toggle

When the selected toggle is destroyed, the group SHALL drop it from the selection after the current change detection pass and emit `valueChange` with the remaining value. When the whole group is destroyed, it MUST NOT emit `valueChange`.

#### Scenario: Selected toggle removed by `@if`

- **WHEN** the user has selected a toggle and the template stops rendering it
- **THEN** after that change detection pass the group value is `undefined` and `selected` is `null`

#### Scenario: Group destroyed

- **WHEN** a group with a selected toggle is removed from the template
- **THEN** its `valueChange` does not emit

### Requirement: Toggle change event

A toggle SHALL emit `change` every time the user activates it, including a click on the selected toggle of a single group that changes nothing, and outside any group. The event SHALL carry the toggle as `source` and the toggle's own `value`. A disabled toggle MUST NOT emit it.

#### Scenario: Clicking a toggle twice in a single group

- **WHEN** the user clicks an unselected toggle of a single group and then clicks it again
- **THEN** the toggle emits `change` twice

#### Scenario: Standalone toggle

- **WHEN** the user clicks a standalone toggle twice
- **THEN** it emits `change` twice

### Requirement: Group change event

The group SHALL emit `change` only when a user interaction changes its selection, carrying the toggle the user activated as `source` and the group value after the change as `value`, which equals the value before when the newly selected toggle has the value of the one it replaces. A call of `onToggleClick()` counts as such an interaction. Values assigned from code, through bindings or by a form MUST NOT emit it.

#### Scenario: Clicks on two toggles

- **WHEN** the user clicks two different toggles of a single group
- **THEN** the group emits `change` twice

#### Scenario: Emptying a multiple group

- **WHEN** the user deselects the last selected toggle of a multiple group
- **THEN** `change` carries that toggle as `source` and `[]` as `value`

#### Scenario: Value assigned in code

- **WHEN** the group renders with `[value]="'red'"` and code then assigns `'green'`
- **THEN** the group emits no `change`

#### Scenario: Selecting a toggle that shares the value

- **WHEN** two toggles of a single group are valued `'v'`, one of them is selected and the user clicks the other
- **THEN** the group emits `change` with `'v'` as `value`, although its value did not change

### Requirement: Value change notification

The group SHALL emit `valueChange` whenever the value it reports differs from the one it last reported, whatever caused the change except a change of `multiple`, so that `[(value)]` stays in sync. Switching `multiple` after initialization turns the reported value into an array or back without emitting it. Assigning a value that the group then reports unchanged MUST NOT emit it, and an unset value and `[]` SHALL count as the same in multiple mode.

#### Scenario: Two-way binding answered unchanged

- **WHEN** `[(value)]` holds `'green'` and a toggle has that value
- **THEN** the group emits no `valueChange` on initialization

#### Scenario: Unset multiple value

- **WHEN** the `[(value)]` of a multiple group holds `undefined`
- **THEN** the group emits no `valueChange` and the bound value stays `undefined`

#### Scenario: Moving the selection

- **WHEN** the user moves the selection of a single group from one toggle to another
- **THEN** `valueChange` emits only the new value, with no empty value in between

#### Scenario: Switching the mode

- **WHEN** `[(value)]` of a single group holds `'red'`, the `'red'` toggle is selected and `multiple` is then turned on
- **THEN** the group `value` is `['red']`
- **AND** `valueChange` does not emit and the bound value stays `'red'`

### Requirement: Order of events on a user change

When a user interaction changes the value, the group SHALL first write the new value to a bound form control, then emit its `change`, then `valueChange`, then mark the control touched; the activated toggle SHALL emit its own `change` last.

#### Scenario: Reading the model in a change handler

- **WHEN** a group is bound with `ngModel` and the user clicks the toggle valued `'red'`
- **THEN** inside the group's `change` handler the model already holds `'red'`

### Requirement: Angular forms integration

The group SHALL work as a form control with `ngModel` and `formControl`, in single and multiple mode: a value written by the form SHALL select the matching toggles, and a value changed by the user SHALL be written to the form.

#### Scenario: Form writes a value

- **WHEN** the bound `FormControl` is set to `'green'`
- **THEN** the group value is `'green'` and the matching toggle is selected

#### Scenario: User selects a toggle

- **WHEN** a group is bound with `ngModel` and the user clicks the toggle valued `'green'`
- **THEN** the model value becomes `'green'`

### Requirement: Touched and dirty state

A bound form control SHALL become dirty and touched only when a user interaction, or a call of `onToggleClick()`, changes the group selection, even when the value written to the control is the one it already holds. Other changes made from code MUST leave it pristine and untouched, and focusing or leaving a toggle MUST NOT mark it touched.

#### Scenario: Code change, then a click

- **WHEN** code checks a toggle of a pristine group and the user then clicks another toggle
- **THEN** the control is pristine and untouched after the code change
- **AND** it is dirty and touched after the click

#### Scenario: Tabbing through the group

- **WHEN** the user tabs onto a toggle and away again without changing the value
- **THEN** the control stays untouched

### Requirement: Disabled through the form

Disabling or enabling a bound form control SHALL disable or enable the group, with the same effect as its `disabled` input.

#### Scenario: Control disabled and enabled

- **WHEN** the bound `FormControl` is disabled and then enabled
- **THEN** the group's `disabled` is `true` and then `false`

### Requirement: Inputs bound to undefined

A `[value]` binding of a group or a toggle that changes to `undefined` SHALL be applied. A `[checked]` or `[disabled]` binding of a toggle, or a `[disabled]` binding of a group, that changes to `undefined` SHALL be converted to `false` and applied: the toggle is unchecked or enabled, and the group enabled.

#### Scenario: Toggle value reset to undefined

- **WHEN** the `[value]` binding of a standalone toggle changes from `'yes'` to `undefined`
- **THEN** the toggle's `value` is `undefined`

#### Scenario: Checked binding changes to undefined

- **WHEN** the `[checked]` binding of a toggle changes from `true` to `undefined`
- **THEN** the toggle is no longer checked

#### Scenario: Group disabled binding changes to undefined

- **WHEN** the `[disabled]` binding of a group changes from `true` to `undefined`
- **THEN** the group's `disabled` is `false`

### Requirement: Writes from a reactive context

Assigning the group `value`, setting a toggle's `checked` or calling `onToggleClick()` inside an `effect()` SHALL NOT make that effect depend on the selection: a later change of the selection MUST NOT re-run the effect.

#### Scenario: Effect that sets the group value

- **WHEN** an effect assigns `'first'` to the group value and the user then clicks the `'second'` toggle
- **THEN** the value is `'second'` and the effect has run once

#### Scenario: Effect that clicks a toggle

- **WHEN** an effect calls `onToggleClick()` on a toggle of a multiple group
- **THEN** the toggle is selected and the effect has run once

### Requirement: Disabled toggle

A toggle with `disabled` set SHALL render its native button `disabled`, get the `kbq-disabled` class and ignore clicks, and its `focus()` SHALL do nothing. It SHALL still be selectable in code or by a value, and then carries both `kbq-selected` and `kbq-disabled`.

#### Scenario: Clicking a disabled standalone toggle

- **WHEN** a standalone toggle is disabled and the user clicks it
- **THEN** its button has the `disabled` attribute and the toggle stays unchecked

#### Scenario: Disabled toggle checked through its input

- **WHEN** a toggle of a single group has `[checked]="true"` and `[disabled]="true"`
- **THEN** it is selected, its value is the group value and it has the `kbq-selected` and `kbq-disabled` classes

### Requirement: Disabled group

Setting `disabled` on the group SHALL disable every toggle in it. Enabling the group again MUST NOT enable a toggle disabled through its own input. The group element itself SHALL get no disabled class or ARIA attribute.

#### Scenario: Group disabled

- **WHEN** the group's `disabled` is set to `true` and the user clicks a toggle
- **THEN** every inner button is `disabled` and the toggle stays unselected

#### Scenario: Group enabled again

- **WHEN** a group containing a toggle with its own `[disabled]="true"` is disabled and then enabled
- **THEN** that toggle is still disabled and the other toggles are enabled

### Requirement: Vertical layout

With `vertical` set, the group SHALL get the `kbq-button-toggle_vertical` class and lay its toggles out in a column, each as wide as the group.

#### Scenario: Turning vertical on

- **WHEN** `vertical` changes from `false` to `true`
- **THEN** the group element gets the `kbq-button-toggle_vertical` class and its toggles stack vertically

### Requirement: Stretched layout

With `stretched` set, the group SHALL get the `kbq-button-toggle-group_stretched` class, fill the width of its container and share it equally between its toggles, with the content of each toggle centred.

#### Scenario: Stretched group

- **WHEN** a stretched group with three toggles is placed in a container 400 px wide
- **THEN** the group spans the container and its three toggles have the same width

### Requirement: Hit area between toggles

The gaps between toggles and the padding around them SHALL respond to the pointer as part of the nearest toggle: a gap SHALL be split at its midline between its two neighbors, and the outermost toggles SHALL take the group's padding, in both orientations and mirrored right-to-left. A click in a disabled toggle's share MUST NOT activate a neighbor.

#### Scenario: Click in a gap

- **WHEN** the user clicks 1 px past the midline of the gap between the first and the second toggle, on the second toggle's side
- **THEN** the second toggle is selected

#### Scenario: Click in the share of a disabled toggle

- **WHEN** the first toggle is disabled and the user clicks its side of the gap to the second toggle
- **THEN** neither toggle is selected

#### Scenario: Right-to-left layout

- **WHEN** the document direction is right-to-left and the user clicks the right edge of the group's padding
- **THEN** the first toggle, which is now laid out at the right, receives the click

### Requirement: Content slots

A toggle SHALL project content marked with `kbqButtonPrefix` before its label and content marked with `kbqButtonSuffix` after it, outside the box that holds the label, including content rendered by `@if`. Unmarked content, icons included, SHALL be projected into the label box.

#### Scenario: Marked icons

- **WHEN** a toggle holds an icon marked `kbqButtonPrefix`, a text label and an icon marked `kbqButtonSuffix`
- **THEN** the icons are laid out before and after the label, outside the label box

#### Scenario: Unmarked icon

- **WHEN** a toggle holds an unmarked icon next to a text label
- **THEN** the icon is inside the label box

### Requirement: Label truncation

A label that does not fit SHALL be cut with an ellipsis while icons in the prefix and suffix slots keep their full size. When an icon sits in the label box without a slot marker, the label SHALL be clipped without an ellipsis. A toggle with only slotted icons SHALL centre them.

#### Scenario: Long label between slotted icons

- **WHEN** a toggle with a prefix icon, a long label and a suffix icon is narrower than its content
- **THEN** the label ends with an ellipsis and both icons keep their 16 px width

#### Scenario: Unmarked icon beside a long label

- **WHEN** a toggle holds an unmarked icon and a label that does not fit
- **THEN** the label is clipped without an ellipsis

### Requirement: Tooltip for a truncated label

While its label is truncated, a toggle SHALL show a tooltip with the full label text on hover and on keyboard focus, and hide it when the pointer leaves. While the label fits, no tooltip SHALL appear.

#### Scenario: Hovering a truncated toggle

- **WHEN** the user hovers a toggle whose label is cut with an ellipsis
- **THEN** a tooltip with the full label appears
- **AND** it hides when the pointer leaves

#### Scenario: Hovering a toggle that fits

- **WHEN** the user hovers a toggle whose content fits
- **THEN** no tooltip appears

### Requirement: Icon type classes

A toggle SHALL report `iconType` as `''` with neither class when it holds no icon. Otherwise it SHALL compare its icons, counted at any depth, with the nodes at the top level of its slots: as many, it reports `'-icon'` with the `kbq-button-toggle-icon` class, otherwise `'-icon-text'` with the `kbq-button-toggle-icon-text` class, whether or not the icons are marked for a slot. An element that wraps an icon together with a label counts as icon-only. It SHALL update both when its content changes.

#### Scenario: Icon-only toggle

- **WHEN** a toggle holds a single icon and nothing else
- **THEN** `iconType` is `'-icon'` and the toggle has the `kbq-button-toggle-icon` class

#### Scenario: Icon beside a label

- **WHEN** a toggle holds an icon and a text label
- **THEN** `iconType` is `'-icon-text'` and the toggle has the `kbq-button-toggle-icon-text` class

#### Scenario: Text only

- **WHEN** a toggle holds only a text label
- **THEN** `iconType` is `''` and the toggle has neither class

#### Scenario: Icon wrapped together with its label

- **WHEN** a toggle holds one element of the consumer that contains an icon and a text label
- **THEN** `iconType` is `'-icon'` and the toggle has the `kbq-button-toggle-icon` class

### Requirement: State classes

A toggle element SHALL carry the `kbq-button-toggle` class, plus `kbq-selected` while it is selected and `kbq-disabled` while it is disabled, its own state or its group's. The group element SHALL carry the `kbq-button-toggle-group` class.

#### Scenario: Selecting and deselecting

- **WHEN** a toggle becomes selected and is then deselected
- **THEN** its element has the `kbq-selected` class while selected and loses it afterwards

### Requirement: Radio group semantics

A group without `multiple` SHALL have `role="radiogroup"` and an `aria-orientation` of `horizontal`, or `vertical` with `vertical` set. The native button of each of its toggles SHALL have `role="radio"`, an `aria-checked` that follows the selection, and no `aria-pressed`.

#### Scenario: Selecting the second toggle

- **WHEN** the user clicks the second of three toggles
- **THEN** their buttons have `aria-checked` `false`, `true` and `false`

#### Scenario: Vertical radio group

- **WHEN** `vertical` is set on a group without `multiple`
- **THEN** the group has `aria-orientation="vertical"`

### Requirement: Toggle button semantics

A group with `multiple` SHALL have `role="group"` and no `aria-orientation`. The native button of a toggle in it, or of a standalone toggle, SHALL keep its implicit button role and carry an `aria-pressed` that follows its selection, with no `aria-checked`. Roles SHALL follow a change of `multiple` at runtime.

#### Scenario: Pressing a toggle of a multiple group

- **WHEN** the user clicks the first toggle of a vertical multiple group
- **THEN** its button has `aria-pressed="true"` and no `role` attribute
- **AND** the group has `role="group"` and no `aria-orientation`

#### Scenario: Multiple turned off at runtime

- **WHEN** `multiple` changes from `true` to `false` after the first render
- **THEN** the group has `role="radiogroup"` and the buttons have `role="radio"`

### Requirement: Single tab stop in a radio group

In a group without `multiple`, only one toggle SHALL be in the tab order: the selected toggle when it is enabled, otherwise the first enabled toggle. The other toggles SHALL have `tabindex="-1"`, and the tab stop SHALL move with the selection.

#### Scenario: Nothing selected

- **WHEN** a radio group renders with nothing selected
- **THEN** only the first toggle's button is in the tab order

#### Scenario: First toggle disabled

- **WHEN** the first toggle is disabled and nothing is selected
- **THEN** the second toggle's button is the tab stop

#### Scenario: Selection moves

- **WHEN** the user selects the third toggle
- **THEN** its button becomes the only tab stop

### Requirement: Tab order outside a radio group

In a multiple group and on a standalone toggle, every enabled toggle SHALL be in the tab order. The `tabIndex` input SHALL set the button's `tabindex`, with `null` keeping the default position; in a radio group it SHALL apply only to the toggle holding the tab stop. A disabled toggle SHALL have `tabindex="-1"`.

#### Scenario: Multiple group

- **WHEN** a multiple group renders three enabled toggles
- **THEN** all three buttons are in the tab order

#### Scenario: Explicit tabIndex

- **WHEN** the `tabIndex` of a standalone toggle changes from `null` to `3`
- **THEN** its button gets `tabindex="3"`

### Requirement: Arrow keys in a radio group

While a toggle of a group without `multiple` has focus, Right and Down SHALL move focus and selection to the next enabled toggle, Left and Up to the previous one, skipping disabled toggles and wrapping at both ends. The key's default action SHALL be prevented, and the move SHALL count as a user change that emits `change` and updates the form.

#### Scenario: Right arrow

- **WHEN** the first toggle has focus and the user presses Right
- **THEN** the second toggle is selected and its button has focus

#### Scenario: Wrapping backwards

- **WHEN** the first toggle has focus and the user presses Left
- **THEN** the last toggle is selected

#### Scenario: Skipping a disabled toggle

- **WHEN** the first toggle is disabled, the second has focus and the user presses Left
- **THEN** the third toggle is selected and the first is not

#### Scenario: From Tab to the arrows

- **WHEN** the user tabs into a radio group and presses Right
- **THEN** the toggle reached by Tab shows the keyboard focus ring first
- **AND** after the key press exactly one button has `aria-checked="true"`, and it has focus

### Requirement: Home and End in a radio group

While a toggle of a group without `multiple` has focus, Home SHALL move focus and selection to the first enabled toggle and End to the last enabled toggle.

#### Scenario: End key

- **WHEN** the second toggle has focus and the user presses End
- **THEN** the last toggle is selected

#### Scenario: Home key

- **WHEN** the second toggle has focus and the user presses Home
- **THEN** the first toggle is selected

### Requirement: Arrow keys in right-to-left layout

When the toggle's direction is right-to-left, Left SHALL move to the next toggle and Right to the previous one, while Up and Down SHALL keep their direction.

#### Scenario: Left in right-to-left

- **WHEN** the direction is right-to-left, the first toggle has focus and the user presses Left
- **THEN** the second toggle is selected

#### Scenario: Down in right-to-left

- **WHEN** the direction is right-to-left, the first toggle has focus and the user presses Down
- **THEN** the second toggle is selected

### Requirement: No key handling outside a radio group

In a multiple group and on a standalone toggle, the toggle MUST NOT handle the arrow, Home or End keys: their default action is not prevented and the selection does not change.

#### Scenario: Right arrow in a multiple group

- **WHEN** a toggle of a multiple group has focus and the user presses Right
- **THEN** no toggle becomes selected and the event's default action is not prevented

### Requirement: Focus methods and focus ring

A toggle's `focus()` SHALL focus its native button, and `focusViaKeyboard()` SHALL focus it as the keyboard would. A toggle SHALL get the `cdk-keyboard-focused` class while its button has focus from the keyboard. Inside a group, that class is what paints the focus ring; outside a group no style reads it, and the ring is the one the inner button draws for its own keyboard focus.

#### Scenario: Programmatic focus

- **WHEN** code calls `focus()` on a toggle
- **THEN** the toggle's native button is the active element

#### Scenario: Programmatic keyboard focus

- **WHEN** code calls `focusViaKeyboard()` on a toggle
- **THEN** the toggle element has the `cdk-keyboard-focused` class

### Requirement: Accessible name of a toggle

The `aria-label` and `aria-labelledby` inputs of a toggle SHALL be rendered on its native button, the element the accessible name is computed for. A `title` on the toggle element MUST NOT reach the button.

#### Scenario: Icon-only toggle with a label

- **WHEN** an icon-only toggle has `aria-label="Play"`
- **THEN** its button has `aria-label="Play"` and axe reports no violations

### Requirement: Accessible name of a group

The group SHALL be named by an `aria-label` or `aria-labelledby` attribute on its element, written as a static attribute or bound with `[attr.aria-label]`, and SHALL leave that attribute as written; it MUST NOT define inputs of those names.

#### Scenario: Named radio group

- **WHEN** the group element has `aria-label="Delivery"`
- **THEN** the group has `role="radiogroup"` and keeps `aria-label="Delivery"`

### Requirement: Warning for an unnamed icon-only toggle

In development mode, a toggle that holds only icons and has neither `aria-label` nor `aria-labelledby` SHALL log one console warning, "KbqButtonToggle: icon-only toggle has no accessible name. Add [aria-label] or [aria-labelledby] to it." A named toggle MUST NOT warn, and a `title` on the toggle element MUST NOT silence it.

#### Scenario: Unnamed icon-only toggle

- **WHEN** an icon-only toggle without a name is rendered in development mode
- **THEN** the console shows the warning

#### Scenario: Named icon-only toggle

- **WHEN** an icon-only toggle has `aria-label="Play"`
- **THEN** no warning is logged

#### Scenario: Titled icon-only toggle

- **WHEN** an icon-only toggle has only `title="Play"`
- **THEN** the console still shows the warning

### Requirement: Entry point exports

`@koobiq/components/button-toggle` SHALL export the standalone `KbqButtonToggleGroup` (template reference `kbqButtonToggleGroup`) and `KbqButtonToggle` (template reference `kbqButtonToggle`), the `KbqButtonToggleChange` event class, the `ToggleType` type, and `KbqButtonToggleModule`, which SHALL also re-export `KbqButtonPrefix` and `KbqButtonSuffix`.

#### Scenario: Template reference

- **WHEN** a template declares `#group="kbqButtonToggleGroup"` on a group
- **THEN** `group.value` reads the group value in that template

#### Scenario: Module import

- **WHEN** a component imports only `KbqButtonToggleModule` and marks an icon with `kbqButtonPrefix`
- **THEN** the marker directive applies and the icon is projected into the prefix slot
