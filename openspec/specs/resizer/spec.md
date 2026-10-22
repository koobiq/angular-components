# resizer Specification

## Purpose

Describes what the `kbqResizable` and `kbqResizer` directives from `@koobiq/components/resizer` guarantee to consumers: which element a drag handle resizes, how a pointer drag starts, follows the pointer and ends, what size the directives write and report, and what they leave to the consumer.

## Requirements

### Requirement: Resizable container

The `kbqResizable` attribute SHALL mark its host element as the element that drag handles inside it resize. The host SHALL get the class `kbq-resizable`, and the directive SHALL be exported as `kbqResizable` for template reference variables.

#### Scenario: Marking an element as resizable

- **WHEN** an element carries the `kbqResizable` attribute
- **THEN** the element has the class `kbq-resizable`

### Requirement: Drag handle

The `kbqResizer` attribute SHALL mark its host element as a drag handle that resizes the nearest element carrying `kbqResizable`: the handle's own element, or else its closest such ancestor. For projected content the ancestors are those of the template that declares the handle. The host SHALL get the class `kbq-resizer`, and the directive SHALL be exported as `kbqResizer`.

#### Scenario: Handle inside a container

- **WHEN** an element with `[kbqResizer]="[1, 0]"` is placed inside an element with `kbqResizable`
- **THEN** the handle has the class `kbq-resizer`
- **AND** dragging the handle resizes the `kbqResizable` element

#### Scenario: Nested containers

- **WHEN** a handle sits inside two nested `kbqResizable` elements
- **THEN** dragging it resizes the inner one

### Requirement: Handle needs a resizable container

A `kbqResizer` MUST NOT be created when no `KbqResizable`, set as the `kbqResizable` attribute or as a host directive, is on its own element, on an ancestor in the template that declares it, or on the host of that template's component or one of that host's ancestors: Angular SHALL throw its missing-provider error (NG0201) for `KbqResizable` when the view is created.

#### Scenario: Handle without a container

- **WHEN** a template places `[kbqResizer]` on an element with no `kbqResizable` element around it, neither in that template nor around the host of its component
- **THEN** creating the view throws a missing-provider error for `KbqResizable`

#### Scenario: Container on the host of the handle's component

- **WHEN** a component applies `KbqResizable` as a host directive and its own template places `[kbqResizer]` on an element with no `kbqResizable` around it
- **THEN** the handle is created without an error
- **AND** dragging it resizes the component's host element

### Requirement: Resize direction

The required `kbqResizer` input SHALL take a pair `[x, y]` whose items are `-1`, `0` or `1`. With `x` set to `1` the width SHALL grow as the pointer moves right, with `-1` as it moves left, and with `0` the width MUST NOT be resized. `y` SHALL do the same for the height, with `1` growing downward and `-1` upward.

#### Scenario: Right edge handle

- **WHEN** a handle with `[kbqResizer]="[1, 0]"` is dragged 30 px to the right
- **THEN** the width grows by 30 px and the height is not written

#### Scenario: Left edge handle

- **WHEN** a handle with `[kbqResizer]="[-1, 0]"` is dragged 30 px to the left
- **THEN** the width grows by 30 px

#### Scenario: Corner handle

- **WHEN** a handle with `[kbqResizer]="[1, 1]"` is dragged 30 px right and 20 px down
- **THEN** the width grows by 30 px and the height by 20 px

### Requirement: Direction in screen coordinates

The direction SHALL be read in screen coordinates. The directive MUST NOT mirror it in a right-to-left layout; a consumer that wants a handle on the logical end edge flips `x` itself.

#### Scenario: Right-to-left page

- **WHEN** the page has `dir="rtl"` and a handle with `[kbqResizer]="[1, 0]"` is dragged to the right
- **THEN** the width grows

### Requirement: Handle without a direction

A handle whose direction is `[0, 0]` MUST NOT start a drag: a pointer-down on it SHALL be ignored, nothing SHALL be emitted, and the document cursor SHALL stay unchanged.

#### Scenario: Pressing a handle with no direction

- **WHEN** the user presses a handle with `[kbqResizer]="[0, 0]"` and moves the pointer
- **THEN** neither `resizeStart` nor `sizeChange` is emitted
- **AND** the body cursor is not changed

### Requirement: Handle cursor follows the direction

