# Spec Delta

## MODIFIED Requirements

### Requirement: Plain click toggles without autoSelect

When `autoSelect` is off, a click on an enabled option SHALL toggle that option, then emit `selectionChange` with the clicked option and report the value. In a multiple mode the other options SHALL stay as they are; in single selection, selecting the clicked option SHALL deselect the option selected before it.

#### Scenario: Two clicks in checkbox mode

- **WHEN** the user clicks an unselected option of a `multiple="checkbox"` list and then clicks it again
- **THEN** the option is selected after the first click and deselected after the second
- **AND** other selected options stay selected

#### Scenario: Click in single selection without autoSelect

- **WHEN** one option is selected in a single-selection list with `[autoSelect]="false"` and the user clicks another option
- **THEN** only the clicked option is selected

### Requirement: Shift click selects a range

In a multiple-selection list, a click with `Shift` held SHALL apply the selected state of the anchor to every enabled option from it to the clicked one. The anchor is the option active before the list last moved the active option itself, as on a keyboard move or when focus leaves the list, or the option the last range selection ended on; pointer focus never sets it. Without an anchor the selection MUST NOT change. With `noUnselectLast` on, the range MUST NOT deselect the last selected option.

#### Scenario: Range after keyboard navigation

- **WHEN** the second option is selected and active, the keyboard moves the active option to the fourth one, and the user Shift-clicks the fourth option
- **THEN** the second, third and fourth options are selected

#### Scenario: Shift-click before any keyboard move

- **WHEN** the user Shift-clicks an option before the keyboard has moved the active option and before focus has ever left the list
- **THEN** no option becomes selected

#### Scenario: Shift-click after focus left the list

- **WHEN** the user clicks the first option of a `multiple="checkbox"` list, moves focus out of the list and then Shift-clicks the third option
- **THEN** the first three options are selected

### Requirement: Angular forms integration

The list SHALL work as a form control with `formControl`, `formControlName` and `ngModel`. It SHALL mark the control touched when focus leaves the list, but not while focus enters it or moves between its options. Every value the list reports SHALL mark the control dirty: the user's changes, `selectAll()`, `deselectAll()` and a narrowing of the mode that drops selected options. A value written by the form and any other selection made in code MUST NOT mark it dirty.

#### Scenario: Focus moves between options

- **WHEN** focus enters the list and moves to another option with the arrow keys
- **THEN** the control is still untouched

#### Scenario: Focus leaves the list

- **WHEN** focus moves from an option to a button outside the list
- **THEN** the control is touched

#### Scenario: User changes the value

- **WHEN** the model was set in code and the user then clicks an option
- **THEN** the control becomes dirty

#### Scenario: selectAll called in code

- **WHEN** the model was set in code and code then calls `selectAll()`
- **THEN** the control becomes dirty

### Requirement: Selecting everything in code

In a multiple-selection list `selectAll()` SHALL select every rendered option; in single selection each option replaces the previous one, so only the last rendered option stays selected. `deselectAll()` SHALL deselect every rendered option. Both act on disabled options too and SHALL report the new value to the form control. Neither MUST emit `selectionChange` or `onSelectAll`.

#### Scenario: selectAll with a disabled option

- **WHEN** a multiple-selection list has a disabled option and code calls `selectAll()`
- **THEN** every option, the disabled one included, is selected

#### Scenario: selectAll in single selection

- **WHEN** code calls `selectAll()` on a single-selection list of three options
- **THEN** only the third option is selected

### Requirement: Select-all row rendering

With the `selectAll` attribute in checkbox mode, the list SHALL render a "select all" row above its options. The row MUST NOT be rendered in single selection, in keyboard mode, in a horizontal list, while the list has no options, or inside a `cdk-virtual-scroll-viewport`. When `selectAll` and the viewport are both present at the list's first render, a development-mode console warning SHALL explain that `selectAll` is not supported there; either one appearing later MUST NOT warn.

#### Scenario: Checkbox mode

