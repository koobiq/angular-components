# Spec Delta

## Purpose

Describes what the notification center from `@koobiq/components/notification-center` guarantees to consumers: how `kbqNotificationCenterTrigger` opens and closes the panel, how the panel groups, renders, reads, pages and deletes the notifications held by `KbqNotificationCenterService`, and how all of it is exposed to the keyboard, assistive technology and the active locale.

## ADDED Requirements

### Requirement: Click opens the panel

Clicking an element with `kbqNotificationCenterTrigger` SHALL open the notification center panel in an overlay attached to that element.

#### Scenario: Clicking a closed trigger

- **WHEN** the panel is closed and the user clicks the trigger
- **THEN** the panel opens and the trigger's `isOpen` is `true`

### Requirement: Keyboard opens the panel

While the trigger has focus, pressing Enter or Space SHALL open the panel. The panel SHALL open on the next task after the keydown, not synchronously with it.

#### Scenario: Enter on the trigger

- **WHEN** the trigger has focus and the user presses Enter
- **THEN** the panel opens once the pending task has run

### Requirement: Programmatic open and close

The trigger SHALL open the panel when its `show()` method is called and close it when its `hide()` method is called. The panel SHALL render its header as soon as it is attached.

#### Scenario: Calling show

- **WHEN** code calls `show()` on the trigger
- **THEN** an element with the class `kbq-notification-center` and its header are rendered in the overlay

#### Scenario: Calling hide

- **WHEN** the panel is open and code calls `hide()` on the trigger
- **THEN** the panel closes

### Requirement: Disabled trigger

While the trigger's `disabled` input is `true`, the panel MUST NOT open by click, keyboard or `show()`. Setting `disabled` to `true` while the panel is open SHALL close it.

#### Scenario: Opening a disabled trigger

- **WHEN** `disabled` is `true` and code calls `show()`
- **THEN** no panel is rendered

#### Scenario: Disabling an open trigger

- **WHEN** the panel is open and `disabled` becomes `true`
- **THEN** the panel closes

### Requirement: Visibility output

The trigger SHALL emit `kbqVisibleChange` with `true` once the panel has become visible and with `false` once it has been hidden, one emission per change.

#### Scenario: An open and close cycle

- **WHEN** the panel is opened and then closed
- **THEN** `kbqVisibleChange` has emitted `true` and then `false`

### Requirement: Trigger reflects the panel state

The trigger SHALL have `aria-expanded="false"` while the panel is closed and `aria-expanded="true"` while it is open. While the panel is open the trigger SHALL have an `aria-controls` equal to the panel's `id` and the classes `kbq-notification-center_open` and `kbq-active`; while it is closed it MUST have neither the attribute nor the classes.

#### Scenario: Closed trigger

- **WHEN** the panel is closed
- **THEN** the trigger has `aria-expanded="false"` and no `aria-controls`

#### Scenario: Open trigger

- **WHEN** the panel is open
- **THEN** the trigger has `aria-expanded="true"` and an `aria-controls` equal to the panel element's `id`
- **AND** the trigger has the classes `kbq-notification-center_open` and `kbq-active`

### Requirement: Overlay pane classes

The overlay pane that holds the panel SHALL have the class `kbq-notification-center__panel`, and SHALL also have the class given in `kbqNotificationCenterPanelClass` when one is bound.

#### Scenario: Custom panel class

- **WHEN** the trigger binds `kbqNotificationCenterPanelClass` to `example-panel` and the panel opens
- **THEN** the overlay pane has the classes `kbq-notification-center__panel` and `example-panel`

### Requirement: Side placement by default

Outside popover mode the panel SHALL open beside the trigger on its end side: vertically centred on the trigger, and aligned to the trigger's bottom or top edge when the centred position does not fit. The panel SHALL be pushed back into the viewport when it would overflow it.

#### Scenario: Default position

- **WHEN** the panel opens from a trigger with room on its right
- **THEN** the panel's start edge touches the trigger's end edge and the two are vertically centred

### Requirement: Placement property

The trigger's `placement` property SHALL be `right` by default. Binding `kbqNotificationCenterPlacement` SHALL set `placement` to the bound value, and binding it to `undefined` SHALL set it back to `right`.

#### Scenario: Binding undefined

