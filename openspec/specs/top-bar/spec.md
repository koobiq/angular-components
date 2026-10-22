# top-bar Specification

## Purpose

Describes what `kbq-top-bar` from `@koobiq/components/top-bar` guarantees to consumers: how the bar and its start, end and spacer slots lay out their content, how it sticks, layers against overlays and shows its shadow, and how it is exposed to assistive technology.

## Requirements

### Requirement: Bar projects its content in place

`kbq-top-bar` SHALL render the content placed inside it as written, in one default slot, without wrapping elements of its own, and SHALL carry the host class `kbq-top-bar`. The consumer marks the slots with `[kbqTopBarContainer]` and `[kbqTopBarSpacer]`; the bar MUST NOT require or check them.

#### Scenario: Slots become children of the bar

- **WHEN** a bar holds a start container, a spacer and an end container
- **THEN** the three elements are direct children of the `kbq-top-bar` element, in the order written

#### Scenario: Content outside a slot

- **WHEN** a bar holds a button with no container around it
- **THEN** the button is rendered inside the bar and no error is reported

### Requirement: Container placement modifiers

`[kbqTopBarContainer]` SHALL add the class `kbq-top-bar-container` and exactly one placement modifier: `kbq-top-bar-container_start` for `placement="start"` and `kbq-top-bar-container_end` for `placement="end"`. When `placement` changes, the modifier SHALL change with it.

#### Scenario: Start and end containers

- **WHEN** a bar has one container with `placement="start"` and one with `placement="end"`
- **THEN** the first carries `kbq-top-bar-container_start` and the second `kbq-top-bar-container_end`
- **AND** neither carries both modifiers

#### Scenario: Changing the placement

- **WHEN** the `placement` bound to a container changes from `start` to `end`
- **THEN** the container loses `kbq-top-bar-container_start` and gains `kbq-top-bar-container_end`

### Requirement: Container placement is required

`placement` of `[kbqTopBarContainer]` SHALL be a required input that accepts `'start'` or `'end'`. A template that applies the directive without it MUST be rejected by the AOT compiler with Angular's missing required input error.

#### Scenario: Container without a placement

- **WHEN** a template compiled ahead of time contains `<div kbqTopBarContainer></div>`
- **THEN** the Angular compiler reports that the required input `placement` is missing

### Requirement: Spacer class

`[kbqTopBarSpacer]` SHALL add the class `kbq-top-bar-spacer` to its element. It SHALL have no inputs.

#### Scenario: Spacer between the containers

- **WHEN** a bar has one element with `kbqTopBarSpacer`
- **THEN** exactly one element in the bar carries `kbq-top-bar-spacer`

### Requirement: NgModule re-exports the bar

`KbqTopBarModule` SHALL import and export `KbqTopBar`, `KbqTopBarContainer` and `KbqTopBarSpacer`, so a template declared in an NgModule that imports it can use all three. The three SHALL also be standalone and importable on their own.

#### Scenario: Module consumer

- **WHEN** a component imports `KbqTopBarModule` and its template uses the bar, two containers and a spacer
- **THEN** the bar, the containers and the spacer carry their classes

### Requirement: Row layout of the slots

The bar SHALL lay out its children in one row, centred vertically and pushed to its two edges. The start container SHALL grow to take the free width and keep its content at its start, with `--kbq-top-bar-container-start-gap` (default `0`) between its children. The end container SHALL keep its content at its end, with `--kbq-top-bar-container-end-gap` (default `--kbq-size-s`) between its children.

#### Scenario: Title and actions

- **WHEN** a bar has a title in its start container and two buttons in its end container
- **THEN** the title sits at the start edge and the buttons at the end edge
- **AND** the two buttons are separated by the end gap
- **AND** the start container takes the free width between them

### Requirement: Spacer keeps a fixed clearance

Inside a bar, `[kbqTopBarSpacer]` SHALL be exactly `--kbq-top-bar-spacer-min-width` wide (default `80px`) and MUST NOT grow or shrink, so the two containers stay that far apart however narrow the bar gets. Without a spacer, nothing SHALL separate the start container from the end container.

#### Scenario: Narrowing the bar

- **WHEN** a bar with a spacer between its containers is narrowed until its content no longer fits
- **THEN** the spacer stays 80 px wide

#### Scenario: Changing the clearance

- **WHEN** `--kbq-top-bar-spacer-min-width: 40px` is set on the bar
- **THEN** the spacer is 40 px wide

### Requirement: Start container minimum width

The start container SHALL shrink as the bar narrows, down to `--kbq-top-bar-container-start-min-width` (default `0`) and no further. Content in it that truncates with an ellipsis SHALL then be cut at that width.

#### Scenario: Long title in a narrow bar

