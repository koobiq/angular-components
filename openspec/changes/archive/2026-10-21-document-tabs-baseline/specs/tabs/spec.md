# Spec Delta

## Purpose

Describes what `@koobiq/components/tabs` guarantees to consumers: how `kbq-tab-group` renders its tabs and their content, how the selection is driven from code, a pointer, the keyboard or assistive technology and reported back, how an overflowing strip scrolls, how `kbqTabNavBar` marks the active link, and how a tab group remembers its selection.

## ADDED Requirements

### Requirement: Tabs and their labels

A `kbq-tab-group` SHALL render one label and one content region for every `kbq-tab` among its content children, in document order. A tab's label SHALL be the template marked with `kbqTabLabel` (or `kbq-tab-label`) inside it when there is one, and its `label` text otherwise.

#### Scenario: Text labels

- **WHEN** a group contains `<kbq-tab label="Junk food">` and three more tabs with a `label`
- **THEN** the strip shows four labels with those texts, in order

#### Scenario: Template label wins over the text

- **WHEN** a tab has both a `label` and an `ng-template kbqTabLabel`
- **THEN** its label renders the template

### Requirement: Labels follow their bindings

When a tab's bound `label`, `disabled` or `tooltipTitle` changes, the group SHALL render the change in that tab's label without any other trigger.

#### Scenario: Changing a bound label

- **WHEN** a tab is declared with `[label]="otherLabel"` and `otherLabel` changes from "Fruit" to "Chips"
- **THEN** the label shows "Chips"

### Requirement: Only the selected tab's content is in the DOM

The group SHALL attach the content of the selected tab and SHALL keep the content of every other tab out of the DOM. The selected tab's content MUST be rendered by the first change detection pass. Content projected straight into a `kbq-tab` is still created with the declaring view, so view queries can reach it while its tab is not selected.

#### Scenario: Switching tabs swaps the content

- **WHEN** the first tab is selected and the application selects the fourth one
- **THEN** the first tab's content is no longer in the DOM and the fourth tab's content is

#### Scenario: Query into an inactive tab

- **WHEN** an element with a template reference sits in a tab that is not selected
- **THEN** a `viewChild` query of the declaring component still resolves it

### Requirement: Lazy tab content

A template marked with `kbqTabContent` inside a `kbq-tab` SHALL be used as that tab's content instead of the projected content, and SHALL be instantiated only when its tab becomes selected. It SHALL be destroyed again when the tab stops being selected.

#### Scenario: Content created on selection

- **WHEN** the second tab declares its content in `<ng-template kbqTabContent>` and the user clicks the second label
- **THEN** the content of that template appears in the DOM

### Requirement: Default selection

When nothing selects a tab, the group SHALL select the first tab that is not disabled. A bound `selectedIndex` that turns `null` or `undefined` SHALL return the group to this default.

#### Scenario: Leading disabled tab

- **WHEN** a group's first tab is disabled and nothing selects a tab
- **THEN** the second tab is selected

#### Scenario: Binding reset to undefined

- **WHEN** `selectedIndex` is bound to 2 and then changes to `undefined` or `null`
- **THEN** the first enabled tab is selected

### Requirement: Selection by index

`selectedIndex` SHALL select the tab at that position, supports two-way binding, and accepts a numeric string. An index below 0 SHALL select the first tab and one past the end SHALL select the last tab. An index that is not a number MUST NOT throw. The `selectedIndex` property SHALL read back the index of the selected tab.

#### Scenario: Index out of range

- **WHEN** a group of three tabs is bound to `selectedIndex` -1 and then 3
- **THEN** the group selects index 0 and then index 2

#### Scenario: Not a number

- **WHEN** the bound `selectedIndex` becomes `NaN`
- **THEN** nothing throws

### Requirement: Selection by tab id

`activeTab` SHALL accept a number, which selects like `selectedIndex`, or a string, which selects the tab whose `tabId` equals it. A string that names no tab SHALL select the first tab, disabled or not. `activeTab` supports two-way binding.

#### Scenario: Selecting by id

- **WHEN** `[(activeTab)]` is bound to "first" and the tabs carry the ids "first", "second" and "last"
- **THEN** the first tab is selected

#### Scenario: Unknown id

- **WHEN** `activeTab` is a string that no tab's `tabId` equals
- **THEN** the first tab is selected

### Requirement: Selection by function

When `activeTab` is a function, the group SHALL call it with the array of its tabs and select the tab it returns. When the function returns `null`, the first tab SHALL be selected.