- **WHEN** `kbqNotificationCenterPlacement` is bound to `left` and then to `undefined`
- **THEN** the trigger's `placement` is `left` and then `right`

### Requirement: Placement change output

Each time the overlay applies a position, the trigger SHALL emit `kbqPlacementChange` with the name of the placement that position corresponds to.

#### Scenario: Falling back to another alignment

- **WHEN** the panel cannot be centred beside the trigger and is aligned to the trigger's bottom edge instead
- **THEN** `kbqPlacementChange` emits `rightBottom`

### Requirement: Outside click closes the panel

A click on an element of the page other than the panel and the trigger SHALL close the panel. A click inside an overlay stacked above the panel, such as the silent-mode menu, MUST NOT close it.

#### Scenario: Click elsewhere on the page

- **WHEN** the panel is open and the user clicks an element of the page that is neither the panel nor the trigger
- **THEN** the panel closes

#### Scenario: Click in the silent-mode menu

- **WHEN** the silent-mode menu of the open panel is shown and the user clicks one of its options
- **THEN** the panel stays open

### Requirement: Outside scroll closes the panel

While the panel is open, a scroll of the page or of any registered scroll container outside the panel SHALL close it. Scrolling the panel's own list MUST NOT close it.

#### Scenario: Scrolling the panel's list

- **WHEN** the panel is open and its list is scrolled
- **THEN** the panel stays open

#### Scenario: Scrolling a container outside the panel

- **WHEN** the panel is open and a `cdkScrollable` container elsewhere on the page scrolls
- **THEN** the panel closes

### Requirement: Escape closes the panel

A keydown of Escape inside the panel SHALL close it and prevent the key's default action, so that a container underneath that closes on Escape stays open. An Escape whose default action a control inside the panel has already prevented, such as one that closed a tooltip, MUST NOT close the panel.

#### Scenario: Escape from a control in the panel

- **WHEN** a control inside the open panel has focus and the user presses Escape
- **THEN** the panel closes and the keydown event has `defaultPrevented` set

#### Scenario: Escape spent by a tooltip

- **WHEN** a tooltip opened by a control inside the panel is shown and the user presses Escape on that control
- **THEN** the tooltip closes and the panel stays open

### Requirement: Close button

The panel header SHALL contain a close button that closes the panel when activated.

#### Scenario: Activating the close button

- **WHEN** the panel is open and the user activates the close button in its header
- **THEN** the panel closes

### Requirement: Focus moves into the panel on open

When the panel opens, focus SHALL move to the silent-mode switch in its header, with the origin of the input that opened it: a keyboard open SHALL show the switch's keyboard focus ring (class `cdk-keyboard-focused`) and a pointer open MUST NOT.

#### Scenario: Opened from the keyboard

- **WHEN** the last user input was a key press and the panel opens
- **THEN** the silent-mode switch has focus and the class `cdk-keyboard-focused`

#### Scenario: Opened with the mouse

- **WHEN** the last user input was a mouse press and the panel opens
- **THEN** the silent-mode switch has focus without the class `cdk-keyboard-focused`

### Requirement: Focus is trapped in the panel

While the panel is open, Tab and Shift+Tab SHALL cycle focus through the controls of the panel and MUST NOT move it out of the panel.

#### Scenario: Tabbing past the last control

- **WHEN** the panel is open and the user presses Tab repeatedly
- **THEN** focus stays inside the panel

### Requirement: Focus returns to the trigger on close

Whenever the panel closes, focus SHALL move to the trigger element.

#### Scenario: Closing with Escape

- **WHEN** a control inside the open panel has focus and the user presses Escape
- **THEN** the panel closes and the trigger has focus

#### Scenario: Closing from code

- **WHEN** the panel is open and code calls `hide()`
- **THEN** the trigger has focus

### Requirement: Trigger teardown

Destroying the trigger while the panel is open SHALL remove the panel, and scroll events that arrive afterwards MUST NOT throw.

#### Scenario: Scroll after the host view is destroyed

- **WHEN** the view holding an open trigger is destroyed and the document then scrolls
- **THEN** no error is thrown

### Requirement: Panel is a labelled dialog

The panel element SHALL have `role="dialog"`, an `id`, and an `aria-labelledby` pointing at its heading, which shows the `notificationCenter.notifications` string.

#### Scenario: Opened panel

