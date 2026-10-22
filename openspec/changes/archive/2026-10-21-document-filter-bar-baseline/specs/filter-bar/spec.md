# Spec Delta

## Purpose

Describes what `@koobiq/components/filter-bar` guarantees to consumers: how `kbq-filter-bar` holds the current filter and reports changes to it, how its pipes are rendered, edited, cleared, removed and added, how saved filters are picked, saved and restored, and how the built-in pipe types behave for pointer, keyboard and assistive-technology users.

## ADDED Requirements

### Requirement: Bar layout and content slots

`kbq-filter-bar` (element or attribute selector) SHALL carry the host class `kbq-filter-bar` and SHALL project its content into two sections: `.kbq-filter-bar__left` holds, in this order, `kbq-filters`, all other content (the pipes), `kbq-pipe-add` and `kbq-filter-reset`; `.kbq-filter-bar__right` holds `kbq-search-expandable` and then `kbq-filter-refresher` (element or attribute).

#### Scenario: Search projected to the right

- **WHEN** a `kbq-search-expandable` is placed inside the bar
- **THEN** it is rendered inside `.kbq-filter-bar__right`

#### Scenario: Pipes stay on the left

- **WHEN** the bar contains `kbq-filters`, pipes and `kbq-pipe-add` in any source order
- **THEN** `kbq-filters` comes first, the pipes follow and `kbq-pipe-add` comes after them inside `.kbq-filter-bar__left`

### Requirement: Two-way filter model

The bar SHALL expose the current filter as the two-way `filter` model, `null` by default, bindable as `[(filter)]`. Every change the bar or its parts make SHALL replace the filter with a new object and emit `filterChange` with it.

#### Scenario: Bar writes a new filter

- **WHEN** a part of the bar changes the filter (a pipe value, a removal, an added pipe, a selected saved filter)
- **THEN** `filterChange` emits a filter object that is not the previous one

#### Scenario: Unbound filter

- **WHEN** the bar is rendered without a `filter` binding
- **THEN** `filter()` is `null`

### Requirement: Derived filter state

The bar SHALL expose `isSaved`, `isChanged`, `isReadOnly` and `isDisabled` as signals that are `true` exactly when the current filter's `saved`, `changed`, `readonly` and `disabled` flags are truthy, and `isSavedAndChanged` when both `saved` and `changed` are. All of them SHALL be `false` while the filter is `null`.

#### Scenario: Saved and changed filter

- **WHEN** the filter has `saved: true` and `changed: true`
- **THEN** `isSaved()`, `isChanged()` and `isSavedAndChanged()` are `true`

#### Scenario: No filter

- **WHEN** the filter is `null`
- **THEN** every one of these signals is `false`

### Requirement: Pipe changes mark the filter changed

Whenever a pipe reports a change through `onChangePipe`, the bar SHALL replace the current filter with a copy whose `changed` is `true` and emit `filterChange`. The bar MUST NOT set `changed` back to `false` on its own when the values return to what they were.

#### Scenario: Editing a pipe

- **WHEN** a filter with `changed: false` is shown and the user applies a new value in one of its pipes
- **THEN** `onChangePipe` emits that pipe and `filterChange` emits the filter with `changed: true`

#### Scenario: Reverting a value

- **WHEN** the user puts a pipe back to its previous value
- **THEN** the filter keeps `changed: true`

### Requirement: Pipe values are written into the pipe objects

A built-in pipe SHALL store a new value by assigning it to the `value` of the pipe object it was rendered from, so the object in the bound filter carries the latest value. A filter the bar emits after a value change SHALL hold the same pipe objects as before.

#### Scenario: Reading a value after a change

- **WHEN** the user selects an option in a select pipe rendered from a pipe object of the bound filter
- **THEN** that pipe object's `value` is the selected option

### Requirement: Removing a pipe

`removePipe(pipe)` SHALL remove the given pipe object from the current filter, matched by identity, emit `filterChange` once with a new filter whose `changed` is `true`, and then emit `onRemovePipe` with the pipe. A pipe that is not in the current filter MUST be ignored without any event.

#### Scenario: Removing a pipe of the filter

- **WHEN** `removePipe` is called with a pipe of the current filter
- **THEN** the filter no longer contains it, `changed` is `true`, `filterChange` fired once and `onRemovePipe` emitted the pipe

#### Scenario: Removing an unknown pipe

- **WHEN** `removePipe` is called with an object that is not one of the filter's pipes
- **THEN** the filter is unchanged and `onRemovePipe` does not fire

### Requirement: In-memory filter snapshot

`saveFilterState(filter?)` SHALL store a deep copy (`structuredClone`) of the given filter or of the current one. `restoreFilterState(filter?)` SHALL set the filter to a deep copy of the given filter or of the stored snapshot, and MUST do nothing when neither exists. A pipe value that cannot be structured-cloned SHALL make these calls throw `DataCloneError`.

#### Scenario: Save, edit, restore

- **WHEN** the filter is saved with `saveFilterState()`, edited, and then `restoreFilterState()` is called
- **THEN** the filter equals the saved one again but is a different object

#### Scenario: Nothing to restore

- **WHEN** `restoreFilterState()` is called before any snapshot was taken
- **THEN** the current filter is kept

### Requirement: Clearing the changed flag

`resetFilterChangedState()` SHALL replace the current filter with a copy whose `changed` is `false`, and MUST do nothing while the filter is `null`.

#### Scenario: Resetting the flag

- **WHEN** the filter has `changed: true` and `resetFilterChangedState()` is called
- **THEN** the filter has `changed: false` and its pipes are unchanged

### Requirement: Imperative calls do not track the filter