- **WHEN** a bar is 320 px wide, `--kbq-top-bar-container-start-min-width` is `120px` and the title is longer than the space left by the end container
- **THEN** the title is truncated with an ellipsis
- **AND** the start container is not narrower than 120 px

#### Scenario: Default minimum width

- **WHEN** `--kbq-top-bar-container-start-min-width` is not set
- **THEN** the start container can shrink to no width at all

### Requirement: Spacing of overflowing actions

When a `kbqOverflowItems` element is a direct child of a bar container, the container SHALL clip what overflows without making the bar taller, and adjacent action buttons and the overflow result SHALL be separated by `--kbq-top-bar-container-end-gap`. An overflow host nested deeper than that MUST NOT get this spacing or clipping from the bar.

#### Scenario: Overflow host as a direct child

- **WHEN** the end container holds a `kbqOverflowItems` element and some of its buttons are hidden for lack of space
- **THEN** the visible buttons and the "more" button are separated by the end gap
- **AND** the bar is as tall as a bar whose actions all fit

#### Scenario: Overflow host wrapped in another element

- **WHEN** the `kbqOverflowItems` element is wrapped in another element inside the end container
- **THEN** the bar adds no spacing between its buttons, and the consumer spaces them

### Requirement: Sticky positioning needs an inset

The bar SHALL be positioned with `--kbq-top-bar-position` (default `sticky`) and `--kbq-top-bar-inset-block-start` (default `auto`), so by default it MUST scroll with the content like a relatively positioned box. Setting `--kbq-top-bar-inset-block-start`, for example to `0`, SHALL make it stick at that distance from the top of its nearest scrolling ancestor only within its parent element: the bar leaves with its parent, and a parent that holds only the bar gives it no room to stick.

#### Scenario: Default bar in a scrolling element

- **WHEN** a bar with the default custom properties is inside a scrolling element and the element is scrolled
- **THEN** the bar scrolls out of view with the content

#### Scenario: Bar with an inset

- **WHEN** `--kbq-top-bar-inset-block-start: 0` is set on a bar whose parent is a scrolling element that also holds the content, and the element is scrolled by 200 px
- **THEN** the bar stays at the top of the element and the scrolled content passes under it

#### Scenario: Bar wrapped in an element of its own

- **WHEN** `--kbq-top-bar-inset-block-start: 0` is set on a bar that is the only child of a `<header>` inside a scrolling element, and the element is scrolled
- **THEN** the bar scrolls out of view with the `<header>`

### Requirement: Shadow modifier

`withShadow` SHALL default to `false` and accept the bare attribute form. While it is `true`, the host SHALL carry `kbq-top-bar_with-shadow` and draw the `--kbq-top-bar-shadow-bottom` shadow; when it turns `false`, the class and the shadow SHALL be removed. The bar MUST NOT set the shadow on its own, for example when content scrolls under it.

#### Scenario: Bare attribute

- **WHEN** the template writes `<kbq-top-bar withShadow>`
- **THEN** the host carries `kbq-top-bar_with-shadow`

#### Scenario: Turning the shadow off again

- **WHEN** `withShadow` is bound to `true` and then to `false`
- **THEN** the host no longer carries `kbq-top-bar_with-shadow`

#### Scenario: Content scrolled under the bar

- **WHEN** `withShadow` is not set and the content scrolls under a sticky bar
- **THEN** the bar shows no shadow until the consumer sets `withShadow`

### Requirement: Shadow fades in

With animations enabled, the shadow SHALL appear with the `--kbq-top-bar-shadow-transition` transition (default `ease-out 300ms`). The transition SHALL apply only to the shadow appearing: when `withShadow` turns `false`, the shadow MUST disappear at once.

#### Scenario: Turning the shadow on and off

- **WHEN** `withShadow` turns `true`
- **THEN** the shadow fades in over 300 ms
- **AND** when `withShadow` turns `false` again, the shadow disappears without a transition

### Requirement: Shadow without motion

The host SHALL carry `kbq-animations-disabled` when, at its creation, animations are turned off by `KBQ_ANIMATIONS_CONFIG` with `animationsDisabled: true`, by `provideNoopAnimations()` or by the user's reduced-motion setting; the shadow then MUST appear without a transition. While the user asks for reduced motion, the shadow SHALL appear without a transition whatever the host's classes.

#### Scenario: Animations turned off by configuration

- **WHEN** `KBQ_ANIMATIONS_CONFIG` provides `{ animationsDisabled: true }` and the bar has `withShadow`
- **THEN** the host carries both `kbq-top-bar_with-shadow` and `kbq-animations-disabled`

#### Scenario: Animations on

- **WHEN** nothing turns animations off and the bar has `withShadow`
- **THEN** the host does not carry `kbq-animations-disabled`

#### Scenario: Reduced motion

- **WHEN** the user's system asks for reduced motion and `withShadow` turns `true`
- **THEN** the shadow appears without a transition

