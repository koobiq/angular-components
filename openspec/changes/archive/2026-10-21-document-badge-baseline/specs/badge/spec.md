# Spec Delta

## Purpose

Describes what `kbq-badge` from `@koobiq/components/badge` guarantees to consumers: how it renders its content, which host classes its color, fill and size inputs produce, how the caption and icons inside it are marked for spacing, and what it does not do for interaction and accessibility.

## ADDED Requirements

### Requirement: Badge is an element component with a module

The badge SHALL be a standalone component matched only by the `kbq-badge` element selector. `KbqBadgeModule` SHALL import and export the badge, the `kbq-badge-caption` directive and the icon spacing directive, so a template that imports the module gets all three.

#### Scenario: Rendering a badge through the module

- **WHEN** a template that imports `KbqBadgeModule` contains `<kbq-badge>New</kbq-badge>`
- **THEN** the element is a badge and shows the text "New"

#### Scenario: Attribute form is not supported

- **WHEN** a template contains `<span kbq-badge>New</span>`
- **THEN** no badge is created on the span

### Requirement: Badge host carries the base class

The badge host element SHALL always carry the `kbq-badge` class, whatever its inputs.

#### Scenario: Base class on a bare badge

- **WHEN** `<kbq-badge />` is rendered with no inputs and no content
- **THEN** the host element has the `kbq-badge` class

### Requirement: Default appearance

Without any input, the badge SHALL render filled, in the normal size and in the `fade-contrast` color: the host SHALL have `kbq-badge-filled` and `kbq-badge_fade-contrast`, and SHALL NOT have `kbq-badge-outline` or `kbq-badge_compact`.

#### Scenario: Badge without inputs

- **WHEN** a badge is rendered without `badgeColor`, `outline` or `compact`
- **THEN** the host has the `kbq-badge-filled` and `kbq-badge_fade-contrast` classes
- **AND** it has neither `kbq-badge-outline` nor `kbq-badge_compact`

### Requirement: Color values

`KbqBadgeColors` SHALL provide eleven colors: five fade colors (`fade-contrast`, `fade-theme`, `fade-success`, `fade-warning`, `fade-error`), five solid colors (`contrast`, `theme`, `success`, `warning`, `error`) and `disabled`. The enum member values SHALL be these strings.

#### Scenario: Enum value is the string

- **WHEN** a consumer reads `KbqBadgeColors.FadeSuccess`
- **THEN** the value is the string `fade-success`

#### Scenario: Every color renders

- **WHEN** one badge is rendered for each value of `KbqBadgeColors`
- **THEN** each badge has the `kbq-badge_<value>` class of its own color

### Requirement: Color is rendered as a host class

The `badgeColor` input SHALL be rendered as the host class `kbq-badge_<value>`. When the input changes, the badge SHALL remove the previous color class and add the new one, so the host carries exactly one color class at a time.

#### Scenario: Color class from the input

- **WHEN** a badge is rendered with `[badgeColor]="KbqBadgeColors.Error"`
- **THEN** the host has the `kbq-badge_error` class

#### Scenario: Changing the color

- **WHEN** the bound color changes from `error` to `success`
- **THEN** the host has `kbq-badge_success`
- **AND** it no longer has `kbq-badge_error`

### Requirement: Color given as a plain string

`badgeColor` SHALL accept a plain string as well as a `KbqBadgeColors` member. A string equal to a color value SHALL behave exactly like that member. Any other non-empty string SHALL still be rendered as the `kbq-badge_<value>` class, without an error or a warning.

#### Scenario: Static attribute with a color value

- **WHEN** a badge is written as `<kbq-badge badgeColor="fade-theme">`
- **THEN** the host has the `kbq-badge_fade-theme` class

#### Scenario: Unknown color string

- **WHEN** `badgeColor` is bound to the string `brand`
- **THEN** the host has the `kbq-badge_brand` class and nothing is logged

### Requirement: Empty color falls back to fade contrast

An empty string, `null` or `undefined` bound to `badgeColor` SHALL be replaced with `fade-contrast`, both in the host class and in the value the input reports.

#### Scenario: Empty string

- **WHEN** the bound color changes to an empty string
- **THEN** the host has the `kbq-badge_fade-contrast` class
- **AND** reading the badge's `badgeColor()` returns `fade-contrast`

