# Spec Delta

## Purpose

Describes what `kbq-splitter` and `kbq-splitter-panel` from `@koobiq/components/splitter` guarantee to consumers: how panels are sized and laid out, how users resize them with a pointer, the keyboard or assistive technology, how panels snap and collapse, and how the layout and the collapsed state reach the host.

## ADDED Requirements

### Requirement: Only direct child panels take part

A splitter SHALL lay out, in declaration order, the `kbq-splitter-panel` elements that are its direct content children, including panels rendered by control-flow blocks such as `@for`. A panel separated from the splitter by a wrapper element MUST NOT be part of the layout and MUST NOT render a separator.

#### Scenario: Panels rendered by a loop

- **WHEN** three panels are rendered inside `kbq-splitter` by an `@for` block
- **THEN** the splitter lays out three panels

#### Scenario: Panel inside a wrapper element

- **WHEN** a panel sits inside a `<div>` that is a child of `kbq-splitter`
- **THEN** that panel gets no track of its own and renders no separator

### Requirement: A separator follows every panel but the last

Every panel except the last SHALL render, inside its own element and after its content, the separator between it and the next panel, so the separator comes between the two panels it resizes in the tab order as well as on screen. The last panel MUST NOT render a separator.

#### Scenario: Three panels

- **WHEN** a splitter has three panels
- **THEN** it has two separators
- **AND** the last panel contains none

### Requirement: Panels are sized by the splitter's grid

The splitter SHALL size its panels with an inline grid template on its own element — `grid-template-columns` when horizontal, `grid-template-rows` when vertical — whose tracks are percentages of the splitter's content box. The panels MUST NOT receive an inline width or height, and SHALL fill the splitter across the other axis.

#### Scenario: Horizontal splitter

- **WHEN** a horizontal splitter has been measured
- **THEN** it has an inline `grid-template-columns` with one percentage track per panel and no inline `grid-template-rows`

#### Scenario: After a drag

- **WHEN** the user drags a separator
- **THEN** neither panel element carries an inline width or height

### Requirement: Layout before the first measurement

Until the splitter has measured a non-zero size, it SHALL render one equal `1fr` track per panel, each allowed to shrink to zero, and every separator SHALL report `aria-valuenow="0"`, `aria-valuemin="0"` and `aria-valuemax="100"`. A drag or key press MUST NOT resize anything in that state. Measuring runs in the browser only, so server rendering produces the equal tracks.

#### Scenario: Not yet measured

- **WHEN** a splitter with two panels has been rendered but not measured
- **THEN** its `grid-template-columns` holds two equal `1fr` tracks

### Requirement: Panel content area

Each panel SHALL wrap its projected content in an element with the class `kbq-splitter-panel__content` that fills the panel, lays its children out as a column flex container and clips content larger than the panel.

#### Scenario: Content area styles

- **WHEN** a panel is rendered
- **THEN** its `.kbq-splitter-panel__content` has `display: flex`, `flex-direction: column` and `overflow: hidden`

### Requirement: Dragging a separator moves the boundary

Pressing a separator with the primary pointer button and moving the pointer SHALL move the boundary live, by exactly the pointer's travel along the resize axis, whatever padding the panels have. Pressing SHALL focus the separator without scrolling any ancestor. In right-to-left layout a horizontal splitter SHALL grow the leading panel as the pointer moves left.

#### Scenario: Dragging left

- **WHEN** two 300 px panels share a splitter and the user drags the separator 80 px to the left
- **THEN** the panels are 220 px and 380 px wide

#### Scenario: Panels with padding

- **WHEN** the panels have padding and the user drags the separator 30 px to the left
- **THEN** the first panel is exactly 30 px narrower

### Requirement: A press without travel changes nothing

A press and release on a separator with no pointer travel MUST NOT change any size, write the layout or emit `layoutChange`. A layout that is still derived from the panels SHALL stay derived, so later changes to the panels' `size` still apply.

