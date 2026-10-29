# textarea Specification

## Purpose

Describes what the `kbqTextarea` directive from `@koobiq/components/textarea` guarantees to consumers: how a native textarea grows with its content or becomes resizable, how its value and its disabled, required and error states reach Angular forms and `kbq-form-field`, and what it exposes to assistive technology.

## Requirements

### Requirement: Directive on a native textarea

The directive SHALL apply to `<textarea>` elements carrying the `kbqTextarea` attribute and to no other element. It SHALL be exported as `kbqTextarea` for template references and SHALL put the `kbq-textarea` and `kbq-native-scrollbar` classes on its host, so the element gets the library's scrollbar styling.

#### Scenario: Marking up a textarea

- **WHEN** a template renders `<textarea kbqTextarea #area="kbqTextarea"></textarea>`
- **THEN** the element has the classes `kbq-textarea` and `kbq-native-scrollbar`
- **AND** `area` refers to the directive instance

### Requirement: Module re-exports the form field

`KbqTextareaModule` SHALL export the directive together with everything `KbqFormFieldModule` exports, so a template that imports only `KbqTextareaModule` can use `kbq-form-field`, `kbq-label`, `kbq-hint` and `kbq-error` around the textarea. It MUST NOT re-export Angular's `FormsModule`.

#### Scenario: Form field from the textarea module

- **WHEN** a standalone component imports `KbqTextareaModule` and `FormsModule` only
- **AND** its template wraps `<textarea kbqTextarea [(ngModel)]="value">` in `kbq-form-field`
- **THEN** the template compiles and the form field renders around the textarea

### Requirement: Form field control type

Inside a `kbq-form-field`, the textarea SHALL act as the field's control and SHALL report the control type `textarea`, so the form field carries the class `kbq-form-field-type-textarea`.

#### Scenario: Form field class

- **WHEN** a textarea is rendered inside `kbq-form-field`
- **THEN** the form field element has the class `kbq-form-field-type-textarea`

### Requirement: Container click focuses the textarea

A click on the container of the enclosing `kbq-form-field` SHALL move focus to the textarea.

#### Scenario: Click on the field padding

- **WHEN** the user clicks inside the form field container but outside the textarea element
- **THEN** the textarea receives focus

### Requirement: Height grows with the content by default

`canGrow` SHALL default to `true`. While it is `true`, the textarea SHALL size its height to its content, growing when lines are added and shrinking when they are removed, but never below the height of the element's `rows` (two by default) plus the free space below the last line, and SHALL show neither a resize handle nor a vertical scrollbar. A multi-line initial value SHALL be reflected in the first rendered height.

#### Scenario: Initial multi-line value

- **WHEN** a textarea without `canGrow` set is rendered with a three-line value
- **THEN** it is rendered taller than a single line

#### Scenario: Content gets longer

- **WHEN** the user replaces a two-line value with a six-line value
- **THEN** the textarea becomes taller

#### Scenario: Content gets shorter

- **WHEN** the user replaces a six-line value with a two-line value
- **THEN** the textarea becomes shorter

### Requirement: Free space below the last line

While the textarea grows, its height SHALL leave `freeRowsHeight` pixels below the content, which defaults to one measured line height. Content shorter than the element's `rows` (two by default) is measured as that many rows, so a single line is followed by one empty line and then `freeRowsHeight`. Below the row limit, the height MUST NOT drop below one line plus the vertical padding. A missing, empty or non-numeric `freeRowsHeight` SHALL read as `undefined` and fall back to the default.

#### Scenario: Default free row

- **WHEN** a growing textarea holds three lines and `freeRowsHeight` is not set
- **THEN** its height leaves room for one empty line below the third line

#### Scenario: Valueless attribute

- **WHEN** a textarea is written as `<textarea kbqTextarea freeRowsHeight>`
- **THEN** `freeRowsHeight()` returns `undefined` rather than `NaN`

