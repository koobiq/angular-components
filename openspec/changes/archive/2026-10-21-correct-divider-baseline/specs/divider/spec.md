# Spec Delta

## MODIFIED Requirements

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
