## MODIFIED Requirements

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

### Requirement: Form control disabled state wins

When a form directive (`ngModel`, `formControl`, `formControlName`) is bound to the textarea, the control's disabled state SHALL decide whether the textarea is disabled, and the textarea's own `disabled` input SHALL be ignored once the directive has its control: from the first change detection with `ngModel` and `formControl`, and with `formControlName` possibly only from the second one. With `ngModel`, the same `disabled` binding still reaches the control through `NgModel`.

#### Scenario: Reactive control disabled in code

- **WHEN** a textarea is bound with `[formControl]` and the control's `disable()` is called
- **THEN** the textarea element is disabled after the next change detection

### Requirement: Focusing does not scroll

Focusing a textarea that is already in view MUST NOT scroll the page and MUST NOT scroll the textarea's own content. A textarea out of view is scrolled into view by the browser when it gets focus: `focus()` takes no options, so the `preventScroll` that `KbqFormField.focus()` passes on is dropped.

#### Scenario: Click on a long textarea in view

- **WHEN** a growing textarea with a long value is scrolled into view and the user clicks it
- **THEN** the textarea has focus
- **AND** the page's scroll position and the textarea's `scrollTop` are unchanged
