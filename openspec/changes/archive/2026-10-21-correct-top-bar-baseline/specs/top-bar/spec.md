# Spec Delta

## MODIFIED Requirements

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
