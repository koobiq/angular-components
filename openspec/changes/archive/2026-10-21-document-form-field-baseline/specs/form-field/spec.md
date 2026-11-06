# Spec Delta

## Purpose

Describes what `kbq-form-field` and the elements that ship with it in `@koobiq/components/form-field` guarantee to consumers: how a control is wrapped, labelled, described by hints and errors, cleared, revealed, stepped, grouped and trimmed, and which state the form field exposes for styling and tests.

## ADDED Requirements

### Requirement: Form field requires a control

A `kbq-form-field` SHALL contain an element that provides a form field control: one of the library's controls (`kbqInput`, `kbqInputPassword`, `kbqTextarea`, `kbq-select`, `kbq-tag-list` and the others) or a custom one. Without it, rendering MUST throw "kbq-form-field must contain a KbqFormFieldControl", also when the control is removed after initialization.

#### Scenario: Plain input without a control directive

- **WHEN** a form field contains only an `<input>` bound to a form control, without `kbqInput`
- **THEN** rendering throws "kbq-form-field must contain a KbqFormFieldControl"

### Requirement: Control type class

When the control declares a control type, the form field SHALL add the class `kbq-form-field-type-<type>` to its host once its content is initialized, for example `kbq-form-field-type-input`, `kbq-form-field-type-input-number` or `kbq-form-field-type-select`.

#### Scenario: Number input

- **WHEN** a form field wraps an `<input kbqNumberInput>`
- **THEN** the form field has the class `kbq-form-field-type-input-number`

### Requirement: Access to the owning form field

Content projected into a form field SHALL be able to inject the owning form field through `KBQ_FORM_FIELD`, and through the legacy `KBQ_FORM_FIELD_REF` of `@koobiq/components/core`. Both MUST resolve to the same form field instance.

#### Scenario: Injecting the form field

- **WHEN** an element inside a form field injects `KBQ_FORM_FIELD` and `KBQ_FORM_FIELD_REF`
- **THEN** both resolve to the enclosing `KbqFormField`

### Requirement: Label for a native control

When a `kbq-label` is projected and the control is a native labelable element, the form field SHALL render it above the control inside a `<label class="kbq-form-field__label">` whose `for` is the control's id and whose id is `<control id>-label`. A click on the label SHALL focus the control. Without a `kbq-label`, no label element SHALL be rendered.

#### Scenario: Label points at the input

- **WHEN** a form field has a `kbq-label` and an `<input kbqInput id="UNIQUE_TEST_ID">`
- **THEN** the rendered `<label>` has `for="UNIQUE_TEST_ID"`

#### Scenario: Clicking the label

- **WHEN** the user clicks the label
- **THEN** the input has focus

### Requirement: Caption for a control that is not labelable

When the control reports that it is not a native labelable element, as `kbq-select` does, the form field SHALL render the `kbq-label` inside a `<span class="kbq-form-field__label">` with the id `<control id>-label` and no `for`, and `labelId` SHALL return that id so the control can reference it through `aria-labelledby`.

#### Scenario: Custom control with a label

- **WHEN** a form field holds a `kbq-label` and a control with the id `TEST_NON_LABELABLE_CONTROL_ID` that is not labelable
- **THEN** the caption is a `<span>` without `for` whose id is `TEST_NON_LABELABLE_CONTROL_ID-label`

### Requirement: Horizontal layout

With `horizontal` set, the form field SHALL get the class `kbq-form-field_horizontal` and place the label beside the control and its hints instead of above them.

#### Scenario: Switching to horizontal

- **WHEN** `horizontal` changes from `false` to `true`
- **THEN** the form field gets the class `kbq-form-field_horizontal`

### Requirement: Label and content classes

`labelClass` SHALL add its classes to the label element, and `contentClass` SHALL add its classes to the `.kbq-form-field__content` wrapper that holds the control and the hint area. Both SHALL accept a string, an array or a `Set` of class names.

#### Scenario: Column widths of a horizontal field

- **WHEN** a form field has `labelClass="test-label"` and `contentClass="test-content"`
- **THEN** the label element has the class `test-label` and the content wrapper has the class `test-content`

### Requirement: Hints below the control

