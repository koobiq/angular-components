# dropdown Specification

## Purpose

Describes what `kbq-dropdown` and the `kbqDropdownTriggerFor` trigger from `@koobiq/components/dropdown` guarantee to consumers: how the menu panel opens and closes, where focus goes, how users operate items, nested panels and the search field with a pointer or the keyboard, and how the panel is positioned and sized.

## Requirements

### Requirement: Trigger requires a panel

`[kbqDropdownTriggerFor]` SHALL accept a `kbq-dropdown`, or another component that implements `KbqDropdownPanel`. When no panel is bound at content initialization or when the trigger opens, it MUST throw an error whose message starts with "kbqDropdownTriggerFor: must pass in an kbq-dropdown instance."

#### Scenario: Panel unbound after the first render

- **WHEN** the binding of `kbqDropdownTriggerFor` changes to `null` after the first render and `open()` is called
- **THEN** the trigger throws that error

#### Scenario: Custom panel

- **WHEN** the trigger is bound to a component that implements `KbqDropdownPanel` and is opened
- **THEN** the component's template is rendered in the overlay

### Requirement: Pointer toggles a top-level panel

A click on a top-level trigger SHALL open its panel in an overlay when it is closed and close it when it is open. Opening a panel that is already open MUST NOT render it a second time.

#### Scenario: Click opens the panel

- **WHEN** the user clicks a top-level trigger whose panel is closed
- **THEN** the panel is rendered in the overlay container

#### Scenario: Opening twice

- **WHEN** `open()` is called twice in a row
- **THEN** the panel is rendered once and nothing throws

### Requirement: Keyboard opens a top-level panel

While a top-level trigger has focus, Enter and Space SHALL toggle its panel and prevent the key's default action. Down Arrow SHALL open the panel and prevent the default action while the trigger's `openByArrowDown` is `true`, the default; with `openByArrowDown` set to `false`, Down Arrow MUST NOT open it.

#### Scenario: Enter opens the panel

- **WHEN** a top-level trigger has focus and the user presses Enter
- **THEN** the panel opens

#### Scenario: Down Arrow opens the panel

- **WHEN** a top-level trigger has focus and the user presses Down Arrow
- **THEN** the panel opens

#### Scenario: Down Arrow turned off

- **WHEN** `openByArrowDown` is `false` and the user presses Down Arrow on the trigger
- **THEN** the panel stays closed

### Requirement: Programmatic control of the trigger

`open()`, `close()` and `toggle()` on the trigger SHALL open, close and toggle the panel, and `opened` SHALL report the state, changing synchronously with these calls because closing waits for no exit animation. Calling these methods, `focus()` or `updatePosition()` from a consumer `effect()` MUST NOT make that effect run again when the panel opens or closes.

#### Scenario: Closed at once

- **WHEN** an open panel is closed with `close()`
- **THEN** `opened` is `false` right after the call

#### Scenario: Opening from an effect

- **WHEN** an `effect()` opens the panel and the user then closes it with Escape
- **THEN** the effect has run only once

### Requirement: Open-state outputs

The trigger SHALL emit `dropdownOpened` after it opens its panel and `dropdownClosed` after it closes it, and `openedChange` SHALL emit `true` and `false` at the same moments. A `dropdownClosed` handler that opens the panel again, with the same trigger or with another trigger bound to the same panel, SHALL leave the panel open and rendered.

#### Scenario: Reopening from the close handler

- **WHEN** two triggers share a panel with lazy content and the `dropdownClosed` handler of one opens the panel with the other
- **THEN** the second trigger reports `opened` as `true`
- **AND** the panel shows the content of the second trigger

### Requirement: Trigger host state

The trigger host SHALL have the class `kbq-dropdown-trigger`, and the class `kbq-pressed` while its panel is open. It SHALL publish `aria-expanded`, following the open state, only on a `button`, a `summary`, an `a` with `href` or an element with a `role` attribute, and it MUST NOT set `aria-haspopup`.

#### Scenario: Hosts that allow aria-expanded

- **WHEN** triggers are placed on a `button`, a `span` with `role="button"`, an `a` with `href` and a plain `span`
- **THEN** the first three have `aria-expanded="false"` and the plain `span` has no `aria-expanded`

#### Scenario: Open state

- **WHEN** the panel of a `button` trigger is opened
- **THEN** the trigger has `aria-expanded="true"`

#### Scenario: Pressed class removed on closing

- **WHEN** the panel is closed by a click on one of its items
- **THEN** the trigger no longer has the class `kbq-pressed`

### Requirement: Trigger has no disabled state

The trigger SHALL have no disabled state of its own: it reacts to the clicks and keys its host element receives, so a trigger on a disabled native button cannot be opened by the user, while `open()` still opens its panel.

#### Scenario: Disabled button trigger

- **WHEN** the trigger is a `button` with the `disabled` attribute and the user clicks it
- **THEN** the panel stays closed

### Requirement: Close reasons

The panel's `closed` SHALL report why it closed: `'keydown'` for Escape, the arrow closing a nested panel and an item activated while the panel's focus origin is `keyboard`; `'click'` for other activations; `'tab'` for Tab; no value for a backdrop or outside click, the trigger's `close()` and a destroyed trigger whose panel is open. Up and Down Arrow, Home, End, Page Up and Page Down SHALL set that origin to `keyboard`; an opening SHALL set its own unless `kbqDropdownTriggerAutoFocus` is off.

#### Scenario: Item clicked

- **WHEN** the panel was opened by a call and the user clicks an enabled item
- **THEN** `closed` emits `'click'` once

#### Scenario: Escape

- **WHEN** the user presses Escape in the panel
- **THEN** `closed` emits `'keydown'` once

#### Scenario: Backdrop

- **WHEN** the user clicks the backdrop
- **THEN** `closed` emits once with no value

#### Scenario: Destroyed while open

- **WHEN** the view holding an open dropdown is destroyed
- **THEN** `closed` emits once

#### Scenario: Page Down before a click

- **WHEN** the panel was opened by a call, the user presses Page Down in it and then clicks an enabled item
- **THEN** `closed` emits `'keydown'`

#### Scenario: Keyboard opening without auto focus

- **WHEN** `kbqDropdownTriggerAutoFocus` is `false`, the panel is opened with Enter for the first time and the user clicks an enabled item without pressing a key in the panel
- **THEN** `closed` emits `'click'`

### Requirement: Closing a panel through the panel

`close()` on a panel SHALL close every trigger that has it open together with the panels it is nested in, as an item activation does. When no trigger has it open, it SHALL close nothing, and a second call MUST NOT emit `closed` of the enclosing panels again.

