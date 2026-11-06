# dl Specification

## Purpose

Describes what `kbq-dl` from `@koobiq/components/dl` guarantees to consumers: how it lays out `kbq-dt` terms and `kbq-dd` descriptions in its default, wide and vertical layouts, when it switches to the vertical layout on its own, and how users resize the term column with a pointer, the keyboard or assistive technology.

## Requirements

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

### Requirement: Vertical layout

In the vertical layout the list SHALL add the class `kbq-dl_vertical`, render a single column with each term above its description, and ignore `wide` and any term column width for the layout. The column separator MUST NOT be rendered in the vertical layout.

#### Scenario: Single column

- **WHEN** the list is in the vertical layout
- **THEN** the host has `kbq-dl_vertical`
- **AND** every term and description spans the full width, the term above its description

#### Scenario: Vertical wins over wide

- **WHEN** both `vertical` and `wide` are true
- **THEN** the list renders the single-column vertical layout

### Requirement: Explicit layout

`vertical` set to `true` SHALL force the vertical layout and `false` SHALL force the horizontal one, whatever the list's width. `null` or `undefined` SHALL leave the choice to the automatic layout. A valueless `vertical` attribute SHALL count as `true` and the string `'false'` as `false`.

#### Scenario: Forced horizontal on a narrow host

- **WHEN** `vertical` is `false` and the list is narrower than `verticalBreakpoint`
- **THEN** the list stays horizontal

#### Scenario: Valueless attribute

- **WHEN** the list is written as `<kbq-dl vertical>`
- **THEN** the host has `kbq-dl_vertical`

#### Scenario: Back to automatic

- **WHEN** `vertical` was set and is then bound to `null`
- **THEN** `vertical` reads `null`
- **AND** the layout follows the last measured width against the current `verticalBreakpoint`

### Requirement: Automatic vertical layout

While `vertical` is `null` or `undefined`, the list SHALL use the vertical layout when its measured width is at or below `verticalBreakpoint` (400 by default) and the horizontal layout otherwise. The decision SHALL be made again after every change of the list's size and immediately when `verticalBreakpoint` changes.

#### Scenario: Narrow list

- **WHEN** the list measures 320 px with the default breakpoint
- **THEN** it uses the vertical layout

#### Scenario: Width equal to the breakpoint

- **WHEN** the list measures exactly `verticalBreakpoint` pixels
- **THEN** it uses the vertical layout

#### Scenario: Resizing across the breakpoint

- **WHEN** a list measured at 800 px shrinks to 300 px and then grows back to 800 px
- **THEN** it switches to the vertical layout and then back to the horizontal one

#### Scenario: Custom breakpoint

- **WHEN** a list measured at 600 px has `verticalBreakpoint` changed from 400 to 700
- **THEN** it switches to the vertical layout without waiting for a resize

### Requirement: Timing of the automatic layout

The list SHALL first measure its width 100 ms after its first render and again 100 ms after each burst of size changes ends. Until the first measurement, including on the server, a list in automatic mode SHALL render the horizontal layout. A list without a layout box SHALL measure as 0 px wide.

#### Scenario: Before the first measurement

- **WHEN** a narrow list in automatic mode has just rendered
- **THEN** it renders the horizontal layout
- **AND** it switches to the vertical layout 100 ms later

#### Scenario: Hidden list

- **WHEN** a list in automatic mode is rendered inside a hidden container
- **THEN** it measures as 0 px wide and uses the vertical layout until it gets a size

### Requirement: Numeric inputs accept attribute strings

`verticalBreakpoint`, `dtWidth`, `dtMinWidth` and `ddMinWidth` SHALL accept numbers written as attribute strings. An empty or unparsable `dtMinWidth` or `ddMinWidth`, or one bound to `undefined`, SHALL count as not set. An empty or unparsable `dtWidth` SHALL count as `null`.

#### Scenario: String attributes

- **WHEN** the list is written as `<kbq-dl verticalBreakpoint="700" dtMinWidth="120" ddMinWidth="80">`
- **THEN** the inputs read the numbers 700, 120 and 80

#### Scenario: Unparsable widths

- **WHEN** `dtMinWidth` is a valueless attribute and `ddMinWidth="abc"`
- **THEN** both read `undefined` and their defaults apply

#### Scenario: Unparsable term width

- **WHEN** `dtWidth` is bound to `'abc'`
- **THEN** `dtWidth` reads `null` and the host has no `kbq-dl_resized`

### Requirement: Vertical alignment of items

`verticalAlign` SHALL align terms and descriptions inside their row: `'start'` (the default) adds no class, `'center'` adds `kbq-dl_vertical-align-center` and `'end'` adds `kbq-dl_vertical-align-end`.