`removePipe`, `saveFilterState`, `resetFilterChangedState` and the `kbq-filters` methods `saveChanges`, `resetFilterChanges` and `removeFilter` MUST NOT make an `effect()` that calls them depend on the filter, so such an effect does not run again when the filter changes.

#### Scenario: Effect that removes a pipe

- **WHEN** an application effect calls `removePipe` once and the filter then changes
- **THEN** the effect does not run again

### Requirement: Rendering pipes with kbqPipe

The structural directive `*kbqPipe="pipe"` SHALL render the component registered for `pipe.type` in `KBQ_FILTER_BAR_PIPES` and hand it that pipe object. It SHALL build the component once: later changes to the binding MUST NOT update or rebuild it. An unregistered type SHALL throw "Can't find component for this type: <type>".

#### Scenario: Built-in type

- **WHEN** a pipe with `type: 'multiselect'` is rendered with `*kbqPipe`
- **THEN** a `kbq-pipe-multi-select` component is rendered for it

#### Scenario: Unknown type

- **WHEN** a pipe with `type: 'unknown'` is rendered and no component is registered for it
- **THEN** rendering throws "Can't find component for this type: unknown"

### Requirement: Pipe identity

A pipe or pipe template SHALL be identified by its `id`, or by its `name` when it has no `id` (`getId`). Matching a pipe to its template, marking added pipes in `kbq-pipe-add`, opening a pipe on request and persisting pipe state SHALL all use this identity, so two pipes of the same filter need distinct identities.

#### Scenario: Two pipes of one type

- **WHEN** two `select` templates with different `id`s are both added
- **THEN** each pipe takes its options from its own template

### Requirement: Pipe host classes

Every built-in pipe host SHALL carry the class `kbq-pipe` and `kbq-pipe__<type>`, plus `kbq-pipe_empty` while it has no value, `kbq-pipe_cleanable`, `kbq-pipe_removable` and `kbq-pipe_disabled` while the pipe object's `cleanable`, `removable` and `disabled` are set.

#### Scenario: Required pipe

- **WHEN** a pipe with a value has `cleanable`, `removable` and `disabled` all `false`
- **THEN** its host has none of `kbq-pipe_empty`, `kbq-pipe_cleanable`, `kbq-pipe_removable`, `kbq-pipe_disabled`

#### Scenario: Empty cleanable pipe

- **WHEN** a cleanable pipe has the value `null`
- **THEN** its host has `kbq-pipe_empty` and `kbq-pipe_cleanable`

### Requirement: Pipe options follow the templates

A pipe SHALL take `values`, `valueTemplate`, `compareWith`, `lockedValues`, `panelMaxHeight`, `multilineOptions`, `noOptionsText` and the date limits from the `pipeTemplates` entry with its identity, and SHALL follow later changes to `pipeTemplates`. A later template without `values` SHALL keep the previous `values`, while the other options SHALL take the new template's value, `undefined` included.

#### Scenario: Options supplied late

- **WHEN** a select pipe is rendered before its template's `values` arrive and the user opens it after they do
- **THEN** the panel lists the new options

#### Scenario: Option dropped by a later template

- **WHEN** a template that set `compareWith` is replaced by one without it
- **THEN** the pipe uses the default comparator again

### Requirement: Pipe trigger layout

A pipe trigger SHALL show the pipe `name` and its value side by side, each truncated on its own, with a tooltip of both when the text is clipped, and SHALL carry `kbq-active` while its pop-up is open. Every pipe but `input`, its clear or remove button included, and the `kbq-filters` trigger SHALL be at most `--kbq-filter-bar-pipe-max-width` wide (320px by default); the `input` pipe SHALL be `--kbq-filter-bar-pipe-input-width` wide (240px by default).

#### Scenario: Long name and value

- **WHEN** both the name and the value are wider than the pipe allows
- **THEN** both parts are cut with an ellipsis and share the width about equally

#### Scenario: Hovering a clipped pipe

- **WHEN** the user hovers a pipe whose text is clipped
- **THEN** a tooltip shows the full name and value

#### Scenario: Custom width cap

- **WHEN** `--kbq-filter-bar-pipe-max-width` is set to `200px` on the bar
- **THEN** no pipe other than the input pipe is wider than 200px, and the input pipe stays 240px wide

### Requirement: Pipe fill state

The `kbqPipeState` directive SHALL style the button it is placed on as filled while its pipe has a value and as outline while it is empty, and SHALL follow every change of emptiness: a value applied by the user, a clear, a filter replaced from outside, and a template change that makes the pipe empty or not. Built-in pipes SHALL apply it to the trigger and the clear or remove button.

#### Scenario: Value applied after initialization

- **WHEN** an empty cleanable pipe receives a value
- **THEN** both its trigger and its clear button are filled

#### Scenario: Cleared by its own button

- **WHEN** the user clears a pipe with its clear button
- **THEN** its trigger is outlined

### Requirement: Clear and remove button visibility

A pipe SHALL show its clear or remove button while `removable` is set, or while `cleanable` is set and the pipe has a value; otherwise the button MUST NOT be rendered. With `disabled` set, the button SHALL be disabled and its tooltip off.

#### Scenario: Required pipe

- **WHEN** a pipe has neither `cleanable` nor `removable`
- **THEN** it has no clear or remove button and its value can only be changed

#### Scenario: Empty cleanable pipe

- **WHEN** a cleanable, non-removable pipe has no value
- **THEN** no clear button is shown

### Requirement: Clearing a pipe

With `cleanable` set, activating the button SHALL clear the pipe without removing it: the value becomes the pipe's cleared value (`null`; `[]` for `multiselect`; the locked values when the template has `lockedValues`), then `onClearPipe` and `onChangePipe` emit the pipe in that order. The button SHALL be named and titled by `pipe.clearButtonTooltip`.

