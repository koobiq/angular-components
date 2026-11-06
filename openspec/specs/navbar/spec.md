# navbar Specification

## Purpose

Describes what `kbq-navbar`, `kbq-vertical-navbar` and the items, brand, divider and toggle from `@koobiq/components/navbar` guarantee to consumers: how a navbar is composed, how the horizontal navbar collapses items to fit and the vertical one expands and collapses, and how users reach and operate its elements with a pointer, the keyboard or assistive technology.

## Requirements

### Requirement: Navigation landmark

`kbq-navbar` and `kbq-vertical-navbar` SHALL render `role="navigation"` on their host and SHALL publish the `aria-label` input as the host's `aria-label`. Without the input the host MUST NOT carry an `aria-label`.

#### Scenario: Named horizontal navbar

- **WHEN** a `kbq-navbar` is rendered with `aria-label="Main"`
- **THEN** its host has `role="navigation"` and `aria-label="Main"`

#### Scenario: Vertical navbar

- **WHEN** a `kbq-vertical-navbar` is rendered
- **THEN** its host has `role="navigation"`

### Requirement: Content is placed in containers

A navbar SHALL render only the content placed in `kbq-navbar-container` elements, or in elements with the `kbq-navbar-container` attribute; a vertical navbar SHALL also render a `kbq-navbar-toggle` placed after its containers. Any other direct child of a navbar MUST NOT be rendered.

#### Scenario: Item outside a container

- **WHEN** a `kbq-navbar-item` is written directly inside `kbq-navbar`, outside any container
- **THEN** the item is not rendered

#### Scenario: Toggle of a vertical navbar

- **WHEN** a `kbq-vertical-navbar` holds two containers and a `<button kbq-navbar-toggle>`
- **THEN** the containers are rendered first and the toggle after them

### Requirement: Marker classes

The `kbq-navbar-container` element SHALL carry the class `kbq-navbar-container`; `kbq-navbar-title` and `[kbq-navbar-title]` SHALL carry `kbq-navbar-title`; `kbq-navbar-logo` and `[kbq-navbar-logo]` SHALL carry `kbq-navbar-logo`; `kbq-navbar-divider` SHALL carry `kbq-navbar-divider`.

#### Scenario: Container class

- **WHEN** items are wrapped in a `<kbq-navbar-container>`
- **THEN** that element has the class `kbq-navbar-container`

### Requirement: Orientation classes

Every item, brand and divider SHALL carry `kbq-horizontal` inside a `kbq-navbar` and `kbq-vertical` inside a `kbq-vertical-navbar`, and MUST NOT carry the other one.

#### Scenario: Item of a horizontal navbar

- **WHEN** an item is rendered inside `kbq-navbar`
- **THEN** it has `kbq-horizontal` and not `kbq-vertical`

#### Scenario: Item of a vertical navbar

- **WHEN** an item is rendered inside `kbq-vertical-navbar`
- **THEN** it has `kbq-vertical` and not `kbq-horizontal`

### Requirement: Order of the content of an item

A navbar item SHALL render a `kbq-icon` written directly in it without `kbqNavbarItemSuffix` before its title, and content marked with `kbqNavbarItemSuffix` after its title, whatever order they are written in; the suffix SHALL carry `kbq-navbar-item-suffix`. Other content SHALL follow. An item SHALL carry `kbq-navbar-item_with-title` while it has a `kbq-navbar-title`.

#### Scenario: Icon written after the title

- **WHEN** an item holds a title followed by an icon without `kbqNavbarItemSuffix`
- **THEN** the icon is rendered before the title

#### Scenario: Suffix icon

- **WHEN** an item holds a title and an icon with `kbqNavbarItemSuffix`
- **THEN** the icon is rendered after the title with the class `kbq-navbar-item-suffix`

#### Scenario: Icon-only item

- **WHEN** an item holds only an icon
- **THEN** it does not have the class `kbq-navbar-item_with-title`

### Requirement: Dropdown chevron

An item with a title that is also a dropdown trigger SHALL show a chevron (class `kbq-navbar-item__arrow-icon`) after its title and suffix while it is not collapsed: pointing down in a horizontal navbar, pointing right in a vertical one. A bento item in a vertical navbar MUST NOT show it.