#### Scenario: Panel that is not open

- **WHEN** the root panel is open and `close()` is called on a nested panel that is not open
- **THEN** the root panel stays open and its `closed` does not emit

#### Scenario: Closing twice

- **WHEN** a nested panel is open and `close()` is called on it twice
- **THEN** the root panel's `closed` emits `'click'` exactly once

### Requirement: Clicks in the content close the whole chain

A click that reaches the options content of a panel — on an enabled item or on any other element there, such as a group header or a divider — SHALL close that panel and every panel it is nested in. A click on a disabled item, on a nested trigger item, on an item's secondary action, on the search field or in the footer MUST NOT close the panel.

#### Scenario: Item in a third-level panel

- **WHEN** three nested panels are open and the user clicks an item of the innermost one
- **THEN** all three panels close

#### Scenario: Disabled item

- **WHEN** the user clicks a disabled item
- **THEN** the panel stays open and `closed` does not emit

### Requirement: Escape closes one panel

Escape pressed in an open panel SHALL close that panel only, so the parent of a nested panel stays open, and the key MUST NOT propagate past the panel. An Escape whose default action a pop-up inside the panel has already prevented, such as the tooltip of an item that closes on it, MUST NOT close the panel.

#### Scenario: Escape in the panel

- **WHEN** the panel is open and the user presses Escape
- **THEN** the panel closes

#### Scenario: Escape spent by a tooltip

- **WHEN** a tooltip of an item is shown and the user presses Escape
- **THEN** the tooltip closes and the panel stays open
- **AND** a second Escape closes the panel

### Requirement: Tab closes every panel

Tab pressed in an open panel SHALL close it together with every panel it is nested in, with the reason `'tab'`, unless the key moves focus between an item and its secondary action.

#### Scenario: Tab in a nested panel

- **WHEN** three nested panels are open and the user presses Tab in the innermost one
- **THEN** all three panels close

### Requirement: Outside pointer events close the panel

Without a backdrop, the default, a pointer event outside the trigger and its open panels SHALL close the panel. A `click` on the trigger itself SHALL be left to the trigger, while a context-menu event or an auxiliary-button click on the trigger SHALL close the panel.

#### Scenario: Context menu on the trigger

- **WHEN** the panel has no backdrop and the trigger receives a context-menu event or an auxiliary-button click
- **THEN** the panel closes

### Requirement: Backdrop

With `hasBackdrop` set, the top-level panel SHALL get a backdrop with the class `cdk-overlay-transparent-backdrop`, or the class given by `backdropClass`, and a click on it SHALL close every open panel. Nested panels MUST NOT get a backdrop of their own. `hasBackdrop` SHALL be read again on every opening.

#### Scenario: One backdrop for a chain

- **WHEN** every panel of a chain of three sets `hasBackdrop` and all three are open
- **THEN** there is one backdrop, behind the panels
- **AND** a click on it closes all three panels

#### Scenario: Custom backdrop class

- **WHEN** `backdropClass` is `custom-backdrop` and the panel opens
- **THEN** the backdrop has the class `custom-backdrop`

#### Scenario: Backdrop removed between openings

- **WHEN** `hasBackdrop` changes from `true` to `false` while the panel is closed and the panel opens again
- **THEN** no backdrop is rendered

### Requirement: Scrolling the page

While the panel is open, a scroll that the CDK `ScrollDispatcher` reports, of the document or of a container registered with it such as one marked `cdkScrollable`, SHALL reposition the panel to follow the trigger; scrolling an ancestor that is not registered leaves the panel in place. A `KBQ_DROPDOWN_SCROLL_STRATEGY` provided by the application SHALL replace that behaviour, for example to close the panel on scroll. Scrolling inside the panel MUST NOT reposition the overlay.

#### Scenario: Close strategy

- **WHEN** the application provides a close scroll strategy and the page scrolls while the panel is open
- **THEN** the panel closes

#### Scenario: Scrolling the panel content

- **WHEN** the user scrolls the content of an open panel
- **THEN** the trigger is not measured again

#### Scenario: Unregistered scrolling ancestor

- **WHEN** the trigger sits in a plain `overflow: auto` container that is not registered with the `ScrollDispatcher` and that container scrolls while the panel is open
- **THEN** the panel is not repositioned

### Requirement: Focus on opening

In a panel without a search field, opening with the keyboard, or with a call, SHALL focus the first enabled item, and opening with a mouse or touch SHALL focus the panel itself with no item focused; the first Down Arrow SHALL then focus the first enabled item with the keyboard focus origin. The item list SHALL be scrolled to the top on opening.

#### Scenario: Opened with the keyboard

- **WHEN** the user opens the panel with Enter
- **THEN** the first item is focused with the `keyboard` origin

#### Scenario: Opened with the mouse

- **WHEN** the user opens the panel with a mouse click
- **THEN** the panel element has focus and no item has the class `cdk-focused`

#### Scenario: First arrow after a mouse opening

- **WHEN** the panel was opened with the mouse and the user presses Down Arrow twice, the second item being disabled
- **THEN** the first and then the third item is focused, with `cdk-keyboard-focused`

### Requirement: Opening without moving focus

With `kbqDropdownTriggerAutoFocus` set to `false` on the trigger, opening SHALL leave focus where it is and focus no item.

#### Scenario: Auto focus off

- **WHEN** `kbqDropdownTriggerAutoFocus` is `false` and the panel opens
- **THEN** the panel is rendered and no item takes focus

### Requirement: Focus restored on closing

On closing, the trigger SHALL get focus back with the origin of the last press on it since it last closed: `keyboard` for a key that opens or toggles it, `mouse` for a primary-button press, `touch` for a touch, else `program`, as after `open()` or another mouse button; so closing with a click on the trigger restores `mouse`. It SHALL do so only while focus is in the panel, on the trigger or on the page body. With `kbqDropdownTriggerRestoreFocus` set to `false`, focus MUST NOT be restored.

#### Scenario: Opened with the mouse

- **WHEN** the panel was opened with a mouse click and is closed
- **THEN** the trigger has focus and the class `cdk-mouse-focused`

#### Scenario: Opened by a call

- **WHEN** the panel was opened with `open()` and is closed with `close()`
- **THEN** the trigger is focused with the `program` origin

#### Scenario: Focus moved out of the panel

- **WHEN** the user moved focus to a field outside the panel and the panel then closes
- **THEN** that field keeps focus

#### Scenario: Closed by a click on the trigger

