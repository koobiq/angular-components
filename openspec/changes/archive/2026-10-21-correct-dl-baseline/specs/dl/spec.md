# Spec Delta

## MODIFIED Requirements

### Requirement: Terms and descriptions

`kbq-dl` SHALL render its projected `kbq-dt` and `kbq-dd` children in order, as a grid in which, in the horizontal layout, each `kbq-dt` starts a new row in the first column and the `kbq-dd` after it fills the rest of that row. The three elements SHALL carry the host classes `kbq-dl`, `kbq-dt` and `kbq-dd`. `KbqDlModule` SHALL export all three components.

#### Scenario: Pairs render row by row

- **WHEN** a `kbq-dl` in the horizontal layout contains `kbq-dt`, `kbq-dd`, `kbq-dt`, `kbq-dd` in that order
- **THEN** each term and the description after it share one row, the term in the first column

#### Scenario: Host classes of a plain list

- **WHEN** a `kbq-dl` is rendered with no inputs and has not measured its width yet
- **THEN** its only class is `kbq-dl`

### Requirement: Default column ratio

In the horizontal layout, without `wide` and without a term column width, the list SHALL divide its width into four equal tracks separated by the column gap: the term takes the first track and its description spans the other three. A resizable list SHALL keep this ratio only while its effective term minimum fits in one track; a wider minimum widens the term track and the other three tracks share the rest equally.

#### Scenario: Default layout

- **WHEN** a list without `wide` and without a term column width is wide enough for the horizontal layout, and it is not resizable or its term minimum fits in one track
- **THEN** each term takes one quarter of the row and its description the remaining three quarters, less the gaps

### Requirement: Wide layout

When `wide` is true, the list SHALL add the class `kbq-dl_wide` and, in the horizontal layout without a term column width, give the term and the description equal halves of the row, a resizable list only while its effective term minimum fits in one half. `wide` SHALL be coerced like a boolean attribute: a valueless attribute and any value other than `null`, `undefined`, `false` and the string `'false'` count as true, `0` included.

#### Scenario: Equal columns

- **WHEN** `wide` is true, the layout is horizontal, no term column width is set and the list is not resizable
- **THEN** the host has `kbq-dl_wide`
- **AND** terms and descriptions take one half of the row each

#### Scenario: Valueless attribute

- **WHEN** the list is written as `<kbq-dl wide>`
- **THEN** the host has `kbq-dl_wide`

#### Scenario: Falsy values

- **WHEN** `wide` is bound to `0`
- **THEN** `wide` is true
- **AND** binding the string `'false'` makes it false

### Requirement: Resizable term column

When `resizable` is true and the layout is horizontal, the list SHALL render a column separator and add the class `kbq-dl_resizable`. The separator sits on the border between the term column and the description columns while the box it resizes matches the term column (see "Separator semantics"). When `resizable` is false or the layout is vertical, the separator and the class MUST NOT be present. A valueless `resizable` attribute SHALL count as true.

#### Scenario: Separator appears

- **WHEN** `resizable` is true and the layout is horizontal
- **THEN** the separator is rendered and the host has `kbq-dl_resizable`

#### Scenario: Separator removed in the vertical layout

- **WHEN** a resizable list switches to the vertical layout
- **THEN** the separator is removed

#### Scenario: Not resizable

- **WHEN** `resizable` is not set
- **THEN** no separator is rendered

### Requirement: Minimum column widths

`dtMinWidth` SHALL set the narrowest the term column can be resized to, a negative value counting as 0. `ddMinWidth` SHALL set the width kept for the descriptions: the widest the term column can be resized to SHALL be the list's client width minus the column gap and minus `ddMinWidth`, but never less than the term minimum.

#### Scenario: Bounds of a 600 px list

- **WHEN** a resizable 600 px list without a column gap has `dtMinWidth` 120 and `ddMinWidth` 200
- **THEN** the term column can be resized between 120 px and 400 px

#### Scenario: Negative minimum

- **WHEN** `dtMinWidth` is -50
- **THEN** the separator reports a minimum of 0

#### Scenario: No room to resize

- **WHEN** `ddMinWidth` leaves less room than `dtMinWidth`
- **THEN** the maximum equals the minimum and every width the list writes is that minimum
- **AND** a term column resting wider than the minimum narrows to it on the first drag, key or double-click

### Requirement: Separator cursor

The separator SHALL show `col-resize` while the term width lies between the bounds, at the minimum the cursor pointing the way the column can grow (`e-resize` left to right, `w-resize` right to left), at the maximum the opposite one, and `default` when the maximum does not exceed the minimum. The cursor SHALL be computed only when the list writes or clamps the width, measures its size or sees a minimum change; before that, and after a double-click restores the default ratio, it is `col-resize`.

