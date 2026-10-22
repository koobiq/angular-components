# Spec Delta

## Purpose

Describes what `@koobiq/components/list` guarantees to consumers: how `kbq-list-selection` and its `kbq-list-option` items are selected with a pointer, the keyboard or assistive technology, how the selection reaches Angular forms, how options are reordered by dragging, and what the plain `kbq-list` container does.

## ADDED Requirements

### Requirement: Plain click replaces the selection

When `autoSelect` is on, a click on an enabled option SHALL make it the only selected option, deselecting every other one. The click SHALL then emit `selectionChange` with the clicked option and report the value to the bound form control, also when the selection did not change.

#### Scenario: Click in single selection

- **WHEN** one option is selected in a single-selection list and the user clicks another option
- **THEN** only the clicked option is selected
- **AND** `selectionChange` fires once with the clicked option

#### Scenario: Click in keyboard mode

- **WHEN** three options are selected in a `multiple="keyboard"` list and the user clicks a fourth one
- **THEN** only the fourth option is selected

### Requirement: Plain click toggles without autoSelect

When `autoSelect` is off, a click on an enabled option SHALL toggle that option and leave the other options as they are, then emit `selectionChange` with the clicked option and report the value.

#### Scenario: Two clicks in checkbox mode

- **WHEN** the user clicks an unselected option of a `multiple="checkbox"` list and then clicks it again
- **THEN** the option is selected after the first click and deselected after the second
- **AND** other selected options stay selected

### Requirement: Ctrl or Cmd click toggles one option

A click with `Ctrl` or `Cmd` held SHALL toggle the clicked option in every mode. When `noUnselectLast` is on and the clicked option is the only selected one, the click MUST be ignored and MUST NOT emit `selectionChange`.

#### Scenario: Ctrl-click on the only selected option

- **WHEN** `noUnselectLast` is on, one option is selected and the user Ctrl-clicks it
- **THEN** the option stays selected and no `selectionChange` fires

#### Scenario: Ctrl-click adds to the selection

- **WHEN** one option is selected in a `multiple="keyboard"` list and the user Ctrl-clicks another option
- **THEN** both options are selected

### Requirement: Shift click selects a range

In a multiple-selection list, a click with `Shift` held SHALL apply the selected state of the anchor — the option that was active before the last keyboard move or the last range selection — to every enabled option from the anchor to the clicked option. Without such an anchor the selection MUST NOT change.

#### Scenario: Range after keyboard navigation

- **WHEN** the second option is selected and active, the keyboard moves the active option to the fourth one, and the user Shift-clicks the fourth option
- **THEN** the second, third and fourth options are selected

#### Scenario: Shift-click before any keyboard move

- **WHEN** the user Shift-clicks an option before the keyboard has moved the active option
- **THEN** no option becomes selected

### Requirement: Disabled options cannot be selected by the user

A disabled option MUST NOT be selected or deselected by a click, `Space` or `Enter`, and arrow navigation SHALL skip it.

#### Scenario: Clicking a disabled option

- **WHEN** the user clicks a disabled option
- **THEN** the selection does not change

#### Scenario: Space on a disabled option made active in code

- **WHEN** a disabled option is the active option and the user presses `Space` or `Enter`
- **THEN** the option stays unselected

### Requirement: autoSelect and noUnselectLast follow the mode

`autoSelect` and `noUnselectLast` SHALL default to `true` in single selection and in `keyboard` mode, and to `false` in `checkbox` mode. A value the consumer binds SHALL pin that flag: a later change of `multiple` MUST NOT change it, while a flag left unbound SHALL be derived again from the new mode.

#### Scenario: Defaults per mode

- **WHEN** a list switches from `multiple="checkbox"` to `multiple="keyboard"`
- **THEN** `autoSelect` and `noUnselectLast` change from `false` to `true`

#### Scenario: Pinned autoSelect

- **WHEN** a list binds `autoSelect="true"` and its mode changes to `checkbox` and back to single selection
- **THEN** `autoSelect` stays `true` throughout

### Requirement: Selection modes

The `multiple` input SHALL select the mode: `checkbox`, a bare `multiple`, `"true"` and `true` mean checkbox mode; `keyboard` means keyboard mode; an absent attribute, `"false"`, `false`, `null` and `undefined` mean single selection. Any other value SHALL fall back to single selection and, in development mode, log a console warning that names the value and the supported modes.

#### Scenario: Bare attribute

- **WHEN** a list is declared with a bare `multiple` attribute
- **THEN** it is in checkbox mode and `multiple` reports `true`

#### Scenario: Unsupported value

