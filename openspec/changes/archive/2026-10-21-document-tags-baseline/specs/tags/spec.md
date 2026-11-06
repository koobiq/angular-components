# Spec Delta

## Purpose

Describes what `@koobiq/components/tags` guarantees to consumers: how a `kbq-tag` shows, selects, edits and asks to be removed, how a `kbq-tag-list` groups tags for keyboard, pointer and form use, and how an input with `kbqTagInputFor` turns typed or pasted text into tag requests.

## ADDED Requirements

### Requirement: Tag selectors and host classes

The tag SHALL match `kbq-tag`, `[kbq-tag]`, `kbq-basic-tag` and `[kbq-basic-tag]`, be exported as `kbqTag`, and always carry the `kbq-tag` class. A tag matched through `kbq-basic-tag` SHALL also carry `kbq-basic-tag`; any other tag SHALL carry `kbq-standard-tag` instead.

#### Scenario: Basic tag

- **WHEN** a `<kbq-basic-tag>` is rendered
- **THEN** its host has the classes `kbq-tag` and `kbq-basic-tag`

#### Scenario: Standard tag

- **WHEN** a `<kbq-tag>` is rendered
- **THEN** its host has `kbq-tag` and `kbq-standard-tag`, and not `kbq-basic-tag`

### Requirement: Tag value

A tag's `value` SHALL be the bound `[value]` when one is set, and otherwise the trimmed text content of the tag host. The tag list, the tag input's `distinct` check and the form value all read this `value`.

#### Scenario: Bound value

- **WHEN** a tag is rendered with `[value]="item"`
- **THEN** its `value` is `item`, whatever text it shows

#### Scenario: Text fallback

- **WHEN** a tag has no `[value]` and shows the text " Alpha "
- **THEN** its `value` is `Alpha`

### Requirement: Tag color

The tag SHALL carry the class `kbq-<color>` for its `color` input and SHALL default to `kbq-contrast-fade` while `color` is unset or falsy. Changing `color` SHALL replace the previous color class.

#### Scenario: Default color

- **WHEN** a tag is rendered without `color`
- **THEN** its host has the class `kbq-contrast-fade`

#### Scenario: Changing the color

- **WHEN** a tag rendered with `color="primary"` is re-bound to `color="error"`
- **THEN** its host has `kbq-error` and no longer has `kbq-primary`

### Requirement: Disabled tag

A tag SHALL be disabled when its own `disabled` input is true or when its tag list is disabled. A disabled tag SHALL carry `disabled="true"` and the class `kbq-disabled`, MUST NOT have a `tabindex` attribute, SHALL prevent the default action of clicks, and MUST ignore its own keyboard handling, `focus()`, `select()`, `deselect()` and `toggleSelected()`.

#### Scenario: Disabling a tag

- **WHEN** a tag's `disabled` input becomes true
- **THEN** its host has `disabled="true"` and `kbq-disabled`, and no `tabindex` attribute

#### Scenario: Click on a disabled tag

- **WHEN** the user clicks a disabled tag
- **THEN** the click event's default action is prevented

#### Scenario: Selecting a disabled tag in code

- **WHEN** `select()` is called on a disabled, selectable tag
- **THEN** the tag stays unselected and no `selectionChange` is emitted

### Requirement: Tag tab order

A tag SHALL have `tabindex="-1"` by default. A selectable tag outside a tag list SHALL have `tabindex="0"` instead. A tab index other than `-1` set through the `tabindex` input or the `tabindex` property SHALL replace these defaults. Inside a tag list the tags SHALL keep `-1`, because the list is the tab stop.

#### Scenario: Standalone selectable tag

- **WHEN** a tag outside a tag list becomes selectable
- **THEN** its `tabindex` changes from `-1` to `0`

#### Scenario: Tag inside a list

- **WHEN** a tag is rendered inside a `kbq-tag-list`
- **THEN** it has `tabindex="-1"`

#### Scenario: Custom tab index

- **WHEN** a selectable standalone tag is given the tab index 2
- **THEN** it has `tabindex="2"`

### Requirement: Content slots

The tag SHALL render, in this order: content marked `kbqTagPrefix`, the text, the remove control, then content marked `kbqTagSuffix`, whatever their order in the template. `kbqTagPrefix` and `kbqTagSuffix` SHALL add the classes `kbq-tag-prefix` and `kbq-tag-suffix`; `kbqTagRemove` and `kbqTagEditSubmit` SHALL carry `kbq-tag-suffix` on their own.

#### Scenario: Slots declared out of order

- **WHEN** a tag's template declares a suffix icon, the label, a remove control and then a prefix icon
- **THEN** the rendered order is prefix, label, remove control, suffix

#### Scenario: Remove control as a suffix

- **WHEN** a tag contains `kbqTagRemove`
- **THEN** the remove control has the class `kbq-tag-suffix` without `kbqTagSuffix` being written

### Requirement: Content host classes

The tag SHALL carry `kbq-tag-with-avatar` while it contains a `kbqTagAvatar`, and `kbq-tag-with-trailing-icon` while it contains a `kbqTagTrailingIcon` or a `kbqTagRemove`. The avatar and trailing-icon directives SHALL add `kbq-tag-avatar` and `kbq-tag-trailing-icon` to their own hosts, and `kbqTagRemove` SHALL carry `kbq-tag-remove` and `kbq-tag-trailing-icon`.

#### Scenario: Tag with a remove control

- **WHEN** a tag contains `<i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>`
- **THEN** the tag has `kbq-tag-with-trailing-icon`
- **AND** the control has `kbq-tag-remove` and `kbq-tag-trailing-icon`

#### Scenario: Tag with an avatar

- **WHEN** a tag contains a `kbqTagAvatar`
- **THEN** the tag has `kbq-tag-with-avatar` and the avatar has `kbq-tag-avatar`

### Requirement: Long tag text stays on one line

