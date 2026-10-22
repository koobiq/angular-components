## MODIFIED Requirements

### Requirement: isOpenedChange reports changes made by the component

`isOpenedChange` SHALL emit the new state synchronously whenever the component changes it itself: through the collapsed button, the close button, Escape, `toggle()`, or expanding from a model value, an initial one included. It MUST NOT emit for a change made through the `isOpened` input or property, nor on a first render that starts collapsed or is expanded by `[isOpened]`.

#### Scenario: Auto-expand from a model value

- **WHEN** a collapsed component's bound control is set to `seed`
- **THEN** `isOpenedChange` emits `true`

#### Scenario: State set through the input

- **WHEN** the parent changes `[isOpened]` from `false` to `true`
- **THEN** the field expands and `isOpenedChange` does not emit

#### Scenario: Initial value of a form control

- **WHEN** the component first renders bound to a form control that already holds `seed`
- **THEN** `isOpenedChange` emits `true` once, during that first change detection

### Requirement: Expanding moves focus into the input

When the field of an enabled component expands after the first render through the collapsed button, `toggle()` or the `isOpened` input, focus SHALL move to the input. While the component is disabled, an expansion through the `isOpened` input MUST leave its disabled input unfocused. A field that is already expanded on the first render MUST NOT take focus. Expanding from a model value follows its own rule.

#### Scenario: Expanded by a click

- **WHEN** the user clicks the collapsed button
- **THEN** the input has focus

#### Scenario: Expanded on the first render

- **WHEN** the component renders with `[isOpened]="true"`
- **THEN** focus is not moved into its input

#### Scenario: Expanded through the binding while disabled

- **WHEN** the component is disabled and `[isOpened]` changes to `true`
- **THEN** the field expands and its input does not have focus

### Requirement: Collapsing moves focus to the collapsed button

Whenever the field of an enabled component collapses, by any path, focus SHALL move to the collapsed button, and the button's tooltip MUST NOT open on the way. The focus carries the origin of the last focus inside the component while focus is still inside it; once focus has left the component, no origin is passed and the CDK `FocusMonitor` attributes the focus itself. A disabled field collapsed through `[isOpened]` renders a disabled button, which MUST NOT take focus.

#### Scenario: Collapsed with Escape

- **WHEN** the user expands the field, types, and presses Escape
- **THEN** the input is removed and the collapsed button has focus

#### Scenario: Collapsed from outside

- **WHEN** the field is expanded and another control on the page calls `toggle()`
- **THEN** focus moves to the collapsed button

#### Scenario: Disabled field collapsed through the binding

- **WHEN** a disabled, expanded field is collapsed through `[isOpened]`
- **THEN** the collapsed button is rendered disabled and does not have focus

### Requirement: A model value expands the field

When a non-empty value is written to the bound control while the component is collapsed and enabled, it SHALL expand and emit `isOpenedChange` with `true`. Focus SHALL move into the input only when focus was already inside the component. Writing an empty value MUST NOT collapse the field, and a component disabled at the write MUST NOT expand. A reactive form directive writes its first value before the disabled state, so that value expands a field whose control starts disabled.

#### Scenario: Initial model value

- **WHEN** the component renders bound to an `ngModel` or a form control that holds `seed`
- **THEN** the field is expanded and no collapsed button is rendered
- **AND** focus is not moved into the input

#### Scenario: Value set later while collapsed

- **WHEN** the component is collapsed and code sets the bound control to `later`
- **THEN** the field expands

#### Scenario: Focus already inside the component

- **WHEN** focus is on the collapsed button and the bound control is set to `seed`
- **THEN** the field expands and the input has focus

#### Scenario: Value cleared

- **WHEN** the field was expanded by a model value and the control is then set to `''`
- **THEN** the field stays expanded

#### Scenario: Disabled control

- **WHEN** the bound control is disabled and then set to `seed`
- **THEN** the field stays collapsed

#### Scenario: Control disabled from the start

- **WHEN** the component renders bound through `[formControl]` to a control created as `{ value: 'seed', disabled: true }`, or to an enabled control holding `seed` with `[disabled]="true"`
- **THEN** the field is expanded with a disabled input

### Requirement: The value signal mirrors the field

The public writable signal `value` SHALL hold the current text of the field. A write into it SHALL reach the field when the component's effects next run, at the next change detection rather than at once, and from there the bound control the way typing does. A write MUST NOT expand a collapsed field.

#### Scenario: Write into value

- **WHEN** the field is expanded and code sets `value` to `written`
- **THEN** after the next change detection the input shows `written` while the bound control keeps `''`
- **AND** the bound control holds `written` `emitValueTimeout` after that change detection

#### Scenario: Write into value while collapsed

- **WHEN** the component is collapsed and code sets `value` to `written`
- **THEN** the field stays collapsed

### Requirement: Error state follows the bound control

The expanded field SHALL show the error state of the bound control, as decided by the `ErrorStateMatcher` provided in DI; by default an invalid control shows it once touched or once its form is submitted. It is re-evaluated only when the component's view is checked, as after the blur of its input, so a submit or `markAsTouched()` from outside shows it only at the next check. In the error state the form field SHALL carry `kbq-form-field_invalid` and the input SHALL have `aria-invalid="true"`.

#### Scenario: Invalid but untouched

- **WHEN** the bound control has a failing `Validators.required` and is untouched
- **THEN** the form field has no `kbq-form-field_invalid` and the input has `aria-invalid="false"`

#### Scenario: Invalid and touched

- **WHEN** the input then loses focus
- **THEN** the form field has `kbq-form-field_invalid` and the input has `aria-invalid="true"`

#### Scenario: Form submitted from outside

- **WHEN** the bound control has a failing `Validators.required`, is untouched, and its form is submitted by a button outside the component while focus never entered the input
- **THEN** the form field has no `kbq-form-field_invalid` until an event inside the component, such as a blur of its input, checks its view again