- **WHEN** `multiple="single"` is set in development mode
- **THEN** the list uses single selection and the console warns about the value

### Requirement: Checkboxes in options

In checkbox mode every option SHALL render a pseudo-checkbox that is checked while the option is selected; in single selection and keyboard mode no pseudo-checkbox SHALL be rendered. An option's `showCheckbox` input SHALL override this per option, and a `kbq-pseudo-checkbox` projected into an option SHALL replace the built-in one.

#### Scenario: Switching to checkbox mode

- **WHEN** a single-selection list with three options switches to `multiple="checkbox"`
- **THEN** each of the three options renders a pseudo-checkbox

#### Scenario: Back to single selection

- **WHEN** the same list switches back to single selection
- **THEN** no option renders a pseudo-checkbox

### Requirement: Narrowing the mode keeps the first selection

When `multiple` changes to single selection while several options are selected, the list SHALL keep the first selected option in option order, deselect the others, emit `selectionChange` once for each deselected option, and report the shortened value to the form control exactly once.

#### Scenario: Three selected options

- **WHEN** three options are selected in checkbox mode and `multiple` is set to `false`
- **THEN** only the first option is selected and the bound model holds only its value
- **AND** `selectionChange` fires for the second and third option

### Requirement: Widening the mode keeps the selection

When `multiple` changes from single selection to a multiple mode, the selected option SHALL stay selected and later selections SHALL add to it instead of replacing it.

#### Scenario: Switching to checkbox mode

- **WHEN** the second option is selected in single selection and `multiple` changes to `checkbox`
- **THEN** the second option is still selected and the list holds multiple selections

### Requirement: Value is an array of option values

The value the list reports to a form control or `ngModel` SHALL be an array of the values of the selected rendered options, in option order, in every mode; in single selection it holds at most one value. The values SHALL be the options' own `value` inputs, whatever form the written model used.

#### Scenario: Single selection

- **WHEN** the user clicks an option with value `'opt1'` in a single-selection list bound with `ngModel`
- **THEN** the model becomes `['opt1']`

#### Scenario: Order of values

- **WHEN** the options `opt1` to `opt4` exist and the user selects `opt4` and then `opt1`
- **THEN** the reported value is `['opt1', 'opt4']`

### Requirement: Writing a value selects matching options

A value written by a form control or `ngModel` SHALL select each option that matches one of its entries and deselect the rest, without emitting `selectionChange` and without reporting a value back. A single non-array value SHALL be treated as a one-entry array; `null` and `undefined` SHALL clear the selection. In single selection only the last matching option in option order SHALL stay selected.

#### Scenario: Setting the form value

- **WHEN** the form control value is set to `['opt2', 'opt3']`
- **THEN** those two options are selected and the control stays pristine

#### Scenario: Resetting to null

- **WHEN** the form control value is set to `null`
- **THEN** no option is selected

#### Scenario: Several values in single selection

- **WHEN** a single-selection list receives `['a', 'b']`
- **THEN** only the option `b` is selected

### Requirement: Value applied to options that arrive later

A value written before its options exist, or whose matching option is added later, SHALL be applied once the options are rendered.

#### Scenario: Value set before the first render

- **WHEN** the form control already holds `['opt2', 'opt3']` when the list renders for the first time
- **THEN** the options `opt2` and `opt3` are selected

### Requirement: Removing a selected option

When a selected option is removed from the list, it SHALL lose its selection while the value held by the form model stays unchanged until the user changes the selection.

#### Scenario: Selected option removed

- **WHEN** the model holds `['opt3']` and the option `opt3` is removed
- **THEN** the model still holds `['opt3']` and no remaining option is selected

### Requirement: Selection changed in code is silent

Selecting or deselecting an option in code — through its `selected` input or property, `toggle()` or `setSelected()` — SHALL update the option's selected state and MUST NOT emit `selectionChange` or report a value to the form control.

#### Scenario: Toggling an option in code

- **WHEN** code calls `toggle()` on an option of a list bound with `ngModel`
- **THEN** the option is selected
- **AND** no `selectionChange` fires and the model is unchanged

#### Scenario: Initial selected input

- **WHEN** an option is declared with `[selected]="true"` in a list without a form control
- **THEN** the option is selected after the first render

### Requirement: Matching values with compareWith

The list SHALL match each written value against option values with `compareWith(optionValue, modelValue)`, which defaults to strict equality, and select the first option that matches each value. `null` and `undefined` values SHALL be passed to the comparator like any other value.

#### Scenario: Object values matched by id

- **WHEN** options carry objects, `compareWith` compares their `id`, and the form writes a different object with `id` 2
- **THEN** the option whose value has `id` 2 is selected