The tag text SHALL stay on a single line and be cut with an ellipsis when the tag is narrower than its text.

#### Scenario: Text wider than the tag

- **WHEN** a tag's text is wider than the space the tag has
- **THEN** the text is shown on one line, ending in an ellipsis

### Requirement: Removal is a request

A tag MUST NOT remove itself from the DOM. Every removal path SHALL emit the `removed` output with `{ tag }`, and the consumer removes the tag from its data. `remove()` SHALL emit `removed` whenever the tag is removable, even when it is disabled.

#### Scenario: Programmatic removal

- **WHEN** `remove()` is called on a removable tag
- **THEN** `removed` emits `{ tag }` with that tag
- **AND** the tag stays rendered until the consumer drops it

#### Scenario: Programmatic removal of a non-removable tag

- **WHEN** `remove()` is called on a tag whose `removable` is false
- **THEN** `removed` does not emit

### Requirement: Removable state

A tag SHALL be removable by default. Its `removable` input set to false SHALL make it non-removable, and inside a tag list it SHALL also require the list's `removable`, which defaults to true. A tag's own `removable` set to false MUST stay in force when the list's `removable` changes. A removable tag SHALL carry `kbq-tag_removable`.

#### Scenario: List turns removal on

- **WHEN** a list with `[removable]="false"` holds a tag with `[removable]="false"` and another tag without the input
- **AND** the list's `removable` becomes true
- **THEN** only the tag without the input becomes removable

### Requirement: Remove control visibility

The `kbqTagRemove` control SHALL be rendered only while the tag is removable, not disabled and not being edited.

#### Scenario: Non-removable tag

- **WHEN** a tag's `removable` becomes false
- **THEN** its remove control is no longer rendered

#### Scenario: Disabled tag

- **WHEN** a tag becomes disabled, including through a form control that disables its list
- **THEN** its remove control is no longer rendered

### Requirement: Remove control activation

Clicking `kbqTagRemove` SHALL emit the tag's `removed` while the tag is removable and not disabled, and the click MUST NOT propagate. Enter and Space on the control SHALL prevent their default action, stop propagation and dispatch a click on the control, so that a `(click)` listener on the same element also runs.

#### Scenario: Click on the remove control

- **WHEN** the user clicks the remove control of a removable tag
- **THEN** `removed` emits once

#### Scenario: Remove control of a disabled tag

- **WHEN** a click reaches the remove control of a tag that has become disabled
- **THEN** `removed` does not emit

#### Scenario: Keyboard activation

- **WHEN** the remove control has focus and the user presses Enter or Space
- **THEN** a click is dispatched on the control and the tag's `removed` emits

### Requirement: Remove control semantics

The `kbqTagRemove` control SHALL have `role="button"`, an `aria-label` taken from its `aria-label` input or, without one, the localized `a11y.remove` string, and a `tabindex` taken from its `tabIndex` input, which defaults to `-1`.

#### Scenario: Defaults

- **WHEN** a remove control is rendered without inputs under the `ru-RU` locale
- **THEN** it has `role="button"`, `aria-label="Удалить"` and `tabindex="-1"`

#### Scenario: Own name and tab stop

- **WHEN** the control is given `aria-label="Remove Alpha"` and `[tabIndex]="0"`
- **THEN** it has that `aria-label` and `tabindex="0"`

### Requirement: Delete and Backspace on a standalone tag

On a focused, enabled tag outside a tag list, Delete and Backspace SHALL emit `removed` when the tag is removable, and SHALL prevent the key's default action. A non-removable tag MUST NOT emit.

#### Scenario: Delete on a removable tag

- **WHEN** a removable standalone tag has focus and the user presses Delete
- **THEN** `removed` emits once

#### Scenario: Backspace on a non-removable tag

- **WHEN** a standalone tag with `removable` false has focus and the user presses Backspace
- **THEN** `removed` does not emit

### Requirement: Destroyed event

A tag SHALL emit `destroyed` with `{ tag }` when it is destroyed, and SHALL cancel an edit in progress first.

#### Scenario: Tag leaves the view

- **WHEN** the condition rendering a tag becomes false
- **THEN** `destroyed` emits once

### Requirement: Which tags are selectable

A tag outside a tag list SHALL NOT be selectable unless its `selectable` input is true, and SHALL carry the class `kbq-tag_selectable` while it is. A tag inside a tag list SHALL be selectable while its own `selectable` or the list's `selectable` is true.

#### Scenario: Default standalone tag

- **WHEN** a standalone tag is rendered without `selectable`
- **THEN** it does not have `kbq-tag_selectable`

#### Scenario: Tag inside a list

- **WHEN** a tag without `selectable` is rendered inside a tag list with default inputs
- **THEN** it has `kbq-tag_selectable`

### Requirement: Standalone tag selection by pointer

Clicking an enabled, selectable tag outside a tag list SHALL toggle its selection and emit `selectionChange` with `isUserInput: true`, whatever modifier keys are held. Focus given by the mouse alone MUST NOT select the tag.

#### Scenario: Two clicks

- **WHEN** the user clicks a selectable standalone tag twice
- **THEN** it becomes selected and then unselected
- **AND** `selectionChange` emits `selected: true` and then `selected: false`, both with `isUserInput: true`

### Requirement: Standalone tag selection follows focus

An enabled, selectable tag outside a tag list SHALL become selected when it receives focus from the keyboard or from code, and SHALL become unselected when it loses focus. Both changes SHALL emit `selectionChange` with `isUserInput: false`.

#### Scenario: Focus and blur

- **WHEN** a selectable standalone tag is focused and then blurred
- **THEN** it is selected while focused and unselected after the blur

### Requirement: Space toggles a tag

On a focused, enabled tag, Space SHALL toggle the selection of a selectable tag with `isUserInput: true`, SHALL give the tag keyboard focus, and SHALL prevent the page from scrolling. A tag that is not selectable SHALL still take keyboard focus.

