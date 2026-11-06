# Spec Delta

## Purpose

Describes what `kbq-checkbox` from `@koobiq/components/checkbox` guarantees to consumers: how its checked and indeterminate states are set and shown, how users toggle it with a pointer or the keyboard, which events it emits, and how it works with Angular forms and assistive technology.

## ADDED Requirements

### Requirement: Checked state is reflected

The checkbox SHALL be unchecked by default. While `checked` is true, the host SHALL have the `kbq-checked` class, the native `<input type="checkbox">` inside it SHALL be checked, and the input SHALL carry `aria-checked="true"`. While it is false, the class SHALL be absent, the input unchecked and, unless the checkbox is indeterminate, `aria-checked="false"`.

#### Scenario: Binding checked

- **WHEN** `[checked]` changes from `false` to `true`
- **THEN** the host has `kbq-checked` and the native input is checked
- **AND** when it changes back to `false`, the class is removed and the input is unchecked

#### Scenario: Default state

- **WHEN** a checkbox is rendered without `checked`
- **THEN** it is unchecked and its native input has `aria-checked="false"`

### Requirement: Pointer toggles the checkbox

A click anywhere in the label area of an enabled checkbox — the box, the projected label text or a projected hint — SHALL toggle `checked`. With the default click action it SHALL also clear `indeterminate`, as described by the click-action requirements.

#### Scenario: Clicking the label text

- **WHEN** the user clicks the label of an unchecked checkbox
- **THEN** the checkbox becomes checked
- **AND** a second click makes it unchecked again

### Requirement: Keyboard toggles the checkbox

The checkbox SHALL be operated through its native input: while the input has focus, Space SHALL toggle the checkbox with the same effects as a click, including the click action, the `change` event and the form update.

#### Scenario: Space on a focused checkbox

- **WHEN** the native input of an unchecked, enabled checkbox has focus and the user presses Space
- **THEN** the checkbox becomes checked and `change` fires once

### Requirement: Clickable area and cursor

Only the label area SHALL react to the pointer: it SHALL show the `pointer` cursor, while the part of the host outside it SHALL keep the default cursor and a click there MUST NOT toggle the checkbox. A disabled checkbox SHALL show the `default` cursor on the host and the label area.

#### Scenario: Cursor on an enabled checkbox

- **WHEN** the pointer is over the label area of an enabled checkbox
- **THEN** the cursor is `pointer`
- **AND** over the host outside the label area it is not `pointer`

#### Scenario: Cursor on a disabled checkbox

- **WHEN** the checkbox is disabled
- **THEN** the host and the label area both show the `default` cursor

### Requirement: Checked state written by code is silent

Setting `checked` through the `[checked]` binding or the `checked` property SHALL update the host class and the native input, and MUST NOT emit `change`, MUST NOT clear `indeterminate` and MUST NOT pass the value to a bound form control.

#### Scenario: Binding changes the state

- **WHEN** the bound `checked` value changes to `true`
- **THEN** the checkbox is checked and no `change` event is emitted

#### Scenario: Property set in code

- **WHEN** code sets the `checked` property of the component instance to `true`
- **THEN** the native input becomes checked after the next render

### Requirement: Bound state applies only when it changes

The `checked`, `disabled` and `indeterminate` inputs SHALL be applied only when their bound value changes. A state produced by a click, by code or by the form control SHALL stay until the bound value changes again.

#### Scenario: Constant binding and a click

- **WHEN** a checkbox is bound with `[checked]="false"` and the user clicks it
- **THEN** it stays checked until the bound value changes

### Requirement: Toggling from code

The `toggle()` method SHALL flip `checked` and pass the new value to a bound form control. It MUST NOT emit `change` and MUST NOT clear `indeterminate`.

#### Scenario: Toggle with a form control

- **WHEN** a checkbox bound to a form control with value `false` is toggled with `toggle()`
- **THEN** the checkbox is checked and the control's value is `true`
- **AND** no `change` event is emitted