#### Scenario: Centered items

- **WHEN** `verticalAlign` is `'center'` and a description is taller than its term
- **THEN** the host has `kbq-dl_vertical-align-center`
- **AND** the term is centered vertically against the description

#### Scenario: Default alignment

- **WHEN** `verticalAlign` is not set
- **THEN** it reads `'start'` and the host has no vertical alignment class

### Requirement: Horizontal alignment of items

`horizontalAlign` SHALL align terms and descriptions inside their column: `'start'` (the default) adds no class and lets items fill their column, `'center'` adds `kbq-dl_horizontal-align-center` and `'end'` adds `kbq-dl_horizontal-align-end`.

#### Scenario: End-aligned items

- **WHEN** `horizontalAlign` is `'end'`
- **THEN** the host has `kbq-dl_horizontal-align-end`
- **AND** each item sits at the end of its column

#### Scenario: Default alignment

- **WHEN** `horizontalAlign` is not set
- **THEN** it reads `'start'` and the host has no horizontal alignment class

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

### Requirement: Term column width

A non-null `dtWidth` SHALL make the term column that many pixels wide in the horizontal layout, the descriptions sharing the rest, and add the class `kbq-dl_resized`. `null` (the default) SHALL restore the default ratio and remove the class. The width SHALL apply whether or not `resizable` is set, and SHALL be kept while the layout is vertical.

#### Scenario: Width set by the consumer

- **WHEN** `dtWidth` is 300 on a horizontal list
- **THEN** the term column is 300 px wide and the host has `kbq-dl_resized`

#### Scenario: Width cleared

- **WHEN** `dtWidth` goes back to `null`
- **THEN** the default column ratio returns and `kbq-dl_resized` is removed

### Requirement: Two-way binding of the term column width

`dtWidthChange` SHALL emit the new value whenever the list writes `dtWidth` itself: a pointer drag, a key on the separator, a double-click, or a clamp that changes the value. A change that arrives through the consumer's binding MUST NOT emit by itself, so `[(dtWidth)]` SHALL keep one width shared between several lists.

#### Scenario: Double-clicks report back

- **WHEN** the user double-clicks the separator twice on a list with `dtMinWidth` 120 and `dtWidth` 200
- **THEN** `dtWidthChange` emits 120 and then `null`

#### Scenario: Shared width

- **WHEN** two resizable lists bind `[(dtWidth)]` to the same property and the user drags the separator of one of them
- **THEN** the term column of the other list follows the new width

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

### Requirement: Default minimum widths

When `dtMinWidth` or `ddMinWidth` is not set, it SHALL default to the width of the first `kbq-dt`, measured once after the list's first render and rounded to whole pixels, or 0 when there is no `kbq-dt` at that moment. With the default alignment the term fills its column, so by default the term column cannot be made narrower than it first rendered.

#### Scenario: Minimum from the rendered term

- **WHEN** a resizable list sets neither `dtMinWidth` nor `ddMinWidth`
- **THEN** the separator's minimum equals the rendered width of the first term

#### Scenario: Collapsing a list without minimums

- **WHEN** such a list has the default alignment and the user presses Home on the separator
- **THEN** the term column keeps the width it first rendered with

### Requirement: Width clamping

A width the list writes SHALL be clamped between the term minimum and maximum. While the layout is horizontal, the list SHALL also clamp a non-null `dtWidth` at its first measurement, after each change of its size, and whenever `dtMinWidth` or `ddMinWidth` changes. A clamp that changes the value SHALL emit `dtWidthChange`.

#### Scenario: Width below the minimum

- **WHEN** `dtWidth` is bound to `'120'` on a 600 px list with `dtMinWidth` 200
- **THEN** after the first measurement `dtWidth` reads 200

#### Scenario: List shrinks

- **WHEN** the list becomes narrower than the term width plus the gap and `ddMinWidth`
- **THEN** the term width shrinks to the new maximum and `dtWidthChange` emits it

### Requirement: Resting state of a resizable list

Before a width is set, a resizable horizontal list SHALL keep the default column ratio but never make the term column narrower than the effective term minimum, which it exposes on the host as `--kbq-description-list-dt-min-width`. The separator SHALL sit on the border of the rendered term column.

#### Scenario: Minimum wider than a quarter

- **WHEN** a resizable list has `dtMinWidth` 200 and no `dtWidth`
- **THEN** the host sets `--kbq-description-list-dt-min-width` to `200px`
- **AND** the term column is at least 200 px wide

#### Scenario: Separator at rest

- **WHEN** a resizable list has `dtMinWidth` and `ddMinWidth` but no `dtWidth`
- **THEN** the separator follows the term column border rather than the configured widths

### Requirement: Resizing with a pointer