#### Scenario: Dropdown item of a vertical navbar

- **WHEN** an expanded vertical navbar holds a titled item with `kbqDropdownTriggerFor`
- **THEN** a right-pointing chevron is shown at the right edge of the item

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

### Requirement: Which items can collapse

In a horizontal navbar only an item with a leading icon, a title and `collapsable` at its default `true` SHALL collapse. An item with `[collapsable]="false"`, an item without a title, an item whose only icon is a suffix, and the brand MUST NOT collapse.

#### Scenario: Item that must stay readable

- **WHEN** an item has `[collapsable]="false"` and the navbar runs out of room
- **THEN** the item keeps its title

#### Scenario: Item whose only icon is a suffix

- **WHEN** an item has a title and only a suffix icon, and the navbar runs out of room
- **THEN** the item keeps its title, while an item with a leading icon and a suffix collapses

### Requirement: Collapsed items expand when there is room

When a horizontal navbar has room for the width a collapsed item takes back by expanding, the navbar SHALL expand that item again.

#### Scenario: Navbar widened

- **WHEN** a navbar with collapsed items is widened far enough for all of them
- **THEN** every item is expanded again

### Requirement: When the horizontal navbar fits its items

A horizontal navbar SHALL fit its items once after its first render and again 100 ms after the last of a burst of window `resize` events. A change to the navbar's own width without a window resize MUST NOT make it fit its items again. While the navbar has no width, for example while it is hidden, fitting SHALL leave the items as they are.

#### Scenario: Burst of resize events

- **WHEN** the window fires 20 `resize` events in a row
- **THEN** the items are fitted once, 100 ms after the last event

#### Scenario: Hidden navbar

- **WHEN** fitting runs while the navbar is not rendered
- **THEN** no item collapses

### Requirement: Collapsing an item from code

Assigning `collapsed` on a `KbqNavbarItem` instance SHALL set what `isCollapsed()` reports and the class `kbq-navbar-item_collapsed`, which in a horizontal navbar collapses the item to its icon. In a horizontal navbar the next fitting pass SHALL overwrite the assigned value for a collapsable item that the pass collapses or expands.

#### Scenario: Collapsing and expanding by code

- **WHEN** code sets `collapsed = true` on an item and then `collapsed = false`
- **THEN** the item gains and then loses the class `kbq-navbar-item_collapsed`

### Requirement: Vertical navbar is collapsed by default

`kbq-vertical-navbar` SHALL be collapsed until `expanded` is `true`. Its inner container (`kbq-vertical-navbar__container`) SHALL carry `kbq-collapsed` or `kbq-expanded`, and every item, brand and divider in it SHALL carry the same class and be collapsed or expanded with it.

#### Scenario: Default state

- **WHEN** a vertical navbar is rendered without `expanded`
- **THEN** its container and every element in it have `kbq-collapsed`

#### Scenario: Expanded

- **WHEN** `expanded` becomes `true`
- **THEN** the container and every element have `kbq-expanded` instead, and no element is collapsed

### Requirement: Collapsed vertical navbar shows icons only

While a vertical navbar is collapsed, its items SHALL hide their titles, suffixes and chevrons, while their leading icons and any other projected content, such as a badge, stay visible, and the brand SHALL hide its title. Expanding the navbar SHALL show them again.

#### Scenario: Suffix of a collapsed navbar

- **WHEN** an item with a suffix icon is rendered in a collapsed vertical navbar
- **THEN** the item is visible and its suffix is hidden

#### Scenario: Badge of a collapsed navbar

- **WHEN** an item with an icon, a title and a `kbq-badge` is rendered in a collapsed vertical navbar
- **THEN** its icon and its badge are visible and its title is hidden

### Requirement: Expanded state is two-way bindable

`expanded` SHALL be a two-way bindable model. `toggle()` on the vertical navbar SHALL flip it and emit `expandedChange` with the new value. Calling `toggle()` from a consumer's `effect()` MUST NOT make that effect run again.

#### Scenario: Toggling from code

- **WHEN** `toggle()` is called on a collapsed vertical navbar
- **THEN** `expanded()` is `true` and its container has `kbq-expanded`

#### Scenario: Toggling from an effect