- **WHEN** a panel without a backdrop was opened with Enter and the user closes it with a click on the trigger
- **THEN** the trigger has focus and the class `cdk-mouse-focused`

### Requirement: Focus across nested panels

Closing a nested panel opened by a call, or closing it with Escape or the arrow key back, SHALL return focus to its trigger item in the parent panel. A nested panel opened by hover that closes because another item is hovered MUST NOT pull focus back to its trigger item. When an item activation closes the whole chain, focus SHALL end on the root trigger; on the way, the trigger item of each nested panel opened by a call SHALL take it, unlike those opened with the keyboard or the pointer.

#### Scenario: Stepping back through nested panels

- **WHEN** three nested panels were opened with `open()` and the innermost and then the middle one are closed
- **THEN** focus is inside the middle panel and then inside the root panel

#### Scenario: Activating a nested item with the keyboard

- **WHEN** the user opens the root and two nested panels with the keyboard and activates an item of the innermost panel
- **THEN** all panels close and the root trigger is focused once, with the `keyboard` origin
- **AND** the root panel's `closed` emits `'keydown'`

#### Scenario: Hovering away from a nested trigger

- **WHEN** a nested panel was opened by hover and the user hovers the next item of the parent panel
- **THEN** the nested trigger item does not have focus

#### Scenario: Activating an item of a chain opened by calls

- **WHEN** the root panel and a nested panel were opened with `open()` and the user clicks an item of the nested panel
- **THEN** the nested trigger item is focused first and then the root trigger, which keeps focus

### Requirement: Arrow keys move focus across items

In a panel without a search field, Down and Up Arrow SHALL focus the next and the previous enabled item, skipping disabled items and stopping at the first and last one, and Home and End SHALL focus the first and the last enabled item. An item focused this way SHALL be scrolled into view, also in a panel opened with the mouse.

#### Scenario: Home and End

- **WHEN** the panel is open and the user presses End and then Home
- **THEN** the last and then the first enabled item has focus

#### Scenario: End in a panel opened with the mouse

- **WHEN** the panel was opened with the mouse and the user presses End
- **THEN** the last enabled item has focus and is scrolled into view

### Requirement: Navigation wrap

With `navigationWithWrap` set to `true` on the panel, Down Arrow on the last enabled item SHALL focus the first one and Up Arrow on the first SHALL focus the last. The value SHALL be read when the panel builds its key manager for a navigation mode: at content initialization for the mode it starts in, and once more the first time it switches between focus and highlight navigation, as when a search field appears. Later changes MUST NOT take effect.

#### Scenario: Wrapping past the end

- **WHEN** `navigationWithWrap` is `true`, the last enabled item has focus and the user presses Down Arrow
- **THEN** the first enabled item has focus

#### Scenario: Set before a search field appears

- **WHEN** `navigationWithWrap` changes from `false` to `true` after content initialization, a search field is then revealed and the user presses Down Arrow in it while the last enabled item is highlighted
- **THEN** the first enabled item is highlighted

### Requirement: Hover focuses an item

In a panel without a search field, moving the pointer onto an enabled item SHALL focus it with the `mouse` focus origin without scrolling the list. A disabled item MUST NOT take focus on hover.

#### Scenario: Hovering an item

- **WHEN** the panel was opened with the mouse and the pointer enters the third item
- **THEN** that item has focus and the classes `cdk-focused` and `cdk-mouse-focused`

#### Scenario: Partially clipped row

- **WHEN** the pointer lands on a row that the panel's scroll area cuts off
- **THEN** the list does not scroll

### Requirement: Typeahead

In a panel without a search field, characters typed in quick succession SHALL focus the next enabled item whose label starts with them, ignoring case. An item's label SHALL be its text without its icons and its secondary action, and SHALL follow later changes of that text.

#### Scenario: Skipping a disabled match

- **WHEN** the items are "Alpha", a disabled "Bravo" and "Bravado" and the user types "b"
- **THEN** "Bravado" has focus

#### Scenario: Label without the icon

- **WHEN** an item holds an icon and the text "Item with an icon"
- **THEN** its label is "Item with an icon"

#### Scenario: Renamed item

- **WHEN** the text of an item changes from "Item" to "Renamed" after its label was read
- **THEN** its label is "Renamed"

### Requirement: Keyboard activation of an item

Enter or Space on an enabled item SHALL be replayed as a click on it, preventing the key's default action, unless the host is a `button`, an `a` with `href` or has `role="menuitem"`; such hosts SHALL activate themselves. A key pressed on the item's secondary action, on a disabled item, on an item in progress or on a nested trigger item MUST NOT be replayed as a click.

#### Scenario: Enter on a div item

- **WHEN** a `div` item has focus and the user presses Enter
- **THEN** the item's click handler runs once and the panel closes

#### Scenario: Space on a div item

- **WHEN** a `div` item has focus and the user presses Space
- **THEN** the item's click handler runs and the key's default action is prevented

#### Scenario: Native button item

- **WHEN** a `button` item has focus and the user presses Enter
- **THEN** no extra click is dispatched on it

#### Scenario: Host with its own role

- **WHEN** the item has `role="menuitem"` and the user presses Enter on it
- **THEN** its click handler does not run, while an item with `role="button"` does run it

#### Scenario: Nested trigger item

- **WHEN** a nested trigger item has focus and the user presses Enter
- **THEN** its nested panel opens and the item's click handler does not run

### Requirement: Disabled item

An item with `disabled` SHALL have the class `kbq-disabled`, the attributes `disabled="true"` and `aria-disabled="true"` and `tabindex="-1"`; an enabled item SHALL have `tabindex="0"` and none of the others. A click on a disabled item SHALL have its default action prevented and MUST NOT close the panel or open a nested panel.

#### Scenario: Toggling disabled

- **WHEN** an item's `disabled` changes from `false` to `true` and back
- **THEN** its class and attributes follow, ending as an enabled item again

#### Scenario: Disabled nested trigger clicked

- **WHEN** a click lands on a disabled item that is a nested trigger
- **THEN** its nested panel does not open

### Requirement: Item in progress

`progress` on an item SHALL add the class `kbq-progress` and a loading shimmer over the item; the shimmer SHALL stand still, with the class `kbq-animations-disabled`, when animations are disabled. `progress` alone MUST NOT set `aria-disabled` or `tabindex="-1"` on the item.

#### Scenario: Loading item

- **WHEN** an item has `progress`
- **THEN** it has the class `kbq-progress` and its shimmer is animated

#### Scenario: Animations disabled