#### Scenario: Model holds ids, options hold objects

- **WHEN** `compareWith(option, id)` compares `option.id` with `id` and the form writes `[2]`
- **THEN** the option whose value has `id` 2 is selected

### Requirement: Invalid and failing comparators

Binding `compareWith` to a value that is not a function SHALL throw "`compareWith` must be a function.". A comparator that throws for a pair SHALL count as no match for that pair, SHALL NOT stop the other options from matching, and in development mode the error SHALL be reported with `console.warn`.

#### Scenario: Non-function comparator

- **WHEN** `compareWith` is bound to `null`
- **THEN** change detection throws that error

#### Scenario: Comparator fails for one option

- **WHEN** the comparator throws for an option without a value
- **THEN** the other options are still matched and the error is logged as a warning

### Requirement: Changing the comparator re-matches the value

Binding a different `compareWith` SHALL match the current value again: options the new comparator matches SHALL become selected and options it does not match SHALL be deselected once a form control has written a value.

#### Scenario: From reference to id comparison

- **WHEN** the comparator compares by reference, matches nothing, and is replaced by one that compares by `id`
- **THEN** the option with the matching `id` becomes selected

### Requirement: Replacing option values keeps the selection

When the value of a selected option is replaced by a new value that the comparator still matches against the value the list holds, the option SHALL stay selected without being deselected in between. When the new value no longer matches that value, the option SHALL be deselected.

#### Scenario: Immutable refetch

- **WHEN** an option with value `{ id: 2 }` is selected and the data is replaced by equal new objects tracked by `id`
- **THEN** the option stays selected throughout

### Requirement: Angular forms integration

The list SHALL work as a form control with `formControl`, `formControlName` and `ngModel`. It SHALL mark the control touched when focus leaves the list, but not while focus enters it or moves between its options, and only changes made by the user SHALL mark the control dirty.

#### Scenario: Focus moves between options

- **WHEN** focus enters the list and moves to another option with the arrow keys
- **THEN** the control is still untouched

#### Scenario: Focus leaves the list

- **WHEN** focus moves from an option to a button outside the list
- **THEN** the control is touched

#### Scenario: User changes the value

- **WHEN** the model was set in code and the user then clicks an option
- **THEN** the control becomes dirty

### Requirement: Selecting everything in code

`selectAll()` SHALL select every rendered option and `deselectAll()` SHALL deselect every rendered option, disabled options included, and both SHALL report the new value to the form control. Neither MUST emit `selectionChange` or `onSelectAll`.

#### Scenario: selectAll with a disabled option

- **WHEN** a list has a disabled option and code calls `selectAll()`
- **THEN** every option, the disabled one included, is selected

### Requirement: Disabled list

The list SHALL be disabled by its `disabled` input or by a disabled form control, and whichever of the two changed last SHALL win. A disabled list SHALL get the `kbq-disabled` class, `aria-disabled="true"` and `tabindex="-1"`, and SHALL make every option disabled without overwriting the options' own `disabled` inputs.

#### Scenario: Disabling through the form control

- **WHEN** the bound form control is disabled
- **THEN** the list has `aria-disabled="true"` and `tabindex="-1"` and every option is disabled

#### Scenario: Re-enabling keeps option inputs

- **WHEN** a list with one option declared `[disabled]="true"` is disabled and enabled again through its form control
- **THEN** that option is still disabled and the others are enabled

#### Scenario: Binding changed after the control

- **WHEN** the control was enabled and then the `disabled` input is set to `true`
- **THEN** the list is disabled

### Requirement: Disabled option state

An option SHALL be disabled when its own `disabled` input is set, when its enclosing `kbq-optgroup` is disabled, or when the list is disabled. A disabled option SHALL get the `kbq-disabled` class and `aria-disabled="true"`, SHALL have no `tabindex` attribute, and MUST NOT be draggable; an enabled option SHALL have `tabindex="-1"`.

#### Scenario: Group disabled

- **WHEN** the group around an option in a draggable list is disabled
- **THEN** the option has `kbq-disabled`, `aria-disabled="true"`, no `tabindex` and is not draggable

#### Scenario: Group enabled again

- **WHEN** the group is enabled again
- **THEN** the option has `tabindex="-1"`, no `aria-disabled` and is draggable again

### Requirement: Select-all row rendering

With the `selectAll` attribute in checkbox mode, the list SHALL render a "select all" row above its options. The row MUST NOT be rendered in single selection, in keyboard mode, in a horizontal list, while the list has no options, or inside a `cdk-virtual-scroll-viewport`, where a development-mode console warning SHALL explain that `selectAll` is not supported.