### Requirement: Indeterminate state is reflected

While `indeterminate` is true, the host SHALL have the `kbq-indeterminate` class, the native input SHALL be indeterminate and the box SHALL show the mixed mark instead of the check mark. The input's `aria-checked` SHALL be `mixed` when the checkbox is not checked and `true` when it is also checked.

#### Scenario: Indeterminate and unchecked

- **WHEN** `[indeterminate]` is `true` and `checked` is `false`
- **THEN** the host has `kbq-indeterminate`, the native input is indeterminate and has `aria-checked="mixed"`

#### Scenario: Indeterminate and checked

- **WHEN** `checked` and `indeterminate` are both `true`
- **THEN** the host has both `kbq-checked` and `kbq-indeterminate` and the box shows the mixed mark
- **AND** the native input has `aria-checked="true"`

### Requirement: Code changes to checked keep indeterminate

Changing `checked` through the binding or in code MUST NOT change `indeterminate`.

#### Scenario: Checking an indeterminate checkbox in code

- **WHEN** an indeterminate checkbox's bound `checked` value changes to `true` and then to `false`
- **THEN** the checkbox stays indeterminate both times

### Requirement: Default click clears indeterminate

With the default click action, a click on an indeterminate checkbox SHALL toggle `checked` and then set `indeterminate` to `false` and emit `indeterminateChange` with `false`. The indeterminate state SHALL be cleared asynchronously, after `change` has been emitted, so a `change` handler still reads `indeterminate` as `true`.

#### Scenario: Clicking an unchecked indeterminate checkbox

- **WHEN** the user clicks a checkbox that is indeterminate and unchecked
- **THEN** it becomes checked and, once the pending microtask has run, is no longer indeterminate

#### Scenario: Clicking a checked indeterminate checkbox

- **WHEN** the user clicks a checkbox that is indeterminate and checked
- **THEN** it becomes unchecked and, once the pending microtask has run, is no longer indeterminate

### Requirement: Indeterminate change notification

The checkbox SHALL emit `indeterminateChange` with the new value whenever `indeterminate` changes, whether through the binding, the property set in code or a click, and MUST NOT emit it when the value is set to what it already is. `[(indeterminate)]` SHALL work as a two-way binding.

#### Scenario: Two-way binding after a click

- **WHEN** a checkbox is bound with `[(indeterminate)]="isIndeterminate"`, `isIndeterminate` is `true` and the user clicks it
- **THEN** `isIndeterminate` becomes `false`

### Requirement: State changes from an effect

Calling `toggle()` or setting `indeterminate` inside an Angular `effect()` MUST NOT make that effect depend on the checkbox state, so a later click MUST NOT re-run it.

#### Scenario: Effect that toggles the checkbox

- **WHEN** an effect calls `toggle()` once and the user then clicks the checkbox
- **THEN** the checkbox is unchecked and the effect has run only once

### Requirement: Click action "check"

With the click action `check`, a click on an enabled checkbox SHALL toggle `checked` and emit `change`, and MUST NOT change `indeterminate` or emit `indeterminateChange`.

#### Scenario: Clicking an indeterminate checkbox

- **WHEN** the click action is `check` and the user clicks an unchecked, indeterminate checkbox
- **THEN** the checkbox is checked and still indeterminate

### Requirement: Click action "noop"

With the click action `noop`, a click MUST NOT change `checked` or `indeterminate`, MUST NOT emit `change` and MUST NOT update a bound form control. The native input SHALL be put back to the component's checked and indeterminate state.

#### Scenario: Clicking with noop

- **WHEN** the click action is `noop` and the user clicks a checked, indeterminate checkbox
- **THEN** the checkbox stays checked and indeterminate, and so does its native input

### Requirement: Choosing the click action

The `clickAction` input SHALL set the click action, read at the moment of each click. Its default SHALL come from the `KBQ_CHECKBOX_CLICK_ACTION` injection token, and without a token the action SHALL be `check-indeterminate`. A bound `undefined` SHALL act as `check-indeterminate` and ignore the token. The checkbox MUST NOT read `KBQ_CHECKABLE_CLICK_ACTION`.

