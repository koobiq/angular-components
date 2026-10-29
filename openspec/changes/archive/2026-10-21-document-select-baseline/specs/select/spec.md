# Spec Delta

## Purpose

Describes what `kbq-select` from `@koobiq/components/select` guarantees to consumers: how its panel opens and closes, how users pick values with a pointer, the keyboard or assistive technology, how the value reaches Angular forms, and how the trigger, the panel and their optional parts behave.

## ADDED Requirements

### Requirement: Pointer toggles the panel

Clicking an enabled select SHALL open its panel when it is closed and close it when it is open. A disabled select MUST NOT open.

#### Scenario: Click opens a closed select

- **WHEN** the user clicks a closed, enabled select that has options
- **THEN** the panel opens

#### Scenario: Second click closes the panel

- **WHEN** the panel is open and the user clicks the select again
- **THEN** the panel closes

#### Scenario: Disabled select ignores clicks

- **WHEN** the select is disabled and the user clicks it
- **THEN** the panel stays closed

### Requirement: Keyboard opens the panel

While a closed, enabled select has focus, Enter and Space SHALL open the panel and prevent the key's default action. In single-selection mode Alt with an arrow key SHALL open the panel without changing the value. In multiple-selection mode any arrow key SHALL open the panel. Tabbing onto or past the select MUST NOT open it.

#### Scenario: Space opens the panel

- **WHEN** a closed select has focus and the user presses Space
- **THEN** the panel opens
- **AND** the page does not scroll, because the key's default action is prevented

#### Scenario: Alt with an arrow key in single mode

- **WHEN** a closed single select has focus and the user presses Alt+Down or Alt+Up
- **THEN** the panel opens and the value is unchanged

#### Scenario: Arrow key in multiple mode

- **WHEN** a closed multiple select has focus and the user presses any arrow key
- **THEN** the panel opens and the value is unchanged

#### Scenario: Tabbing through a multiple select

- **WHEN** the user tabs onto a closed multiple select
- **THEN** the panel stays closed

### Requirement: Keyboard closes the panel

While the panel is open, Escape, Tab, and Alt with Up or Down SHALL close it, prevent the key's default action and move focus to the select, unless a search field or the footer handles the key first. Escape MUST NOT propagate past the select, so an enclosing overlay stays open.

#### Scenario: Escape closes the panel

- **WHEN** the panel is open and the user presses Escape
- **THEN** the panel closes and the select has focus

#### Scenario: Escape inside another overlay

- **WHEN** the select is inside a modal or another overlay and the user presses Escape with the panel open
- **THEN** only the panel closes; the enclosing overlay stays open

#### Scenario: Tab closes the panel and keeps focus on the select

- **WHEN** the panel is open, there is no footer control to move to, and the user presses Tab
- **THEN** the panel closes and focus stays on the select instead of moving to the next element

### Requirement: Outside click closes the panel

A click outside the select and its open panel SHALL close the panel without moving focus back to the select. While a modal overlay is stacked above the panel, an outside click MUST NOT close it. With `hasBackdrop` set, the select SHALL render a backdrop (class `cdk-overlay-transparent-backdrop` unless `backdropClass` says otherwise), and a click on it SHALL close the panel.

#### Scenario: Click elsewhere on the page

- **WHEN** the panel is open and the user clicks outside it
- **THEN** the panel closes and focus is not moved to the select

#### Scenario: Modal opened above the panel

- **WHEN** the panel is open and a modal overlay has been added above it
- **AND** the user clicks outside the panel
- **THEN** the panel stays open

### Requirement: Panel without options opens after a delay

When the select has no options, opening SHALL emit `beforeOpened` at once and attach the panel after `delayBeforeDisplayingResultWithoutOptions` (101 ms). When it has options, the panel SHALL attach at once.

#### Scenario: Opening an empty select

- **WHEN** the select has no options and the user opens it
- **THEN** `beforeOpened` fires immediately
- **AND** the panel appears 101 ms later

### Requirement: Open-state events

`beforeOpened` SHALL fire synchronously when an enabled, closed select starts to open. `openedChange` with `true` or `false`, `opened` and `closed` SHALL fire after the new state has been rendered, not synchronously with the call that changed it.

#### Scenario: Events of an open and close cycle

- **WHEN** the user opens the panel and then closes it
- **THEN** `beforeOpened`, then `openedChange(true)` and `opened` fire on opening
- **AND** `openedChange(false)` and `closed` fire on closing

### Requirement: Focus moves into the open panel

Opening the panel SHALL move DOM focus onto the active option, or onto the search field when one is projected and shown. The select MUST NOT rely on `aria-activedescendant`. While the panel is open, the select SHALL report itself as focused to its form field even though DOM focus is in the panel.

