# Spec Delta

## Purpose

Describes what the `@koobiq/components/input` entry point guarantees to consumers: how `kbqInput`, `kbqNumberInput`, `kbqInputPassword` and `kbqInputMonospace` behave on a native `<input>`, how their values reach Angular forms, how a number is typed, formatted, pasted and stepped, and what the `min` and `max` validator directives check.

## ADDED Requirements

### Requirement: Module contents

`KbqInputModule` SHALL export `kbqInput`, `kbqNumberInput`, `kbqInputPassword`, `kbqInputMonospace`, the `min` and `max` validator directives and `KbqFormFieldModule`, so that importing it alone is enough to render a control inside `kbq-form-field`.

#### Scenario: Field rendered with the module alone

- **WHEN** a component imports `KbqInputModule` and renders `<kbq-form-field><input kbqInput /></kbq-form-field>`
- **THEN** the form field and the input render without any other import

### Requirement: Host element of the text input

`kbqInput` SHALL apply to an `<input>` that carries `kbqInput` or `kbqNumberInput`, SHALL add the `kbq-input` class to it and SHALL act as the control of the enclosing form field. It is exported as `kbqInput`.

#### Scenario: Number input is also a text input

- **WHEN** an `<input>` carries only `kbqNumberInput` and `KbqInputModule` is imported
- **THEN** the element has the `kbq-input` class
- **AND** the form field uses it as its control

### Requirement: Form field control type

The text input SHALL identify itself to the form field as `input`, or as `input-number` when `kbqNumberInput` is on the same element, and the password input as `input-password`. The form field SHALL add `kbq-form-field-type-<type>` to its host element.

#### Scenario: Number input inside a form field

- **WHEN** a form field holds an `<input kbqNumberInput>`
- **THEN** the form field has the `kbq-form-field-type-input-number` class

### Requirement: Element id

Without an `id` binding, the text input SHALL give the element a unique id that starts with `kbq-input-`. A bound `id` SHALL replace it. The label of the enclosing form field SHALL point at this id.

#### Scenario: Label of the field

- **WHEN** a form field with a `kbq-label` holds an `<input kbqInput>` without an `id`
- **THEN** the element's id starts with `kbq-input-`
- **AND** the label's `for` resolves to that element

### Requirement: Placeholder

The `placeholder` input SHALL be written to the element's `placeholder` attribute, an empty string included. Without it the attribute SHALL be absent.

#### Scenario: Setting and clearing the placeholder

- **WHEN** `placeholder` is bound to `"placeholder"` and then to `""`
- **THEN** the attribute reads `placeholder` and then the empty string

### Requirement: Input type

The `type` input SHALL be applied to the element when the browser supports that type, and SHALL default to `text`.

#### Scenario: Email field

- **WHEN** an `<input kbqInput>` binds `type` to `email`
- **THEN** the element's type is `email`

### Requirement: Unsupported input types

Binding the text input's `type` to `button`, `checkbox`, `file`, `hidden`, `image`, `radio`, `range`, `reset` or `submit` MUST throw the error `Input type "<type>" isn't supported by kbqInput.`

#### Scenario: File type

- **WHEN** an `<input kbqInput>` has `type="file"`
- **THEN** the directive throws `Input type "file" isn't supported by kbqInput.`

### Requirement: Value written to the element

A value bound with `[value]`, or set through the directive's `value` signal, SHALL be written to the element on the next change detection. Such a write goes to the element only: it MUST NOT update a form control bound to the same element.

#### Scenario: Bound value and value set in code

- **WHEN** `[value]` is bound to `"bound"` and later `value.set('set in code')` is called
- **THEN** the element shows `bound` and then `set in code`

#### Scenario: Form control bound to the same element

- **WHEN** a `formControl` is bound and the directive's `value` is set in code
- **THEN** the element shows the new text and the form control keeps its previous value

### Requirement: Value follows the element

The directive's `value` SHALL follow what the user types and any change made to the element by the forms API or by other code, picked up on the next change detection, without writing that value back to the element.

#### Scenario: User types

- **WHEN** the user types `a,b` into the element
- **THEN** the directive's `value` holds the element's value

### Requirement: Custom value accessor

When a `KBQ_INPUT_VALUE_ACCESSOR` is provided on the element, the text and password inputs SHALL read and write the value through it instead of the element. An object value SHALL count as changed only when the element's text changes, and a value read back after the user types MUST NOT be written back.

