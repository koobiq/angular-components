# Spec Delta

## MODIFIED Requirements

### Requirement: Color given as a plain string

`badgeColor` SHALL accept a plain string as well as a `KbqBadgeColors` member. A string equal to a color value SHALL behave exactly like that member. Any other non-empty string without whitespace SHALL still be rendered as the `kbq-badge_<value>` class, without an error or a warning. A string with whitespace in it SHALL be split at the whitespace into separate host classes, also without an error or a warning.

#### Scenario: Static attribute with a color value

- **WHEN** a badge is written as `<kbq-badge badgeColor="fade-theme">`
- **THEN** the host has the `kbq-badge_fade-theme` class

#### Scenario: Unknown color string

- **WHEN** `badgeColor` is bound to the string `brand`
- **THEN** the host has the `kbq-badge_brand` class and nothing is logged

#### Scenario: Color string with a space

- **WHEN** `badgeColor` is bound to the string `success foo`
- **THEN** the host has the `kbq-badge_success` and `foo` classes and nothing is logged

### Requirement: Supported color and fill combinations

The badge's own stylesheet, which loads with the component and is not part of the prebuilt theme, SHALL style a filled badge in each of the eleven colors and an outlined badge in the five fade colors and `disabled`, in light and dark themes and in both sizes, with colors taken from the global design tokens. An outlined badge in a solid color (`contrast`, `theme`, `success`, `warning`, `error`) SHALL receive no text, background or border color from it.

#### Scenario: Outlined fade color

- **WHEN** a badge is rendered with `[outline]="true"` and `badgeColor` `fade-error`
- **THEN** the badge stylesheet gives it the outlined error text and border colors on a transparent background

#### Scenario: Outlined solid color

- **WHEN** a badge is rendered with `[outline]="true"` and `badgeColor` `error`
- **THEN** the badge stylesheet applies no color rule to it
- **AND** it inherits its text color from its parent and has no background of its own

### Requirement: Leading icon is marked

With the icon spacing directive present, whenever the badge computes its icon classes (on the first render and when the set of its icons changes), a `kbq-icon` that is a direct child of the badge and the first of more than one child node at that moment SHALL get the `kbq-icon_left` class and the badge host SHALL get `kbq-badge-icon_left`. Comment nodes SHALL NOT count as child nodes; whitespace-only text nodes, such as the line breaks a template keeps with `preserveWhitespaces`, SHALL count.

#### Scenario: Icon before the text

- **WHEN** a badge contains a `kbq-icon` followed by the text "Normal"
- **THEN** the icon has `kbq-icon_left` and not `kbq-icon_right`
- **AND** the badge host has `kbq-badge-icon_left` and not `kbq-badge-icon_right`

### Requirement: Trailing icon is marked

With the icon spacing directive present, whenever the badge computes its icon classes (on the first render and when the set of its icons changes), a `kbq-icon` that is a direct child of the badge and the last of more than one child node at that moment SHALL get the `kbq-icon_right` class and the badge host SHALL get `kbq-badge-icon_right`. Comment nodes SHALL NOT count as child nodes; whitespace-only text nodes, such as the line breaks a template keeps with `preserveWhitespaces`, SHALL count.

#### Scenario: Icon after the text

- **WHEN** a badge contains the text "Normal" followed by a `kbq-icon`
- **THEN** the icon has `kbq-icon_right`
- **AND** the badge host has `kbq-badge-icon_right`

#### Scenario: Icons on both sides

- **WHEN** a badge contains a `kbq-icon`, the text, a caption and another `kbq-icon`, in that order
- **THEN** the first icon has `kbq-icon_left` and the last icon has `kbq-icon_right`
- **AND** the badge host has both `kbq-badge-icon_left` and `kbq-badge-icon_right`

### Requirement: Icons that are alone, in the middle or nested are not marked

When the badge computes its icon classes, an icon that is neither the first nor the last child node and an icon nested inside another element of the badge SHALL be left with no icon spacing class. An icon that is the badge's only child node SHALL NOT be given one, but keeps a class an earlier computation gave it. None of them SHALL cause an icon spacing class on the badge host. Between computations the classes stay as they are, even when content added later moves an icon into the middle.

#### Scenario: Icon-only badge

- **WHEN** a badge contains a single `kbq-icon` and nothing else
- **THEN** neither the icon nor the badge host has an icon spacing class

#### Scenario: Icon between two texts

- **WHEN** a badge contains text, a `kbq-icon` and a caption, in that order
- **THEN** the icon has neither `kbq-icon_left` nor `kbq-icon_right`

#### Scenario: Icon inside a wrapper element

- **WHEN** a badge contains `<span><i kbq-icon="kbq-play_16"></i></span>` followed by text
- **THEN** the icon has no icon spacing class

### Requirement: Icon classes follow icons added or removed later

When an icon is added to or removed from the badge's direct content after the first render, for example by an `@if` block, the badge SHALL recompute the icon spacing classes: it removes both host classes and, while more than one child node is left, reassigns the classes of every icon it contains. When one child node or fewer is left, the remaining icon keeps the classes it had. Content without a direct icon, such as text or a caption, added or removed later SHALL NOT trigger a recomputation.

#### Scenario: Icon projected after the first render

- **WHEN** a badge contains the text "Normal" and an `@if` block that adds a `kbq-icon` after the badge has rendered
- **THEN** the icon gets `kbq-icon_right` and the badge host gets `kbq-badge-icon_right`
- **AND** in the normal size the icon gets a 4 px left margin

#### Scenario: Icon removed again

- **WHEN** that `@if` block removes the icon again
- **THEN** the badge host no longer has `kbq-badge-icon_right`

#### Scenario: Text added after the first render

- **WHEN** a badge contains a `kbq-icon` followed by an `@if` block that adds the text "Normal" after the badge has rendered
- **THEN** the icon does not get `kbq-icon_left`
- **AND** the badge host does not get `kbq-badge-icon_left`

#### Scenario: One icon left after a removal

- **WHEN** a badge contains two `kbq-icon` elements and nothing else, the first inside an `@if` block, and that block removes the first icon
- **THEN** the badge host has neither `kbq-badge-icon_left` nor `kbq-badge-icon_right`
- **AND** the remaining icon keeps `kbq-icon_right`