- **WHEN** the panel opens
- **THEN** it has `role="dialog"` and its `aria-labelledby` equals the `id` of a non-empty heading inside it

### Requirement: Silent-mode switch reflects the mode

The header SHALL contain a silent-mode switch whose accessible name and tooltip are `notificationCenter.doNotDisturb` while silent mode is on and `notificationCenter.showPopUpNotifications` while it is off, and whose icon is a crossed-out bell while silent mode is on and a bell otherwise.

#### Scenario: Silent mode on

- **WHEN** `setSilentMode(true)` has been called and the panel is open
- **THEN** the switch is named by `notificationCenter.doNotDisturb` and shows the crossed-out bell

### Requirement: Silent-mode menu

Activating the silent-mode switch SHALL open a menu with two options: `notificationCenter.showPopUpNotifications`, which SHALL turn silent mode off, and `notificationCenter.doNotDisturb`, which SHALL turn it on. The option matching the current mode SHALL show a mark.

#### Scenario: Turning on do-not-disturb

- **WHEN** the user activates the switch and then the `doNotDisturb` option
- **THEN** the service's `silentMode()` is `true`

### Requirement: Delete-all button visibility

The header SHALL show a delete-all button whenever the service holds at least one notification, in loading and error modes too, and MUST NOT show it while the list is empty.

#### Scenario: Notifications arrive in an open panel

- **WHEN** the panel is open with an empty list and notifications are then assigned to `items`
- **THEN** the delete-all button appears

### Requirement: Notifications are grouped by day

The panel SHALL render one group per calendar day of the notifications' `date`, as the configured `DateAdapter` parses it, with the newest day first and, within a day, the newest notification first, whatever the order of `items`. The grouping SHALL work with both the Luxon and the Moment adapter.

#### Scenario: Scrambled input

- **WHEN** `items` holds notifications of 1 and 2 October at 12:00 and 15:00 each, in scrambled order
- **THEN** the groups render as 2 October (15:00, 12:00) and then 1 October (15:00, 12:00)

#### Scenario: Same weekday, different weeks under Moment

- **WHEN** the Moment adapter is used and two notifications fall on Saturdays a week apart
- **THEN** they are rendered in two groups

### Requirement: Day headings

Each group SHALL be headed by the long date of its day in the active locale. When the locale changes at runtime, every heading SHALL be re-rendered in the new locale, including those of groups built before the change.

#### Scenario: Switching the locale

- **WHEN** the list has been rendered in `ru-RU` and the locale is switched to `en-US`
- **THEN** no group heading is left in Russian

### Requirement: Unparsable dates

A notification whose `date` the adapter cannot parse MUST NOT break the list: it SHALL be placed in a group of its own headed by the raw `date` value, that group SHALL sort after every group with a valid date, and the row SHALL show an empty time.

#### Scenario: A date in an unsupported format

- **WHEN** `items` holds a notification with the date `2025-10-01T12:00:00.000Z` and one with the date `garbage`
- **THEN** two groups render, the second headed `garbage`
- **AND** the row of the second notification shows no time

### Requirement: Stable groups and rows

Each group SHALL have an `id` derived from its day that stays the same across list updates. Rows SHALL be tracked by the notification's `id`, so that adding notifications to the list keeps the rows already rendered.

#### Scenario: Appending a notification

- **WHEN** the panel is open and a notification of the same day is pushed
- **THEN** the row element of the earlier notification is still in the DOM

### Requirement: Row content

A row SHALL render the notification's `title`, `caption` and `content`, each as text or as a template, and its `actions` template. A template SHALL receive the notification as its implicit context, never the row component.

#### Scenario: Templated title and caption

- **WHEN** a notification's `title` and `caption` are templates that read `let-item`
- **THEN** the row renders both templates with `item` bound to the notification

### Requirement: Row style and icon

A row SHALL have the class `kbq-notification-item` and the modifier `kbq-notification-item_<style>`, where `style` defaults to `contrast`. When `icon` is `true`, the default, the row SHALL render the built-in glyph of the `contrast`, `success`, `warning` or `error` style with the classes of `iconClass`; when it is a template, that template; when it is `false`, no icon container.

#### Scenario: Neither style nor icon given

- **WHEN** a notification is pushed without `style` and `icon`
- **THEN** its row has the class `kbq-notification-item_contrast` and renders the info glyph