#### Scenario: Accessor that builds a new array on every read

- **WHEN** the accessor splits the element's text into a new array on every read and the user types `a,b`
- **THEN** `value` holds `['a', 'b']` and the accessor has not been written to
- **AND** setting `value` to `['c']` writes it through the accessor once and the element shows `c`

### Requirement: Empty state

The text and password inputs SHALL report themselves empty to the form field while the element's text is empty and the browser reports no bad input. A text input whose type is `date`, `datetime`, `datetime-local`, `month`, `time` or `week`, and supported by the browser, MUST never report itself empty.

#### Scenario: Cleaner follows the empty state

- **WHEN** a form field holds a `kbq-cleaner` and the user types `test` into an empty input
- **THEN** the cleaner appears
- **AND** after the cleaner is clicked the field is empty, the cleaner is gone and the bound model is `null`

### Requirement: Focused state

The text and password inputs SHALL report themselves focused to the form field between the element's `focus` and `blur` events. `focus()` and a click on the form field's container SHALL focus the element. Disabling the control SHALL reset the focused state.

#### Scenario: Click on the field around the input

- **WHEN** the user clicks the form field's container outside the element
- **THEN** the element has focus

### Requirement: Disabled state

The `disabled` input, or the disabled state of a bound form control, SHALL set the `disabled` attribute on the element and SHALL disable the enclosing form field (`kbq-disabled`). When a form control is bound, its disabled state SHALL take precedence over the `disabled` input.

#### Scenario: Disabling without a form control

- **WHEN** an `<input kbqInput>` without a form control has `disabled` bound to `true`
- **THEN** the element has the `disabled` attribute

#### Scenario: Disabling through ngModel

- **WHEN** an input bound with `ngModel` gets `disabled` set to `true`
- **THEN** the element is disabled and the form field has `kbq-disabled`

### Requirement: Required

The `required` input SHALL set the element's native `required` property. The directive itself adds no validator: with Angular forms the `required` attribute is validated by the forms' own `required` directive.

#### Scenario: Standalone ngModel with required

- **WHEN** an empty input carries `required` and a standalone `ngModel`
- **THEN** the form field has `ng-invalid`

### Requirement: Error state

With a form control bound, the text and password inputs SHALL be in error state when the error state matcher says so: by default when the control is invalid and either touched or its form submitted. The state SHALL be re-evaluated on every change detection. Without a form control the inputs MUST never be in error state.

#### Scenario: Invalid but untouched

- **WHEN** a required control is empty and untouched
- **THEN** the input is not in error state

#### Scenario: Touched or submitted

- **WHEN** the empty required control is marked touched, or its form is submitted
- **THEN** the input is in error state

### Requirement: Error state matcher

The `errorStateMatcher` input SHALL replace the matcher for one input, and `kbqErrorStateMatcherProvider` SHALL replace the default matcher for an injector subtree. The input SHALL call the matcher again on blur.

#### Scenario: Show on submit

- **WHEN** `errorStateMatcher` is a `ShowOnFormSubmitErrorStateMatcher` and the form is submitted with an invalid control
- **THEN** the input is in error state

#### Scenario: Show on dirty

- **WHEN** `errorStateMatcher` is a `ShowOnControlDirtyErrorStateMatcher` and the invalid control is marked dirty
- **THEN** the input is in error state

#### Scenario: Matcher provided through DI

- **WHEN** a matcher that reports an error for untouched controls is provided with `kbqErrorStateMatcherProvider`
- **THEN** the input is in error state until its control is touched

### Requirement: aria-invalid

The element SHALL carry `aria-invalid` set to `"true"` or `"false"` following the error state of the text or password input.

#### Scenario: Error appears

- **WHEN** an invalid control with a `ShowOnControlDirtyErrorStateMatcher` is marked dirty
- **THEN** the element's `aria-invalid` changes from `"false"` to `"true"`

### Requirement: Angular forms integration

The text and password inputs SHALL work with `ngModel`, `formControl` and `formControlName` through Angular's own value accessor, with synchronous and asynchronous validators. A blur MUST NOT run the control's validators again.

#### Scenario: Minimum length

- **WHEN** an input with `minlength="4"` and `ngModel` holds `four` and then is cleared
- **THEN** the form field loses `ng-invalid` and then gets it back