#### Scenario: Space twice on a selectable tag

- **WHEN** the user presses Space twice on a selectable tag
- **THEN** the tag becomes selected and then unselected, emitting `selectionChange` each time

#### Scenario: Space on a tag that is not selectable

- **WHEN** the user presses Space on a tag that is not selectable
- **THEN** the selection does not change and the tag has keyboard focus

### Requirement: Selection methods

`select()`, `deselect()` and `toggleSelected(isUserInput = false)` SHALL change the selection only of an enabled, selectable tag, and SHALL emit `selectionChange` only when the selected state actually changes. `toggleSelected()` SHALL return the resulting state. A tag that is selected SHALL carry the class `kbq-selected`.

#### Scenario: Selecting in code

- **WHEN** `select()` is called on an enabled, selectable tag
- **THEN** the tag has `kbq-selected` and `selectionChange` emits `selected: true, isUserInput: false`

#### Scenario: No change, no event

- **WHEN** `select()` is called on a tag that is already selected
- **THEN** `selectionChange` does not emit

### Requirement: Selected binding

A change of the `[selected]` binding SHALL set the tag's selected state even when the tag is not selectable, and SHALL emit `selectionChange` with `isUserInput: false` when the state changes. A change of any other input MUST NOT reapply the bound value, so a selection made by the user survives it.

#### Scenario: Binding selects a tag

- **WHEN** `[selected]` changes from false to true
- **THEN** the tag has `kbq-selected` and `selectionChange` emits once

#### Scenario: Binding matches the state

- **WHEN** the user has selected the tag and `[selected]` then changes to true
- **THEN** `selectionChange` does not emit

#### Scenario: Another input changes

- **WHEN** the user has selected a tag bound to `[selected]="false"` and its `removable` input then changes
- **THEN** the tag stays selected

#### Scenario: Initially selected tags in a list

- **WHEN** a tag list renders three tags whose `[selected]` is true, false and true
- **THEN** the first and third tags are selected after the list initializes

### Requirement: Editable state

A tag SHALL be editable while its `editable` input is true. A tag whose `editable` input is not bound SHALL follow the `editable` input of its tag list, which defaults to false; a bound value, including false, SHALL take precedence. An editable tag SHALL carry `kbq-tag_editable`.

#### Scenario: List turns editing on

- **WHEN** a list's `editable` becomes true and it holds a tag without `editable` and a tag with `[editable]="false"`
- **THEN** only the tag without the input becomes editable

### Requirement: Entering edit mode

An enabled, editable tag that is not being edited SHALL enter edit mode on double click, and on Enter or F2 while it has focus. It SHALL then emit `editChange` with type `start` and, as the reason, the name of the native double-click event or the pressed key, carry `kbq-tag_editing`, show its `kbqTagEditInput` in place of its content and its `kbqTagEditSubmit` in place of the remove control, take keyboard focus and select the text of the edit input.

#### Scenario: Double click

- **WHEN** the user double-clicks an editable tag
- **THEN** the tag has `kbq-tag_editing` and `cdk-keyboard-focused`
- **AND** `editChange` emits type `start` with the name of the native double-click event as its reason

#### Scenario: F2 on a focused tag

- **WHEN** an editable tag has focus and the user presses F2
- **THEN** the tag enters edit mode

#### Scenario: Remove control while editing

- **WHEN** a tag with a remove control and an edit submit control enters edit mode
- **THEN** the edit submit control is rendered and the remove control is not

### Requirement: Edit input is required

An editable tag that enters edit mode without a projected `kbqTagEditInput` SHALL raise the error "Editable kbq-tag must contain a KbqTagEditInput." once the edit state has rendered.

#### Scenario: Missing edit input

- **WHEN** an editable tag without `kbqTagEditInput` is double-clicked
- **THEN** that error is raised after the next render

### Requirement: Submitting an edit

While a tag is being edited, Enter in the edit input SHALL submit the edit with the reason `enter`, and a click on `kbqTagEditSubmit` SHALL submit it with the reason `click`. Submitting SHALL leave edit mode and emit `editChange` with type `submit`. While `preventEditSubmit` is true, submitting MUST do nothing and the tag MUST stay in edit mode.

#### Scenario: Enter in the edit input

- **WHEN** the user presses Enter in the edit input
- **THEN** the tag leaves edit mode and `editChange` emits `{ type: 'submit', reason: 'enter' }`

#### Scenario: Submit prevented

- **WHEN** `preventEditSubmit` is true and the user presses Enter in the edit input
- **THEN** the tag stays in edit mode and no `submit` event is emitted

### Requirement: Cancelling an edit

While a tag is being edited, Escape in the edit input SHALL cancel the edit with the reason `escape`, focus leaving the tag SHALL cancel it with the reason `blur`, and destroying the tag SHALL cancel it with the reason `destroy`. Cancelling SHALL leave edit mode and emit `editChange` with type `cancel`.

#### Scenario: Escape

- **WHEN** the user presses Escape in the edit input
- **THEN** the tag leaves edit mode and `editChange` emits type `cancel` with reason `escape`

#### Scenario: Focus leaves the tag

- **WHEN** focus leaves a tag that is being edited
- **THEN** `editChange` emits `{ type: 'cancel', reason: 'blur' }`

### Requirement: Keys and clicks inside the edit input

Escape, Enter, Backspace, Space and Delete pressed in the edit input MUST NOT reach the tag or its ancestors, so they neither remove nor toggle the tag nor close an enclosing overlay. A click in the edit input MUST NOT propagate. While editing, the tag SHALL ignore its own keyboard handling and prevent the default action of clicks on it.

#### Scenario: Editing keys

- **WHEN** the user presses Backspace, Space and Delete in the edit input
- **THEN** the tag stays in edit mode and `removed` does not emit

#### Scenario: Click into the text