#### Scenario: Focus lands on the active option

- **WHEN** the panel of a select without search opens
- **THEN** the active option holds DOM focus

#### Scenario: Focus lands on the search field

- **WHEN** the panel of a select with a projected search field opens
- **THEN** the search field holds DOM focus

### Requirement: Active option on open

When the panel opens, the first enabled selected option SHALL become active. When no enabled selected option is rendered, the first enabled option SHALL become active. When the select-all row is rendered and nothing is selected, the row SHALL be active.

#### Scenario: Nothing selected

- **WHEN** the panel opens with no value
- **THEN** the first enabled option is active

#### Scenario: A value is selected

- **WHEN** the panel opens with a selected option in the list
- **THEN** that option is active

#### Scenario: Select-all row present

- **WHEN** a multiple select with `selectAll` opens with no value
- **THEN** the select-all row is active

### Requirement: Navigating the open panel

With the panel open, Up and Down SHALL move the active option to the previous or next enabled option, skipping disabled options and options of disabled groups, without wrapping around. Home and End SHALL activate the first and last enabled option. PageUp and PageDown SHALL move by one visible page of options and stop at the first or last one.

#### Scenario: Arrow keys skip disabled options

- **WHEN** the next option is disabled and the user presses Down
- **THEN** the option after it becomes active

#### Scenario: Home and End

- **WHEN** the user presses End and then Home
- **THEN** the last and then the first enabled option becomes active

### Requirement: Active option stays in view

When the panel opens, the list SHALL be scrolled so that the active option is visible, and keyboard navigation SHALL keep the active option visible. Hovering an enabled option SHALL make it active without scrolling the list; disabled options SHALL ignore hover.

#### Scenario: Selected option far down the list

- **WHEN** the selected option is below the visible part of the list and the panel opens
- **THEN** the list is scrolled so that the option is visible

#### Scenario: Navigating past the visible area

- **WHEN** the user presses Down until the active option leaves the visible area
- **THEN** the list scrolls to keep the active option visible

### Requirement: Selecting the active option from the keyboard

Enter or Space SHALL select the active option. In single-selection mode the panel then SHALL close and focus SHALL return to the select. In multiple-selection mode the option SHALL toggle and the panel SHALL stay open. In multiple-selection mode Shift with Up or Down SHALL move the active option and toggle the newly active one.

#### Scenario: Enter in single mode

- **WHEN** an option is active in a single select and the user presses Enter
- **THEN** the option becomes the value, the panel closes and the select has focus

#### Scenario: Shift with an arrow in multiple mode

- **WHEN** the panel of a multiple select is open and the user presses Shift+Down
- **THEN** the next option becomes active and its selection toggles

### Requirement: Typeahead

Without a search field, characters typed in quick succession SHALL activate the next option whose label starts with them, ignoring case. On a closed single select this SHALL also select that option. On a closed multiple select typing MUST do nothing. When a search field is projected, typeahead MUST be off and the characters go to the field.

#### Scenario: Typing on a closed single select

- **WHEN** a closed single select has focus and the user types the first letters of an option's label
- **THEN** that option becomes the value without opening the panel

#### Scenario: Typing on a closed multiple select

- **WHEN** a closed multiple select has focus and the user types letters
- **THEN** neither the value nor the panel changes

### Requirement: Arrow keys change the value of a closed single select

While a closed single select has focus, the arrow keys SHALL select the previous or next enabled option without opening the panel, starting from the current value and stopping at the first or last option without wrapping. Each step SHALL be reported as a change made by the user, with one change event per step.

#### Scenario: Stepping through options

- **WHEN** a closed single select has focus and the user presses Down twice
- **THEN** the value moves two enabled options forward
- **AND** `selectionChange` fires once per key press

#### Scenario: Reaching the end

- **WHEN** the last enabled option is selected and the user presses Down
- **THEN** the value does not change

### Requirement: Single selection

In single-selection mode, choosing an enabled option SHALL make its value the select's value, close the panel and move focus to the select. Choosing the option that is already selected MUST NOT emit change events.

#### Scenario: Picking an option with the mouse

- **WHEN** the user clicks an option in an open single select
- **THEN** the option's value becomes the select's value
- **AND** the panel closes and the select has focus

#### Scenario: Picking the selected option again

- **WHEN** the user clicks the option that is already selected
- **THEN** no `selectionChange` or `valueChange` is emitted

### Requirement: Multiple selection

With `multiple` set, or with `multiline` set on its own, the select SHALL hold an array of values. Choosing an enabled option SHALL toggle it, and the panel SHALL stay open.

#### Scenario: Toggling options

- **WHEN** the user clicks two options of an open multiple select and then clicks the first one again
- **THEN** the value holds only the second option's value
- **AND** the panel is still open