#### Scenario: Icon turned off

- **WHEN** a notification has `icon: false`
- **THEN** its row renders no icon container

### Requirement: Row time

A row with a `title` SHALL show the time of its `date` formatted by the date adapter with the `HH:mm` pattern, or an empty time when the date cannot be parsed. A row without a `title` shows no time.

#### Scenario: Valid date

- **WHEN** a notification with a title has the date `2025-10-08T11:43:32.944Z`
- **THEN** its row shows the hours and minutes of that moment as the adapter formats `HH:mm`

### Requirement: Unread marker

Next to the time of an unread notification's title, the row SHALL show a dot and a visually hidden `notificationCenter.unread` text. Once the notification is read, the time element SHALL have the class `kbq-notification-item-time_read`, the dot SHALL be hidden and the text removed. A row without a `title` shows neither.

#### Scenario: One read, one unread

- **WHEN** the list holds an unread and a read notification
- **THEN** only the unread row's text contains `notificationCenter.unread`

### Requirement: Reading does not reflow the row

Marking a notification as read MUST NOT change the width of its title or the height of its row; the time SHALL move into the place the dot leaves.

#### Scenario: Clicking the title

- **WHEN** the user clicks the title of an unread notification
- **THEN** the title keeps its width, the row keeps its height and the time shifts towards the end edge

### Requirement: Delete controls revealed on hover or focus

The delete button of a row and the delete button of a group heading SHALL be shown while the pointer is over, or focus is within, that row or heading, and hidden otherwise, but SHALL stay in the tab order and enabled at all times. The time of a row SHALL be hidden while its delete button is shown.

#### Scenario: Tabbing through the panel

- **WHEN** the panel is open with notifications and the user presses Tab repeatedly
- **THEN** a group delete button receives focus

### Requirement: Reading a notification in the panel

A notification SHALL be marked as read when the user clicks anywhere in its row, or when both the pointer and keyboard focus have left the row after dwelling on it for more than 500 ms. Marking it SHALL set its `read` to `true` and emit it once through `onRead`; later clicks and dwells MUST NOT emit again.

#### Scenario: Keyboard dwell

- **WHEN** focus enters an unread row and leaves it 600 ms later
- **THEN** the notification's `read` is `true` and the row shows it as read

#### Scenario: Repeated clicks

- **WHEN** the user clicks an unread row three times
- **THEN** `onRead` has emitted that notification exactly once

### Requirement: Reading a toast marks the notification read

When the toast of an unread notification in the list is read, the service SHALL set that notification's `read` to `true`, emit it through `onRead`, and an open panel SHALL show its row as read.

#### Scenario: Toast read while the panel is open

- **WHEN** the panel shows three unread notifications and the toast of the second is read
- **THEN** only the second row is shown as read and `onRead` emits that notification

### Requirement: Read state written by the consumer

When a consumer sets `read` to `true` on a notification object and assigns the list to `items` again, an open panel SHALL show that notification as read.

#### Scenario: Handing the list back

- **WHEN** the consumer sets `read = true` on the second of three notifications and assigns `items = [...items]`
- **THEN** only the second row is shown as read

### Requirement: Read events replay

`onRead` SHALL replay its latest value to a new subscriber: `null` before any notification has been read, and the last notification read afterwards.

#### Scenario: Subscribing late

- **WHEN** a notification has been read and code then subscribes to `onRead`
- **THEN** the subscriber immediately receives that notification

### Requirement: Unread counter

`unreadItemsCounter` of the service, also exposed by the trigger, SHALL be one signal holding the number of notifications whose `read` is `false` as text: an empty string when there are none, the exact number up to `maxUnreadItemsLength` (99), and `99+` above it. It SHALL update when a notification is read through its row or its toast, although the list itself does not change.

#### Scenario: Boundary values

- **WHEN** 99 and then 100 notifications are unread
- **THEN** the counter is `99` and then `99+`

#### Scenario: Nothing unread

- **WHEN** every notification is read
- **THEN** the counter is an empty string

#### Scenario: Toast read

- **WHEN** two notifications are unread and the toast of one of them is read
- **THEN** the counter changes from `2` to `1`

### Requirement: Empty state

When the list is empty and neither the loading mode, the error mode, the bottom spinner nor the bottom error row is on, the panel SHALL show an empty state with a bell icon and the `notificationCenter.noNotifications` string instead of the list.