#### Scenario: Click on a separator

- **WHEN** the host binds `[(layout)]` to an owned layout and the user clicks a separator without moving
- **THEN** `layoutChange` does not fire and the layout keeps its values

#### Scenario: Declared sizes keep applying

- **WHEN** the user presses a separator without moving and the host then changes the first panel's `size` to 400
- **THEN** the first panel becomes 400 px wide

### Requirement: Content ignores the pointer during a drag

From the press on a separator until its release, the splitter SHALL have the class `kbq-splitter_dragging`, and the content of its panels MUST NOT receive pointer events or start a text selection.

#### Scenario: Dragging over interactive content

- **WHEN** the user drags a separator over panel content that would react to the pointer
- **THEN** the content does not react and no text gets selected

### Requirement: Cursor shows the room left

A separator's cursor SHALL be `col-resize` in a horizontal splitter and `row-resize` in a vertical one while its boundary can move both ways. When it can move one way only, the cursor SHALL point that way (`e-resize` or `w-resize`, mirrored in right-to-left layout, or `s-resize` or `n-resize`). With no room at all, or while disabled, it SHALL be `default`.

#### Scenario: Leading panel at its maximum

- **WHEN** the first panel is at its `maxSize` in a horizontal splitter
- **THEN** the separator's cursor is `w-resize`

#### Scenario: Adjacent panel pinned but boundary movable

- **WHEN** the panel beside a boundary is at its maximum but panels further out still have room
- **THEN** the separator's cursor is `col-resize`

### Requirement: Appearance

The `appearance` input SHALL choose how the separators are drawn: `divider`, the default, a line; `transparent`, nothing visible; `handle`, a grip centred on the boundary. The splitter SHALL have the class `kbq-splitter_transparent` or `kbq-splitter_handle` for the last two and neither for `divider`.

#### Scenario: Handle appearance

- **WHEN** `appearance` is `handle`
- **THEN** the splitter element has the class `kbq-splitter_handle`

#### Scenario: Default appearance

- **WHEN** neither the input nor the options set an appearance
- **THEN** the splitter element's only class is `kbq-splitter`

### Requirement: Transparent separators stay invisible

With the `transparent` appearance the separator line MUST stay invisible at rest, on hover and during a drag, while the resize cursor and the keyboard focus frame SHALL still show.

#### Scenario: Hovering a transparent separator

- **WHEN** the user hovers a transparent separator
- **THEN** no line appears and the cursor is `col-resize`

#### Scenario: Keyboard focus on a transparent separator

- **WHEN** the user tabs onto a transparent separator
- **THEN** a focus frame is drawn and the line stays invisible

### Requirement: App-wide splitter options

`KBQ_SPLITTER_OPTIONS` SHALL default to `{ appearance: 'divider', snapTolerance: 32 }`. `kbqSplitterOptionsProvider(options)` SHALL override the given keys for the injector it is provided in, and the keys left out SHALL take the built-in defaults, not the values of a provider further up. An `appearance` or `snapTolerance` bound on a splitter or panel SHALL win over the options.

#### Scenario: Appearance from the provider

- **WHEN** `kbqSplitterOptionsProvider({ appearance: 'handle' })` is provided and a splitter binds no `appearance`
- **THEN** the splitter has the class `kbq-splitter_handle`

#### Scenario: Binding wins

- **WHEN** the provider sets `appearance: 'handle'` and a splitter binds `appearance="divider"`
- **THEN** the splitter has no appearance class

#### Scenario: Nested provider

- **WHEN** the application provides `{ appearance: 'handle' }` and a component provides `kbqSplitterOptionsProvider({ snapTolerance: 64 })`
- **THEN** splitters inside that component use the `divider` appearance

### Requirement: Orientation

The `orientation` input SHALL lay the panels out in a row when `horizontal`, the default, and in a column when `vertical`. A vertical splitter SHALL have the class `kbq-splitter_vertical` and resolve sizes against its height. Changing the orientation SHALL re-measure the splitter along the new axis.