### Requirement: Selection mode is fixed after initialization

Changing `multiple` after the select has initialized SHALL throw the error "Cannot change `multiple` mode of select after initialization."

#### Scenario: Toggling multiple at runtime

- **WHEN** the binding of `multiple` changes after the first render
- **THEN** the select throws that error

### Requirement: Disabled options cannot be selected

A disabled option, or any option inside a disabled `kbq-optgroup`, MUST NOT be selected by click, keyboard or Shift+click, and choosing it MUST leave the panel open.

#### Scenario: Clicking a disabled option

- **WHEN** the user clicks a disabled option
- **THEN** the value does not change and the panel stays open

#### Scenario: Option in a disabled group

- **WHEN** the user clicks an option inside a disabled group
- **THEN** the value does not change

### Requirement: Order of values in multiple mode

In multiple-selection mode the value SHALL list the selected values in the order their options are declared in the panel, whatever order they were picked or written in. A `sortComparator(a, b, options)` SHALL replace that order. In right-to-left layout only the order of the tags SHALL be reversed; the value keeps panel order.

#### Scenario: Picking in reverse order

- **WHEN** the user selects the third option and then the first one
- **THEN** the value lists the first option's value before the third

#### Scenario: Custom order

- **WHEN** a `sortComparator` is bound and the user selects options
- **THEN** the value is ordered by that comparator

### Requirement: Value comparison

The select SHALL match its value against option values with `compareWith(optionValue, selectedValue)`, which defaults to strict equality. Replacing the comparator SHALL re-derive the selection. Binding a non-function SHALL throw "`compareWith` must be a function."

#### Scenario: Object values with a custom comparator

- **WHEN** option values are objects and `compareWith` compares them by an id
- **AND** the form writes a different object with a matching id
- **THEN** the option with that id is shown as selected

#### Scenario: Invalid comparator

- **WHEN** `compareWith` is bound to a value that is not a function
- **THEN** the select throws that error

### Requirement: Values written by code are silent

A value written through `[value]`, `value.set()`, `FormControl.setValue()` or `ngModel` SHALL select the matching options and MUST NOT emit `valueChange` or `selectionChange` or mark the form control dirty.

#### Scenario: Form writes a value

- **WHEN** the bound form control's value is set in code
- **THEN** the matching option is shown as selected
- **AND** no `selectionChange` or `valueChange` fires and the control stays pristine

### Requirement: Change notification for user changes

A change made by the user — choosing an option, removing a tag, the cleaner or "select all" — SHALL update `value`, then emit `valueChange`, then pass the value to the bound form control, then emit `selectionChange` with a `KbqSelectChange` carrying the select and the new value.

#### Scenario: Bound value is current inside the handler

- **WHEN** the user picks an option and a `selectionChange` handler reads the form control
- **THEN** the control already holds the new value

### Requirement: Reset option in single mode

In single-selection mode, choosing an option whose value is `null` or `undefined`, or that has no value, SHALL reset the select's value to that empty value and show the placeholder; such an option MUST never be shown as selected. Other falsy values such as `false` and `0` SHALL be ordinary values.

#### Scenario: Choosing the reset option

- **WHEN** a value is selected and the user chooses an option with a `null` value
- **THEN** the value becomes `null` and the trigger shows the placeholder

#### Scenario: Falsy value that is not empty

- **WHEN** the user chooses an option whose value is `0`
- **THEN** the value becomes `0` and that option is shown as selected

### Requirement: Writing an empty value clears the selection

Writing `null` or `undefined` to the select, including by resetting its form control, SHALL clear the selection in either mode and show the placeholder.

#### Scenario: Resetting the form control

- **WHEN** the bound form control is reset
- **THEN** no option is selected and the trigger shows the placeholder

### Requirement: Value type in multiple mode

In multiple-selection mode a truthy value that is not an array SHALL throw "Value must be an array in multiple-selection mode."; `null` and `undefined` SHALL be accepted. In single-selection mode an array SHALL be accepted as an ordinary value.

#### Scenario: Writing a string to a multiple select

- **WHEN** a multiple select's value is set to a string
- **THEN** the select throws that error

### Requirement: Options that change after initialization

Whenever the rendered options change, the select SHALL re-derive the selection from its current value: an option added later whose value matches SHALL be shown as selected and SHALL follow the select's mode. When a selected option's label changes, the trigger SHALL show the new label.

#### Scenario: Matching option arrives later

- **WHEN** the value is set before its option is rendered and the option is added afterwards
- **THEN** the option is shown as selected

#### Scenario: Label of a selected option changes

- **WHEN** the text of the selected option changes
- **THEN** the trigger shows the new text