#### Scenario: Checkbox mode

- **WHEN** a `multiple="checkbox"` list with `selectAll` has options
- **THEN** the row is rendered before the first option

#### Scenario: First option arrives

- **WHEN** the list had no options and the first option is added
- **THEN** the row appears

#### Scenario: Virtual scroll

- **WHEN** a list with `selectAll` holds a `cdk-virtual-scroll-viewport`
- **THEN** the row is not rendered and the console warns that `selectAll` is not supported there

### Requirement: Select-all row label

The row SHALL be labelled with `select.selectAll` of the active locale — "Выбрать все" in the default `ru-RU` locale — and a `KBQ_SELECT_LOCALE_CONFIGURATION` override, for example from `kbqSelectLocaleConfigurationProvider`, SHALL replace it.

#### Scenario: Default locale

- **WHEN** a list with the row renders without locale configuration
- **THEN** the row reads "Выбрать все"

#### Scenario: Provider override

- **WHEN** `kbqSelectLocaleConfigurationProvider({ selectAll: 'Everything' })` is provided
- **THEN** the row reads "Everything"

### Requirement: Select-all row state

The row SHALL be unchecked when no enabled option is selected or there is no enabled option, indeterminate when some are, and checked when all enabled options are selected; disabled options MUST NOT count. It SHALL expose that state as `aria-checked` `false`, `mixed` or `true`, and `allOptionsSelected` SHALL be `true` only when at least one enabled option exists and all are selected.

#### Scenario: Partial selection

- **WHEN** one of several enabled options is selected
- **THEN** the row is indeterminate and has `aria-checked="mixed"`

#### Scenario: Every option disabled

- **WHEN** every option is disabled
- **THEN** the row is unchecked and `allOptionsSelected` is `false`

#### Scenario: An option becomes disabled

- **WHEN** every enabled option is selected and one of them becomes disabled
- **THEN** the row stays checked

### Requirement: Select-all row action

Activating the row by click, `Space` or `Enter` SHALL select every enabled option unless all are selected, in which case it SHALL deselect them; disabled options MUST NOT change. Each activation SHALL report the value once, even when nothing changed, then emit `onSelectAll` with a new array of the enabled options, and MUST NOT emit `selectionChange`. In a disabled list it SHALL do nothing.

#### Scenario: Click from the indeterminate state

- **WHEN** some options are selected and the user clicks the row
- **THEN** every enabled option is selected and the value is reported once

#### Scenario: Second click

- **WHEN** the user clicks the row twice
- **THEN** every option is deselected

#### Scenario: Disabled list

- **WHEN** the list is disabled and the user clicks the row
- **THEN** no option changes and `onSelectAll` does not fire

### Requirement: Select-all row in keyboard navigation

The row SHALL be the first item of keyboard navigation, so `Home`, and focus entering the list while nothing is selected, land on it. Moving onto the row MUST NOT change the selection, even with `autoSelect` on. The row MUST NOT take part in typeahead, copying or dragging.

#### Scenario: Home lands on the row

- **WHEN** the user presses `Home` in a list with the row
- **THEN** the row is the active item and no option changes

#### Scenario: Down from the row

- **WHEN** the row is active and the user presses `Down` and then `Space`
- **THEN** the first option becomes active and is selected

#### Scenario: Copy on the row

- **WHEN** the row is active and the user presses `Ctrl`+`C`
- **THEN** `onCopy` does not fire

### Requirement: Option groups

A `kbq-optgroup` inside the list SHALL be exposed as a `group` named by its label. Disabling the group SHALL disable its options, which keyboard navigation then skips.

#### Scenario: Grouped list

- **WHEN** a `multiple="checkbox"` list renders options inside a labelled `kbq-optgroup`
- **THEN** the markup passes the axe checks

### Requirement: Horizontal list

With `horizontal` set, the list SHALL get the `kbq-list-selection_horizontal` class and `aria-orientation="horizontal"`, `Right` SHALL move the active option to the next one and `Left` to the previous one, and the page size for `PageUp` and `PageDown` MUST NOT be measured.

#### Scenario: Arrow navigation

- **WHEN** the first option of a horizontal list is active and the user presses `Right` and then `Left`
- **THEN** the second option and then the first option becomes active

### Requirement: Option content

An option SHALL place a projected `[kbq-icon]` before its text, its remaining content and a `[kbq-list-option-caption]` element inside its text container, and a projected `kbq-option-action` after the text. The caption directive SHALL add the `kbq-list-option-caption` class.

#### Scenario: Option with a caption