- **WHEN** animations are disabled through `KBQ_ANIMATIONS_CONFIG` and an item has `progress`
- **THEN** the shimmer has the class `kbq-animations-disabled`

### Requirement: Secondary action of an item

An element with `kbqDropdownItemAction` inside an item SHALL get the class `kbq-dropdown-item__action` and give the item the class `kbq-dropdown-item_has-action`. A click on the action MUST NOT run the item's own click handlers or close the panel, and Tab from the item and Shift+Tab from the action SHALL move focus between them without closing the panel.

#### Scenario: Clicking the action

- **WHEN** the user clicks the action of an item
- **THEN** the action's click handler runs once and the item's does not

#### Scenario: Tab onto the action

- **WHEN** the item has focus and the user presses Tab
- **THEN** the panel stays open

#### Scenario: Leaving the item

- **WHEN** the action has focus and the user presses Tab
- **THEN** the panel closes with the reason `'tab'`

### Requirement: Inactive secondary action

While its item is disabled or in progress, the action SHALL have `tabindex="-1"`, the class `kbq-disabled` and `aria-disabled="true"`, and a click on it SHALL have its default action prevented. Once the item is active again, an action that had a `tabindex` attribute SHALL get that value back, while one that had none keeps `tabindex="-1"`. An active action MUST NOT lose a `tabindex` set by its host component.

#### Scenario: Action of a disabled item

- **WHEN** the item is disabled and the user clicks its action
- **THEN** the action has `tabindex="-1"` and `kbq-disabled`, and the click's default action is prevented

#### Scenario: Action of an item in progress

- **WHEN** the item has `progress`
- **THEN** its action has `tabindex="-1"` and `kbq-disabled`

#### Scenario: Active icon-button action

- **WHEN** the action of an enabled item is a `kbq-icon-button`
- **THEN** it keeps `tabindex="0"`

#### Scenario: Action without a tabindex of its own

- **WHEN** an item whose `a` action with `href` has no `tabindex` attribute is disabled and then enabled again
- **THEN** the action still has `tabindex="-1"`

### Requirement: Caption and group header

`kbqDropdownItemCaption` SHALL mark a secondary line inside an item with the class `kbq-dropdown-item__caption`, and `kbqDropdownGroupHeader` SHALL mark a group header in the panel with the class `kbq-dropdown__group-header`.

#### Scenario: Content directives

- **WHEN** a panel holds a `kbqDropdownGroupHeader` and an item with a `kbqDropdownItemCaption`
- **THEN** they have the classes `kbq-dropdown__group-header` and `kbq-dropdown-item__caption`

### Requirement: Footer

Content marked with `kbq-dropdown-footer` or `kbqDropdownFooter` SHALL be rendered in the panel after the options content, not inside it, with the class `kbq-dropdown-footer`, and a click in it MUST NOT close the panel.

#### Scenario: Footer projected

- **WHEN** a panel holds an item and a `kbq-dropdown-footer` with the text "Footer content"
- **THEN** the footer is rendered outside the options content and the options content does not contain its text

#### Scenario: Clicking the footer

- **WHEN** the user clicks the footer
- **THEN** the panel stays open

### Requirement: Lazily rendered content

An `ng-template` marked `kbqDropdownContent` inside a panel SHALL be rendered only while the panel is open, with the value of `kbqDropdownTriggerData` of the trigger that opened it as the template context, and SHALL be removed when the panel closes.

#### Scenario: Rendered on opening

- **WHEN** a panel with lazy content opens
- **THEN** its items are rendered and the trigger reports `opened` as `true`

#### Scenario: Context of each trigger

- **WHEN** two triggers pass `{ label: 'one' }` and `{ label: 'two' }` as `kbqDropdownTriggerData` and each opens the panel in turn
- **THEN** the item reads "one" and then "two"

### Requirement: Nested trigger item

An item inside a panel that carries `[kbqDropdownTriggerFor]` SHALL be a nested trigger: hovering it, clicking it, Enter, Space and Right Arrow (Left Arrow in right-to-left layouts) SHALL open its panel without closing the parent panel or toggling. A disabled nested trigger MUST NOT open on hover.

#### Scenario: Opening by hover

- **WHEN** the pointer enters an enabled nested trigger item
- **THEN** its nested panel opens

#### Scenario: Right Arrow

- **WHEN** a nested trigger item has focus in a left-to-right layout and the user presses Right Arrow
- **THEN** its nested panel opens

#### Scenario: Disabled nested trigger

- **WHEN** the pointer enters a disabled nested trigger item
- **THEN** no nested panel opens

### Requirement: Nested trigger item appearance

A nested trigger item SHALL show a right-pointing chevron, SHALL have the class `kbq-dropdown-item_highlighted` while its panel is open, and SHALL prevent the default action of a mouse press so that pressing it does not move focus.

#### Scenario: Highlighted while open

- **WHEN** a nested panel is opened by hovering its trigger item and the pointer then enters the next item
- **THEN** the trigger item has `kbq-dropdown-item_highlighted` while its panel is open and loses it when the panel closes

#### Scenario: Mouse press

- **WHEN** the user presses the mouse button on a nested trigger item
- **THEN** the event's default action is prevented

### Requirement: Closing nested panels

Hovering another item of a parent panel SHALL close the nested panels open from it, unless a safe area protects the open one. Left Arrow (Right Arrow in right-to-left layouts) in a nested panel SHALL close that panel only, and a top-level panel SHALL ignore both horizontal arrows. Closing a panel SHALL close every panel nested in it.

#### Scenario: Hovering a sibling item

- **WHEN** two nested levels are open and the pointer enters another item of the root panel
- **THEN** only the root panel stays open

#### Scenario: Hovering a sibling that became disabled

- **WHEN** a nested panel is open and the pointer enters a sibling item that is disabled
- **THEN** the nested panel closes

#### Scenario: Arrow back

- **WHEN** a nested panel is open in a left-to-right layout and the user presses Left Arrow in it
- **THEN** that panel closes and its parent stays open

#### Scenario: Root closed by a call

- **WHEN** three nested panels are open and the root trigger's `close()` is called
- **THEN** all three panels close

### Requirement: Nested panel position

A nested panel SHALL open beside its trigger item, after it in left-to-right layouts, before it in right-to-left ones, else on the other side; with the default `yPosition`, its top 4 px above the item's top, or its bottom 4 px below the item's bottom if it falls back upward. It SHALL shift 8 px left on its first side and 8 px right on the other, but left if it also falls back vertically. `xPosition: 'center'` SHALL act as `'after'`; the panel SHALL have the class `kbq-dropdown__panel_nested`.

