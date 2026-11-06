# Spec Delta

## MODIFIED Requirements

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