Every `kbq-hint` projected into a form field SHALL be rendered below the control in the hint area (`.kbq-form-field__hint`), whatever the state of the control. The hint area SHALL be rendered only when the form field holds at least one `kbq-hint`, `kbq-error` or `kbq-reactive-password-hint`.

#### Scenario: Hint text

- **WHEN** a form field holds `<kbq-hint>Hint</kbq-hint>`
- **THEN** "Hint" is rendered inside the `.kbq-form-field__hint` area

### Requirement: Hint identity

Every `kbq-hint`, `kbq-error` and `kbq-reactive-password-hint` SHALL have the class `kbq-hint` and an `id`, `kbq-hint-<n>` by default, which an `id` set by the consumer SHALL replace. A `kbq-error` SHALL also have the class `kbq-error`.

#### Scenario: Custom hint id

- **WHEN** a hint is declared as `<kbq-hint id="test-hint-id">`
- **THEN** the hint element has the class `kbq-hint` and the id `test-hint-id`

### Requirement: Compact and plain hints

`compact` SHALL give a hint the class `kbq-hint_compact` and `fillTextOff` the class `kbq-hint_fill-text-off`. On `kbq-hint` both SHALL be off by default; on `kbq-reactive-password-hint`, `fillTextOff` SHALL be on by default.

#### Scenario: Default hint

- **WHEN** a `kbq-hint` is declared without attributes
- **THEN** it has neither `kbq-hint_compact` nor `kbq-hint_fill-text-off`

#### Scenario: Both options set

- **WHEN** a hint is declared as `<kbq-hint compact fillTextOff>`
- **THEN** it has both `kbq-hint_compact` and `kbq-hint_fill-text-off`

### Requirement: Hint color and icon

The `color` input of a hint SHALL be rendered as its class `kbq-<color>`; a `kbq-hint` without a color SHALL have `kbq-empty`, and a `kbq-error` SHALL default to `kbq-error`. An element with `kbq-icon` projected into a `kbq-hint` or `kbq-error` SHALL be rendered before the hint text.

#### Scenario: Success hint with an icon

- **WHEN** a hint is declared as `<kbq-hint color="success"><i kbq-icon="kbq-check-s_16"></i>Saved</kbq-hint>`
- **THEN** the hint has the class `kbq-success` and the icon precedes the text

### Requirement: Error messages follow the control's error state

A `kbq-error` projected into a form field SHALL be rendered in the hint area, before the hints, only while the control is in error state, and SHALL be removed from the DOM otherwise. The form field MUST NOT decide the error state itself; it shows what the control reports.

#### Scenario: Untouched invalid control

- **WHEN** a required input is empty and has not been touched
- **THEN** its `kbq-error` is not in the DOM

#### Scenario: Control becomes valid again

- **WHEN** an error is shown and the control's value becomes valid
- **THEN** the `kbq-error` is removed from the DOM

### Requirement: Default error timing

With the library's controls and no error state matcher configured, a form field SHALL show its errors once the control is invalid and either touched or in a submitted form.

#### Scenario: Leaving an empty required field

- **WHEN** the user focuses an empty required input and leaves it
- **THEN** the `kbq-error` with its text is rendered

### Requirement: Custom error timing

An `errorStateMatcher` bound on the control, or an `ErrorStateMatcher` provided through dependency injection (for example with `kbqErrorStateMatcherProvider`), SHALL decide when the form field shows its errors; the bound matcher SHALL win over the provided one.

#### Scenario: Errors only after submit

- **WHEN** the control uses `ShowOnFormSubmitErrorStateMatcher` and is invalid
- **THEN** no error is shown until the form is submitted, and the error is shown after submission

#### Scenario: Required errors only after submit

- **WHEN** the control uses `ShowRequiredOnSubmitErrorStateMatcher`
- **THEN** a `required` error is shown only after the form is submitted
- **AND** any other error is shown as soon as the control is invalid and touched

#### Scenario: Cross-field error

- **WHEN** controls use `ShowOnCrossFieldErrorStateMatcher` and a group validator reports an error that names two of them
- **THEN** the error is shown on both once both are touched, and on neither while only one is touched
- **AND** a control the error does not name is never shown as invalid because of it

### Requirement: Invalid state of the form field