#### Scenario: Vertical splitter

- **WHEN** `orientation` is `vertical`, the splitter is 600 px high and the first panel has `size` 200
- **THEN** the panels are 200 px and 400 px high
- **AND** the splitter sets `grid-template-rows` and no `grid-template-columns`

### Requirement: Disabled splitter ignores resizing

While `disabled` is set, the splitter SHALL have the class `kbq-splitter_disabled`, and pointer drags, arrow keys, Home, End, Enter and double-clicks on its separators MUST NOT change any size or collapsed state. Its separators MUST NOT react to hover or press.

#### Scenario: Dragging a disabled separator

- **WHEN** the splitter is disabled and the user drags a separator
- **THEN** the panels keep their sizes and the separator line does not change color

#### Scenario: Arrow key on a disabled separator

- **WHEN** the splitter is disabled and an arrow key is pressed on a separator
- **THEN** the panels keep their sizes

### Requirement: Disabled separators leave the tab order

While the splitter is disabled, every separator SHALL have `tabindex="-1"`, `aria-disabled="true"` and the `default` cursor. While enabled, separators SHALL have `tabindex="0"` and no `aria-disabled`.

#### Scenario: Disabled separator attributes

- **WHEN** the splitter is disabled
- **THEN** each separator has `tabindex="-1"` and `aria-disabled="true"`

### Requirement: Size values

`size`, `minSize`, `maxSize`, `collapsedSize` and each `snapSizes` entry SHALL accept a number of pixels, a numeric string of pixels with or without a `px` suffix in any case, or `<number>%` as a share of the splitter's content size along the resize axis. Surrounding whitespace SHALL be ignored, and units MAY be mixed within one splitter.

#### Scenario: Mixed units

- **WHEN** a 600 px splitter has panels with `size` `'25%'`, `'150px'` and no size
- **THEN** the panels are 150 px, 150 px and 300 px wide

#### Scenario: Percentage limits

- **WHEN** a panel has `size="25%"`, `minSize="10%"` and `maxSize="50%"` in a 600 px splitter
- **THEN** it opens at 150 px and a drag keeps it between 60 px and 300 px

### Requirement: Unsupported size values are ignored

A size in any other form, such as `'10rem'`, `'50vw'`, `'10 px'`, `'auto'` or `NaN`, SHALL be treated as not set. In development mode the panel SHALL log one `console.warn` per input and value, naming the input and the value and saying it is ignored. Production builds MUST NOT warn.

#### Scenario: Size in rem

- **WHEN** a panel has `minSize="10rem"` in development mode and another input of that panel changes later
- **THEN** exactly one warning mentioning `"10rem"` is logged
- **AND** the panel has no minimum

### Requirement: Initial sizes

Panels with a `size` SHALL start at it, and panels without one SHALL share what the sized panels leave in equal parts. While the layout is derived from the panels, percentages SHALL be resolved again whenever the splitter's size changes, and pixel sizes SHALL stay in pixels.

#### Scenario: One sized panel

- **WHEN** a 600 px splitter has three panels and only the first has `size` 200
- **THEN** each panel is 200 px wide

#### Scenario: Splitter grows

- **WHEN** the first panel has `size="25%"` and the splitter grows from 600 px to 800 px
- **THEN** the first panel grows from 150 px to 200 px

### Requirement: Sizes are fitted to the splitter

Initial and host-supplied sizes SHALL be clamped to each panel's `minSize` (default `0`) and `maxSize` (default unbounded), and the difference from the splitter's size SHALL be shared in equal parts among the panels that still have room, repeatedly, until the sizes add up or every panel is at a limit. A `maxSize` below the `minSize` SHALL be raised to the minimum.

#### Scenario: Declared size above the maximum