#### Scenario: Opening an empty center

- **WHEN** the service holds no notifications and the panel opens
- **THEN** the empty state shows `notificationCenter.noNotifications` and no row is rendered

### Requirement: Loading mode

While `setLoadingMode(true)` is in effect and the error mode is off, the panel SHALL replace the list, the empty state and the bottom rows with a full-size loader.

#### Scenario: Loading over an existing list

- **WHEN** the list holds notifications and `setLoadingMode(true)` is called
- **THEN** the loader is shown and no row is rendered

### Requirement: Error mode

While `setErrorMode(true)` is in effect, the panel SHALL replace the list area, the loader and the bottom rows included, with the `notificationCenter.failedToLoadNotifications` string and a button labelled `notificationCenter.repeat`. Activating the button SHALL emit `onReload`; the panel MUST NOT leave error mode by itself.

#### Scenario: Reloading

- **WHEN** the error state is shown and the user activates its button
- **THEN** `onReload` emits and `errorMode()` is still `true`

### Requirement: Next page at the bottom of the list

The service SHALL emit `onNextPage` when the user scrolls the list to within `scrolledToBottomOffset` pixels (default 0) of its end, with a 2 px tolerance for fractional zoom. A list that is not laid out yet MUST NOT count as scrolled to the end.

#### Scenario: Within the offset

- **WHEN** `scrolledToBottomOffset` is 100 and the list is scrolled to 50 px from its end
- **THEN** `onNextPage` emits

#### Scenario: Outside the offset

- **WHEN** `scrolledToBottomOffset` is 0 and the list is scrolled to 5 px from its end
- **THEN** `onNextPage` does not emit

### Requirement: Page requests are suppressed

`onNextPage` MUST NOT be emitted by scrolling or re-measuring while `hasMore()` is `false`, while `loadingMore()` is `true`, or while `loadMoreErrorMode()` is `true`. `hasMore()` SHALL be `true` until `setHasMore(false)` is called.

#### Scenario: Nothing more to load

- **WHEN** `setHasMore(false)` has been called and the user scrolls to the end of the list
- **THEN** `onNextPage` does not emit

#### Scenario: Load in flight

- **WHEN** `setLoadingMore(true)` is in effect and the user scrolls to the end of the list
- **THEN** `onNextPage` does not emit

### Requirement: List is re-measured without scrolling

The open panel SHALL check whether its list is at the end once after opening and again after every state change of the service, and SHALL emit `onNextPage` under the same conditions as for a scroll. A list too short to scroll SHALL count as being at its end.

#### Scenario: First page shorter than the panel

- **WHEN** the panel opens with a list that does not fill it and `hasMore()` is `true`
- **THEN** `onNextPage` emits without any scroll

#### Scenario: Loaded page still leaves the list at the end

- **WHEN** the list is at its end and `setLoadingMore(true)` and then `setLoadingMore(false)` are called
- **THEN** `onNextPage` emits again

### Requirement: Bottom loading row

While `loadingMore()` is `true`, the panel SHALL render a row with a spinner below the list, keep the list rendered, and not show the empty state. When both `loadingMore()` and `loadMoreErrorMode()` are `true`, only the spinner row SHALL be rendered.

#### Scenario: Both flags set

- **WHEN** `setLoadingMore(true)` and `setLoadMoreErrorMode(true)` are both in effect
- **THEN** the spinner row is rendered and the bottom error row is not

### Requirement: Bottom error row and retry

While `loadMoreErrorMode()` is `true` and `loadingMore()` is `false`, the panel SHALL render a row with the `notificationCenter.failedToLoadNotifications` string and a button labelled `notificationCenter.repeat` below the list. Activating the button SHALL move focus to the list, turn `loadMoreErrorMode` off and emit `onNextPage`.

#### Scenario: Retrying

- **WHEN** the bottom error row is shown and the user activates its button
- **THEN** `onNextPage` emits and `loadMoreErrorMode()` is `false`

### Requirement: Bottom rows are scrolled into view

When the bottom spinner row or the bottom error row appears in an open panel, the list SHALL scroll to its end. Removing a row MUST NOT scroll the list, and a row already shown when the panel opens MUST NOT scroll it either: the panel opens scrolled to the top.