#### Scenario: Left-to-right

- **WHEN** a nested panel opens in a left-to-right layout with room on the right
- **THEN** its left edge is 8 px left of the trigger item's right edge, overlapping it, and its top is 4 px above the item's top

#### Scenario: Left-to-right fallback

- **WHEN** there is no room after the trigger item in a left-to-right layout
- **THEN** the panel's right edge is 8 px right of the item's left edge, overlapping it

#### Scenario: Right-to-left

- **WHEN** a nested panel opens in a right-to-left layout with room on the left
- **THEN** its right edge is 8 px left of the trigger item's left edge, leaving a gap

#### Scenario: Right-to-left fallback

- **WHEN** there is no room before the trigger item in a right-to-left layout
- **THEN** the panel's left edge is 8 px right of the item's right edge, leaving a gap

#### Scenario: Upward fallback

- **WHEN** a nested panel with the default `yPosition` has no room below the top of its trigger item
- **THEN** the panel's bottom edge is 4 px below the item's bottom edge

### Requirement: Shared and repeated nested panels

One nested panel SHALL be openable from several trigger items, such as items rendered by a repeater or a recursive template, with one copy open at a time, and a nested panel declared inside its parent's content SHALL work like one declared outside. Activating an item of a shared nested panel SHALL make the root panel's `closed` emit once.

#### Scenario: Two triggers of one panel

- **WHEN** the pointer enters one trigger item and then another trigger item of the same nested panel
- **THEN** two panels are open, the root and one copy of the nested panel

#### Scenario: Panel declared inside its parent

- **WHEN** a nested panel declared inside the root panel's content is open and the pointer enters one of its items
- **THEN** the nested panel stays open

#### Scenario: Activating an item of a shared panel

- **WHEN** the user clicks an item of a nested panel shared by several triggers
- **THEN** the root panel's `closed` emits `'click'` exactly once

### Requirement: Safe area keeps a submenu open

With `safeArea` set on the panel that holds the nested triggers (`true` by default), after the pointer leaves an open nested trigger, hovering siblings inside the triangle between the leave point and the submenu MUST NOT close the submenu, and such a sibling SHALL keep its default background. Leaving the triangle before reaching the submenu SHALL close it, and reaching the submenu SHALL end the protection.

#### Scenario: Crossing a sibling

- **WHEN** the pointer leaves an open nested trigger toward its submenu and crosses the next sibling item
- **THEN** the submenu stays open and the sibling keeps its default background

#### Scenario: Leaving the triangle

- **WHEN** the pointer leaves the nested trigger and moves outside the triangle without reaching the submenu
- **THEN** the submenu closes

#### Scenario: Submenu reached

- **WHEN** the pointer reaches the submenu and later hovers a sibling item of the trigger
- **THEN** the submenu closes at once

#### Scenario: Submenu moved by a scroll

- **WHEN** the submenu moves while the pointer is on its way and the pointer reaches it at its new place
- **THEN** the protection ends and the submenu stays open

### Requirement: Safe area switching to another nested trigger

While a safe area protects a submenu, hovering another enabled nested trigger SHALL switch to that trigger's submenu after `NESTED_HOVER_SWITCH_DELAY` (50 ms), unless the pointer reaches the protected submenu first, and at once when the pointer is outside the triangle. A disabled nested trigger MUST NOT be switched to.

#### Scenario: Before the grace period

- **WHEN** the pointer has rested on another nested trigger for less than 50 ms
- **THEN** the first submenu is still open and the other is closed

#### Scenario: After the grace period

- **WHEN** the pointer rests on another nested trigger for 50 ms without reaching the first submenu
- **THEN** the first submenu is closed and the other one is open

#### Scenario: Outside the triangle

- **WHEN** the pointer hovers another nested trigger and moves outside the triangle
- **THEN** the switch happens at once

#### Scenario: Disabled nested trigger

- **WHEN** the pointer hovers a disabled nested trigger, inside or outside the triangle
- **THEN** its submenu does not open

### Requirement: Turning the safe area off

`safeArea` set to `false` on the panel that holds the nested triggers, or `safeArea: false` in `KBQ_DROPDOWN_DEFAULT_OPTIONS`, SHALL turn the protection off, so hovering a sibling item closes the open submenu at once.

#### Scenario: Safe area off

- **WHEN** `safeArea` is `false`, the pointer leaves an open nested trigger and enters the next sibling
- **THEN** the submenu closes

### Requirement: Search field

`kbqDropdownSearch` on a `kbq-form-field` in a panel SHALL make it the panel's search field: opening SHALL focus the field and highlight no item, though items that `kbqDropdownContent` renders while the field holds a query get the first highlighted; the field SHALL have no borders and be in overlay mode, keeping the application's other form-field defaults. A `kbq-form-field` without the directive SHALL get overlay mode only if it is the first in the content at content initialization.

#### Scenario: Opening a panel with a search field

- **WHEN** a panel with a search field opens
- **THEN** the field's input has focus and no item has the class `kbq-dropdown-item_active`

#### Scenario: Field appearance

- **WHEN** a panel with a search field is open
- **THEN** the form field has the classes `kbq-form-field_no-borders` and `kbq-form-field_in-overlay`

#### Scenario: Application defaults

- **WHEN** the application provides a form-field `labelClass` default
- **THEN** the search field uses it and still has no borders

#### Scenario: Lazy items and a leftover query

- **WHEN** the search field and the items are rendered by `kbqDropdownContent` and the panel opens while the field's form control holds a query
- **THEN** the first enabled item gets the class `kbq-dropdown-item_active` right after opening

#### Scenario: Plain form field rendered later

- **WHEN** a `kbq-form-field` without `kbqDropdownSearch` is rendered by `kbqDropdownContent`
- **THEN** it does not get the class `kbq-form-field_in-overlay` from the panel

### Requirement: Search field control

The search field MUST hold an `input` with `kbqInput` that is bound to a form control. A field whose control is not such an input SHALL throw "kbqDropdownSearch: must be applied to a kbq-form-field containing an input[kbqInput]." and an unbound input SHALL throw "kbqDropdownSearch: the input must be bound to a form control."

#### Scenario: Number input

- **WHEN** the search field holds an input with `kbqNumberInput`
- **THEN** the first render throws the first error

#### Scenario: No form control

- **WHEN** the search field's input has no form control
- **THEN** the first render throws the second error

### Requirement: Highlight navigation with a search field