#### Scenario: Blur after an async validation

- **WHEN** an async validator has settled to `VALID` and the input is blurred
- **THEN** the control's status stays `VALID` and no further status is emitted

### Requirement: Autofill state

The text and password inputs SHALL expose `autofilled`, which is `true` while the browser has autofilled the element, and the enclosing form field SHALL get the `kbq-form-field_autofilled` class for that time.

#### Scenario: Browser fills the field

- **WHEN** the browser fills the element with autofill and later the fill is undone
- **THEN** `autofilled` is `true` and the form field has `kbq-form-field_autofilled`
- **AND** both are reset once the fill is undone

### Requirement: Accessible description inside a form field

Inside a `kbq-form-field`, the element's `aria-describedby` SHALL list every `kbq-hint` and every `kbq-reactive-password-hint`, and the `kbq-error` while the error is shown. A template with a label, the control, a hint and an error MUST pass the axe checks.

#### Scenario: Two hints and an error

- **WHEN** a form field with two hints and an error holds an input in error state
- **THEN** `aria-describedby` references both hints and the error, and every id exists in the document

#### Scenario: Password hints

- **WHEN** a form field holds a password input and five password hints
- **THEN** `aria-describedby` references all five hints

### Requirement: Number input keeps a text field

`kbqNumberInput` SHALL keep the element's type `text`. A `type="number"` attribute or binding SHALL be reset to `text`, and in development mode a console warning naming `kbqNumberInput` MUST be logged. A value written by a reactive form when the field is created SHALL still be rendered.

#### Scenario: Native number type

- **WHEN** an `<input kbqNumberInput type="number">` is rendered with a form control holding `12345.5` in `ru-RU`
- **THEN** the element's type is `text`, a warning is logged and the field shows `12 345,5` with a thin space

### Requirement: Spinbutton semantics

The number input SHALL have `role="spinbutton"`, `aria-valuenow` set to its numeric value and `aria-valuetext` set to the formatted text, both absent while the field is empty. `aria-valuemin` and `aria-valuemax` SHALL be set from `min` and `max` only when they are finite.

#### Scenario: Bounded field

- **WHEN** `min` is `-10` and `max` is `10`
- **THEN** the element has `role="spinbutton"`, `aria-valuemin="-10"` and `aria-valuemax="10"`

#### Scenario: Unbounded field

- **WHEN** neither `min` nor `max` is set
- **THEN** the element has no `aria-valuemin` and no `aria-valuemax`

#### Scenario: Value and its text

- **WHEN** the value is `12345` in `ru-RU`
- **THEN** `aria-valuenow` is `12345` and `aria-valuetext` is `12 345` with a thin space
- **AND** after an Up arrow on a value of `5`, `aria-valuenow` is `6`

### Requirement: Input mode

The number input SHALL set `inputmode` to `numeric` while `integer` is set and to `decimal` otherwise.

#### Scenario: Switching to integer mode

- **WHEN** `integer` changes from `false` to `true`
- **THEN** `inputmode` changes from `decimal` to `numeric`

### Requirement: Numeric value

The number input SHALL hold a number or `null` and SHALL pass that number, not the text, to a bound form control or `ngModel`. Typed text SHALL be parsed with the locale's separators.

#### Scenario: Typing a fraction in ru-RU

- **WHEN** the user types `12345,12345` in `ru-RU`
- **THEN** the bound model is the number `12345.12345`

### Requirement: Grouping while typing

After each keystroke the number input SHALL re-render its text in the locale format: the integer part grouped with the locale's group separator, the fraction part kept digit for digit and never grouped. With `withThousandSeparator` set to `false` the integer part MUST NOT be grouped. Grouping is on by default.

#### Scenario: Five digits in ru-RU

- **WHEN** the user types `12345` in `ru-RU`
- **THEN** the field shows `12 345` with a thin space and the value is `12345`

#### Scenario: Fraction part

- **WHEN** the user types `10234,1234` in `ru-RU`
- **THEN** the field shows `10 234,1234` with a thin space in the integer part only

#### Scenario: Grouping turned off

- **WHEN** `withThousandSeparator` is `false` and the value `123456` is written in `ru-RU`
- **THEN** the field shows `123456` without a separator

### Requirement: Grouping threshold