- **WHEN** a `multiple="checkbox"` list with `selectAll` has options
- **THEN** the row is rendered before the first option

#### Scenario: First option arrives

- **WHEN** the list had no options and the first option is added
- **THEN** the row appears

#### Scenario: Virtual scroll

- **WHEN** a list with `selectAll` holds a `cdk-virtual-scroll-viewport` from its first render
- **THEN** the row is not rendered and the console warns that `selectAll` is not supported there

### Requirement: Action button visibility

The `kbq-option-action` of an option SHALL be hidden until the option is hovered or is focused while the list is keyboard-focused. An option focused by the mouse MUST NOT keep its action shown once the pointer leaves it, while a hovered option and the keyboard-focused option SHALL each show their own action. While the action holds focus or its dropdown is open, the option SHALL get the `kbq-action-button-focused` class and the action SHALL stay visible.

#### Scenario: Hover

- **WHEN** the pointer hovers an option and then leaves it
- **THEN** its action is shown and then hidden again

#### Scenario: Mouse focus

- **WHEN** the user clicks an option and moves the pointer away
- **THEN** the option keeps `kbq-focused` and its action is hidden

#### Scenario: Hover next to keyboard focus

- **WHEN** an option has keyboard focus and the pointer hovers another option
- **THEN** both options show their action

### Requirement: Single tab stop

The list SHALL be one tab stop: `tabindex="0"` while it has options and `-1` while it has none or is disabled. A bound `tabIndex` SHALL replace that default while the list is enabled, and binding it back to `null` or `undefined` SHALL restore the default. `Tab` SHALL take the list out of the tab order until the next task, also when focus stays inside the list, so `Shift`+`Tab` from an option leaves the list.

#### Scenario: Last option removed

- **WHEN** every option of the list is removed
- **THEN** the list has `tabindex="-1"`

#### Scenario: Tab out with a bound tab index

- **WHEN** the list binds `tabIndex` 3 and the user presses `Tab`
- **THEN** the list has `tabindex="-1"` until the next task and `tabindex="3"` afterwards

### Requirement: Focus on entering the list

When the list itself receives focus, it SHALL move focus to the first selected option in option order or, when nothing is selected, to the first enabled item of the list, which is the select-all row when it is rendered. When that first selected option is disabled, or the selection holds only options that are not rendered, focus SHALL stay on the list.

#### Scenario: A selected option

- **WHEN** the second option is selected and focus enters the list
- **THEN** the second option is focused and has the `kbq-focused` class

#### Scenario: Nothing selected

- **WHEN** nothing is selected and focus enters the list
- **THEN** the first enabled option is focused

#### Scenario: Disabled selected option

- **WHEN** the only selected option is disabled and focus enters the list
- **THEN** focus stays on the list and no option is focused

### Requirement: Keyboard navigation

In a vertical list `Down` and `Up` SHALL move the active option to the next or previous enabled option without wrapping; in a horizontal list `Right` and `Left` SHALL do so instead. `Home` and `End` SHALL move it to the first and last enabled one. The list SHALL prevent the default action of the arrow keys, `Home`, `End`, `PageUp`, `PageDown`, `Space` and `Enter`. The active option SHALL hold DOM focus.

#### Scenario: Home skips a disabled first option

- **WHEN** the first option is disabled and the user presses `Home`
- **THEN** the second option becomes active and the key's default action is prevented

#### Scenario: End

- **WHEN** the user presses `End`
- **THEN** the last enabled option becomes active

### Requirement: Page navigation

`PageDown` and `PageUp` SHALL move the active option by a page, or to the last or first enabled option when the page runs past the end. A page that lands on a disabled option SHALL go on by whole pages to an enabled one and MUST NOT move at all once that runs past the end. The page size SHALL be the list height divided by the first option's height, rounded down, measured again after the window is resized; while the list is not laid out the page size SHALL stay unchanged.

#### Scenario: Page size from layout

- **WHEN** the list is 100 px high and its first option 30 px
- **THEN** one page is three options

#### Scenario: Disabled option a page away