#### Scenario: Selecting with a predicate

- **WHEN** `activeTab` is bound to a function that returns the tab whose `tabId` is "settings"
- **THEN** that tab is selected

### Requirement: Pointer selection

Clicking the label of an enabled tab SHALL select that tab and move keyboard focus to its label. Clicking the label of a disabled tab MUST NOT change the selection.

#### Scenario: Clicking labels

- **WHEN** the first tab is selected and the user clicks the second and then the third label
- **THEN** the second and then the third tab is selected

### Requirement: Selection change events

After the first render, a change of the selected index SHALL emit `selectedTabChange` with a `KbqTabChangeEvent` that holds the new `index` and its `tab`, then `selectedIndexChange` with the index and `activeTabChange`, asynchronously. This applies to a change made by the user and to one assigned in code. The initial selection MUST NOT emit any of them.

#### Scenario: Selection set in code

- **WHEN** the application assigns `selectedIndex = 2` on a group whose second tab is selected
- **THEN** `selectedTabChange` fires once with `index` 2

#### Scenario: Two-way binding follows a click

- **WHEN** `[(selectedIndex)]` is bound to 0 and the user clicks the second label
- **THEN** the bound value becomes 1

### Requirement: Value emitted by activeTabChange

`activeTabChange` SHALL emit the selected tab's `tabId` while `activeTab` holds a string, and the selected index while it holds a number or nothing. While `activeTab` holds a function, it SHALL emit the selected `KbqTab`. A user selection keeps a string mode on the clicked tab's `tabId` and switches every other mode to the index.

#### Scenario: Clicking in string mode

- **WHEN** `[(activeTab)]` is bound to "first" and the user clicks the label of the tab whose `tabId` is "last"
- **THEN** the bound value becomes the string "last"

#### Scenario: Clicking in number mode

- **WHEN** `[(activeTab)]` is bound to 1 in a group of three tabs and the user clicks the last label
- **THEN** the bound value becomes the number 2

### Requirement: Active flag of a tab

Each `kbq-tab` SHALL expose `isActive`, `true` only for the selected tab. It SHALL update after a selection change, and a template that reads it SHALL render the new value without an error.

#### Scenario: Reading isActive in a template

- **WHEN** a template shows `first.isActive` and `second.isActive` and the application selects the second tab
- **THEN** after the next render only `second.isActive` reads `true`

### Requirement: Selection survives a change of the tab list

When tabs are added or removed, the group SHALL keep the previously selected tab selected at its new position, without emitting `selectedTabChange`. When the removed tab was the selected last one, the new last tab SHALL be selected. Tabs that arrive asynchronously SHALL be rendered once they exist.

#### Scenario: Tab inserted before the selection

- **WHEN** the second tab is selected and a tab is inserted at the start
- **THEN** the same tab stays selected, now at index 2
- **AND** `selectedTabChange` does not fire

#### Scenario: Removing the selected last tab

- **WHEN** the last tab is selected and it is removed
- **THEN** the new last tab is selected

### Requirement: Selection from code is not checked against disabled tabs

A selection assigned through `selectedIndex` or `activeTab` SHALL select the tab it names even when that tab is disabled. Only the default selection skips disabled tabs.

#### Scenario: Index of a disabled tab

- **WHEN** `selectedIndex` is bound to the index of a disabled tab
- **THEN** that tab is selected and its content is shown

### Requirement: Selection methods do not track signals

Selecting a tab through the group's public methods (`onSelectFocusedIndex`, `saveState`, `clearSavedState`) MUST NOT make the calling `effect()` depend on the group's state, so the effect does not run again when tabs are added or the selection changes.

#### Scenario: Effect that selects a tab

- **WHEN** an `effect()` calls `onSelectFocusedIndex(1)` once, the user then clicks the first label and a tab is added
- **THEN** the first tab stays selected and the effect has run once

### Requirement: Header position

`headerPosition` SHALL accept `above` (the default) and `below`. With `below`, the group host SHALL carry `kbq-tab-group_inverted-header` and the strip is laid out after the content. A bound `undefined` SHALL return it to `above`.

#### Scenario: Header below the content

- **WHEN** `headerPosition` is bound to "below" and later to `undefined`
- **THEN** the host carries `kbq-tab-group_inverted-header`, and loses it again

### Requirement: Vertical layout

With `vertical` set, the group host SHALL carry `kbq-tab-group_vertical` and lay the strip out alongside the content. The class SHALL follow the bound value, so `[vertical]="false"` leaves it off, and removing `vertical` at runtime SHALL remove it.

