# toast Specification Delta

## MODIFIED Requirements

### Requirement: Line breaks in string slots

Line breaks in a string `title` or `content`, and in a string `caption` shown below a title, SHALL be kept in the rendered text, so a multi-line message grows the toast in height. A string `caption` that takes the title's place (see Caption without a title) gets no such rule, so its line breaks collapse into spaces.

#### Scenario: Multi-line content

- **WHEN** a toast is shown with a content string that contains `\n`
- **THEN** each line of the content is rendered on a line of its own

### Requirement: Closing a toast

`close()` on a toast shown by `show()` SHALL report it as read and remove it from its stack. The built-in close button and Escape SHALL close a toast this way.

#### Scenario: Closing from code

- **WHEN** the consumer calls `ref.instance.close()` on a shown toast
- **THEN** the toast leaves the stack
- **AND** `read` emits its data

### Requirement: Hiding a toast by id

`hide(id)` with an id returned by `show()` SHALL remove the toast from `toasts` at once and start its exit. An id that is not on the stack SHALL be ignored. Hiding a toast this way MUST NOT report it as read by itself, but its focus hand-off can: focus that the toast had held for more than 500 ms, moved out of it by the hand-off (see Focus hand-off on dismissal), makes `read` emit the toast's data.

#### Scenario: Hide by id

- **WHEN** the consumer calls `hide()` with the id of a shown toast
- **THEN** `toasts` is empty right after the call

### Requirement: Read notification

`read` SHALL be a `BehaviorSubject` that starts with `null` and emits a toast's data once, the first time the toast is closed, clicked anywhere, or hovered or focused for more than 500 ms and then left. Removal by the countdown MUST NOT emit. Removal by `hide()` MUST NOT emit either, except that focus its hand-off moves out of the toast counts as leaving it, so a toast that had held the focus for more than 500 ms is then reported as read.

#### Scenario: Closed toast is read

- **WHEN** the user clicks the close button of a toast
- **THEN** `read` emits that toast's data object

#### Scenario: Read only once

- **WHEN** the pointer rests on a toast for 600 ms three times and the user then closes it
- **THEN** `read` has emitted that toast's data exactly once

### Requirement: Stack position

The container SHALL carry the class `kbq-toast-container-<position>`. The stack SHALL be anchored at that position of the viewport: the `top-*` and `bottom-*` positions offset from that edge by `indent.vertical` plus the stack margin of the container's styles, the left and right ones from that side by `indent.horizontal` plus that margin, the `*-center` ones centred horizontally, and `center` centred on both axes, ignoring the indent and with no margin.

#### Scenario: Every position

- **WHEN** the configuration sets any `KbqToastPosition` and a toast is shown
- **THEN** the container has the class `kbq-toast-container-<position>`

#### Scenario: Default position

- **WHEN** a toast is shown with the default configuration
- **THEN** the container has the class `kbq-toast-container-top-right` and the stack sits in the top right corner

### Requirement: One overlay for the stack

All toasts and template toasts of a service SHALL share one overlay. It SHALL be attached on the first `show()` or `showTemplate()` and detached once nothing is on the stack and the last exit animation has ended. A stack emptied by `hideTemplate()` SHALL detach at once, unless a hidden toast is still playing its exit; it then SHALL detach when that exit ends. Repeated show and hide cycles SHALL leave at most one container.

#### Scenario: Waiting for the last exit

- **WHEN** two toasts are hidden one after the other and the first one's exit is still running when the second is gone
- **THEN** the overlay stays attached until the first exit has ended

#### Scenario: Template keeps the container

- **WHEN** a toast and a template toast are on screen and the toast is hidden
- **THEN** the container stays

#### Scenario: Show and hide cycles

- **WHEN** a toast is shown and hidden three times and then shown again
- **THEN** there is one container