#### Scenario: Clearing a select pipe

- **WHEN** the user activates the clear button of a cleanable select pipe with a value
- **THEN** the pipe stays in the bar with the value `null`
- **AND** `onClearPipe` and then `onChangePipe` emit the pipe

### Requirement: Removing a pipe with its button

With `removable` set and `cleanable` not set, activating the button SHALL call `removePipe` with the pipe. The button SHALL be named and titled by `pipe.removeButtonTooltip`. With both flags set the button SHALL clear the pipe and stay visible while the pipe is empty.

#### Scenario: Removing a removable pipe

- **WHEN** the user activates the remove button of a removable pipe
- **THEN** the pipe leaves the filter and `onRemovePipe` emits it

### Requirement: Disabled pipe

A pipe with `disabled` set SHALL render its trigger, or its input for the `input` type, disabled, so the value cannot be changed, and SHALL disable its clear or remove button.

#### Scenario: Inactive pipe

- **WHEN** a pipe has `disabled: true` and `removable: true`
- **THEN** its trigger and its remove button are both disabled

### Requirement: Focus returns to the pipe trigger

After a value is chosen or applied in a select, multi-select, tree, text or date pipe, or a multi-select panel closes, focus SHALL return to the pipe's trigger with the current input modality, so the focus ring shows for keyboard use only. Focus MUST NOT be taken back when it has moved to an element outside the pipe and outside any overlay.

#### Scenario: Applying text with the keyboard

- **WHEN** the user applies a text pipe with Ctrl+Enter
- **THEN** focus is on the pipe's trigger with a keyboard focus ring

#### Scenario: Closing by clicking another control

- **WHEN** a multi-select panel closes because the user clicked a button elsewhere on the page
- **THEN** focus stays on that button

### Requirement: Closing a pipe pop-up

The bar SHALL emit `onClosePipe` with the pipe whenever the panel or popover of a `text`, `select`, `multiselect`, `tree-select`, `multi-tree-select`, `date` or `datetime` pipe closes, and MUST NOT emit it when one opens.

#### Scenario: Closing a select pipe

- **WHEN** the user opens a select pipe and closes it with Escape
- **THEN** `onClosePipe` emits that pipe once

### Requirement: Opening a pipe on add

A pipe whose object has `openOnAdd` set SHALL open its panel or popover, or focus its input, once it has rendered, and SHALL delete `openOnAdd` from the object so it opens only once.

#### Scenario: Pipe added from the menu

- **WHEN** the user adds an `input` pipe from `kbq-pipe-add`
- **THEN** its input receives focus
- **AND** the pipe object no longer has `openOnAdd`

### Requirement: Adding pipes from templates

`kbq-pipe-add` SHALL render a button, named and titled by `add.tooltip`, that opens a list with one option per entry of the bar's `pipeTemplates`, in order, labelled with the template `name`. Templates whose identity is already in the current filter SHALL be shown as selected.

#### Scenario: Opening the list

- **WHEN** the bar has three templates and one of them is in the filter
- **THEN** the list shows three options and that one is selected

### Requirement: Adding a new pipe

Choosing an option that is not yet added, by click, Enter or Space, SHALL append a pipe built from that template (`values` and `valueTemplate` removed, `openOnAdd: true`) to the filter, or to a copy of `filterTemplate` when the filter is `null`, set `changed: true`, emit `filterChange` and then `onAddPipe` with the template, and close the list.

#### Scenario: Adding with no filter

- **WHEN** the filter is `null` and the user chooses a template
- **THEN** the filter becomes a copy of `filterTemplate` with that one pipe and `changed: true`
- **AND** `onAddPipe` emits the template and the list closes

#### Scenario: Adding with Space

- **WHEN** an option is active and the user presses Space
- **THEN** the pipe is added

### Requirement: Choosing an added pipe opens it

Choosing an option whose pipe is already in the filter MUST NOT add another pipe; it SHALL close the list and open the pipe with that identity.

#### Scenario: Choosing an added template

- **WHEN** the user chooses a template that is already in the filter
- **THEN** the filter keeps a single pipe for it and that pipe opens

### Requirement: Announcing an added pipe

`kbq-pipe-add` SHALL contain a visually hidden `aria-live="polite"` region that, after a pipe is added, reads `add.addedAnnouncement` with `{{ name }}` replaced by the template name. It SHALL empty the region at once and fill it on the next task, so the same message is announced again.

#### Scenario: Adding with the default locale

- **WHEN** the user adds the template "PipeA" and no locale service is provided
- **THEN** the live region reads "Фильтр «PipeA» добавлен"

### Requirement: Reset control

`kbq-filter-reset` SHALL render a button labelled by its projected content, or by `reset.buttonName` when none is projected. Activating it SHALL emit `onResetFilter` with the current filter and make every rendered pipe with `openOnReset` open. It MUST NOT change the filter itself; the application decides what a reset means.

#### Scenario: Clicking reset

- **WHEN** the user clicks the reset button while a changed filter is shown
- **THEN** `onResetFilter` emits that filter and the bar's filter is unchanged

### Requirement: Read-only pipe

A `readonly` pipe SHALL show its name and its value as text, SHALL have no panel or popover, and SHALL let the user act on it only through its clear or remove button.

#### Scenario: Removing an unchangeable value

- **WHEN** a removable readonly pipe is shown
- **THEN** activating its trigger opens nothing and the remove button removes it

### Requirement: Text pipe

A `text` pipe SHALL open a popover with a textarea, seeded from the value and growing up to five rows, and an Apply button that is disabled while the textarea is empty and shows the hot key "⌘ Enter" on macOS and "Ctrl + Enter" elsewhere. Apply, or Ctrl/Cmd+Enter while it is enabled, SHALL store the text as the value, close the popover and emit `onChangePipe`.

