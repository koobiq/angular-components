# dropdown Specification Delta

## MODIFIED Requirements

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

### Requirement: Navigation wrap

With `navigationWithWrap` set to `true` on the panel, Down Arrow on the last enabled item SHALL focus the first one and Up Arrow on the first SHALL focus the last. The value SHALL be read when the panel builds its key manager for a navigation mode: at content initialization for the mode it starts in, and once more the first time it switches between focus and highlight navigation, as when a search field appears. Later changes MUST NOT take effect.

#### Scenario: Wrapping past the end

- **WHEN** `navigationWithWrap` is `true`, the last enabled item has focus and the user presses Down Arrow
- **THEN** the first enabled item has focus

#### Scenario: Set before a search field appears

- **WHEN** `navigationWithWrap` changes from `false` to `true` after content initialization, a search field is then revealed and the user presses Down Arrow in it while the last enabled item is highlighted
- **THEN** the first enabled item is highlighted

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

### Requirement: Invalid positions

An `xPosition` other than `'before'`, `'after'` and `'center'` SHALL throw "xPosition value must be either 'before', 'after', or 'center'.", and a `yPosition` other than `'above'` and `'below'` SHALL throw "yPosition value must be either 'above' or below'.". The value a panel starts with, taken from `KBQ_DROPDOWN_DEFAULT_OPTIONS`, is not checked: an invalid application default, or one that a partial options object leaves `undefined`, MUST NOT throw these errors.

#### Scenario: Invalid x position

- **WHEN** `xPosition` is bound to `'invalid'`
- **THEN** change detection throws

#### Scenario: Invalid application default

- **WHEN** `KBQ_DROPDOWN_DEFAULT_OPTIONS` provides `xPosition: 'left'` and the panel has no `xPosition` binding
- **THEN** change detection does not throw

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