#### Scenario: Null or undefined

- **WHEN** `badgeColor` is bound to `null` or `undefined`
- **THEN** the host has the `kbq-badge_fade-contrast` class

### Requirement: Color input reports the color, not the class

Reading `badgeColor()` on the badge instance SHALL return the color value itself (for example `error`), not the host class name built from it.

#### Scenario: Reading the bound color

- **WHEN** a badge is bound to `KbqBadgeColors.Error` and a consumer reads its `badgeColor()`
- **THEN** the result is `error`, not `kbq-badge_error`

### Requirement: Filled or outlined

The `outline` input SHALL switch the badge between the filled and the outlined style. With `outline` false the host SHALL have `kbq-badge-filled`; with `outline` true it SHALL have `kbq-badge-outline` instead. The host MUST NOT carry both classes at once.

#### Scenario: Outlined badge

- **WHEN** a badge is rendered with `[outline]="true"`
- **THEN** the host has `kbq-badge-outline` and does not have `kbq-badge-filled`

#### Scenario: Switching back to filled

- **WHEN** the bound `outline` value changes from `true` to `false`
- **THEN** the host has `kbq-badge-filled` and does not have `kbq-badge-outline`

### Requirement: Supported color and fill combinations

The prebuilt theme SHALL style a filled badge in each of the eleven colors and an outlined badge in the five fade colors and `disabled`, in light and dark themes and in both sizes. An outlined badge in a solid color (`contrast`, `theme`, `success`, `warning`, `error`) SHALL receive no text, background or border color from the theme.

#### Scenario: Outlined fade color

- **WHEN** a badge is rendered with `[outline]="true"` and `badgeColor` `fade-error`
- **THEN** the theme gives it the outlined error text and border colors on a transparent background

#### Scenario: Outlined solid color

- **WHEN** a badge is rendered with `[outline]="true"` and `badgeColor` `error`
- **THEN** the theme applies no color rule to it
- **AND** it inherits its text color from its parent and has no background of its own

### Requirement: Disabled is a color, not a state

`KbqBadgeColors.Disabled` SHALL only change how the badge looks. The badge has no `disabled` input, and with the `disabled` color it SHALL NOT set a `disabled` or `aria-disabled` attribute or block pointer events.

#### Scenario: Badge in the disabled color

- **WHEN** a badge is rendered with `badgeColor` `disabled`
- **THEN** the host has the `kbq-badge_disabled` class
- **AND** it has no `disabled` or `aria-disabled` attribute

### Requirement: Compact size

The `compact` input SHALL switch the badge to the compact size by adding the `kbq-badge_compact` host class. The class SHALL be absent while `compact` is false, which is the default.

#### Scenario: Compact badge

- **WHEN** a badge is rendered with `[compact]="true"`
- **THEN** the host has the `kbq-badge_compact` class

#### Scenario: Leaving the compact size

- **WHEN** the bound `compact` value changes from `true` to `false`
- **THEN** the host no longer has the `kbq-badge_compact` class

### Requirement: Boolean inputs accept attribute values

`compact` and `outline` SHALL coerce their values like boolean HTML attributes: a valueless attribute and an empty string SHALL mean `true`, and the string `'false'`, `null` and `undefined` SHALL mean `false`. Reading the input SHALL return the coerced boolean.

#### Scenario: Valueless attributes

- **WHEN** a badge is written as `<kbq-badge compact outline>`
- **THEN** the host has `kbq-badge_compact` and `kbq-badge-outline`
- **AND** it does not have `kbq-badge-filled`

#### Scenario: The string false

- **WHEN** `compact` is bound to the string `'false'`
- **THEN** reading `compact()` returns `false` and the host does not have `kbq-badge_compact`

### Requirement: Content is projected without a wrapper

The badge SHALL render its content as direct children of the host element, in source order, without adding any element of its own around or between them.

#### Scenario: Text and an icon

- **WHEN** a badge contains a `kbq-icon` element followed by the text "Normal"
- **THEN** the icon element and the text are direct children of the `kbq-badge` element

### Requirement: Caption directive

An element with the `kbq-badge-caption` attribute SHALL get the `kbq-badge-caption` class. Inside a badge, the badge SHALL style an element with that class as a secondary caption, spaced from the content before it, whether the class comes from the directive or is written by hand.

#### Scenario: Caption from the directive