#### Scenario: Input overrides the token

- **WHEN** `KBQ_CHECKBOX_CLICK_ACTION` is provided as `noop` and the checkbox is bound with `clickAction="check-indeterminate"`
- **THEN** a click toggles the checkbox

#### Scenario: Input changed at runtime

- **WHEN** the bound `clickAction` changes from `check-indeterminate` to `noop` after a click
- **THEN** the next click leaves `checked` unchanged

### Requirement: Change event on user toggle

Each toggle made by the user SHALL emit `change` once with a `KbqCheckboxChange` whose `source` is the checkbox and whose `checked` is the new value. The native input's DOM `change` event MUST NOT propagate out of the host, so a `(change)` listener on the checkbox receives only `KbqCheckboxChange` objects.

#### Scenario: Clicking the label

- **WHEN** the user clicks the label of an unchecked checkbox
- **THEN** `change` fires once with `checked` set to `true`

#### Scenario: Listener on the host

- **WHEN** a `(change)` listener is bound on `kbq-checkbox` and the native input is clicked
- **THEN** the listener receives an object whose `checked` is `true`, not a DOM event

### Requirement: Form control holds the value before change fires

On a user toggle, the new value SHALL be passed to a bound form control before `change` is emitted.

#### Scenario: Reading the control in the change handler

- **WHEN** a checkbox is bound to a form control and the user clicks it
- **THEN** a `change` handler that reads the control sees the new value

### Requirement: Click events reaching the host

A pointer click on the label area SHALL reach a click listener on the host exactly once, even though the browser also clicks the native input. A click delivered to the native input itself, as on a keyboard toggle or a call to its `click()`, MUST NOT propagate to the host.

#### Scenario: One click event per pointer click

- **WHEN** a `(click)` listener is bound on `kbq-checkbox` and the user clicks the label
- **THEN** the listener is called once

### Requirement: Label content

Content projected into `kbq-checkbox`, other than a `kbq-hint`, SHALL be rendered as the label text inside a `<label>` element bound to the native input.

#### Scenario: Projected text

- **WHEN** a checkbox is written as `<kbq-checkbox>Simple checkbox</kbq-checkbox>`
- **THEN** the label text of the checkbox is "Simple checkbox"

### Requirement: Hint under the label

A projected `kbq-hint` element SHALL be rendered under the label text, whatever its position among the projected content, inside the clickable label area, and SHALL use the disabled colors while the checkbox is disabled.

#### Scenario: Hint declared before the text

- **WHEN** a checkbox contains `<kbq-hint>Caption</kbq-hint>` followed by the text "Default"
- **THEN** "Caption" is shown under "Default"

### Requirement: Long label text

A label longer than the width available to the checkbox SHALL wrap onto several lines, and the box SHALL stay aligned with the first line.

#### Scenario: Multiline label

- **WHEN** the label text is longer than the host's maximum width
- **THEN** the text wraps and the box stays next to the first line

### Requirement: Label position

The `labelPosition` input SHALL default to `after`, which places the box before the label text. With `before`, the host SHALL get the `kbq-checkbox_label-before` class and the box SHALL be placed after the label text.

#### Scenario: Label before the box

- **WHEN** `labelPosition` is `before`
- **THEN** the host has `kbq-checkbox_label-before` and the box follows the text

### Requirement: Size

The `big` input SHALL default to `false`. When it is true, the host SHALL get the `kbq-checkbox_big` class and use the big size. A checkbox with one line of label text, or with no label, SHALL be 20 px high in the normal size and 24 px high in the big size.

#### Scenario: Switching to the big size

- **WHEN** `big` changes from `false` to `true` on checkboxes with and without a label
- **THEN** each host gets `kbq-checkbox_big` and its height changes from 20 px to 24 px

### Requirement: Color