#### Scenario: Toggling vertical

- **WHEN** a group bound to `[vertical]="true"` is switched to `false`
- **THEN** the host loses `kbq-tab-group_vertical`

#### Scenario: Bound to false

- **WHEN** a group is declared with `[vertical]="false"`
- **THEN** the host does not carry `kbq-tab-group_vertical`

### Requirement: Appearance inputs

The group SHALL reflect its boolean appearance inputs as host classes: `kbq-tab-group_filled` or, with `transparent`, `kbq-tab-group_transparent`; `kbq-tab-group_on-background` or, with `onSurface`, `kbq-tab-group_on-surface`; with `dynamicHeight`, `kbq-tab-group_dynamic-height`. With `underlined`, every label SHALL carry `kbq-tab-label_underlined`.

#### Scenario: Transparent group on a surface

- **WHEN** a group has `[transparent]="true"` and `[onSurface]="true"`
- **THEN** its host carries `kbq-tab-group_transparent` and `kbq-tab-group_on-surface`

### Requirement: Stretched and aligned labels

The attribute `kbq-stretch-tabs` on a group or a nav bar SHALL add the host class `kbq-tab-group_stretch-labels`, which makes the labels share the strip's width equally. `kbq-align-tabs-center` and `kbq-align-tabs-end` SHALL add `kbq-tab-group_align-labels-center` and `kbq-tab-group_align-labels-end`.

#### Scenario: Stretched group

- **WHEN** a group carries the `kbq-stretch-tabs` attribute
- **THEN** its host has the class `kbq-tab-group_stretch-labels`

### Requirement: Icon-only labels

`iconOnly` on a `kbqTabLabel` template SHALL mark its tab's label with `kbq-tab-label_icon-only`. The selection underline of such a tab SHALL span the label's full width, where a text label's underline is inset by the label padding.

#### Scenario: Icon-only tab

- **WHEN** a tab's label is `<ng-template kbqTabLabel iconOnly>` with only an icon
- **THEN** its label carries `kbq-tab-label_icon-only`

### Requirement: Disabled tabs

A tab with `disabled` SHALL render its label with `kbq-disabled` and `aria-disabled="true"`, never a `disabled` attribute, and enabled labels SHALL carry `aria-disabled="false"`. A disabled label MUST NOT respond to the pointer, and `disabled` SHALL follow its binding at runtime.

#### Scenario: Disabling a tab at runtime

- **WHEN** one tab is disabled and a second tab's `[disabled]` binding turns `true`
- **THEN** two labels carry `aria-disabled="true"`

### Requirement: Empty tabs

A tab with `empty` SHALL stay selectable and SHALL mark its label with `kbq-tab-label_empty`.

#### Scenario: Selecting an empty tab

- **WHEN** a tab has `empty` and the user clicks its label
- **THEN** the tab is selected and its label carries `kbq-tab-label_empty`

### Requirement: Label tooltip

Each label SHALL carry a tooltip shown on hover and on focus, placed by the tab's `tooltipPlacement` (default `right`). It SHALL be enabled only while the tab is `empty` or its label is truncated. Its text SHALL be the truncated label's full text followed by a line break, if any, and then `tooltipTitle`; a bound `undefined` clears `tooltipTitle`.

#### Scenario: Tooltip of an empty tab

- **WHEN** an `empty` tab's `tooltipTitle` binding changes from "First hint" to "Second hint"
- **THEN** its label tooltip shows "Second hint"

#### Scenario: Clearing the tooltip

- **WHEN** the bound `tooltipTitle` becomes `undefined`
- **THEN** the tab's `tooltipTitle` and the label tooltip are empty

### Requirement: Tooltip for truncated vertical labels

In a vertical group, a label too long for the strip SHALL be truncated, and its tooltip SHALL be enabled with the full label text. The group SHALL measure again when the strip is resized, enabling or disabling the tooltip to match. A horizontal group MUST NOT re-measure on resize.

#### Scenario: Strip narrowed

- **WHEN** a vertical group's first label no longer fits after the strip is resized
- **THEN** that label's tooltip is enabled and shows the full label text

#### Scenario: Horizontal group resized

- **WHEN** a horizontal group's strip is resized so that a label would overflow
- **THEN** the tab is not marked as overflowing

### Requirement: Pagination of an overflowing strip