### Requirement: Layer of the bar

The bar SHALL have the `z-index` of `--kbq-top-bar-z-index` (default `990`): above the page content and the layer of a `kbqOverlayLayer` element (`980`), below the application-wide overlay container (`1000`). Panels opened from inside the bar and panels opened from page content outside any `kbqOverlayLayer` element SHALL paint over the bar.

#### Scenario: Dropdown opened from a sticky bar

- **WHEN** a bar sticks above content scrolled by 200 px and the user opens a dropdown from a button in the bar
- **THEN** the scrolled rows pass under the bar
- **AND** the dropdown panel paints over the bar

#### Scenario: Panel opened from the page content

- **WHEN** no `kbqOverlayLayer` element is used and a panel opened from the page content overlaps the bar
- **THEN** the panel paints over the bar

### Requirement: Panels opened from the bar stay above it inside an overlay layer

The bar SHALL apply `kbqOverlayLayerExclude` to its host, which carries the class `kbq-overlay-layer-exclude`. Panels opened from controls inside the bar SHALL stay in the application-wide overlay container even when the bar is inside a `kbqOverlayLayer` element.

#### Scenario: Dropdown from a bar inside an overlay layer

- **WHEN** the bar is inside a `kbqOverlayLayer` element and a dropdown is opened from a button in the bar
- **THEN** the dropdown's pane is in the application-wide overlay container, not in the container of the layer

### Requirement: Custom properties are read from the bar element

The bar SHALL declare the defaults of its `--kbq-top-bar-*` custom properties on its own element with zero specificity, outside any cascade layer. A value set on the bar element by an inline style, or by a rule outside any cascade layer with a non-zero specificity, SHALL override the default; a rule in a cascade layer MUST NOT. A value set only on an ancestor of the bar MUST NOT reach it. A value set on the slot element that reads it SHALL apply to that slot.

#### Scenario: Value set on the bar

- **WHEN** `style="--kbq-top-bar-container-start-min-width: 120px"` is set on the `kbq-top-bar` element
- **THEN** the start container does not shrink below 120 px

#### Scenario: Value set on an ancestor

- **WHEN** `--kbq-top-bar-inset-block-start: 0` is set only on an ancestor of the bar
- **THEN** the bar keeps the default `auto` and does not stick

#### Scenario: Value set on the start container

- **WHEN** `--kbq-top-bar-container-start-min-width: 115px` is set on the element with `kbq-top-bar-container_start`
- **THEN** that container does not shrink below 115 px

#### Scenario: Value set in a cascade layer

- **WHEN** `--kbq-top-bar-inset-block-start: 0` is set on `.kbq-top-bar` by a rule inside an `@layer` block
- **THEN** the bar keeps the default `auto` and does not stick

### Requirement: No landmark role

The bar MUST NOT set a `role` on its host, so it is exposed as a generic element until the consumer gives it one. A `role` attribute written on the `kbq-top-bar` element, such as `role="banner"`, SHALL be rendered as written.

#### Scenario: Bar without a role

- **WHEN** a bar is rendered with no `role` attribute
- **THEN** the host has no `role` attribute

#### Scenario: Bar as the page header

- **WHEN** the template writes `<kbq-top-bar role="banner">`
- **THEN** the host has `role="banner"`

### Requirement: Accessible name

The `aria-label` input SHALL be rendered as the host's `aria-label` attribute when it is a non-empty string. When it is unset, `null` or an empty string, the host MUST NOT have an `aria-label` attribute.

#### Scenario: Static attribute

- **WHEN** the template writes `<kbq-top-bar aria-label="Dashboards">`
- **THEN** the host has `aria-label="Dashboards"`

#### Scenario: Empty string

- **WHEN** `[aria-label]` is bound to `''`
- **THEN** the host has no `aria-label` attribute

#### Scenario: Null

- **WHEN** `[aria-label]` is bound to `null`
- **THEN** the host has no `aria-label` attribute

### Requirement: No focus handling

The bar and its directives MUST NOT add a tab stop, a `tabindex` or keyboard handling of their own. Controls inside the bar SHALL keep their own tab order, and the arrow keys MUST NOT move focus between them.

#### Scenario: Tabbing through the bar

- **WHEN** the user presses Tab repeatedly from before a bar with three buttons
- **THEN** focus moves through the three buttons in document order and never lands on the bar itself

#### Scenario: Arrow keys inside the bar

- **WHEN** a button in the bar has focus and the user presses Right
- **THEN** focus stays on that button

### Requirement: Populated bar passes axe

A bar with `role="banner"`, an `aria-label`, a heading in its start container, a spacer and a button in its end container SHALL have no axe-core violations among the rules that run without rendering.

#### Scenario: Axe check of a page header

- **WHEN** axe-core checks such a bar
- **THEN** it reports no violations
