# Spec Delta

## Purpose

Describes what `kbq-tree-select` from `@koobiq/components/tree-select` guarantees to consumers: how its panel opens and closes, how users pick nodes of the projected tree with a pointer, the keyboard or assistive technology, how the value reaches Angular forms, and how the trigger, the panel and their optional parts behave.

## ADDED Requirements

### Requirement: Pointer toggles the panel

Clicking an enabled tree-select SHALL open its panel when it is closed and close it when it is open. A disabled tree-select MUST NOT open.

#### Scenario: Click opens a closed tree-select

- **WHEN** the user clicks a closed, enabled tree-select whose tree renders nodes
- **THEN** the panel opens and shows the rendered nodes

#### Scenario: Second click closes the panel

- **WHEN** the panel is open and the user clicks the tree-select again
- **THEN** the panel closes

#### Scenario: Disabled tree-select ignores clicks

- **WHEN** the tree-select is disabled and the user clicks it
- **THEN** the panel stays closed

### Requirement: Keyboard opens the panel

While a closed, enabled tree-select has focus, Enter and Space SHALL open the panel and prevent the key's default action. In single-selection mode Alt with any arrow key SHALL open the panel without changing the value. In multiple-selection mode any arrow key SHALL open the panel without changing the value. Tab MUST NOT open it.

#### Scenario: Space opens the panel

- **WHEN** a closed tree-select has focus and the user presses Space
- **THEN** the panel opens
- **AND** the key's default action is prevented

#### Scenario: Alt with an arrow key in single mode

- **WHEN** a closed single tree-select has focus and the user presses Alt+Down or Alt+Up
- **THEN** the panel opens and the value is unchanged

#### Scenario: Any arrow key in multiple mode

- **WHEN** a closed multiple tree-select has focus and the user presses Down or Right
- **THEN** the panel opens, the value is unchanged and the key's default action is prevented

#### Scenario: Tabbing through a multiple tree-select

- **WHEN** a closed multiple tree-select has focus and the user presses Tab
- **THEN** the panel stays closed

### Requirement: Keyboard closes the panel

While the panel is open, Escape and Alt with Up or Down SHALL close it, prevent the key's default action and move focus to the tree-select. Escape MUST NOT propagate past the tree-select, so an enclosing overlay stays open. Tab SHALL close the panel and move focus to the tree-select without preventing the key, so the browser then moves focus on to the next control.

#### Scenario: Alt with an arrow key

- **WHEN** the panel is open and the user presses Alt+Down
- **THEN** the panel closes, the tree-select has focus and the key's default action is prevented

#### Scenario: Escape inside another overlay

- **WHEN** the tree-select is inside a modal or another overlay and the user presses Escape with the panel open
- **THEN** only the panel closes; the event does not propagate to the enclosing overlay

#### Scenario: Tab from inside the panel

- **WHEN** focus is inside the open panel and the user presses Tab
- **THEN** the panel closes and the key's default action is not prevented

### Requirement: Outside click closes the panel

A click outside the tree-select and its open panel SHALL close the panel without moving focus back to the tree-select. With `hasBackdrop` set, the tree-select SHALL render a backdrop with the class from `backdropClass` (`cdk-overlay-transparent-backdrop` by default), and a click on it SHALL close the panel.

#### Scenario: Click elsewhere on the page

- **WHEN** the panel is open and the user clicks outside it
- **THEN** the panel closes and focus is not moved to the tree-select

#### Scenario: Backdrop click

- **WHEN** `hasBackdrop` is set, the panel is open and the user clicks the backdrop
- **THEN** the panel closes

### Requirement: Tree without nodes

When the tree renders no nodes, opening SHALL do nothing unless a `kbq-select-no-options` element is projected; with that element projected, the panel SHALL open at once and show it inside the panel content. Escape SHALL close such a panel.

#### Scenario: Empty tree without a message

- **WHEN** the data source is empty, no `kbq-select-no-options` is projected and the user clicks the tree-select
- **THEN** the panel stays closed

#### Scenario: Empty tree with a message

- **WHEN** the data source is empty, a `kbq-select-no-options` element is projected and the user clicks the tree-select
- **THEN** the panel opens and shows the projected message

### Requirement: Open-state events

`openedChange` with `true` and `opened` SHALL fire once the opened panel has been rendered; `openedChange` with `false` and `closed` SHALL fire once the panel has been removed. They MUST NOT fire synchronously with the call that changed the state.

#### Scenario: Events of an open and close cycle

- **WHEN** the user opens the panel and then clicks outside it
- **THEN** `openedChange(true)` and `opened` fire after opening
- **AND** `openedChange(false)` and `closed` fire after closing

### Requirement: Programmatic control

`open()`, `close()` and `toggle()` SHALL open, close and toggle the panel under the same conditions as the user actions, and `focus()` SHALL focus the tree-select. `open()` called before the first change detection MUST NOT throw. Calling these methods or writing the form value from an `effect()` MUST NOT make that effect run again when the user later changes the state.

#### Scenario: Effect that opens the panel

- **WHEN** an effect calls `open()` and the user then closes the panel with Escape
- **THEN** the panel is closed and the effect has run once

#### Scenario: Opening too early

- **WHEN** `open()` is called on a tree-select that has not been through change detection
- **THEN** no error is thrown

### Requirement: Focus moves into the open panel

Once the panel has rendered, DOM focus SHALL move onto the active option, and then into the search field when one is projected. The tree-select host MUST NOT carry `aria-activedescendant`. While the panel is open, the tree-select SHALL report itself as focused to its form field even though DOM focus is in the panel.

