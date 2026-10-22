# table Specification

## Purpose

Describes what `table[kbq-table]` from `@koobiq/components/table` guarantees to consumers: a styling layer over a native `<table>` that keeps the platform's semantics, and how its `border`, `disableHover` and `stickyHeader` options change the rows, the cells and the focus behaviour of the controls inside them.

## Requirements

### Requirement: Applies to a native table with the kbq-table attribute

The component SHALL attach only to a native `<table>` element that carries the `kbq-table` attribute, and SHALL add the `kbq-table` class to it. A `<table>` without the attribute MUST stay unstyled, and the attribute on any other element MUST NOT create the component.

#### Scenario: Attribute on a table

- **WHEN** a template renders `<table kbq-table>` with no other options
- **THEN** the table element has the class `kbq-table` and no other class added by the component

#### Scenario: Table without the attribute

- **WHEN** a template that imports the table renders a plain `<table>`
- **THEN** the table gets no class and no table styles

#### Scenario: Attribute on another element

- **WHEN** a template renders `<div kbq-table>`
- **THEN** no table component is created and the element gets no class

### Requirement: Standalone and NgModule use

`KbqTable` SHALL be usable as a standalone import, and `KbqTableModule` SHALL import and re-export it for NgModule consumers, so either import makes `table[kbq-table]` available.

#### Scenario: Standalone import

- **WHEN** a standalone component lists `KbqTable` in its `imports` and renders `<table kbq-table>`
- **THEN** the table gets the `kbq-table` class

#### Scenario: Module import

- **WHEN** a component imports `KbqTableModule` and renders `<table kbq-table>`
- **THEN** the table gets the `kbq-table` class

### Requirement: Template reference

The component SHALL be exported as `kbqTable`, so a template reference variable gives access to the instance and to the current values of `border`, `disableHover` and `stickyHeader`, read as signals.

#### Scenario: Reading an option through the reference

- **WHEN** a template declares `<table kbq-table #table="kbqTable" border>` and renders `table.border()`
- **THEN** it renders `true`

### Requirement: Native semantics are kept

The component SHALL project its content unchanged and leave the semantics to the platform: it MUST NOT add a role, an ARIA attribute or a `tabindex` to the table, and it SHALL NOT handle keyboard or pointer input. Sorting, column resizing and row selection are not provided.

#### Scenario: Assistive technology reads a native table

- **WHEN** a `kbq-table` with header and body cells is rendered
- **THEN** the table element has no `role`, `aria-*` or `tabindex` attribute added by the component

#### Scenario: Axe check

- **WHEN** a `kbq-table` with a `kbq-button` in a body cell is checked with axe
- **THEN** no violations are reported

#### Scenario: Keyboard focus

- **WHEN** the user presses Tab through a page with a `kbq-table`
- **THEN** focus skips the table, its rows and its cells and stops only on the focusable content inside the cells

### Requirement: Cells are left untouched

The component SHALL NOT attach anything to the cells of a table: a `td` or `th`, inside or outside a `kbq-table`, keeps only the classes the consumer gives it, including a cell that holds a button.

#### Scenario: Cell with a button

- **WHEN** a template that imports the table renders a `kbq-table` and a plain `<table>`, each with a `kbq-button` in a body cell
- **THEN** neither cell has a class
- **AND** no element has the class `kbq-table-cell_has-button`

### Requirement: Options default to false and accept the bare attribute

`border`, `disableHover` and `stickyHeader` SHALL default to `false` and SHALL coerce their values with Angular's boolean-attribute rules, so a bare attribute such as `<table kbq-table border>` turns the option on, and a property binding such as `[border]="value"` follows the bound value.

#### Scenario: No options set

- **WHEN** a template renders `<table kbq-table>`
- **THEN** none of the three options is on

#### Scenario: Bare attributes

- **WHEN** a template renders `<table kbq-table border disableHover stickyHeader>`
- **THEN** all three options are on

#### Scenario: Property bindings

- **WHEN** `[border]`, `[disableHover]` and `[stickyHeader]` are bound to `true`
- **THEN** all three options are on

### Requirement: Modifier classes follow the options

The table SHALL carry the class `kbq-table_bordered` while `border` is on, `kbq-table_disable-hover` while `disableHover` is on and `kbq-table_sticky-header` while `stickyHeader` is on, and SHALL remove each class as soon as its option turns off again.

#### Scenario: Turning every option on

- **WHEN** the bindings of `border`, `disableHover` and `stickyHeader` change from `false` to `true`
- **THEN** the table has the classes `kbq-table_bordered`, `kbq-table_disable-hover` and `kbq-table_sticky-header`

#### Scenario: Turning an option off

- **WHEN** the binding of `disableHover` changes to `true` and then back to `false`
- **THEN** the table no longer has the class `kbq-table_disable-hover`