### Requirement: Values without a rendered option

Without `showPreselectedValues` and without virtual scrolling, a value that matches no rendered option MUST NOT be shown in the trigger. With `showPreselectedValues` set, such a value SHALL be shown with the label from `virtualOptionFactory`, or with the raw value when there is no factory.

#### Scenario: Unmatched value by default

- **WHEN** the form writes a value that no option has
- **THEN** the trigger shows the placeholder

#### Scenario: Unmatched value with showPreselectedValues

- **WHEN** `showPreselectedValues` is set and the form writes a value that no option has
- **THEN** the trigger shows that value

### Requirement: Angular forms and two-way binding

The select SHALL work as a form control with reactive forms (`formControl`, `formControlName`) and with `ngModel`, and SHALL support `[(value)]` without Angular forms.

#### Scenario: Two-way binding without forms

- **WHEN** the select is bound with `[(value)]` and the user picks an option
- **THEN** the bound property holds the option's value

### Requirement: Touched and dirty state

The select SHALL mark its form control touched when it loses focus while the panel is closed and each time the panel closes. A disabled select MUST NOT mark it touched. Only changes made by the user SHALL mark the control dirty.

#### Scenario: Closing the panel

- **WHEN** the user opens and closes the panel without picking anything
- **THEN** the control is touched but not dirty

#### Scenario: Picking a value

- **WHEN** the user picks an option
- **THEN** the control is dirty

### Requirement: Disabled select

When disabled through `disabled` or through its form control, the select SHALL get the `kbq-disabled` class, `aria-disabled="true"` and `tabindex="-1"`, MUST NOT open and MUST NOT change its value from the keyboard.

#### Scenario: Disabling through the form control

- **WHEN** the bound form control is disabled
- **THEN** the select has `kbq-disabled`, `aria-disabled="true"` and `tabindex="-1"`
- **AND** clicking it does not open the panel

### Requirement: Error state

When a form directive is bound, the select SHALL be in error state when its control is invalid and either touched or in a submitted form, unless an `errorStateMatcher` input or an injected `ErrorStateMatcher` decides otherwise; the input wins over the injected one. In error state the select SHALL get the `kbq-invalid` class and `aria-invalid="true"`, and its arrow and tags SHALL use the error color.

#### Scenario: Untouched invalid control

- **WHEN** the control is invalid and has not been touched
- **THEN** the select is not in error state

#### Scenario: Parent form submitted

- **WHEN** the control is invalid and its parent form is submitted
- **THEN** the select has `kbq-invalid` and the form field shows its `kbq-error`

### Requirement: Required flag

The `required` input SHALL be reflected as `aria-required` on the select. The select itself MUST NOT add a validator: whether an empty value is invalid is decided by the validators of the bound form control, including the one Angular's own `required` directive adds next to `formControl` or `ngModel`.

#### Scenario: Required flag

- **WHEN** `required` is set on the select
- **THEN** the select has `aria-required="true"`

### Requirement: Empty trigger

When nothing is selected, the trigger SHALL show the `placeholder`, or a non-breaking space when there is no placeholder.

#### Scenario: Placeholder

- **WHEN** a select with `placeholder="Country"` has no value
- **THEN** the trigger shows "Country"

### Requirement: Single value in the trigger

In single-selection mode the trigger SHALL show the selected option's `viewValue`: its `viewValue` input, or its trimmed text. A long value SHALL stay on one line and be cut with an ellipsis.

#### Scenario: Selected option label

- **WHEN** the option "Steak" is selected
- **THEN** the trigger shows "Steak"

### Requirement: Tags for multiple values

In multiple-selection mode the trigger SHALL show one tag per selected value, labelled with the option's text, in the order described by the ordering requirement. With `triggerValuesLimit` greater than zero, only that many tags SHALL be rendered.

#### Scenario: Two values selected

- **WHEN** two options are selected in a multiple select
- **THEN** the trigger shows two tags with their labels

#### Scenario: Limit on tags

- **WHEN** `triggerValuesLimit` is 2 and four values are selected
- **THEN** the trigger renders two tags

### Requirement: Removing a value from its tag

Each built-in tag of an enabled option in an enabled select SHALL carry a remove control: a `button` named "<remove> <label>" from the a11y locale, operable by click, Enter and Space. Using it SHALL deselect the value and MUST NOT open the panel. Tags of disabled options, and all tags of a disabled select, MUST NOT have one.

#### Scenario: Removing with the keyboard

- **WHEN** a remove control has focus and the user presses Enter
- **THEN** its value is removed from the select's value and the panel stays closed

#### Scenario: Disabled option

- **WHEN** a disabled option is selected in a multiple select
- **THEN** its tag has no remove control

### Requirement: Only visible tags are tab stops