When the labels of a horizontal strip overflow it by more than the browser's measurement error, the strip SHALL show previous and next arrows and its header SHALL carry `kbq-tab-header__pagination-controls_enabled`. When they fit, no arrows SHALL be shown and the strip SHALL be scrolled back to its start. A vertical strip MUST NOT paginate.

#### Scenario: Labels overflow the strip

- **WHEN** the labels need 240 px in a strip 130 px wide
- **THEN** the pagination arrows are shown

#### Scenario: Rounding error

- **WHEN** the labels need 132 px in a strip 130 px wide
- **THEN** no pagination arrows are shown

### Requirement: Arrow state at the scroll bounds

While pagination is shown, the arrow towards a bound the strip has reached SHALL carry `kbq-disabled` and be hidden, staying in the DOM. The previous arrow SHALL be enabled as soon as the strip is scrolled at all. The next arrow SHALL be disabled within the browser's measurement error of the far bound.

#### Scenario: Scrolled to the end

- **WHEN** a strip that overflows by 300 px is scrolled by 300 px
- **THEN** the previous arrow is enabled and the next arrow carries `kbq-disabled`

#### Scenario: Scrolled by one pixel

- **WHEN** an overflowing strip at its start is scrolled by 1 px
- **THEN** the previous arrow is enabled

### Requirement: Scrolling with the arrows

A click on a pagination arrow SHALL scroll the strip towards that side by 80% of its visible width. Holding the primary button on an arrow SHALL start repeating that scroll after 650 ms, every 100 ms, until the strip reaches that side, the press ends in a click on the arrow, or the pointer leaves the strip. A press with another button MUST NOT start the repeat.

#### Scenario: Holding the next arrow

- **WHEN** the user holds the primary button on the next arrow of an overflowing strip
- **THEN** after 650 ms the strip keeps scrolling forward until it reaches the end

### Requirement: Selected and focused labels are scrolled into view

While pagination is shown, a label that becomes selected or receives keyboard focus outside the visible part of the strip SHALL be scrolled into view, past the edge by the width of the arrow on that side. This SHALL also hold for a tab selected before the first render.

#### Scenario: Focusing a label past the end

- **WHEN** the last label lies beyond the visible part of the strip and receives focus
- **THEN** the strip scrolls until the label and the width of the next arrow after it are visible

#### Scenario: Initial selection off screen

- **WHEN** a group renders with its fourth tab selected and that label off screen
- **THEN** the strip scrolls the fourth label into view

### Requirement: Pagination follows layout changes

The strip SHALL check again whether to paginate when it is resized, when tabs are added or removed, when the text of the labels changes, and when the nav bar's `disablePagination` changes. With `disablePagination` set, a nav bar MUST NOT paginate.

#### Scenario: Tabs removed

- **WHEN** pagination is shown and tabs are removed until the rest fit
- **THEN** the arrows disappear without any call from the application

### Requirement: Drag scrolling

On a paginated strip, moving a mouse or pen by at least 4 px with the primary button held SHALL scroll the strip with the pointer, and the click that ends the drag MUST NOT select a tab. A smaller movement SHALL count as a click. Touch, other buttons and presses on nested buttons, inputs, selects and text areas MUST NOT start a drag.

#### Scenario: Dragging past the threshold

- **WHEN** the user presses on the strip, drags 20 px to the left and releases over a label
- **THEN** the strip is scrolled by 20 px and the selection is unchanged

#### Scenario: Small movement

- **WHEN** the user presses on a label, moves 2 px and releases
- **THEN** the strip does not scroll and the label's tab is selected

#### Scenario: Touch

- **WHEN** a touch pointer moves 20 px across the strip
- **THEN** the strip is not dragged

### Requirement: Coasting after a drag

A drag released while still moving SHALL keep the strip scrolling in the same direction, slowing down until it stops or reaches a scroll bound. Wheel input or a new press on the strip SHALL stop it at once. A drag whose pointer is released outside the window SHALL end at the next move without the button held.

#### Scenario: Flick and wheel

- **WHEN** the user flicks the strip and turns the mouse wheel while it is still moving
- **THEN** the strip stops moving at once

#### Scenario: Release outside the window

- **WHEN** a drag is in progress and the next pointer move reports no button held
- **THEN** the drag ends and later moves do not scroll the strip

### Requirement: Right-to-left strips

In a right-to-left layout the header SHALL carry `kbq-tab-header_rtl`, and arrows, bounds, scrolling into view and dragging SHALL work along the reading direction, so the next arrow scrolls towards the end of the list.