### Requirement: Width and wrapping follow the browser's table layout

The component SHALL NOT set the width of the table or limit the wrapping of cell content: the table SHALL be as wide as its content allows within its container, unless the consumer sets a width, and text that does not fit in a header or body cell SHALL wrap onto further lines, making the row taller.

#### Scenario: Long text in a narrow column

- **WHEN** a header or body cell holds more text than its column width allows
- **THEN** the text wraps onto further lines and every cell of that row grows to the same height

#### Scenario: Consumer sets the width

- **WHEN** the consumer sets `width: 100%` on a `kbq-table`
- **THEN** the table fills its container and the columns share the space

### Requirement: Cell content aligns to the inline start

Every header, body and footer cell SHALL align its content to the inline start of the text direction and on the text baseline of its row. Under `dir="rtl"` the alignment and the rounded row ends SHALL mirror. Setting `--kbq-table-cell-text-align` on the table element SHALL change the horizontal alignment of every cell.

#### Scenario: Left-to-right page

- **WHEN** a `kbq-table` renders in a left-to-right context
- **THEN** the content of every cell starts at its left edge

#### Scenario: Right-to-left context

- **WHEN** a `kbq-table` renders inside an element with `dir="rtl"`
- **THEN** the content of every cell starts at its right edge
- **AND** a highlighted body row is rounded at its outer left and right ends, not between its cells

#### Scenario: Alignment token

- **WHEN** the consumer sets `--kbq-table-cell-text-align: end` on a `kbq-table`
- **THEN** the content of every cell aligns to its inline end

### Requirement: The header row has a line under it

Every `th` cell of the `<thead>` SHALL have a line under it, whether or not `border` is on.

#### Scenario: Table without border

- **WHEN** a `kbq-table` without `border` renders a `<thead>` of `th` cells
- **THEN** a line separates the header row from the first body row
- **AND** no line separates the body rows from each other

### Requirement: A cell that holds a button keeps the row compact

A body or footer cell that contains a library button (an element with the class `kbq-button` or `kbq-button-icon`) SHALL use a reduced block padding, so that the row keeps about the height of the button instead of adding the full cell padding around it. Header cells MUST NOT change.

#### Scenario: Button in a body cell

- **WHEN** a body row holds a cell with `<button kbq-button>` and another body row holds only text
- **THEN** both rows have about the same height

### Requirement: border draws a line under every body row

With `border` on, every cell of every row of a `<tbody>` SHALL have a line under it, the last body row included. Rows of a `<tfoot>` MUST NOT get a line.

#### Scenario: Bordered table

- **WHEN** a `kbq-table` with `border` renders three body rows
- **THEN** a line runs under each of the three rows

#### Scenario: Bordered table with a footer

- **WHEN** a `kbq-table` with `border` renders body rows and a `<tfoot>` row
- **THEN** a line runs under each body row and no line runs under the footer row

### Requirement: Body rows highlight on hover

While the pointer is over a row of a `<tbody>`, every cell of that row, `td` and `th` alike, SHALL take the hover background. A body row with the class `kbq-hovered` SHALL be highlighted the same way without the pointer. Rows of the `<thead>` and the `<tfoot>` MUST NOT be highlighted.

#### Scenario: Pointer over a body row

- **WHEN** the pointer moves over a body row
- **THEN** every cell of that row has the hover background

#### Scenario: Row with the kbq-hovered class

- **WHEN** a body row led by a `<th scope="row">` carries the class `kbq-hovered`
- **THEN** the row header and the other cells of that row have the hover background

#### Scenario: Pointer over a footer row

- **WHEN** the pointer moves over a row of the `<tfoot>`
- **THEN** the row keeps its background

### Requirement: Highlighted body rows have rounded ends

Without `border`, the first and the last cell of each body row SHALL have rounded corners at the inline start and the inline end, so a highlighted row reads as one shape. The top corners of the first body row, and the bottom corners of the last body row when a `<tfoot>` directly follows its `<tbody>`, SHALL stay square. With `border` on, every corner SHALL stay square.

#### Scenario: Middle or last row highlighted

- **WHEN** the middle or the last body row of a `kbq-table` without `border` is highlighted
- **THEN** the highlight is rounded at all four corners

#### Scenario: First row highlighted

- **WHEN** the first body row is highlighted
- **THEN** the highlight is square at the top and rounded at the bottom

#### Scenario: Bordered table

- **WHEN** a body row of a `kbq-table` with `border` is highlighted
- **THEN** the highlight is square at every corner

#### Scenario: Last row above a footer

- **WHEN** the last body row of a `kbq-table` without `border` is highlighted and a `<tfoot>` follows its `<tbody>`
- **THEN** the highlight is square at the bottom

### Requirement: disableHover suppresses the highlight

With `disableHover` on, neither the pointer nor the `kbq-hovered` class SHALL change the background of any row.