- **WHEN** an effect of the consumer calls `toggle()` once
- **THEN** the navbar is expanded and the effect has run once

### Requirement: Expanded navbar over the content

With `openOver` bound to `true`, the vertical navbar host SHALL carry `kbq-vertical-navbar_open-over`, and the expanded navbar SHALL lie over the page content next to it instead of taking room from it.

#### Scenario: Open over the content

- **WHEN** `openOver` changes from `false` to `true`
- **THEN** the host gains the class `kbq-vertical-navbar_open-over`

### Requirement: Toggle expands and collapses the navbar

A `kbq-navbar-toggle` element or `[kbq-navbar-toggle]` inside a vertical navbar SHALL toggle that navbar on click, and on Enter or Space; for these keys it SHALL prevent the default action and stop the event's propagation.

#### Scenario: Click

- **WHEN** the user clicks the toggle of a collapsed navbar
- **THEN** the navbar expands

#### Scenario: Space and Enter

- **WHEN** the toggle has focus and the user presses Space and then Enter
- **THEN** the navbar expands and then collapses, and the default action of the key is prevented

### Requirement: Toggle semantics

The toggle SHALL have `role="button"`, an `aria-expanded` that follows the navbar, `aria-keyshortcuts="Control+/"`, and an `aria-label` that names the action it performs: the expand string while the navbar is collapsed and the collapse string while it is expanded.

#### Scenario: Before and after expanding

- **WHEN** the toggle of a collapsed navbar is clicked
- **THEN** `aria-expanded` changes from `false` to `true`
- **AND** `aria-label` changes from the expand string to the collapse string

### Requirement: Toggle tooltip

The toggle SHALL show a tooltip to its right whose text is the toggle's accessible name. The text SHALL follow the expanded state and the locale, also while the tooltip is open, and toggling SHALL hide an open tooltip.

#### Scenario: After expanding

- **WHEN** the toggle is used to expand the navbar
- **THEN** its tooltip text is the collapse string

### Requirement: Toggle icon

By default the toggle SHALL render a double chevron pointing right while the navbar is collapsed and pointing left while it is expanded. An element with the `kbq-icon` attribute projected into the toggle SHALL replace the default icon.

#### Scenario: Custom icon

- **WHEN** a toggle holds `<i kbq-icon="kbq-chevron-right_16"></i>`
- **THEN** that icon is rendered instead of the chevron

### Requirement: Toggle is shown on demand

The toggle SHALL be hidden unless its vertical navbar is hovered, carries `kbq-hovered`, or holds keyboard focus.

#### Scenario: Pointer over the navbar

- **WHEN** the pointer moves over a vertical navbar
- **THEN** its toggle becomes visible and can be clicked

### Requirement: Toggle needs a vertical navbar

A toggle MUST be placed inside a `kbq-vertical-navbar`. Outside one, Angular SHALL throw a missing-provider error for `KbqVerticalNavbar` when it creates the toggle.

#### Scenario: Toggle in a horizontal navbar

- **WHEN** a `kbq-navbar-toggle` is placed in a `kbq-navbar`
- **THEN** creating the view fails with a missing-provider error

### Requirement: Keyboard shortcut

While at least one toggle is rendered in a browser, `Ctrl` + `/` or `Ctrl` + numpad `/` pressed anywhere on the page SHALL toggle exactly one vertical navbar: the one that contains the focused element, otherwise the one whose toggle was created first. The shortcut MUST NOT prevent the key's default action, and a destroyed toggle SHALL stop reacting to it.

#### Scenario: Focus in the second of two navbar instances

- **WHEN** the page renders two vertical navbar instances, the second holds focus, and the user presses `Ctrl` + `/`
- **THEN** only the second navbar expands

#### Scenario: Focus outside every navbar

- **WHEN** focus is outside both navbar instances and the user presses `Ctrl` + numpad `/`
- **THEN** only the first navbar expands

#### Scenario: Destroyed toggle

- **WHEN** the only navbar with a toggle has been destroyed and the user presses `Ctrl` + `/`
- **THEN** nothing is toggled

### Requirement: Brand as a link

A `kbq-navbar-brand` on an `<a>` element SHALL carry `kbq-navbar-brand_link` and take part in the arrow-key navigation of the navbar. A brand on any other element MUST NOT carry that class.