- **WHEN** a 600 px splitter has a first panel with `size` 500 and `maxSize` 200
- **THEN** the panels are 200 px and 400 px wide

#### Scenario: Declared sizes that do not fill the splitter

- **WHEN** both panels of a 600 px splitter declare `size` 100
- **THEN** each panel is 300 px wide

### Requirement: Unsatisfiable constraints are not rescaled

When the panels' minimums exceed the splitter, or their maximums fall short of it, the panels SHALL keep the sizes their limits allow and overflow or leave the rest of the splitter empty. They MUST NOT be rescaled to fit.

#### Scenario: Minimums too large

- **WHEN** three panels with `minSize` 250 share a 600 px splitter
- **THEN** each panel is 250 px wide and the panels overflow the splitter

#### Scenario: Maximums too small

- **WHEN** two panels with `maxSize` 100 share a 600 px splitter
- **THEN** each panel is 100 px wide

### Requirement: Resizing respects the panel limits

A drag or key press SHALL stop the boundary where the panel being shrunk reaches its `minSize` or the panel being grown reaches its `maxSize`, and no further panel on that side has room left.

#### Scenario: Dragging past the minimum

- **WHEN** the first panel has `minSize` 100 and the user drags its separator 400 px to the left from 300 px
- **THEN** the first panel stops at 100 px and the second is 500 px

#### Scenario: Dragging past the maximum

- **WHEN** the first panel has `maxSize` 400 and the user drags its separator 400 px to the right from 300 px
- **THEN** the first panel stops at 400 px and the second is 200 px

### Requirement: Resizing walks past a panel at its limit

When the panel beside a moving boundary is at its limit, the panels further out on the same side SHALL take or give up the rest, nearest first, so the boundary keeps moving; the boundary SHALL stop only when every panel on one side is at its limit. Panels further out MUST NOT move while the adjacent panel still has room.

#### Scenario: Adjacent panel at its maximum

- **WHEN** three panels are 200 px each, the middle one has `maxSize` 200, and the user drags the second separator 60 px to the right
- **THEN** the first panel grows by 60 px, the middle one stays at 200 px and the third shrinks by 60 px

#### Scenario: Adjacent panel at its minimum

- **WHEN** the second of three panels reaches its `minSize` while the first separator is dragged to the right
- **THEN** the third panel gives up the rest, so the second separator moves too

### Requirement: Layout two-way binding

The `layout` model SHALL be `null` by default, which means the sizes are derived from the panels. Every resize made by the user — a drag, the arrow keys, Home, End or the second double-click step — SHALL write the panel sizes to `layout` as percentages of the splitter in panel order and emit `layoutChange`.

#### Scenario: Persisting a layout

- **WHEN** the host binds `[(layout)]` and the user moves a separator with the arrow keys
- **THEN** the bound value becomes an array of percentages, one per panel

### Requirement: Host-supplied layout

A `layout` written by the host SHALL be applied as percentages of the splitter and fitted to the panel limits, without snapping and without writing the fitted values back. A layout whose length differs from the number of panels MUST be ignored in favour of the declared sizes.

#### Scenario: Restoring a layout

- **WHEN** the host sets `layout` to `[25, 75]` in a 600 px splitter
- **THEN** the panels are 150 px and 450 px wide

#### Scenario: Layout below a minimum

- **WHEN** the first panel has `minSize` 250 and the host sets `layout` to `[10, 90]` in a 600 px splitter
- **THEN** the panels are 250 px and 350 px wide
- **AND** `layout` still holds `[10, 90]`

#### Scenario: Wrong length

- **WHEN** a splitter with two panels receives `layout` `[20, 30, 50]`
- **THEN** the panels take their declared sizes

### Requirement: Clearing the layout

Setting `layout` back to `null` SHALL return the panels to the sizes they declare.

#### Scenario: Back to the declared sizes

- **WHEN** the first panel declares `size` 200, the layout is `[50, 50]` and the host sets it to `null`
- **THEN** the panels are 200 px and 400 px wide

