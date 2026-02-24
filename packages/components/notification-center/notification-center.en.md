Notification center — a panel for application notifications.

<!-- example(notification-center-overview) -->

The notification list opens from the main menu. The menu shows an unread message counter: it is hidden when the count is 0, and displays "99+" when the count exceeds 99.

New notifications appear in the list and are grouped by date, with the newest at the top. Each item has a title and timestamp; optionally it may include a caption and actions. A delete button appears on hover or focus. Messages can be cleared per day or all at once.

Unread messages are marked with a blue dot. On hover or interaction with an item (link, button, delete), the message is automatically marked as read.

### Empty state

In the empty state, a "No notifications" message is displayed and the "Delete all" button is hidden.

<!-- example(notification-center-empty) -->

### Error

The panel supports scrolling with a sticky header and lazy loading of records. In the empty state, a "No notifications" message is displayed and the "Delete all" button is hidden.

<!-- example(notification-center-error) -->

### Dropdown window

The notification center can be opened in a popover. For example, when placed in a horizontal menu.

<!-- example(notification-center-popover) -->