The handle SHALL carry an inline `cursor` style derived from its direction: `ew-resize` for a horizontal handle, `ns-resize` for a vertical one, `nwse-resize` for `[1, 1]` and `[-1, -1]`, `nesw-resize` for `[1, -1]` and `[-1, 1]`, and `default` for `[0, 0]`. The style SHALL update when the direction changes.

<!-- cspell:ignore nesw -->

#### Scenario: Horizontal and vertical handles

- **WHEN** the direction is `[1, 0]` or `[-1, 0]`
- **THEN** the handle has `cursor: ew-resize`
- **AND** with `[0, 1]` or `[0, -1]` it has `cursor: ns-resize`

#### Scenario: Corner handles

- **WHEN** the direction is `[1, 1]` or `[-1, -1]`
- **THEN** the handle has `cursor: nwse-resize`
- **AND** with `[1, -1]` or `[-1, 1]` it has `cursor: nesw-resize`

#### Scenario: Handle with no direction

- **WHEN** the direction is `[0, 0]`
- **THEN** the handle has `cursor: default`

### Requirement: Cursor override

The `cursor` input (default `null`) SHALL replace the direction-derived cursor of the handle when it holds a non-empty string. When it is `null` or an empty string, the handle SHALL fall back to the direction-derived cursor.

#### Scenario: Custom cursor

- **WHEN** a handle with `[kbqResizer]="[1, 0]"` has `cursor="col-resize"`
- **THEN** the handle has `cursor: col-resize`

#### Scenario: Override removed

- **WHEN** the `cursor` input of a vertical handle changes from `col-resize` to `null`
- **THEN** the handle has `cursor: ns-resize` again

### Requirement: Drag starts on the main button of a primary pointer

A drag SHALL start when the user presses the handle with the main button (`button` 0) of a primary pointer. A press of any other button, and a pointer-down of a non-primary pointer such as a second finger, MUST be ignored.

#### Scenario: Main button press

- **WHEN** the user presses the main mouse button on a handle with a direction
- **THEN** a drag starts and `resizeStart` is emitted

#### Scenario: Secondary button press

- **WHEN** the user presses the right mouse button on the handle and moves the pointer
- **THEN** no drag starts and nothing is emitted

#### Scenario: Non-primary pointer

- **WHEN** a non-primary pointer touches the handle
- **THEN** no drag starts and nothing is emitted

### Requirement: Pointer-down default action is prevented

The directive SHALL call `preventDefault()` on the pointer-down event that starts a drag. A pointer-down event that does not start a drag MUST be left untouched.

#### Scenario: Starting a drag

- **WHEN** a pointer-down event on the handle starts a drag
- **THEN** the event's `defaultPrevented` is `true`

#### Scenario: Ignored press

- **WHEN** the user presses the right mouse button on the handle
- **THEN** the event's `defaultPrevented` is not changed by the directive

### Requirement: One drag at a time

While a drag is active, the handle MUST ignore further pointer-downs, and the drag SHALL ignore the move, release and cancel events of any pointer other than the one that started it.

#### Scenario: Another pointer during a drag

- **WHEN** a drag started by pointer 7 is active and pointer 8 moves and is released
- **THEN** no `sizeChange` is emitted and the drag stays active
- **AND** a later move of pointer 7 emits `sizeChange`, and its release ends the drag

#### Scenario: Second press during a drag

- **WHEN** a drag is active and another pointer presses the same handle
- **THEN** no second drag starts and the first pointer keeps the capture

### Requirement: Pointer capture

When a drag starts, the handle SHALL capture the pointer that started it, if the browser supports pointer capture, and SHALL release that capture when the drag ends.

#### Scenario: Capture and release

- **WHEN** pointer 7 starts a drag on the handle and is released
- **THEN** the handle captured pointer 7 at the start
- **AND** released pointer 7 when the drag ended

### Requirement: Starting size in the element's box model

At the start of a drag the directive SHALL measure the resizable element in the box model its `width` and `height` styles are read in: the computed content size under `box-sizing: content-box`, and its bounding client rectangle under `box-sizing: border-box`. That rectangle is the border box only while neither the element nor an ancestor is transformed; under a transform such as a scale, the first move makes the element jump. A computed size that is not a number SHALL count as 0.

#### Scenario: Content box

- **WHEN** a `content-box` element with 100 x 50 px of content, 10 px of padding and a 1 px border is dragged 30 px right and 20 px down by a corner handle
- **THEN** its size becomes 130 x 70 px