The remove controls of tags that fit in a single-row trigger SHALL be in the tab order (`tabindex="0"`), and those of tags clipped behind the hidden-items counter SHALL have `tabindex="-1"`. When the trigger cannot be measured, every remove control SHALL stay in the tab order.

#### Scenario: Clipped tags

- **WHEN** four values are selected and only two tags fit in the trigger
- **THEN** only the remove controls of those two tags have `tabindex="0"`

### Requirement: Hidden-items counter

In multiple, non-multiline mode, when the tags do not fit in one row, the trigger SHALL show a counter of the values left out, formatted from `select.hiddenItemsText` of the locale (`+{{ number }}` in every shipped locale). The `hiddenItemsText` input SHALL override the locale text and `hiddenItemsTextFormatter` SHALL replace the formatting. The count SHALL be readable as `hiddenItems()`.

#### Scenario: Overflowing tags

- **WHEN** five values are selected and three tags fit in the trigger
- **THEN** the trigger shows "+2" and `hiddenItems()` returns 2

#### Scenario: Custom text

- **WHEN** `hiddenItemsText` is "and {{ number }} more" and two values are hidden
- **THEN** the counter shows "and 2 more", also after the locale is switched

### Requirement: No counter for custom triggers and multiline

The hidden-items counter MUST NOT be shown when a `kbq-select-trigger` or `kbq-select-matcher` is projected, when nothing is selected, or in multiline mode.

#### Scenario: Multiline select

- **WHEN** a multiline select has more tags than fit in one row
- **THEN** no counter is shown

### Requirement: Multiline trigger

With `multiline` set, the select SHALL use multiple selection, wrap its tags onto as many rows as they need, and get the `kbq-select_multiline` class. An empty multiline trigger SHALL have the height of a single-line one. When the trigger is taller than the room for the panel, the panel SHALL be anchored to the first row and drawn over the rest, keeping the first row, the arrow and the cleaner clickable.

#### Scenario: Many selected values

- **WHEN** a multiline select has more tags than fit in one row
- **THEN** the trigger grows to show every tag

#### Scenario: Trigger taller than the available space

- **WHEN** the multiline trigger is so tall that the panel fits neither below nor above it
- **THEN** the panel opens one gap below the trigger's first row, over the remaining rows

### Requirement: Custom trigger content

A projected `kbq-select-trigger` element (or element with that attribute) SHALL replace only the value area of the trigger and SHALL be rendered only while a value is selected; the placeholder, cleaner and arrow stay. A projected `kbq-select-matcher` SHALL replace the whole trigger content, including the placeholder, cleaner and arrow, and SHALL always be rendered.

#### Scenario: Custom label for the value

- **WHEN** a `kbq-select-trigger` is projected and a value is selected
- **THEN** the trigger shows the projected content instead of the option label

### Requirement: Custom tag template

An `<ng-template #kbqSelectTagContent>` inside the select SHALL replace the markup of every tag in multiple-selection mode. It SHALL be rendered once per selected option with the option as `$implicit` and the select as `select`.

#### Scenario: Custom tags

- **WHEN** a `#kbqSelectTagContent` template is declared and two values are selected
- **THEN** the trigger renders the template twice, once per option

### Requirement: Cleaner visibility

A `kbq-cleaner` placed as a direct child of the select SHALL be shown only while the select is enabled, has a value, and has at least one selected option that `clearPredicate` accepts.

#### Scenario: Only disabled options left

- **WHEN** the only selected options are disabled and the default predicate is used
- **THEN** the cleaner is hidden

### Requirement: Clearing the value

Activating the cleaner by click, Enter or Space SHALL deselect every selected option that `clearPredicate` accepts — by default every option that is not disabled — and emit one change. A single select SHALL end with `undefined`; a multiple select SHALL keep the values that were not cleared, or end with `[]`. Clearing MUST NOT toggle the panel.

#### Scenario: Clearing a multiple select with a disabled value

- **WHEN** a disabled and an enabled option are selected and the user clicks the cleaner
- **THEN** the value holds only the disabled option's value

#### Scenario: Clearing a single select

- **WHEN** a single select has a value and the user clicks the cleaner
- **THEN** the form control's value is `undefined` and the placeholder is shown

### Requirement: Clear predicate

`clearPredicate` SHALL decide which selected options the cleaner removes; it defaults to the `clearPredicate` of `KBQ_SELECT_OPTIONS`, and then to keeping disabled options. Binding a non-function SHALL throw. A predicate that throws for an option SHALL keep that option selected. Writing a value or resetting the form MUST NOT consult the predicate.

#### Scenario: Clearing everything

- **WHEN** `clearPredicate` returns `true` for every option and the user clicks the cleaner
- **THEN** disabled options are deselected too