### Requirement: Height is measured after each change renders

While `canGrow` is `true`, the textarea SHALL measure its height again after the value changes, whether typed, written by a form or set in code, and after `canGrow` is switched on or `maxRows` or `freeRowsHeight` change. No measurement runs while `canGrow` is `false`, including right after it is switched off. The measurement SHALL run once the change is rendered, not synchronously with it, and SHALL run once per typed change.

#### Scenario: One measurement per input event

- **WHEN** the user's input changes the value of a growing textarea and change detection runs
- **THEN** the height is measured once, after the update is rendered

#### Scenario: Value set in code

- **WHEN** the bound model value of a growing textarea changes from one line to five lines
- **THEN** the textarea grows to fit the five lines after the change is rendered

### Requirement: Re-measuring inside a tab group

When the textarea is declared in the same template as an enclosing `kbq-tab-group`, it SHALL measure its line height and height again each time the tab group finishes its body animation.

#### Scenario: Tab body animation ends

- **WHEN** a textarea is placed in a `kbq-tab` of a `kbq-tab-group` in the same template
- **AND** the tab group finishes its body animation
- **THEN** the textarea re-measures once

### Requirement: Pending measurements end with the textarea

Destroying the textarea MUST NOT throw from a measurement that was scheduled before it was destroyed.

#### Scenario: Removed right after creation

- **WHEN** a textarea is rendered and removed by an `@if` before its first measurement runs
- **AND** the pending timers and promise callbacks run
- **THEN** no error is thrown and the element is no longer in the DOM

### Requirement: Resizable mode

With `canGrow` set to `false`, the textarea SHALL stop sizing itself and SHALL carry the class `kbq-textarea-resizable`. Rendered with `canGrow` set to `false`, it SHALL let the user resize it vertically and scroll its content; switched off after growing, it keeps the minimum height and row limit state of its last measurement, and a reached limit hides the resize handle. `canGrow` SHALL accept boolean attributes: a valueless `canGrow` reads as `true`, and `canGrow="false"` as `false`.

#### Scenario: Growth switched off

- **WHEN** a textarea is rendered with `[canGrow]="false"`
- **THEN** it has the class `kbq-textarea-resizable`
- **AND** it shows a vertical resize handle

#### Scenario: Valueless attribute

- **WHEN** a textarea is written as `<textarea kbqTextarea canGrow>`
- **THEN** `canGrow()` returns `true` and the textarea has no `kbq-textarea-resizable` class

#### Scenario: Default

- **WHEN** `canGrow` is not set
- **THEN** the textarea has no `kbq-textarea-resizable` class

### Requirement: Row limit caps the height

While the textarea grows and `maxRows` is set, once the measured rows, which count the vertical padding and the free space below the last line, exceed `maxRows`, the textarea SHALL stop growing, SHALL fix its minimum height to `maxRows` times the line height, and SHALL scroll its content. Adding more lines past that point MUST NOT change its height. Without `maxRows`, growth is unlimited.

#### Scenario: Content past the limit

- **WHEN** a growing textarea has `[maxRows]="3"`, a line height of 20 px and content taller than three rows
- **THEN** its minimum height is `60px`

#### Scenario: More lines after the limit

- **WHEN** a textarea with `[maxRows]="5"` holds five lines and the user pastes ten lines
- **THEN** its height stays the same

#### Scenario: Growing up to the limit

- **WHEN** a textarea with `[maxRows]="5"` holds three lines and the user pastes ten lines
- **THEN** it becomes taller than it was with three lines

### Requirement: Row limit state

While the row limit is reached, `maxRowLimitReached()` SHALL return `true` and the host SHALL carry the class `kbq-textarea_max-row-limit-reached` as well as `kbq-textarea-resizable`, without showing a resize handle. `canGrow()` SHALL keep returning the bound value. When the content shrinks back below the limit, the textarea SHALL resume growing and drop both classes.