#### Scenario: Border box

- **WHEN** the same element has `box-sizing: border-box`, so its border box is 122 x 72 px, and is dragged the same way
- **THEN** its size becomes 152 x 92 px

#### Scenario: Size that is not a length

- **WHEN** the computed width of a `content-box` element is not a length, for example `auto`
- **THEN** the drag measures the width from 0

#### Scenario: Border box inside a scaled ancestor

- **WHEN** the `border-box` element with a 122 x 72 px border box sits inside an ancestor with `transform: scale(0.5)` and a drag starts on its corner handle
- **THEN** `resizeStart` emits `{ width: 61, height: 36 }`

### Requirement: Resize start event

`resizeStart` SHALL emit once when a drag starts, with `{ width, height }` set to the starting size of the resizable element. It MUST NOT emit for a pointer-down that does not start a drag.

#### Scenario: Drag begins

- **WHEN** a drag starts on a `content-box` element of 100 x 50 px
- **THEN** `resizeStart` emits `{ width: 100, height: 50 }` once

#### Scenario: Ignored press

- **WHEN** the user presses the right mouse button, or a non-primary pointer touches the handle
- **THEN** `resizeStart` is not emitted

### Requirement: Size follows the pointer

For every move of the active pointer anywhere in the document, the new size SHALL be the starting size plus the direction times the pointer's travel since the pointer-down, in client coordinates. Unless size updates are disabled, it SHALL be written as an inline `width` and `height` in pixels, only for the axes whose direction is not 0.

#### Scenario: Horizontal handle

- **WHEN** a handle with `[kbqResizer]="[1, 0]"` on a 100 x 50 px element is dragged 30 px right and 20 px down
- **THEN** the element's inline `width` is `130px` and no inline `height` is set

#### Scenario: Several moves in one drag

- **WHEN** a corner handle is moved 30 px right and then, in the same drag, 50 px right of where it was pressed
- **THEN** the second move gives a width of the starting width plus 50 px, not plus 80 px

#### Scenario: Pointer leaves the handle

- **WHEN** the pointer moves off the handle during a drag
- **THEN** the element keeps resizing with the pointer

### Requirement: Size change event

`sizeChange` SHALL emit `{ width, height }` on every move of an active drag, even when the size has not changed since the previous move. An axis the handle does not resize SHALL report its starting size. `sizeChange` MUST NOT emit on the pointer-down, on the release, or for a move without an active drag.

#### Scenario: Three moves

- **WHEN** a drag is active and the pointer moves three times
- **THEN** `sizeChange` is emitted three times

#### Scenario: Axis not resized

- **WHEN** a handle with `[kbqResizer]="[1, 0]"` on a 100 x 50 px element is dragged 30 px right and 20 px down
- **THEN** `sizeChange` emits `{ width: 130, height: 50 }`

#### Scenario: Move without a drag

- **WHEN** the pointer moves with a button pressed but no drag was started on the handle
- **THEN** `sizeChange` is not emitted

### Requirement: Size is not clamped

The directive MUST NOT clamp the size it writes and reports: it can be smaller than the element's minimum size or larger than its maximum size, and the reported size can be negative. The element's CSS limits the size it renders at. A negative `width` or `height` is not a valid CSS value, so the browser drops that write: the element keeps the last size written while `sizeChange` reports the negative size.

#### Scenario: Drag below the minimum width

- **WHEN** an element with `min-width: 125px` and a width of 150 px is dragged 50 px narrower
- **THEN** `sizeChange` reports a width of 100
- **AND** the element renders at its minimum width of 125 px

#### Scenario: Drag past zero

- **WHEN** a handle with `[kbqResizer]="[1, 0]"` on a 100 x 50 px element is moved 90 px left and then, in the same drag, 130 px left of where it was pressed
- **THEN** `sizeChange` reports a width of 10 and then of -30
- **AND** the element's inline `width` stays `10px`

### Requirement: Size updates can be disabled

When the `disableSizeUpdate` input (a boolean attribute, default `false`) is `true`, the directive MUST NOT write `width` or `height` to the resizable element. `resizeStart` and `sizeChange` SHALL still report the sizes the drag asks for, measured from the starting size. The input SHALL be read on every move.

#### Scenario: Controlled resizing