### Requirement: Select-all row

With `selectAll` set in multiple-selection mode, the panel SHALL render a "select all" row above the options, labelled with `select.selectAll` from the locale. The row MUST NOT be rendered in single-selection mode, while a search matches nothing, under virtual scrolling, or with `showPreselectedValues`.

#### Scenario: Row is rendered

- **WHEN** a multiple select with `selectAll` opens
- **THEN** the first row of the list is "select all"

#### Scenario: Search matches nothing

- **WHEN** the search query matches no option
- **THEN** the row is not rendered

### Requirement: Select-all state

The select-all row SHALL be unchecked when none of the enabled, rendered options is selected, indeterminate when some are, and checked when all are, and SHALL expose that state as `aria-checked` `false`, `mixed` or `true`. `allOptionsSelected` SHALL be `true` only when there is at least one such option and all of them are selected.

#### Scenario: Partial selection

- **WHEN** some but not all enabled options are selected
- **THEN** the row is indeterminate and has `aria-checked="mixed"`

#### Scenario: Only disabled options

- **WHEN** every option is disabled
- **THEN** the row is unchecked and `allOptionsSelected` is `false`, whatever is selected

### Requirement: Select-all action

Activating the select-all row by click, Enter or Space SHALL select every enabled, rendered option unless all of them are already selected, in which case it SHALL deselect them. Disabled options MUST NOT change. During a search it SHALL act only on the matching options. Each activation SHALL emit one `selectionChange` for the batch, then `onSelectAll`.

#### Scenario: Indeterminate row

- **WHEN** some options are selected and the user clicks the row
- **THEN** every enabled option becomes selected

#### Scenario: Acting on search results

- **WHEN** a query is active and the user clicks the row twice
- **THEN** the matching options are selected and then deselected
- **AND** selected options hidden by the query stay selected

### Requirement: Select all from the keyboard

While the panel of a multiple select is open, Ctrl+A or Cmd+A SHALL select every enabled option and emit `onSelectAll`. Without `selectAll`, a repeated press SHALL keep them selected unless `selectAllToggle` is set; with `selectAll` the shortcut SHALL act like the row. In a non-empty search field whose text is not fully selected, the first press SHALL select the text only. A `selectAllHandler` SHALL replace the shortcut.

#### Scenario: Toggle with selectAllToggle

- **WHEN** `selectAllToggle` is set, every option is selected and the user presses Ctrl+A
- **THEN** every enabled option is deselected

#### Scenario: Text in the search field

- **WHEN** the search field contains unselected text and the user presses Ctrl+A
- **THEN** the field's text is selected and the selection of options is unchanged

#### Scenario: Custom handler

- **WHEN** `selectAllHandler` is bound and the user presses Ctrl+A
- **THEN** the handler is called with the event and the select, and the default selection does not run

### Requirement: Search field

A `kbq-form-field` with `kbqSelectSearch` wrapping a `kbqInput` bound to a form control SHALL render above the option list, outside the listbox. The select MUST NOT filter options itself; the consumer filters what it renders. The search SHALL be reset when the panel closes. Projecting the search without `kbqInput` or without a form control SHALL throw.

#### Scenario: Consumer filters options

- **WHEN** the user types in the search field and the consumer renders only matching options
- **THEN** the list shows those options and the first of them becomes active if the previous active one is gone

#### Scenario: Closing resets the search

- **WHEN** the user types a query and closes the panel
- **THEN** the search field is empty the next time the panel opens

### Requirement: Keys in the search field

With focus in the search field, Up, Down, PageUp, PageDown and Enter SHALL act on the options while focus stays in the field. Home, End and Space SHALL stay in the field. Escape SHALL clear a non-empty query and keep the panel open, and SHALL close the panel when the query is empty.

#### Scenario: Escape with a query

- **WHEN** the search field holds a query and the user presses Escape
- **THEN** the query is cleared and the panel stays open

#### Scenario: Escape without a query

- **WHEN** the search field is empty and the user presses Escape
- **THEN** the panel closes

### Requirement: Empty search result

When a non-empty query leaves no selectable option, the select SHALL render a projected `[kbq-select-search-empty-result]` element inside the listbox. The select MUST NOT provide default text for it.

#### Scenario: Query matches nothing

- **WHEN** the query matches no option and a `kbq-select-search-empty-result` element is projected
- **THEN** that element is shown in the list

### Requirement: Hiding search for short lists

With `searchMinOptionsThreshold` set, either as an input or through `KBQ_SELECT_OPTIONS`, the search field SHALL be shown only when the number of rendered options is at least the threshold or the field holds a query. `'auto'` SHALL mean 10. Without a threshold the search SHALL always be shown.