- **WHEN** an option holds the text "Captioned" and a `kbq-list-option-caption` span "Caption text"
- **THEN** the caption is rendered inside the option's text container with the `kbq-list-option-caption` class

### Requirement: Action button visibility

The `kbq-option-action` of an option SHALL be hidden until the option is hovered or is focused while the list is keyboard-focused, and only one option's action SHALL be shown at a time. While the action holds focus or its dropdown is open, the option SHALL get the `kbq-action-button-focused` class and the action SHALL stay visible.

#### Scenario: Hover

- **WHEN** the pointer hovers an option and then leaves it
- **THEN** its action is shown and then hidden again

#### Scenario: Mouse focus

- **WHEN** the user clicks an option and moves the pointer away
- **THEN** the option keeps `kbq-focused` and its action is hidden

### Requirement: Moving focus to the action button

`Tab` on a focused option SHALL move focus to its action button and prevent the default action when the button takes focus; when it cannot take focus, `Tab` SHALL keep its default action. `Shift`+`Tab` on the action SHALL return focus to its option. When the action's dropdown closes, focus SHALL return to the action without showing the action's tooltip.

#### Scenario: Opening the dropdown from the keyboard

- **WHEN** the user tabs into the list, presses `Tab` again and then `Enter`
- **THEN** the action takes focus and its dropdown opens

#### Scenario: Action that cannot take focus

- **WHEN** the action of the focused option is hidden and the user presses `Tab`
- **THEN** the key keeps its default action and the option does not get `kbq-action-button-focused`

### Requirement: Single tab stop

The list SHALL be one tab stop: `tabindex="0"` while it has options and `-1` while it has none or is disabled. A bound `tabIndex` SHALL replace that default while the list is enabled, and binding it back to `null` or `undefined` SHALL restore the default. `Tab` SHALL take the list out of the tab order until focus has left it, so `Shift`+`Tab` from an option leaves the list.

#### Scenario: Last option removed

- **WHEN** every option of the list is removed
- **THEN** the list has `tabindex="-1"`

#### Scenario: Tab out with a bound tab index

- **WHEN** the list binds `tabIndex` 3 and the user presses `Tab`
- **THEN** the list has `tabindex="-1"` until the next task and `tabindex="3"` afterwards

### Requirement: Focus on entering the list

When the list itself receives focus, it SHALL move focus to the first selected option in option order or, when nothing is selected, to the first enabled item of the list, which is the select-all row when it is rendered.

#### Scenario: A selected option

- **WHEN** the second option is selected and focus enters the list
- **THEN** the second option is focused and has the `kbq-focused` class

#### Scenario: Nothing selected

- **WHEN** nothing is selected and focus enters the list
- **THEN** the first enabled option is focused

### Requirement: Focus indication

A focused option SHALL get the `kbq-focused` class, which SHALL be removed once focus leaves it, and focus on an element nested in an option SHALL stay there. While an option has keyboard focus, the list SHALL get the `cdk-keyboard-focused` class; focus by mouse MUST NOT add it.

#### Scenario: Keyboard focus

- **WHEN** an option is focused with the keyboard
- **THEN** the option has `kbq-focused` and the list has `cdk-keyboard-focused`

#### Scenario: Nested input

- **WHEN** the user focuses an input nested in a focused option
- **THEN** the input keeps the focus

### Requirement: Keyboard navigation

`Down` and `Up` SHALL move the active option to the next or previous enabled option without wrapping, and `Home` and `End` to the first and last enabled one. The list SHALL prevent the default action of the arrow keys, `Home`, `End`, `PageUp`, `PageDown`, `Space` and `Enter`. The active option SHALL hold DOM focus.

#### Scenario: Home skips a disabled first option

- **WHEN** the first option is disabled and the user presses `Home`
- **THEN** the second option becomes active and the key's default action is prevented

#### Scenario: End

- **WHEN** the user presses `End`
- **THEN** the last enabled option becomes active

### Requirement: Page navigation

`PageDown` and `PageUp` SHALL move the active option by a page, stopping at the last or first enabled option. The page size SHALL be the list height divided by the height of the first option, rounded down, and SHALL be measured again after the window is resized; while the list is not laid out the page size SHALL stay unchanged.

#### Scenario: Page size from layout

- **WHEN** the list is 100 px high and its first option 30 px
- **THEN** one page is three options

### Requirement: Arrow navigation selects with autoSelect

When `autoSelect` is on, moving the active option with an arrow key, `Home`, `End`, `PageUp` or `PageDown` without modifiers SHALL make the new active option the only selected one and emit `selectionChange`. When `autoSelect` is off, navigation alone MUST NOT change the selection.