### Requirement: Snapping on release

During a drag the boundary SHALL follow the pointer exactly. When the drag is released, the boundary SHALL move onto the nearest snap point within that point's tolerance, or stay where it is when none is close enough. A drag released with a collapsible panel beside the separator collapsed MUST NOT snap.

#### Scenario: Released near a snap size

- **WHEN** the first panel has `snapSizes` `[200, 400]` and the user releases a drag with it at 385 px
- **THEN** the first panel is 385 px wide until the release and 400 px after it

#### Scenario: Released far from every snap size

- **WHEN** the user releases the same drag with the first panel at 340 px
- **THEN** the first panel stays 340 px wide

### Requirement: Snap points around a separator

The snap points of a separator SHALL be the `snapSizes` of the panels on both sides of it. As soon as either of them declares any `snapSizes`, the `minSize` and `maxSize` of both SHALL become snap points too. A trailing panel's points SHALL name its own size. The nearest point SHALL win, and of two equally near points the one declared first, the leading panel's before the trailing panel's.

#### Scenario: Snap size of the trailing panel

- **WHEN** the second panel of a 600 px splitter has `snapSizes` `[200, 400]` with a tolerance of 150 and the user releases a drag with it at 340 px
- **THEN** the second panel becomes 400 px wide

#### Scenario: Minimum as a snap point

- **WHEN** the first panel has `minSize` 100 and `snapSizes` `[300]`, and a drag is released with it at 120 px
- **THEN** the first panel becomes 100 px wide

### Requirement: Snap tolerance

Each panel's `snapTolerance` SHALL set, in pixels, how close to one of its snap points a release has to be for the boundary to move onto it, and SHALL default to the `snapTolerance` of the splitter options, 32. Each snap point SHALL use the tolerance of the panel that declares it.

#### Scenario: Default tolerance

- **WHEN** the second panel of a 600 px splitter has `snapSizes` `[200]` and no `snapTolerance`
- **THEN** the panels start at 300 px each, because 200 is 100 px away

#### Scenario: Tolerance from the options

- **WHEN** the same splitter is rendered under `kbqSplitterOptionsProvider({ snapTolerance: 120 })`
- **THEN** the panels start at 400 px and 200 px

#### Scenario: Beyond a widened tolerance

- **WHEN** a panel has `snapSizes` `[200, 400]` and `snapTolerance` 150, and a drag is released 160 px from its nearest snap point
- **THEN** it stays where the drag left it

### Requirement: Initial layout settles on snap points

Sizes derived from the panels — at the start and after the layout is cleared — SHALL be settled onto the snap points, separator by separator, as if a drag had been released at each one. A layout supplied by the host MUST NOT be settled.

#### Scenario: Equal shares near a snap size

- **WHEN** a 600 px splitter has two panels and the second has `snapSizes` `[200, 350]` with a tolerance of 100
- **THEN** the panels start at 250 px and 350 px instead of 300 px each

#### Scenario: Supplied layout

- **WHEN** the second panel has `snapSizes` `[350]` and the host supplies `layout` `[45, 55]` in a 600 px splitter
- **THEN** the panels are 270 px and 330 px wide

### Requirement: Keyboard resizing does not snap

Resizing with the arrow keys, Home or End, and the minimum step of a double-click, MUST NOT move the boundary onto a snap point.

#### Scenario: Arrow key next to a snap size

- **WHEN** the first panel has `snapSizes` `[300]` and is 280 px wide, and the user presses the arrow that grows it
- **THEN** the panel becomes 288 px wide

### Requirement: Collapsing by drag

A `collapsible` panel beside the dragged separator SHALL stop at its `minSize` while the size the pointer asks for lies between half of its `minSize` and the minimum, and SHALL switch to its collapsed size, during the drag, once that size falls below half of the minimum; crossing back SHALL reopen it at the minimum. Panels further out and panels without `collapsible` MUST NOT collapse by drag.