#### Scenario: Fewer options than the threshold

- **WHEN** the threshold is 5 and the select has 3 options
- **THEN** the search field is not shown

#### Scenario: Query keeps the search visible

- **WHEN** a query narrows the list below the threshold
- **THEN** the search field stays visible

### Requirement: Option groups

A `kbq-optgroup` SHALL be exposed as a `group` named by its label. Disabling a group SHALL disable its options for selection and navigation.

#### Scenario: Navigating past a disabled group

- **WHEN** the next options belong to a disabled group and the user presses Down
- **THEN** the first enabled option after that group becomes active

### Requirement: Footer

A projected `kbq-select-footer` SHALL render below the list and stay in place while the list scrolls. Any click inside it SHALL close the panel and return focus to the select. With the panel open, Tab and Shift+Tab SHALL step through its enabled focusable controls; once they run out, Tab SHALL close the panel and focus the select. While focus is in the footer, Escape and Alt with an arrow SHALL close the panel, and other keys SHALL be left to the focused control.

#### Scenario: Tabbing into the footer

- **WHEN** the panel is open, the footer has two enabled controls and the user presses Tab three times
- **THEN** focus visits both controls, then the panel closes and the select has focus

#### Scenario: Activating a footer action

- **WHEN** the user clicks a `kbq-select-footer-item` button
- **THEN** the panel closes and the select has focus

### Requirement: Loading, error and empty states

Projected `kbq-select-loading`, `kbq-select-error` and `kbq-select-no-options` elements SHALL be rendered inside the listbox. `kbq-select-loading` SHALL show a spinner when none is projected. While the listbox holds no options and no select-all row, it SHALL be marked `aria-busy="true"`.

#### Scenario: Loading

- **WHEN** the select has no options and projects `kbq-select-loading`
- **THEN** the opened panel shows a spinner and the listbox has `aria-busy="true"`

#### Scenario: Options arrive

- **WHEN** options are rendered in the list
- **THEN** the listbox has no `aria-busy`

### Requirement: Virtual scrolling

A projected `cdk-virtual-scroll-viewport` SHALL switch the select to virtual scrolling: the viewport height SHALL equal `panelMaxHeight`, and selected values whose options are not rendered SHALL stay selected and be labelled by `virtualOptionFactory`, or by the raw value without one. Without a factory, a value missing from the data source MUST NOT be selected.

#### Scenario: Selected option scrolled out of view

- **WHEN** a value is selected and its option is recycled out of the viewport
- **THEN** the trigger keeps showing the value's label from `virtualOptionFactory`

#### Scenario: Filtering the data source

- **WHEN** a search narrows the data and the selected value's item is filtered out
- **THEN** the trigger keeps showing the selected value

### Requirement: Scrolled to bottom

The select SHALL emit `scrolledToBottom` when the option list, or its virtual scroll viewport, is scrolled to within `scrolledToBottomOffset` pixels (default 0) of its end.

#### Scenario: Paging more options

- **WHEN** the user scrolls the list to its end
- **THEN** `scrolledToBottom` fires

### Requirement: Panel position

The panel SHALL open below the trigger, aligned to its start edge, and SHALL open above it when it does not fit below. The chosen side SHALL stay fixed while the panel is open. Inside a form field, the panel SHALL be positioned against the form field's container.

#### Scenario: Not enough room below

- **WHEN** the select is near the bottom of the viewport and the panel does not fit below
- **THEN** the panel opens above the trigger

### Requirement: Panel follows page scroll

By default the open panel SHALL follow the trigger when the page scrolls instead of closing, and scrolling inside the panel MUST NOT reposition it. A strategy provided through `KBQ_SELECT_SCROLL_STRATEGY` SHALL replace this behavior.

#### Scenario: Page scrolls under the open panel

- **WHEN** the panel is open and the page scrolls
- **THEN** the panel stays attached to the trigger

### Requirement: Panel width

With `panelWidth` unset, the panel SHALL grow with its content, never narrower than the trigger or `panelMinWidth` (200 px by default), and stop growing at `panelMaxWidth` or the `--kbq-panel-size-width-max` token. `'auto'` SHALL match the trigger width but keep `panelMinWidth`. A number SHALL be used exactly. With a search field, a content-sized panel SHALL keep the width measured on open while filtering.

#### Scenario: Fixed width

- **WHEN** `panelWidth` is 400
- **THEN** the panel is 400 px wide whatever `panelMinWidth` is

#### Scenario: Matching the trigger

- **WHEN** `panelWidth` is `'auto'` and the trigger is 300 px wide
- **THEN** the panel is 300 px wide

#### Scenario: Filtering does not resize

- **WHEN** a content-sized panel with search is open and filtering removes the widest option
- **THEN** the panel keeps its width