#### Scenario: Applying text

- **WHEN** the user types "abc" and presses Ctrl+Enter
- **THEN** the value is "abc", the popover closes and `onChangePipe` emits the pipe

#### Scenario: Empty text

- **WHEN** the textarea is empty
- **THEN** Apply is disabled and Ctrl+Enter does nothing

### Requirement: Input pipe rendering

An `input` pipe SHALL render a bare text input, without a trigger button or popover, whose placeholder and `aria-label` are the pipe `name`, seeded from the value. It SHALL have no remove button, whatever `removable` says. Opening the pipe SHALL focus the input.

#### Scenario: Rendered input pipe

- **WHEN** an input pipe named "Search" is rendered
- **THEN** it shows an input with the placeholder "Search" and no button that opens a pop-up

### Requirement: Input pipe applies while typing

The `input` pipe SHALL apply typed text `debounceTime` milliseconds (200 by default) after the last keystroke, restarting the wait on every keystroke, and only then emit `onChangePipe`. Text shorter than `minLength` (1 by default) SHALL be applied as `null`. Enter and blur MUST NOT apply the text before the wait ends.

#### Scenario: Typing a value

- **WHEN** the user types "new text" and stops typing
- **THEN** 200 ms later the value is "new text" and `onChangePipe` has fired once

#### Scenario: Pressing Enter

- **WHEN** the user types and presses Enter before 200 ms have passed
- **THEN** the value is applied only when the 200 ms have passed

### Requirement: Input pipe value normalization

The `input` pipe SHALL trim the typed text and apply an empty or blank result as `null`. It MUST NOT emit `onChangePipe` when the applied value equals the stored one, and MUST NOT re-apply or emit for the value it was seeded with.

#### Scenario: Blank text

- **WHEN** the user replaces the text with spaces only
- **THEN** after the wait the value is `null`

#### Scenario: Rendering a stored value

- **WHEN** an input pipe is rendered with the value "some text" and the user does nothing
- **THEN** no `onChangePipe` fires

### Requirement: Input pipe cleaner

With `cleanable` set, the pipe enabled and a value in the field, the `input` pipe SHALL show a cleaner inside the field; otherwise there is none. Clearing through the cleaner SHALL set the value to `null`, emit `onClearPipe` once and `onChangePipe` once, and cancel an apply still waiting from earlier keystrokes.

#### Scenario: Cleaner during the wait

- **WHEN** the user types new text and clicks the cleaner before 200 ms have passed
- **THEN** the value is `null` after the wait and `onChangePipe` fired only once

### Requirement: Select pipe

A `select` pipe SHALL open a panel listing the template `values` by `name`. Choosing an option SHALL store the option object as the value, emit `onChangePipe`, close the panel and show the option's name on the trigger. Enter on the active option SHALL choose it.

#### Scenario: Choosing an option

- **WHEN** the user clicks "Option 2" in an open select pipe
- **THEN** the value is the "Option 2" object, the panel closes and the trigger shows "Option 2"

### Requirement: Option comparison in select pipes

The `select` and `multiselect` pipes SHALL match the value against options with the template's `compareWith`, or by default by `id`, where a `null` or missing value never matches.

#### Scenario: Restored value object

- **WHEN** the value is a different object with the same `id` as an option
- **THEN** that option is shown as selected

#### Scenario: Custom comparator

- **WHEN** the template's `compareWith` compares by `name`
- **THEN** the option with the value's name is shown as selected

### Requirement: Multi-select pipe

A `multiselect` pipe SHALL let the user toggle options, keep the panel open, store the selected option objects as an array and emit `onChangePipe` on every toggle. Its trigger SHALL show the option name when one option is selected and a count badge when more are.

#### Scenario: Selecting two options

- **WHEN** the user selects two options
- **THEN** the value holds both, the panel is still open and the trigger shows the badge "2"

### Requirement: All selected equals nothing selected

`selectedAllEqualsSelectedNothing` on the bar (default `true`), overridden by the pipe's own flag, SHALL make a multi-select or multi-tree-select pipe store and emit `[]` once every option the user can toggle is selected. The pipe SHALL then read as empty and show no count, yet reopening SHALL show every option selected. With the flag `false` the full array SHALL be kept.

#### Scenario: Selecting everything

- **WHEN** the flag is on and the user selects every option of a multi-select pipe
- **THEN** `onChangePipe` carries the value `[]` and the pipe has `kbq-pipe_empty`
- **AND** reopening the panel shows every option selected

#### Scenario: Flag off

- **WHEN** the bar has `[selectedAllEqualsSelectedNothing]="false"` and the user selects every option
- **THEN** the value lists every option

### Requirement: Select-all row

With `selectAll` set and options present, the multi-select panel SHALL show a "select all" row labelled `pipe.selectAll` with a checkbox that is unchecked, indeterminate or checked by how many unlocked options are selected. Clicking it or Enter on it SHALL select every visible option, or deselect them all when all are selected. While a search finds nothing the row MUST be hidden.

#### Scenario: Toggling all

- **WHEN** none is selected and the user clicks the row
- **THEN** every option is selected and the checkbox is checked

#### Scenario: With a search query

- **WHEN** a search query is entered and the user clicks the row
- **THEN** only the options matching the query are toggled

### Requirement: Select-all shortcut

While a multi-select or multi-tree-select panel is open, Ctrl+A or Cmd+A SHALL toggle all options as the select-all row does, preventing the browser default. With `selectAll` set, Enter in the pipe's search field while the select-all row is active SHALL do the same. With no options these MUST change nothing and emit nothing.

#### Scenario: Ctrl+A

- **WHEN** the panel of a multi-select pipe is open and the user presses Ctrl+A
- **THEN** every option is toggled and the page text is not selected