#### Scenario: Anchor brand

- **WHEN** the brand is written as `<a href="#" kbq-navbar-brand>`
- **THEN** it has `kbq-navbar-brand_link` and the arrow keys can move focus onto it

### Requirement: Decorative brand

A brand that is not an `<a>` and does not wrap a `kbq-button` or a `kbq-form-field` SHALL be skipped by the arrow keys and typeahead, and MUST NOT carry `kbq-disabled` or `aria-disabled`. A non-link brand that wraps such a control SHALL stay in the arrow-key navigation.

#### Scenario: Brand with a logo and a title only

- **WHEN** the brand is a `<div kbq-navbar-brand>` with a logo and a title
- **THEN** the arrow keys skip it, and it has neither `kbq-disabled` nor `aria-disabled`

#### Scenario: Brand wrapping a button

- **WHEN** a `<div kbq-navbar-brand>` also holds a `kbq-button`
- **THEN** the arrow keys can move focus onto it

### Requirement: Disabled brand cancels clicks

A brand with `disabled` set SHALL cancel every click on it or its content: it SHALL prevent the browser's default action and stop the click before any listener of the brand or its content runs, so its link is not followed and no click handler of the consumer on the brand runs.

#### Scenario: Clicking a disabled link brand

- **WHEN** the user clicks the title of `<a href="#target" kbq-navbar-brand disabled (click)="...">`
- **THEN** the URL does not change and the click handler does not run

### Requirement: Brand of a collapsed vertical navbar

While a vertical navbar is collapsed, its brand SHALL publish its title text, or `collapsedText` when set, as `aria-label` unless the `aria-label` input is set, and SHALL show that text in a tooltip. Changing `collapsedText` SHALL update the tooltip.

#### Scenario: Default name

- **WHEN** a collapsed vertical navbar holds a brand titled "App Name"
- **THEN** the brand has `aria-label="App Name"`

#### Scenario: Custom collapsed text

- **WHEN** `collapsedText` of a collapsed brand changes from "First" to "Updated"
- **THEN** the brand's tooltip text changes to "Updated"

### Requirement: Automatic long brand title

In both navbar components, a brand title that does not fit on one line in the default presentation SHALL switch the brand to a compact presentation (class `kbq-navbar-brand_long-title`): a smaller font on at most two lines, the rest cut with an ellipsis. A title that fits MUST keep the default presentation, and the choice MUST NOT change the height of a horizontal navbar or flip back and forth.

#### Scenario: Title that does not fit

- **WHEN** the brand title is wider than its box
- **THEN** the brand has `kbq-navbar-brand_long-title` and the title renders in 14 px type

#### Scenario: Title that fits

- **WHEN** the brand title fits on one line
- **THEN** the brand does not have `kbq-navbar-brand_long-title` and the title renders in 18 px type

#### Scenario: Title too long for two lines

- **WHEN** the title needs more than two lines in the compact presentation
- **THEN** it renders exactly two lines and the rest is cut

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

### Requirement: Bento item

An item with the `bento` attribute SHALL carry `kbq-navbar-bento`. In an expanded vertical navbar its title SHALL be revealed only while the item is hovered, has keyboard focus or carries `kbq-active` or `kbq-pressed`, with a short slide-in that MUST NOT play while animations are disabled or the user prefers reduced motion.

#### Scenario: Animations disabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` disables animations and an expanded vertical navbar holds a bento item
- **THEN** the title of the bento item carries `kbq-animations-disabled`

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

### Requirement: Explicit tooltip switch

When `kbqTooltipDisabled` is set on an item or brand, its value SHALL decide whether the tooltip is disabled, overriding the automatic rule.

#### Scenario: Forcing the tooltip on

- **WHEN** an expanded item with a readable title has `[kbqTooltipDisabled]="false"`
- **THEN** its tooltip is enabled

### Requirement: Tooltip inputs of items and brands

Items and brands SHALL take their tooltip text through `tooltipText`, and SHALL accept `kbqTooltipClass`, `kbqTooltipColor`, `kbqTooltipOffset`, `kbqTrigger`, `kbqPlacement`, `kbqEnterDelay`, `kbqLeaveDelay` and `kbqVisible` with the outputs `kbqVisibleChange` and `kbqPlacementChange`; items also accept `kbqTooltipContext` and `kbqPlacementPriority`. Binding `kbqTooltip` on an item or brand where the tooltip directive is imported SHALL fail with Angular error NG0309.