While a panel has a search field, Up and Down Arrow SHALL move a highlight, the class `kbq-dropdown-item_active`, across the enabled items while focus stays in the field, and SHALL scroll the highlighted item into view; other keys MUST NOT scroll the list. Hovering an enabled item SHALL highlight it without taking focus from the field; hovering a disabled item MUST NOT.

#### Scenario: Arrows keep the caret

- **WHEN** the user presses Down Arrow twice and Up Arrow once in the search field
- **THEN** the first, the second and again the first item is highlighted, and the input keeps focus

#### Scenario: Revealing only on arrows

- **WHEN** the user presses Down Arrow and then types a letter
- **THEN** the list is scrolled to the highlighted item on the arrow only

#### Scenario: Hovering a disabled item

- **WHEN** the pointer enters an enabled item and then a disabled one
- **THEN** the enabled item stays highlighted

### Requirement: Enter activates the highlighted item

With a search field, Enter SHALL replay a click on the highlighted item, closing the panel as a pointer click would, and MUST NOT reach overlays opened earlier. With no item highlighted, Enter SHALL do nothing.

#### Scenario: Picking an item

- **WHEN** the first item is highlighted and the user presses Enter
- **THEN** the item's click handler runs and the panel closes

#### Scenario: Other overlays

- **WHEN** the user presses Enter on a highlighted item
- **THEN** the keydown does not reach the overlay container

### Requirement: Panel leaves filtering to the consumer

A panel SHALL not filter its items; the consumer renders the matching ones. When the rendered items change and the highlighted item is gone, the first item SHALL be highlighted if the field holds a query, and no item otherwise; Enter and the arrows SHALL then start over. A highlighted item that is still rendered SHALL stay highlighted.

#### Scenario: Highlighted item filtered out

- **WHEN** "One" is highlighted and the consumer filters the items down to "Two" and "Three"
- **THEN** "Two" is highlighted

#### Scenario: Highlighted item kept

- **WHEN** "Two" is highlighted and the consumer filters the items down to "Two" and "Three"
- **THEN** "Two" stays highlighted

#### Scenario: Query cleared

- **WHEN** the highlighted item is destroyed by filtering and the query is then cleared
- **THEN** no item is highlighted, Enter leaves the panel open, and Down Arrow highlights the first item

### Requirement: Escape with a search field

With a query in the search field, Escape SHALL reset the field's form control and keep the panel open, whether or not a cleaner is projected into the field. Escape in an empty field SHALL close the panel.

#### Scenario: Two-stage Escape

- **WHEN** the field holds a query and the user presses Escape twice
- **THEN** the first press resets the form control to `null` and the panel stays open
- **AND** the second press closes the panel

### Requirement: Keys and clicks kept in the search field

Left and Right Arrow SHALL stay with the search field while the caret can still move in that direction, and reach the panel only at the edge of the text. A click on the search field MUST NOT close the panel.

#### Scenario: Caret inside the text

- **WHEN** the caret is in the middle of the query and the user presses Left and Right Arrow
- **THEN** the panel receives neither key

#### Scenario: Caret at the start

- **WHEN** the caret is at the start of the query and the user presses Left Arrow
- **THEN** the panel receives the key

#### Scenario: Clicking the field

- **WHEN** the user clicks the search field
- **THEN** the panel stays open

### Requirement: Search field rendered later

A search field rendered by `kbqDropdownContent`, or revealed after the panel initialized, SHALL behave like one present from the start. One revealed while the panel is open SHALL take the caret at once, and the item that had focus SHALL lose its keyboard focus styling.

#### Scenario: Lazy search field

- **WHEN** the search field is part of lazy content and the user presses Down Arrow after opening
- **THEN** the input keeps focus and the first item is highlighted

#### Scenario: Revealed while open

- **WHEN** the first item has focus and the search field is then revealed
- **THEN** the input has focus and the first item no longer has `cdk-keyboard-focused`

### Requirement: Search fields of nested panels

A panel SHALL use only its own search field: a field of a nested panel declared in its content MUST NOT switch it to highlight navigation. A nested panel opened from a panel with a search field SHALL take no focus on opening, and closing it SHALL return the caret to the parent's field.

#### Scenario: Field of a nested panel

- **WHEN** a nested panel with its own search field is open and the pointer enters an item of the root panel
- **THEN** that root item has focus

#### Scenario: Caret returned

- **WHEN** a nested panel opened from a panel with a search field is closed with Escape
- **THEN** the parent's search input has focus

### Requirement: Search field API

`KbqDropdownSearch`, exported as `kbqDropdownSearch`, SHALL expose `value()`, the current query as a string, `reset()`, which resets the bound form control, `focus()`, which focuses the field, and `ngControl`.

#### Scenario: Reading and resetting the query

- **WHEN** the query is set to "t" and `reset()` is then called
- **THEN** `value()` returns "", then "t", then ""

### Requirement: Width of a panel with a form field

A top-level panel that projects a `kbq-form-field` and sizes to its content SHALL keep the width it had when it opened, so that typing or the field's cleaner does not resize it. A panel with an explicit or `'auto'` `panelWidth`, a panel without a form field, a nested panel and a panel that sets `overlapTriggerY` without `overlapTriggerX` MUST NOT be pinned.

#### Scenario: Pinned on opening

- **WHEN** a content-sized panel with a form field renders 412 px wide on opening
- **THEN** its overlay pane gets a width of 412 px

#### Scenario: Explicit width kept

- **WHEN** the panel with a form field has `panelWidth` 344
- **THEN** its overlay pane stays 344 px wide

#### Scenario: Nested panel with a search field

- **WHEN** a content-sized nested panel with a search field opens
- **THEN** its overlay pane gets no width

### Requirement: Panel anchored to an origin

`kbqDropdownTriggerOrigin` SHALL position the panel against the given element or viewport rectangle instead of the trigger, and `null` SHALL anchor it to the trigger. `updatePosition()` SHALL move an open panel to the current origin and SHALL do nothing while it is closed. A panel anchored to a rectangle MUST NOT match the trigger's width, while an explicit `panelWidth` still applies.

#### Scenario: Caret rectangle

- **WHEN** the origin is a rectangle at the caret and the panel opens
- **THEN** the panel is positioned against that rectangle

#### Scenario: Moving an open panel

- **WHEN** the origin changes while the panel is open and `updatePosition()` is called
- **THEN** the panel is positioned against the new origin

#### Scenario: Width at the caret

- **WHEN** the panel is anchored to a rectangle and the trigger element is 300 px wide
- **THEN** the overlay pane's minimum width is 200 px, not 300 px

### Requirement: Highlight navigation driven from outside

