# filter-bar Specification Delta

## MODIFIED Requirements

### Requirement: Pipe host classes

Every built-in pipe host SHALL carry the class `kbq-pipe` and `kbq-pipe__<type>`, plus `kbq-pipe_empty` while the pipe reads as empty, which a pipe can do while holding a value (a date range without its end, only locked values, every option selected under "all selected equals nothing selected"), and `kbq-pipe_cleanable`, `kbq-pipe_removable` and `kbq-pipe_disabled` while the pipe object's `cleanable`, `removable` and `disabled` are set.

#### Scenario: Required pipe

- **WHEN** a pipe that does not read as empty has `cleanable`, `removable` and `disabled` all `false`
- **THEN** its host has none of `kbq-pipe_empty`, `kbq-pipe_cleanable`, `kbq-pipe_removable`, `kbq-pipe_disabled`

#### Scenario: Empty cleanable pipe

- **WHEN** a cleanable pipe has the value `null`
- **THEN** its host has `kbq-pipe_empty` and `kbq-pipe_cleanable`

#### Scenario: Incomplete date range

- **WHEN** a date pipe has a value with a `start` and no `end`
- **THEN** its host has `kbq-pipe_empty`

### Requirement: Pipe options follow the templates

A pipe SHALL take `values`, `valueTemplate`, `compareWith`, `lockedValues`, `panelMaxHeight`, `multilineOptions`, `noOptionsText` and the date limits from the `pipeTemplates` entry with its identity, and SHALL follow later changes to `pipeTemplates`. A later template without `values` SHALL keep the previous `values` and `valueTemplate`, while the other options SHALL take the new template's value, `undefined` included.

#### Scenario: Options supplied late

- **WHEN** a select pipe is rendered before its template's `values` arrive and the user opens it after they do
- **THEN** the panel lists the new options

#### Scenario: Option dropped by a later template

- **WHEN** a template that set `compareWith` is replaced by one without it
- **THEN** the pipe uses the default comparator again

#### Scenario: Later template without values

- **WHEN** a select template with `values` and a `valueTemplate` is replaced by one with neither
- **THEN** the pipe still lists the previous options, rendered with the previous `valueTemplate`

### Requirement: Pipe fill state

The `kbqPipeState` directive SHALL style the button it is placed on as filled while its pipe does not read as empty and as outline while it does, and SHALL follow every change of emptiness: a value applied by the user, a clear, a filter replaced from outside, and a template change that makes the pipe empty or not. Built-in pipes SHALL apply it to the trigger and the clear or remove button.

#### Scenario: Value applied after initialization

- **WHEN** an empty cleanable pipe receives a value
- **THEN** both its trigger and its clear button are filled

#### Scenario: Cleared by its own button

- **WHEN** the user clears a pipe with its clear button
- **THEN** its trigger is outlined

#### Scenario: Only locked values

- **WHEN** a multi-select pipe holds only its locked values
- **THEN** its trigger is outlined

### Requirement: Clear and remove button visibility

Every pipe but `input` SHALL show its clear or remove button while `removable` is set, or while `cleanable` is set and the pipe does not read as empty; otherwise the button MUST NOT be rendered. The `input` pipe never renders this button, whatever `removable` says. With `disabled` set, the button SHALL be disabled and its tooltip off.

#### Scenario: Required pipe

- **WHEN** a pipe has neither `cleanable` nor `removable`
- **THEN** it has no clear or remove button and its value can only be changed

#### Scenario: Empty cleanable pipe

- **WHEN** a cleanable, non-removable pipe has no value
- **THEN** no clear button is shown

#### Scenario: Removable input pipe

- **WHEN** an `input` pipe has `removable: true`
- **THEN** no remove button is rendered

### Requirement: Focus returns to the pipe trigger

After a value is chosen or applied in a select, tree-select, text, date or datetime pipe, or the panel of a multi-select or multi-tree-select pipe closes, focus SHALL return to the pipe's trigger with the current input modality, so the focus ring shows for keyboard use only. Toggling an option of a multi-select or multi-tree-select pipe MUST NOT move focus. Focus MUST NOT be taken back when it has moved to an element outside the pipe and outside any overlay.

#### Scenario: Applying text with the keyboard

- **WHEN** the user applies a text pipe with Ctrl+Enter
- **THEN** focus is on the pipe's trigger with a keyboard focus ring

#### Scenario: Closing by clicking another control

- **WHEN** a multi-select panel closes because the user clicked a button elsewhere on the page
- **THEN** focus stays on that button

#### Scenario: Toggling a multi-select option