#### Scenario: Single selection

- **WHEN** the first option of a single-selection horizontal list is active and the user presses `Right`
- **THEN** the second option becomes active and the only selected option

#### Scenario: Checkbox mode

- **WHEN** the user moves through a `multiple="checkbox"` list with the arrow keys
- **THEN** no option is selected or deselected

### Requirement: Shift and an arrow select a range

In a multiple-selection list, `Shift` with an arrow key SHALL move the active option and apply the selected state of the previously active option to every enabled option between the two. When `noUnselectLast` is on, the range MUST NOT deselect the last selected option.

#### Scenario: Extending a selection

- **WHEN** the first option is selected and active and the user presses `Shift`+`Down` twice
- **THEN** the first three options are selected

#### Scenario: Shrinking a selection

- **WHEN** the first three options are selected, the third is active and deselected with `Space`, and the user presses `Shift`+`Up`
- **THEN** only the first option stays selected

### Requirement: Space and Enter toggle the active option

`Space` and `Enter` SHALL toggle the active enabled option, emit `selectionChange` and report the value. When `noUnselectLast` is on and the active option is the only selected one, the keys MUST NOT deselect it.

#### Scenario: Toggling in checkbox mode

- **WHEN** the user selects three options with `Space` and `Enter` and then presses `Enter` on one of them again
- **THEN** the model holds two values

### Requirement: Typeahead

Characters typed in quick succession SHALL make active the next enabled option, searching from the option after the active one and wrapping around, whose trimmed text, caption included, starts with them, ignoring case. Typeahead SHALL only move focus and MUST NOT change the selection.

#### Scenario: Jumping by first letter

- **WHEN** the options are "Inbox" (disabled), "Starred", "Sent Mail" and "Drafts" and the user types `s`
- **THEN** "Starred" becomes active after a short pause
- **AND** typing `d` then makes "Drafts" active

### Requirement: Active option follows focus and removal

Focusing an option by pointer or in code SHALL make it the active option for keyboard navigation. When the focused option is removed, the next option SHALL become active and focused, or the previous one when the removed option was the last.

#### Scenario: Focused option removed from the middle

- **WHEN** the first option is focused and removed
- **THEN** the option that followed it becomes active at the same index

#### Scenario: Focused option removed from the end

- **WHEN** the last option is focused and removed
- **THEN** the option before it becomes active and focused

### Requirement: Select everything from the keyboard

In a multiple-selection list, `Ctrl`+`A` or `Cmd`+`A` SHALL select every enabled option, report the value and emit `onSelectAll` with those options, without `selectionChange`. A repeated press SHALL keep them selected unless `selectAllToggle` is set or the select-all row is rendered, in which case it SHALL deselect them. In single selection the shortcut MUST NOT select options.

#### Scenario: Default one-way shortcut

- **WHEN** the user presses `Ctrl`+`A` twice in a keyboard-mode list
- **THEN** every enabled option is selected and the disabled one is not

#### Scenario: With selectAllToggle

- **WHEN** `selectAllToggle` is set and the user presses `Ctrl`+`A` twice
- **THEN** every enabled option is deselected after the second press

#### Scenario: Single selection

- **WHEN** a single-selection list receives `Ctrl`+`A`
- **THEN** no option is selected

### Requirement: Custom select-all handler

A function bound to `selectAllHandler` SHALL be called with the keyboard event and the list on `Ctrl`/`Cmd`+`A` instead of the built-in behaviour; the select-all row keeps the built-in toggle. Binding a value that is neither a function nor `undefined` SHALL throw "`selectAllHandler` must be a function.".

#### Scenario: Custom handler

- **WHEN** `selectAllHandler` is bound and the user presses `Ctrl`+`A`
- **THEN** the handler is called once and no option is selected

#### Scenario: Invalid handler

- **WHEN** `selectAllHandler` is bound to a string
- **THEN** change detection throws that error

### Requirement: Copying the active option

`Ctrl`+`C` or `Cmd`+`C` SHALL copy `String(value)` of the active option to the clipboard and prevent the key's default action, without moving focus away from the option. With no active option nothing SHALL be copied.

#### Scenario: Default copy

- **WHEN** the third option is active and the user presses `Ctrl`+`C`
- **THEN** the clipboard receives that option's value and the option keeps focus

### Requirement: Custom copy through onCopy

When `onCopy` has a subscriber, `Ctrl`/`Cmd`+`C` SHALL emit a `KbqListCopyEvent` carrying the list, the active option and the keyboard event instead of writing to the clipboard, and MUST NOT prevent the key's default action.

#### Scenario: Handler attached