#### Scenario: Waiting at the minimum

- **WHEN** a collapsible panel with `minSize` 160 and `collapsedSize` 40 is dragged so the pointer asks for 100 px
- **THEN** the panel is 160 px wide

#### Scenario: Passing the midpoint

- **WHEN** the same drag continues until the pointer asks for 60 px
- **THEN** the panel is 40 px wide before the drag is released

#### Scenario: Trailing panel

- **WHEN** the last panel is collapsible and the separator before it is dragged towards it past half of its minimum
- **THEN** the last panel collapses

#### Scenario: Panel that is not collapsible

- **WHEN** a panel without `collapsible` is dragged below half of its `minSize`
- **THEN** it stays at its minimum

### Requirement: Collapsed state binding

`collapsed` SHALL be a two-way model. A drag SHALL emit `collapsedChange` at the moment it crosses the midpoint, once per crossing, not on release. The host MAY set `collapsed` on any panel, even one without `collapsible`, and the splitter SHALL pin the panel to its collapsed size. A collapsed panel SHALL have the class `kbq-splitter-panel_collapsed`.

#### Scenario: Crossing twice in one drag

- **WHEN** the pointer crosses the midpoint of a collapsible panel and comes back in the same drag
- **THEN** `collapsedChange` emits `true` and then `false`, once each

#### Scenario: Host collapses a panel

- **WHEN** the host sets `collapsed` to `true` on a panel
- **THEN** the panel takes its collapsed size

### Requirement: Collapsed size

A collapsed panel SHALL take its `collapsedSize`, `0` by default, which hides it completely; pixels and percentages SHALL be accepted. The space it frees SHALL go to the open panels in equal parts.

#### Scenario: Percentage collapsed size

- **WHEN** a 600 px splitter has a collapsible first panel with `size` 200 and `collapsedSize="10%"`, and the panel collapses
- **THEN** the panels are 60 px and 540 px wide

### Requirement: Expanding restores the previous size

Expanding a panel through its `collapsed` model or Enter SHALL return it to the size it had before it collapsed, also after other separators have moved in between. While a panel is collapsed, its entry in `layout` SHALL hold that size rather than the strip it shows. A drag that expands a panel SHALL leave it where the pointer is, at least at its `minSize`.

#### Scenario: Drag-collapsed panel expanded by the host

- **WHEN** a 300 px collapsible panel is collapsed by a drag and the host then sets `collapsed` to `false`
- **THEN** the panel is 300 px wide again

#### Scenario: Another boundary moved meanwhile

- **WHEN** the first of three panels is collapsed, the second separator is moved, and the first panel is expanded
- **THEN** the first panel returns to its earlier size and the others make room for it

#### Scenario: Expanding by drag

- **WHEN** a collapsible panel with `minSize` 160 is collapsed to 40 px and the user drags its separator 220 px outwards
- **THEN** the panel is 260 px wide

### Requirement: Separator beside a panel collapsed to nothing

A separator next to a panel collapsed to size `0` SHALL stay rendered and focusable on the splitter's edge, half of its hit area clipped by the splitter, and the inner half SHALL still start a drag. Focusing it MUST NOT scroll the element the splitter sits in.

#### Scenario: Grabbing the edge separator

- **WHEN** the last panel of a nested splitter is collapsed to nothing and the user presses the inner half of the separator before it
- **THEN** the separator takes focus
- **AND** the element around the splitter does not scroll

### Requirement: Nested splitters are independent

A splitter placed inside a panel SHALL resize independently of the outer one: the outer splitter's orientation, appearance and disabled state MUST NOT apply to the nested splitter's separators, and a nested splitter SHALL keep its own size while one of its panels is pinned to a collapsed strip.

#### Scenario: Enabled splitter in a disabled one

- **WHEN** a horizontal splitter sits inside a panel of a disabled vertical splitter
- **THEN** its separator spans its full height and can be dragged