#### Scenario: Spinner appears

- **WHEN** the panel is open and `setLoadingMore(true)` is called
- **THEN** the list scrolls to its end

#### Scenario: Error row left from before

- **WHEN** `setLoadMoreErrorMode(true)` was called before the panel opened
- **THEN** the panel opens without scrolling to the end

### Requirement: List scrolling motion

Programmatic scrolling of the list SHALL be smooth by default and instant when animations are disabled through `KBQ_ANIMATIONS_CONFIG`, the noop animations module or reduced motion; the list SHALL then have the class `kbq-animations-disabled`.

#### Scenario: Animations disabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` sets `animationsDisabled: true` and the panel opens
- **THEN** the list has the class `kbq-animations-disabled`

### Requirement: Removing one notification

`remove(item)` SHALL remove the notification that is that same object, hide its toast and emit `onDelete` with `{ type: 'item', items: [item] }`. When the object is not in the list it MUST do nothing and emit nothing, even if an equal object is.

#### Scenario: Equal but not identical

- **WHEN** `remove()` is called with a copy of a notification in the list
- **THEN** the list is unchanged and `onDelete` does not emit

### Requirement: Removing a day group

`removeGroup(group)` SHALL remove the notifications of the group that are still in the list, hide their toasts and emit `onDelete` with `type: 'group'` and only those notifications. When none of them is in the list it MUST do nothing and emit nothing.

#### Scenario: Stale group

- **WHEN** `removeGroup()` is called with a group holding one notification still in the list and one already gone
- **THEN** `onDelete` emits `type: 'group'` with only the first notification

### Requirement: Removing all notifications

`removeAll()` SHALL empty the list, hide the toasts of every notification and emit `onDelete` with `type: 'all'` and the notifications that were in the list. On an empty list it MUST do nothing and emit nothing.

#### Scenario: Clearing the list

- **WHEN** the list holds two notifications and `removeAll()` is called
- **THEN** `isEmpty` is `true` and `onDelete` emits `type: 'all'` with both

### Requirement: Deleting from the panel

The delete button of a row SHALL remove that notification, the delete button of a group heading SHALL remove that day group, and the delete-all button SHALL remove every notification, with the same effects and `onDelete` events as `remove()`, `removeGroup()` and `removeAll()`.

#### Scenario: Row delete button

- **WHEN** the user activates the delete button of the only row
- **THEN** the list is empty

### Requirement: Focus after deletion

After a deletion from the panel has rendered, focus SHALL stay inside the panel: on the delete button that took the activated one's place in document order, or the last delete button before it, or on the list itself when no delete button is left or the deletion started from the delete-all button.

#### Scenario: Deleting the last row

- **WHEN** three days hold one notification each and the user activates the delete button of the last row
- **THEN** focus moves to the delete button of the second row, not to the first group's delete button

#### Scenario: Deleting everything

- **WHEN** the user activates the delete-all button
- **THEN** focus is on an element inside the panel

### Requirement: Popover mode

With `popoverMode` set, the panel SHALL open below the trigger, centred or aligned to its start or end edge, and SHALL have the class `kbq-notification-center_popover`. Turning `popoverMode` off SHALL restore the placement in force before it was turned on.

#### Scenario: Turning popover mode on and off

- **WHEN** `popoverMode` is set to `true` and then to `false`
- **THEN** the trigger's `placement` is `bottom` and then `right` again

### Requirement: Panel height

`popoverHeight` SHALL set the panel height through the `--kbq-notification-center-popover-height` custom property of the panel, also on a panel that is already open; an empty or `undefined` value SHALL remove it. Without it the panel SHALL be the full viewport height, or the viewport height minus the navbar height in popover mode.

#### Scenario: Changing the height of an open panel

- **WHEN** the panel is open and `popoverHeight` is set to `500px` and then to an empty string
- **THEN** the panel's `--kbq-notification-center-popover-height` is `500px` and then unset

### Requirement: Stick to window

With `stickToWindow` set to `top`, `right`, `bottom` or `left`, the open panel SHALL be pinned to that edge of the window, or to that edge of the `container` element when one is bound, and SHALL stay pinned after window resizes and scrolls of its list. Binding `stickToWindow` to `undefined` SHALL stop the pinning; binding `container` to `undefined` SHALL pin to the window.