#### Scenario: Scrolling a label into view in RTL

- **WHEN** in RTL the last label lies past the visible part and receives focus
- **THEN** the strip scrolls towards the end of the list in the reading direction

### Requirement: Scrolling a vertical strip

A vertical strip SHALL scroll vertically, with the scrollbar mode from `KBQ_SCROLLBAR_OPTIONS`, while a horizontal strip keeps its scrollbar hidden. When a vertical strip first renders or gains tabs and does not fit, its scrollbar SHALL be revealed briefly without the pointer near it; one that fits SHALL reveal nothing.

#### Scenario: Overflowing vertical strip appears

- **WHEN** a vertical group with more tabs than fit its height renders
- **THEN** the strip's scrollbar track is revealed without any pointer interaction

### Requirement: Switch animation

`animationDuration` SHALL set how long the content takes to slide in from the side of the previously selected tab, mirrored in right-to-left layouts. It SHALL default to the `animationDuration` of `KBQ_TABS_CONFIG`, or to `0ms` when none is provided, and a bound `undefined` SHALL restore that default. A bare number SHALL be read as milliseconds. With animations disabled, the content MUST NOT move.

#### Scenario: Configured default

- **WHEN** `KBQ_TABS_CONFIG` provides `300ms` and the bound `animationDuration` changes from `500ms` to `undefined`
- **THEN** the group's `animationDuration` is `300ms`

### Requirement: Animation done event

`animationDone` SHALL emit when the content of a newly selected tab has finished moving into place. When that motion never finishes, the group SHALL stop waiting after Angular's `MAX_ANIMATION_TIMEOUT`.

#### Scenario: Switching tabs

- **WHEN** the second tab is selected and the user clicks the third label
- **THEN** `animationDone` fires

### Requirement: Selection underline

A horizontal strip with `underlined` SHALL draw an underline under the selected tab or active link that moves to the new selection, with motion unless animations are disabled. The underline element SHALL carry `aria-hidden="true"`, and `kbq-disabled` while the selected tab is disabled. A nav bar without an active link draws none.

#### Scenario: Selection moves

- **WHEN** the selection moves to the third label
- **THEN** the underline is placed under the third label

#### Scenario: Animations disabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` disables animations
- **THEN** the underline carries `kbq-animations-disabled`

### Requirement: Text areas inside tabs

A tab group SHALL let a `kbqTextarea` declared in the content of its tabs, in the same template as the group, recompute its height each time the group emits `animationDone`.

#### Scenario: Text area in an inactive tab

- **WHEN** a growing `kbqTextarea` sits in the second tab and the user selects that tab
- **THEN** the text area recomputes its height once the switch animation ends

### Requirement: Arrow keys move focus

With focus in a horizontal strip, Right and Left SHALL move focus to the next and previous label, and Up and Down SHALL do nothing. In a vertical strip, Down and Up SHALL move it and Left and Right SHALL do nothing. Focus SHALL skip disabled tabs and stop at the ends without wrapping. Moving focus MUST NOT change the selection.

#### Scenario: Skipping a disabled tab

- **WHEN** focus is on the first label, the second tab is disabled and the user presses Right
- **THEN** focus moves to the third label and the selection is unchanged

#### Scenario: Left past a disabled tab

- **WHEN** focus is on the third label, the second tab is disabled and the user presses Left
- **THEN** focus moves to the first label

### Requirement: Home and End

Home SHALL move focus to the first enabled label and End to the last enabled label, skipping disabled tabs.

#### Scenario: Home with a disabled first tab

- **WHEN** the first two tabs are disabled, focus is on the fourth label and the user presses Home
- **THEN** focus moves to the third label

### Requirement: Manual activation

Enter and Space SHALL select the tab whose label has focus. The strip SHALL prevent the default action of Home, End, Enter, Space and all four arrow keys. Keys pressed with a modifier key MUST be ignored.

#### Scenario: Selecting the focused tab

- **WHEN** the first tab is selected, the user presses Right to focus the third label and then Enter
- **THEN** the third tab is selected and the Enter key's default action is prevented

#### Scenario: Space

- **WHEN** focus is on the first label of a group whose third tab is selected and the user presses Space
- **THEN** the first tab is selected and the Space key's default action is prevented

### Requirement: Focus change event

`focusChange` SHALL emit a `KbqTabChangeEvent` with the `index` of the label that keyboard focus moved to, whether by a key or by a click on another label.

#### Scenario: Arrow key after a click