#### Scenario: Tooltip text

- **WHEN** an item, a native button item and a brand each bind `tooltipText` in a template that also imports the tooltip module
- **THEN** the tooltip of each of them holds its own text and creating the view does not fail

#### Scenario: Tooltip selector on an item

- **WHEN** an item binds `[kbqTooltip]` in a template that imports the tooltip module
- **THEN** creating the view throws an error with code NG0309

### Requirement: Tooltip defaults and keyboard focus

The tooltip of an item or brand SHALL open on hover only, without an arrow and with no offset, unless `kbqTrigger` or `kbqTooltipOffset` is bound. In a vertical navbar it SHALL be placed to the right of the element. Keyboard focus moved onto an item or brand that does not wrap a `kbq-button` or `kbq-form-field` SHALL show its tooltip when the tooltip is enabled.

#### Scenario: Keyboard focus on a collapsed item

- **WHEN** the user tabs into a collapsed vertical navbar whose first item is titled "Tasks"
- **THEN** a tooltip reading "Tasks" appears next to the item

### Requirement: Cut titles are re-measured

An item SHALL decide again whether its title is cut after each render that follows a change to its collapsed state, `collapsedText` or `kbqTooltipDisabled`, and whenever its content changes, such as a new title text.

#### Scenario: Title text grows

- **WHEN** the title of an expanded item changes to a text too long for the item
- **THEN** its tooltip becomes enabled and shows the new text

#### Scenario: Navbar expanded later

- **WHEN** a vertical navbar that started collapsed is expanded and an item title is too long for it
- **THEN** the item's tooltip is enabled

### Requirement: One tab stop per navbar

The navbar host SHALL hold the tab stop of its items, brand and `kbq-navbar-toggle` element, with the `tabIndex` input as its `tabindex`, 0 by default. Every item, brand and `kbq-navbar-toggle` element SHALL have `tabindex="-1"`, links and native buttons included, and the first `kbq-button` projected into an item or brand SHALL be taken out of the tab order. Other focusable content keeps its own tab stop, such as a `<button kbq-navbar-toggle>` and the control of a projected `kbq-form-field`.

#### Scenario: Default tab indexes

- **WHEN** a navbar with two items is rendered
- **THEN** the host has `tabindex="0"` and both items have `tabindex="-1"`

#### Scenario: Toggle on a native button

- **WHEN** a vertical navbar holds `<button kbq-navbar-toggle>`
- **THEN** the toggle has no `tabindex` attribute, so the button stays in the tab order

### Requirement: Navbar without focusable elements

While a navbar holds no item, brand or `kbq-navbar-toggle` element, its host SHALL have `tabindex="-1"`. Once one appears, the host SHALL get back the bound `tabIndex`. The navbar MUST NOT write the bound `tabIndex` or emit `tabIndexChange` for this.

#### Scenario: Item added later

- **WHEN** a navbar with `[(tabIndex)]` bound to 3 is rendered without items and an item is then added
- **THEN** the host has `tabindex="-1"` and then `tabindex="3"`
- **AND** `tabIndexChange` has not been emitted

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

### Requirement: Navigation keys do not reach the page

While focus is inside a navbar but not in a field with the `kbqInput` attribute, the navbar SHALL prevent the default action of the arrow keys, Home, End, PageUp, PageDown, Backspace and Delete. Home, End, PageUp and PageDown MUST NOT move focus.

#### Scenario: Home in a navbar

- **WHEN** an item has focus and the user presses Home
- **THEN** focus stays on the item and the page does not scroll

### Requirement: Clicked item becomes the active item

A click on an item, brand or toggle element that the arrow keys do not skip SHALL give it focus without the keyboard focus ring and SHALL make it the element the arrow keys move from. A click that lands on a `kbq-button` or on the control of a `kbq-form-field` inside an item SHALL focus that control and leave the element the arrow keys move from unchanged.

#### Scenario: Clicking the second item

- **WHEN** the user clicks the second of three items and presses Right
- **THEN** the third item has focus

