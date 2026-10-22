## MODIFIED Requirements

### Requirement: Placement

`kbqAppSwitcherPlacement` SHALL set the preferred placement of the popup relative to the trigger, `bottomLeft` by default; binding `undefined` SHALL restore `bottomLeft`. The trigger SHALL emit `kbqPlacementChange` with the placement the overlay resolved to for the first position of every opening, and afterwards only when the applied position, or whether the trigger or the popup is clipped by or out of its scroll containers, changes. Re-applying an unchanged position emits nothing.

#### Scenario: Default placement

- **WHEN** no placement is bound
- **THEN** the trigger's `placement` is `bottomLeft`

#### Scenario: Bound placement reset

- **WHEN** `kbqAppSwitcherPlacement` is bound to `top` and then to `undefined`
- **THEN** the trigger's `placement` returns to `bottomLeft`

#### Scenario: Position re-applied unchanged

- **WHEN** the popup is open and its own list scrolls, so the overlay re-applies the position it already has
- **THEN** `kbqPlacementChange` does not emit

### Requirement: Outer scroll closes the switcher

Scrolling the document, or a scrollable container outside the popup that is registered with the CDK `ScrollDispatcher` (a `cdkScrollable` element or the viewport of a `kbq-scrollbar`), SHALL close it. A container that is not registered does not close it, because none of its scroll events reaches the switcher. Scrolling inside the popup or inside a site flyout, including the scrolling that keyboard navigation causes, MUST NOT close it.

#### Scenario: Scrolling the page

- **WHEN** the popup is open and the document scrolls
- **THEN** the popup closes

#### Scenario: Scrolling the list

- **WHEN** the popup is open and its own list scrolls
- **THEN** the popup stays open

#### Scenario: Scrolling an unregistered container

- **WHEN** the popup is open and an `overflow: auto` element outside it that is not registered with the CDK `ScrollDispatcher` scrolls
- **THEN** the popup stays open

### Requirement: Inline icon sanitization

Inline `icon` markup SHALL be filtered against an SVG allow-list of local names, in any namespace, before it is rendered. Scripts, `style`, `foreignObject` and `a` elements, HTML elements such as `img`, comments, `on*` attributes, `href` and `xlink:href` values other than `#` references, and `style` values containing `url(`, `expression(` or `javascript:` MUST be removed. Allowed SVG elements, gradients and `#` references SHALL be kept, as is an HTML element named like one, such as `title`.

#### Scenario: Typical icon

- **WHEN** the icon is an SVG with a `viewBox`, paths and fill attributes
- **THEN** the rendered markup keeps them

#### Scenario: Event handlers and scripts

- **WHEN** the icon contains an `onload` or `onclick` attribute or a `script` element
- **THEN** the rendered markup contains neither, and no script runs

#### Scenario: External references

- **WHEN** a `use` element references `//evil/x.svg#icon` or `javascript:` through `href` or `xlink:href`
- **THEN** the reference attribute is removed
- **AND** `href="#g"` pointing at a gradient in the same icon is kept

#### Scenario: Inline styles

- **WHEN** a `style` attribute contains `url(`
- **THEN** it is removed
- **AND** `style="fill:red"` is kept

#### Scenario: HTML element with an allowed name

- **WHEN** the icon is `<title>Logo</title>`, outside any `svg` element
- **THEN** the rendered markup keeps that HTML `title` element

### Requirement: Grouping by type

By default the applications of each site SHALL be grouped by the string form of `type`, so `1` and `'1'` count as one type: when more than `KBQ_MIN_NUMBER_OF_APPS_TO_ENABLE_GROUPING` (3) of them share a type, they SHALL render as one group row named after the type, with the icon of the first of them, followed by their rows. Types with three or fewer applications, and applications whose `type` is missing or falsy, SHALL render as plain rows.

#### Scenario: Four applications of one type

- **WHEN** a site has four applications of type `Group` and one without a type
- **THEN** the list shows a group row named `Group`, its four application rows and the untyped application

#### Scenario: Three applications of one type

- **WHEN** a site has exactly three applications of one type
- **THEN** they render as three plain rows and there is no group row

#### Scenario: Number and string of one type

- **WHEN** a site has two applications of type `1` and two of type `'1'`
- **THEN** the list shows one group row named `1`, followed by the four application rows

### Requirement: Row order

With the default grouping, group rows SHALL come first: types whose string form is a non-negative integer without leading zeros, such as `1` or `'20'`, in ascending numeric order, then the other types in the order in which they first appear. Applications without a type SHALL follow in their original order, and the applications of types too small to group SHALL come last, type by type in the same order.

#### Scenario: Small group moves after the untyped applications

- **WHEN** a site lists two applications of type `TypeA` followed by one without a type
- **THEN** the list shows the untyped application first and then the two `TypeA` applications

#### Scenario: Groups before plain rows

- **WHEN** a site lists four applications of one type and an untyped one
- **THEN** the group row comes before the untyped application

#### Scenario: Numeric types

- **WHEN** a site lists four applications of type `2` followed by four of type `1`
- **THEN** the group row `1` comes before the group row `2`

### Requirement: Flyout follows the row that opened it

A flyout SHALL list the applications of the row that opened it. When the pointer leaves a row whose flyout is open for another site or group row, the flyout SHALL switch to that row at once if the pointer is outside the triangle between the point where it left and the near edge of the open flyout, and otherwise once it has rested on that row for `NESTED_HOVER_SWITCH_DELAY` (50 ms). A row the pointer only crosses inside that triangle within that delay MUST NOT replace the flyout.

#### Scenario: Moving to another site row

- **WHEN** the flyout of site C is open and the pointer moves straight to the row of site B and stays there
- **THEN** after 50 ms the flyout lists the applications of site B

#### Scenario: Crossing a row on the way

- **WHEN** the flyout of site B is open and the pointer, on its way to that flyout inside the triangle, crosses the row of site C for less than 50 ms
- **THEN** the flyout still lists the applications of site B

#### Scenario: Reopening after a close

- **WHEN** the flyout of site B was closed and the flyout of site C is opened from the keyboard
- **THEN** it lists only the applications of site C

#### Scenario: Leaving the triangle

- **WHEN** the flyout of site C is open and the pointer reaches the row of site B outside the triangle towards that flyout
- **THEN** the flyout switches to site B without waiting for `NESTED_HOVER_SWITCH_DELAY`
