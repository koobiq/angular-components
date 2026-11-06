# Spec Delta

## MODIFIED Requirements

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

### Requirement: Touched and dirty state

A bound form control SHALL become dirty and touched only when a user interaction, or a call of `onToggleClick()`, changes the group selection, even when the value written to the control is the one it already holds. Other changes made from code MUST leave it pristine and untouched, and focusing or leaving a toggle MUST NOT mark it touched.

#### Scenario: Code change, then a click

- **WHEN** code checks a toggle of a pristine group and the user then clicks another toggle
- **THEN** the control is pristine and untouched after the code change
- **AND** it is dirty and touched after the click

#### Scenario: Tabbing through the group

- **WHEN** the user tabs onto a toggle and away again without changing the value
- **THEN** the control stays untouched

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

### Requirement: Focus methods and focus ring

A toggle's `focus()` SHALL focus its native button, and `focusViaKeyboard()` SHALL focus it as the keyboard would. A toggle SHALL get the `cdk-keyboard-focused` class while its button has focus from the keyboard. Inside a group, that class is what paints the focus ring; outside a group no style reads it, and the ring is the one the inner button draws for its own keyboard focus.

#### Scenario: Programmatic focus

- **WHEN** code calls `focus()` on a toggle
- **THEN** the toggle's native button is the active element

#### Scenario: Programmatic keyboard focus

- **WHEN** code calls `focusViaKeyboard()` on a toggle
- **THEN** the toggle element has the `cdk-keyboard-focused` class
