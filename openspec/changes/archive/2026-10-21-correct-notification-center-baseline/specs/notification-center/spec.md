# notification-center Specification Delta

## MODIFIED Requirements

### Requirement: Overlay pane classes

The overlay pane that holds the panel SHALL have the class `kbq-notification-center__panel`, and SHALL also have the class that `kbqNotificationCenterPanelClass` is bound to when the panel first opens. The overlay is created on that first open and reused by every later one, so a value bound afterwards does not reach the pane.

#### Scenario: Custom panel class

- **WHEN** the trigger binds `kbqNotificationCenterPanelClass` to `example-panel` and the panel then opens for the first time
- **THEN** the overlay pane has the classes `kbq-notification-center__panel` and `example-panel`

### Requirement: Side placement by default

Outside popover mode the panel SHALL open beside the trigger on its end side, in the first of these positions that fits the viewport: vertically centred on the trigger, aligned to the trigger's bottom edge, aligned to its top edge. When none fits, as with the default height of `100vh` for nearly every trigger position, the panel SHALL take the one that leaves the most of it visible and be pushed back into the viewport.

#### Scenario: Default position

- **WHEN** a panel made shorter than the viewport with `popoverHeight` opens from a trigger with room on its right and room above and below it for the centred panel
- **THEN** the panel's start edge touches the trigger's end edge and the two are vertically centred

### Requirement: Placement change output

Each time the overlay applies a position other than the one it applied last, as on every open, the trigger SHALL emit `kbqPlacementChange` with the name of the placement that position corresponds to. Re-applying the same position, as on a window resize or a scroll of the list, emits again only when the scroll visibility of the trigger or the panel has changed.

#### Scenario: Falling back to another alignment

- **WHEN** the panel cannot be centred beside the trigger and is aligned to the trigger's bottom edge instead
- **THEN** `kbqPlacementChange` emits `rightBottom`

### Requirement: Outside click closes the panel

A click on an element of the page other than the panel and the trigger SHALL close the panel. A click inside an overlay stacked above the panel that itself closes on outside clicks, such as the silent-mode menu, MUST NOT close it. An overlay that does not, such as the toast stack, gives no such protection: a click on a toast closes the panel.

#### Scenario: Click elsewhere on the page

- **WHEN** the panel is open and the user clicks an element of the page that is neither the panel nor the trigger
- **THEN** the panel closes

#### Scenario: Click in the silent-mode menu

- **WHEN** the silent-mode menu of the open panel is shown and the user clicks one of its options
- **THEN** the panel stays open

### Requirement: Bottom rows are scrolled into view

When `loadingMore()` or `loadMoreErrorMode()` turns from `false` to `true` in an open panel, the list SHALL scroll to its end. A bottom row that appears without such a change, such as the error row uncovered when `loadingMore` turns off while `loadMoreErrorMode` stays on, does not scroll the list. Turning either off MUST NOT scroll the list, and a flag already on when the panel opens MUST NOT scroll it either: the panel opens scrolled to the top.

#### Scenario: Spinner appears

- **WHEN** the panel is open and `setLoadingMore(true)` is called
- **THEN** the list scrolls to its end

#### Scenario: Error row left from before

- **WHEN** `setLoadMoreErrorMode(true)` was called before the panel opened
- **THEN** the panel opens without scrolling to the end

### Requirement: Focus after deletion

After a deletion from the panel has rendered, focus SHALL stay inside the panel: on the delete button that took the place of the focused delete button in document order, or the last delete button before it, or on the list itself when no delete button is left or focus was not on a row or group delete button when the deletion started, as with the delete-all button or with a pointer activation that does not focus the button.

#### Scenario: Deleting the last row

- **WHEN** three days hold one notification each and the user focuses the delete button of the last row and activates it
- **THEN** focus moves to the delete button of the second row, not to the first group's delete button

#### Scenario: Deleting everything

- **WHEN** the user activates the delete-all button
- **THEN** focus is on an element inside the panel

### Requirement: Popover mode

With `popoverMode` set, the panel SHALL open below the trigger, in the first of these positions that fits the viewport: centred, aligned to its start edge, aligned to its end edge, and SHALL have the class `kbq-notification-center_popover`. When none fits, the panel SHALL be pushed back into the viewport; with the default height, a trigger placed below the navbar ends up covered by it. Turning `popoverMode` off SHALL restore the placement in force before it was turned on.

#### Scenario: Turning popover mode on and off

- **WHEN** `popoverMode` is set to `true` and then to `false`
- **THEN** the trigger's `placement` is `bottom` and then `right` again

### Requirement: Test ids

The parts of the panel, namely its list container, its states and its controls, and its rows SHALL carry stable `data-testid` attributes that start with `kbq-notification-center-` or `kbq-notification-item`, so that consumer tests can locate them. The panel element itself carries none; it is located by its class `kbq-notification-center`.

#### Scenario: Panel test ids

- **WHEN** the panel is rendered
- **THEN** its parts carry `data-testid` values made of `kbq-notification-center-` and one of `container`, `group`, `empty`, `loader`, `error`, `reload-button`, `load-more`, `load-more-error`, `load-more-retry-button`, `status`, `silent-mode-toggle`, `remove-all-button`, `close-button`, `remove-group-button`, `show-notifications-button` and `do-not-disturb-button`
- **AND** a row carries `kbq-notification-item`, and its parts `kbq-notification-item-title` (a text title only), `kbq-notification-item-time`, `kbq-notification-item-time-value` and `kbq-notification-item-remove-button`

#### Scenario: Locating a row's delete button

- **WHEN** a test queries `[data-testid="kbq-notification-item-remove-button"]` in an open panel with one notification
- **THEN** it finds that row's delete button