- **WHEN** `disableSizeUpdate` is `true` and a corner handle on a 100 x 50 px element is dragged 30 px right and 20 px down
- **THEN** the element has no inline `width` or `height`
- **AND** `sizeChange` emits `{ width: 130, height: 70 }`

#### Scenario: Host ignores a move

- **WHEN** `disableSizeUpdate` is `true` and the pointer moves 30 px and then 50 px from where it was pressed
- **THEN** the second `sizeChange` reports the starting size plus 50 px, whatever the host did with the first report

#### Scenario: Updates enabled again

- **WHEN** `disableSizeUpdate` changes from `true` to `false` and the user drags the handle again
- **THEN** the element's inline size is written again

### Requirement: Drag ends

A drag SHALL end when the active pointer is released or cancelled anywhere in the document, when the handle loses the capture of that pointer, on a move of that pointer with no button pressed, and when the handle is destroyed. Ending MUST NOT emit an event, later moves MUST NOT resize, and the element SHALL keep the last size written.

#### Scenario: Release

- **WHEN** the user releases the pointer after two moves and then moves it three more times
- **THEN** `sizeChange` has been emitted twice

#### Scenario: Button released outside the window

- **WHEN** the next move of the active pointer reports no pressed buttons
- **THEN** the drag ends without emitting `sizeChange`

#### Scenario: Cancelled or lost pointer

- **WHEN** the active pointer is cancelled, or the handle loses its capture
- **THEN** the drag ends

#### Scenario: Handle destroyed during a drag

- **WHEN** the handle is destroyed while a drag is active
- **THEN** the drag ends and the document cursor is restored

### Requirement: Document cursor during a drag

While a drag is active, `document.body` SHALL carry the handle's cursor as an inline `cursor` with `!important` priority, and SHALL follow changes of that cursor during the drag. When the drag ends, the body's previous inline cursor SHALL be restored with its priority, or removed when there was none.

#### Scenario: Cursor kept off the handle

- **WHEN** a drag starts on a handle whose cursor is `col-resize`
- **THEN** the body has `cursor: col-resize !important`

#### Scenario: Cursor changes during a drag

- **WHEN** the handle's `cursor` input changes to `e-resize` during the drag
- **THEN** the body cursor becomes `e-resize`

#### Scenario: Consumer's cursor restored

- **WHEN** the body had an inline `cursor: wait !important` before the drag and the drag ends
- **THEN** the body has `cursor: wait !important` again

#### Scenario: No previous cursor

- **WHEN** the body had no inline cursor before the drag and the drag is cancelled
- **THEN** the body has no inline cursor

### Requirement: No keyboard or assistive-technology support

The directives MUST NOT add a `tabindex`, a `role`, ARIA attributes or keyboard handling to the handle or the container, so whether a handle is in the tab order depends only on its element. A handle SHALL be operable by pointer only unless the consumer adds those.

#### Scenario: Keyboard user

- **WHEN** a keyboard user tabs through a page with a resizer handle on a `div` that has no consumer additions
- **THEN** the handle is not in the tab order and no key resizes the element

#### Scenario: Handle on a focusable element

- **WHEN** the handle is a `button` with no consumer additions
- **THEN** Tab reaches the handle
- **AND** no key resizes the element

### Requirement: No styles of its own

The entry point SHALL ship no stylesheet. Apart from its class and the inline cursor, the directive MUST NOT style the handle: its size, position, hit area and `touch-action` are set by the consumer.

#### Scenario: Unstyled handle

- **WHEN** a handle is rendered without consumer styles
- **THEN** its only inline style is `cursor`
- **AND** it has no `touch-action` set by the directive

### Requirement: Server rendering

On the server the directives SHALL render their classes and the handle's inline cursor and MUST NOT attach pointer listeners. In the browser the listeners SHALL be attached after the first render.

#### Scenario: Server-rendered page

- **WHEN** a page with a resizer is rendered on the server
- **THEN** the HTML contains the `kbq-resizable` and `kbq-resizer` classes and the handle's `cursor` style
- **AND** no pointer listener is attached until the page runs in the browser

### Requirement: NgModule

`KbqResizerModule` SHALL import and export the `KbqResizable` and `KbqResizer` directives, so an NgModule that imports it can use both attributes.

#### Scenario: NgModule consumer

- **WHEN** an NgModule imports `KbqResizerModule`
- **THEN** its templates can use `kbqResizable` and `[kbqResizer]`