### Requirement: Typeahead

When focus is on an element of a navbar, characters typed in quick succession SHALL, 200 ms after the last one, move focus to the next enabled element whose title starts with them, ignoring case, searching from the element after the focused one and wrapping around to the start. In a horizontal navbar, characters typed into a `kbqInput` field MUST NOT do this.

#### Scenario: Typing a letter

- **WHEN** the first item has focus and the user types "p" in a navbar with an item titled "Projects"
- **THEN** 200 ms later the "Projects" item has focus

### Requirement: Text fields in a horizontal navbar

In a field with the `kbqInput` attribute inside a horizontal navbar, Right with the cursor at the end of the text SHALL move focus to the element after the navbar's active element, and Left with the cursor at the start to the one before it. The active element is the item holding the field only when focus reached the field through the navbar; a click into the field leaves the previous active element in place. Elsewhere in the text the arrow keys SHALL only move the cursor.

#### Scenario: Leaving a field to the right

- **WHEN** focus reached a `kbqInput` field through the navbar, the cursor is at the end of its text and the user presses Right
- **THEN** the next enabled element after the item holding the field has focus

### Requirement: Focus of a nested button or form field

When focus moves to an item that wraps a `kbq-button`, the button SHALL receive focus, with the keyboard focus ring when the keyboard moved it; for an item that wraps a `kbq-form-field`, its control SHALL receive focus. The item SHALL stay the element the arrow keys move from.

#### Scenario: Passing through a nested button

- **WHEN** the user presses Right on the item before an item with a `kbq-button`, and then Right again
- **THEN** the button has focus, and then the item after it

### Requirement: Enter and Space activate an item

On an item with `role="button"` that is not a dropdown trigger, Enter and Space SHALL dispatch a click on the item and prevent the key's default action.

#### Scenario: Enter on a custom element item

- **WHEN** a `kbq-navbar-item` element with a click handler has focus and the user presses Enter
- **THEN** the click handler runs once

#### Scenario: Space on a custom element item

- **WHEN** the same item has focus and the user presses Space
- **THEN** the click handler runs once

### Requirement: Dropdown trigger items

An item that is a dropdown trigger SHALL open its dropdown on Down in a horizontal navbar and on Right in a vertical navbar, preventing the key's default action and stopping its propagation, and SHALL turn off the trigger's own opening on Down. Click, Enter and Space SHALL behave as on any dropdown trigger, and `aria-expanded` SHALL follow the dropdown.

#### Scenario: Clicking a dropdown item

- **WHEN** the user clicks an item with `kbqDropdownTriggerFor`
- **THEN** the dropdown panel opens and the item's `aria-expanded` changes from `false` to `true`

#### Scenario: Down in a vertical navbar

- **WHEN** a dropdown item of a vertical navbar has focus and the user presses Down
- **THEN** the dropdown stays closed and the next element has focus

### Requirement: Dropdown position in a vertical navbar

A dropdown opened from an item of a vertical navbar SHALL open beside the item: it MUST NOT overlap the item horizontally, SHALL overlap it vertically, and SHALL be shifted 8 px to the left.

#### Scenario: Dropdown of a vertical navbar item

- **WHEN** an item of a vertical navbar triggers a dropdown
- **THEN** the dropdown has `overlapTriggerX` `false`, `overlapTriggerY` `true`, and the trigger's `offsetX` is -8

### Requirement: Disabled elements

`disabled`, as an attribute or a binding, on an item, brand or `kbq-navbar-toggle` element SHALL add the class `kbq-disabled` and `aria-disabled="true"` and MUST NOT add the `disabled` attribute. A disabled element SHALL be skipped by the arrow keys and typeahead, and a disabled item SHALL ignore the pointer. Assigning `disabled` in code on the element's `KbqNavbarFocusableItem` SHALL have the same effect.

#### Scenario: Disabled by binding

- **WHEN** an item has `[disabled]="true"`
- **THEN** it has `kbq-disabled` and `aria-disabled="true"`, and no `disabled` attribute

#### Scenario: Disabled from code

- **WHEN** code sets `disabled = true` on the focusable item of an enabled item
- **THEN** after the next render the item has `kbq-disabled` and `aria-disabled="true"`