- **WHEN** a badge contains `New <span kbq-badge-caption>0.8</span>`
- **THEN** the span has the `kbq-badge-caption` class and is styled as the badge's caption

#### Scenario: Caption class written by hand

- **WHEN** a badge contains `<div class="kbq-badge-caption">0.8</div>`
- **THEN** the div is styled as the badge's caption

### Requirement: Icon spacing needs the styler directive

The icon spacing classes SHALL be applied only where the icon spacing directive (`KbqBadgeCssStyler`, selector `kbq-badge`) is present, that is, in a template that imports `KbqBadgeModule` or imports that directive next to `KbqBadge`. A template that imports only `KbqBadge` SHALL render badges without any icon spacing class.

#### Scenario: Standalone import of the component alone

- **WHEN** a standalone component imports `KbqBadge` but neither `KbqBadgeModule` nor `KbqBadgeCssStyler`, and renders a badge with an icon before its text
- **THEN** neither the icon nor the badge gets an icon spacing class

### Requirement: Leading icon is marked

With the icon spacing directive present, when a `kbq-icon` that is a direct child of the badge is the first of more than one child node, the icon SHALL get the `kbq-icon_left` class and the badge host SHALL get `kbq-badge-icon_left`. Comment nodes SHALL NOT count as child nodes.

#### Scenario: Icon before the text

- **WHEN** a badge contains a `kbq-icon` followed by the text "Normal"
- **THEN** the icon has `kbq-icon_left` and not `kbq-icon_right`
- **AND** the badge host has `kbq-badge-icon_left` and not `kbq-badge-icon_right`

### Requirement: Trailing icon is marked

With the icon spacing directive present, when a `kbq-icon` that is a direct child of the badge is the last of more than one child node, the icon SHALL get the `kbq-icon_right` class and the badge host SHALL get `kbq-badge-icon_right`. Comment nodes SHALL NOT count as child nodes.

#### Scenario: Icon after the text

- **WHEN** a badge contains the text "Normal" followed by a `kbq-icon`
- **THEN** the icon has `kbq-icon_right`
- **AND** the badge host has `kbq-badge-icon_right`

#### Scenario: Icons on both sides

- **WHEN** a badge contains a `kbq-icon`, the text, a caption and another `kbq-icon`, in that order
- **THEN** the first icon has `kbq-icon_left` and the last icon has `kbq-icon_right`
- **AND** the badge host has both `kbq-badge-icon_left` and `kbq-badge-icon_right`

### Requirement: Icons that are alone, in the middle or nested are not marked

An icon that is the badge's only child node, an icon that is neither the first nor the last child node, and an icon nested inside another element of the badge SHALL get no icon spacing class, and SHALL NOT cause one on the badge host.

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

When an icon is added to or removed from the badge's direct content after the first render, for example by an `@if` block, the badge SHALL recompute the icon spacing classes of the host and of the icons it now contains.

#### Scenario: Icon projected after the first render

- **WHEN** a badge contains the text "Normal" and an `@if` block that adds a `kbq-icon` after the badge has rendered
- **THEN** the icon gets `kbq-icon_right` and the badge host gets `kbq-badge-icon_right`
- **AND** in the normal size the icon gets a 4 px left margin

#### Scenario: Icon removed again

- **WHEN** that `@if` block removes the icon again
- **THEN** the badge host no longer has `kbq-badge-icon_right`

### Requirement: Badge is not interactive

The badge SHALL NOT emit events, handle pointer or keyboard input, or take part in the tab order: it has no outputs, sets no `tabindex` and is not focusable on its own. Any interaction, such as a tooltip, comes from directives the consumer adds to the element.

#### Scenario: Tabbing past a badge

- **WHEN** the user presses Tab on a page whose badge has no added `tabindex`
- **THEN** focus moves past the badge without stopping on it

### Requirement: Badge adds no accessibility semantics

The badge SHALL NOT set a `role` or any ARIA attribute on its host. Assistive technology SHALL read its content as ordinary inline text, and its color, fill and size SHALL NOT be exposed to assistive technology.

#### Scenario: Accessible output of a colored badge

- **WHEN** a badge with `badgeColor` `error` contains the text "Failed"
- **THEN** the host has no `role` or `aria-*` attribute
- **AND** assistive technology announces only the text "Failed"