`activeDescendantNavigation` set to `true` on a panel SHALL make it move a highlight instead of DOM focus, as with a search field, so that keys handled by another element can be forwarded to the panel's `handleKeydown()`. The panel MUST NOT set `aria-activedescendant`.

#### Scenario: Forwarded arrow key

- **WHEN** `activeDescendantNavigation` is `true`, the trigger's auto focus is off and an editor forwards Down Arrow to `handleKeydown()`
- **THEN** the first item gets `kbq-dropdown-item_active` and focus stays in the editor

### Requirement: Panel position

`xPosition` (`'after'` by default, `'before'` or `'center'`) and `yPosition` (`'below'` by default, or `'above'`) SHALL place the panel relative to its trigger, and the panel SHALL have one of the classes `kbq-dropdown-after`, `kbq-dropdown-before`, `kbq-dropdown-center` and one of `kbq-dropdown-below`, `kbq-dropdown-above` for the position it was placed in. Changing an input SHALL update the classes at once; the panel moves on its next opening or `updatePosition()`.

#### Scenario: Defaults

- **WHEN** a panel with no position inputs opens
- **THEN** it has the classes `kbq-dropdown-below` and `kbq-dropdown-after`

#### Scenario: Changing the position

- **WHEN** an open panel placed `'before'` gets `xPosition` `'after'`
- **THEN** it has the class `kbq-dropdown-after` and no longer `kbq-dropdown-before`

#### Scenario: Centered

- **WHEN** `xPosition` is `'center'` and the panel opens
- **THEN** it has the class `kbq-dropdown-center` and neither `kbq-dropdown-before` nor `kbq-dropdown-after`

### Requirement: Invalid positions

An `xPosition` other than `'before'`, `'after'` and `'center'` SHALL throw "xPosition value must be either 'before', 'after', or 'center'.", and a `yPosition` other than `'above'` and `'below'` SHALL throw "yPosition value must be either 'above' or below'.". The value a panel starts with, taken from `KBQ_DROPDOWN_DEFAULT_OPTIONS`, is not checked: an invalid application default, or one that a partial options object leaves `undefined`, MUST NOT throw these errors.

#### Scenario: Invalid x position

- **WHEN** `xPosition` is bound to `'invalid'`
- **THEN** change detection throws

#### Scenario: Invalid application default

- **WHEN** `KBQ_DROPDOWN_DEFAULT_OPTIONS` provides `xPosition: 'left'` and the panel has no `xPosition` binding
- **THEN** change detection does not throw

### Requirement: Fallback positions

When the panel does not fit on its side of the trigger, it SHALL open on the opposite side, along either axis or both, and its position classes SHALL name the side it opened on.

#### Scenario: No room after the trigger

- **WHEN** the trigger touches the right edge of the viewport
- **THEN** the panel's right edge is aligned with the trigger's right edge

#### Scenario: No room below the trigger

- **WHEN** the trigger is near the bottom of the viewport
- **THEN** the panel opens above the trigger, 4 px from its top edge, and has the class `kbq-dropdown-above`

### Requirement: Overlapping the trigger

With `xPosition` `'before'` or `'after'`, `overlapTriggerX` (`true` by default) SHALL align the panel with an edge of the trigger instead of placing it beside the trigger; a panel with `xPosition: 'center'` ignores it. `overlapTriggerY` (`false` by default) SHALL let the panel cover the trigger instead of opening 4 px below it, or 4 px above it for `yPosition: 'above'`. The trigger's `offsetX` and `offsetY`, when set, SHALL replace these computed offsets.

#### Scenario: Gap below the trigger

- **WHEN** `yPosition` is `'below'` and `overlapTriggerY` is `false`
- **THEN** the panel opens 4 px below the trigger, and 4 px above it when it falls back

#### Scenario: Gap above the trigger

- **WHEN** `yPosition` is `'above'` and `overlapTriggerY` is `false`
- **THEN** the panel opens 4 px above the trigger, and 4 px below it when it falls back

#### Scenario: Covering the trigger

- **WHEN** `overlapTriggerY` is `true` and `yPosition` is `'below'`
- **THEN** the panel's top edge is aligned with the trigger's top edge

#### Scenario: Centered panel

- **WHEN** `xPosition` is `'center'`, `overlapTriggerX` is `false` and the panel fits
- **THEN** the panel's center is aligned with the trigger's center, as with `overlapTriggerX` set to `true`

### Requirement: Content-sized panel width

By default a top-level panel SHALL grow with its content, MUST NOT be narrower than its trigger or than `panelMinWidth` (200 px by default), and SHALL be capped by `panelMaxWidth` or, when that is `null`, by the `--kbq-dropdown-size-container-width-max` token (640 px by default). The trigger SHALL be measured again on every opening, and the trigger's `widthOrigin` SHALL replace it as the element measured.

#### Scenario: Wide trigger

- **WHEN** the trigger is 300 px wide and the panel opens
- **THEN** the overlay pane has a minimum width of 300 px

#### Scenario: Trigger resized between openings

- **WHEN** the trigger grows from 300 px to 500 px while the panel is closed and the panel opens again
- **THEN** the overlay pane has a minimum width of 500 px

#### Scenario: Width origin

- **WHEN** `widthOrigin` is an element 500 px wide and the trigger is 300 px wide
- **THEN** the overlay pane has a minimum width of 500 px

### Requirement: Explicit panel width

On a top-level panel, unless it sets `overlapTriggerY` without `overlapTriggerX`, `panelWidth: 'auto'` SHALL make the panel as wide as its trigger but not narrower than `panelMinWidth`; a number SHALL be the exact width in pixels, with `panelMinWidth` not applied. `panelMinWidth: null` SHALL remove the minimum, leaving the trigger width as the only floor. Other panels MUST NOT give their overlay pane the width `panelWidth` asks for.

#### Scenario: Exact width below the minimum

- **WHEN** `panelWidth` is 150
- **THEN** the overlay pane and the panel are both 150 px wide

#### Scenario: Matching the trigger

- **WHEN** `panelWidth` is `'auto'` and the trigger is narrower than the default `panelMinWidth`
- **THEN** the overlay pane is 200 px wide

#### Scenario: No minimum

- **WHEN** `panelMinWidth` is `null`
- **THEN** the panel's CSS minimum width token is `0px`

#### Scenario: Number on a nested panel

- **WHEN** a nested panel has `panelWidth` 150
- **THEN** its overlay pane gets no width and the panel sizes to its content

### Requirement: Panels not matched to the trigger