- **WHEN** the fifth of ten options is active, a page is three options, the eighth option is disabled and the user presses `PageDown`
- **THEN** the active option does not move

### Requirement: Shift and an arrow select a range

In a multiple-selection list, `Shift` with an arrow key that moves the active option along the list's orientation SHALL move it and apply the selected state of the previously active option to every enabled option between the two. When `noUnselectLast` is on, the range MUST NOT deselect the last selected option.

#### Scenario: Extending a selection

- **WHEN** the first option is selected and active and the user presses `Shift`+`Down` twice
- **THEN** the first three options are selected

#### Scenario: Shrinking a selection

- **WHEN** the first three options are selected, the third is active and deselected with `Space`, and the user presses `Shift`+`Up`
- **THEN** only the first option stays selected

### Requirement: Custom select-all handler

In a multiple-selection list, a function bound to `selectAllHandler` SHALL be called with the keyboard event and the list on `Ctrl`/`Cmd`+`A` instead of the built-in behaviour; in single selection it MUST NOT be called. The select-all row keeps the built-in toggle. Binding a value that is neither a function nor `undefined` SHALL throw "`selectAllHandler` must be a function.".

#### Scenario: Custom handler

- **WHEN** `selectAllHandler` is bound and the user presses `Ctrl`+`A`
- **THEN** the handler is called once and no option is selected

#### Scenario: Invalid handler

- **WHEN** `selectAllHandler` is bound to a string
- **THEN** change detection throws that error

#### Scenario: Handler in single selection

- **WHEN** `selectAllHandler` is bound on a single-selection list and the user presses `Ctrl`+`A`
- **THEN** the handler is not called

### Requirement: Drop indicator

While an option is dragged over its own list or a draggable list that its own list names in `connectedTo` as an instance, that list SHALL render a decorative `aria-hidden` drop indicator at the gap before the first option, the dragged one aside, whose middle lies past the pointer along the list's orientation. The indicator MUST NOT be shown over the place the option already occupies, and SHALL disappear on drop. A list connected only by `id` MUST NOT show it.

#### Scenario: Pointer above every option

- **WHEN** the second option is dragged above the middle of the first option
- **THEN** the indicator sits at the start of the list

#### Scenario: Over its own place

- **WHEN** the dragged option is moved back over its own row
- **THEN** no indicator is shown

### Requirement: Drop forbidden feedback

While the pointer is over neither the option's own list nor a draggable list that its own list names in `connectedTo` as an instance, the option SHALL carry the `kbq-list-option_drop-forbidden` class and the cursor SHALL be `no-drop`, also over a list connected only by `id`, which still takes the drop. Back over its own list or such a connected list the class SHALL be removed and the cursor SHALL be `grabbing`.

#### Scenario: Pointer leaves every list

- **WHEN** the user drags an option to the bottom right corner of the page, outside both lists
- **THEN** the page cursor is `no-drop`

#### Scenario: Pointer over a list connected by id

- **WHEN** an option is dragged over a list that its own list names in `connectedTo` only by `id`
- **THEN** the option carries `kbq-list-option_drop-forbidden` and the page cursor is `no-drop`

### Requirement: Drag cursor

A draggable option SHALL keep its usual pointer cursor by default (`dragCursor="auto"`). With `dragCursor="grab"`, every option that can be picked up SHALL get the `kbq-list-option_grab-cursor` class and, unless it holds a `cdkDragHandle`, the grab cursor on the whole row. While a drag lasts, the cursor SHALL be `grabbing`, except where the drop forbidden feedback makes it `no-drop`.

#### Scenario: Grab requested

- **WHEN** `dragCursor="grab"` is set and one option has `draggable="false"`
- **THEN** every other option has `kbq-list-option_grab-cursor` and that option does not

#### Scenario: Grab requested with a handle

- **WHEN** `dragCursor="grab"` is set and an option holds a `cdkDragHandle`
- **THEN** the option has `kbq-list-option_grab-cursor`, its handle shows the grab cursor and the rest of the row keeps the pointer cursor
