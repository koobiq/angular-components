# Spec Delta

## MODIFIED Requirements

### Requirement: Horizontal navbar collapses items to fit

When the content of a `kbq-navbar` is wider than the navbar, the navbar SHALL collapse collapsable items, starting from the last collapsable one, until the content fits or none is left. The gap between containers SHALL count as content. A collapsed item SHALL carry `kbq-navbar-item_collapsed` and hide its title, suffix and chevron, while its leading icon and any other projected content, such as a badge, stay visible.

#### Scenario: Collapsing just enough

- **WHEN** three items and a divider of 100 px each sit in a 350 px navbar
- **THEN** only the last item collapses

#### Scenario: Gap between containers

- **WHEN** two 100 px items in one container and a 100 px item in a second container 24 px away sit in a 320 px navbar
- **THEN** the second item collapses

#### Scenario: Content never overflows

- **WHEN** the navbar is narrowed step by step until every collapsable item has collapsed
- **THEN** at no step does the content reach past the right edge of the navbar

### Requirement: Collapsed vertical navbar shows icons only

While a vertical navbar is collapsed, its items SHALL hide their titles, suffixes and chevrons, while their leading icons and any other projected content, such as a badge, stay visible, and the brand SHALL hide its title. Expanding the navbar SHALL show them again.

#### Scenario: Suffix of a collapsed navbar

- **WHEN** an item with a suffix icon is rendered in a collapsed vertical navbar
- **THEN** the item is visible and its suffix is hidden

#### Scenario: Badge of a collapsed navbar

- **WHEN** an item with an icon, a title and a `kbq-badge` is rendered in a collapsed vertical navbar
- **THEN** its icon and its badge are visible and its title is hidden

### Requirement: When the brand title is measured

The brand SHALL measure its title after its first render, again 100 ms after the last change to the brand's width, the title text or the loaded fonts, and on every expand of a vertical navbar before the next frame is painted, so the first expand never shows the default presentation of a title that needs the compact one. While a vertical navbar is collapsed its title is hidden and not measured, and the brand SHALL keep the presentation it last measured.

#### Scenario: Text changes

- **WHEN** the title text becomes too long for one line while the title is shown
- **THEN** the brand switches to the compact presentation 100 ms later

#### Scenario: First expand

- **WHEN** a vertical navbar that started collapsed is expanded and its brand title needs the compact presentation
- **THEN** the first frame of the expanded navbar already shows the compact presentation

#### Scenario: Text changes while collapsed

- **WHEN** the title text of a brand in a collapsed vertical navbar becomes too long for one line
- **THEN** the brand keeps its presentation while the navbar stays collapsed, and the first frame of the expanded navbar shows the compact presentation

### Requirement: Automatic tooltip of items and brands

Unless `kbqTooltipDisabled` is set, the tooltip of an item or brand SHALL be enabled exactly when its title cannot be read from the element itself: the element is collapsed, its title is cut, or it has no title. A collapsed element SHALL show its title text, or `collapsedText` when set; a cut title SHALL show that text in full; an element without a title SHALL keep the text bound to `tooltipText`, except while it is collapsed with `collapsedText` set, which then replaces it.

#### Scenario: Expanded item with a readable title

- **WHEN** an item has a title that fits and is not collapsed
- **THEN** its tooltip is disabled

#### Scenario: Collapsed item

- **WHEN** the same item is collapsed
- **THEN** its tooltip is enabled and shows the title text

#### Scenario: Cut title in an expanded vertical navbar

- **WHEN** an item title is wider than an expanded vertical navbar allows and the user hovers the item
- **THEN** a tooltip with the full title appears

#### Scenario: Item without a title

- **WHEN** an icon-only item has `tooltipText="Notifications"` and is collapsed
- **THEN** its tooltip is enabled and shows "Notifications"

#### Scenario: Item without a title and with collapsed text

- **WHEN** an icon-only item has `tooltipText="Notifications"` and `collapsedText="Alerts"` and is collapsed
- **THEN** its tooltip is enabled and shows "Alerts"

### Requirement: One tab stop per navbar

The navbar host SHALL hold the tab stop of its items, brand and `kbq-navbar-toggle` element, with the `tabIndex` input as its `tabindex`, 0 by default. Every item, brand and `kbq-navbar-toggle` element SHALL have `tabindex="-1"`, links and native buttons included, and the first `kbq-button` projected into an item or brand SHALL be taken out of the tab order. Other focusable content keeps its own tab stop, such as a `<button kbq-navbar-toggle>` and the control of a projected `kbq-form-field`.

#### Scenario: Default tab indexes

- **WHEN** a navbar with two items is rendered
- **THEN** the host has `tabindex="0"` and both items have `tabindex="-1"`

#### Scenario: Toggle on a native button

- **WHEN** a vertical navbar holds `<button kbq-navbar-toggle>`
- **THEN** the toggle has no `tabindex` attribute, so the button stays in the tab order

### Requirement: Entering the navbar

When the navbar host receives focus from the keyboard or from code, the navbar SHALL move focus to its first enabled element, the first item, brand or toggle element that the arrow keys do not skip, not to the element focused last. Focus set from code SHALL not show the keyboard focus ring. Focus that reaches the host from a pointer, such as a click on its empty space, SHALL stay on the host.

#### Scenario: Tabbing into the navbar

- **WHEN** the user presses Tab and the navbar host is next in the tab order
- **THEN** its first enabled element has focus with the keyboard focus ring

#### Scenario: Focusing the host from code