Nested panels, and top-level panels with `overlapTriggerY` set and `overlapTriggerX` not set, MUST NOT be sized against their trigger; their width SHALL follow their content, `panelMaxWidth`, the width tokens and `panelMinWidth`, a floor that an explicit `panelWidth` removes without applying a width of its own.

#### Scenario: Nested panel

- **WHEN** a nested panel opens
- **THEN** its overlay pane has no minimum width

#### Scenario: Vertical trigger

- **WHEN** a panel with `overlapTriggerY` `true` and `overlapTriggerX` `false` opens
- **THEN** its overlay pane has no minimum width

#### Scenario: Explicit width on a nested panel

- **WHEN** a nested panel has `panelWidth` 150
- **THEN** its CSS minimum width token is `0px`

### Requirement: Panel classes and host element

Classes set with `class` on `kbq-dropdown` SHALL be moved onto the panel and removed from the `kbq-dropdown` element, while classes set on it through other bindings SHALL stay. The `kbq-dropdown` element SHALL take no layout box of its own (`display: contents`), and elements marked `kbqDropdownStaticContent` SHALL render in its place, outside the panel.

#### Scenario: Transferred classes

- **WHEN** `kbq-dropdown` has `class="custom-one custom-two"` and the panel opens
- **THEN** the panel has both classes and the `kbq-dropdown` element has neither

#### Scenario: Bound class kept

- **WHEN** `kbq-dropdown` has `class="transferred"` and `[class.kept-by-binding]="true"`
- **THEN** only `kept-by-binding` stays on the `kbq-dropdown` element

### Requirement: Overlay layer

A panel whose trigger is inside an element marked `kbqOverlayLayer` SHALL render into that element's overlay layer, a nested panel SHALL render into the layer of its parent panel above it, and a panel whose trigger is outside such an element SHALL render into the application-wide overlay container.

#### Scenario: Trigger inside a layer

- **WHEN** the trigger is inside an element with `kbqOverlayLayer` and the panel opens
- **THEN** the panel's overlay is a child of that element's overlay layer

#### Scenario: Nested panel in a layer

- **WHEN** a nested panel opens from that panel
- **THEN** its overlay is in the same layer, right after its parent's

### Requirement: Layout direction

The panel's overlay SHALL take the layout direction of the trigger's `Directionality`, and nested panels SHALL take the direction of their own trigger items.

#### Scenario: Right-to-left

- **WHEN** the trigger's direction is `rtl` and the panel opens
- **THEN** the overlay's bounding box has `dir="rtl"`

#### Scenario: Direction passed down

- **WHEN** the application's direction is `rtl` and two nested levels are open
- **THEN** every panel has the `rtl` direction

### Requirement: Scrollable panel

A panel taller than its maximum height SHALL scroll with the library's custom scrollbar: the native scrollbar is hidden, the track flashes on opening and shows on hover, and pressing, clicking or dragging the scrollbar MUST NOT close the panel. A panel whose content fits, footer included, SHALL show no scrollbar.

#### Scenario: Scrollbar on opening

- **WHEN** a panel with more items than fit opens
- **THEN** the scrollbar track is shown and then fades out

#### Scenario: Dragging the thumb

- **WHEN** the user drags the scrollbar thumb and releases it over an item
- **THEN** the panel stays open

#### Scenario: Short panel

- **WHEN** a short panel with a footer opens
- **THEN** it shows no scrollbar

### Requirement: Tooltip on the trigger

When the panel opens, a tooltip on its trigger SHALL hide, and it MUST NOT reappear when the closing panel gives focus back to the trigger. It SHALL show again once the pointer leaves the trigger and enters it again.

#### Scenario: Opening hides the tooltip

- **WHEN** the trigger's tooltip is shown and the panel opens
- **THEN** the tooltip is hidden

#### Scenario: Focus returned on closing

- **WHEN** the panel is closed with Escape and focus returns to the trigger
- **THEN** the trigger's tooltip is not shown

### Requirement: Tooltip for truncated items

An item with `kbq-title` SHALL show its full text in a tooltip on hover when the text is truncated, also when the item has a secondary action or a complex layout marked with `#kbqTitleContainer` and `#kbqTitleText`, and MUST NOT show one when the text fits.

#### Scenario: Truncated text

- **WHEN** the text of an item with `kbq-title` is cut and the user hovers the item
- **THEN** a tooltip appears

#### Scenario: Text that fits

- **WHEN** the text of an item with `kbq-title` fits and the user hovers the item
- **THEN** no tooltip appears

### Requirement: Accessible semantics

Neither the panel nor its items SHALL set an ARIA role, so items keep the semantics of their host element, and a disabled item SHALL be exposed with `aria-disabled="true"`. The trigger shapes shown in the docs, an open panel, a nested panel, items with secondary actions and a panel with a search field SHALL pass the axe checks of the unit suite.

#### Scenario: Disabled item

- **WHEN** the panel holds an enabled and a disabled item
- **THEN** only the disabled one has `aria-disabled="true"`

#### Scenario: Axe on an open panel

- **WHEN** a panel is open
- **THEN** axe reports no violations in the overlay container

### Requirement: Application-wide defaults

`KBQ_DROPDOWN_DEFAULT_OPTIONS` SHALL supply the defaults of `xPosition`, `yPosition`, `overlapTriggerX`, `overlapTriggerY`, `backdropClass`, `hasBackdrop`, `safeArea`, `panelWidth`, `panelMinWidth` and `panelMaxWidth`, and an input bound on a panel SHALL win over them. Without a provider they are `'after'`, `'below'`, `true`, `false`, `cdk-overlay-transparent-backdrop`, `false`, `true`, `null`, 200 and `null`.

#### Scenario: Provided defaults

- **WHEN** the provider sets `overlapTriggerY: true`, `xPosition: 'before'` and `yPosition: 'above'`
- **THEN** a panel without those inputs reports these values

### Requirement: Rebinding the trigger

A trigger whose `kbqDropdownTriggerFor` changes to another panel SHALL open the new panel from then on and SHALL ignore `closed` from the panel it was bound to before. When a panel is bound to several triggers, destroying some of them MUST NOT break closing it.

#### Scenario: Swapping the panel

- **WHEN** the trigger opened panel "One", is closed, is bound to panel "Two" and opens again
- **THEN** the overlay shows "Two" and not "One"

#### Scenario: Former panel closes

- **WHEN** panel "Two" is open and panel "One" emits `closed`
- **THEN** panel "Two" stays open

#### Scenario: Shared panel after triggers are destroyed

- **WHEN** three triggers sharing a panel have each opened and closed it and are then destroyed
- **THEN** emitting `closed` from the panel throws nothing