#### Scenario: Focus lands on the active option

- **WHEN** the panel of a tree-select without search opens and the user presses Down
- **THEN** the active option holds DOM focus and the host has no `aria-activedescendant`

#### Scenario: Focus lands on the search field

- **WHEN** the panel of a tree-select with a projected search field opens
- **THEN** the search field holds DOM focus

#### Scenario: Host blurs while the panel is open

- **WHEN** the panel is open and the host receives a `blur` event
- **THEN** `focused()` still returns `true`

### Requirement: Active option on open

When the panel opens, the option of the first selected node that is not disabled SHALL become active. When that node has no rendered option, for example because its branch is collapsed, or nothing is selected, the first enabled rendered option SHALL become active; with the select-all row rendered that is the row.

#### Scenario: Nothing selected

- **WHEN** the panel opens with no value
- **THEN** the first rendered option is active

#### Scenario: A value is selected

- **WHEN** the value names the second root node and the panel opens
- **THEN** that node's option is active

### Requirement: Active option stays in view

Moving the active option SHALL scroll the tree only as far as needed to reveal it; an active option already in view MUST NOT scroll the list. Hovering an enabled option SHALL make it active, with or without an enclosing form field, and disabled options SHALL ignore hover.

#### Scenario: Navigating inside the visible area

- **WHEN** the panel is open and the user presses Down three times while the options stay visible
- **THEN** the scroll position of the tree does not change

#### Scenario: Hover without a form field

- **WHEN** a tree-select has no enclosing `kbq-form-field` and the user hovers an option in the open panel
- **THEN** the option gets the `kbq-focused` class

### Requirement: Vertical navigation in the open panel

With the panel open, Up and Down SHALL move the active option to the previous or next enabled rendered option without wrapping around. Home and End SHALL activate the first and last enabled option and prevent the key's default action. PageUp and PageDown SHALL move by one visible page of options and stop at the first or last one. Nodes inside collapsed branches MUST NOT be navigated to.

#### Scenario: Home and End

- **WHEN** the panel is open and the user presses Home, then End
- **THEN** the first and then the last rendered option becomes active, and both keys' default actions are prevented

#### Scenario: Last option reached

- **WHEN** the last rendered option is active and the user presses Down
- **THEN** it stays active and keeps the focus indicator

### Requirement: Expanding and collapsing from the keyboard

With the panel open, Right SHALL expand the active collapsed branch and, on an expanded branch, move to its first enabled child. Left SHALL collapse the active expanded branch and otherwise move to the closest enabled ancestor. Both keys SHALL prevent their default action, and with a search field shown focus SHALL return to that field.

#### Scenario: Left on a leaf

- **WHEN** a search query shows `Documents > angular > src > core`, `core` is active and the user presses Left
- **THEN** `src` becomes active and the search field keeps focus

#### Scenario: Right on a branch

- **WHEN** a collapsed branch is active and the user presses Right
- **THEN** the branch expands, the active option stays the same and the search field has focus again

### Requirement: Selection follows the keyboard in single mode

In single-selection mode with `autoSelect` left on, Up and Down in the open panel SHALL select the newly active option at once and emit `selectionChange`, keeping the panel open. Home, End, PageUp and PageDown SHALL move the active option without selecting it. Enter or Space with an active option SHALL close the panel, move focus to the tree-select and prevent the key's default action, without changing the value.

#### Scenario: Arrow down in an open single tree-select

- **WHEN** the panel of a single tree-select is open and the user presses Down
- **THEN** the next option becomes active and becomes the value, and the panel stays open

#### Scenario: Enter after navigating

- **WHEN** the user has moved to an option with Down and presses Enter
- **THEN** the panel closes, the tree-select has focus and the value is that option's value

### Requirement: Explicit selection without autoSelect

With `autoSelect` set to `false` in single-selection mode, Up and Down in the open panel MUST NOT select the option they move to, and Enter or Space SHALL select the active option without closing the panel; the selected option MUST NOT be deselected this way. In multiple-selection mode `autoSelect` SHALL always be off.

#### Scenario: Enter with autoSelect off

- **WHEN** `autoSelect` is `false`, the user moves to an option with Down and presses Enter
- **THEN** that option becomes the value and the panel stays open

### Requirement: Toggling options from the keyboard in multiple mode

In multiple-selection mode, Enter or Space SHALL toggle the active option, or activate the select-all row when it is active, and the panel SHALL stay open. Shift with Up or Down SHALL move the active option and give the newly active option the selection state of the option it left.

#### Scenario: Space on an option

- **WHEN** the panel of a multiple tree-select is open, an unselected option is active and the user presses Space
- **THEN** the option becomes selected and the panel stays open

#### Scenario: Shift with an arrow

- **WHEN** a selected option is active and the user presses Shift+Down
- **THEN** the next option becomes active and selected

### Requirement: Arrow keys change the value of a closed single tree-select

While a closed single tree-select has focus, Up and Down SHALL select the previous or next enabled rendered option without opening the panel, starting from the current value, or from the first option when nothing is active, and stopping at the first or last option without wrapping. Each step SHALL count as a change made by the user, with one `selectionChange` per key press. Left and Right without Alt MUST do nothing.

#### Scenario: Stepping past a disabled option

- **WHEN** the third root option is the value, the fourth is disabled and the user presses Down
- **THEN** the fifth option becomes the value

#### Scenario: Continuing from a written value

- **WHEN** the form writes `Pictures` and the user presses Down on the closed tree-select
- **THEN** the next root node, `Documents`, becomes the value