- **WHEN** the user clicks the edit input of a tag being edited inside a tag list
- **THEN** the tag stays in edit mode

### Requirement: Tag list host

The tag list SHALL match `kbq-tag-list`, be exported as `kbqTagList`, carry the class `kbq-tag-list`, and have an `id` starting with `kbq-tag-list-`. It SHALL carry `kbq-tag-list_selectable`, `kbq-tag-list_editable` and `kbq-tag-list_removable` while the inputs of the same name are true.

#### Scenario: Default list

- **WHEN** a `kbq-tag-list` is rendered with default inputs
- **THEN** it has `kbq-tag-list`, `kbq-tag-list_selectable` and `kbq-tag-list_removable`, and not `kbq-tag-list_editable`

### Requirement: Disabled tag list

A tag list SHALL be disabled through its `disabled` input or its form control. A disabled list SHALL carry `kbq-disabled`, MUST NOT have a `tabindex` attribute, SHALL make every tag it holds disabled, including tags added later, and SHALL disable its tag input. `focus()` and keyboard handling of a disabled list MUST do nothing.

#### Scenario: Disabling the list

- **WHEN** a list with three tags becomes disabled
- **THEN** the list has `kbq-disabled` and no `tabindex`
- **AND** every tag is disabled

#### Scenario: Tag added while disabled

- **WHEN** tags are added to a disabled list
- **THEN** the new tags are disabled too

#### Scenario: Focusing a disabled list

- **WHEN** `focus()` is called on a disabled list
- **THEN** the list does not report itself as focused

### Requirement: Tag list tab stop

A tag list without a tag input SHALL have `tabindex="0"` while it holds tags and `-1` while empty, unless a `tabIndex` is bound. A list with a registered tag input, or a disabled list, MUST NOT have a `tabindex` attribute. Tab pressed on one of its tags SHALL set the host's tab index to `-1` at once, so focus leaves the list, and SHALL restore the previous value right after.

#### Scenario: Tabbing away

- **WHEN** a tag of a list with `tabindex="0"` has focus and the user presses Tab
- **THEN** the list has `tabindex="-1"` immediately and `tabindex="0"` again after the current task

#### Scenario: Bound tab index

- **WHEN** a list with `[tabIndex]="4"` is tabbed away from
- **THEN** its tab index is restored to 4

#### Scenario: List with a tag input

- **WHEN** a list has a registered tag input
- **THEN** it has no `tabindex` attribute, before and after tabbing away

### Requirement: Focusing the tag list

`focus()` on an enabled tag list, and focus landing on its host, SHALL move focus to the registered tag input when there is one, otherwise to the first enabled tag that is not about to be removed, and otherwise SHALL keep focus on the list host.

#### Scenario: List without an input

- **WHEN** `focus()` is called on a list whose first tag is disabled
- **THEN** the second tag becomes active and focused

#### Scenario: List with an input

- **WHEN** `focus()` is called on a list with a registered tag input
- **THEN** the tag input has focus

### Requirement: Form-field container click

Inside a `kbq-form-field`, for a tag list with a registered tag input, a click on the field container, including a plain click on a tag, SHALL move focus to the tag input. A Ctrl, Cmd or Shift click on a selectable tag MUST NOT propagate and so MUST NOT move focus to the tag input.

#### Scenario: Click on the field

- **WHEN** a list with a tag input is inside a form field and the user clicks the list
- **THEN** the tag input has focus

#### Scenario: Modifier click on a tag

- **WHEN** the user Ctrl-clicks a tag of that list
- **THEN** the tag input does not get focus

### Requirement: Arrow-key navigation between tags

While a tag of the list has focus, Left and Right SHALL move focus to the previous and next enabled tag, swapped in right-to-left layout and following a direction change at runtime; Up and Down SHALL move to the previous and next enabled tag as well. Navigation MUST skip disabled tags and MUST NOT wrap. Arrow keys whose target is the list host itself MUST be ignored.

#### Scenario: Right arrow in LTR

- **WHEN** the first tag has focus and the user presses Right
- **THEN** the second tag has focus

#### Scenario: Right arrow in RTL

- **WHEN** the layout is right-to-left, the last tag has focus and the user presses Right
- **THEN** the next-to-last tag has focus

#### Scenario: Key from the list host

- **WHEN** a Right arrow keydown targets the list host instead of a tag
- **THEN** the active tag does not change

### Requirement: Home and End

While a tag of the list has focus, Home and End SHALL move focus to the first and last enabled tag, make that tag the anchor of range selection, and prevent the key's default action.

#### Scenario: Home from the last tag

- **WHEN** the last tag has focus and the user presses Home
- **THEN** the first tag has focus and the key's default action is prevented

### Requirement: Focus after the focused tag is removed

When the tag that has focus is destroyed, the list SHALL move focus to the tag now at the same position, or to the new last tag when the removed tag was last, and to the tag input, if there is one, when no tag is left. When no tag of the list had focus, removing a tag MUST NOT move focus.

#### Scenario: Middle tag removed

- **WHEN** the third of five tags has focus and is removed
- **THEN** the tag now third has focus

#### Scenario: Last tag removed

- **WHEN** the last of three tags has focus and is removed
- **THEN** the second tag has focus

#### Scenario: Only tag removed

- **WHEN** the only tag of a list with a tag input has focus and is removed with Backspace
- **THEN** the tag input has focus

### Requirement: Focus alone does not select inside a list

Inside a tag list, focusing a tag and clicking it without modifier keys MUST NOT change the selection. A plain click on a selectable tag SHALL make it the anchor of range selection.

#### Scenario: Focus a tag

- **WHEN** a tag of a selectable list receives focus
- **THEN** no tag is selected

### Requirement: Ctrl or Cmd click toggles a tag in a list

Inside a tag list, a click with Ctrl or Cmd on an enabled, selectable tag SHALL toggle that tag with `isUserInput: true` and make it the anchor of range selection, without changing other tags.