### Requirement: Panel height

`panelMaxHeight` SHALL cap the height of the scrollable option list, 256 px by default through the `--kbq-select-panel-size-max-height` token; the search field and footer add to it. Under virtual scrolling it SHALL be the exact height of the viewport.

#### Scenario: Custom maximum height

- **WHEN** `panelMaxHeight` is 400 and the options need 600 px
- **THEN** the option list is 400 px tall and scrolls

### Requirement: Panel classes

The panel SHALL receive the classes of `panelClass` in its string, array, Set or object form, and the color class of the enclosing form field.

#### Scenario: Extra classes

- **WHEN** `panelClass` is `['a', 'b']`
- **THEN** the panel element has the classes `a` and `b`

### Requirement: Application-wide defaults

`KBQ_SELECT_OPTIONS`, usually provided with `kbqSelectOptionsProvider()`, SHALL supply defaults for `panelWidth`, `panelMinWidth`, `panelMaxWidth`, `panelMaxHeight`, `searchMinOptionsThreshold` and `clearPredicate`. An input bound on a select SHALL win over the provided default, and an explicit `null` in the provider SHALL be honored rather than replaced by the built-in default.

#### Scenario: Attribute wins over the provider

- **WHEN** the provider sets `panelWidth: 'auto'` and a select binds `panelWidth="400"`
- **THEN** that select's panel is 400 px wide

### Requirement: Combobox semantics

The select SHALL have `role="combobox"` and `aria-haspopup="listbox"`, an `aria-expanded` that follows the panel, and an `aria-controls` pointing at the option list only while the panel is open. The option list SHALL have `role="listbox"` and an `aria-multiselectable` that reflects the selection mode.

#### Scenario: Open panel

- **WHEN** the panel of a multiple select is open
- **THEN** the select has `aria-expanded="true"` and an `aria-controls` equal to the listbox id
- **AND** the listbox has `aria-multiselectable="true"`

### Requirement: Accessible name

Inside a `kbq-form-field` with a `kbq-label`, the select SHALL be named by that label through `aria-labelledby`. Otherwise the `aria-label` input SHALL name it, and without one the `placeholder` SHALL. The option list SHALL carry the same name.

#### Scenario: Form-field label

- **WHEN** the select is inside a form field with the label "Country"
- **THEN** the select's `aria-labelledby` points at that label

#### Scenario: Placeholder as the last resort

- **WHEN** the select has no form-field label and no `aria-label` but has a placeholder
- **THEN** the placeholder is used as its `aria-label`

### Requirement: Option semantics

Every option SHALL have `role="option"` with `aria-selected` and `aria-disabled`. The pseudo-checkbox of an option SHALL be hidden from assistive technology.

#### Scenario: Selected and disabled options

- **WHEN** one option is selected and another is disabled
- **THEN** they have `aria-selected="true"` and `aria-disabled="true"` respectively

### Requirement: Tab order of the select

The select SHALL be focusable with `tabindex="0"` by default, SHALL use the `tabIndex` input when given, and SHALL have `tabindex="-1"` while disabled.

#### Scenario: Custom tab index

- **WHEN** `tabIndex` is 3
- **THEN** the select has `tabindex="3"`

### Requirement: Form-field container click

A click on the container of the enclosing form field SHALL focus the select and MUST NOT open the panel.

#### Scenario: Clicking the field around a closed select

- **WHEN** the panel is closed and the user clicks the form field's container outside the select
- **THEN** the select has focus and the panel stays closed

### Requirement: Localized strings

The strings the select renders itself — the "select all" label (`select.selectAll`), the hidden-items counter (`select.hiddenItemsText`), the names of the tag remove controls (`a11y.remove`) and of the cleaner (`a11y.clear`) — SHALL follow the active locale, `ru-RU` by default. `[localeOverrides]` SHALL override any of them for one select while keys left out keep following the locale.

#### Scenario: Switching the locale

- **WHEN** the application switches the locale to `en-US`
- **THEN** the select-all row reads "Select all"

#### Scenario: Overriding one select

- **WHEN** a select binds `[localeOverrides]` with its own `select.selectAll`
- **THEN** only that select shows the overridden label

### Requirement: Tooltip for truncated options

When the select is used through `KbqSelectModule`, an option whose text is cut with an ellipsis SHALL show its full text in a tooltip on hover; an option whose text fits MUST NOT. `kbqTooltipDisabled` set to `true` on the option SHALL suppress the tooltip.

#### Scenario: Long option text

- **WHEN** an option's text is truncated and the user hovers it
- **THEN** a tooltip with the full text appears

#### Scenario: Short option text

- **WHEN** an option's text fits and the user hovers it
- **THEN** no tooltip appears
