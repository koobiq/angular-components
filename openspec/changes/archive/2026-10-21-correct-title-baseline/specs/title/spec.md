# Spec Delta

## MODIFIED Requirements

### Requirement: Any of several text elements can trigger the tooltip

With several `#kbqTitleText` elements, the text SHALL count as truncated when any one of them overflows the container, and MUST NOT count as truncated when all of them fit the container and none of them is clipped by its siblings, as the requirement on text clipped by its siblings describes.

#### Scenario: One of two elements overflows

- **WHEN** a name and a value are both marked `#kbqTitleText` and only the value overflows the container
- **THEN** the text counts as truncated and hovering opens the tooltip

#### Scenario: Every element fits

- **WHEN** both elements fit the container and neither element's box is narrower than its own text
- **THEN** the text does not count as truncated

### Requirement: Container resizes are followed

The directive SHALL observe the size of the container it resolves when its view initializes, not the window, and SHALL re-evaluate truncation 100 ms after the last resize of that element. When the text then fits, an open tooltip SHALL close. A resize alone MUST NOT open the tooltip. A container that only becomes the measured one later, such as a `#kbqTitleContainer` rendered by `@if`, is measured on hover, but its own resizes are not followed.

#### Scenario: Container-only resize

- **WHEN** a splitter drag or a sidebar collapse resizes the container without resizing the window
- **THEN** truncation is re-evaluated

#### Scenario: Container grows until the text fits

- **WHEN** the container is resized so that its text fits
- **THEN** the tooltip is disabled 100 ms after the resize

#### Scenario: Container shrinks until the text is cut

- **WHEN** the container is resized so that its text overflows
- **THEN** the tooltip is enabled but opens only on the next hover or keyboard focus

#### Scenario: Container rendered after initialization

- **WHEN** a `#kbqTitleContainer` is rendered by `@if` after the directive has initialized, and only that element is resized
- **THEN** that resize does not re-evaluate truncation; the next hover or keyboard focus does

### Requirement: Blur and non-keyboard focus close the tooltip

When the host loses focus, or receives focus from the mouse, touch or a program, the directive SHALL close the tooltip and keep it closed until the next hover or keyboard focus. A click that moves focus onto a focusable host therefore closes a tooltip that hovering opened. A click that moves no focus, such as one on a host that already has focus, closes nothing and leaves an open tooltip open.

#### Scenario: Focus leaves the host

- **WHEN** the tooltip was opened by keyboard focus and the user tabs away
- **THEN** the tooltip closes

#### Scenario: Mouse focus after keyboard focus

- **WHEN** the tooltip was opened by keyboard focus and focus is then reported again for the host with the `mouse` origin, as `FocusMonitor.focusVia(host, 'mouse')` does
- **THEN** the tooltip closes

#### Scenario: Click on a host that already has focus

- **WHEN** the tooltip was opened by keyboard focus and the user then clicks the host
- **THEN** the tooltip stays open

### Requirement: Tooltip ignores pointer events by default

`ignoreTooltipPointerEvents` SHALL default to `true`, which puts the `cdk-overlay-pane_ignore-pointer-events` class on the tooltip's overlay pane so that clicks and hovers reach the content beneath it. Set to `false`, the pane SHALL stay hoverable like that of a plain `kbqTooltip`. The value SHALL be read once, when the first opening creates the overlay; the pane is reused, so a later change has no effect.

#### Scenario: Default pane

- **WHEN** the tooltip of a truncated host opens
- **THEN** its overlay pane has the `cdk-overlay-pane_ignore-pointer-events` class

#### Scenario: Opting out

- **WHEN** `[ignoreTooltipPointerEvents]="false"` is set before the tooltip first opens, and the tooltip opens
- **THEN** its overlay pane does not have that class

#### Scenario: Changing the input after the first opening

- **WHEN** the tooltip has opened once with the default and `ignoreTooltipPointerEvents` then becomes `false`
- **THEN** its overlay pane keeps the class on the next opening

### Requirement: Default placement keeps the tooltip centred

With no `kbqPlacementPriority` and the default `top` placement when its view initializes, the directive SHALL try the placements `top`, `bottom`, `right` and `left`, in that order, and no corner-anchored placement. An explicit `kbqPlacementPriority`, or a `kbqPlacement` other than `top`, present then SHALL be used unchanged. The default is set only then: it keeps precedence over a `kbqPlacement` changed later, and clearing an explicit priority later does not bring it back.

#### Scenario: Bare host

- **WHEN** neither `kbqPlacement` nor `kbqPlacementPriority` is set
- **THEN** the placement priority is `['top', 'bottom', 'right', 'left']`

#### Scenario: Explicit priority

- **WHEN** `[kbqPlacementPriority]="['bottom']"` is set
- **THEN** the placement priority is `['bottom']`

#### Scenario: Explicit placement

- **WHEN** `kbqPlacement` is `'left'` when the directive initializes
- **THEN** no placement priority is set and the tooltip's own fallbacks for `left` apply

#### Scenario: Placement changed after initialization

- **WHEN** a host initialized without `kbqPlacement` and `kbqPlacementPriority` later gets `kbqPlacement` `'left'`
- **THEN** the placement priority stays `['top', 'bottom', 'right', 'left']`, so the tooltip still opens on top when it fits there