#### Scenario: At the minimum

- **WHEN** the term width reaches its minimum in a left-to-right list
- **THEN** the separator cursor is `e-resize`

#### Scenario: At the maximum

- **WHEN** the term width reaches its maximum in a left-to-right list
- **THEN** the separator cursor is `w-resize`

#### Scenario: No room

- **WHEN** `ddMinWidth` leaves no room above `dtMinWidth` and the list has just measured its width
- **THEN** the separator cursor is `default`

#### Scenario: Cursor after a restore

- **WHEN** `ddMinWidth` leaves no room above `dtMinWidth` and the user double-clicks the separator twice
- **THEN** the cursor is `default` after the first double-click and `col-resize` after the second
- **AND** it stays `col-resize` until the list next writes the width, measures its size or sees a minimum change

### Requirement: Resizing with the keyboard

The separator SHALL be in the tab order. Home SHALL set the term width to its minimum and End to its maximum. In a left-to-right list ArrowRight SHALL widen and ArrowLeft narrow the term column by 8 px, starting from the width `aria-valuenow` reports (see "Separator semantics") and clamped to the bounds. These keys SHALL have their default action prevented; other keys MUST be left alone.

#### Scenario: Home and End

- **WHEN** a 600 px list has both minimums at 100 and the user presses Home, then End
- **THEN** `dtWidth` becomes 100 and then 500

#### Scenario: Arrow key at a bound

- **WHEN** the term column is at its maximum and the user presses ArrowRight in a left-to-right list
- **THEN** the width stays at the maximum

#### Scenario: Tab reaches the separator

- **WHEN** the user tabs into a resizable list
- **THEN** the separator receives focus

### Requirement: Right-to-left direction

When the list's direction is right to left, the pointer drag, the arrow keys and the boundary cursors SHALL be mirrored: moving the pointer or pressing the arrow key toward the descriptions, which is left, widens the term column. The direction SHALL come from the nearest CDK `dir` directive above the list, else from the document's `dir` read once. A change at runtime SHALL reach the drag and the arrow keys at once, and the boundary cursor only when it is next computed (see "Separator cursor").

#### Scenario: ArrowLeft widens in right to left

- **WHEN** the term column of a right-to-left list is 200 px and the user presses ArrowLeft
- **THEN** `dtWidth` becomes 208

#### Scenario: Mirrored boundary cursors

- **WHEN** the term width of a right-to-left list is at its minimum, then at its maximum
- **THEN** the separator cursor is `w-resize`, then `e-resize`

#### Scenario: Direction changed at runtime

- **WHEN** a left-to-right list sits at its minimum with the `e-resize` cursor and the `dir` directive above it switches to `rtl`
- **THEN** ArrowLeft widens the term column at once
- **AND** the cursor stays `e-resize` until the list next writes the width, measures its size or sees a minimum change

### Requirement: Separator semantics

The separator SHALL have `role="separator"`, `aria-orientation="vertical"` and `tabindex="0"`. It SHALL report `aria-valuemin` as the effective term minimum, `aria-valuemax` as the term maximum and `aria-valuenow` as the rendered width of the box it resizes in whole pixels, or the term minimum while that width is 0. That box spans the term column at rest and, once `dtWidth` is set, is held between the minimum and the maximum, so it can differ from the term column.

#### Scenario: Attributes of the separator

- **WHEN** a resizable horizontal list is rendered
- **THEN** its separator has `role="separator"` and `aria-orientation="vertical"`

#### Scenario: Current value after a collapse

- **WHEN** the user double-clicks the separator of a list with `dtMinWidth` 120
- **THEN** the separator has `aria-valuenow="120"`

#### Scenario: Width outside the bounds

- **WHEN** a resizable horizontal list that has measured its width receives through its binding a `dtWidth` above its maximum
- **THEN** until the list next clamps the width, the term column takes the bound value while the separator and `aria-valuenow` stay at the maximum

### Requirement: Localized strings

The only string the list renders itself, the separator name `a11y.resizeColumns`, SHALL follow the active locale, `ru-RU` by default and "Resize columns" in `en-US`. A provider made with `kbqA11yLocaleConfigurationProvider` SHALL override it for its injector, and `[localeOverrides]` SHALL override it for one list and the lists nested in its content.

#### Scenario: Provider override

- **WHEN** the application provides `resizeColumns` "Resize the columns" through `kbqA11yLocaleConfigurationProvider`
- **THEN** the separator's `aria-label` is "Resize the columns"

#### Scenario: Overriding one list

- **WHEN** a list binds `[localeOverrides]` with its own `a11y.resizeColumns`
- **THEN** its separator, and the separators of lists nested in its content, use the overridden name
- **AND** the other lists keep the name of the active locale