- **WHEN** code calls `focus()` on the host element of a navbar whose first element is an item
- **THEN** the first item has focus and the class `cdk-program-focused`

#### Scenario: Clicking empty space

- **WHEN** the user clicks the navbar outside its items
- **THEN** no item receives focus

#### Scenario: Link brand before the items

- **WHEN** the first element of a navbar is `<a href="#" kbq-navbar-brand>` and the user tabs into the navbar
- **THEN** the brand has focus with the keyboard focus ring

### Requirement: Leaving the navbar with Tab

Tab and Shift+Tab pressed inside a navbar SHALL take the host out of the tab order until the browser has moved focus and then give it its tab index back, so Shift+Tab from an item does not stop on the host. Focus SHALL move to the next or previous tab stop in document order, which lies outside the navbar unless the navbar holds a tab stop of its own, such as a `<button kbq-navbar-toggle>` while it is shown, or the control of a projected `kbq-form-field`.

#### Scenario: Shift+Tab from an item

- **WHEN** an item has focus, no tab stop of the navbar's own precedes it, and the user presses Shift+Tab
- **THEN** focus moves to the element before the navbar
- **AND** the host has its tab index back afterwards

#### Scenario: Tab from an item of a vertical navbar

- **WHEN** an item of a vertical navbar that holds `<button kbq-navbar-toggle>` has keyboard focus and the user presses Tab
- **THEN** the toggle has focus

### Requirement: Arrow keys in a horizontal navbar

In a `kbq-navbar`, Right and Left SHALL move focus to the next or previous enabled item, brand or toggle element, skipping disabled and decorative ones, and SHALL stop at the first and last one without wrapping. Up and Down MUST NOT move focus between the navbar's elements; Down on a dropdown trigger item opens its dropdown, which by default takes focus. Focus moved by an arrow key SHALL show the keyboard focus ring, also when the previous focus came from a click.

#### Scenario: Disabled first item

- **WHEN** the first item is disabled and the navbar receives keyboard focus
- **THEN** the second item has focus

#### Scenario: Right arrow after a click

- **WHEN** the user clicks the first item and presses Right
- **THEN** the second item has focus with the keyboard focus ring

### Requirement: Arrow keys in a vertical navbar

In a `kbq-vertical-navbar`, Down and Up SHALL move focus to the next or previous enabled element, skipping disabled and decorative ones, without wrapping. Left and Right MUST NOT move focus between the navbar's elements; Right on a dropdown trigger item opens its dropdown, which by default takes focus.

#### Scenario: Down arrow after a click

- **WHEN** the user clicks the first item of a vertical navbar and presses Down
- **THEN** the second item has focus with the keyboard focus ring

### Requirement: Clicked item becomes the active item

A click on an item, brand or toggle element that the arrow keys do not skip SHALL give it focus without the keyboard focus ring and SHALL make it the element the arrow keys move from. A click that lands on a `kbq-button` or on the control of a `kbq-form-field` inside an item SHALL focus that control and leave the element the arrow keys move from unchanged.

#### Scenario: Clicking the second item

- **WHEN** the user clicks the second of three items and presses Right
- **THEN** the third item has focus

### Requirement: Text fields in a horizontal navbar

In a field with the `kbqInput` attribute inside a horizontal navbar, Right with the cursor at the end of the text SHALL move focus to the element after the navbar's active element, and Left with the cursor at the start to the one before it. The active element is the item holding the field only when focus reached the field through the navbar; a click into the field leaves the previous active element in place. Elsewhere in the text the arrow keys SHALL only move the cursor.

#### Scenario: Leaving a field to the right

- **WHEN** focus reached a `kbqInput` field through the navbar, the cursor is at the end of its text and the user presses Right
- **THEN** the next enabled element after the item holding the field has focus

### Requirement: Accessible name of items

The `aria-label` input of an item SHALL be published as its `aria-label`. Without it, a collapsed item SHALL publish its title text, or `collapsedText` when set, as `aria-label`, and an expanded item MUST NOT have one, being named by its visible title. An icon-only item gets an accessible name only from `aria-label`, or from `collapsedText` while it is collapsed.

#### Scenario: Collapsing a titled item

- **WHEN** an item titled "Item with title" is collapsed
- **THEN** it gains `aria-label="Item with title"`, which it did not have while expanded

#### Scenario: Icon-only item

- **WHEN** an icon-only item has `aria-label="Play"`
- **THEN** it is a button named "Play"

#### Scenario: Collapsed icon-only item with collapsed text

- **WHEN** a collapsed icon-only item has no `aria-label` and has `collapsedText="Alerts"`
- **THEN** it has `aria-label="Alerts"`

### Requirement: Stacking of the navbar

A horizontal navbar SHALL stack at `z-index: var(--kbq-navbar-z-index)`, 990 by default, above the `kbqOverlayLayer` layer and below the application-wide overlays. A vertical navbar opened over the content SHALL stack one level lower, at 989. The toggle SHALL stack one level higher, at 991, except in a navbar opened over the content, where that level applies only inside the navbar's own 989 layer.

#### Scenario: Panel opened from the page content

- **WHEN** a select panel opened from the page content overlaps the horizontal navbar
- **THEN** the panel is painted above the navbar

#### Scenario: Toggle of a navbar opened over the content

- **WHEN** a horizontal navbar overlaps the toggle of a vertical navbar opened over the content, and both of them sit in the same stacking context
- **THEN** the horizontal navbar is painted above the toggle