When a `startFormattingFrom` threshold applies — the input, or else the locale's own value, which is `4` in `ru-RU` — the integer part SHALL be grouped only when it is at least 10 to that power. A negative value is never grouped while a threshold applies. Locales without a threshold SHALL group as `Intl.NumberFormat` does.

#### Scenario: Four digits in ru-RU

- **WHEN** the user types `1145` in `ru-RU`
- **THEN** the field shows `1145` without a separator

#### Scenario: Lower threshold

- **WHEN** `startFormattingFrom` is `3` and the value `1234` is written in `ru-RU`
- **THEN** the field shows `1 234` with a thin space

#### Scenario: Negative value in ru-RU

- **WHEN** the value `-12345` is written in `ru-RU`
- **THEN** the field shows `-12345` without a separator

### Requirement: Formatting inputs changed at runtime

Changing `withThousandSeparator` or `startFormattingFrom` after the value is rendered MUST NOT re-render the text already in the field. The new setting SHALL apply from the next keystroke, paste, step or written value.

#### Scenario: Turning grouping off

- **WHEN** the field shows `12 345` and `withThousandSeparator` changes to `false`
- **THEN** the field still shows `12 345` until the value changes

### Requirement: Value commits after the reformat

A keystroke SHALL update the value, the bound form control and `valueChange` only after its deferred reformat has run, and only when the parsed number differs from the current value. A keystroke still pending when the directive is destroyed MUST NOT update the bound form control.

#### Scenario: Field removed while typing

- **WHEN** the user types `42` and the field is removed before the reformat runs
- **THEN** the form control's `valueChanges` does not emit

### Requirement: valueAsNumber reads the live text

`valueAsNumber` SHALL parse the field's current text with the locale's separators at the moment it is read, before any pending reformat, and SHALL return `null` for an empty field, a lone `-` or text that does not parse.

#### Scenario: Read from an input handler

- **WHEN** the user types `42` and `valueAsNumber` is read before the reformat runs
- **THEN** it returns `42`

#### Scenario: Normalized value

- **WHEN** the value `1234.5` is rendered as `1234,5` in `ru-RU`
- **THEN** `valueAsNumber` returns `1234.5`

### Requirement: Fraction separator

The number input SHALL accept the locale's fraction separator and `.` as the fraction separator, SHALL render either as the locale's one, and MUST block a second fraction separator while the text already has one.

#### Scenario: Separator after the integer part

- **WHEN** the user types `123` and then the locale's fraction separator in `ru-RU`
- **THEN** the field shows `123,`

#### Scenario: Second separator

- **WHEN** the field shows `0,12345` and the user presses `,`
- **THEN** the key's default action is prevented and the text is unchanged

### Requirement: Lone minus sign

A lone `-` SHALL stay in the field while the user goes on typing, and the value and the bound form control SHALL keep their previous number until a number follows.

#### Scenario: Starting a negative number

- **WHEN** the field holds `5` and the user replaces it with `-`
- **THEN** the field shows `-` and `valueAsNumber` returns `null`
- **AND** the bound model still holds `5`

### Requirement: Text that does not parse

After a keystroke, text that does not parse as a number SHALL be removed from the field and SHALL set the value to `null`.

#### Scenario: Letters and stray signs

- **WHEN** the field's text becomes `blahblah`, `1..2`, `--1`, `-1-` or `.`
- **THEN** the field is emptied and the bound model is `null`

### Requirement: Keys accepted while typing

The number input SHALL let through digits of the main row and the numpad typed without Shift, the minus, fraction and group separator keys under their own rules, Home, End, Left, Right, Backspace, Delete, Tab, Escape, Enter, F1 to F12, and Ctrl or Cmd with A, C, V, X or Z. It MUST prevent the default action of every other key, a digit typed with Shift included.

#### Scenario: Letter key

- **WHEN** the number input has focus and the user presses `a`
- **THEN** the key's default action is prevented and the text is unchanged

#### Scenario: Shift with a digit

- **WHEN** the user presses Shift+4
- **THEN** the key's default action is prevented

### Requirement: Minus key

The minus key, whether from the main keyboard, the numpad or Firefox's key code, MUST be blocked when `min` is 0 or more, or when the field already contains a minus.

#### Scenario: Non-negative range

- **WHEN** `min` is `0` and the user presses any of the three minus keys
- **THEN** the default action of each is prevented

#### Scenario: Minus already typed

- **WHEN** `min` is `-5`, the field shows `-1` and the user presses a minus key
- **THEN** the key's default action is prevented