- **WHEN** the user toggles an option in the open panel of a multi-select pipe
- **THEN** the panel stays open and focus is not moved to the trigger

### Requirement: All selected equals nothing selected

`selectedAllEqualsSelectedNothing` on the bar (default `true`), overridden by the pipe's own flag, SHALL make a multi-select or multi-tree-select pipe store and emit `[]` once every option the user can toggle is selected. The pipe SHALL then read as empty and show no count. The options SHALL stay selected until the panel closes; reopening it SHALL show only the locked values selected. With the flag `false` the full array SHALL be kept.

#### Scenario: Selecting everything

- **WHEN** the flag is on and the user selects every option of a multi-select pipe without locked values
- **THEN** `onChangePipe` carries the value `[]` and the pipe has `kbq-pipe_empty`
- **AND** after the panel is closed and opened again, no option is selected

#### Scenario: Flag off

- **WHEN** the bar has `[selectedAllEqualsSelectedNothing]="false"` and the user selects every option
- **THEN** the value lists every option

### Requirement: Multi-tree-select pipe

A `multi-tree-select` pipe SHALL show a checkbox tree, expanded on open, where checking a branch checks its subtree and a branch follows its children. The value SHALL be the array of selected node values. With `selectAll` set and options present, a first node labelled `pipe.selectAll` SHALL toggle every node, or only the nodes the search shows while a query is entered. The trigger SHALL show one name or a count badge of selected nodes.

#### Scenario: Checking a branch

- **WHEN** the user checks a branch
- **THEN** the branch and every node under it are selected and `onChangePipe` emits the pipe

#### Scenario: Clearing without locked values

- **WHEN** a multi-tree-select pipe without locked values is cleared
- **THEN** its value is `null`

#### Scenario: Select all with a search query

- **WHEN** a search query is entered and the user activates the `pipe.selectAll` node
- **THEN** only the nodes the search shows are toggled

### Requirement: Search in pipes

With `search` set, a select-family pipe SHALL put a search field, named and labelled by `search.placeholder`, at the top of its panel. `select` and `multiselect` SHALL keep the options in which every word of the query is found, ignoring case, in the `name` or, unless a `TemplateRef` `valueTemplate` renders the option, in the `caption`; the words may be split between the two. Tree pipes SHALL filter the nodes and highlight matches. No match SHALL show `pipe.emptySearchResult`.

#### Scenario: Case-insensitive search

- **WHEN** the user types "OPTION 2" into the search field of a select pipe
- **THEN** only "Option 2" is listed

#### Scenario: Matching a caption

- **WHEN** an option has the caption "srv-01" and the user types "srv"
- **THEN** that option is listed

#### Scenario: Words split between name and caption

- **WHEN** an option is named "Alpha" with the caption "srv-01" and the user types "alpha srv"
- **THEN** that option is listed

### Requirement: Date pipe period list

A `date` or `datetime` pipe SHALL open a popover, named after the pipe, listing a "Custom period" row (`datePipe.customPeriod`) and then the template `values` as presets, and SHALL focus the list. Choosing a preset SHALL store that preset object as the value, emit `onChangePipe`, close the popover and show on the trigger the preset `name`, or the range formatted for the locale when the preset's `start` and `end` both parse as dates.

#### Scenario: Choosing a preset

- **WHEN** the user opens a date pipe and chooses the preset "Last 7 days"
- **THEN** the value is that preset object and the trigger shows "Last 7 days"

#### Scenario: Preset with a fixed range

- **WHEN** the user chooses a preset named "Q1" whose `start` and `end` are ISO strings
- **THEN** the trigger shows that range formatted for the locale, not "Q1"

### Requirement: Save popover

"Save as new" and the save-as-new button SHALL open a popover titled `filters.saveAsNewHeader`, and "Rename" one titled `filters.saveChangesHeader`; the title SHALL also name its field. The field SHALL start with the current filter's name, get focus and open without an error, even when it starts empty, and SHALL become invalid once the user empties it. Cancel (`filters.cancelButton`) SHALL close it and return focus.

#### Scenario: Renaming

- **WHEN** the user chooses Rename on the filter "Existing"
- **THEN** a popover titled "Новое название" opens with "Existing" in its focused field

#### Scenario: Filter without a name

- **WHEN** the save-as-new popover opens for a filter whose name is empty
- **THEN** its field is empty and not invalid

### Requirement: Submitting the save popover