### Requirement: Locked values

A `multiselect` or `multi-tree-select` template's `lockedValues` SHALL be always selected: shown checked and disabled, skipped by the keyboard, ignored by "select all" and its checkbox state, kept by clearing, and added to an incoming value without a change event. A pipe holding only locked values SHALL read as empty. In a tree, locking a branch SHALL lock its subtree.

#### Scenario: Clicking a locked option

- **WHEN** the user clicks a locked option
- **THEN** the value does not change and the option stays selected

#### Scenario: Clearing with locked values

- **WHEN** a pipe with locked values is cleared
- **THEN** its value lists only the locked values and `onClearPipe` and `onChangePipe` carry them

#### Scenario: Value without its locked entries

- **WHEN** the filter supplies a value that lacks a locked value
- **THEN** the pipe adds it to its value and emits no change

### Requirement: Tree-select pipe

A `tree-select` pipe SHALL open a tree of the template `values` with every node expanded. Branch nodes MUST NOT be selectable. Choosing a leaf SHALL store the node's `value` as the pipe value, emit `onChangePipe`, close the panel and show the node name on the trigger.

#### Scenario: Choosing a leaf

- **WHEN** the user opens a tree-select pipe and clicks a leaf
- **THEN** the value is that node's `value` and the panel closes

### Requirement: Multi-tree-select pipe

A `multi-tree-select` pipe SHALL show a checkbox tree, expanded on open, where checking a branch checks its subtree and a branch follows its children. The value SHALL be the array of selected node values. With `selectAll` set and options present, a first node labelled `pipe.selectAll` SHALL toggle every node. The trigger SHALL show one name or a count badge of selected nodes.

#### Scenario: Checking a branch

- **WHEN** the user checks a branch
- **THEN** the branch and every node under it are selected and `onChangePipe` emits the pipe

#### Scenario: Clearing without locked values

- **WHEN** a multi-tree-select pipe without locked values is cleared
- **THEN** its value is `null`

### Requirement: Building tree data

`kbqBuildTree(object, level)` SHALL turn each key of the object into a node named after the key, whose `value` is the key's value; a non-null object value without a truthy `value` property SHALL become a branch whose `children` are built from it, and anything else a leaf with `children: null`.

#### Scenario: Nested object

- **WHEN** `kbqBuildTree({ a: { b: 1 } }, 0)` is called
- **THEN** it returns a node "a" with one child "b" whose value is `1` and whose `children` is `null`

### Requirement: Search in pipes

With `search` set, a select-family pipe SHALL put a search field, named and labelled by `search.placeholder`, at the top of its panel. `select` and `multiselect` SHALL keep the options whose `name`, or `caption` unless a `valueTemplate` is used, contains every word of the query, ignoring case. Tree pipes SHALL filter the nodes and highlight matches. No match SHALL show `pipe.emptySearchResult`.

#### Scenario: Case-insensitive search

- **WHEN** the user types "OPTION 2" into the search field of a select pipe
- **THEN** only "Option 2" is listed

#### Scenario: Matching a caption

- **WHEN** an option has the caption "srv-01" and the user types "srv"
- **THEN** that option is listed

### Requirement: Panel height

The `select`, `multiselect`, `tree-select` and `multi-tree-select` pipes SHALL cap the scrollable list of their panel at the template's `panelMaxHeight` in pixels, and at 256px when it is omitted or `null`, the list's own padding added on top, so eight 32px options fit without scrolling.

#### Scenario: Default height

- **WHEN** a select pipe without `panelMaxHeight` lists eight options
- **THEN** the list is 256px high and does not scroll

#### Scenario: Custom height

- **WHEN** a tree-select template sets `panelMaxHeight: 128`
- **THEN** the panel's list is capped at 128px

### Requirement: Option captions and wrapping

In `select` and `multiselect` pipes, an option value with a `caption` SHALL show it as a second line under the name, and the trigger SHALL show the name alone. Both lines SHALL be truncated, with a tooltip on a clipped option, unless the template sets `multilineOptions`, which SHALL wrap them and add the panel class `kbq-pipe-select__panel_multiline` or `kbq-pipe-multiselect__panel_multiline`.

#### Scenario: Captioned option chosen

- **WHEN** the user chooses an option with the caption "srv-01"
- **THEN** the panel showed the caption under the name and the trigger shows only the name

#### Scenario: Wrapping

- **WHEN** the template sets `multilineOptions: true` and an option is longer than the panel
- **THEN** its text wraps instead of being cut

### Requirement: Custom option template

When a `select` or `multiselect` template's `valueTemplate` is a `TemplateRef`, each option SHALL render it with the context `{ $implicit: <pipe component>, option: <option value> }`, and its caption MUST NOT be shown or searched.

#### Scenario: Template with an icon

- **WHEN** the template's `valueTemplate` renders an icon and `option.name`
- **THEN** each option shows the icon and the name

### Requirement: No options message

When a `select`, `multiselect`, `tree-select` or `multi-tree-select` template has no `values`, opening the pipe SHALL show the template's `noOptionsText`, or `pipe.noOptions`, instead of a list, hide the search field and the select-all row, move focus to the trigger, and let Escape close the panel. Options supplied later SHALL replace the message.

#### Scenario: Pipe without values

- **WHEN** a select template has `values: []` and the user opens the pipe
- **THEN** the panel shows "Нет доступных опций" with the default locale and focus is on the trigger

#### Scenario: Custom message

- **WHEN** the template sets `noOptionsText: 'No tenants available'`
- **THEN** the panel shows "No tenants available"

### Requirement: Date pipe period list