#### Scenario: Pinned to the right edge of the window

- **WHEN** `stickToWindow` is `right` and the window is resized while the panel is open
- **THEN** the overlay pane keeps `right: 0` and `left: unset`

#### Scenario: Pinned to a container

- **WHEN** `stickToWindow` is `right`, `container` is an element whose right edge is at 800 px, and the panel is 400 px wide
- **THEN** after a window resize the overlay pane has `left: 400px` and `right: unset`

### Requirement: Shared service instance

The trigger and the panel it opens SHALL use the same `KbqNotificationCenterService` instance, the one resolved from the trigger's position in the injector tree: the root instance unless an ancestor provides its own.

#### Scenario: Root service

- **WHEN** no component provides `KbqNotificationCenterService` and code assigns `items` on the root instance
- **THEN** the opened panel renders those notifications

### Requirement: Date adapter is required

`KbqNotificationCenterService` SHALL inject a `DateAdapter` and a `DateFormatter` from the injector it is created in; without them its creation fails with an injection error.

#### Scenario: Adapter and formatter at the root

- **WHEN** `KbqLuxonDateModule` and `KbqFormattersModule` are provided at the application root
- **THEN** the service groups and labels the notifications by their dates

### Requirement: Assigning the list

Assigning `items` SHALL replace the list and write onto each given object an `id` when it has none or shares one with an earlier object of the same assignment, and `read: false` when `read` is unset. Ids SHALL be unique within the list, and objects handed back SHALL keep their ids. `isEmpty` SHALL report an empty list.

#### Scenario: Colliding ids

- **WHEN** `items` is assigned two objects that both have the id `n1`
- **THEN** the two notifications in the list have different ids

#### Scenario: Read default

- **WHEN** `items` is assigned one object without `read` and one with `read: true`
- **THEN** their `read` values are `false` and `true`

### Requirement: The list is a snapshot in reactive contexts

Reading `items` or `isEmpty`, and calling a command of the service, from an `effect()` MUST NOT make that effect depend on the list or on the state the open panel reads, so an effect can read and reassign `items` without re-running on its own write.

#### Scenario: Effect rewriting the list

- **WHEN** an effect reads `items` and assigns a mapped copy back
- **THEN** the effect runs again only when another signal it reads changes

### Requirement: Pushing a notification

`push(item)` SHALL append the notification, assign it an `id` when it has none or its `id` is already used, set `read: false` when unset, and, unless silent mode is on, show it as a toast and store the toast's id in `toastId`. Pushing an object already in the list MUST do nothing. Silent mode is off by default.

#### Scenario: Pushing twice

- **WHEN** the same notification object is pushed twice
- **THEN** the list holds it once and one toast was shown

#### Scenario: Id already taken

- **WHEN** a notification with the id `n1` is in the list and a different object with the id `n1` is pushed
- **THEN** both are in the list with different ids

#### Scenario: Pushing in silent mode

- **WHEN** silent mode is on and a notification is pushed
- **THEN** the list holds it and no toast is shown

### Requirement: Hiding a notification's toast

`hideToast(item)` SHALL hide the toast whose id is the notification's `toastId` and clear `toastId`. When `toastId` is not set it MUST do nothing.

#### Scenario: Hiding a shown toast

- **WHEN** a notification has `toastId` 42 and `hideToast()` is called with it
- **THEN** toast 42 is hidden and the notification's `toastId` is `undefined`

### Requirement: State setters and the change stream

`setLoadingMode`, `setErrorMode`, `setLoadingMore`, `setLoadMoreErrorMode`, `setHasMore` and `setSilentMode` SHALL update the matching signal, and every setter call, list update and read SHALL emit on `changes`. `changes` SHALL carry no value and MUST NOT emit on subscription.

#### Scenario: Two setter calls

- **WHEN** code subscribes to `changes` and then calls `setLoadingMore(true)` and `setLoadMoreErrorMode(true)`
- **THEN** `changes` has emitted twice and not on subscription

### Requirement: Status announcements

The panel SHALL contain one persistent `role="status"` region with `aria-live="polite"` whose text names the state shown: `failedToLoadNotifications` in error mode, otherwise `loadingMore` while loading or loading more, otherwise `failedToLoadNotifications` with the bottom error row, otherwise `noNotifications` when the list is empty, and no text otherwise.