- **WHEN** a template binds `(onCopy)` and the user presses `Ctrl`+`C` on the first option
- **THEN** the handler receives the first option and the original event, and the clipboard is not written

### Requirement: Drag and drop is opt-in

Options SHALL be draggable only when the list's `draggable` input is set and the list is enabled. A draggable list SHALL get the `kbq-list-selection_draggable` class and each draggable option the `kbq-list-option_draggable` class; setting `draggable` back to `false` or disabling the list SHALL turn dragging off.

#### Scenario: Default

- **WHEN** a list is rendered without `draggable`
- **THEN** neither the list nor its options have the draggable classes and no option can be picked up

#### Scenario: Disabled list

- **WHEN** a draggable list is disabled
- **THEN** no option can be dragged

### Requirement: Options that cannot be dragged

An option with `draggable="false"`, or a disabled option, MUST NOT be picked up while the rest of the list stays draggable. An option with `draggable="false"` SHALL keep taking focus and selection.

#### Scenario: Pinned option

- **WHEN** one option of a draggable list has `draggable="false"` and the user clicks it
- **THEN** it cannot be dragged but becomes selected

### Requirement: The list reports moves without reordering

The list MUST NOT reorder its options or change the selection on a drop. It SHALL emit `dropped` with the moved `option`, `previousIndex`, `currentIndex`, `container`, `previousContainer` and the pointer `event`, where `currentIndex` is the gap marked by the drop indicator, or `previousIndex` when no gap was marked.

#### Scenario: Drop past the third option

- **WHEN** the first of four options is dragged past the middle of the third option and dropped
- **THEN** `dropped` reports `previousIndex` 0 and `currentIndex` 2

#### Scenario: Drop outside every list

- **WHEN** an option is dropped while the pointer never entered a list
- **THEN** `currentIndex` equals `previousIndex` and the order is unchanged

### Requirement: Drop indicator

While an option is dragged over a list that would take it, that list SHALL render a decorative `aria-hidden` drop indicator at the gap before the first option whose middle lies below the pointer. The indicator MUST NOT be shown over the place the option already occupies, and SHALL disappear on drop.

#### Scenario: Pointer above every option

- **WHEN** the second option is dragged above the middle of the first option
- **THEN** the indicator sits at the start of the list

#### Scenario: Over its own place

- **WHEN** the dragged option is moved back over its own row
- **THEN** no indicator is shown

### Requirement: Layout stays still while dragging

During a drag the other options MUST NOT move to open a gap, the dragged option SHALL stay in its place as a faded placeholder, and the options SHALL stop reacting to hover. A drag that ends over an option MUST NOT select it.

#### Scenario: Dragging within one list

- **WHEN** the user drags the first option over the third one without releasing it
- **THEN** every option keeps its position and the first option is shown as a placeholder

#### Scenario: Drop ends over an option

- **WHEN** the user drags an option and releases it over another option
- **THEN** no option is selected

### Requirement: Drop forbidden feedback

While the pointer is over no list that would take the dragged option, the option SHALL carry the `kbq-list-option_drop-forbidden` class and the cursor SHALL be `no-drop`; back over such a list the class SHALL be removed and the cursor SHALL be `grabbing`.

#### Scenario: Pointer leaves every list

- **WHEN** the user drags an option to the bottom right corner of the page, outside both lists
- **THEN** the page cursor is `no-drop`

### Requirement: Drag preview

By default the floating preview SHALL be a plate showing only the option's label and, on a line of its own, its caption, both cut with an ellipsis at the plate's maximum width. With `dragPreview="full"` the preview SHALL be a copy of the whole row, checkbox, icons and action button included.

#### Scenario: Default text preview

- **WHEN** an option with an icon, a checkbox and an action is picked up
- **THEN** the preview shows only the option's text, without the checkbox, icon or action

#### Scenario: Full preview

- **WHEN** a list with `dragPreview="full"` has an option picked up
- **THEN** the preview is as wide as the row and contains its pseudo-checkbox

### Requirement: Drag cursor

A draggable option SHALL keep its usual pointer cursor by default (`dragCursor="auto"`). With `dragCursor="grab"`, every option that can be picked up SHALL get the `kbq-list-option_grab-cursor` class and the grab cursor. While a drag lasts, the cursor SHALL be `grabbing`.

#### Scenario: Grab requested

- **WHEN** `dragCursor="grab"` is set and one option has `draggable="false"`
- **THEN** every other option has `kbq-list-option_grab-cursor` and that option does not

### Requirement: Drag handles