#### Scenario: Horizontal arrows

- **WHEN** a closed single tree-select without a value has focus and the user presses Right and Left
- **THEN** the trigger still shows the placeholder

### Requirement: Typeahead

Without a projected search field, characters typed in quick succession SHALL activate the next enabled rendered option whose label starts with them, ignoring case and wrapping around the list. On a closed single tree-select this SHALL also select that option. On a closed multiple tree-select typing MUST do nothing. When a search field is projected at initialization, typeahead MUST be off.

#### Scenario: Typing on a closed single tree-select

- **WHEN** a closed single tree-select has focus and the user types the first letters of a rendered option's label
- **THEN** that option becomes the value without opening the panel

#### Scenario: Typing on a closed multiple tree-select

- **WHEN** a closed multiple tree-select has focus and the user types a letter
- **THEN** neither the value nor the panel changes

### Requirement: Single selection by pointer

In single-selection mode, clicking an enabled, selectable option SHALL make its node's value the tree-select's value, close the panel and move focus to the tree-select. Clicking the option that is already selected SHALL select it again and emit `selectionChange` again.

#### Scenario: Picking an option

- **WHEN** the user clicks an option in an open single tree-select
- **THEN** the option's value becomes the value, the option gets the `kbq-selected` class on the next open
- **AND** the panel closes and the tree-select has focus

#### Scenario: Picking another option

- **WHEN** one option is selected and the user picks another one
- **THEN** only the new option is selected

### Requirement: Multiple selection

With `multiple` set, or with `multiline` set on its own, the tree-select SHALL hold an array of values. Clicking an enabled option SHALL toggle it, the panel SHALL stay open, and every option SHALL render a pseudo-checkbox unless the projected tree sets a selection mode of its own.

#### Scenario: Toggling an option

- **WHEN** the user clicks an option of an open multiple tree-select twice
- **THEN** the value is first that option's value in an array and then `[]`
- **AND** the panel is still open

#### Scenario: Checkboxes

- **WHEN** the panel of a multiple tree-select opens
- **THEN** every option contains a `kbq-pseudo-checkbox`

### Requirement: Selection mode and value type

Changing `multiple` after the tree-select has initialized SHALL throw "Cannot change `multiple` mode of select after initialization.", and so SHALL changing the multiplicity of the projected tree's own `multiple` input; switching that input between `checkbox` and `keyboard` SHALL only change whether checkboxes render. In multiple-selection mode a truthy value that is not an array SHALL throw "Value must be an array in multiple-selection mode.".

#### Scenario: Toggling multiple at runtime

- **WHEN** the binding of `multiple` on the tree-select changes after the first render
- **THEN** the tree-select throws the `multiple` mode error

#### Scenario: Writing a string to a multiple tree-select

- **WHEN** the form control of a multiple tree-select is set to a string
- **THEN** the tree-select throws the array error

### Requirement: Disabled and non-selectable options

An option disabled through its own `disabled` input, through the tree control's `isDisabled` or through a disabled tree MUST NOT be selected by click or keyboard, and clicking it MUST leave the panel open. An option with `selectable` set to `false` SHALL stay navigable and expandable but MUST NOT be selected by user interaction.

#### Scenario: Clicking a disabled option

- **WHEN** the user clicks a disabled option in an open single tree-select
- **THEN** the value does not change and the panel stays open

### Requirement: Value and selection accessors

`value()` SHALL return the tree control's `getValue` of the selected node in single-selection mode, or `undefined` when nothing is selected, and an array of those values in multiple-selection mode. `selected` SHALL return the selected data node or nodes, and `empty()` SHALL report whether nothing is selected. The value is read-only; it is set through Angular forms.

#### Scenario: Reading the value

- **WHEN** the user picks `rootNode_1` and then `Documents` in a multiple tree-select
- **THEN** `value()` returns `['rootNode_1', 'Documents']`

### Requirement: Values are matched by the tree control

A written value SHALL select the data nodes whose `getValue` the tree control's `compareValues` matches with it, strict equality by default, searching all data nodes including those in collapsed branches. A value that matches no node SHALL leave nothing selected for it, while the form control keeps the value it holds.

#### Scenario: Custom comparison

- **WHEN** `getValue` returns the node, `compareValues` compares names and `ngModel` writes `{ name: 'rootNode_1' }`
- **THEN** `selected` is the `rootNode_1` node

#### Scenario: Node in a collapsed branch

- **WHEN** a multiple tree-select is written `['Documents', 'Tutorial']` while `Downloads` is collapsed
- **THEN** both nodes are selected and both appear as tags

#### Scenario: Falsy node value

- **WHEN** `getValue` returns `0` for a node and the form writes `0`
- **THEN** `value()` is `0` and the trigger shows that node

### Requirement: Values written by code are silent

A value written through `formControl`, `formControlName` or `ngModel` SHALL select the matching nodes and MUST NOT emit `selectionChange`, report a value back to the form or mark the control dirty, also when the closed single tree-select moves its active option onto the written node.

#### Scenario: Form writes a value

- **WHEN** the bound form control's value is set in code
- **THEN** the matching option is shown as selected
- **AND** no `selectionChange` fires and the control stays pristine

### Requirement: Value written ahead of its data

A value written before the tree holds every node it names SHALL be kept and applied again whenever the data is replaced, selecting each node as it arrives, until all of them are found or the user changes the selection. Replacing the data with equal nodes SHALL keep the selection without reporting anything to the form or emitting `selectionChange`.

#### Scenario: Data arrives after the value

