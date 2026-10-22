# progress-spinner Specification

## Purpose

Describes what `kbq-progress-spinner` from `@koobiq/components/progress-spinner` guarantees to consumers: how `value` and `mode` drive the arc, which host classes `size`, `mode` and `color` set, what the text and caption slots render, and how the spinner behaves with motion turned off.

## Requirements

### Requirement: Spinner element

`<kbq-progress-spinner>` SHALL render a single arc on a circle, with no track drawn behind the arc, and SHALL carry the host class `kbq-progress-spinner`.

#### Scenario: Rendering a spinner

- **WHEN** a consumer renders `<kbq-progress-spinner />`
- **THEN** the element has the class `kbq-progress-spinner`
- **AND** it contains one SVG circle that draws the arc

### Requirement: Defaults

A spinner without bindings SHALL be determinate, `compact`, theme-colored and at `value` 0, which shows an empty circle.

#### Scenario: Spinner with no inputs

- **WHEN** a consumer renders `<kbq-progress-spinner />` with no inputs
- **THEN** the host has the class `kbq-theme` and neither `kbq-progress-spinner_big` nor `kbq-progress-spinner_indeterminate`
- **AND** the arc is empty: the circle's `stroke-dashoffset` is `295%`

### Requirement: Determinate arc follows the value

In determinate mode the arc SHALL start at the top of the circle, run clockwise and grow with `value`, read as a percentage: the circle's `stroke-dashoffset` SHALL be `295 − 2.95 × value` percent, from `295%` at 0 to `0%` at 100. The circle SHALL take the `stroke-dashoffset` of a new `value` as soon as it is bound; while motion is on, the arc then moves to its new length over a short transition instead of showing it at once.

#### Scenario: Value of 40

- **WHEN** a determinate spinner has `value` 40
- **THEN** the circle's `stroke-dashoffset` is `177%`

#### Scenario: Value changes

- **WHEN** the bound `value` changes from 40 to 100
- **THEN** the circle's `stroke-dashoffset` becomes `0%`

### Requirement: Value is clamped for display

The arc SHALL treat a `value` below 0 as 0 and a `value` above 100 as 100. The `value` input itself SHALL keep the number as bound, without clamping it.

#### Scenario: Negative value

- **WHEN** `value` is -50
- **THEN** the arc is empty, as at 0 (`stroke-dashoffset` of `295%`)

#### Scenario: Value above 100

- **WHEN** `value` is 140
- **THEN** the arc is full, as at 100 (`stroke-dashoffset` of `0%`)
- **AND** reading the spinner's `value()` still returns 140

### Requirement: Non-numeric values read as zero

`value` SHALL accept numbers, strings, `null` and `undefined`. A string that is wholly a number, such as a static `value="40"`, SHALL be read as that number. `null`, `undefined`, an empty string and a string that is not wholly a number (`'abc'`, `'40px'`) SHALL read as 0, never as `NaN`. An object or an array is a template type error; one that reaches the spinner at run time reads as the number its string form is, so `{}` reads as 0 and `[40]` as 40.

#### Scenario: Static attribute

- **WHEN** a consumer writes `<kbq-progress-spinner value="40" />`
- **THEN** the spinner shows the same arc as for the number 40 (`stroke-dashoffset` of `177%`)

#### Scenario: Null from an async source

- **WHEN** `value` is bound to an observable through the `async` pipe and the pipe yields `null`
- **THEN** the spinner's `value()` is 0 and the arc is empty

#### Scenario: Unit suffix

- **WHEN** `value` is the string `'40px'`
- **THEN** the spinner's `value()` is 0

### Requirement: Mode host class

`mode` SHALL accept `'determinate'`, the default, and `'indeterminate'`, typed as the exported `ProgressSpinnerMode`. In indeterminate mode the host SHALL carry the class `kbq-progress-spinner_indeterminate`, and the class SHALL be removed when the mode returns to determinate.

#### Scenario: Switching to indeterminate

- **WHEN** `mode` changes from `'determinate'` to `'indeterminate'`
- **THEN** the host gains the class `kbq-progress-spinner_indeterminate`

#### Scenario: Switching back

- **WHEN** `mode` changes from `'indeterminate'` back to `'determinate'`
- **THEN** the host no longer has the class `kbq-progress-spinner_indeterminate`

### Requirement: Indeterminate arc ignores the value

In indeterminate mode the spinner SHALL ignore `value` and show an arc of fixed length, which turns around the circle continuously while motion is on and stands still while motion is off. Returning to determinate mode SHALL show the arc for the current `value` again.

#### Scenario: Value bound in indeterminate mode

- **WHEN** `value` is 40 and `mode` is `'indeterminate'`
- **THEN** the circle carries no `stroke-dashoffset` of its own, so the arc length does not depend on `value`

#### Scenario: Back to determinate

- **WHEN** an indeterminate spinner with `value` 40 returns to `'determinate'`
- **THEN** the circle's `stroke-dashoffset` is `177%` again

### Requirement: Size

`size` SHALL accept `'compact'`, the default, and `'big'`, typed as the exported `ProgressSpinnerSize`, which leaves out `'normal'`. `'big'` SHALL add the host class `kbq-progress-spinner_big` and render a larger spinner whose circle radius grows from `42.5%` to `47%` of its box.

#### Scenario: Compact by default

- **WHEN** the spinner has no `size`
- **THEN** the host has no `kbq-progress-spinner_big` class and the circle's `r` is `42.5%`

#### Scenario: Big spinner

- **WHEN** `size` is `'big'`
- **THEN** the host has the class `kbq-progress-spinner_big` and the circle's `r` is `47%`

### Requirement: Color host class

