# divider Specification

## Purpose

Describes what `kbq-divider` from `@koobiq/components/divider` guarantees to consumers: how the line is oriented, spaced and sized in a layout, and how it is exposed to assistive technology as a separator or as a purely decorative line.

## Requirements

### Requirement: Divider element

The divider SHALL be available as the `kbq-divider` element, both by importing the standalone `KbqDivider` and through `KbqDividerModule`, which re-exports it. Its host element MUST always carry the `kbq-divider` class.

#### Scenario: Divider from the module

- **WHEN** a template imports `KbqDividerModule` and renders `<kbq-divider />`
- **THEN** a divider element with the `kbq-divider` class is rendered

#### Scenario: Divider from the standalone component

- **WHEN** a template imports `KbqDivider` and renders `<kbq-divider [vertical]="true" />`
- **THEN** a divider element with the `kbq-divider` class is rendered

### Requirement: Divider renders no content

The divider SHALL render an empty element. Content placed between `<kbq-divider>` and `</kbq-divider>` MUST NOT be rendered.

#### Scenario: Content inside the element

- **WHEN** a template renders `<kbq-divider>Section</kbq-divider>`
- **THEN** the divider element has no child content and the text "Section" is not shown

### Requirement: Divider is not interactive

The divider SHALL NOT be focusable and SHALL NOT react to keyboard or pointer input. It has no outputs and no public methods.

#### Scenario: Tabbing past a divider

- **WHEN** a divider sits between two focusable elements and the user presses Tab on the first one
- **THEN** focus moves to the second element without stopping on the divider

### Requirement: Horizontal by default

A divider without `vertical`, or with `vertical` set to `false`, SHALL be horizontal: its host carries the `kbq-divider_horizontal` class and MUST NOT carry `kbq-divider_vertical`.

#### Scenario: Default orientation

- **WHEN** a template renders `<kbq-divider />`
- **THEN** the host has the classes `kbq-divider` and `kbq-divider_horizontal`
- **AND** the host does not have the class `kbq-divider_vertical`

### Requirement: Vertical orientation

Setting `vertical` to `true` SHALL make the divider vertical: its host carries `kbq-divider_vertical` instead of `kbq-divider_horizontal`. Changing `vertical` at runtime SHALL swap the two classes.

#### Scenario: Vertical divider

- **WHEN** a template renders `<kbq-divider [vertical]="true" />`
- **THEN** the host has the class `kbq-divider_vertical`
- **AND** the host does not have the class `kbq-divider_horizontal`

#### Scenario: Orientation changed at runtime

- **WHEN** a horizontal divider's `vertical` binding changes to `true`
- **THEN** after change detection the host has the class `kbq-divider_vertical`

### Requirement: Boolean inputs accept attribute values

`vertical`, `paddings` and `decorative` SHALL coerce attribute values to booleans: the attribute present without a value MUST mean `true`, and the string `"false"` MUST mean `false`.

#### Scenario: Bare attribute

- **WHEN** a template renders `<kbq-divider vertical />`
- **THEN** the divider is vertical

#### Scenario: The "false" string

- **WHEN** a template renders `<kbq-divider paddings="false" />`
- **THEN** the divider has no spacing, as if `paddings` were bound to `false`

### Requirement: Default length follows the layout

Without `length`, the divider SHALL write no inline `width` or `height` and leave its length to the layout. A horizontal divider is a block box: it spans the width of a block container, while a flex row sizes it to its empty content, 0 px. A vertical divider has `height: 100%`: it fills a container of definite height, while in a container whose height depends on its content the percentage does not resolve and the line collapses to 0 px.

#### Scenario: No inline size by default

- **WHEN** a template renders `<kbq-divider />`
- **THEN** the host has neither an inline `width` nor an inline `height`

#### Scenario: Vertical divider in a container of fixed height

- **WHEN** a vertical divider without `length` sits in a container with a definite height of 50 px, such as one styled `height: 50px`
- **THEN** the line is 50 px tall

#### Scenario: Vertical divider in a container sized by its content

- **WHEN** a vertical divider without `length` sits in a block container whose height is `auto` and comes from a 50 px tall sibling
- **THEN** the line is 0 px tall

#### Scenario: Horizontal divider in a block container

- **WHEN** a horizontal divider without `length` sits in a block container
- **THEN** the line spans the full width of that container

### Requirement: Length sets the size along the line

When `length` is set, the divider SHALL write it in pixels as an inline `height` when vertical and as an inline `width` when horizontal. The other axis MUST be left without an inline size.

#### Scenario: Short vertical divider

- **WHEN** a template renders `<kbq-divider length="16" [vertical]="true" />`
- **THEN** the host has an inline `height` of `16px` and no inline `width`

#### Scenario: Short horizontal divider