While the control is in error state, the form field SHALL have the class `kbq-form-field_invalid` and its `invalid` property SHALL return `true`.

#### Scenario: Matcher reports an error on first render

- **WHEN** the control's matcher reports an error state as soon as the control is invalid
- **THEN** the form field has the class `kbq-form-field_invalid` from the first render

### Requirement: Errors are announced

A `kbq-error` SHALL have `role="alert"` and `aria-atomic="true"`, so that assistive technology announces the whole message when the form field inserts it.

#### Scenario: Error appears

- **WHEN** a `kbq-error` is rendered
- **THEN** it has `role="alert"` and `aria-atomic="true"`

### Requirement: Hints and errors describe the control

The form field SHALL write to the control's `aria-describedby` the ids of its `kbq-error` elements while the control is in error state, then of its `kbq-hint` elements, then of its `kbq-reactive-password-hint` elements, and SHALL remove the attribute when there is nothing to reference. It MUST NOT reference an element that is not in the DOM.

#### Scenario: Hint only

- **WHEN** an input that is not in error state has a hint `test-hint-id` and an error `test-error-id`
- **THEN** its `aria-describedby` is `test-hint-id`

#### Scenario: Control becomes invalid

- **WHEN** the input becomes invalid and the error is shown
- **THEN** its `aria-describedby` is `test-error-id test-hint-id`

#### Scenario: Nothing to describe

- **WHEN** a form field has a label but no hint, error or reactive password hint
- **THEN** the control has no `aria-describedby`

### Requirement: Consumer ids in aria-describedby are kept

Ids that the consumer put in the control's `aria-describedby` SHALL be kept when the form field updates the attribute, placed before the ids the form field adds.

#### Scenario: Extra description

- **WHEN** an input declared with `aria-describedby="extra"` has a hint `test-hint-id`
- **THEN** its `aria-describedby` is `extra test-hint-id`

### Requirement: Cleaner visibility

A `kbq-cleaner` that is a direct child of the form field SHALL be rendered at the start of the suffix area only while the control is enabled and not empty, and SHALL be removed from the DOM otherwise.

#### Scenario: Empty field

- **WHEN** a form field with a `kbq-cleaner` wraps an empty input
- **THEN** no cleaner is rendered

#### Scenario: User types a value

- **WHEN** the user types into the input
- **THEN** the cleaner is rendered

#### Scenario: Disabled control

- **WHEN** the input holds a value and is disabled
- **THEN** no cleaner is rendered

### Requirement: Clearing with the cleaner

Activating the cleaner by click, Enter or Space SHALL reset the bound form control, which leaves `null` for a control created without a default value, SHALL move focus to the control, and SHALL prevent the default action of the event and stop its propagation.

#### Scenario: Click

- **WHEN** the input holds "koobiq" and the user clicks the cleaner
- **THEN** the form control's value is `null`

#### Scenario: Enter

- **WHEN** the cleaner has focus and the user presses Enter
- **THEN** the form control's value is `null` and the key's default action is prevented

#### Scenario: Space returns focus to the input

- **WHEN** the cleaner has focus and the user presses Space
- **THEN** the input is empty and has focus

### Requirement: Clearing with Escape

While the control has focus and the cleaner is shown, Escape pressed inside the form field SHALL clear the control as the cleaner does, and the key MUST NOT propagate past the form field. Without a cleaner, or while the control is empty or disabled, Escape SHALL be left to other handlers.

#### Scenario: Escape in a filled field

- **WHEN** the input holds a value, has focus and the user presses Escape
- **THEN** the input is empty and the form control's value is `null`

#### Scenario: Escape in an empty field

- **WHEN** the input is empty, has focus and the user presses Escape
- **THEN** nothing is cleared and the key propagates as usual

### Requirement: Cleaner accessible name

The cleaner SHALL be a focusable button with `role="button"` and `tabindex="0"`. Its `aria-label` SHALL come from its `aria-label` input or, without one, from the `clear` string of the a11y locale ("Очистить" in `ru-RU`, "Clear" in `en-US`). `localeOverrides` SHALL override the locale strings for one cleaner.

#### Scenario: Default name

- **WHEN** the cleaner is shown under the default `ru-RU` locale
- **THEN** it has `role="button"`, `tabindex="0"` and `aria-label="Очистить"`