#### Scenario: Limit reached

- **WHEN** the content of a textarea with `[canGrow]="true"` and `[maxRows]="3"` exceeds three rows
- **THEN** `maxRowLimitReached()` returns `true` and the host has the class `kbq-textarea_max-row-limit-reached`
- **AND** `canGrow()` still returns `true`

#### Scenario: Below the limit

- **WHEN** a textarea with `[maxRows]="3"` holds two short lines
- **THEN** the host has no `kbq-textarea_max-row-limit-reached` class

#### Scenario: Content shrinks below the limit

- **WHEN** the limit was reached and the user deletes lines until the content fits again
- **THEN** both classes are removed and the textarea sizes itself to the content again

### Requirement: Row limit applies only while growing

A textarea rendered with `canGrow` set to `false` SHALL never report the row limit as reached, whatever its content and `maxRows`, and SHALL leave its height to the user. `maxRows` and `freeRowsHeight` SHALL read as `undefined` when unbound or given a missing, empty or non-numeric value.

#### Scenario: Unbound sizing inputs

- **WHEN** a textarea is rendered without `maxRows` and `freeRowsHeight`
- **THEN** both return `undefined` and `maxRowLimitReached()` returns `false`

#### Scenario: Row limit on a resizable textarea

- **WHEN** a textarea has `[canGrow]="false"` and `[maxRows]="2"` and holds ten lines
- **THEN** `maxRowLimitReached()` returns `false` and the host has no `kbq-textarea_max-row-limit-reached` class

### Requirement: Disabled input

The `disabled` input SHALL set the native `disabled` property of the textarea, and the enclosing `kbq-form-field` SHALL carry the class `kbq-disabled` while the textarea is disabled.

#### Scenario: Disabling the textarea

- **WHEN** `disabled` changes from `false` to `true`
- **THEN** the textarea element is disabled
- **AND** the form field has the class `kbq-disabled`

### Requirement: Form control disabled state wins

When a form directive (`ngModel`, `formControl`, `formControlName`) is bound to the textarea, the control's disabled state SHALL decide whether the textarea is disabled, and the textarea's own `disabled` input SHALL be ignored once the directive has its control: from the first change detection with `ngModel` and `formControl`, and with `formControlName` possibly only from the second one. With `ngModel`, the same `disabled` binding still reaches the control through `NgModel`.

#### Scenario: Reactive control disabled in code

- **WHEN** a textarea is bound with `[formControl]` and the control's `disable()` is called
- **THEN** the textarea element is disabled after the next change detection

### Requirement: Disabling clears focus

When the textarea becomes disabled, `focused()` SHALL return `false`, even if the browser does not fire a `blur` event.

#### Scenario: Disabled while focused

- **WHEN** the textarea has focus and becomes disabled
- **THEN** `focused()` returns `false`

### Requirement: Value follows the element

`value` SHALL follow what the element holds: every `input` event and every change detection SHALL read the element's value back, so typing and values written by Angular forms, including writes with `emitEvent: false`, are reflected. `empty()` SHALL return `true` while the element holds no text.

#### Scenario: Typing

- **WHEN** the user's input changes the element's text to `changed value`
- **THEN** `value()` returns `changed value` right after the `input` event

#### Scenario: Value written by a form

- **WHEN** a bound `FormControl` is set to `text` with `emitEvent: false` and change detection runs
- **THEN** `value()` returns `text` and `empty()` returns `false`

### Requirement: Value set in code is written to the element

A value given through the `value` input or set with `value.set()` SHALL be written to the element on the next change detection. A value the element already holds MUST NOT be written back to it.

#### Scenario: Setting the value in code

- **WHEN** code calls `value.set('c')` and change detection runs
- **THEN** the element shows `c`

#### Scenario: Binding the value

- **WHEN** a template binds `[value]="text"` and `text` changes
- **THEN** the element shows the new `text`

### Requirement: Custom value accessor