- **WHEN** the data source is empty, the form writes `Applications` and the data then arrives
- **THEN** `value()` is `Applications` and the control is still pristine

#### Scenario: User picks before the data is complete

- **WHEN** a written value names a node that is missing, the user picks another option, and the full data then arrives
- **THEN** the user's pick stays the value

#### Scenario: Data reloaded with equal nodes

- **WHEN** a value is selected and the data source is replaced with equal nodes
- **THEN** the value is unchanged, `valueChanges` emits nothing and `selectionChange` does not fire

### Requirement: Order of values in multiple mode

A value written in multiple-selection mode SHALL be ordered by the position of its nodes in the data, collapsed branches included, with nodes missing from the data last. A `sortComparator(a, b, nodes)`, which receives two data nodes and every data node in panel order, SHALL replace that order. Nodes the user selects SHALL be appended in the order they were selected.

#### Scenario: Written value

- **WHEN** the form writes `['Applications', 'Sun', 'rootNode_1']`
- **THEN** `value()` and the tags are `rootNode_1`, `Sun`, `Applications`

#### Scenario: User picks

- **WHEN** `rootNode_1`, `Documents` and `Applications` are selected and the user then selects `November` inside `Downloads`
- **THEN** the tags are `rootNode_1`, `Documents`, `Applications`, `November`

### Requirement: Writing an empty value clears the selection

Writing `null` or `undefined`, including by resetting the form control, or `[]` in multiple-selection mode SHALL clear the selection and show the placeholder, as long as no node's value matches the written empty value.

#### Scenario: Setting null

- **WHEN** a value is selected and the form writes `null`
- **THEN** no option is selected and the trigger no longer shows the value

### Requirement: Change notification for user changes

A change made by the user — picking or toggling an option, the keyboard, removing a tag, the cleaner or "select all" — SHALL update `value()` and pass the new value to the bound form control before `selectionChange` is emitted, and SHALL mark the control dirty.

#### Scenario: Bound value is current inside the handler

- **WHEN** the user picks an option and a `selectionChange` handler reads the `ngModel` property
- **THEN** the property already holds the new value

### Requirement: Change event payload

`selectionChange` SHALL emit a `KbqTreeSelectChange` whose `source` is the tree-select. For a picked option `value` SHALL be the `KbqTreeOption`; for "select all" it SHALL be the first changed option with `values` holding every changed option; for the cleaner it SHALL be `null` with `values` holding the removed data nodes; for a removed tag it SHALL be the option, or the raw value when the node has no rendered option. `isUserInput` SHALL always be `false`.

#### Scenario: Cleaner event

- **WHEN** the cleaner removes `Documents` and keeps a disabled `Downloads`
- **THEN** one `selectionChange` fires with `value` `null` and `values` holding the `Documents` node

### Requirement: Angular forms

The tree-select SHALL work as a form control with `formControl`, `formControlName` and `ngModel`, and inside a custom value accessor without a form directive of its own.

#### Scenario: ngModel

- **WHEN** the tree-select is bound with `[(ngModel)]` and the user picks an option
- **THEN** the bound property holds the option's value

### Requirement: Touched and dirty state

The tree-select SHALL mark its form control touched when it loses focus while the panel is closed and each time the panel closes. A disabled tree-select MUST NOT mark it touched on blur. Only changes made by the user SHALL mark the control dirty.

#### Scenario: Blur while the panel is open

- **WHEN** the user opens the panel and the host blurs
- **THEN** the control is not touched until the panel closes

#### Scenario: Programmatic value

- **WHEN** the form control's value is set in code
- **THEN** the control stays pristine

### Requirement: Disabled tree-select

When disabled through `disabled` or through its form control, the tree-select SHALL get the `kbq-disabled` class, `aria-disabled="true"`, a `disabled` attribute and `tabindex="-1"`, MUST NOT open and MUST NOT react to the keyboard. While enabled it MUST NOT carry `aria-disabled`.

#### Scenario: Disabling through the form control

- **WHEN** the bound form control is disabled
- **THEN** the tree-select has `aria-disabled="true"` and `tabindex="-1"`
- **AND** Down on the closed tree-select leaves the value unchanged

#### Scenario: Re-enabling

- **WHEN** the disabled form control is enabled again
- **THEN** the tree-select has `tabindex="0"` and opens on click

### Requirement: Error state

With a form directive bound, the tree-select SHALL be in error state when its control is invalid and either touched or in a submitted form, unless the `errorStateMatcher` input or an injected `ErrorStateMatcher` decides otherwise; the input wins. In error state it SHALL get the `kbq-invalid` class and `aria-invalid="true"`, and its arrow and tags SHALL use the error color, whatever the control's validity.

#### Scenario: Untouched invalid control

- **WHEN** the control is invalid and has not been touched
- **THEN** the tree-select has no `kbq-invalid` class

#### Scenario: Parent form submitted

- **WHEN** the control is invalid and its parent form is submitted
- **THEN** the tree-select has `kbq-invalid`

#### Scenario: Matcher on a valid control

- **WHEN** an injected matcher reports an error for a valid control
- **THEN** `errorState()` is `true` and the trigger uses the error color

### Requirement: Required flag

The `required` input SHALL be reflected as `aria-required`. The tree-select itself MUST NOT add a validator; whether an empty value is invalid is decided by the validators of the bound form control.

#### Scenario: Required flag

- **WHEN** `required` is set on the tree-select
- **THEN** it has `aria-required="true"`, and `aria-required="false"` otherwise

### Requirement: Trigger text