#### Scenario: Custom name

- **WHEN** the cleaner is declared as `<kbq-cleaner aria-label="Clear search" />`
- **THEN** its `aria-label` is "Clear search"

### Requirement: Cleaner error color

While the control is in error state, the cleaner SHALL have the class `kbq-error`.

#### Scenario: Invalid value

- **WHEN** a form field with a cleaner wraps an input whose value is invalid and shown as an error
- **THEN** the cleaner has the class `kbq-error`

### Requirement: Cleaner refuses number inputs

Projecting a `kbq-cleaner` into a form field whose control is a `kbqNumberInput` SHALL throw "You can't use kbq-cleaner with input that have type=\"number\"".

#### Scenario: Cleaner next to a number input

- **WHEN** a form field holds `<input kbqNumberInput>` and a `kbq-cleaner`
- **THEN** rendering throws that error

### Requirement: Clearing and toggling from code

The `clear(event)` method of `kbq-cleaner` and the `toggle(event)` method of `kbq-password-toggle` SHALL be callable from code, including from a consumer's `effect()`, without making that effect depend on the control's state, so the effect MUST NOT run again when the user types or the control is re-enabled.

#### Scenario: Clearing from an effect

- **WHEN** an effect calls `clear()` on a cleaner and the user then types into the input
- **THEN** the typed value stays and the effect has run once

#### Scenario: Showing the password from an effect

- **WHEN** an effect calls `toggle()` on a password toggle and the control is later disabled and enabled again
- **THEN** the effect has run once

### Requirement: Prefix slot

Elements marked `kbqPrefix` that are direct children of the form field SHALL be rendered before the control inside the field's container, in a `.kbq-form-field__prefix` area that exists only when there is at least one prefix. Each SHALL get the class `kbq-prefix`.

#### Scenario: Search icon

- **WHEN** a form field holds `<span kbqPrefix>Prefix</span>`
- **THEN** the span has the class `kbq-prefix` and is inside `.kbq-form-field__prefix`

### Requirement: Suffix slot

Elements marked `kbqSuffix`, a `kbq-password-toggle` and a `kbq-stepper` SHALL be rendered after the control in a `.kbq-form-field__suffix` area, in the order they are declared and after the cleaner when it is shown. The area SHALL exist only when the form field has a suffix, cleaner, password toggle or stepper. `kbqSuffix` elements SHALL get the class `kbq-suffix`.

#### Scenario: Suffix text

- **WHEN** a form field holds `<span kbqSuffix>Suffix</span>`
- **THEN** the span has the class `kbq-suffix` and is inside `.kbq-form-field__suffix`

### Requirement: Clicking the container

A click anywhere in the field's container (`.kbq-form-field__container`, which holds the prefix, the control and the suffix) SHALL be passed to the control. Text controls such as `kbqInput` SHALL focus themselves in response.

#### Scenario: Click on the prefix icon

- **WHEN** the user clicks a `kbqPrefix` icon of a form field that wraps a `kbqInput`
- **THEN** the input has focus

### Requirement: Focusing the form field

`focus(options?)` SHALL focus the control. While focus is anywhere inside the form field, its host SHALL have the class `cdk-focused` together with the focus-origin class of the CDK (`cdk-keyboard-focused`, `cdk-mouse-focused`, `cdk-touch-focused` or `cdk-program-focused`).

#### Scenario: Focus from code

- **WHEN** `focus()` is called on the form field
- **THEN** the form field has the class `cdk-focused`

#### Scenario: Focusing the input directly

- **WHEN** the input element is focused
- **THEN** the form field has the class `cdk-focused`

### Requirement: Form field without borders

With `noBorders` set, the form field SHALL have the class `kbq-form-field_no-borders`, and SHALL lose it when `noBorders` becomes `false`.

#### Scenario: Turning borders back on

- **WHEN** `noBorders` changes from `true` to `false`
- **THEN** the class `kbq-form-field_no-borders` is removed

### Requirement: Default options

`KBQ_FORM_FIELD_DEFAULT_OPTIONS`, usually provided with `kbqFormFieldDefaultOptionsProvider`, SHALL supply the defaults of `noBorders`, `inOverlay`, `horizontal`, `labelClass` and `contentClass` for every form field in its injector. A value bound on a form field SHALL take precedence over the default.