A directive on the same element that provides `KBQ_TEXTAREA_VALUE_ACCESSOR` SHALL replace the element as the source and target of `value`. When the accessor returns a new object on every read, the textarea SHALL treat the value as changed only when the element's text changes, and SHALL settle without writing the value back.

#### Scenario: Accessor that builds a new array on every read

- **WHEN** a custom accessor returns the element's lines as a new array on every read
- **AND** the user types `a`, a line break and `b`
- **THEN** `value()` returns `['a', 'b']` and the accessor has not been written to

#### Scenario: Writing through the accessor

- **WHEN** code sets `value` to `['c']`
- **THEN** the accessor is written once and the element shows `c`

### Requirement: Model value is trimmed

When `KbqTextareaModule` or `KbqFormFieldModule` is imported and a form directive is bound to the textarea, the value that reaches the form model SHALL have leading and trailing whitespace removed, while the element keeps the text as typed. The `no-trim` attribute on the textarea SHALL turn trimming off.

#### Scenario: Typing with surrounding spaces

- **WHEN** the user types `  koobiq  ` into a textarea bound with `[formControl]`
- **THEN** the control's value is `koobiq`
- **AND** the element still shows `  koobiq  `

#### Scenario: Trimming turned off

- **WHEN** the textarea has the `no-trim` attribute and the user types `  koobiq  `
- **THEN** the control's value is `  koobiq  `

### Requirement: Required state

The `required` input SHALL set the native `required` property of the textarea. The textarea MUST NOT add a validator of its own: with `required` written next to `ngModel`, `formControl` or `formControlName`, validation comes from Angular's `RequiredValidator`.

#### Scenario: Required with ngModel

- **WHEN** a textarea has `required` and `[(ngModel)]` bound to an empty string, outside a `<form>`
- **THEN** the form field carries the class `ng-invalid`
- **AND** the textarea element has the `required` attribute

### Requirement: Error state follows the default matcher

The textarea SHALL be in the error state when its form control is invalid and either touched or its parent form submitted, re-evaluated on every change detection. A textarea without a form directive SHALL never be in the error state.

#### Scenario: Invalid but untouched

- **WHEN** a required control is empty and untouched
- **THEN** `errorState()` returns `false`

#### Scenario: Invalid and touched

- **WHEN** the empty required control is marked as touched, or the textarea loses focus
- **THEN** `errorState()` returns `true`

#### Scenario: Form submitted

- **WHEN** the parent form is submitted while the control is invalid
- **THEN** `errorState()` returns `true`

### Requirement: Custom error state matcher

The `errorStateMatcher` input SHALL replace the default matcher for one textarea, and `kbqErrorStateMatcherProvider` SHALL replace it for every textarea under that injector. The input SHALL take precedence over the provider.

#### Scenario: Show on submit

- **WHEN** `errorStateMatcher` is a `ShowOnFormSubmitErrorStateMatcher` and the invalid control is touched or blurred
- **THEN** `errorState()` stays `false` until the form is submitted

#### Scenario: Show on dirty

- **WHEN** `errorStateMatcher` is a `ShowOnControlDirtyErrorStateMatcher`
- **THEN** `errorState()` is `false` while the invalid control is pristine, even after a blur, and `true` once it is dirty

#### Scenario: Matcher from the injector

- **WHEN** a component provides `kbqErrorStateMatcherProvider` with a matcher that reports untouched controls as errors
- **THEN** a textarea in it is in the error state until its control is touched

### Requirement: Error state is exposed

The textarea SHALL set `aria-invalid` to `true` while in the error state and to `false` otherwise, and the enclosing `kbq-form-field` SHALL carry the class `kbq-form-field_invalid` and render its `kbq-error` only while the textarea is in the error state.

#### Scenario: Touched invalid textarea