### Requirement: Integer mode

With `integer` set, the number input MUST block the fraction separator and the group separator keys, and SHALL truncate a pasted fractional number to its integer part. It MUST NOT round a fractional value written by a form or produced by a fractional `step`.

#### Scenario: Pasting a fraction

- **WHEN** `integer` is set and `1.234.567,89` is pasted in `ru-RU`
- **THEN** the field shows `1 234 567` with thin spaces and the value is `1234567`

### Requirement: Paste

A paste SHALL be parsed as a number written in the active locale or, when that fails, in any shipped locale, and SHALL replace the whole text of the field with that number in the locale format. A paste that does not parse MUST be blocked and leave the field unchanged.

#### Scenario: Number in another locale's format

- **WHEN** `1.234.567,89` and then `10,000,7` are pasted in `ru-RU`
- **THEN** the field shows `1 234 567,89` and then `10 000,7`, with thin spaces

#### Scenario: Text that is not a number

- **WHEN** `text_value` is pasted into a field that shows a number
- **THEN** the paste is prevented and the field keeps its number

#### Scenario: Ambiguous separators

- **WHEN** `1.2.2` or `2,2,2` is pasted in `ru-RU`
- **THEN** the field shows `12,2` or `22,2`

### Requirement: Stepping from the keyboard

Up and Down SHALL add and subtract `step`, which defaults to `1`, and with Shift held they SHALL use `bigStep`, which defaults to `10`. The keys' default action SHALL be prevented, the result SHALL be rendered in the locale format and SHALL be reported like a typed change, and the field SHALL get focus.

#### Scenario: Step and big step

- **WHEN** `step` is `0.5`, `bigStep` is `10` and the user types `10` and presses Up, Shift+Up and Down
- **THEN** the field shows `10,5`, then `20,5`, then `20`

### Requirement: Stepping range

A step SHALL start from `0` when the field is empty, and its result SHALL be clamped to `min` and `max`, also when the value was outside them before the step.

#### Scenario: Empty field without bounds

- **WHEN** the field is empty and the user steps up or down once
- **THEN** the value is `1` or `-1`

#### Scenario: Empty field with a lower bound

- **WHEN** `min` is `3`, `step` is `0.5` and the empty field is stepped up twice
- **THEN** the value is `3` and then `3.5`

#### Scenario: Value above the range

- **WHEN** `max` is `10`, the user types `20` and steps up
- **THEN** the value is `10`

### Requirement: Decimal stepping without drift

The result of a step SHALL be computed in decimal, so that it carries no binary floating-point error.

#### Scenario: Thousandths

- **WHEN** `step` is `0.001`, the value is `1.005` and the user presses Up in `ru-RU`
- **THEN** the value is `1.006` and the field shows `1,006`

### Requirement: Stepping through the form field's stepper

A `kbq-stepper` in the same form field SHALL step the number input up or down by `step`, and MUST NOT change the value while the number input is disabled.

#### Scenario: Stepper with a reactive form

- **WHEN** a `formControl` holds `10` and the user presses the stepper's up arrow
- **THEN** the control holds `11`

#### Scenario: Stepper arrow down

- **WHEN** a `formControl` holds `10` and the user presses the stepper's down arrow
- **THEN** the control holds `9`

#### Scenario: Disabled control

- **WHEN** the bound form control is disabled and the user presses either stepper arrow
- **THEN** the value does not change

### Requirement: Bounds apply only to stepping

`min` and `max` SHALL clamp only the result of a step. A value that is typed, pasted, bound or written by a form outside the range SHALL be kept as it is.

#### Scenario: Typing past the maximum

- **WHEN** `max` is `10` and the user types `20`
- **THEN** the value is `20`

### Requirement: Numeric options of the number input

`min`, `max`, `step` and `bigStep` SHALL accept a number or its string form, from a binding or a static attribute, and SHALL read back as numbers. A missing or non-numeric value SHALL fall back to `-Infinity`, `Infinity`, `1` and `10`. A changed binding SHALL take effect at once.

#### Scenario: Static attributes

- **WHEN** the element has `min="3"`, `max="10"`, `step="0.5"` and `bigStep="2"`
- **THEN** `min()`, `max()`, `step()` and `bigStep()` return `3`, `10`, `0.5` and `2`

#### Scenario: Non-numeric binding