#### Scenario: No borders by default

- **WHEN** `kbqFormFieldDefaultOptionsProvider({ noBorders: true })` is provided
- **THEN** a form field without `noBorders` has the class `kbq-form-field_no-borders`

#### Scenario: Default classes

- **WHEN** the provider sets `labelClass: 'test-label'` and `contentClass: 'test-content'`
- **THEN** the label element and the content wrapper carry those classes

### Requirement: Autofill state

While the browser reports the control as autofilled, the form field SHALL have the class `kbq-form-field_autofilled` and its `autofilled` property SHALL return `true`, independently of its other states. `kbqInput`, `kbqInputPassword`, `kbqTextarea` and `kbq-tag-list` (for its tag input) SHALL report it; other controls SHALL report `false`.

#### Scenario: Browser fills the input

- **WHEN** the browser fills a `kbqInput` with autofill
- **THEN** the form field has the class `kbq-form-field_autofilled`, and loses it once the fill is undone

#### Scenario: Disabled autofilled field

- **WHEN** an autofilled input is disabled
- **THEN** the form field has both `kbq-form-field_autofilled` and `kbq-disabled`

### Requirement: Disabled form field

While the control is disabled, through its form control or its own `disabled` input, the form field SHALL have the class `kbq-disabled` and its `disabled` property SHALL return `true`.

#### Scenario: Disabling the form control

- **WHEN** the bound form control is disabled
- **THEN** the form field has the class `kbq-disabled`

### Requirement: Form state classes are forwarded

When the control has a form directive, the form field SHALL mirror its Angular state classes on its host: `ng-untouched` or `ng-touched`, `ng-pristine` or `ng-dirty`, `ng-valid` or `ng-invalid`, and `ng-pending`.

#### Scenario: Initial state

- **WHEN** a form field wraps an empty required input that has not been used
- **THEN** the form field has `ng-untouched`, `ng-pristine` and `ng-invalid`

#### Scenario: After the user types

- **WHEN** the user types a value and leaves the input
- **THEN** the form field has `ng-touched`, `ng-dirty` and `ng-valid`

#### Scenario: Pending validation

- **WHEN** the form control is marked as pending
- **THEN** the form field has `ng-pending`

### Requirement: Replaced control

When the projected control is replaced by another one, for example by an `@if`, the `kbq-form-field_invalid`, `kbq-disabled` and forwarded `ng-*` classes SHALL follow the new control.

#### Scenario: Invalid control replaced by a disabled one

- **WHEN** a touched invalid input is replaced by a disabled one
- **THEN** the form field loses `kbq-form-field_invalid` and `ng-invalid` and gets `kbq-disabled`

### Requirement: Form field inside an overlay

With `inOverlay` set, the form field SHALL have the class `kbq-form-field_in-overlay`. `inOverlay` SHALL be a two-way property: writing it from code SHALL update the class and emit `inOverlayChange`.

#### Scenario: Field in a panel

- **WHEN** `inOverlay` changes to `true`
- **THEN** the form field has the class `kbq-form-field_in-overlay`

### Requirement: Form field color class

The form field SHALL render its `color` input as the host class `kbq-<color>`, and SHALL have the class `kbq-empty` while no color is set.

#### Scenario: No color

- **WHEN** a form field is declared without `color`
- **THEN** it has the class `kbq-empty`

### Requirement: Password toggle requires a password input

A `kbq-password-toggle` SHALL be used inside a form field whose control is `kbqInputPassword`. Otherwise it MUST throw "You should use kbq-password-toggle with kbqInputPassword" when it is first rendered.

#### Scenario: Toggle next to a plain input

- **WHEN** a form field holds `<input kbqInput>` and a `kbq-password-toggle`
- **THEN** rendering throws that error

### Requirement: Showing and hiding the password

The password input SHALL start with `type="password"`. A click on the password toggle, or Enter or Space on it, SHALL switch the input between `type="password"` and `type="text"` and prevent the default action of the event.

#### Scenario: Revealing by click

- **WHEN** the password is hidden and the user clicks the toggle
- **THEN** the input has `type="text"`

#### Scenario: Hiding again