The `color` input SHALL be rendered as a `kbq-<color>` class on the host without removing other classes, replacing the class of the previous color. Without a color the host SHALL have `kbq-empty` and use the theme palette. The `error` color SHALL switch the box, the label and the hint to the error palette; it is the only color with a palette of its own in the checkbox styles.

#### Scenario: Changing the color

- **WHEN** the host also has a class of its own and `color` changes from `primary` to `accent`
- **THEN** the host has `kbq-accent`, no longer has `kbq-primary`, and keeps its own class

#### Scenario: Error color

- **WHEN** `color` is `error`
- **THEN** the checkbox is drawn with the error palette in every state

### Requirement: No error state of its own

The checkbox MUST NOT change its appearance or its ARIA attributes when its form control is invalid. Showing an invalid checkbox SHALL be left to the consumer, through `color="error"`.

#### Scenario: Invalid required checkbox

- **WHEN** a required checkbox bound to a form control is touched and unchecked
- **THEN** it has no `kbq-error` class and no `aria-invalid` attribute unless the consumer sets `color="error"`

### Requirement: Name and value of the native input

The `name` and `value` inputs SHALL be set as the `name` and `value` attributes of the native input. When they are not given, the native input MUST NOT have those attributes.

#### Scenario: Name and value given

- **WHEN** the checkbox is bound with `name="test-name"` and `value="basic_checkbox"`
- **THEN** the native input has `name="test-name"` and the value `basic_checkbox`

#### Scenario: Not given

- **WHEN** neither `name` nor `value` is set
- **THEN** the native input has neither attribute

### Requirement: Ids

The host SHALL carry the `id` given to the checkbox, or a generated one that starts with `kbq-checkbox-` when the id is not given, `null` or empty. The native input SHALL have the id `<host id>-input`, which the `<label>` refers to. Each checkbox SHALL get a different generated id, and reading `id()` SHALL return the id the host carries.

#### Scenario: User-provided id

- **WHEN** the checkbox has `id="simple-check"`
- **THEN** the host id is `simple-check` and the native input id is `simple-check-input`

#### Scenario: Null id

- **WHEN** the checkbox is bound with `[id]="null"`
- **THEN** the host id matches `kbq-checkbox-<suffix>`, the native input id is that id followed by `-input`, and `id()` returns the host id

### Requirement: Boolean inputs accept attributes

The `checked`, `disabled`, `indeterminate`, `big` and `required` inputs SHALL accept boolean attributes: a valueless attribute SHALL mean `true`, and the string `"false"` SHALL mean `false`.

#### Scenario: Valueless attributes

- **WHEN** a checkbox is written as `<kbq-checkbox big checked required>`
- **THEN** it is checked, has `kbq-checkbox_big`, and its native input is required

### Requirement: Tab order

The native input SHALL be the checkbox's tab stop, with `tabindex="0"` by default or the bound `tabIndex`. A bound `null`, `undefined` or non-numeric value SHALL restore `0`. While the checkbox is disabled, the tab index SHALL be `-1`, and enabling it SHALL restore the bound value, including one bound while disabled.

#### Scenario: Custom tab index

- **WHEN** the checkbox is bound with `[tabIndex]="7"`
- **THEN** the native input's `tabIndex` is 7

#### Scenario: Tab index changed while disabled

- **WHEN** the checkbox is disabled, its `tabIndex` changes to 13 and it is enabled again
- **THEN** the native input's `tabIndex` is 13

#### Scenario: Unset tab index

- **WHEN** the bound `tabIndex` becomes `null` or `undefined`
- **THEN** the native input has `tabindex="0"`

### Requirement: Focus method

The `focus()` method SHALL move focus to the native input as keyboard focus, so the input gets the `cdk-keyboard-focused` class and the focus outline is drawn around the box.

#### Scenario: Focusing from code

- **WHEN** `focus()` is called on an enabled checkbox
- **THEN** the native input is the document's active element

### Requirement: Disabled state