A `date` or `datetime` pipe SHALL open a popover, named after the pipe, listing a "Custom period" row (`datePipe.customPeriod`) and then the template `values` as presets, and SHALL focus the list. Choosing a preset SHALL store that preset object as the value, emit `onChangePipe`, close the popover and show the preset `name` on the trigger.

#### Scenario: Choosing a preset

- **WHEN** the user opens a date pipe and chooses the preset "Last 7 days"
- **THEN** the value is that preset object and the trigger shows "Last 7 days"

### Requirement: Custom period editor

The "Custom period" row SHALL replace the list with "from" and "to" fields (`datePipe.customPeriodFrom`, `customPeriodTo`), each with a calendar shown while it has focus and hidden by Tab or Shift+Tab; `datetime` adds a time field to each. A Back button (`datePipe.backToPeriodSelection`) SHALL return to the list, and so SHALL reopening the popover.

#### Scenario: Opening the editor

- **WHEN** the user chooses "Custom period"
- **THEN** the from and to fields are shown and the Back button has focus

#### Scenario: Leaving a date field with Tab

- **WHEN** the from field shows its calendar and the user presses Tab
- **THEN** the calendar is hidden before focus moves on

### Requirement: Custom period defaults

The editor SHALL start from the stored range when the value has one. Otherwise it SHALL start from today to tomorrow for `date` and from the start to the end of today for `datetime`; a preset value with a relative `start` such as `{ days: -7 }` SHALL start there and end today. Defaults SHALL be moved into the date limits and stretched or shrunk to meet the interval limits.

#### Scenario: Empty date pipe

- **WHEN** an empty date pipe opens the custom period editor
- **THEN** the from field shows today and the to field shows tomorrow

### Requirement: Applying a custom period

Apply (`pipe.applyButton`), or Ctrl/Cmd+Enter while it is enabled, SHALL store `{ start, end }` as ISO strings, emit `onChangePipe`, close the popover and show the range formatted for the locale on the trigger. Apply SHALL be disabled while either field holds no valid date or the period is invalid. Enter without a modifier SHALL do nothing.

#### Scenario: Applying a range

- **WHEN** the user enters a valid range and presses Ctrl+Enter
- **THEN** the value has ISO `start` and `end` and the trigger shows the formatted range

### Requirement: Inverted period

When the from value is later than the to value, the editor SHALL show `datePipe.customPeriodErrorHint` as an error and disable Apply. A value that is only outside the date limits SHALL disable Apply without that hint.

#### Scenario: Start after end

- **WHEN** the from date is later than the to date
- **THEN** the hint `datePipe.customPeriodErrorHint` is shown as an error and Apply is disabled

### Requirement: Date limits

`minDateTime` and `maxDateTime` of a `date` or `datetime` template SHALL bound the calendars and fields of the custom period. The `date` pipe SHALL use whole days, the start of the first and the end of the last; `datetime` SHALL use the full instants. An unparseable or missing limit, or one from a template of another type, MUST be ignored.

#### Scenario: Day-bounded date pipe

- **WHEN** a date template sets `maxDateTime` to today at 10:00
- **THEN** today can still be chosen as the end of the period and tomorrow cannot

### Requirement: Interval limits

`minInterval` and `maxInterval`, duration-like objects such as `{ days: 3 }`, SHALL make the editor show `datePipe.customPeriodMinIntervalErrorHint` or `customPeriodMaxIntervalErrorHint`, with `{{ value }}` replaced by the limit formatted for the locale, and disable Apply when the period is shorter or longer. A non-object, a bare number or a span under one second MUST be ignored.

#### Scenario: Period too short

- **WHEN** `minInterval` is `{ days: 3 }` and the user picks a two-day period
- **THEN** the error hint names three days and Apply is disabled

#### Scenario: Bare number

- **WHEN** `minInterval` is `5`
- **THEN** no interval limit applies

### Requirement: Date pipe without presets

A `date` or `datetime` pipe whose template has no `values` SHALL open straight on the custom period editor, without the list or a Back button, and SHALL focus the from field, which shows its calendar, except after a touch, where no field is focused.

#### Scenario: No presets

- **WHEN** a date template has no `values` and the user opens the pipe with the mouse
- **THEN** the editor is shown and the from field has focus

### Requirement: Date pipe emptiness

A `date` or `datetime` pipe SHALL read as empty while its value is `null`, or has no `name` and lacks a valid `start` or `end`; a value with a `name` SHALL read as filled.

#### Scenario: Incomplete range

- **WHEN** the value has a `start` and no `end`
- **THEN** the pipe has `kbq-pipe_empty`

### Requirement: Saved filters trigger

`kbq-filters`, which requires the `filters` input, SHALL render a trigger that shows the current filter's `name`, truncated with a tooltip, or, when it has none, its projected content or an icon and `filters.defaultName`. The trigger SHALL be disabled while a save is in progress.

#### Scenario: No filter selected

- **WHEN** the filter is `null` and nothing is projected into `kbq-filters`
- **THEN** the trigger shows "Фильтры" with the default locale

### Requirement: Saved filters menu

Clicking the trigger SHALL open a menu with a search field (`filters.searchPlaceholder`), cleared and focused on every opening, the saved filters by name, the current one marked `kbq-selected`, and a last item "Save as new filter" (`filters.saveAsNewFilter`). With an empty `filters` list, the search field and the list MUST be hidden.

#### Scenario: Opening the menu

- **WHEN** nine filters are saved and the user clicks the trigger
- **THEN** the menu lists nine filters and then "Save as new filter", and the search field has focus

### Requirement: Searching saved filters

The menu SHALL list only the saved filters whose name contains the search text, ignoring case, and SHALL show a disabled item `filters.searchEmptyResult` when none does. It SHALL follow changes to the `filters` input. Keys other than Escape typed in the search field MUST NOT reach the menu, so they do not move its active item.