When nothing is selected, the trigger SHALL show the `placeholder`, or a non-breaking space when there is no placeholder. In single-selection mode it SHALL otherwise show the tree control's `getViewValue` of the selected node, which is also readable as `triggerValue`; `triggerValue` SHALL be an empty string when nothing is selected.

#### Scenario: Placeholder

- **WHEN** a tree-select with `placeholder="Food"` has no value
- **THEN** the trigger shows "Food"

#### Scenario: Selected node label

- **WHEN** the node `rootNode_1` is selected
- **THEN** the trigger shows "rootNode_1"

### Requirement: Tags for multiple values

In multiple-selection mode the trigger SHALL show one tag per selected node, labelled with the tree control's `getViewValue`, in value order, including nodes inside collapsed branches. A tag SHALL be disabled when its node is disabled or the tree-select is disabled.

#### Scenario: Collapsing a branch

- **WHEN** `November` inside `Downloads` is selected and `Downloads` is collapsed
- **THEN** the `November` tag stays in the trigger

### Requirement: Removing a value from its tag

Each built-in tag of an enabled node in an enabled tree-select SHALL carry a remove control with `role="button"`, `tabindex="0"` and the `a11y.remove` text of the locale as its name, operable by click, Enter and Space. Using it SHALL deselect the node, report the change and MUST NOT toggle the panel. Tags of disabled nodes, and all tags of a disabled tree-select, MUST NOT have one.

#### Scenario: Removing with the keyboard

- **WHEN** a remove control has focus and the user presses Enter
- **THEN** its value is removed from the form control's value

#### Scenario: Disabled node

- **WHEN** a node disabled through its option input is selected
- **THEN** its tag has no remove control, while the tags of enabled nodes do

### Requirement: Focus after removing a tag

After a tag is removed through its remove control, focus SHALL move to the remove control that took its place, or to the last one when the removed tag was last, or to the tree-select when no remove control is left.

#### Scenario: Next tag

- **WHEN** two removable tags are shown and the user removes the first one from the keyboard
- **THEN** the remaining remove control has focus

#### Scenario: Last tag

- **WHEN** the only removable tag is removed from the keyboard
- **THEN** the tree-select has focus

### Requirement: Hidden-items counter

With `multiple` set and `multiline` off, when the tags do not fit in one row the trigger SHALL show a counter of the values left out, from `select.hiddenItemsText` of the locale (`+{{ number }}` in every shipped locale). The `hiddenItemsText` input SHALL override the locale text, also across locale changes, and `hiddenItemsTextFormatter` SHALL replace the substitution. The count SHALL be readable as `hiddenItems()` and SHALL be recounted on window resize and when the tags change.

#### Scenario: Locale text

- **WHEN** values are hidden and the locale switches to `en-US`
- **THEN** the counter shows the `en-US` text with `{{ number }}` replaced by `hiddenItems()`

#### Scenario: Custom text

- **WHEN** `hiddenItemsText` is set and the locale changes
- **THEN** the counter keeps showing the custom text

### Requirement: No counter for custom triggers and multiline

The hidden-items counter MUST NOT be shown when a `kbq-select-trigger` or `kbq-select-matcher` is projected, when nothing is selected, or in multiline mode.

#### Scenario: Multiline tree-select

- **WHEN** a multiline tree-select has more tags than fit in one row
- **THEN** no counter is shown

### Requirement: Multiline trigger

With `multiline` set, the tree-select SHALL use multiple selection, wrap its tags onto as many rows as they need and get the `kbq-select_multiline` class. When the trigger is taller than the room for the panel on either side, the panel SHALL be anchored just below the trigger's first row and drawn over the other rows; a single-row trigger and a trigger shorter than the panel SHALL keep the default positions.

#### Scenario: Trigger taller than the available space

- **WHEN** the panel of a ten-row multiline trigger fits neither below nor above it
- **THEN** the panel opens one gap below the first row, over the remaining rows

#### Scenario: Closing drops the anchor

- **WHEN** the anchored panel closes
- **THEN** the next open uses only the below and above positions

### Requirement: Custom trigger content

A projected `kbq-select-trigger` element, or element with that attribute, SHALL replace only the value area of the trigger and SHALL be rendered only while a value is selected; the placeholder, cleaner and arrow stay.

#### Scenario: Custom label for the value

- **WHEN** a `kbq-select-trigger` showing `triggerValue` reversed is projected and `Downloads` is selected
- **THEN** the trigger shows the reversed label instead of "Downloads"

### Requirement: Custom matcher

A projected `kbq-select-matcher` SHALL replace the whole trigger content, including the placeholder, cleaner and arrow, and SHALL always be rendered. With its `useDefaultHandlers` input set to `false`, the tree-select MUST NOT react to clicks, keys, focus or blur on its host; the consumer drives it through its methods.

#### Scenario: Default handlers off

- **WHEN** `useDefaultHandlers` is `false` and the user clicks the tree-select or presses Down on it
- **THEN** the panel does not toggle and no key is handled

### Requirement: Custom tag template

In multiple-selection mode an `<ng-template #kbqSelectTagContent>` inside the tree-select SHALL replace the markup of every tag. It SHALL be rendered once per selected node with `$implicit` holding the node's `value`, `viewValue` and `disabled` flag and `select` holding the tree-select, whose `onRemoveSelectedOption(option, event)` removes that value.

#### Scenario: Custom tags

- **WHEN** a `#kbqSelectTagContent` template is declared and two values are selected
- **THEN** the trigger renders the template twice, once per value

### Requirement: Cleaner visibility

A `kbq-cleaner` placed as a direct child of the tree-select SHALL be shown only while the tree-select is enabled, has a value, and holds at least one selected node that `clearPredicate` accepts.