#### Scenario: Loading more after an empty list

- **WHEN** the open panel is empty and `setLoadingMore(true)` is called
- **THEN** the same region changes its text from `noNotifications` to `loadingMore`

#### Scenario: Full-size loader

- **WHEN** `setLoadingMode(true)` is called on an empty list
- **THEN** the region reads `loadingMore`, not `noNotifications`

### Requirement: Named controls

Every button in the panel SHALL have an accessible name: the close button `a11y.close`, the delete-all button `a11y.removeAll`, the delete buttons of rows and group headings `notificationCenter.remove`, the silent-mode switch its current mode label, and the text buttons their text. The delete-all button's tooltip SHALL show `notificationCenter.removeAll`.

#### Scenario: Panel with notifications

- **WHEN** the panel is open with a notification
- **THEN** every button in it has a non-empty `aria-label` or text

#### Scenario: Delete-all tooltip

- **WHEN** the panel is open with notifications and the locale is `ru-RU`
- **THEN** the delete-all button's tooltip content is the `ru-RU` `notificationCenter.removeAll` string

### Requirement: No axe violations

The open panel SHALL pass the axe-core checks that run without rendering, both with notifications and in the empty state.

#### Scenario: Empty panel

- **WHEN** the panel is open with no notifications
- **THEN** axe reports no violations in the overlay container

### Requirement: Localized strings

The strings the panel renders — the `notificationCenter` section (`notifications`, `remove`, `removeAll`, `doNotDisturb`, `showPopUpNotifications`, `noNotifications`, `failedToLoadNotifications`, `repeat`, `loadingMore`, `unread`) and `a11y.close` and `a11y.removeAll` — SHALL follow the active locale, `ru-RU` by default, and a runtime locale switch SHALL relabel rows already rendered.

#### Scenario: Switching the locale at runtime

- **WHEN** the panel shows a row and the locale is switched from `ru-RU` to `en-US`
- **THEN** the row's delete button is named by the `en-US` `notificationCenter.remove` string

### Requirement: Overriding strings

`kbqNotificationCenterLocaleConfigurationProvider()` SHALL override the strings it is given, and the strings it leaves out SHALL keep following the active locale. A `kbqLocaleOverrides` binding on an ancestor of the trigger SHALL override the panel's strings in the same way.

#### Scenario: Partial override

- **WHEN** the provider is given only `notifications: 'Custom'`
- **THEN** the heading reads `Custom` and the empty state still shows the `ru-RU` `noNotifications` string

### Requirement: Standalone and module use

`KbqNotificationCenterTrigger` SHALL work when imported on its own as a standalone directive, and `KbqNotificationCenterModule` SHALL export both the trigger and the panel component.

#### Scenario: Standalone import

- **WHEN** a standalone component imports only `KbqNotificationCenterTrigger` and calls `show()`
- **THEN** the panel opens without an error

### Requirement: Panel rendered in place

A `kbq-notification-center` element placed directly in a template SHALL render the header, the list and the states of the service in place, without a trigger or an overlay.

#### Scenario: In-place error state

- **WHEN** `<kbq-notification-center>` is placed in a template and `setErrorMode(true)` is called
- **THEN** the error state and its reload button are visible and no row is rendered

### Requirement: Test ids

The panel, its states, its controls and its rows SHALL carry stable `data-testid` attributes that start with `kbq-notification-center-` or `kbq-notification-item`, so that consumer tests can locate them.

#### Scenario: Panel test ids

- **WHEN** the panel is rendered
- **THEN** its parts carry `data-testid` values made of `kbq-notification-center-` and one of `container`, `group`, `empty`, `loader`, `error`, `reload-button`, `load-more`, `load-more-error`, `load-more-retry-button`, `status`, `silent-mode-toggle`, `remove-all-button`, `close-button`, `remove-group-button`, `show-notifications-button` and `do-not-disturb-button`
- **AND** a row carries `kbq-notification-item`, and its parts `kbq-notification-item-title` (a text title only), `kbq-notification-item-time`, `kbq-notification-item-time-value` and `kbq-notification-item-remove-button`

#### Scenario: Locating a row's delete button

- **WHEN** a test queries `[data-testid="kbq-notification-item-remove-button"]` in an open panel with one notification
- **THEN** it finds that row's delete button