- **WHEN** the user clicks the third label and then presses Left
- **THEN** `focusChange` fires twice, the second time with `index` 1

### Requirement: Single tab stop

Exactly one enabled label SHALL carry `tabindex="0"` and every other label `tabindex="-1"`. The tab stop SHALL start on the selected tab from the first render and follow keyboard focus. When the label holding it is disabled, the first enabled label SHALL hold it instead. Disabled labels SHALL carry `-1`.

#### Scenario: Group opened on the second tab

- **WHEN** a group of three tabs first renders with the second tab selected
- **THEN** the labels carry `tabindex` `-1`, `0` and `-1`

#### Scenario: Selected tab disabled

- **WHEN** the selected tab is disabled
- **THEN** the first enabled label carries `tabindex="0"`

### Requirement: Focus moves next to a removed tab

When the label or link that holds keyboard focus is removed, focus SHALL move to the label at the same position, or the new last one, and to the first enabled one when that is disabled. This SHALL also hold in a nav bar, where focus goes to the adjacent link and not to the active one. When focus was not in the strip, the removal MUST NOT move focus.

#### Scenario: Removing the focused last tab

- **WHEN** focus is on the last label and that tab is removed
- **THEN** the new last label has focus

#### Scenario: Focus elsewhere

- **WHEN** focus is not in the strip and a tab is removed
- **THEN** focus stays on the document body

### Requirement: Tab group semantics

The label strip SHALL have `role="tablist"`, each label `role="tab"` and each content region `role="tabpanel"`. Label N SHALL point `aria-controls` at the id of region N, and region N SHALL point `aria-labelledby` at label N. Ids SHALL be generated as `kbq-tab-label-<group>-<n>` and `kbq-tab-content-<group>-<n>`. The group SHALL pass axe checks.

#### Scenario: Roles and relations

- **WHEN** a group of three tabs renders
- **THEN** the labels have `role="tab"`, the regions `role="tabpanel"`, and each label's `aria-controls` equals its region's id

### Requirement: Selected tab state

The selected label SHALL carry `aria-selected="true"` and the class `kbq-selected`, every other label `aria-selected="false"`. The selected content region SHALL carry `kbq-tab-body__active`.

#### Scenario: Second tab selected

- **WHEN** the second of three tabs is selected
- **THEN** the labels carry `aria-selected` `false`, `true` and `false`

### Requirement: Tab panel tab stop

The content region of the selected tab SHALL carry `tabindex="0"` so it is reachable when it holds nothing focusable; other regions SHALL carry no `tabindex`.

#### Scenario: Region tab stops

- **WHEN** the second of three tabs is selected
- **THEN** only the second region has `tabindex="0"`

### Requirement: Orientation of the tab list

A vertical group SHALL give its tablist `aria-orientation="vertical"`; a horizontal group SHALL give it no `aria-orientation`.

#### Scenario: Vertical group

- **WHEN** a group has `vertical` set
- **THEN** its `role="tablist"` element has `aria-orientation="vertical"`

### Requirement: Overlays opened from tab content close on scroll

A `kbq-select`, a `kbq-tree-select` or a `kbqDropdownTriggerFor` trigger declared inside a `kbq-tab` SHALL close its panel when the page or a scroll container outside the panel scrolls, instead of following the scroll.

#### Scenario: Scrolling with an open select

- **WHEN** a select inside a tab has its panel open and the user scrolls the page
- **THEN** the panel closes

### Requirement: Active link of a nav bar

`[kbqTabNavBar]` (or `[kbq-tab-nav-bar]`) SHALL treat the first `kbqTabLink` (or `kbq-tab-link`) whose `active` is `true` as the current one: it carries `kbq-selected` and the underline. The nav bar MUST NOT change `active` itself; the application sets it, for example from a click or the router.

#### Scenario: Moving the active link

- **WHEN** `active` moves from the first to the second link
- **THEN** only the second link carries `kbq-selected`

### Requirement: Disabled links

A link with `disabled` SHALL carry `kbq-disabled` and `aria-disabled="true"`, never a `disabled` attribute, SHALL ignore the pointer, and SHALL get `tabindex="-1"`. Enter and Space on a disabled link SHALL have their default action prevented. Arrow keys SHALL skip disabled links.

#### Scenario: Disabling every link

- **WHEN** all links of a nav bar become disabled
- **THEN** each carries `kbq-disabled`, `aria-disabled="true"` and `tabIndex` -1

#### Scenario: Pointer on a disabled link