Save (`filters.saveButton`) or Enter in the field SHALL, unless the field is invalid, disable the field and buttons, keep the popover open and emit `onSave` with a copy of the filter carrying the new name and the status `newFilter`, with `saved: true` and `changed: false`, or `newName`, flags untouched. A field left empty since the popover opened is not invalid, so an empty name is emitted. It MUST NOT change the bar's filter or emit `onChangeFilter`, which nothing emits.

#### Scenario: Saving a new filter

- **WHEN** the user enters "Mine" in the new-filter popover and presses Enter
- **THEN** `onSave` emits a filter named "Mine" with `saved: true`, `changed: false` and status `newFilter`
- **AND** the bar's filter is unchanged

#### Scenario: Renaming a filter

- **WHEN** the user enters a new name in the rename popover and activates Save
- **THEN** `onSave` emits the renamed filter with status `newName` and its `saved` and `changed` flags as they were
- **AND** `onChangeFilter` does not fire

#### Scenario: Empty name

- **WHEN** the user erases the name in the field and activates Save
- **THEN** `onSave` does not fire

#### Scenario: Unedited empty field

- **WHEN** the new-filter popover opens for a filter whose name is empty and the user activates Save without typing
- **THEN** `onSave` emits a filter whose name is empty

### Requirement: State saving switch and key

The bar SHALL read its state once, while it initializes, and persist it from then on while `useStateSaving` is on, which defaults to `KBQ_STATE_SAVING_ENABLED` (`true` unless provided otherwise), under `stateSavingKey`, or a key derived from the bar's place in the document when that is empty. A bar that initializes with `useStateSaving` off or outside the document MUST NOT read or write, even once turned on or attached. A changed key SHALL restore from the new key.

#### Scenario: Turned off

- **WHEN** the bar has `[useStateSaving]="false"` and the user changes the filter
- **THEN** the stored entry is left as it was and nothing is restored

#### Scenario: Turned on after initialization

- **WHEN** the bar initializes with `[useStateSaving]="false"`, the binding then becomes `true` and the user changes the filter
- **THEN** nothing is written to the store

### Requirement: Restore waits for data

A stored named filter SHALL be applied once a filter with that name appears in the `kbq-filters` list. While none of the stored pipes can be rebuilt from that filter or `pipeTemplates`, the state SHALL wait; once one can, it SHALL be applied without the pipes that cannot be rebuilt yet. Any other change of the filter before that SHALL drop the stored state. With no `kbq-filters` projected, it SHALL apply only over a current filter with the same name. A malformed entry MUST be ignored.

#### Scenario: List arrives late

- **WHEN** the stored filter is "Late" and the list is empty at first, then gains "Late"
- **THEN** the bar's filter becomes "Late"

#### Scenario: Application wins

- **WHEN** the application sets another filter while the stored one is still waiting
- **THEN** the application's filter stays and the stored one is dropped

#### Scenario: Unusable entry

- **WHEN** the stored entry is `{ name: 'Saved' }` without `changed` and `pipes`
- **THEN** nothing is restored

#### Scenario: Template still missing

- **WHEN** the stored filter "Saved" holds one of its own pipes and a pipe that only `pipeTemplates` can build, and `pipeTemplates` is empty while the bar initializes
- **THEN** "Saved" is restored without the second pipe, which does not come back when the templates arrive

### Requirement: Pipe registry and custom pipes

`KBQ_FILTER_BAR_PIPES` SHALL default at the root to the map `defaultFilterBarPipes` of the nine `KbqPipeTypes`, which `kbqFilterBarPipesProvider()` also provides; another provided map SHALL replace it whole, built-in types included. A custom pipe SHALL be able to extend `KbqBasePipe`, provide itself as `KbqBasePipe` and reuse `kbqPipeState` and `kbq-pipe-button`, receiving the pipe object as `data`, the host classes, clearing, removal and `open()` on `openOnAdd`.

#### Scenario: Registering a custom pipe

- **WHEN** a component provides `KBQ_FILTER_BAR_PIPES` with `defaultFilterBarPipes` plus `['colorPipe', ColorPipeComponent]`
- **THEN** a pipe with `type: 'colorPipe'` inside it renders `ColorPipeComponent`

#### Scenario: Color pipe

- **WHEN** the docs example's color pipe is registered and added from `kbq-pipe-add`
- **THEN** it renders with the pipe host classes, opens its popover, and its remove button removes it

#### Scenario: Map without the built-in types

- **WHEN** a component provides `KBQ_FILTER_BAR_PIPES` with only `['colorPipe', ColorPipeComponent]`
- **THEN** a `select` pipe inside it throws "Can't find component for this type: select"