#### Scenario: Only disabled nodes left

- **WHEN** the only selected nodes are disabled and the default predicate is used
- **THEN** the cleaner is not rendered

### Requirement: Clearing the value

Activating the cleaner SHALL deselect every selected node that `clearPredicate` accepts and emit one `selectionChange`, then move focus to the tree-select without toggling the panel. By default it SHALL keep nodes disabled through the tree, the tree control's `isDisabled` or a rendered option's `disabled` input. A single tree-select SHALL end with `undefined`; a multiple one SHALL keep the values that were not cleared, or end with `[]`.

#### Scenario: Clearing a multiple tree-select with a disabled node

- **WHEN** `Documents` and a disabled `Downloads` are selected and the user clicks the cleaner
- **THEN** the form control's value is `['Downloads']`

#### Scenario: Disabled node in a collapsed branch

- **WHEN** the selection holds `Documents` and `Tutorial`, which the tree control disables and whose branch is collapsed
- **THEN** after clearing the value is `['Tutorial']`

#### Scenario: Clearing a single tree-select

- **WHEN** a single tree-select has a value and the user clicks the cleaner
- **THEN** the trigger shows the placeholder

### Requirement: Clear predicate

`clearPredicate` SHALL receive each selected data node and decide whether the cleaner removes it; it defaults to the `clearPredicate` of `KBQ_TREE_SELECT_OPTIONS`, and then to keeping disabled nodes. Binding a non-function SHALL throw "`clearPredicate` must be a function.". A predicate that throws for a node SHALL keep that node. Writing a value or resetting the form MUST NOT consult the predicate.

#### Scenario: Clearing everything

- **WHEN** `clearPredicate` returns `true` for every node and the user clicks the cleaner
- **THEN** disabled nodes are deselected too and the value is `[]`

#### Scenario: Invalid predicate

- **WHEN** `clearPredicate` is bound to a string
- **THEN** change detection throws that error

### Requirement: Select-all row

With `selectAll` set in multiple-selection mode, the tree SHALL render a "select all" row above its nodes, labelled with `select.selectAll` from the locale and led by a pseudo-checkbox. The row SHALL be the first item of keyboard navigation. It MUST NOT be rendered in single-selection mode or while the tree renders no node, for example when a search matches nothing.

#### Scenario: Row is rendered

- **WHEN** a multiple tree-select with `selectAll` opens with the default locale
- **THEN** the first row is "Выбрать все" and it leads the navigable list

#### Scenario: Search matches nothing

- **WHEN** the search query matches no node
- **THEN** the row is not rendered

### Requirement: Select-all scope and state

Without a search query "select all" SHALL cover every data node, collapsed branches included; with a query it SHALL cover the rendered nodes, that is the matches and their ancestors. Disabled and non-selectable nodes MUST be left out. The row SHALL be unchecked, indeterminate or checked by how many covered nodes are selected, with `aria-checked` `false`, `mixed` or `true`; with nothing covered it SHALL be unchecked and the tree's `allOptionsSelected` `false`.

#### Scenario: Partial selection

- **WHEN** only `Tutorial` is selected
- **THEN** the row is indeterminate

#### Scenario: Disabled nodes ignored

- **WHEN** every node except a disabled `Tutorial` is selected
- **THEN** the row is checked

#### Scenario: Every node disabled

- **WHEN** every node is disabled and `Tutorial` is selected
- **THEN** the row is unchecked and `allOptionsSelected` is `false`

### Requirement: Select-all action

Activating the row by click, Enter or Space, including Enter while the row is active and focus is in the search field, SHALL select every covered node unless all of them are selected, in which case it SHALL deselect them. Disabled nodes MUST NOT change. Each activation SHALL emit `selectionChange` when something changed, then `onSelectAll` with the selectable rendered options and `selected` telling whether all covered nodes are now selected.

#### Scenario: Collapsed branches

- **WHEN** a branch is collapsed and the user clicks the row
- **THEN** every node, including those in the collapsed branch, is selected

#### Scenario: Acting on search results

- **WHEN** the query `Tutorial` is active and the user clicks the row
- **THEN** the value holds `Downloads` and `Tutorial` only

#### Scenario: Second click

- **WHEN** the user clicks the row twice
- **THEN** the value is `[]` and `onSelectAll` has fired twice, with `selected` `true` and then `false`

### Requirement: Select all from the keyboard

While the panel of a multiple tree-select is open, Ctrl+A or Cmd+A SHALL select every covered node and emit `onSelectAll`, also when nothing changed. A repeated press SHALL keep them selected unless `selectAllToggle` or `selectAll` is set, which makes it deselect them. In a non-empty search field whose text is not fully selected, the press SHALL select the text only. A `selectAllHandler` SHALL replace the shortcut; a non-function SHALL throw.

#### Scenario: Default shortcut

- **WHEN** some nodes are selected and the user presses Ctrl+A
- **THEN** every enabled node becomes selected, collapsed branches included

#### Scenario: Toggle with selectAllToggle

- **WHEN** `selectAllToggle` is set and the user presses Ctrl+A twice
- **THEN** the value holds every node and then is `[]`

#### Scenario: Text in the search field

- **WHEN** the search field contains partly selected text and the user presses Ctrl+A
- **THEN** the field's text is fully selected, nothing is selected in the tree and `onSelectAll` does not fire

### Requirement: Search field