- **WHEN** a link is disabled
- **THEN** its computed `pointer-events` is `none`

### Requirement: Link tab index and id

A link's `tabIndex` input SHALL default to 0, and a bound `null` or `undefined` SHALL restore 0. A link's `id` SHALL default to a generated `kbq-tab-link-<n>`, and a bound `undefined` SHALL restore the generated one.

#### Scenario: Binding the tab index

- **WHEN** a link's `tabIndex` is bound to 3 and then to `null`
- **THEN** the link carries `tabindex="3"` and then `tabindex="0"`

#### Scenario: Custom id removed

- **WHEN** a link's `id` is bound to "custom-link" and then to `undefined`
- **THEN** the link's id is "custom-link" and then the generated one again

### Requirement: Nav bar without a panel

Without `tabNavPanel`, a nav bar SHALL stay plain navigation: it adds no `role`, `aria-orientation`, `aria-selected` or `aria-controls` and leaves those the author wrote, the active link SHALL carry `aria-current="page"`, and every enabled link SHALL carry its own `tabIndex`, so each is a tab stop.

#### Scenario: Plain navigation

- **WHEN** a nav bar has three links, the first active, and no `tabNavPanel`
- **THEN** the links carry no `role` and no `aria-selected`, and `aria-current` reads `page`, absent, absent

### Requirement: Nav bar with a panel

With `tabNavPanel` bound to a `kbqTabNavPanel`, the nav bar SHALL have `role="tablist"` (with `aria-orientation="vertical"` when vertical), each link `role="tab"`, `aria-selected` and `aria-controls` set to the panel id, and no `aria-current`. Only the active enabled link SHALL be a tab stop. The panel SHALL have `role="tabpanel"` and `aria-labelledby` set to the active link's id.

#### Scenario: Panel relations

- **WHEN** the second link of a nav bar with a panel becomes active
- **THEN** the panel's `aria-labelledby` equals the second link's id and the links carry `tabIndex` -1, 0 and -1

#### Scenario: Active link disabled

- **WHEN** the active link of a nav bar with a panel becomes disabled
- **THEN** every link carries `tabIndex` -1

### Requirement: Nav panel id

A `kbqTabNavPanel` SHALL take its `id` input as its element id, and default to a generated `kbq-tab-nav-panel-<n>`.

#### Scenario: Generated panel id

- **WHEN** a `kbqTabNavPanel` has no `id` input
- **THEN** its element has a non-empty generated id that the links' `aria-controls` point at

### Requirement: Activating a link from the keyboard

In a nav bar with a panel, Enter and Space on an enabled link SHALL click it. Space SHALL have its default action prevented so the page does not scroll.

#### Scenario: Space on a link

- **WHEN** focus is on an enabled link of a nav bar with a panel and the user presses Space
- **THEN** the link receives a click and the page does not scroll

### Requirement: Keyboard in a nav bar

The arrow keys, Home and End SHALL move focus between the links of a nav bar as in a tab group, following its orientation. A link that receives focus by any means SHALL become the position the arrow keys move from.

#### Scenario: Tabbing then arrowing

- **WHEN** the user tabs onto the third link of a horizontal nav bar and presses Right
- **THEN** focus moves to the fourth link

### Requirement: Nav bar layout inputs

A nav bar SHALL accept `vertical`, `underlined`, `transparent`, `onSurface` and `disablePagination`. Its host SHALL carry `kbq-tab-group_vertical` while `vertical` is `true`, `kbq-tab-header_underlined` with `underlined`, and `kbq-tab-nav-bar_filled` or `kbq-tab-nav-bar_transparent`, and `kbq-tab-nav-bar_on-background` or `kbq-tab-nav-bar_on-surface`.

#### Scenario: Vertical nav bar

- **WHEN** a nav bar's `vertical` binding turns `true` and then `false`
- **THEN** the host gains and then loses `kbq-tab-group_vertical`, and its strip switches between the configured scrollbar mode and `hidden`

### Requirement: State saving is on by default

A tab group SHALL persist its selection through `KBQ_STATE_STORE` unless `useStateSaving` is `false`. The default SHALL come from `KBQ_STATE_SAVING_ENABLED`, which is `true`. With `useStateSaving` set to `false` the group MUST NOT read or write any state. A nav bar MUST NOT persist anything.

#### Scenario: Turned off

- **WHEN** a group has `[useStateSaving]="false"` and the user selects the third tab
- **THEN** the store holds nothing

### Requirement: Restoring the selection

