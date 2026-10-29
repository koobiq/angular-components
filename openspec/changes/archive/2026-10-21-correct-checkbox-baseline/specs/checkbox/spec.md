## MODIFIED Requirements

### Requirement: Checked state is reflected

The checkbox SHALL be unchecked by default. While `checked` is true, the host SHALL have the `kbq-checked` class, the native `<input type="checkbox">` inside it SHALL be checked, and the input SHALL carry `aria-checked="true"`. While it is false, the class SHALL be absent, the input unchecked and, unless the checkbox is indeterminate, `aria-checked="false"`. When code undoes a click before the next render, the native input keeps the state the click gave it until `checked` changes.

#### Scenario: Binding checked

- **WHEN** `[checked]` changes from `false` to `true`
- **THEN** the host has `kbq-checked` and the native input is checked
- **AND** when it changes back to `false`, the class is removed and the input is unchecked

#### Scenario: Default state

- **WHEN** a checkbox is rendered without `checked`
- **THEN** it is unchecked and its native input has `aria-checked="false"`

#### Scenario: Toggle undone by a change handler

- **WHEN** the user clicks an unchecked checkbox and its `change` handler sets the `checked` property back to `false`
- **THEN** the host has no `kbq-checked` and the native input keeps `aria-checked="false"`
- **AND** the native input itself stays checked

### Requirement: Pointer toggles the checkbox

A click anywhere in the label area of an enabled checkbox — the box, the projected label text or a projected hint — SHALL toggle `checked` unless the click action is `noop`. With the default click action it SHALL also clear `indeterminate`, as described by the click-action requirements.

#### Scenario: Clicking the label text

- **WHEN** the user clicks the label of an unchecked checkbox with the default click action
- **THEN** the checkbox becomes checked
- **AND** a second click makes it unchecked again

### Requirement: Clickable area and cursor

Only the label area SHALL toggle the checkbox and show the `pointer` cursor, while the part of the host outside it SHALL keep the default cursor and a click there MUST NOT toggle the checkbox. The hover style of the box SHALL follow the whole host, so it also shows while the pointer is over the host outside the label area. A disabled checkbox SHALL show the `default` cursor on the host and the label area.

#### Scenario: Cursor on an enabled checkbox

- **WHEN** the pointer is over the label area of an enabled checkbox
- **THEN** the cursor is `pointer`
- **AND** over the host outside the label area it is not `pointer`

#### Scenario: Cursor on a disabled checkbox

- **WHEN** the checkbox is disabled
- **THEN** the host and the label area both show the `default` cursor

#### Scenario: Hover outside the label area

- **WHEN** the host of an enabled checkbox is wider than its label area, as in a stretched flex column, and the pointer is over the part outside the label area
- **THEN** the box shows its hover style
- **AND** a click there leaves `checked` unchanged

### Requirement: Indeterminate state is reflected

While `indeterminate` is true, the host SHALL have the `kbq-indeterminate` class, the native input SHALL be indeterminate and the box SHALL show the mixed mark instead of the check mark. The exception is the native input after a click with the `check` click action: the click clears its indeterminate flag and the checkbox writes it again only once `indeterminate` changes. The input's `aria-checked` SHALL be `mixed` when the checkbox is not checked and `true` when it is also checked.

#### Scenario: Indeterminate and unchecked

- **WHEN** `[indeterminate]` is `true` and `checked` is `false`
- **THEN** the host has `kbq-indeterminate`, the native input is indeterminate and has `aria-checked="mixed"`

#### Scenario: Indeterminate and checked

- **WHEN** `checked` and `indeterminate` are both `true`
- **THEN** the host has both `kbq-checked` and `kbq-indeterminate` and the box shows the mixed mark
- **AND** the native input has `aria-checked="true"`

#### Scenario: Click with the check action

- **WHEN** the click action is `check` and the user clicks an unchecked, indeterminate checkbox
- **THEN** the host keeps `kbq-indeterminate` and the box shows the mixed mark
- **AND** the native input is no longer indeterminate

### Requirement: Indeterminate change notification

The checkbox SHALL emit `indeterminateChange` with the new value whenever `indeterminate` changes, whether through the binding, the property set in code or a click. Through the binding or the property it MUST NOT emit it when the value is set to what it already is, but the clearing after a click emits `false` even when `indeterminate` was already set to `false` before it ran. `[(indeterminate)]` SHALL work as a two-way binding.

#### Scenario: Two-way binding after a click

- **WHEN** a checkbox is bound with `[(indeterminate)]="isIndeterminate"`, `isIndeterminate` is `true` and the user clicks it
- **THEN** `isIndeterminate` becomes `false`

#### Scenario: Change handler clears indeterminate first

- **WHEN** the user clicks an unchecked, indeterminate checkbox with the default click action and its `change` handler sets the `indeterminate` property to `false`
- **THEN** `indeterminateChange` is emitted with `false` twice

### Requirement: Required flag on the native input

The `required` input SHALL default to `false` and SHALL be reflected as the `required` property of the native input. On its own, without a form directive, it MUST NOT add an Angular validator, but the native input still takes part in the browser's constraint validation: while it is enabled and unchecked it is invalid, and a submit button of a `<form>` without `novalidate` does not submit the form.

#### Scenario: Toggling required

- **WHEN** `[required]` changes to `true` and then to `false`
- **THEN** the native input is required and then not required

#### Scenario: Required without a form directive

- **WHEN** `required` is `true`, no form directive is bound and the checkbox is enabled and unchecked
- **THEN** no Angular validator reports an error
- **AND** the native input's `validity.valueMissing` is `true`

### Requirement: Required validation with a form directive

On a `kbq-checkbox` that has `required` together with `formControl`, `formControlName` or `ngModel`, the `KbqCheckboxRequiredValidator` directive SHALL make the control invalid with a `required` error unless the control's value is exactly `true`: invalid while the checkbox is unchecked, valid after a user toggle checks it, and invalid when a truthy non-boolean value written by the form checks it. The directive SHALL apply wherever it is imported, directly or through `KbqCheckboxModule`.

#### Scenario: Required checkbox with ngModel

- **WHEN** a required checkbox bound with `ngModel` is clicked to checked and then clicked to unchecked
- **THEN** the control is valid after the first click and invalid after the second

#### Scenario: Truthy non-boolean value

- **WHEN** the form control of a required checkbox is set to `1`
- **THEN** the checkbox is checked
- **AND** the control is invalid with a `required` error