- **WHEN** a template renders `<kbq-divider length="16" />`
- **THEN** the host has an inline `width` of `16px` and no inline `height`

### Requirement: Length accepts numbers and numeric strings

`length` SHALL accept a number or a string that parses as a finite number, zero included. Any other value, such as a non-numeric string, an empty string or `null`, MUST be treated as no length.

#### Scenario: Numeric binding

- **WHEN** `length` is bound to the number `16` on a horizontal divider
- **THEN** the host has an inline `width` of `16px`

#### Scenario: Explicit zero

- **WHEN** a template renders `<kbq-divider [length]="0" [vertical]="true" />`
- **THEN** the host has an inline `height` of `0px`

#### Scenario: Value that is not a number

- **WHEN** a template renders `<kbq-divider length="tall" [vertical]="true" />`
- **THEN** the host has no inline `height`

### Requirement: Length follows the orientation

When `vertical` changes at runtime, the divider SHALL move the `length` from one axis to the other, so that it always applies along the line.

#### Scenario: Horizontal divider turned vertical

- **WHEN** a divider with `length` 16 is horizontal and its `vertical` binding changes to `true`
- **THEN** after change detection the host has an inline `height` of `16px` and no inline `width`

### Requirement: Spacing is on by default

`paddings` SHALL default to `true`, and while it is `true` the host carries the `kbq-divider_paddings` class. Setting `paddings` to `false` MUST remove that class.

#### Scenario: Default spacing

- **WHEN** a template renders `<kbq-divider />`
- **THEN** the host has the class `kbq-divider_paddings`

#### Scenario: Spacing turned off

- **WHEN** a template renders `<kbq-divider [paddings]="false" />`
- **THEN** the host does not have the class `kbq-divider_paddings`

### Requirement: Spacing is a margin across the line

With `paddings` on, the divider SHALL space itself from the content around it with equal margins on both sides of its cross axis: top and bottom for a horizontal divider, left and right for a vertical one. It MUST have no margin along the line, and no margin at all with `paddings` off.

#### Scenario: Horizontal divider with spacing

- **WHEN** a horizontal divider has `paddings` on
- **THEN** it has equal top and bottom margins greater than zero
- **AND** its left and right margins are zero

#### Scenario: Vertical divider with spacing

- **WHEN** a vertical divider has `paddings` on
- **THEN** it has equal left and right margins greater than zero
- **AND** its top and bottom margins are zero

#### Scenario: Divider without spacing

- **WHEN** a divider of either orientation has `paddings` set to `false`
- **THEN** all four of its margins are zero

### Requirement: Divider is a separator

A divider that is not decorative SHALL carry `role="separator"`, so the boundary it draws is exposed to assistive technology.

#### Scenario: Default divider

- **WHEN** a template renders `<kbq-divider />`
- **THEN** the host has `role="separator"`
- **AND** axe reports no violations

### Requirement: Vertical separator reports its orientation

A vertical divider that is not decorative SHALL carry `aria-orientation="vertical"`. A horizontal divider MUST NOT carry `aria-orientation`, because horizontal is the ARIA default for a separator.

#### Scenario: Vertical separator

- **WHEN** a template renders `<kbq-divider [vertical]="true" />`
- **THEN** the host has `aria-orientation="vertical"`
- **AND** axe reports no violations

#### Scenario: Horizontal separator

- **WHEN** a template renders `<kbq-divider />`
- **THEN** the host has no `aria-orientation` attribute

#### Scenario: Orientation attribute follows the input

- **WHEN** a horizontal divider's `vertical` binding changes to `true`
- **THEN** after change detection the host has `aria-orientation="vertical"`

### Requirement: Decorative divider is presentational

`decorative` SHALL default to `false`. A decorative divider SHALL carry `role="presentation"` instead of `role="separator"` and MUST NOT carry `aria-orientation`, whatever its orientation.

#### Scenario: Decorative horizontal divider

- **WHEN** a template renders `<kbq-divider decorative />`
- **THEN** the host has `role="presentation"`
- **AND** axe reports no violations

#### Scenario: Decorative vertical divider

- **WHEN** a template renders `<kbq-divider decorative vertical />`
- **THEN** the host has no `aria-orientation` attribute

### Requirement: aria-hidden is left to the caller

The divider SHALL NOT set `aria-hidden` itself, in any state, and MUST keep an `aria-hidden` the caller puts on the element.

#### Scenario: Default divider has no aria-hidden

- **WHEN** a template renders `<kbq-divider />`
- **THEN** the host has no `aria-hidden` attribute

#### Scenario: Divider hidden by the caller

- **WHEN** a template renders `<kbq-divider aria-hidden="true" />`
- **THEN** the host keeps `aria-hidden="true"`
- **AND** axe reports no violations
