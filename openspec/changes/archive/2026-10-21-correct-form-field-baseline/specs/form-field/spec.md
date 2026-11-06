# form-field Specification Delta

## MODIFIED Requirements

### Requirement: Clicking the container

A click in the field's container (`.kbq-form-field__container`, which holds the prefix, the control and the suffix) SHALL be passed to the control. Text controls such as `kbqInput` SHALL focus themselves in response. A click that activates the cleaner MUST NOT reach the control: the cleaner stops its propagation and focuses the control itself.

#### Scenario: Click on the prefix icon

- **WHEN** the user clicks a `kbqPrefix` icon of a form field that wraps a `kbqInput`
- **THEN** the input has focus

### Requirement: Stepping with the mouse

Pressing the mouse button on the up or down arrow of the stepper SHALL change the value once by the input's `step`, kept within its `min` and `max`, and emit `stepUp` or `stepDown`. Pressing an arrow of an enabled number input SHALL move focus to that input; the arrow itself MUST NOT take focus.

#### Scenario: One step up

- **WHEN** the number input holds 10 with the default step and the user presses the up arrow
- **THEN** the value is 11 and `stepUp` has fired once
- **AND** the number input has focus

### Requirement: Stepper is mouse only

The stepper arrows SHALL be hidden from assistive technology with `aria-hidden="true"` and kept out of the tab order: with `tabindex="-1"` while the number input is enabled, and with no `tabindex` at all while it is disabled. The keyboard interaction stays with the number input.

#### Scenario: Tabbing past the field

- **WHEN** the user tabs through a form field with a stepper
- **THEN** focus lands on the input and never on an arrow