- **WHEN** `step` and `bigStep` are bound to `"5px"`
- **THEN** they read back as `1` and `10`

#### Scenario: Rebinding the maximum

- **WHEN** `max` is rebound from `10` to `40`
- **THEN** `max()` returns `40` and `aria-valuemax` is `40`

### Requirement: Bound value of the number input

A number bound with `[value]` SHALL be rendered in the locale format. Once the binding has a value, `null` or `undefined` SHALL clear the field, set the value to `null` and emit `valueChange` with `null`. A `value` that was never bound MUST NOT override a value written by a form control.

#### Scenario: Rendering a bound number

- **WHEN** `[value]` is bound to `12345.5` in `ru-RU`
- **THEN** the field shows `12 345,5` with a thin space

#### Scenario: Binding becomes undefined

- **WHEN** the bound value changes to `undefined`
- **THEN** the field is empty, `value` is `null` and `valueChange` emits `null`

### Requirement: Value written by a form

A value that a form control or `ngModel` writes into the number input SHALL be rendered in the locale format and SHALL emit `valueChange` when it differs from the current value, and MUST NOT be reported back to the form as a change.

#### Scenario: Model to view

- **WHEN** the bound model is set to `11145` in `ru-RU`
- **THEN** the field shows `11 145` with a thin space

### Requirement: Value and disabled streams

`valueChange` SHALL emit the new value, a number or `null`, after a typed, pasted or stepped change and after a bound or written value. `disabledChange` SHALL emit when the disabled state changes. Both are RxJS `Subject`s that code subscribes to, not template outputs.

#### Scenario: Subscribing to valueChange

- **WHEN** code subscribes to `valueChange` and the bound value is cleared
- **THEN** the subscriber receives `null`

### Requirement: Caret position after a reformat

When a reformat of a value of 1,000 or more inserts or removes one group separator, the caret SHALL move one position so that it stays next to the same digit. Otherwise the caret SHALL stay where the user left it.

#### Scenario: Separator inserted

- **WHEN** the field shows `1234` in `ru-RU` and the user types `5` at the end
- **THEN** the field shows `12 345` and the caret is at position 6

#### Scenario: Separator removed

- **WHEN** the field shows `12 345` and the user deletes the last digit
- **THEN** the field shows `1234` and the caret is at position 4

#### Scenario: No separator involved

- **WHEN** the field shows `12` and the user types `3`
- **THEN** the caret is at position 3

### Requirement: Touched on blur

Blurring the number input SHALL mark its bound form control as touched.

#### Scenario: Focus and blur

- **WHEN** the number input with a `formControl` is focused and blurred
- **THEN** the form field has `ng-touched`

### Requirement: Disabled number input

Disabling the number input, through `disabled` or a bound form control, SHALL blur the element and SHALL make the form field's stepper inactive.

#### Scenario: Disabled through ngModel

- **WHEN** `disabled` is `true` on a number input bound with `ngModel` and the user presses a stepper arrow
- **THEN** the value does not change

### Requirement: No cleaner for the number input

A `kbq-cleaner` in the same form field as a number input MUST throw the error `You can't use kbq-cleaner with input that have type="number"`.

#### Scenario: Cleaner next to a number input

- **WHEN** a form field holds an `<input kbqNumberInput>` and a `kbq-cleaner`
- **THEN** rendering it throws that error

### Requirement: Min and max validators

When an element has `min` or `max` and a `formControl`, `formControlName` or `ngModel`, the validator directives SHALL install Angular's `min` or `max` validator with the bound coerced to a number, fractions kept. A value out of range SHALL produce `{ min: { min, actual } }` or `{ max: { max, actual } }`.

#### Scenario: Fractional lower bound

- **WHEN** `min` is `0.5` and the control's value is set to `0.2`
- **THEN** the control's errors are `{ min: { min: 0.5, actual: 0.2 } }`
- **AND** a value of `0.7` has no `min` error

#### Scenario: Fractional upper bound

- **WHEN** `max` is `9.5` and the control's value is set to `9.7`
- **THEN** the control's errors are `{ max: { max: 9.5, actual: 9.7 } }`

### Requirement: Validator bounds in the DOM

The validator directives SHALL mirror the coerced bound into the element's `min` or `max` attribute, `0` included. A missing or non-numeric bound SHALL remove the attribute and install no validator.