The spinner SHALL render its `color` as the host class `kbq-<color>`, for any `KbqComponentColors` value or other string. When `color` is not set or is falsy (`null`, `''`), the spinner SHALL use the `theme` color.

#### Scenario: Contrast color

- **WHEN** `color` is `'contrast'`
- **THEN** the host has the class `kbq-contrast`

#### Scenario: Color not set

- **WHEN** `color` is `null`
- **THEN** the host has the class `kbq-theme`

### Requirement: Color set in code

The spinner's public `color` member SHALL be a writable signal: a color set with `color.set()` SHALL replace the color class until the `color` input receives a new value, which then wins.

#### Scenario: Code sets a color

- **WHEN** code calls `color.set('error')` on the spinner
- **THEN** the host has the class `kbq-error`

#### Scenario: The input changes afterwards

- **WHEN** code has set `'error'` and the bound `color` input then changes to `'success'`
- **THEN** the host has the class `kbq-success` and no longer has `kbq-error`

### Requirement: Spinner id

The host SHALL carry the `id` input as its `id` attribute. Without an `id`, each spinner SHALL get a unique id that starts with `kbq-progress-spinner-`.

#### Scenario: Custom id

- **WHEN** `id` is `'foo'`
- **THEN** the host element has `id="foo"`

#### Scenario: Generated ids

- **WHEN** two spinners are rendered without an `id`
- **THEN** both ids start with `kbq-progress-spinner-` and they differ

### Requirement: Text and caption next to the circle

An element marked `kbq-progress-spinner-text` or `kbq-progress-spinner-caption` and placed inside the spinner as a top-level node of its content, or as the only root node of a control-flow block there, SHALL be rendered next to the circle, on its inline-end side. Nested in an unmarked element or `ng-container`, or as one of several root nodes of a control-flow block, it is not rendered. The text SHALL be rendered before the caption, whatever order they are written in.

#### Scenario: Text and caption

- **WHEN** a spinner contains `<div kbq-progress-spinner-text>Text</div>` and `<div kbq-progress-spinner-caption>Caption</div>`
- **THEN** both are rendered beside the circle, the text above the caption

#### Scenario: Caption written first

- **WHEN** the caption element comes before the text element in the markup
- **THEN** the text is still rendered before the caption

### Requirement: Other projected content is not rendered

The spinner SHALL render only content marked `kbq-progress-spinner-text` or `kbq-progress-spinner-caption`. Any other content placed inside it MUST NOT be rendered.

#### Scenario: Unmarked content

- **WHEN** a consumer writes `<kbq-progress-spinner><span>40%</span></kbq-progress-spinner>`
- **THEN** the `span` is not in the rendered DOM

### Requirement: Text and caption classes

The `[kbq-progress-spinner-text]` directive SHALL add the class `kbq-progress-spinner-text` to its element, and the `[kbq-progress-spinner-caption]` directive SHALL add the class `kbq-progress-spinner-caption`.

#### Scenario: Marked elements

- **WHEN** an element has the attribute `kbq-progress-spinner-caption`
- **THEN** it has the class `kbq-progress-spinner-caption`

### Requirement: Motion

While motion is on, the indeterminate arc SHALL rotate continuously, and a determinate arc SHALL move to a new `value` with a short transition instead of jumping.

#### Scenario: Indeterminate spinner

- **WHEN** an indeterminate spinner is rendered with motion on
- **THEN** its arc keeps turning around the circle

#### Scenario: Determinate value change

- **WHEN** a determinate spinner's `value` changes from 20 to 60 with motion on
- **THEN** the arc grows to the new length over a short transition

### Requirement: Turning motion off

The spinner SHALL drop its motion when `KBQ_ANIMATIONS_CONFIG` sets `animationsDisabled: true`, when the application uses `provideNoopAnimations()`, or when the user prefers reduced motion: the indeterminate arc SHALL stand still and a determinate arc SHALL jump to a new `value`.

#### Scenario: Animations turned off by configuration

- **WHEN** the application provides `KBQ_ANIMATIONS_CONFIG` with `{ animationsDisabled: true }`
- **THEN** an indeterminate spinner's arc stands still
- **AND** a determinate spinner shows a new `value` at once

#### Scenario: Reduced motion

- **WHEN** the operating system has reduced motion turned on
- **THEN** an indeterminate spinner's arc stands still

### Requirement: No progress semantics for assistive technology

The spinner SHALL set no `role` and no `aria-*` attribute, on its host or on the arc, and SHALL add no tab stop. The arc's SVG SHALL have `focusable="false"`. The text and caption SHALL be exposed as ordinary content where they stand.

#### Scenario: Determinate spinner in the accessibility tree

- **WHEN** a determinate spinner has `value` 40
- **THEN** its host has no `role`, no `aria-valuenow`, no `aria-label` and no `tabindex`

#### Scenario: Spinner with a text

- **WHEN** a spinner contains a `kbq-progress-spinner-text` element reading "Loading"
- **THEN** "Loading" is exposed as plain text, not as the name of the spinner

### Requirement: Module and standalone use

The component and both directives SHALL be standalone, and `KbqProgressSpinnerModule` SHALL export all three, so that importing either the module or the three classes makes `kbq-progress-spinner`, `[kbq-progress-spinner-text]` and `[kbq-progress-spinner-caption]` available.

#### Scenario: Importing the module

- **WHEN** a standalone component imports `KbqProgressSpinnerModule`
- **THEN** its template can use the spinner with a text and a caption

#### Scenario: Importing the classes

- **WHEN** a standalone component imports `KbqProgressSpinner` and `KbqProgressSpinnerText` only
- **THEN** its template can use the spinner with a text