#### Scenario: Filtering by name

- **WHEN** the user types "alp" and the filters are "Alpha" and "Beta"
- **THEN** only "Alpha" is listed

### Requirement: Selecting a saved filter

Choosing a saved filter SHALL set the bar's filter to a copy of it with copies of its pipes, emit `filterChange`, and emit `onSelectFilter` with the saved filter itself. Later edits MUST NOT reach the saved filter object.

#### Scenario: Editing a selected filter

- **WHEN** the user selects a saved filter and changes one of its pipes
- **THEN** the saved filter in `filters` keeps its old value

### Requirement: Save and actions buttons

Next to the trigger, `kbq-filters` SHALL show a save-as-new button, named and titled by `filters.saveNewFilterTooltip`, while the filter is changed and not saved; an actions button named by `filters.actionsTooltip`, followed by a chevron, while it is saved; and a vertical divider otherwise.

#### Scenario: Unsaved changes

- **WHEN** the filter has `changed: true` and `saved: false`
- **THEN** the save-as-new button and the divider are shown and the actions button is not

### Requirement: Saved filter actions

The actions menu SHALL list, in order: "Save" when saved, changed and not read-only; "Save as new"; "Rename" when not read-only; "Reset" when saved and changed; "Delete" when not read-only, using `filters.saveChangesButton`, `saveAsNewButton`, `change`, `resetChanges` and `remove`.

#### Scenario: Changed saved filter

- **WHEN** the filter is saved, changed and not read-only and the user opens the actions menu
- **THEN** it lists Save, Save as new, Rename, Reset and Delete in that order

#### Scenario: Read-only saved filter

- **WHEN** the filter is saved, unchanged and read-only
- **THEN** the actions menu lists only Save as new

### Requirement: Saving changes to a saved filter

"Save" SHALL set the bar's filter to a copy with `saved: true` and `changed: false`, then emit `onSave` with that filter, the bar and the status `onlyChanges`. It MUST do nothing while the filter is `null`.

#### Scenario: Saving changes

- **WHEN** the user chooses Save on a changed saved filter
- **THEN** the filter has `changed: false` and `onSave` emits it with status `onlyChanges`

### Requirement: Save popover

"Save as new" and the save-as-new button SHALL open a popover titled `filters.saveAsNewHeader`, and "Rename" one titled `filters.saveChangesHeader`; the title SHALL also name its field. The field SHALL be required, start with the current filter's name, and get focus. Cancel (`filters.cancelButton`) SHALL close it and return focus.

#### Scenario: Renaming

- **WHEN** the user chooses Rename on the filter "Existing"
- **THEN** a popover titled "Новое название" opens with "Existing" in its focused field

### Requirement: Submitting the save popover

Save (`filters.saveButton`) or Enter in the field SHALL, when the name is valid, emit `onSave` with a copy of the filter carrying the new name and the status `newFilter`, with `saved: true` and `changed: false`, or `newName`, flags untouched. It SHALL then disable the field and buttons and keep the popover open. It MUST NOT change the bar's filter or emit `onChangeFilter`, which nothing emits.

#### Scenario: Saving a new filter

- **WHEN** the user enters "Mine" in the new-filter popover and presses Enter
- **THEN** `onSave` emits a filter named "Mine" with `saved: true`, `changed: false` and status `newFilter`
- **AND** the bar's filter is unchanged

#### Scenario: Renaming a filter

- **WHEN** the user enters a new name in the rename popover and activates Save
- **THEN** `onSave` emits the renamed filter with status `newName` and its `saved` and `changed` flags as they were
- **AND** `onChangeFilter` does not fire

#### Scenario: Empty name

- **WHEN** the field is empty and the user activates Save
- **THEN** `onSave` does not fire

### Requirement: Save outcome

`filterSavedSuccessfully()` SHALL end the saving state, close the popover and return focus to the control that opened it, or to the trigger. `filterSavedUnsuccessfully(error?)` SHALL end the saving state, enable the field, show an alert with `error.text` or `filters.errorHint`, mark the field invalid when `error.nameAlreadyExists` is set, and focus Save. Editing the name SHALL hide the alert.

#### Scenario: Name already taken

- **WHEN** the application calls `filterSavedUnsuccessfully({ nameAlreadyExists: true })`
- **THEN** the popover shows the alert with `filters.errorHint`, the field has `aria-invalid="true"` and no separate field error is shown

#### Scenario: Retry after an edit

- **WHEN** the user changes the name after a failed save
- **THEN** the alert disappears and Save emits `onSave` again

### Requirement: Resetting saved filter changes

"Reset" in the actions menu SHALL set the filter's `changed` to `false` and emit `onResetFilterChanges` with the updated filter. It MUST NOT restore pipe values; the application restores the saved values.

#### Scenario: Resetting changes

- **WHEN** the user chooses Reset on a changed saved filter
- **THEN** `onResetFilterChanges` emits the filter with `changed: false` and its current pipe values

### Requirement: Deleting a saved filter

"Delete" SHALL emit `onRemoveFilter` with the current filter and then move focus to the `kbq-filters` trigger. It MUST NOT change the bar's filter or the `filters` list.

#### Scenario: Deleting

- **WHEN** the user chooses Delete
- **THEN** `onRemoveFilter` emits the current filter and the trigger receives focus

### Requirement: State saving switch and key

The bar SHALL persist its state while `useStateSaving` is on, which defaults to `KBQ_STATE_SAVING_ENABLED` (`true` unless provided otherwise), under `stateSavingKey`, or a key derived from the bar's place in the document when that is empty. A bar outside the document MUST NOT read or write. A changed key SHALL restore from the new key.

#### Scenario: Turned off