### Requirement: Arrow keys move the separator

On a focused separator, Left and Right Arrow in a horizontal splitter, and Up and Down Arrow in a vertical one, SHALL move the boundary by 8 px in the direction of the arrow and prevent the key's default action. The arrows of the other axis MUST be ignored and keep their default action.

#### Scenario: Right Arrow

- **WHEN** two panels are 300 px each and the user presses Right Arrow on the separator
- **THEN** the panels are 308 px and 292 px wide

#### Scenario: Arrow of the other axis

- **WHEN** the user presses Down Arrow on a separator of a horizontal splitter
- **THEN** the sizes do not change

### Requirement: Arrow keys in right-to-left layout

In a horizontal splitter in right-to-left layout, the arrow keys SHALL still move the boundary in the direction of the arrow, which shrinks the leading panel on Right Arrow. A direction changed after the first render SHALL take effect.

#### Scenario: Right Arrow in RTL

- **WHEN** the direction is `rtl` and the user presses Right Arrow on the separator between two 300 px panels
- **THEN** the panels are 292 px and 308 px wide

### Requirement: Home takes the leading panel to its minimum

Home on a separator SHALL resize the panel before it to its `minSize` as far as the panels after it can grow. When that panel is `collapsible` and already at its minimum, Home SHALL collapse it.

#### Scenario: Home

- **WHEN** the first panel has `minSize` 100 and the user presses Home on its separator
- **THEN** the first panel is 100 px wide

#### Scenario: Home again on a collapsible panel

- **WHEN** a collapsible panel with `minSize` 100 and `collapsedSize` 40 is at 100 px and the user presses Home
- **THEN** the panel collapses to 40 px

### Requirement: End takes the leading panel to its maximum

End on a separator SHALL first expand the panel before it when that panel is `collapsible`, then grow it to its `maxSize`, or as far as the panels after it can shrink. A panel without `collapsible` that the host collapsed MUST stay collapsed.

#### Scenario: End

- **WHEN** the first panel has `maxSize` 400, the second has `minSize` 150, and the user presses End
- **THEN** the panels are 400 px and 200 px wide

#### Scenario: Host-collapsed panel

- **WHEN** the host collapsed a panel that is not collapsible and the user presses End on its separator
- **THEN** the panel stays collapsed

### Requirement: Enter toggles the leading panel

Enter on a separator SHALL collapse the panel before it when expanded and expand it when collapsed, if that panel is `collapsible`, and prevent the key's default action. When the panel before the separator is not collapsible, Enter MUST do nothing.

#### Scenario: Collapse and expand

- **WHEN** a collapsible first panel of 200 px with `collapsedSize` 40 has focus on its separator and the user presses Enter twice
- **THEN** the panel becomes 40 px wide and then 200 px again

#### Scenario: Panel that is not collapsible

- **WHEN** the panel before the separator is not collapsible and the user presses Enter
- **THEN** the sizes do not change

### Requirement: F6 moves focus to a panel

F6 on a separator SHALL move focus to the panel after it, and Shift+F6 to the panel before it, preventing the key's default action. Panels SHALL be focusable by script with `tabindex="-1"` and MUST NOT be tab stops.

#### Scenario: F6 and Shift+F6

- **WHEN** the separator between two panels has focus and the user presses F6, then focuses the separator again and presses Shift+F6
- **THEN** focus moves to the second panel and then to the first

### Requirement: Modified key presses pass through

A key press on a separator with Alt, Ctrl or Meta held MUST NOT resize, collapse or move focus, and its default action MUST NOT be prevented, so browser shortcuts keep working.

#### Scenario: Ctrl+Home

- **WHEN** the user presses Ctrl+Home on a separator
- **THEN** the sizes do not change and the key's default action is not prevented

### Requirement: Keyboard focus frame