When disabled through the `disabled` input, the `disabled` property or its form control, the checkbox SHALL get the `kbq-disabled` class and a `disabled="true"` attribute on the host, and its native input SHALL be disabled. Enabling it SHALL remove the class and the attribute and enable the input.

#### Scenario: Disabling through the binding

- **WHEN** `[disabled]` changes to `true`
- **THEN** the host has `kbq-disabled` and `disabled="true"`, and the native input is disabled

#### Scenario: Enabled checkbox

- **WHEN** the checkbox is enabled
- **THEN** the host has no `disabled` attribute

### Requirement: Disabled checkbox ignores interaction

A disabled checkbox MUST NOT toggle on a click or a key press, MUST NOT emit `change` and MUST NOT update a bound form control.

#### Scenario: Clicking a disabled checkbox

- **WHEN** the checkbox is disabled and the user clicks its label
- **THEN** `checked` does not change and no `change` event is emitted

### Requirement: Angular forms integration

The checkbox SHALL work as a form control with `formControl`, `formControlName` and `ngModel`. A value written by the form SHALL check the checkbox when it is truthy and uncheck it otherwise, and a toggle by the user SHALL pass the new boolean `checked` value to the form control.

#### Scenario: Toggling with ngModel

- **WHEN** a checkbox bound with `[(ngModel)]` is clicked twice
- **THEN** it is checked after the first click and unchecked after the second

#### Scenario: Form writes a truthy value

- **WHEN** the form control's value is set to a truthy non-boolean value such as `1`
- **THEN** the checkbox is checked

### Requirement: Disabled through the form control

Disabling or enabling the bound form control SHALL disable or enable the checkbox.

#### Scenario: Disabling the control

- **WHEN** the bound form control is disabled and then enabled
- **THEN** the checkbox and its native input are disabled and then enabled again

### Requirement: Touched state

The checkbox SHALL mark its form control touched when focus leaves the native input, and MUST NOT mark it touched before that, neither when it is rendered nor when focus arrives.

#### Scenario: Initial state

- **WHEN** a checkbox bound with `ngModel` and no validators is rendered
- **THEN** the control is pristine, untouched and valid

#### Scenario: Focus enters and leaves

- **WHEN** the native input gets focus
- **THEN** the control is still untouched
- **AND** when focus leaves the input, the control is touched

### Requirement: Required flag on the native input

The `required` input SHALL default to `false` and SHALL be reflected as the `required` property of the native input. On its own, without a form directive, it MUST NOT add validation.

#### Scenario: Toggling required

- **WHEN** `[required]` changes to `true` and then to `false`
- **THEN** the native input is required and then not required

### Requirement: Required validation with a form directive

On a `kbq-checkbox` that has `required` together with `formControl`, `formControlName` or `ngModel`, the `KbqCheckboxRequiredValidator` directive SHALL make the control invalid with a `required` error while the checkbox is unchecked, and valid while it is checked. The directive SHALL apply wherever it is imported, directly or through `KbqCheckboxModule`.

#### Scenario: Required checkbox with ngModel

- **WHEN** a required checkbox bound with `ngModel` is clicked to checked and then clicked to unchecked
- **THEN** the control is valid after the first click and invalid after the second

### Requirement: Accessible name and state

The checkbox SHALL expose the semantics of the native `<input type="checkbox">` to assistive technology, with its state in `aria-checked` as described above. The input's accessible name SHALL come from the content of the `<label>`, which includes the text of a projected hint.

#### Scenario: Labelled checkbox

- **WHEN** a checkbox with the label "Be good" is rendered
- **THEN** the native input is a checkbox named "Be good"

### Requirement: Module and template reference

`KbqCheckboxModule` SHALL export both `kbq-checkbox` and the required validator directive. The component SHALL be available to template references as `kbqCheckbox`.

#### Scenario: Template reference

- **WHEN** a template declares `<kbq-checkbox #box="kbqCheckbox">`
- **THEN** `box` refers to the checkbox component, and `box.toggle()` toggles it