#### Scenario: Ctrl click

- **WHEN** the user Ctrl-clicks an unselected tag of a list
- **THEN** the tag is selected and `selectionChange` emits `selected: true, isUserInput: true`

#### Scenario: Cmd click

- **WHEN** the user Cmd-clicks an unselected tag of a list
- **THEN** the tag is selected

### Requirement: Shift click selects a range

Inside a tag list, a Shift click on an enabled, selectable tag SHALL select every enabled, selectable tag between the anchor and the clicked tag, in either direction, and SHALL deselect tags that were in the previous range from the same anchor but are outside the new one. Without an anchor it SHALL select only the clicked tag and make it the anchor. Disabled tags MUST keep their state, and `selectionChange` SHALL emit only for tags whose state changes.

#### Scenario: Range from the anchor

- **WHEN** the user Ctrl-clicks the first of three tags and Shift-clicks the third
- **THEN** all three tags are selected
- **AND** `selectionChange` emits for the second and third tags only

#### Scenario: Shrinking the range

- **WHEN** after that the user Shift-clicks the second tag
- **THEN** the first and second tags are selected and the third is not

#### Scenario: Disabled tag inside the range

- **WHEN** the second of three tags is disabled and the user Ctrl-clicks the first and Shift-clicks the third
- **THEN** the first and third tags are selected and the second is not

#### Scenario: No anchor

- **WHEN** no tag was clicked or focused before and the user Shift-clicks the third tag
- **THEN** only the third tag is selected

### Requirement: Shift with an arrow key extends the range

Inside a selectable tag list, Shift with Left or Right on a tag SHALL move focus as the arrow alone does and extend the range from the anchor to the newly focused tag, with the same rules as a Shift click. When focus cannot move, the selection MUST NOT change. An arrow without Shift SHALL make the newly focused tag the anchor. A range started with the pointer and one started with the keyboard SHALL continue each other.

#### Scenario: Growing and shrinking from the keyboard

- **WHEN** the first tag has focus and the user presses Shift+Right twice and then Shift+Left
- **THEN** the selection grows to the first two tags, then to all three, then shrinks back to the first two

#### Scenario: List that is not selectable

- **WHEN** the list's `selectable` is false and the user presses Shift+Right on the first tag
- **THEN** the second tag has focus and nothing is selected

#### Scenario: Last tag

- **WHEN** the last tag has focus and the user presses Shift+Right
- **THEN** focus stays and nothing is selected

### Requirement: Space in a list

Inside a tag list, Space on an enabled, selectable tag SHALL toggle that tag only, emit `selectionChange`, and make the tag the anchor of range selection.

#### Scenario: Space then Shift click

- **WHEN** the user presses Space on the first tag and Shift-clicks the third
- **THEN** all three tags are selected

#### Scenario: Space on several tags

- **WHEN** the user presses Space on the last tag and then on the first tag
- **THEN** both tags are selected

### Requirement: Select all

In a selectable tag list, Ctrl+A or Cmd+A pressed on a tag, or in an empty tag input, SHALL select every enabled, selectable tag with `isUserInput: true`, move focus to the last enabled tag and prevent the key's default action. In a list whose `selectable` is false the shortcut MUST NOT select anything.

#### Scenario: Ctrl+A on a tag

- **WHEN** a tag of a three-tag list has focus and the user presses Ctrl+A
- **THEN** all three tags are selected and `selectionChange` emits three times

#### Scenario: List that is not selectable

- **WHEN** the list's `selectable` is false and the user presses Ctrl+A on a tag
- **THEN** no tag is selected and `selectionChange` does not emit

### Requirement: Selection clears when focus leaves the list

When focus leaves the tag list and its descendants, or moves into its tag input, every tag of the list SHALL be deselected and the range anchor dropped. This deselection MUST NOT emit `selectionChange`.

#### Scenario: Focus moves to the tag input

- **WHEN** two tags are selected and the user focuses the tag input
- **THEN** no tag is selected

#### Scenario: Focus leaves the list

- **WHEN** two tags are selected and focus leaves the list
- **THEN** no tag is selected

### Requirement: Delete and Backspace in a list

Inside a tag list, Delete or Backspace on an enabled tag SHALL emit `removed` for every selected tag that is removable and not disabled when at least one tag is selected, and otherwise for the focused tag when it is removable. A selected disabled or non-removable tag MUST NOT emit. The key's default action SHALL be prevented.

#### Scenario: Selected tags

- **WHEN** all three tags are selected and the user presses Delete on one of them
- **THEN** `removed` emits once for each of the three tags

#### Scenario: Selected tag elsewhere

- **WHEN** only the first tag is selected and the user presses Delete on the last tag
- **THEN** `removed` emits for the first tag and not for the last

#### Scenario: Selected disabled tag

- **WHEN** all three tags are selected, the first is disabled, and the user presses Delete
- **THEN** `removed` emits for the second and third tags only

#### Scenario: List that does not allow removal

- **WHEN** the list's `removable` is false and the user presses Delete or Backspace on a selected tag
- **THEN** `removed` does not emit

### Requirement: Drag and drop

While a tag list's `draggable` is true and the list is enabled, the list SHALL carry `kbq-tag-list_draggable` and every enabled tag SHALL be draggable and carry `kbq-tag_draggable`. Dropping a tag SHALL emit `dropped` with the tag, `previousIndex`, `currentIndex` and the pointer event; the list MUST NOT reorder the tags itself.

#### Scenario: Turning dragging on

- **WHEN** a list's `draggable` becomes true
- **THEN** the list has `kbq-tag-list_draggable` and every tag has `kbq-tag_draggable` and can be dragged

#### Scenario: Disabled list

- **WHEN** a draggable list becomes disabled
- **THEN** neither the list nor its tags have the draggable classes

#### Scenario: Drop