A separator SHALL draw its focus frame only when it was focused from the keyboard. Pressing or dragging it with a pointer SHALL keep it focused but MUST NOT show the frame.

#### Scenario: Dragging after tabbing in

- **WHEN** the user tabs onto a separator and then drags it with the pointer
- **THEN** the separator keeps focus and no longer shows the focus frame

### Requirement: Double-click resets the sizes

A double-click on a separator SHALL, when `layout` is not `null`, set it to `null` and emit `layoutChange` with `null`, which returns the panels to their declared sizes. When `layout` is already `null`, it SHALL resize the panel before the separator to its minimum. The double-click's default action SHALL be prevented.

#### Scenario: Two double-clicks

- **WHEN** the first panel declares `size` 200 and `minSize` 100, the user moves its separator, and then double-clicks it twice
- **THEN** the first panel is 200 px wide after the first double-click and 100 px after the second

#### Scenario: Nothing resized yet

- **WHEN** no resize has written the layout and the user double-clicks a separator
- **THEN** the panel before it goes straight to its minimum

### Requirement: Separator semantics

Each separator SHALL have `role="separator"`, an `aria-orientation` across the axis the panels are laid out along (`vertical` in a horizontal splitter, `horizontal` in a vertical one) and an `aria-controls` equal to the id of the panel before it.

#### Scenario: Horizontal splitter

- **WHEN** a horizontal splitter is rendered
- **THEN** its separator has `role="separator"`, `aria-orientation="vertical"` and `aria-controls` set to the first panel's id

#### Scenario: Orientation changes

- **WHEN** the splitter's orientation changes to `vertical`
- **THEN** the separator's `aria-orientation` becomes `horizontal`

### Requirement: Separator value

A separator's `aria-valuenow` SHALL be the size of the panel before it, and `aria-valuemin` and `aria-valuemax` the smallest and largest size that panel itself can still take, all as whole percentages of the splitter. Room that only panels further out could provide MUST NOT count, and the range SHALL ignore collapsing.

#### Scenario: Value range

- **WHEN** a 600 px splitter has a first panel with `minSize` 100 and `maxSize` 400 and a second with `minSize` 200
- **THEN** the separator has `aria-valuenow="50"`, `aria-valuemin="17"` and `aria-valuemax="67"`

#### Scenario: Pane pinned while the boundary can move

- **WHEN** the middle of three 200 px panels is at its `maxSize` of 200
- **THEN** the separator after it reports `aria-valuemax` equal to its `aria-valuenow`

### Requirement: Separator name

Each separator SHALL be named by its panel's `separatorAriaLabel` input when it is not empty, and otherwise by the localized `a11y.resizePanels` string of the active locale — "Изменить размер панелей" in the default `ru-RU`, "Resize panels" in `en-US` — following locale changes.

#### Scenario: Default name

- **WHEN** no locale is configured and the panel has no `separatorAriaLabel`
- **THEN** the separator has `aria-label="Изменить размер панелей"`

#### Scenario: Custom name

- **WHEN** the panel has `separatorAriaLabel="Resize the sidebar"`
- **THEN** its separator has that `aria-label`

### Requirement: Panel id

Each panel SHALL write its `id` input to its element, and SHALL generate a unique id with the prefix `kbq-splitter-panel-` when none is given.

#### Scenario: Generated id

- **WHEN** a panel has no `id`
- **THEN** its element has an id starting with `kbq-splitter-panel-` and the separator after it points at that id

### Requirement: Standalone and NgModule use

`KbqSplitter` and `KbqSplitterPanel` SHALL be standalone components with the selectors `kbq-splitter` and `kbq-splitter-panel`, exported to templates as `kbqSplitter` and `kbqSplitterPanel`. `KbqSplitterModule` SHALL import and re-export both for NgModule consumers.

#### Scenario: Template reference

- **WHEN** a template declares `#panel="kbqSplitterPanel"` on a panel
- **THEN** `panel.collapsed()` reads that panel's collapsed state
