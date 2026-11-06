# Spec Delta

## MODIFIED Requirements

### Requirement: Handle needs a resizable container

A `kbqResizer` MUST NOT be created when no `KbqResizable`, set as the `kbqResizable` attribute or as a host directive, is on its own element, on an ancestor in the template that declares it, or on the host of that template's component or one of that host's ancestors: Angular SHALL throw its missing-provider error (NG0201) for `KbqResizable` when the view is created.

#### Scenario: Handle without a container

- **WHEN** a template places `[kbqResizer]` on an element with no `kbqResizable` element around it, neither in that template nor around the host of its component
- **THEN** creating the view throws a missing-provider error for `KbqResizable`

#### Scenario: Container on the host of the handle's component

- **WHEN** a component applies `KbqResizable` as a host directive and its own template places `[kbqResizer]` on an element with no `kbqResizable` around it
- **THEN** the handle is created without an error
- **AND** dragging it resizes the component's host element

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

### Requirement: No keyboard or assistive-technology support

The directives MUST NOT add a `tabindex`, a `role`, ARIA attributes or keyboard handling to the handle or the container, so whether a handle is in the tab order depends only on its element. A handle SHALL be operable by pointer only unless the consumer adds those.

#### Scenario: Keyboard user

- **WHEN** a keyboard user tabs through a page with a resizer handle on a `div` that has no consumer additions
- **THEN** the handle is not in the tab order and no key resizes the element

#### Scenario: Handle on a focusable element

- **WHEN** the handle is a `button` with no consumer additions
- **THEN** Tab reaches the handle
- **AND** no key resizes the element