A `kbq-form-field` with `kbqSelectSearch` wrapping a `kbqInput` bound to a form control SHALL render above the tree, outside its scrollable area. The tree-select MUST NOT filter nodes itself; the consumer filters the tree, for example through the tree control's `filterNodes`. The search control SHALL be reset when the panel closes. Projecting the search without `kbqInput` or without a form control SHALL throw.

#### Scenario: Consumer filters the tree

- **WHEN** the consumer filters the tree on the search control's changes and the user types "App"
- **THEN** the tree shows only `Applications`

#### Scenario: Closing resets the search

- **WHEN** the user types a query and closes the panel
- **THEN** the search control's value is reset

### Requirement: Keys in the search field

With focus in the search field, Up, Down, Enter, Left and Right SHALL act on the tree while focus returns to the field; Left and Right therefore do not move the caret. PageUp and PageDown SHALL move the active option and leave focus on it. Home, End and Space SHALL stay in the field. Escape SHALL clear a non-empty query and keep the panel open, and SHALL close it when the query is empty. A selection SHALL return focus to the field.

#### Scenario: Escape with a query

- **WHEN** the search field holds a query and the user presses Escape
- **THEN** the query is cleared and the panel stays open

#### Scenario: Escape without a query

- **WHEN** the search field is empty and the user presses Escape
- **THEN** the panel closes

### Requirement: Empty search result

While the search field holds a non-empty query and the tree renders no node, the tree-select SHALL render a projected `[kbq-select-search-empty-result]` element inside the panel content. The tree-select MUST NOT provide default text for it.

#### Scenario: Query matches nothing

- **WHEN** the query matches no node and a `kbq-select-search-empty-result` element is projected
- **THEN** the tree renders no option and that element is shown

### Requirement: Hiding search for short trees

With `searchMinOptionsThreshold` set, either as an input or through `KBQ_TREE_SELECT_OPTIONS`, the search field SHALL be shown only when the number of rendered nodes, not counting the select-all row, is at least the threshold, or the field holds a query. `'auto'` SHALL mean 10. Without a threshold the search SHALL always be shown.

#### Scenario: Fewer rendered nodes than the threshold

- **WHEN** the threshold is 4 and the tree renders one collapsed branch
- **THEN** the search field is not shown

#### Scenario: Query keeps the search visible

- **WHEN** the threshold is 3 and a query narrows the tree to one node
- **THEN** the search field stays visible

### Requirement: Footer

A projected `kbq-select-footer` element SHALL render in the panel below the scrollable tree, outside it. Clicks inside the footer MUST NOT close the panel, and Tab pressed inside the panel, the footer included, SHALL close it as described for the keyboard.

#### Scenario: Footer is rendered

- **WHEN** a `kbq-select-footer` is projected and the panel opens
- **THEN** the footer is shown below the tree

### Requirement: Panel position

The panel SHALL open below the trigger, aligned to its start edge, and SHALL open above it when it does not fit below; the chosen side SHALL stay fixed while the panel is open. Inside a form field the panel SHALL be positioned against the form field's container. The gap between the trigger and the panel SHALL belong to the overlay pane, so a click there does not reach the page. A panel overflowing the viewport horizontally SHALL be shifted and narrowed to stay inside it.

#### Scenario: Not enough room below

- **WHEN** the trigger is near the bottom of the viewport
- **THEN** the panel opens above the trigger

#### Scenario: Overflow on the left

- **WHEN** the form field starts left of the viewport, in left-to-right or right-to-left layout
- **THEN** the panel's left edge stays inside the viewport

### Requirement: Panel follows page scroll and overlay layers

By default the open panel SHALL follow the trigger when the page scrolls; a strategy provided through `KBQ_SELECT_SCROLL_STRATEGY` SHALL replace this. A tree-select inside a `kbqOverlayLayer` element SHALL render its panel into that layer.

#### Scenario: Overlay layer

- **WHEN** a tree-select inside a `kbqOverlayLayer` opens
- **THEN** its overlay pane is rendered inside that element's overlay layer

### Requirement: Custom scrollbar

The scrollable tree SHALL use the library's custom scrollbar: the native scrollbar hidden, the track shown when the panel opens and then faded, shown again on hover, and no scrollbar when the tree does not overflow. Clicking the scrollbar thumb MUST NOT close the panel.

#### Scenario: Track on open

- **WHEN** a panel whose tree overflows opens
- **THEN** the scrollbar track becomes visible and then fades out

### Requirement: Panel width

With `panelWidth` unset, `null` or `''`, the panel SHALL grow with its content, never narrower than the trigger or `panelMinWidth` (200 px by default), and stop growing at `panelMaxWidth` or the `--kbq-panel-size-width-max` token (640 px). `'auto'` SHALL match the trigger but keep `panelMinWidth`. A number or another CSS width SHALL be used exactly. With a search field, a content-sized panel SHALL keep the width measured on open.

#### Scenario: Fixed width

- **WHEN** `panelWidth` is 344
- **THEN** the overlay pane is 344 px wide

#### Scenario: Matching the trigger

- **WHEN** `panelWidth` is `'auto'` and the form field is 150 px wide
- **THEN** the pane is 200 px wide

#### Scenario: Width locked for search

- **WHEN** a content-sized tree-select with search opens and its panel measures 412 px
- **THEN** the pane keeps a width of 412 px

### Requirement: Panel height

`panelMaxHeight` SHALL cap the height of the scrollable tree through the `--kbq-select-panel-size-max-height` token on the panel, 256 px by default; the search field and the footer add to it. Zero SHALL be an explicit height, a negative value SHALL count as zero, and a value that is not a number SHALL leave the default in place.

#### Scenario: Custom maximum height

