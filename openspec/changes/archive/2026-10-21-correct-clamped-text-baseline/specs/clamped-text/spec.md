## MODIFIED Requirements

### Requirement: One hidden line is shown instead of a toggle

Once measured, `kbq-clamped-text` SHALL collapse and render its toggle only when its latest measurement found more than `rows` + 1 rendered lines. Content measured at `rows` + 1 lines or fewer SHALL be shown in full without a toggle, whatever `isCollapsed` requests. Only a resize of the content box is measured: a change of `rows` or of the content that keeps the box size leaves the toggle as last measured. The read-only `hasToggle` signal SHALL report whether the toggle is rendered.

#### Scenario: Content that fits

- **WHEN** `rows` is 5 and the content measures 3 lines
- **THEN** the content is not collapsed and no toggle is rendered

#### Scenario: Exactly one extra line

- **WHEN** `rows` is 19 and the content measures 20 lines
- **THEN** the full content is shown and no toggle is rendered

#### Scenario: Content that overflows

- **WHEN** `rows` is 5, `isCollapsed` is not set and the content measures 20 lines
- **THEN** the content is collapsed and the toggle is rendered

#### Scenario: Collapse requested for content that fits

- **WHEN** `isCollapsed` is `true` and the content measures 3 lines with `rows` at 5
- **THEN** the content is shown in full and no toggle is rendered

### Requirement: Collapsed state of the clamped text

`isCollapsed` of `kbq-clamped-text` SHALL accept `true` (collapsed), `false` (expanded) and `undefined` (the default: collapsed whenever the latest measurement found the content overflowing), and SHALL support two-way binding with `[(isCollapsed)]`. A value the parent writes SHALL take effect at once.

#### Scenario: Initially expanded

- **WHEN** `isCollapsed` is `false` from the start and the content overflows
- **THEN** after the measurement the text is expanded and the toggle has `aria-expanded="true"`

#### Scenario: Parent expands the text

- **WHEN** the text is collapsed and the parent sets `isCollapsed` to `false`
- **THEN** the text is expanded
