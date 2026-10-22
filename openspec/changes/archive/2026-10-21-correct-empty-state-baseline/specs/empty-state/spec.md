# Spec Delta

## MODIFIED Requirements

### Requirement: Alignment needs a height

The host SHALL be a vertical flex container that grows as a flex item inside a flex parent. It MUST NOT have an intrinsic height of its own: in a block container, and without a height set by the consumer, it is as tall as its content plus its padding, and the two alignments look the same. A parent that stretches its items, such as a flex container or a grid container whose row has a fixed height, gives it that height.

#### Scenario: Host with a height

- **WHEN** the host has a `min-height` larger than its content and `alignTop` is `true`
- **THEN** the content sits at the top and the free space is below it

#### Scenario: Host without a height

- **WHEN** the host is in a block container and has no height set
- **THEN** it is as tall as its content plus its padding, and changing `alignTop` does not move the content

#### Scenario: Host in a flex parent

- **WHEN** the host is the only child of a flex container with a fixed height and the default `align-items`
- **THEN** it fills that container, and the alignment applies within the container's height

#### Scenario: Host in a grid parent

- **WHEN** the host has no height set and is the only item of a grid container whose single row has a fixed height
- **THEN** it fills that row, and the alignment applies within the row's height

### Requirement: Error tint reaches an icon item in the illustration slot

While `errorColor` is `true`, the empty state SHALL add the `kbq-error` class to every `kbq-icon-item` that carries the `kbq-empty-state-icon` attribute itself or is declared inside that element in the same template, including the template of a component nested in its content, since the slot finds the empty state through dependency injection. An icon item that another component in the slot renders with no such mark in its own template MUST NOT be reached.

#### Scenario: Icon item on the slot element

- **WHEN** a `kbq-icon-item` carries `kbq-empty-state-icon` and `errorColor` is `true`
- **THEN** the icon has the `kbq-error` class

#### Scenario: Icon item wrapped by the slot element

- **WHEN** a `kbq-icon-item` sits inside a `<div kbq-empty-state-icon>` and `errorColor` is `true`
- **THEN** the icon has the `kbq-error` class

#### Scenario: Icon item inside another component

- **WHEN** the illustration slot holds a consumer component whose own template renders a `kbq-icon-item` with no `kbq-empty-state-icon` on it or on an element around it, and `errorColor` is `true`
- **THEN** that icon does not receive the `kbq-error` class from the empty state

#### Scenario: Error color set before the first render

- **WHEN** `errorColor` is already `true` when the icon first renders
- **THEN** the icon has the `kbq-error` class

#### Scenario: Slot attribute inside another component

- **WHEN** the illustration slot holds a consumer component whose own template renders `<i kbq-icon-item="kbq-bell_16" kbq-empty-state-icon>`, and `errorColor` is `true`
- **THEN** that icon has the `kbq-error` class

### Requirement: Content outside the slots is not rendered

The empty state has no default slot. Content that matches none of the four slot selectors at the top level of its content, by a slot attribute or `ngProjectAs`, and a control flow block with more than one root node, MUST NOT be rendered, and nothing SHALL be logged at runtime. For a slot element in such a block the Angular template type-check reports the `NG8011` warning. A control flow block with a single root element that carries a slot attribute SHALL be rendered in that slot.

#### Scenario: Element without a slot attribute

- **WHEN** the consumer puts a `<p>` without a slot attribute inside the empty state
- **THEN** the paragraph does not appear in the DOM, and nothing is logged

#### Scenario: Conditional slot with a single root

- **WHEN** an `@if` block contains only `<i kbq-empty-state-icon ...>` and its condition is `true`
- **THEN** the icon renders in the illustration slot

#### Scenario: Block with two roots

- **WHEN** an `@if` block contains both the illustration and the title elements
- **THEN** neither of them appears in the DOM, and nothing is logged at runtime
- **AND** the template type-check of the Angular compiler reports the `NG8011` warning for each of them at build time

#### Scenario: Element projected with ngProjectAs

- **WHEN** the consumer puts a `<p ngProjectAs="[kbq-empty-state-text]">` inside the empty state
- **THEN** the paragraph renders in the text slot