On initialization, a persisting group SHALL select the tab whose `tabId` matches the stored one, falling back to the stored position when no tab has that id. A stored state that names neither an existing tab id nor an existing position, or that is malformed, SHALL be ignored, leaving the default selection.

#### Scenario: Tabs reordered

- **WHEN** the store holds `{ tabId: 'last', index: 2 }` and the tabs now render as "last", "first", "second"
- **THEN** the first tab, "last", is selected

#### Scenario: Unusable payload

- **WHEN** the store holds `'nonsense'`, `42`, `[]`, `{ tabId: 'first' }`, `{ index: -1 }` or `{ index: 1.5 }`
- **THEN** the first tab is selected

#### Scenario: Neither id nor position exists

- **WHEN** the store holds `{ tabId: 'gone', index: 9 }` for a group of three tabs
- **THEN** the first tab is selected

### Requirement: Persisting user selections

A persisting group SHALL write `{ tabId, index }` for every selection the user makes with the pointer or the keyboard, and when `saveState()` is called. A tab without a `tabId` SHALL be stored as `tabId: null` with its index, and in dev mode the group SHALL warn once that the selected tab has no `tabId`.

#### Scenario: Selecting a tab with an id

- **WHEN** the user clicks the third tab, whose `tabId` is "last"
- **THEN** the store holds `{ tabId: 'last', index: 2 }`

#### Scenario: Tabs without ids

- **WHEN** the tabs have no `tabId` and the user clicks the second and then the first label
- **THEN** the store holds `{ tabId: null, index: 0 }` and one warning containing "has no `tabId`" was logged

### Requirement: Application-driven selection is not persisted

When `selectedIndex` or `activeTab` is bound, even to `undefined`, the group MUST NOT restore or write state. A selection assigned in code through these properties MUST NOT be written either.

#### Scenario: Bound selectedIndex

- **WHEN** the store holds `{ tabId: 'last', index: 2 }`, the group binds `[(selectedIndex)]` to 1 and the user clicks the first label
- **THEN** the second tab was selected on init and the store still holds `{ tabId: 'last', index: 2 }`

#### Scenario: Bound but unset activeTab

- **WHEN** the group binds `[(activeTab)]` to a value that is `undefined` and the store names the second tab
- **THEN** the first tab is selected and a click does not change the store

### Requirement: State saving key

A group SHALL persist under its `stateSavingKey`, or, when that is empty, under a key derived from its place in the document, such as `#root0/kbq-tab-group`. When the key changes after initialization, the group SHALL restore from the new key.

#### Scenario: Derived key

- **WHEN** a group with an empty `stateSavingKey` persists a selection
- **THEN** the store key matches `#root<n>/kbq-tab-group`

### Requirement: Clearing the saved state

`clearSavedState()` SHALL remove the state stored for the group while leaving persistence on, so the next user selection is written again. `hasSavedState` SHALL be `true` while state was restored or written, and `false` after `clearSavedState()` or while `useStateSaving` is `false`.

#### Scenario: Clear and select again

- **WHEN** the group restored a state, `clearSavedState()` is called and the user then clicks the first label
- **THEN** `hasSavedState` was `false` after the call and the store then holds `{ tabId: 'first', index: 0 }`

### Requirement: Group outside the document

A group that is not attached to the document while it initializes, such as one projected into a closed overlay, MUST NOT restore or write state and MUST NOT warn, even with a `stateSavingKey`.

#### Scenario: Detached host

- **WHEN** the store holds a state for the derived key and the group initializes detached from the document
- **THEN** the first tab is selected and no warning is logged

### Requirement: Registration with the state saving service

A tab group SHALL register with `KbqStateSavingService` under the name `kbq-tab-group` and its key while it exists, and unregister when destroyed.

#### Scenario: Destroying the group

- **WHEN** a group with `stateSavingKey="tabs-key"` is created and then destroyed
- **THEN** the service lists it with that name and key, and then lists nothing

### Requirement: Module and exported names

`KbqTabsModule` SHALL export, among others, the group, tab, label, content, nav bar, link, nav panel and the stretch and align directives, each of which is also standalone. Templates SHALL be able to reference them as `kbqTabGroup`, `kbqTab`, `kbqTabNavBar`, `kbqTabLink` and `kbqTabNavPanel`.

#### Scenario: Template reference

- **WHEN** a template declares `<kbq-tab-group #group="kbqTabGroup">` and shows `group.selectedIndex`
- **THEN** the text follows the selection after a click, without a change-detection error