- **WHEN** the user clicks the toggle a second time
- **THEN** the input has `type="password"`

#### Scenario: Revealing from the keyboard

- **WHEN** the user presses Enter or Space on the toggle
- **THEN** the input has `type="text"`

### Requirement: Password shortcut

When a form field holds a password toggle, Alt+F8 pressed inside the form field SHALL toggle the password as a click on the toggle does. Without a toggle, Alt+F8 MUST NOT change the input type.

#### Scenario: Alt+F8 in the input

- **WHEN** the password input has focus and the user presses Alt+F8
- **THEN** the input has `type="text"`

#### Scenario: Toggle added later

- **WHEN** Alt+F8 is pressed before a `@if` adds the toggle and again after it
- **THEN** the first press leaves `type="password"` and the second one shows the password

### Requirement: Password toggle accessibility

The toggle SHALL render an icon button with `role="button"`, the `tabindex` of its `tabindex` input (0 by default) and `aria-pressed` that is `true` while the password is shown. Its `aria-label` SHALL name the action from the a11y locale: `showPassword` while hidden, `hidePassword` while shown. `localeOverrides` SHALL override these strings for one toggle.

#### Scenario: Hidden password

- **WHEN** the password is hidden under the default `ru-RU` locale
- **THEN** the button has `aria-pressed="false"` and `aria-label="Показать пароль"`

#### Scenario: Shown password

- **WHEN** the user reveals the password
- **THEN** the button has `aria-pressed="true"` and `aria-label="Скрыть пароль"`

### Requirement: Password toggle icon

The toggle's icon SHALL be `kbq-eye_16` while the password is hidden and `kbq-eye-slash_16` while it is shown, and SHALL take the error color while the control is in error state.

#### Scenario: Icon after revealing

- **WHEN** the user reveals the password
- **THEN** the toggle's icon has the class `kbq-eye-slash_16`

### Requirement: Custom password toggle content

Content projected into `kbq-password-toggle` SHALL replace the built-in icon button; the toggle element itself SHALL still switch the password on click, Enter and Space.

#### Scenario: Text toggle

- **WHEN** a toggle is declared as `<kbq-password-toggle>Show</kbq-password-toggle>`
- **THEN** "Show" is rendered instead of the eye icon and a click on it reveals the password

### Requirement: Password toggle of a disabled control

While the control is disabled, the toggle SHALL be hidden with `visibility: hidden`, the class `cdk-visually-hidden` and `aria-hidden="true"`, and activating it MUST NOT change the input type. While the control is enabled, the toggle SHALL be visible, whether or not the field is empty.

#### Scenario: Disabled control

- **WHEN** the password input is disabled
- **THEN** the toggle has `visibility: hidden`, `cdk-visually-hidden` and `aria-hidden="true"`

#### Scenario: Empty enabled field

- **WHEN** the password input is enabled and empty
- **THEN** the toggle has `visibility: visible` and `aria-hidden="false"`

### Requirement: Password toggle tooltips

On hover, the toggle SHALL show the tooltip given by `kbqTooltipHidden` while the password is hidden and the one given by `kbqTooltipNotHidden` while it is shown. Toggling the password SHALL close a tooltip that is open.

#### Scenario: Hovering a hidden password

- **WHEN** the toggle has `kbqTooltipHidden="Show password"` and the user hovers it while the password is hidden
- **THEN** the tooltip "Show password" appears

### Requirement: Reactive password hint state

A `kbq-reactive-password-hint` SHALL show a cross icon (`kbq-xmark-s_16`) while `hasError` is `true` and a check icon (`kbq-check-s_16`) otherwise. While the form control is untouched and pristine, the hint and its icon SHALL use the `contrast-fade` color; after that, the `error` color while `hasError` is `true` and `success` otherwise.

#### Scenario: Untouched field

- **WHEN** an empty password field fails the rule the hint describes and has not been used
- **THEN** the hint shows the cross icon in the `contrast-fade` color

#### Scenario: Too short password

- **WHEN** the user types a password that still fails the rule
- **THEN** the hint and its icon have the class `kbq-error`

#### Scenario: Rule satisfied

- **WHEN** the user types a password that meets the rule
- **THEN** the hint shows the check icon and has the class `kbq-success`

