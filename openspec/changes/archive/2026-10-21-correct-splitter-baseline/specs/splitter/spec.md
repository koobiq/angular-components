# Spec Delta

## MODIFIED Requirements

### Requirement: Layout before the first measurement

Until the splitter has measured a non-zero size, it SHALL render one equal `1fr` track per panel, each allowed to shrink to zero, and every separator SHALL report `aria-valuenow="0"`, `aria-valuemin="0"` and `aria-valuemax="100"`. A drag or an arrow key MUST NOT resize anything in that state; Enter, Home and End on the separator of a collapsible panel still change its `collapsed` state, applied once measured. Measuring runs in the browser only, so server rendering produces the equal tracks.

#### Scenario: Not yet measured

- **WHEN** a splitter with two panels has been rendered but not measured
- **THEN** its `grid-template-columns` holds two equal `1fr` tracks

#### Scenario: Enter before the first measurement

- **WHEN** a splitter with two panels has not been measured, the first panel is collapsible and the user presses Enter on its separator
- **THEN** the first panel's `collapsed` becomes `true`
- **AND** the splitter's `grid-template-columns` still holds two equal `1fr` tracks

### Requirement: Layout two-way binding

The `layout` model SHALL be `null` by default, which means the sizes are derived from the panels. Every resize made by the user — a drag, the arrow keys, End, Home unless it collapses the panel, or the second double-click step — SHALL write the panel sizes to `layout` as percentages of the splitter in panel order and emit `layoutChange`. Enter, and a Home press that collapses a panel, SHALL change only `collapsed` and leave `layout` as it is.

#### Scenario: Persisting a layout

- **WHEN** the host binds `[(layout)]` and the user moves a separator with the arrow keys
- **THEN** the bound value becomes an array of percentages, one per panel

#### Scenario: Home that collapses a panel

- **WHEN** `layout` is `null` and the user presses Home on the separator of a collapsible panel already at its `minSize`
- **THEN** the panel collapses
- **AND** `layoutChange` does not fire and `layout` stays `null`

### Requirement: Collapsed size

A collapsed panel SHALL take its `collapsedSize`, `0` by default, which hides it completely; pixels and percentages SHALL be accepted. When the host, Enter or Home collapses it while `layout` is set, the space it frees SHALL go to the open panels in equal parts. While the layout is derived, the open panels without a `size` SHALL share it in equal parts and those with one keep it; if all have one, all share it. After a drag collapses a panel, the open panels SHALL stay where the drag left them.

#### Scenario: Percentage collapsed size

- **WHEN** a 600 px splitter has a collapsible first panel with `size` 200 and `collapsedSize="10%"`, and the panel collapses
- **THEN** the panels are 60 px and 540 px wide

#### Scenario: Collapsing with a layout set by the host

- **WHEN** a 600 px splitter has three panels, `layout` is `[50, 25, 25]` and the host sets `collapsed` to `true` on the first panel, whose `collapsedSize` is `0`
- **THEN** the panels are 0 px, 300 px and 300 px wide

#### Scenario: Collapsing with a derived layout

- **WHEN** a 600 px splitter has a first panel with `size` 200, a second with `size` 100 and a third with none, `layout` is `null`, and the host sets `collapsed` to `true` on the first panel, whose `collapsedSize` is `0`
- **THEN** the panels are 0 px, 100 px and 500 px wide

### Requirement: Expanding restores the previous size

Expanding a panel through its `collapsed` model or Enter SHALL return it to the size it had before it collapsed, also after other separators have moved in between, when a drag collapsed it or `layout` was set at the time; outside a drag its `layout` entry then holds that size, not its strip. A panel collapsed while `layout` is `null` gets no such entry: a later resize writes its strip there. A drag that expands a panel SHALL leave it where the pointer is, at least at its `minSize`.

#### Scenario: Drag-collapsed panel expanded by the host

- **WHEN** a 300 px collapsible panel is collapsed by a drag and the host then sets `collapsed` to `false`
- **THEN** the panel is 300 px wide again

#### Scenario: Another boundary moved meanwhile

- **WHEN** the host has set `layout`, the first of three panels is collapsed, the second separator is moved, and the first panel is expanded
- **THEN** the first panel returns to its earlier size and the others make room for it

#### Scenario: Expanding by drag

- **WHEN** a collapsible panel with `minSize` 160 is collapsed to 40 px and the user drags its separator 220 px outwards
- **THEN** the panel is 260 px wide

#### Scenario: Collapsed while the layout is derived

- **WHEN** a 600 px splitter has three panels without `size`, the first collapsible with `minSize` 100 and `collapsedSize` 40, and the user presses Enter on the first separator, Right Arrow on the second and Enter on the first again
- **THEN** the first panel is 100 px wide, its `minSize`, rather than the 200 px it had before it collapsed

### Requirement: Separator beside a panel collapsed to nothing

A separator next to the first or the last panel collapsed to size `0` SHALL stay rendered and focusable on the splitter's edge, half of its hit area clipped by the splitter, and the inner half SHALL still start a drag. Focusing it MUST NOT scroll the element the splitter sits in.

#### Scenario: Grabbing the edge separator

- **WHEN** the last panel of a nested splitter is collapsed to nothing and the user presses the inner half of the separator before it
- **THEN** the separator takes focus
- **AND** the element around the splitter does not scroll

### Requirement: Separator value

A separator's `aria-valuenow` SHALL be the size of the panel before it, and `aria-valuemin` and `aria-valuemax` the smallest and largest size that panel itself can still take, all as whole percentages of the splitter. The room of every panel after the separator SHALL count, since the panel grows and shrinks against all of them; room that only the panels before it could take up MUST NOT count, and the range SHALL ignore collapsing.

#### Scenario: Value range

- **WHEN** a 600 px splitter has a first panel with `minSize` 100 and `maxSize` 400 and a second with `minSize` 200
- **THEN** the separator has `aria-valuenow="50"`, `aria-valuemin="17"` and `aria-valuemax="67"`

#### Scenario: Pane pinned while the boundary can move

- **WHEN** the middle of three 200 px panels is at its `maxSize` of 200
- **THEN** the separator after it reports `aria-valuemax` equal to its `aria-valuenow`

#### Scenario: Room behind the next panel

- **WHEN** three 200 px panels share a 600 px splitter and the second and the third have `minSize` 125
- **THEN** the separator after the first panel reports `aria-valuemax="58"`
