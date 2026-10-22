# progress-spinner Specification Delta

## MODIFIED Requirements

### Requirement: Determinate arc follows the value

In determinate mode the arc SHALL start at the top of the circle, run clockwise and grow with `value`, read as a percentage: the circle's `stroke-dashoffset` SHALL be `295 − 2.95 × value` percent, from `295%` at 0 to `0%` at 100. The circle SHALL take the `stroke-dashoffset` of a new `value` as soon as it is bound; while motion is on, the arc then moves to its new length over a short transition instead of showing it at once.

#### Scenario: Value of 40

- **WHEN** a determinate spinner has `value` 40
- **THEN** the circle's `stroke-dashoffset` is `177%`

#### Scenario: Value changes

- **WHEN** the bound `value` changes from 40 to 100
- **THEN** the circle's `stroke-dashoffset` becomes `0%`

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

### Requirement: Indeterminate arc ignores the value

In indeterminate mode the spinner SHALL ignore `value` and show an arc of fixed length, which turns around the circle continuously while motion is on and stands still while motion is off. Returning to determinate mode SHALL show the arc for the current `value` again.

#### Scenario: Value bound in indeterminate mode

- **WHEN** `value` is 40 and `mode` is `'indeterminate'`
- **THEN** the circle carries no `stroke-dashoffset` of its own, so the arc length does not depend on `value`

#### Scenario: Back to determinate

- **WHEN** an indeterminate spinner with `value` 40 returns to `'determinate'`
- **THEN** the circle's `stroke-dashoffset` is `177%` again

### Requirement: Text and caption next to the circle

An element marked `kbq-progress-spinner-text` or `kbq-progress-spinner-caption` and placed inside the spinner as a top-level node of its content, or as the only root node of a control-flow block there, SHALL be rendered next to the circle, on its inline-end side. Nested in an unmarked element or `ng-container`, or as one of several root nodes of a control-flow block, it is not rendered. The text SHALL be rendered before the caption, whatever order they are written in.

#### Scenario: Text and caption

- **WHEN** a spinner contains `<div kbq-progress-spinner-text>Text</div>` and `<div kbq-progress-spinner-caption>Caption</div>`
- **THEN** both are rendered beside the circle, the text above the caption

#### Scenario: Caption written first

- **WHEN** the caption element comes before the text element in the markup
- **THEN** the text is still rendered before the caption