- **WHEN** the user drags the first tag behind the third and releases it
- **THEN** `dropped` emits with `previousIndex: 0`, `currentIndex: 2` and that tag

### Requirement: Reduced motion of reordering

Each tag SHALL carry `kbq-animations-disabled` while animations are disabled through `KBQ_ANIMATIONS_CONFIG` or reduced motion, so tags move into place without a transition; otherwise it MUST NOT carry that class.

#### Scenario: Animations disabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` disables animations
- **THEN** every tag has `kbq-animations-disabled`

### Requirement: Tag list reports user changes of its tags

After a change it treats as user-initiated — a non-empty value ended in the tag input, a `removed` request from a tag, a drop, or a call to `notifyPendingTagChange()` — the tag list SHALL, once the tags have re-rendered, emit `change` and `valueChange` with the array of the tags' values and pass it to its form control, but only when that array differs from the value the list holds. A change made only in code MUST NOT emit.

#### Scenario: Tag removed with Backspace

- **WHEN** the user removes a tag with Backspace and the consumer drops it from its data
- **THEN** the bound form control becomes dirty

#### Scenario: Tag added from the input

- **WHEN** the user types a value, presses Enter, and the consumer adds the tag to its data
- **THEN** the bound form control becomes dirty

#### Scenario: Tags changed in code

- **WHEN** the consumer adds a tag to its data without user interaction
- **THEN** the form control stays pristine

#### Scenario: Consumer rejected the tag

- **WHEN** the user presses Enter on a value that the consumer's handler does not add
- **THEN** the form control stays pristine, also after a later `setValue()`

### Requirement: Submitted edits report the value

When a tag of a tag list submits an edit, the list SHALL at once emit `change` and `valueChange` with the array of its tags' current values and pass it to its form control.

#### Scenario: Edit submitted

- **WHEN** the user submits an edit of a tag in a list bound to a form control
- **THEN** the form control receives the array of the tags' values

### Requirement: Form value does not drive the tags

A value written by a form control or through `[value]` SHALL only be stored by the tag list. The list MUST NOT create, remove or select tags from it; the consumer renders the tags. Writing a value MUST NOT mark the control dirty or move focus.

#### Scenario: Control value set in code

- **WHEN** the form control's value is set to a value one of the tags carries
- **THEN** no tag becomes selected, no tag is focused, and the control stays pristine

### Requirement: Touched state

Focus leaving a tag list SHALL mark its form control as touched: at once for a list without a tag input, and for a list with one only once neither its tags nor its input have focus. A disabled list MUST NOT mark the control as touched.

#### Scenario: List without an input

- **WHEN** the list host or a tag of a list without a tag input loses focus
- **THEN** the form control is touched

#### Scenario: Focus handed to the input by a removal

- **WHEN** removing the last tag moved focus into the tag input and the input then loses focus
- **THEN** the form control is touched

#### Scenario: Disabled list

- **WHEN** the form control is disabled and the list loses focus
- **THEN** the form control stays untouched

### Requirement: Error state

The tag list SHALL be in an error state when its `errorStateMatcher` input, or else the `ErrorStateMatcher` provided through dependency injection (`kbqErrorStateMatcherProvider`), reports one. The default matcher SHALL report an error for an invalid control that is touched or whose form was submitted. The list SHALL carry `kbq-invalid` while in the error state.

#### Scenario: Default matcher

- **WHEN** the control is invalid and untouched
- **THEN** the list is not in an error state
- **AND** it is once the control is touched or the form is submitted

#### Scenario: Show on submit only

- **WHEN** `errorStateMatcher` is a `ShowOnFormSubmitErrorStateMatcher` and the invalid control is touched
- **THEN** the list is not in an error state until the form is submitted

### Requirement: Form-field integration

The tag list SHALL report to its `kbq-form-field` the `id` of its registered tag input, so the field label is a `<label for>` of that input. It SHALL report itself as empty only while it has no tags and its tag input is empty, and as focused while a tag or its tag input has focus.

#### Scenario: Label

- **WHEN** a list with a tag input is inside a form field with a `kbq-label`
- **THEN** the label is a `<label>` whose `for` is the input's id

#### Scenario: Empty

- **WHEN** a list without a tag input renders no tag, and later renders one again
- **THEN** it reports itself as empty only while no tag is rendered

### Requirement: Cleaner visibility

A `kbq-cleaner` placed directly inside a tag list SHALL be rendered only while the list is enabled, not empty, and holds at least one removable tag that `clearPredicate` accepts. By default `clearPredicate` accepts every tag that is not disabled.

#### Scenario: Only disabled tags left

- **WHEN** every tag of the list is disabled
- **THEN** the cleaner is not rendered

#### Scenario: List that does not allow removal

- **WHEN** the list's `removable` is false
- **THEN** the cleaner is not rendered

#### Scenario: Last removable tag gone

- **WHEN** the consumer removes every tag
- **THEN** the cleaner is no longer rendered

### Requirement: Clearing the tag list

Activating the cleaner SHALL emit `removed` for every removable tag that `clearPredicate` accepts, from the last to the first, including disabled tags the predicate accepts. Focus SHALL then move to the tag input, else to the first enabled tag that is not being removed, else to the list host, and an attached autocomplete MUST NOT open. Escape MUST NOT clear the list.

#### Scenario: Default predicate

- **WHEN** the second of three tags is disabled and the user clicks the cleaner
- **THEN** only the disabled tag is left once the consumer has handled `removed`

#### Scenario: Predicate accepting every tag

- **WHEN** `clearPredicate` returns true for every tag and the user clicks the cleaner
- **THEN** every tag, the disabled one included, is removed

#### Scenario: Handler that removes by position

- **WHEN** the consumer's `removed` handler removes tags by index and the user clicks the cleaner
- **THEN** every tag is removed

#### Scenario: Focus after clearing a list without an input

- **WHEN** a list without a tag input is cleared
- **THEN** the list host has focus