When an option holds an element with `cdkDragHandle`, only that element SHALL start a drag and SHALL show the grab cursor, while the rest of the row keeps its own cursor. A touch drag SHALL start at once from a handle and only after a 300 ms press from a row without one.

#### Scenario: Drag from the row

- **WHEN** the user presses the label of an option that has a handle and moves the pointer
- **THEN** no drag starts and the order is unchanged

#### Scenario: Drag from the handle

- **WHEN** the user drags the first option by its handle past the third option
- **THEN** the option moves to the end once the consumer applies `dropped`

### Requirement: Connected lists

Options SHALL be movable into the lists named in `connectedTo`, given as list instances or as `id`s; an `id` set on the list SHALL stay on its host. The drop indicator SHALL follow the pointer into a list connected by instance, but never into one connected only by `id`. A moved option SHALL arrive unselected unless the target's value already contains it.

#### Scenario: Hovering the connected list

- **WHEN** an option of the first list is dragged over the second list connected by instance
- **THEN** the indicator is shown only in the second list

#### Scenario: Connecting by id

- **WHEN** a list with `id="source-list"` sets `connectedTo` to `'target-list'`
- **THEN** both lists keep their ids and the source list is connected to the target list

### Requirement: Drag across groups

Option indices in `dropped` SHALL count the options of the whole list across `kbq-optgroup` boundaries, so an option can be moved into or out of a group.

#### Scenario: Moving into a group

- **WHEN** the first of seven options, the third to fifth of which are in a group, is dropped past the middle of the fourth
- **THEN** after the consumer applies the move, the option sits between the fourth and fifth options

### Requirement: Dragging inside a virtual scroll

A draggable list inside a `cdk-virtual-scroll-viewport` SHALL log one development-mode console warning that dragging is not supported there, also when `draggable` is turned on after the first render. A draggable list without a viewport MUST NOT warn.

#### Scenario: Turning dragging on later

- **WHEN** `draggable` is set to `true` on a list holding a viewport, turned off and on again
- **THEN** the console warns exactly once

### Requirement: Active option after a move

Once the consumer has applied a move, the moved option SHALL become the active option of the list it landed in, so a following `Shift` range starts from it.

#### Scenario: Range anchor follows the option

- **WHEN** the first option is active, is dragged to the end and the consumer applies the move
- **THEN** the moved option is the active one and the range anchor points at it

### Requirement: Listbox semantics

`kbq-list-selection` SHALL have `role="listbox"`, `aria-multiselectable` `true` or `false` following the mode, `aria-orientation="horizontal"` only when horizontal, and `aria-disabled="true"` only when disabled. It MUST NOT provide an accessible name of its own; the consumer names it with `aria-label` or `aria-labelledby`.

#### Scenario: Single selection

- **WHEN** a single-selection vertical list renders
- **THEN** it has `role="listbox"`, `aria-multiselectable="false"` and no `aria-orientation`

#### Scenario: Mode change

- **WHEN** the mode changes from checkbox to single selection
- **THEN** `aria-multiselectable` changes from `true` to `false`

### Requirement: Option semantics

Every option SHALL have `role="option"` and an explicit `aria-selected` of `true` or `false`, and a disabled option SHALL use `aria-disabled="true"` rather than the `disabled` attribute. The built-in pseudo-checkbox SHALL be hidden from assistive technology. The select-all row SHALL carry `aria-checked` and no `aria-selected`.

#### Scenario: Selecting an option

- **WHEN** the second of three options is selected
- **THEN** the options have `aria-selected` `false`, `true` and `false`

#### Scenario: Axe checks

- **WHEN** single, multiple, grouped, disabled, draggable and select-all lists are rendered with a name
- **THEN** none of them has an axe violation

### Requirement: Option state classes

An option SHALL have the `kbq-selected` class while selected and the `kbq-list-option_multiple` class while the list is in a multiple mode.

#### Scenario: Selected option

- **WHEN** an option is toggled on in code
- **THEN** it has the `kbq-selected` class

### Requirement: Plain list container

`kbq-list` and `kbq-list-item` (also `a[kbq-list-item]`) SHALL render their content without any ARIA role and without selection behaviour, with the `kbq-list` and `kbq-list-item` classes, and SHALL keep classes the consumer adds. A `kbq-list-item` SHALL get the `kbq-focused` class while it has focus.

#### Scenario: No implicit role

- **WHEN** a `kbq-list` with `kbq-list-item` children renders
- **THEN** neither the list nor its items have a `role` attribute

#### Scenario: Focus on an anchor item

- **WHEN** an `a[kbq-list-item]` receives focus and then loses it
- **THEN** it has `kbq-focused` while focused and loses the class on blur