#### Scenario: Zero bounds

- **WHEN** `min` and `max` are both bound to `0`
- **THEN** the element has `min="0"` and `max="0"`

#### Scenario: Non-numeric bound

- **WHEN** `min` and `max` are bound to `"5px"`
- **THEN** the element has no `min` and no `max` attribute
- **AND** any value of the control passes these validators

### Requirement: Validators follow the bound

When a bound of a validator directive changes, the validator SHALL be rebuilt and the control SHALL be validated again.

#### Scenario: Lowering the minimum

- **WHEN** the value is `0.4` with `min` `0.5` and `min` is rebound to `0.1`
- **THEN** the control loses its `min` error

### Requirement: Separators follow the locale

The number input SHALL take its separators from the `input.number` section of the active locale, or of `ru-RU` when the application provides no locale service. The `ru-RU`, `es-LA` and `tk-TM` locales group with a thin space and use `,` for fractions; `en-US` uses `,` and `.`; `pt-BR` uses `.` and `,`.

#### Scenario: English locale

- **WHEN** the active locale is `en-US` and the value is `99999.999`
- **THEN** the field shows `99,999.999`

### Requirement: Locale switch

When the active locale changes, the number input SHALL re-render its current value with the new locale's separators, and MUST NOT change the value.

#### Scenario: From ru-RU to en-US

- **WHEN** the field shows `99 999,999` in `ru-RU` and the locale switches to `en-US`
- **THEN** the field shows `99,999.999` and the value is still `99999.999`

### Requirement: Rendering for es-LA

Because `es-LA` is not a valid BCP-47 tag, the number input SHALL render `es-LA` numbers with the number formatting data of the default locale.

#### Scenario: Same rendering as ru-RU

- **WHEN** the value `1234567.89` is rendered in `es-LA` and in `ru-RU`
- **THEN** both fields show the same text

### Requirement: Overriding the number locale

`kbqInputLocaleConfigurationProvider` SHALL override only the given keys of the `input` locale section for its injector subtree, and `[localeOverrides]` on a number input SHALL do the same for that field; the keys left out keep following the active locale. `KBQ_INPUT_DEFAULT_LOCALE_CONFIGURATION` SHALL hold the `ru-RU` defaults.

#### Scenario: Dot as the fraction separator

- **WHEN** `kbqInputLocaleConfigurationProvider({ number: { fractionSeparator: '.' } })` is provided and the value `1234.5` is written in `ru-RU`
- **THEN** the field shows `1234.5`

### Requirement: Monospace input

`kbqInputMonospace` on an `<input>` SHALL add the `kbq-input_monospace` class, which switches a `kbqInput` to the monospace type level. It is exported as `kbqInputMonospace` and as `KbqInputMonospace`.

#### Scenario: Monospace text input

- **WHEN** an `<input>` carries `kbqInput` and `kbqInputMonospace`
- **THEN** it has the `kbq-input_monospace` class

### Requirement: Password input element

`kbqInputPassword` SHALL add the `kbq-input` and `kbq-input-password` classes, SHALL act as the control of the enclosing form field and SHALL give the element a unique id that starts with `kbq-input-password-` unless `id` is bound. It is exported as `kbqInputPassword`.

#### Scenario: Login form with both inputs

- **WHEN** a page holds an `<input kbqInput>` and an `<input kbqInputPassword>`
- **THEN** their ids start with `kbq-input-` and `kbq-input-password-` and differ
- **AND** each form field's label points at its own control

### Requirement: Password input shares the text input contract

The password input SHALL handle `placeholder`, `disabled`, `required`, `[value]`, the `value` signal, the custom value accessor, the empty, focused and autofilled states, the error state matcher and `aria-invalid` as the text input does. It has no `type` input and no never-empty types.

#### Scenario: Error after typing

- **WHEN** a password control with `maxLength(5)` gets `123456` typed and is blurred
- **THEN** the control has a `maxlength` error and the element's `aria-invalid` is `"true"`

### Requirement: Password visibility

The password input SHALL render the element with `type="password"`, overwriting any `type` attribute. `toggleType()` SHALL switch the type between `password` and `text`, and `elementType` SHALL report the current one.

#### Scenario: Toggling with the form field's password toggle

- **WHEN** the user clicks the `kbq-password-toggle` of the form field twice
- **THEN** the element's type is `text` after the first click and `password` after the second