### Requirement: Clear predicate errors

A `clearPredicate` that is not a function SHALL make the list throw "`clearPredicate` must be a function." A predicate that throws for a tag SHALL be treated as rejecting it, and in dev mode the error SHALL be logged with `console.warn` instead of breaking the render.

#### Scenario: Throwing predicate

- **WHEN** `clearPredicate` throws for every tag
- **THEN** the cleaner is not rendered and a warning is logged

#### Scenario: Not a function

- **WHEN** `clearPredicate` is bound to a string
- **THEN** the list throws that error

### Requirement: Tag input registration

The directive SHALL apply to `input[kbqTagInputFor]`, be exported as `kbqTagInput` and `kbqTagInputFor`, carry the class `kbq-tag-input`, and register with the tag list given to `kbqTagInputFor`, also when that list is bound after the first render. It SHALL write its `id` input, by default `kbq-tag-list-input-` followed by a counter, and its `placeholder` input only when non-empty.

#### Scenario: Default id

- **WHEN** a tag input is rendered without `id` in an application whose `APP_ID` is `custom`
- **THEN** its id matches `kbq-tag-list-input-custom<n>`

#### Scenario: Placeholder

- **WHEN** `placeholder` changes from an empty string to "New tag"
- **THEN** the input gets `placeholder="New tag"` where it had no attribute before

#### Scenario: List bound late

- **WHEN** `kbqTagInputFor` is first undefined and then bound to a list
- **THEN** rendering does not throw and the list reports the input's id as its own

### Requirement: Tag input disabled state

The tag input SHALL be disabled, with the `disabled` attribute, while its own `disabled` input is true or its tag list is disabled. A blur caused by disabling it MUST NOT emit `kbqTagInputTokenEnd`.

#### Scenario: Form control disables the list

- **WHEN** the input holds text, `kbqTagInputAddOnBlur` is true, and the list's form control is disabled
- **THEN** the input is disabled and the following blur does not emit `kbqTagInputTokenEnd`

### Requirement: Separator keys

The tag input SHALL end a tag on the keys whose codes are in `kbqTagInputSeparatorKeyCodes`, which defaults to `[ENTER]` from the default options. A bound list SHALL replace the default rather than add to it, and `null` SHALL mean no separator keys. A key SHALL match only when its `key` equals a separator's key and no Shift, Ctrl, Alt or Meta is held.

#### Scenario: Default separator

- **WHEN** the input holds "tag" and the user presses Enter
- **THEN** `kbqTagInputTokenEnd` emits with value "tag"

#### Scenario: Comma replaces Enter

- **WHEN** `kbqTagInputSeparatorKeyCodes` is `[COMMA]` and the user presses Enter and then comma
- **THEN** only the comma emits `kbqTagInputTokenEnd`

#### Scenario: Modifier held

- **WHEN** the user presses Shift+Enter, Ctrl+Enter, Alt+Enter or Meta+Enter
- **THEN** `kbqTagInputTokenEnd` does not emit

#### Scenario: No separators

- **WHEN** `kbqTagInputSeparatorKeyCodes` is an empty array or `null` and the user presses Enter
- **THEN** `kbqTagInputTokenEnd` does not emit

### Requirement: Built-in separators

Without custom separators the tag input SHALL know five separators, each active only while its key code is in the separator key codes: Enter with a line break, Tab with a tab character, Space with a space, comma and semicolon. A key code with no matching separator SHALL have no effect.

#### Scenario: All five on paste

- **WHEN** all five key codes are set and the user pastes "a,b;c d\te\nf\ng"
- **THEN** seven tags are requested: a, b, c, d, e, f and g

### Requirement: Custom separators

Separators given through the `separators` default option SHALL replace the built-in ones. A separator without `keyCode` SHALL always be active; one without `key` SHALL never match a keystroke. `appliesTo` SHALL limit a separator to typing (`input`), pasting (`paste`) or both, which is the default.

#### Scenario: Space only on paste

- **WHEN** a space separator has `appliesTo: ['paste']`
- **THEN** typing a space keeps it in the input, and pasting "New York Boston" requests three tags

#### Scenario: Keyless whitespace separator

- **WHEN** a separator `{ symbol: /\s+/, appliesTo: ['paste'] }` is configured
- **THEN** pasting "a b\tc" requests three tags and typing a space requests none

### Requirement: Ending a tag from the keyboard

When the input holds text and the user presses a separator key, the tag input SHALL emit `kbqTagInputTokenEnd` with `{ input, value }` and prevent the key's default action. The directive MUST NOT clear the input; the consumer does that in its handler. `emitTagEnd()` SHALL request a tag from the current text in the same way.

#### Scenario: Tab as a separator

- **WHEN** Tab is a separator, the input holds text and the user presses Tab
- **THEN** `kbqTagInputTokenEnd` emits and focus stays in the input

### Requirement: Separator in an empty input

When the input is empty, a separator key SHALL NOT request a tag, and its default action SHALL be prevented unless the key is Tab.

#### Scenario: Space in an empty input

- **WHEN** Space is a separator, the input is empty and the user presses Space
- **THEN** the key's default action is prevented and nothing is emitted

#### Scenario: Tab in an empty input

- **WHEN** Tab is a separator, the input is empty and the user presses Tab
- **THEN** the key's default action is not prevented

### Requirement: Adding on blur

While `kbqTagInputAddOnBlur` is true, which is the default, the input losing focus SHALL emit `kbqTagInputTokenEnd` with the current text, also when that text is empty, unless the input is disabled or an attached autocomplete reports that focus moved to one of its options. With `kbqTagInputAddOnBlur` false, blur MUST NOT emit.

#### Scenario: Blur with text

- **WHEN** the input holds text and loses focus
- **THEN** `kbqTagInputTokenEnd` emits with that text

#### Scenario: Add on blur turned off