- **WHEN** `panelMaxHeight` is 300
- **THEN** the computed `max-height` of the scrollable tree is 300 px

#### Scenario: Negative height

- **WHEN** `panelMaxHeight` is -10
- **THEN** the token on the panel is `0px`

### Requirement: Panel classes

The panel element SHALL have the `kbq-tree-select__panel` class, the color class of the enclosing form field, and the classes of `panelClass` in its string, array, Set or object form.

#### Scenario: Extra classes

- **WHEN** `panelClass` is `['custom-one', 'custom-two']`
- **THEN** the panel element has both classes

#### Scenario: Form field color

- **WHEN** the enclosing form field has the error color
- **THEN** the panel has the `kbq-error` class

### Requirement: Application-wide defaults

`KBQ_TREE_SELECT_OPTIONS`, usually provided with `kbqTreeSelectOptionsProvider()`, SHALL supply defaults for `panelWidth`, `panelMinWidth`, `panelMaxWidth`, `panelMaxHeight`, `searchMinOptionsThreshold` and `clearPredicate`. An input bound on a tree-select SHALL win over the provided default, and an explicit `null` for `panelMinWidth`, `panelMaxWidth` or `panelMaxHeight` SHALL be honored rather than replaced by the built-in default.

#### Scenario: Attribute wins over the provider

- **WHEN** the provider sets `panelMaxHeight: 400` and a tree-select binds `panelMaxHeight` to 500
- **THEN** that tree-select's token is `500px`

#### Scenario: Explicit null minimum

- **WHEN** the provider sets `panelMinWidth: null` and the trigger is 100 px wide
- **THEN** the pane's minimum width is 100 px

### Requirement: Combobox semantics

The tree-select SHALL have `role="combobox"`, an `aria-expanded` that follows the panel, and an `aria-controls` pointing at the panel's id only while the panel is open. It MUST NOT have `aria-haspopup` or `aria-activedescendant`.

#### Scenario: Closed tree-select

- **WHEN** the panel is closed
- **THEN** the tree-select has `aria-expanded="false"` and no `aria-controls`, `aria-haspopup` or `aria-activedescendant`

#### Scenario: Open panel

- **WHEN** the panel is open
- **THEN** `aria-expanded` is `true` and `aria-controls` names the element holding the panel

### Requirement: Accessible name

The tree-select SHALL be named through `aria-labelledby` by its `aria-labelledby` input, or else by the `kbq-label` of its form field, following a label added or removed later; an empty-string input suppresses the form-field label. Without a label reference, the `aria-label` input, or else the `placeholder`, SHALL be written as `aria-label`. The form-field label SHALL be a `span` without `for`.

#### Scenario: Form-field label

- **WHEN** the tree-select is inside a form field with the label "Dish"
- **THEN** its `aria-labelledby` is the label's id and it has no `aria-label`

#### Scenario: Placeholder as the last resort

- **WHEN** the tree-select has no label and no `aria-label` but has the placeholder "Food"
- **THEN** its `aria-label` is "Food" and axe reports no violations

### Requirement: Tree semantics in the panel

The projected tree SHALL have `role="tree"` with `aria-multiselectable` in multiple-selection mode. Every option SHALL have `role="treeitem"`, `tabindex="-1"` and a unique id, with `aria-level`, `aria-expanded` on branches, `aria-disabled` when disabled, and `aria-selected` in single-selection mode or `aria-checked` when it shows a checkbox. The select-all row SHALL be a `treeitem` with the row's `aria-checked`.

#### Scenario: Option ids

- **WHEN** two tree-selects are opened one after the other
- **THEN** every option has an id starting with `kbq-tree-option` that no other option shares

### Requirement: Tab order

The tree-select SHALL be focusable with `tabindex="0"` by default, SHALL use the `tabIndex` input when it is an integer or `null`, keeping the last valid value otherwise, and SHALL have `tabindex="-1"` while disabled.

#### Scenario: Custom tab index

- **WHEN** `tabIndex` is 3
- **THEN** the tree-select has `tabindex="3"`

### Requirement: Host id and classes

The host SHALL carry the `id` input, or a generated `kbq-tree-select-<n>` id, and the classes `kbq-tree-select`, `kbq-select_multiple` while `multiple` is set, `kbq-select_multiline`, `kbq-disabled` and `kbq-invalid` as described by their requirements.

#### Scenario: Generated id

- **WHEN** no `id` is bound
- **THEN** the host's `id` attribute equals `id()` and is not empty

### Requirement: Form-field container click

A click on the container of the enclosing form field SHALL focus the tree-select and MUST NOT open the panel.

#### Scenario: Clicking the field around a closed tree-select

- **WHEN** the panel is closed and the user clicks the form field's container outside the tree-select
- **THEN** the tree-select has focus and the panel stays closed

### Requirement: Localized strings

The strings the tree-select renders itself — the "select all" label (`select.selectAll`), the hidden-items counter (`select.hiddenItemsText`), the names of the tag remove controls (`a11y.remove`) and of the cleaner (`a11y.clear`) — SHALL follow the active locale, `ru-RU` by default, and SHALL fall back to the built-in text when the locale service supplies no section. `[localeOverrides]` SHALL override them for one tree-select.

#### Scenario: Switching the locale

- **WHEN** the application switches the locale to `en-US` while values are hidden
- **THEN** the counter uses the `en-US` `hiddenItemsText`

#### Scenario: Locale service without a select section

- **WHEN** the locale service returns no `select` section
- **THEN** the counter uses the `ru-RU` `hiddenItemsText`