- **WHEN** a textarea in a form field with `kbq-hint` and `kbq-error` enters the error state
- **THEN** the textarea has `aria-invalid="true"`
- **AND** the form field has the class `kbq-form-field_invalid` and shows the error

#### Scenario: Valid textarea

- **WHEN** the textarea is not in the error state
- **THEN** it has `aria-invalid="false"` and the form field renders no `kbq-error`

### Requirement: Losing focus does not re-validate

The textarea's own handling of a blur SHALL only update its focus state. It MUST NOT re-run the control's validators or emit on its `statusChanges`; what Angular forms do on blur, such as `updateOn: 'blur'`, is unaffected.

#### Scenario: Blur after async validation

- **WHEN** a control with the default `updateOn: 'change'` and an async validator has settled as `VALID`
- **AND** the textarea loses focus
- **THEN** `statusChanges` emits nothing more and the status stays `VALID`

### Requirement: Placeholder

The textarea SHALL write the `placeholder` input to the element's `placeholder` attribute, SHALL leave the attribute out while the input is unset, and SHALL keep an empty string as an empty attribute.

#### Scenario: Placeholder changes

- **WHEN** `placeholder` is unset, then `placeholder`, then an empty string
- **THEN** the attribute is absent, then `placeholder`, then empty

### Requirement: Id and label

The textarea SHALL write its id to the element: the `id` input when given, otherwise a generated id unique per instance that starts with `kbq-textarea-`. A `kbq-label` in the enclosing form field SHALL render as a `<label>` whose `for` points at that id.

#### Scenario: Generated id

- **WHEN** two `kbqTextarea` elements are rendered without `id`
- **THEN** each element has a distinct id starting with `kbq-textarea-`

#### Scenario: Label association

- **WHEN** a textarea with `id="comment"` is inside a form field with `kbq-label`
- **THEN** the form field renders `<label for="comment">`

### Requirement: Hints and errors describe the textarea

The enclosing `kbq-form-field` SHALL list the ids of its `kbq-hint` elements, and of its `kbq-error` while the textarea is in the error state, in the textarea's `aria-describedby`, keeping ids the consumer set on the element.

#### Scenario: Hint

- **WHEN** a textarea is in a form field with a `kbq-hint`
- **THEN** the textarea's `aria-describedby` contains the hint's id

### Requirement: Focus

`focus()` SHALL move focus to the textarea element. `focused()` SHALL return `true` from the element's `focus` event until its `blur` event.

#### Scenario: Focus in code

- **WHEN** code calls `focus()` on an enabled textarea
- **THEN** the element holds focus and `focused()` returns `true`

#### Scenario: Blur

- **WHEN** the focused textarea loses focus
- **THEN** `focused()` returns `false`

### Requirement: Focusing does not scroll

Focusing a textarea that is already in view MUST NOT scroll the page and MUST NOT scroll the textarea's own content. A textarea out of view is scrolled into view by the browser when it gets focus: `focus()` takes no options, so the `preventScroll` that `KbqFormField.focus()` passes on is dropped.

#### Scenario: Click on a long textarea in view

- **WHEN** a growing textarea with a long value is scrolled into view and the user clicks it
- **THEN** the textarea has focus
- **AND** the page's scroll position and the textarea's `scrollTop` are unchanged

### Requirement: Autofill is reported

When the browser fills in the textarea from its autofill data, `autofilled()` SHALL return `true` and the enclosing `kbq-form-field` SHALL carry the class `kbq-form-field_autofilled`.

#### Scenario: Browser autofill

- **WHEN** the browser fills in a textarea inside a form field from its autofill data
- **THEN** `autofilled()` returns `true` and the form field has the class `kbq-form-field_autofilled`

### Requirement: Server rendering

On a non-browser platform the textarea SHALL render without measuring or sizing itself, and MUST NOT access browser layout APIs.

#### Scenario: Server-side render

- **WHEN** a page with a textarea is rendered on the server
- **THEN** the textarea renders without an inline minimum height and no error is thrown