- **WHEN** `kbqTagInputAddOnBlur` is false and the input loses focus
- **THEN** `kbqTagInputTokenEnd` does not emit

#### Scenario: Attribute without a value

- **WHEN** the input is written as `<input kbqTagInputAddOnBlur distinct ...>`
- **THEN** both inputs are true, and `kbqTagInputAddOnBlur="false"` reads as false

### Requirement: Adding on paste

While `kbqTagInputAddOnPaste` is true, which is the default unless the default options set `addOnPaste`, pasting non-empty text SHALL split it on every active paste separator found in it, emit `kbqTagInputTokenEnd` once per part, empty parts and surrounding spaces included, and prevent the native paste. Text without a separator SHALL be requested as one tag. Empty clipboard text MUST NOT emit.

#### Scenario: Comma-separated text

- **WHEN** comma is a separator and the user pastes "a,b,c,,"
- **THEN** five tags are requested: a, b, c and two empty values

#### Scenario: Spaces kept

- **WHEN** comma is a separator and the user pastes "a, b, c"
- **THEN** the requested values are "a", " b" and " c"

#### Scenario: No separator in the text

- **WHEN** comma is the only separator and the user pastes "a; b; c"
- **THEN** one tag "a; b; c" is requested

#### Scenario: Paste turned off

- **WHEN** `kbqTagInputAddOnPaste` is false and the user pastes "a,b,c"
- **THEN** no tag is requested and the browser pastes the text

### Requirement: Distinct values

While `distinct` is true, the tag input MUST NOT request a tag whose value equals the `value` of a tag already in the list, nor the same value twice within one paste. While it is false, duplicates SHALL be requested.

#### Scenario: Duplicate typed

- **WHEN** `distinct` is true, a tag "existing-tag" exists and the user ends "existing-tag"
- **THEN** `kbqTagInputTokenEnd` does not emit

#### Scenario: Duplicate within a paste

- **WHEN** `distinct` is true and the user pastes "new-tag,new-tag" with comma as a separator
- **THEN** `kbqTagInputTokenEnd` emits once

### Requirement: Trimming on a kbqInput

When the tag input is also a `kbqInput` without the `no-trim` attribute, every requested value SHALL be trimmed before the duplicate check and the emission. Otherwise the text SHALL be requested as typed or pasted.

#### Scenario: Trimmed value

- **WHEN** the tag input is a `kbqInput`, holds " tag " and the user presses Enter
- **THEN** `kbqTagInputTokenEnd` emits with value "tag"

#### Scenario: Plain input

- **WHEN** the tag input is not a `kbqInput` and the user pastes " tag " with no separator in it
- **THEN** `kbqTagInputTokenEnd` emits with value " tag "

### Requirement: Validators on the tag input do not block tags

Validators of a form control bound to the tag input itself MUST NOT stop a tag from being requested by a separator key, paste or blur, and MUST NOT change the error state of the tag list's own control.

#### Scenario: Invalid input control

- **WHEN** the input's own form control is invalid and the user presses Enter
- **THEN** `kbqTagInputTokenEnd` emits with the typed text

### Requirement: Keys in an empty tag input

While the tag input is empty, Backspace, Left and Shift+Tab SHALL move focus to the last enabled tag of its list and prevent their default action; Delete MUST do nothing. Escape SHALL keep propagating so an enclosing overlay or autocomplete panel can close; every other key MUST NOT propagate past the input.

#### Scenario: Backspace

- **WHEN** the input is empty and the user presses Backspace
- **THEN** the last tag has focus

#### Scenario: Left with text

- **WHEN** the input holds text and the user presses Left
- **THEN** focus stays in the input

#### Scenario: Escape

- **WHEN** the input is empty and the user presses Escape
- **THEN** the event reaches the input's ancestors and its default action is not prevented

### Requirement: Enter with an active autocomplete option

When an autocomplete attached to the input has its panel open with an active option, Enter MUST NOT request a tag and MUST NOT prevent the key's default action, so the autocomplete picks the option. Other separator keys SHALL still request the typed text.

#### Scenario: Enter on an active option

- **WHEN** the autocomplete panel is open with an active option and the user presses Enter
- **THEN** `kbqTagInputTokenEnd` does not emit

#### Scenario: Picking an option with the pointer

- **WHEN** `kbqTagInputAddOnBlur` is true, the user types "hi" and clicks an option
- **THEN** only the option's value is added, not the typed text

#### Scenario: Comma with an active option

- **WHEN** comma is a separator, the panel is open with an active option and the user presses comma
- **THEN** `kbqTagInputTokenEnd` emits with the typed text

### Requirement: Default options

`KBQ_TAGS_DEFAULT_OPTIONS` SHALL default to `{ separatorKeyCodes: [ENTER] }` without any provider, so a tag input works without `KbqTagsModule`. `kbqTagsDefaultOptionsProvider(options)` SHALL provide those defaults merged with `options`. `KbqTagsModule` SHALL itself provide `{ separatorKeyCodes: [ENTER] }`.

#### Scenario: Standalone imports

- **WHEN** a component imports `KbqTagInput` and `KbqTagList` without `KbqTagsModule` and the user presses Enter on text
- **THEN** `kbqTagInputTokenEnd` emits

#### Scenario: Component-level provider

- **WHEN** a component provides `kbqTagsDefaultOptionsProvider({ separatorKeyCodes: [DASH], separators: [{ symbol: /-/, key: '-', keyCode: DASH }] })`
- **THEN** pasting "a-b" in its tag input requests "a" and "b"

### Requirement: Localized remove control name

The default name of the remove control SHALL follow the active locale's `a11y.remove` string, `ru-RU` by default, and `[localeOverrides]` on the `kbq-tag` SHALL override it for that tag while keys left out keep following the locale.

#### Scenario: Switching the locale

- **WHEN** the application switches the locale to `en-US`
- **THEN** a remove control without its own `aria-label` is named "Remove"