- **WHEN** the bar has `[useStateSaving]="false"` and the user changes the filter
- **THEN** the stored entry is left as it was and nothing is restored

### Requirement: Persisted state

After the stored state has been read, every new filter SHALL be persisted as `{ name, changed, pipes: [{ id, value }] }`, where `id` is the pipe identity and `value` is the value or `null`. A `null` filter SHALL remove the entry instead.

#### Scenario: Pipe value change

- **WHEN** the filter "Saved" has a pipe "TestText" whose value changes to "typed"
- **THEN** the store holds `{ name: 'Saved', changed: true, pipes: [{ id: 'TestText', value: 'typed' }] }`

#### Scenario: Nothing selected

- **WHEN** the filter becomes `null`
- **THEN** the stored entry is removed

### Requirement: Restoring persisted state

On initialization the bar SHALL rebuild the stored filter and set it through the `filter` model, emitting `filterChange`: the saved filter with the stored name from `kbq-filters`, or the current filter for an unnamed state. Stored pipes SHALL be copies of the base filter's pipes or built from `pipeTemplates`, with the stored values and `changed` flag. The application's objects MUST NOT be modified.

#### Scenario: Restoring a saved filter

- **WHEN** the store holds the filter "Saved" with the value "kept" and the list contains "Saved"
- **THEN** the bar's filter is "Saved" with that value, and the object in the list keeps its own value

#### Scenario: Pipe added by the user

- **WHEN** the stored state holds a pipe that only exists in `pipeTemplates`
- **THEN** the restored filter contains a pipe built from that template with the stored value

### Requirement: Restore waits for data

A stored named filter SHALL be applied once a filter with that name appears in the `kbq-filters` list, and a stored pipe once its template arrives. Any other change of the filter before that SHALL drop the stored state. With no `kbq-filters` projected, it SHALL apply only over a current filter with the same name. A malformed entry MUST be ignored.

#### Scenario: List arrives late

- **WHEN** the stored filter is "Late" and the list is empty at first, then gains "Late"
- **THEN** the bar's filter becomes "Late"

#### Scenario: Application wins

- **WHEN** the application sets another filter while the stored one is still waiting
- **THEN** the application's filter stays and the stored one is dropped

#### Scenario: Unusable entry

- **WHEN** the stored entry is `{ name: 'Saved' }` without `changed` and `pipes`
- **THEN** nothing is restored

### Requirement: Clearing persisted state

`clearSavedState()` SHALL remove the stored entry while persistence stays on, so the next change is written again. `hasSavedState` SHALL be `true` while a state has been restored or written, and `false` after `clearSavedState()` and while `useStateSaving` is `false`.

#### Scenario: Clear and continue

- **WHEN** state was written, `clearSavedState()` is called and the filter then changes
- **THEN** `hasSavedState` was `false` after the call and the store holds the new filter

### Requirement: Localized strings

The bar and every part inside it SHALL take their strings from the `filterBar` section of the active locale, falling back to `KBQ_FILTER_BAR_LOCALE_CONFIGURATION`, whose default is the `ru-RU` text, and SHALL re-render when `KbqLocaleService` changes locale. `kbqFilterBarLocaleConfigurationProvider` and the bar's `[localeOverrides]` SHALL override only the strings they set.

#### Scenario: Locale change

- **WHEN** the locale service switches locale
- **THEN** the reset button and the filters trigger show the new locale's text

#### Scenario: Partial override

- **WHEN** `kbqFilterBarLocaleConfigurationProvider({ filters: { defaultName: 'External name' } })` is provided and the locale changes
- **THEN** the trigger keeps "External name" and the other strings follow the locale

### Requirement: Accessible names

Icon-only buttons and unlabelled fields SHALL carry names from the locale: `kbq-pipe-add` (`add.tooltip`), the save-as-new and actions buttons, the clear and remove buttons, the search fields of pipes (`search.placeholder`) and of the saved-filter menu (`filters.searchPlaceholder`), the date pipe's period list and popover (the pipe name), and its from and to fields (their labels).

#### Scenario: Date pipe fields

- **WHEN** a date pipe named "Date" opens and the user then chooses "Custom period"
- **THEN** the popover and its period list are named "Date"
- **AND** in the editor each field is labelled by its "from" or "to" label

### Requirement: Refresher control

`kbq-filter-refresher` SHALL render two buttons named by `refresher.refresh` and `refresher.settings`, using the default strings outside a bar. It SHALL have no inputs or outputs of its own.

#### Scenario: Refresher in a bar

- **WHEN** a `kbq-filter-refresher` is placed in the bar
- **THEN** it is rendered in the right section with a "Обновить" and a "Настройки обновления" button under the default locale

### Requirement: Pipe registry and custom pipes

`KBQ_FILTER_BAR_PIPES` SHALL default at the root to the map `defaultFilterBarPipes` of the nine `KbqPipeTypes`, which `kbqFilterBarPipesProvider()` also provides; a provider of another map SHALL add or replace types. A custom pipe SHALL be able to extend `KbqBasePipe`, provide itself as `KbqBasePipe` and reuse `kbqPipeState` and `kbq-pipe-button`, receiving the pipe object as `data`, the host classes, clearing, removal and `open()` on `openOnAdd`.

#### Scenario: Registering a custom pipe

- **WHEN** a component provides `KBQ_FILTER_BAR_PIPES` with `defaultFilterBarPipes` plus `['colorPipe', ColorPipeComponent]`
- **THEN** a pipe with `type: 'colorPipe'` inside it renders `ColorPipeComponent`

#### Scenario: Color pipe

- **WHEN** the docs example's color pipe is registered and added from `kbq-pipe-add`
- **THEN** it renders with the pipe host classes, opens its popover, and its remove button removes it