### Requirement: Reactive password hint follows touched and pristine

The reactive password hint SHALL update its color whenever the control's touched or pristine state changes, also when the value and `hasError` stay the same: on the first edit, on `markAllAsTouched()` and on `reset()`.

#### Scenario: Form submitted untouched

- **WHEN** an empty invalid password control is marked as touched from code
- **THEN** the hint changes from `kbq-contrast-fade` to `kbq-error`

#### Scenario: Form reset

- **WHEN** a touched invalid control is reset to the same empty value
- **THEN** the hint has `kbq-contrast-fade` again

### Requirement: Stepper requires a number input

A `kbq-stepper` SHALL be used inside a form field whose control is `kbqNumberInput`. Otherwise it MUST throw "You should use kbq-stepper with kbqNumberInput" when it is first rendered.

#### Scenario: Stepper next to a text input

- **WHEN** a form field holds `<input kbqInput>` and a `kbq-stepper`
- **THEN** rendering throws that error

### Requirement: Stepping with the mouse

Pressing the mouse button on the up or down arrow of the stepper SHALL change the value once by the input's `step` and emit `stepUp` or `stepDown`. Pressing an arrow MUST NOT move focus.

#### Scenario: One step up

- **WHEN** the number input holds 10 with the default step and the user presses the up arrow
- **THEN** the value is 11 and `stepUp` has fired once

### Requirement: Holding a stepper arrow

Holding the mouse button on an arrow SHALL repeat the step every 75 ms after an initial pause of 300 ms, emitting the output once per step, until the button is released anywhere in the document or the stepper is destroyed.

#### Scenario: Long press

- **WHEN** the user holds the up arrow for 300 ms and then for two more 75 ms intervals
- **THEN** `stepUp` has fired three times

#### Scenario: Release

- **WHEN** the user releases the button after 300 ms
- **THEN** no further step follows

### Requirement: Disabled stepper

While the number input is disabled, the stepper arrows SHALL be disabled, and pressing them MUST NOT change the value.

#### Scenario: Pressing an arrow of a disabled input

- **WHEN** the number input is disabled and the user presses either arrow
- **THEN** the value does not change

### Requirement: Stepper is mouse only

The stepper arrows SHALL be hidden from assistive technology with `aria-hidden="true"` and kept out of the tab order with `tabindex="-1"`; the keyboard interaction stays with the number input.

#### Scenario: Tabbing past the field

- **WHEN** the user tabs through a form field with a stepper
- **THEN** focus lands on the input and never on an arrow

### Requirement: Stepper error color

While the control is in error state, both stepper arrows SHALL have the class `kbq-error`.

#### Scenario: Invalid number

- **WHEN** the number input is in error state
- **THEN** both arrows have the class `kbq-error`

### Requirement: Stepper added later

A stepper rendered after the form field has initialized, for example inside an `@if`, SHALL step the value like one present from the start.

#### Scenario: Stepper shown on demand

- **WHEN** a stepper is added to a form field that holds 10 and the user presses its up arrow
- **THEN** the value is 11

### Requirement: Fieldset group

`kbq-fieldset` SHALL have the class `kbq-fieldset` and `role="group"`, and its `aria-labelledby` SHALL reference the projected `[kbqLegend]` element, following its id and text. Without a legend it MUST NOT set `aria-labelledby`.

#### Scenario: Group with a legend

- **WHEN** a fieldset holds `<legend kbqLegend>Field group title</legend>`
- **THEN** the fieldset has `role="group"` and `aria-labelledby` equal to the legend's id

#### Scenario: Group without a legend

- **WHEN** a fieldset has no `kbqLegend`
- **THEN** it has no `aria-labelledby`

### Requirement: Legend id

An element marked `kbqLegend` SHALL get the class `kbq-legend` and an `id`, `kbq-legend-<n>` by default, which an `id` set by the consumer SHALL replace.

#### Scenario: Custom legend id

- **WHEN** a legend is declared as `<legend id="custom-legend-id" kbqLegend>`
- **THEN** the legend keeps that id and the fieldset's `aria-labelledby` is `custom-legend-id`

### Requirement: Fieldset items

`kbqFieldsetItem` SHALL give the form fields and buttons that make up a fieldset the class `kbq-fieldset-item`.