Dragging the separator with the primary button SHALL set the term width to the width at the start of the drag plus the horizontal pointer movement, clamped to the bounds. Moving past a bound SHALL keep the clamped width, and moving back SHALL resume resizing within the same gesture. Other buttons and non-primary pointers MUST NOT start a drag.

#### Scenario: Drag to the right

- **WHEN** the user drags the separator of a left-to-right list 60 px to the right
- **THEN** the term column becomes 60 px wider and the host has `kbq-dl_resized`

#### Scenario: Drag past the minimum and back

- **WHEN** the user drags past the minimum and then back into range without releasing
- **THEN** the width stays at the minimum while past it
- **AND** follows the pointer again once back in range

### Requirement: Cursor while dragging

While a drag is in progress, the document body SHALL show the separator's current cursor, with `!important`, even when the pointer leaves the separator. Releasing or cancelling the pointer SHALL restore the body's previous cursor.

#### Scenario: Cursor follows the drag

- **WHEN** the user presses the separator and drags past the minimum
- **THEN** the body cursor is `col-resize` on press and changes to the boundary cursor past the minimum
- **AND** returns to `col-resize` back in range and to its previous value on release

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

### Requirement: Double-click on the separator

A double-click on the separator SHALL prevent its default action and collapse the term column to its minimum. When the term width already equals the minimum, a double-click SHALL instead set `dtWidth` to `null`, restoring the default ratio and the `col-resize` cursor.

#### Scenario: Collapse and restore

- **WHEN** the user double-clicks the separator of a list with `dtMinWidth` 120 and `dtWidth` 200
- **THEN** `dtWidth` becomes 120, the cursor `e-resize`, and the host keeps `kbq-dl_resized`
- **AND** a second double-click sets `dtWidth` to `null` and removes `kbq-dl_resized`

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

### Requirement: Focus feedback on the separator

Keyboard focus on the separator SHALL show a focus frame. Starting a pointer drag SHALL move focus to the separator as pointer focus, so no focus frame shows during or after the drag, even when the separator had keyboard focus before.

#### Scenario: Keyboard focus

- **WHEN** the user tabs to the separator
- **THEN** the separator shows its focus frame

#### Scenario: Drag after keyboard focus

- **WHEN** the separator has keyboard focus and the user presses it with the mouse
- **THEN** the focus frame disappears and stays hidden after the mouse is released

### Requirement: Visibility of the separator line

The separator line SHALL be hidden at rest and SHALL become visible while the list is hovered with a fine pointer, while the separator has keyboard focus, and while it is being dragged. While dragging, the line SHALL be drawn thicker.

#### Scenario: Hover and focus reveal the line

- **WHEN** the pointer hovers the list, then leaves it, then the user tabs to the separator
- **THEN** the line is visible, then hidden, then visible again

#### Scenario: Dragging

- **WHEN** the user presses the separator
- **THEN** the line is visible and 3 px wide

### Requirement: Long text

Terms and descriptions SHALL wrap their text inside their column: text with spaces wraps between words, and a string without spaces, such as an identifier, a hash, a path or a URL, breaks between characters only where it does not fit. Long content MUST NOT widen its column.

#### Scenario: Unbreakable string

- **WHEN** a description holds a 64-character hash in a narrow column
- **THEN** the hash breaks across lines and the column ratio is unchanged

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

### Requirement: Accessible name of the separator

The separator's `aria-label` SHALL be `resizerAriaLabel` when it is a non-empty string, and the localized `a11y.resizeColumns` text otherwise.

#### Scenario: Localized default

- **WHEN** `resizerAriaLabel` is not set
- **THEN** the separator's `aria-label` is the `a11y.resizeColumns` text of the active locale

#### Scenario: Custom name

- **WHEN** `resizerAriaLabel` is "Custom label"
- **THEN** the separator's `aria-label` is "Custom label", whatever the locale says

### Requirement: Localized strings

The only string the list renders itself, the separator name `a11y.resizeColumns`, SHALL follow the active locale, `ru-RU` by default and "Resize columns" in `en-US`. A provider made with `kbqA11yLocaleConfigurationProvider` SHALL override it for its injector, and `[localeOverrides]` SHALL override it for one list and the lists nested in its content.

#### Scenario: Provider override

- **WHEN** the application provides `resizeColumns` "Resize the columns" through `kbqA11yLocaleConfigurationProvider`
- **THEN** the separator's `aria-label` is "Resize the columns"

#### Scenario: Overriding one list

- **WHEN** a list binds `[localeOverrides]` with its own `a11y.resizeColumns`
- **THEN** its separator, and the separators of lists nested in its content, use the overridden name
- **AND** the other lists keep the name of the active locale