#### Scenario: Row with the kbq-hovered class

- **WHEN** a `kbq-table` with `disableHover` has a body row with the class `kbq-hovered`
- **THEN** that row has the same background as the other rows

#### Scenario: Pointer over a row

- **WHEN** the pointer moves over a body row of a `kbq-table` with `disableHover`
- **THEN** the row keeps its background

### Requirement: stickyHeader pins the header cells

With `stickyHeader` on, the `th` cells of the `<thead>` SHALL stay at the top edge of the nearest scrolling ancestor while the rows scroll, SHALL be painted above the body cells and SHALL have a background, opaque by default, so the rows scrolled under them are hidden.

#### Scenario: Scrolling a table in a container

- **WHEN** a `kbq-table` with `stickyHeader` sits in a container with a fixed height and `overflow: auto`, and the container is scrolled down
- **THEN** the header row stays at the top of the container
- **AND** the body rows scroll under it and are not visible through it

### Requirement: The pinned header background is set by a token

The background of the pinned header SHALL come from `--kbq-table-sticky-header-background`, which the table element defines as the page background. Setting the property on the table element itself SHALL change the background of the pinned header, for example to match a card, a modal or a side panel. A value set only on an ancestor MUST NOT take effect, because the table defines its own.

#### Scenario: Default background

- **WHEN** a pinned header is shown on the page background
- **THEN** its background is the page background

#### Scenario: Table on a card

- **WHEN** the consumer sets `--kbq-table-sticky-header-background: var(--kbq-background-card)` in the `style` of a table placed on a card
- **THEN** the pinned header has the card's background

#### Scenario: Value set on the card

- **WHEN** the consumer sets `--kbq-table-sticky-header-background` only on the card that contains the table
- **THEN** the pinned header keeps the page background

### Requirement: The pinned header publishes its height

While `stickyHeader` is on, the table SHALL observe the size of the `<thead>` it has when `stickyHeader` turns on, or when the table first renders with `stickyHeader` on, and, each time a size is reported, SHALL set its rendered height in pixels as the custom property `--kbq-table-size-sticky-header-height` on the table element. A `<thead>` added, removed or replaced later is not followed until `stickyHeader` turns off and on again.

#### Scenario: Header measured

- **WHEN** `stickyHeader` turns on and the `<thead>` is reported at a height of 42 px
- **THEN** the table element has `--kbq-table-size-sticky-header-height: 42px`

#### Scenario: Header resized

- **WHEN** the `<thead>` of a pinned header changes height, for example because its text wraps
- **THEN** the property is updated to the new height

### Requirement: The height is published only while the header is pinned

Without `stickyHeader`, without a `<thead>` when `stickyHeader` turns on or the table first renders, or when the page is rendered on the server, the table SHALL NOT observe the header and SHALL NOT set `--kbq-table-size-sticky-header-height`. When `stickyHeader` turns off, the table SHALL remove the property and stop observing, so later size changes do not set it again. Removing the `<thead>` while `stickyHeader` stays on neither removes the property nor stops the observation.

#### Scenario: Header not pinned

- **WHEN** a `kbq-table` without `stickyHeader` renders a `<thead>`
- **THEN** the header is not observed and the table has no `--kbq-table-size-sticky-header-height`

#### Scenario: Header unpinned

- **WHEN** a pinned header has published its height and `stickyHeader` turns off
- **THEN** the property is removed from the table
- **AND** a later resize of the `<thead>` does not set it again

#### Scenario: Server rendering

- **WHEN** a `kbq-table` with `stickyHeader` is rendered on the server
- **THEN** the rendered table has no `--kbq-table-size-sticky-header-height`

### Requirement: A table rendered later measures its header

A table with `stickyHeader` that is created after the page has rendered, for example inside `@if` or `@defer`, SHALL observe the `<thead>` it is rendered with and publish its height.

#### Scenario: Table shown by a condition

- **WHEN** a `kbq-table` with `stickyHeader` inside `@if` is shown after the first render, and its `<thead>` is reported at 24 px
- **THEN** that `<thead>` is observed
- **AND** the table element has `--kbq-table-size-sticky-header-height: 24px`

### Requirement: Focused controls are not hidden under the pinned header

With `stickyHeader` on, every cell of the body and footer rows, and every `a`, `button`, `input`, `select`, `textarea`, `summary` and `[tabindex]` element inside those cells, SHALL use the published header height as its scroll margin at the block start (0 until a height is published), so a control focused from further down SHALL be scrolled into view below the pinned header rather than under it.

#### Scenario: Focusing a control above the visible rows

- **WHEN** a table with `stickyHeader` is scrolled to the bottom of its container and the user moves focus to a button in a body row above the visible rows
- **THEN** the container scrolls so that the top of the button is at or below the bottom edge of the pinned header