#### Scenario: Clicking a disabled item

- **WHEN** the user clicks a disabled item
- **THEN** its click handler does not run

### Requirement: Role of items

A navbar item SHALL have `role="button"` unless its host is an `<a>`, `<button>`, `<input>`, `<select>` or `<textarea>`, or it wraps a `kbq-button` or `kbq-form-field`; then it MUST NOT have a `role` attribute. A dropdown trigger item MUST NOT have `aria-haspopup`.

#### Scenario: Custom element item

- **WHEN** an item is written as a `kbq-navbar-item` element
- **THEN** it has `role="button"`

#### Scenario: Link item

- **WHEN** an item is written as `<a href="#" kbq-navbar-item>`
- **THEN** it has no `role` attribute

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

### Requirement: Divider

`kbq-navbar-divider` SHALL have `role="separator"` and an `aria-orientation` across the navbar: `vertical` in a horizontal navbar and `horizontal` in a vertical navbar.

#### Scenario: Divider of a horizontal navbar

- **WHEN** a divider is rendered in a `kbq-navbar`
- **THEN** it has `role="separator"` and `aria-orientation="vertical"`

### Requirement: No axe violations

A horizontal navbar with titled, icon-only and disabled items, and a vertical navbar in both its collapsed and expanded state, SHALL pass the axe-core checks that run without layout.

#### Scenario: Collapsed vertical navbar

- **WHEN** axe-core checks a collapsed vertical navbar with two items and a toggle
- **THEN** it reports no violations

### Requirement: Panels opened from a navbar stay on top

Both navbar components SHALL keep the panels opened from inside them, such as dropdowns, in the application-wide overlay container, also when the navbar is inside a `kbqOverlayLayer` element.

#### Scenario: Dropdown inside an overlay layer

- **WHEN** a navbar inside a `kbqOverlayLayer` element opens a dropdown from one of its items
- **THEN** the dropdown panel is rendered in the application-wide overlay container

### Requirement: Stacking of the navbar

A horizontal navbar SHALL stack at `z-index: var(--kbq-navbar-z-index)`, 990 by default, above the `kbqOverlayLayer` layer and below the application-wide overlays. A vertical navbar opened over the content SHALL stack one level lower, at 989. The toggle SHALL stack one level higher, at 991, except in a navbar opened over the content, where that level applies only inside the navbar's own 989 layer.

#### Scenario: Panel opened from the page content

- **WHEN** a select panel opened from the page content overlaps the horizontal navbar
- **THEN** the panel is painted above the navbar

#### Scenario: Toggle of a navbar opened over the content

- **WHEN** a horizontal navbar overlaps the toggle of a vertical navbar opened over the content, and both of them sit in the same stacking context
- **THEN** the horizontal navbar is painted above the toggle

### Requirement: Localized toggle strings

The toggle's accessible name and tooltip SHALL use `navbar.toggle.expand` and `navbar.toggle.collapse` of the active locale, `ru-RU` by default, and SHALL follow a runtime locale change. Without a locale service, `KBQ_NAVBAR_LOCALE_CONFIGURATION` SHALL supply the strings.

#### Scenario: Switching the locale

- **WHEN** the application switches the locale to `en-US` while the navbar is collapsed
- **THEN** the toggle's tooltip reads "Expand"

#### Scenario: Strings provided through the token

- **WHEN** no locale service is provided and `KBQ_NAVBAR_LOCALE_CONFIGURATION` is provided with "Open it" and "Close it"
- **THEN** the navbar uses those strings

### Requirement: Overriding the toggle strings

`kbqNavbarLocaleConfigurationProvider()` SHALL override only the strings it is given, outranking the locale, while the other strings keep following it. `[localeOverrides]` on a vertical navbar SHALL override strings for that navbar only, on top of the provider.

#### Scenario: Provider override

- **WHEN** the provider overrides only `toggle.expand` and the locale switches to `en-US`
- **THEN** the collapsed toggle keeps the overridden text, while the collapse string still follows the locale

#### Scenario: Override on one navbar

- **WHEN** one of two vertical navbar instances binds `[localeOverrides]` with its own `navbar.toggle.expand`
- **THEN** only that navbar's toggle uses the overridden text