#### Scenario: Form field in a group

- **WHEN** a form field inside a fieldset is marked `kbqFieldsetItem`
- **THEN** it has the class `kbq-fieldset-item`

### Requirement: Fieldset hints and errors

Projected `kbq-error`, `kbq-hint` and `kbq-reactive-password-hint` elements SHALL be rendered below the group in a `.kbq-form-field__hint` area, errors first. Unlike in a form field, a `kbq-error` SHALL always be rendered: showing it only while a control is invalid is up to the consumer.

#### Scenario: Error without a condition

- **WHEN** a fieldset holds `<kbq-error>Error</kbq-error>`
- **THEN** "Error" is rendered in the fieldset's hint area

### Requirement: Trimming text values

For a `kbqInput` or `kbqTextarea` with a form directive, string values SHALL reach the form model without leading and trailing whitespace, while the text in the control stays as typed. Values that are not strings SHALL pass through unchanged. The element SHALL have the class `kbq-trim`.

#### Scenario: Typing surrounding spaces

- **WHEN** the user types " koobiq " into a `kbqInput` bound to a form control
- **THEN** the form control's value is "koobiq" and the input still shows " koobiq "

#### Scenario: Textarea

- **WHEN** the user types " koobiq " into a `kbqTextarea` bound to a form control
- **THEN** the form control's value is "koobiq"

### Requirement: Opting out of trimming

A static `no-trim` attribute on the control SHALL keep its value as typed. A `kbqInputPassword` MUST NOT be trimmed.

#### Scenario: no-trim attribute

- **WHEN** the user types " koobiq " into `<input kbqInput no-trim>`
- **THEN** the form control's value is " koobiq "

#### Scenario: Password

- **WHEN** the user types " koobiq " into a `kbqInputPassword`
- **THEN** the form control's value is " koobiq "

### Requirement: Where trimming applies

Trimming SHALL apply wherever the trimming directive is imported, which `KbqFormFieldModule`, `KbqInputModule` and `KbqTextareaModule` do. It SHALL also apply through a custom value accessor that the form selects, and SHALL leave the value accessors untouched on an element without a form directive.

#### Scenario: Custom value accessor

- **WHEN** a custom accessor on a `kbqInput` reports " koobiq " to its form control
- **THEN** the form control's value is "koobiq"

#### Scenario: No form directive

- **WHEN** a `kbqInput` with a custom accessor has no form directive and the accessor reports " koobiq "
- **THEN** the change callback receives " koobiq "

### Requirement: Overlay origin

`getConnectedOverlayOrigin()` SHALL return the form field's container (`.kbq-form-field__container`), against which controls such as a select or an autocomplete position and size their panels. When an ancestor provides `KBQ_CONNECTED_OVERLAY_ORIGIN` and it returns an element, that element SHALL be returned instead.

#### Scenario: Select inside an inline edit

- **WHEN** a select in a form field is edited inside a `kbq-inline-edit` that provides the overlay origin
- **THEN** `getConnectedOverlayOrigin()` returns the inline edit's host element

#### Scenario: Plain form field

- **WHEN** no ancestor provides an overlay origin
- **THEN** `getConnectedOverlayOrigin()` returns the `.kbq-form-field__container` element

### Requirement: Custom form field controls

A directive or component that provides `KbqFormFieldControl` SHALL be accepted as the control. The form field SHALL derive its state from the control's `id`, `disabled`, `errorState`, `focused`, `empty`, `ngControl` and the optional `autofilled`, `controlType` and `isNativeLabelSupported`, and SHALL call its `focus` and `onContainerClick`.

#### Scenario: Minimal custom control

- **WHEN** a form field wraps an element whose directive provides `KbqFormFieldControl` and a `kbq-label`
- **THEN** the form field renders without error and labels the control as its members describe

### Requirement: Custom target of aria-describedby

When the control implements `setDescribedByIds`, the form field SHALL pass it the ids of its errors and hints instead of writing `aria-describedby` on the control's host element.

#### Scenario: Control that describes an inner element

- **WHEN** a custom control implements `setDescribedByIds` and the form field holds a hint
- **THEN** the hint's id is passed to `setDescribedByIds` and the control's host gets no `aria-describedby` from the form field
