# Spec Delta

## Purpose

Describes what `@koobiq/components/tree` guarantees to consumers: how a tree renders and expands the nodes of its data source, how `kbq-tree-selection` lets users select them with a pointer, the keyboard or assistive technology, how the selection reaches Angular forms, and how filtering, "select all" and state saving behave.

## ADDED Requirements

### Requirement: Rendering nodes from a data source

A tree (`kbq-tree` or `kbq-tree-selection`) SHALL render one row per node its data source emits, in the emitted order and flat inside the tree element, once it has both a data source and at least one node definition. Every emitted node SHALL be rendered; there is no windowing. `nodesCount` of `kbq-tree-selection` SHALL report the number of rendered data rows, without the select-all row.

#### Scenario: Collapsed flat data

- **WHEN** a `kbq-tree-selection` is bound to a flat data source whose five root nodes are all collapsed
- **THEN** five rows render, one per root node, in data order
- **AND** `nodesCount` is 5

#### Scenario: Expanded branch

- **WHEN** the `Pictures` branch with three children is expanded
- **THEN** its three children render right after it

### Requirement: Accepted data sources

The `dataSource` input SHALL accept an array, rendered as given; an `Observable` of arrays, rendered on every emission; or an object with a `connect` function, which the tree connects to with itself as the collection viewer and disconnects from when the source is replaced or the tree is destroyed. Any other value MUST make the first render throw "A valid data source must be provided."

#### Scenario: Observable source

- **WHEN** `dataSource` is a `BehaviorSubject` of nodes and it emits a new array
- **THEN** the rows follow the new array

#### Scenario: Unsupported value

- **WHEN** `dataSource` is an object that is not an array, not an `Observable` and has no `connect` function
- **THEN** rendering throws "A valid data source must be provided."

### Requirement: Replacing the data source

Binding a different data source SHALL remove every row of the previous one and render the new one instead of appending to it. Binding `null` or `undefined` SHALL clear the rows, and the `dataSource` property SHALL then read `null`. A replaced source, and the source of a destroyed tree, MUST no longer render into the tree.

#### Scenario: Swapping sources

- **WHEN** a tree showing five rows is bound to another flat data source with the same five root nodes
- **THEN** five rows render, not ten

#### Scenario: Source set back to undefined

- **WHEN** `dataSource` is bound to `undefined` and the previous source then receives new data
- **THEN** no rows render and `dataSource` reads `null`

#### Scenario: Destroyed tree

- **WHEN** the tree is destroyed and its former data source receives new data
- **THEN** nothing is rendered into the tree element

### Requirement: Node definitions

Each row SHALL be stamped from a `*kbqTreeNodeDef` template: the only one when there is one, otherwise the first whose `when` predicate returns `true` for the index and node, falling back to the one without `when`. Two definitions without `when` MUST throw "There can only be one default row without a when predicate function.", and a node that nothing matches MUST throw "Could not find a matching node definition for the provided node data."

#### Scenario: Template chosen by a predicate

- **WHEN** a tree has a default definition and a second one with `when: isSpecial`, and only leaves are special
- **THEN** leaf rows use the second template and branch rows use the default one

#### Scenario: Two default definitions

- **WHEN** a tree has two `*kbqTreeNodeDef` templates without `when`
- **THEN** the tree throws "There can only be one default row without a when predicate function."

### Requirement: Node template context

A node template SHALL receive the node as its implicit value, the row's position in the rendered list as `index`, and its depth as `level`, read from the tree control's `getLevel` or 0 when the control has none. The `count` member of the context MUST stay unset.

#### Scenario: Row index

- **WHEN** the template binds `let i = index` to a `data-index` attribute and five rows render
- **THEN** the rows carry `data-index` values 0 to 4 in order

### Requirement: Tree control is required

A tree without a `treeControl` MUST throw "Could not find a tree control for the tree." when it initializes. `kbq-tree-selection` SHALL accept only a `FlatTreeControl`; `kbq-tree` SHALL accept any `TreeControl`, a `NestedTreeControl` included.

#### Scenario: Missing tree control

- **WHEN** a `kbq-tree-selection` is rendered without a `treeControl` binding
- **THEN** it throws "Could not find a tree control for the tree."

### Requirement: Plain tree

`kbq-tree` SHALL render its nodes with `kbq-tree-node` rows and offer no selection, keyboard handling or focus management of its own. Its host SHALL have the class `kbq-tree` and `role="tree"`; each `kbq-tree-node` SHALL have `role="treeitem"` and an `aria-level` one greater than its level.

#### Scenario: Nested control without levels

- **WHEN** a `kbq-tree` on a `NestedTreeControl` renders its root nodes
- **THEN** every `kbq-tree-node` has `role="treeitem"` and `aria-level="1"`

### Requirement: Flattening nested data

`KbqTreeFlattener` SHALL turn nested data into a flat, depth-first list, calling its transform function with each node, its depth starting at 0 and its flattened parent (`null` for a root). It SHALL read children only of nodes whose flattened form `isExpandable` reports, from an array or from the first emission of an `Observable`.

#### Scenario: Depth-first order

- **WHEN** `root` holds `documents` (which holds `draft`) and `images`, followed by the root `other`
- **THEN** the flat list is `root`, `documents`, `draft`, `images`, `other` with levels 0, 1, 2, 1, 0

#### Scenario: Children from an Observable

- **WHEN** `getChildren` returns `of(children)`
- **THEN** the flat list is the same as with arrays

### Requirement: Flat data source

`KbqTreeFlatDataSource` SHALL flatten the data assigned to `data` or passed to its constructor and set the flat list as the tree control's `dataNodes`. When connected, it SHALL emit the flat nodes whose ancestors are all expanded, and emit again whenever the expansion or the data changes. `data` SHALL be readable inside a `computed()` and follow later assignments.

#### Scenario: Nothing expanded

- **WHEN** the data source is connected while no node is expanded
- **THEN** it emits only the root nodes

#### Scenario: Expanding a node

- **WHEN** the root `root` is expanded through the tree control
- **THEN** the data source emits `root`, its children and the other roots
- **AND** a grandchild stays hidden while its own parent is collapsed

### Requirement: Expansion through the tree control

`expand`, `collapse` and `toggle` of a tree control SHALL change one node's expanded state, which `isExpanded` SHALL report. `expandDescendants`, `collapseDescendants` and `toggleDescendants` SHALL apply to a node and its whole subtree, `expandAll` SHALL expand every node in `dataNodes`, and `collapseAll` SHALL collapse every node. A rendered tree SHALL follow these changes without further action.

#### Scenario: Expand and collapse

- **WHEN** one node is expanded, a second toggled and the first collapsed
- **THEN** only the second node is expanded

#### Scenario: Expanding from code

- **WHEN** the application calls `treeControl.expand()` on a rendered branch
- **THEN** its children render and the row reports `aria-expanded="true"`

### Requirement: Tree control lookups

On a `FlatTreeControl` whose `dataNodes` are flattened depth-first, `getDescendants` SHALL return a node's whole subtree, `getParents` its ancestors outermost first (empty for a root or a node outside the data), and `hasValue` the first node whose `getValue` result matches by `compareValues` (strict equality by default), or `undefined`. `NestedTreeControl.getDescendants` SHALL collect only children that `getChildren` emits synchronously.

#### Scenario: Ancestors

- **WHEN** `getParents` is called for `draft`, nested in `specs`, `documents` and `root`
- **THEN** it returns `root`, `documents`, `specs` in that order

#### Scenario: Unknown value

- **WHEN** `hasValue` is called with a value no node has
- **THEN** it returns `undefined`

### Requirement: Indentation of nodes

`kbqTreeNodePadding` SHALL indent a row by `kbqTreeNodePaddingIndent` (12 by default; a number means pixels, a string keeps its units): a root row by the indent minus 2, a deeper row by its level times the indent plus the indent. A row with no toggle SHALL get 24 more so its label lines up with rows that have one. Both corrections SHALL use the indent's units. In a right-to-left layout the padding SHALL go on the right.

#### Scenario: Default indent with toggles

- **WHEN** rows at levels 0, 1 and 2 each project a toggle
- **THEN** their left padding is 10px, 24px and 36px

#### Scenario: Rows without a toggle

- **WHEN** the same rows have no toggle
- **THEN** their left padding is 34px, 48px and 60px

#### Scenario: Indent with units

- **WHEN** the indent is `'10em'` and every row has a toggle
- **THEN** the paddings are 8em, 20em and 30em

#### Scenario: Indent changed later

- **WHEN** the indent is changed to 40 after the rows render
- **THEN** every row is indented again with the new value

### Requirement: Toggling a node from its row

Clicking a `kbq-tree-node-toggle` element, or an element with the `kbqTreeNodeToggle` directive, inside a node SHALL expand the node when it is collapsed and collapse it when it is expanded, and the click MUST NOT select the row. With `kbqTreeNodeToggleRecursive` set, it SHALL expand or collapse the node's whole subtree instead.

#### Scenario: Expanding and collapsing

- **WHEN** the user clicks the toggle of the collapsed `src` row twice
- **THEN** its children appear after the first click and disappear after the second
- **AND** the selection stays empty

#### Scenario: Recursive toggle

- **WHEN** `kbqTreeNodeToggleRecursive` is set and the user clicks the toggle of `src`
- **THEN** `src` and every branch below it are expanded

### Requirement: Toggle state

A toggle SHALL be disabled while its `disabled` input is set or while a filter is active, then carry the `disabled` attribute and ignore clicks; a `kbq-tree-node-toggle` element SHALL also carry `aria-disabled="true"`. A `kbq-tree-node-toggle` SHALL carry the `kbq-expanded` class while the node bound to its `node` input is expanded; without a `node` binding the class MUST NOT appear, though a click still toggles the row's node.

#### Scenario: Disabled toggle

- **WHEN** the toggle of `src` has `disabled` set and the user clicks it
- **THEN** `src` stays collapsed

#### Scenario: Filter disables toggles

- **WHEN** a text filter is applied
- **THEN** every toggle reports itself disabled until the filter is cleared

#### Scenario: Expanded class

- **WHEN** the toggle is bound with `[node]="node"` and the user expands the node
- **THEN** the toggle element carries `kbq-expanded`

### Requirement: Text filter

`filterNodes(query)` of a `FlatTreeControl` SHALL keep the nodes whose view value matches the query together with all their ancestors, in tree order, expand every kept branch, publish the query on `filterValue` a microtask later, and make a connected flat data source emit only the kept nodes. A query that matches nothing SHALL leave the tree empty.

#### Scenario: Match below a collapsed branch

- **WHEN** the tree is filtered by `Sun`, a child of the collapsed `Pictures`
- **THEN** exactly two rows render: `Pictures` and `Sun`

#### Scenario: No match

- **WHEN** the tree is filtered by a query no node matches
- **THEN** no rows render

### Requirement: Expansion while filtering

While `filterValue` is not empty, `expand`, `collapse` and `toggle` of the tree control MUST do nothing. Filtering with an empty query SHALL end the filter: the data source SHALL emit the expansion state again, and the expansion in place before the first query SHALL be restored.

#### Scenario: Clearing the filter

- **WHEN** `Pictures` is expanded, the tree is filtered by `app`, and the filter is then cleared with an empty query
- **THEN** the eight rows shown before the filter render again, `Pictures` expanded

### Requirement: Default view value matching

By default a node SHALL match a query when its `getViewValue` result contains the query, ignoring case, with characters that are special in regular expressions matched literally. A `compareViewValues` function passed to the `FlatTreeControl` constructor SHALL replace this test. A node whose `value` property equals `kbqTreeSelectAllValue` SHALL always match, unless it would be the only match.

#### Scenario: Case-insensitive match

- **WHEN** the tree is filtered by `DRAFT`
- **THEN** the node `draft` is kept

#### Scenario: Select-all node

- **WHEN** a node with `value: 'selectAll'` leads the data and the query matches only `draft`
- **THEN** the result is the select-all node and `draft`
- **AND** a query that matches nothing returns an empty result

### Requirement: Filter pipelines

`setFilters(...stages)` SHALL replace the stages `filterNodes` runs in order, each handed the previous stage. `FilterByValues` SHALL return the previous stage's nodes plus the nodes whose `getValue` result is among the values given to `setValues`, without repeats; `FilterParentsForNodes` SHALL return the previous stage's nodes with their ancestors, in tree order.

#### Scenario: Showing only the selected nodes

- **WHEN** the stages are the text filter, `FilterByValues` set to the selected values and `FilterParentsForNodes`, two root nodes are selected and `filterNodes(null)` runs
- **THEN** only those two rows render

### Requirement: Selection modes

The `multiple` input of `kbq-tree-selection` SHALL set the selection mode: absent, `false`, `'false'`, `null` or `undefined` mean single selection; a bare `multiple`, `true`, `'true'` or `'checkbox'` mean multiple selection with a checkbox in every row; `'keyboard'` means multiple selection without checkboxes. Any other value SHALL fall back to single selection with a dev-mode warning. `multipleMode` SHALL report the mode, `null` for single selection.

#### Scenario: Checkbox mode

- **WHEN** `multiple="checkbox"` is bound
- **THEN** `multipleMode` is `checkbox` and every row renders a pseudo-checkbox

#### Scenario: Binding turns undefined

- **WHEN** a bound `multiple` changes to `undefined`
- **THEN** the tree switches to single selection

### Requirement: Changing the mode at runtime

`multiple` and `multipleMode` SHALL be changeable at any time. Narrowing to single selection SHALL keep one node — the first selected one in render order, else the first in selection order — and emit `selectionChange` for the dropped rendered options. Every change between single and multiple selection SHALL report the value to the form again, once per tick, shaped for the new mode.

#### Scenario: Narrowing keeps the first node

- **WHEN** the first two rows are selected in checkbox mode and `multiple` is set to `false`
- **THEN** only the first row's node stays selected
- **AND** the form receives its bare value
- **AND** `selectionChange` carries the second row's option

#### Scenario: Widening again

- **WHEN** the tree is switched back to `checkbox`
- **THEN** the form receives an array holding the kept value

#### Scenario: Several changes in one tick

- **WHEN** `multipleMode` is set to `null` and back to `checkbox` in the same tick
- **THEN** the form receives one report

### Requirement: Mode of a tree inside a tree-select

When a `kbq-tree-select` owns the tree's selection model, changing between single and multiple selection MUST throw "Cannot change the multiplicity of `multiple` on a `kbq-tree-selection` rendered inside a `kbq-tree-select`: the select owns the selection model. Set `multiple` on the select instead." Switching between `checkbox` and `keyboard` SHALL still be allowed.

#### Scenario: Narrowing a shared model

- **WHEN** the tree's selection model belongs to a tree-select and `multipleMode` is set to `null`
- **THEN** the tree throws that error and keeps the shared model

#### Scenario: Changing only the presentation

- **WHEN** the same tree is switched from `checkbox` to `keyboard`
- **THEN** the checkboxes go away and the shared model stays in place

### Requirement: Defaults derived from the mode

`autoSelect` and `noUnselectLast` SHALL default to `true`, and to `false` in `checkbox` mode, and SHALL follow later mode changes until they are bound or assigned. An assigned value SHALL survive later mode changes.

#### Scenario: Keyboard mode

- **WHEN** a tree in `checkbox` mode is switched to `keyboard`
- **THEN** `autoSelect` and `noUnselectLast` become `true`

#### Scenario: Assigned value

- **WHEN** `noUnselectLast` is set to `false` and the mode then changes twice
- **THEN** `noUnselectLast` stays `false`

### Requirement: Plain click

A click without modifier keys on an enabled, selectable option SHALL make it the active option. With `autoSelect` on, its node SHALL become the only selected one; with `autoSelect` off, its selection SHALL toggle, and in single selection a newly selected node SHALL replace the previous one.

#### Scenario: Auto-select in keyboard mode

- **WHEN** two nodes are selected with Ctrl and the user clicks a third without modifiers
- **THEN** only the third node is selected

#### Scenario: Checkbox mode

- **WHEN** in `checkbox` mode the user clicks two rows
- **THEN** both nodes are selected

### Requirement: Ctrl or Cmd click

A click with Ctrl (Windows, Linux) or Cmd (macOS) on an enabled, selectable option SHALL toggle its node and keep the rest of the selection. It MUST NOT deselect the only selected node while `noUnselectLast` is on.

#### Scenario: Adding and removing nodes

- **WHEN** in `keyboard` mode the user Ctrl-clicks two rows and then the second of them again
- **THEN** the value holds only the first node

#### Scenario: Last selected node

- **WHEN** one node is selected, `noUnselectLast` is on and the user Ctrl-clicks it
- **THEN** it stays selected

### Requirement: Shift range

In multiple selection, a Shift click, or Up, Down, Home, End, PageUp or PageDown with Shift, SHALL set every enabled, selectable option between the previously active option and the clicked or newly active one to the selection state of the previously active option. While `noUnselectLast` is on, a deselecting range MUST stop when one node is left. When the active option did not move, its selection SHALL toggle instead.

#### Scenario: Selecting a range

- **WHEN** the first row is selected and active and the user Shift-clicks the fourth row
- **THEN** rows one to four are selected

#### Scenario: Skipping disabled rows

- **WHEN** in `keyboard` mode the user presses Down and then Shift+Down three times across a disabled `Documents` row
- **THEN** `Downloads` is selected and `Documents` is not

#### Scenario: Deselecting a range

- **WHEN** the first three rows are selected, the unselected fourth row was active, and the user Shift-clicks the first row
- **THEN** one node is left selected

### Requirement: Non-selectable options

An option with `[selectable]="false"` MUST NOT be selected by a click, Space, Enter, a Shift range, keyboard navigation or the "select all" row and shortcut, and such an attempt MUST NOT emit `selectionChange`. It SHALL stay focusable, navigable and expandable, and code — the option's `setSelected` or a written value — SHALL still select it.

#### Scenario: Click on a non-selectable row

- **WHEN** the user clicks a row with `[selectable]="false"`
- **THEN** the value is unchanged and `selectionChange` does not emit

#### Scenario: Arrowing onto it

- **WHEN** `Pictures` is selected and the user presses Down onto a non-selectable row
- **THEN** that row becomes active and the value stays `Pictures`

#### Scenario: Selected from code

- **WHEN** `setSelected(true)` is called on a non-selectable option
- **THEN** its node becomes the value

### Requirement: Disabled options

An option SHALL be disabled when its `disabled` input is set, when the tree is disabled, or when the tree control's `isDisabled` returns `true` for its node, and SHALL then carry `kbq-disabled` and `aria-disabled="true"`. A disabled option MUST NOT be selected by a click, a Shift range or "select all", and keyboard navigation SHALL skip it. `isDisabled` SHALL be asked once per option on every check and again whenever a signal it reads changes.

#### Scenario: Click on a disabled row

- **WHEN** the user clicks a disabled row
- **THEN** the selection stays empty

#### Scenario: Predicate reading a signal

- **WHEN** `isDisabled` reads a signal and the signal starts listing `Documents`
- **THEN** the `Documents` row gains `kbq-disabled` and `aria-disabled="true"` without any other change detection trigger
- **AND** both go away when the signal no longer lists it

### Requirement: Checkboxes

In `checkbox` mode every option SHALL render a pseudo-checkbox that reflects its selection, unless the option projects its own `kbq-pseudo-checkbox`; `[showCheckbox]` on an option SHALL override the tree's mode for that option. The checkbox of a disabled option SHALL be disabled. Leaving `checkbox` mode SHALL remove the checkboxes.

#### Scenario: Leaving checkbox mode

- **WHEN** a tree in `checkbox` mode is switched to single selection
- **THEN** no pseudo-checkbox is rendered

#### Scenario: Disabled tree

- **WHEN** a tree in `checkbox` mode is disabled by its form control
- **THEN** every row and every pseudo-checkbox carries `kbq-disabled`

### Requirement: Tri-state checkbox

An expandable option with `checkboxThirdState` SHALL show `checked` when every descendant is selected, `indeterminate` when only some are, and its own selection when none are, whether or not the branch is expanded. Each change SHALL roll up to the rendered ancestors. A click on such an option SHALL toggle only its own node.

#### Scenario: Some children selected

- **WHEN** `Pictures` is expanded and the user selects `Sun`
- **THEN** the `Pictures` checkbox is `indeterminate`

#### Scenario: All children selected

- **WHEN** the user selects `Sun`, `Woods` and `PhotoBoothLibrary`
- **THEN** the `Pictures` checkbox is `checked`
- **AND** it falls back to `indeterminate` when `Sun` is deselected

#### Scenario: Collapsed branch

- **WHEN** `Sun` is selected and `Pictures` is collapsed again
- **THEN** the `Pictures` checkbox stays `indeterminate`

### Requirement: Selecting a branch from code

`setStateChildren(option, state)` SHALL select every descendant of the option's node when `state` is `true` and deselect them when it is `false`, leaving the node itself as it was, and report the new value to the form.

#### Scenario: Checking a branch

- **WHEN** `setStateChildren` is called with the `Pictures` option and `true`
- **THEN** `Sun` and `Woods` are selected and the `Pictures` tri-state checkbox is `checked`

#### Scenario: Clearing a branch

- **WHEN** it is then called with `false`
- **THEN** `Sun` is deselected and the `Pictures` checkbox is `unchecked`

### Requirement: Selection change event

`selectionChange` of `kbq-tree-selection` SHALL emit after a user changes the selection by a click, Space, Enter, keyboard navigation with `autoSelect`, or "select all", and when narrowing the mode drops nodes. It SHALL carry the tree as `source`, the option acted on as `option`, and `options`; for a click or a key, `options` SHALL hold only that option, even when a Shift range changed several. A value written by the form MUST NOT emit it.

#### Scenario: Click

- **WHEN** the user clicks the `Pictures` row of a tree bound to a form control
- **THEN** `selectionChange` emits once

#### Scenario: Form write

- **WHEN** the form control is set to `Pictures`
- **THEN** `selectionChange` does not emit

### Requirement: Ctrl or Cmd + A

In multiple selection, Ctrl/Cmd + A SHALL prevent the default action and select every node "select all" targets. When `selectAll` or `selectAllToggle` is set and every target is already selected, it SHALL deselect them instead; otherwise a repeated press SHALL change nothing. In single selection the shortcut MUST do nothing. A function bound to `selectAllHandler` SHALL run instead, with the event and the tree; a non-function value MUST throw "`selectAllHandler` must be a function."

#### Scenario: Selecting everything

- **WHEN** nothing is selected in a `keyboard`-mode tree whose four branches are collapsed and the user presses Ctrl+A
- **THEN** all 17 nodes are selected, collapsed ones included

#### Scenario: Repeated press without toggling

- **WHEN** everything is selected, neither `selectAll` nor `selectAllToggle` is set, and the user presses Ctrl+A again
- **THEN** the value is unchanged

#### Scenario: Repeated press with toggling

- **WHEN** `selectAllToggle` is set, everything is selected and the user presses Ctrl+A
- **THEN** the value is empty

#### Scenario: Custom handler

- **WHEN** a function is bound to `selectAllHandler` and the user presses Ctrl+A
- **THEN** the function is called once and the tree selects nothing itself

### Requirement: Targets of select all

Without an active filter, "select all" SHALL target every node in `dataNodes`, collapsed branches included; while a filter is active, only the nodes rendered. Rendered options that are disabled or non-selectable, and nodes the tree control's `isDisabled` reports, MUST be left out; any other node that is not rendered SHALL be a target whatever its option would say.

#### Scenario: Active filter

- **WHEN** the tree is filtered by `Sun` and the user presses Ctrl+A
- **THEN** the value is `Pictures` and `Sun`

#### Scenario: Non-selectable branch

- **WHEN** the collapsed `Documents` row is non-selectable and the user presses Ctrl+A
- **THEN** every node except `Documents` is selected, including the collapsed children of `Documents`

### Requirement: Select-all row

With `selectAll` set, a tree in multiple selection that renders at least one node SHALL render, above the nodes, a row with the class `kbq-tree-option_select-all`, a pseudo-checkbox and the localized "select all" label. The row SHALL be the first option the keyboard reaches, and its node-less entry MUST never be part of the value.

#### Scenario: Row rendered

- **WHEN** `selectAll` is set on a `keyboard`-mode tree
- **THEN** the first row reads "Выбрать все" under the default locale
- **AND** it is the first option of keyboard navigation

#### Scenario: Turned off

- **WHEN** `selectAll` is unset
- **THEN** the row is not rendered

### Requirement: Select-all state

The select-all checkbox and `selectAllState` SHALL be `checked` when every target is selected, `indeterminate` when some are, and `unchecked` otherwise or when there is no target; the row SHALL carry `kbq-selected` while checked. `allOptionsSelected` SHALL report whether every target is selected, `false` when there is none. Neither getter MUST throw before `treeControl` is set; they SHALL then report `unchecked` and `false`.

#### Scenario: Partial selection

- **WHEN** only `Sun` is selected
- **THEN** `selectAllState` is `indeterminate`

#### Scenario: Everything selected

- **WHEN** the user clicks the select-all row once
- **THEN** `selectAllState` is `checked`

#### Scenario: Before the tree control is bound

- **WHEN** `allOptionsSelected` and `selectAllState` are read before `treeControl` is set
- **THEN** they return `false` and `unchecked` without throwing

### Requirement: Select-all row action

Clicking the select-all row, or pressing Space or Enter while it is the active option, SHALL select every target, or deselect them all when every target is already selected. `selectAllOptions()` SHALL do the same from code, deselecting only when `selectAll` or `selectAllToggle` is set. While the tree is disabled, none of them MUST change anything.

#### Scenario: Two clicks

- **WHEN** the user clicks the row twice
- **THEN** all 17 nodes are selected after the first click and none after the second

#### Scenario: Disabled tree

- **WHEN** the tree is disabled and the user clicks the row
- **THEN** the value stays empty

### Requirement: Select-all events

Every run of "select all" on an enabled tree SHALL emit `selectAllChange`, and its deprecated alias `onSelectAll`, with the rendered options that are enabled and selectable, and `selectionChange` with the rendered options whose selection changed. When none of them changed, `selectionChange` MUST NOT emit.

#### Scenario: First press

- **WHEN** five root rows are rendered, nothing is selected and the user presses Ctrl+A
- **THEN** `selectAllChange` and `selectionChange` each carry five options

#### Scenario: Press that changes nothing

- **WHEN** everything is selected and Ctrl+A changes nothing
- **THEN** `selectionChange` does not emit

### Requirement: Value shape

The value reported to a form SHALL be, in single selection, the `getValue` result of the selected node or `undefined` when nothing is selected; in multiple selection, an array of the selected nodes' `getValue` results in the order the nodes were selected.

#### Scenario: Single selection

- **WHEN** the user clicks `Pictures` in a single-selection tree bound to a form control
- **THEN** the control's value is `'Pictures'`

#### Scenario: Multiple selection

- **WHEN** a form control holding `['Pictures', 'Documents']` is bound to a `checkbox`-mode tree
- **THEN** both rows carry `kbq-selected` and the value stays `['Pictures', 'Documents']`

### Requirement: Writing a value

A value written by a form SHALL select the nodes whose `getValue` result matches it by `compareValues`; values without a matching node SHALL select nothing, `null` or `undefined` SHALL clear the selection, and falsy values such as `0` SHALL select their node. In multiple selection a truthy value that is not an array MUST throw "Value must be an array in multiple-selection mode."

#### Scenario: Unknown value

- **WHEN** `['Pictures', 'nothing']` is written to a `keyboard`-mode tree
- **THEN** only `Pictures` is selected

#### Scenario: Zero

- **WHEN** a node's value is `0` and the form writes `0`
- **THEN** that node is selected

#### Scenario: Not an array

- **WHEN** a `checkbox`-mode tree is bound to a form control holding `'Pictures'`
- **THEN** rendering throws "Value must be an array in multiple-selection mode."

### Requirement: Values written ahead of their data

A written value whose nodes are not all in the tree control's `dataNodes` SHALL be applied again whenever the data nodes change, until every node is found or the user changes the selection.

#### Scenario: Data arrives later

- **WHEN** the form writes `'Pictures'` while the data is empty and the data then arrives
- **THEN** `Pictures` is selected and reports `aria-selected="true"`
- **AND** the control stays pristine

#### Scenario: User selection wins

- **WHEN** the form writes `'Pictures'` before it is loaded, the user then clicks `rootNode_1`, and the full data arrives
- **THEN** the value stays `'rootNode_1'`

### Requirement: Selection survives a data replacement

When the data is replaced with new node objects, the selection SHALL move to the new nodes with the same `getValue` result, without reporting a change to the form or emitting `selectionChange`, and the moved nodes SHALL still toggle when clicked.

#### Scenario: Equal data assigned again

- **WHEN** `Pictures` is selected and the data source is given a rebuilt copy of the same data
- **THEN** the selection holds the new `Pictures` node
- **AND** the form control emits no value change and stays pristine

### Requirement: Reporting changes to the form

A selection change made by the user, or made by code through the selection model, an option's `setSelected` or `toggle`, or `setStateChildren`, SHALL be reported to the form and mark it dirty. A value the form writes, a form reset and a data replacement MUST leave the control pristine.

#### Scenario: User selection

- **WHEN** the user clicks `Pictures`
- **THEN** the control's value is `'Pictures'` and the control is dirty

#### Scenario: Form reset

- **WHEN** the form control holding `'Pictures'` is reset
- **THEN** nothing is selected and the control stays pristine

### Requirement: Touched state

The form control SHALL become touched once focus leaves the tree and all its options, by Tab or otherwise. Focus entering the tree or moving between its options MUST NOT touch it.

#### Scenario: Moving between rows

- **WHEN** focus enters the tree and the user presses Down
- **THEN** the control is still untouched

#### Scenario: Tabbing out

- **WHEN** the user presses Tab on a row and focus moves to the next button
- **THEN** the control is touched

### Requirement: Disabled tree

The tree SHALL be disabled by its `disabled` input or by its form control, whichever changed last; a `disabled` binding that turns `undefined` SHALL enable it. A disabled tree SHALL carry the `disabled` attribute and `aria-disabled="true"`, have `tabindex="-1"`, disable every option and checkbox, and ignore clicks and "select all".

#### Scenario: Control starts disabled

- **WHEN** a form control created disabled is bound next to `[disabled]="false"`
- **THEN** the tree is disabled and its tab index is -1

#### Scenario: Last change wins

- **WHEN** that control is then enabled and afterwards `[disabled]` becomes `true`
- **THEN** the tree is enabled after the first change and disabled after the second

### Requirement: Option action button

Tab pressed on a focused option with a `kbq-option-action` SHALL move focus to the action and prevent the default; when the action cannot take focus, Tab SHALL act as usual. While the action holds focus the option SHALL stay focused and active and carry `kbq-action-button-focused`. Enter on the focused action SHALL open its dropdown.

#### Scenario: Tab onto the action

- **WHEN** the first option is active from the keyboard and the user presses Tab
- **THEN** its action has focus, the default is prevented and the option keeps `kbq-focused`

#### Scenario: Action hidden

- **WHEN** the action cannot take focus because it is not displayed and the user presses Tab on the option
- **THEN** the default is not prevented and the option does not carry `kbq-action-button-focused`

### Requirement: Option action visibility

An option's action SHALL be hidden until the option is hovered, or is the focused option while the tree has keyboard focus, and SHALL stay visible while its dropdown is open and after the dropdown hands focus back to it. An option focused by a pointer MUST NOT keep its action visible once the pointer leaves.

#### Scenario: Hover

- **WHEN** the pointer hovers a row and then leaves it
- **THEN** the row's action appears and then hides again

#### Scenario: Keyboard focus

- **WHEN** the user tabs into the tree and presses Down
- **THEN** the second row's action is visible and the first row's action is hidden

#### Scenario: Dropdown open

- **WHEN** the user opens the action's dropdown and moves the pointer away
- **THEN** the action stays visible, also after the dropdown item is chosen

### Requirement: Truncated option text

`kbq-title` on an option SHALL measure overflow on the option's text container (`.kbq-option-text`), horizontally and vertically, or on the element marked `#kbqTitleText` when one is projected, so that only a clipped label counts as truncated.

#### Scenario: Text fits

- **WHEN** the text container is as wide as its content while the option host is wider
- **THEN** the option is not reported as overflowing

#### Scenario: Two-line text clipped

- **WHEN** the text container is clipped vertically only
- **THEN** the option is reported as overflowing

### Requirement: Expansion is restored

With state saving on, which is the default, a tree SHALL restore before its first render the expansion persisted under its `stateSavingKey`, or under a key derived from its position in the document when the key is empty. A payload that is not an array of strings SHALL restore nothing, and saved values that name no node SHALL expand nothing.

#### Scenario: Previous visit

- **WHEN** `['Pictures', 'Documents']` is stored under the tree's key and the tree renders
- **THEN** both nodes are expanded

#### Scenario: First render

- **WHEN** `['Pictures']` is stored and the tree renders its five roots
- **THEN** the first render already shows eight rows, the three children of `Pictures` included

#### Scenario: Key derived from the document

- **WHEN** `stateSavingKey` is empty and the user expands a node
- **THEN** the entry is stored under a key built from the path to the tree element, ending in `kbq-tree-selection`

#### Scenario: Unusable payload

- **WHEN** the stored entry is `'nonsense'`, `42`, an object or `[1, null, {}]`
- **THEN** nothing is expanded

### Requirement: User expansion is persisted

Expanding or collapsing a node with a toggle or with Right or Left SHALL persist the values of all expanded nodes. While a filter is active, nothing SHALL be persisted. Expansion made by the application, such as `treeControl.expandAll()`, SHALL be persisted only once `saveState()` is called.

#### Scenario: Toggle click

- **WHEN** the user expands `Pictures` with its toggle
- **THEN** `['Pictures']` is stored under the tree's key

#### Scenario: Collapsing with the keyboard

- **WHEN** `Pictures` was restored expanded and the user presses Left on it
- **THEN** `[]` is stored

#### Scenario: Filter active

- **WHEN** a filter is active and `saveState()` is called
- **THEN** nothing is stored

### Requirement: Persisted values

Expansion SHALL be persisted as the string `getValue` results of the expanded nodes; a node whose value is not a string SHALL be left out with a dev-mode warning. Saved values whose nodes have not appeared yet SHALL be kept in every later write.

#### Scenario: Numeric values

- **WHEN** `getValue` returns a number and the user expands a node
- **THEN** `[]` is stored and a warning says the value is not a string

#### Scenario: Values not loaded yet

- **WHEN** `['Pictures', 'Documents']` is stored, the data is still empty and `saveState()` is called
- **THEN** the stored entry is still `['Pictures', 'Documents']`

### Requirement: Saved nodes in late data

Saved nodes that appear in the data after the tree has initialized SHALL be expanded when they appear. A node the user collapsed after it appeared MUST NOT be expanded again by later data.

#### Scenario: Lazy data

- **WHEN** `['Pictures', 'Documents']` is stored and the data is loaded after the tree rendered empty
- **THEN** both nodes are expanded

#### Scenario: Collapsed by the user

- **WHEN** the user collapses the restored `Pictures` and another batch of data arrives
- **THEN** `Pictures` stays collapsed

### Requirement: Trees that persist nothing

A tree SHALL neither restore nor persist expansion while `useStateSaving` is `false`, when it is not in the document while it initializes (as in an overlay), or when its tree control has no `getValue`, as a `NestedTreeControl` does; the last case SHALL log a dev-mode warning. Selection is never persisted.

#### Scenario: State saving turned off

- **WHEN** `[useStateSaving]="false"` is bound and an entry is stored under the key
- **THEN** nothing is restored and expanding a node stores nothing

#### Scenario: Nested tree control

- **WHEN** a `kbq-tree` on a `NestedTreeControl` expands a node and calls `saveState()`
- **THEN** nothing is stored and a warning says the control has no `getValue`

### Requirement: Clearing saved state

`clearSavedState()` SHALL remove the persisted entry without changing what is expanded, `hasSavedState` SHALL report `false` afterwards, and the next expansion SHALL be persisted again.

#### Scenario: Clear and expand

- **WHEN** a restored tree calls `clearSavedState()` and the user then expands `Documents`
- **THEN** `hasSavedState` is `false` right after the call
- **AND** `['Pictures', 'Documents']` is stored after the expansion

### Requirement: Focus entering the tree

When the tree element itself receives focus while options are rendered, focus SHALL move to the option of the first node in the selection if it is rendered, otherwise to the previously active option, otherwise to the first enabled option. Entering MUST NOT change the selection.

#### Scenario: Nothing selected

- **WHEN** the user tabs into a tree with no selection
- **THEN** the first row has focus and carries `kbq-focused`

#### Scenario: Selected row

- **WHEN** the second row is selected and the tree receives focus
- **THEN** the second row has focus

### Requirement: Vertical keyboard navigation

Up and Down SHALL move the active option to the previous or next enabled option, Home and End to the first and last enabled option, and PageUp and PageDown back or forward by as many options as fit in the tree's height, stopping at the ends, without wrapping. Down SHALL activate the first option when none is active. Non-selectable options SHALL be reachable. These keys SHALL prevent their default action.

#### Scenario: Home and End

- **WHEN** the user presses End and then Home
- **THEN** the last and then the first option becomes active

#### Scenario: Skipping a disabled row

- **WHEN** the next row is disabled and the user presses Down
- **THEN** the row after it becomes active

### Requirement: Selection follows vertical navigation

After a vertical key without modifiers, with `autoSelect` on, the active option's node SHALL become the only selected one if the option is selectable, and `selectionChange` SHALL emit. With `autoSelect` off, or with Ctrl or Cmd held, the selection MUST NOT change.

#### Scenario: Single selection

- **WHEN** a single-selection tree has focus and the user presses Down
- **THEN** the first row is active and selected, reporting `aria-selected="true"`

#### Scenario: Checkbox mode

- **WHEN** a `checkbox`-mode tree has focus and the user presses Down
- **THEN** the selection is unchanged

### Requirement: Space and Enter

Space and Enter SHALL toggle the active option's node in every mode when the option is selectable, and emit `selectionChange`; they MUST NOT deselect the only selected node while `noUnselectLast` is on, and MUST NOT touch the node's descendants. Space SHALL prevent its default action.

#### Scenario: Last selected node

- **WHEN** one node is selected and active in `keyboard` mode and the user presses Space
- **THEN** it stays selected

#### Scenario: Non-selectable row

- **WHEN** a non-selectable row is active and the user presses Space
- **THEN** the value is unchanged

### Requirement: Right arrow

Right SHALL expand the active option when it is a collapsed branch and keep it active; on an expanded branch it SHALL activate the first enabled child, staying put when every child is disabled. On a leaf, or on a branch whose toggle is disabled, it MUST do nothing. It MUST NOT change the selection and SHALL prevent its default action.

#### Scenario: Collapsed branch

- **WHEN** `src` is active and collapsed and the user presses Right
- **THEN** `src` expands and stays active

#### Scenario: Expanded branch

- **WHEN** the user presses Right again
- **THEN** its first child `assets` becomes active

#### Scenario: Disabled first child

- **WHEN** `assets` is disabled and the user presses Right on the expanded `src`
- **THEN** `cdk`, the next child, becomes active

### Requirement: Left arrow

Left SHALL collapse the active option when it is an expanded branch whose toggle is not disabled and keep it active. Otherwise it SHALL activate the closest enabled ancestor, skipping disabled ancestors, and do nothing on a root row or when every ancestor is disabled. It MUST NOT change the selection and SHALL prevent its default action.

#### Scenario: Expanded branch

- **WHEN** the expanded `src` is active and the user presses Left
- **THEN** `src` collapses and stays active

#### Scenario: Leaf

- **WHEN** the leaf `assets` inside `src` is active and selected and the user presses Left
- **THEN** `src` becomes active, stays expanded, and the value is still `assets`

#### Scenario: Disabled parent

- **WHEN** `a11y` is active and its parent `cdk` is disabled
- **THEN** Left activates `src`, the parent of `cdk`

### Requirement: Type-ahead

With `typeAhead` on, the default, printable characters typed without Ctrl, Cmd or Alt SHALL, 200 ms after the last one, activate the next enabled option after the active one whose label starts with them, ignoring case and wrapping around. The select-all row MUST never match. Type-ahead MUST NOT change the selection. With `typeAhead` off, typed characters SHALL be ignored.

#### Scenario: Matching a label

- **WHEN** the user types `t`
- **THEN** `tests` becomes active 200 ms later

#### Scenario: Shortcut

- **WHEN** the user presses Ctrl+T
- **THEN** no option becomes active

### Requirement: Tab leaves the tree

Shift+Tab on an option, and Tab on an option without a focusable action, SHALL let focus leave the tree for the previous or next focusable element. The tree element SHALL take `tabindex="-1"` at once and get its tab index back from a zero-delay timer, so that Shift+Tab does not land on it; repeated Tab presses SHALL leave one restore pending.

#### Scenario: Tab out

- **WHEN** the user presses Tab on a row
- **THEN** the tree element has `tabindex="-1"` immediately and `tabindex="0"` once that timer has run

### Requirement: Copying the active option

Ctrl/Cmd + C SHALL, when nothing subscribes to `copyChange` or its deprecated alias `onCopy`, copy the active option's value to the clipboard and prevent the default action. When either is subscribed, it SHALL emit both with the tree, the option and the keyboard event instead, without copying. Without an active option it MUST do nothing.

#### Scenario: Default handler

- **WHEN** the third row is active and the user presses Ctrl+C
- **THEN** the clipboard holds that option's value

#### Scenario: Subscribed handler

- **WHEN** a listener is bound to `copyChange` and the user presses Ctrl+C on an active row
- **THEN** the listener receives the option and the clipboard is not written

### Requirement: Navigation event

`navigationChange` SHALL emit with the tree and the newly active option whenever the active option changes through keyboard navigation, type-ahead, Left or Right, or focus entering a tree with nothing selected.

#### Scenario: Moving to the parent

- **WHEN** the leaf `assets` is active and the user presses Left
- **THEN** `navigationChange` emits once with the `src` option

### Requirement: Tree semantics

`kbq-tree-selection` SHALL have `role="tree"`, `aria-multiselectable="true"` only in multiple selection, and take its accessible name from `aria-label` or `aria-labelledby`, bound as inputs or written as attributes. Its rows, the select-all row included, SHALL be `role="treeitem"`. The tree SHALL pass axe checks with collapsed and expanded branches, tri-state checkboxes, the select-all row and action buttons.

#### Scenario: Single selection

- **WHEN** a single-selection tree renders
- **THEN** it has `role="tree"` and no `aria-multiselectable`

#### Scenario: Name from an attribute

- **WHEN** the tree is written with `aria-label="Project files"`
- **THEN** the attribute stays `Project files`

### Requirement: Row semantics

Every row SHALL carry `aria-level`, its depth plus one, and, when the tree control reports its node expandable, `aria-expanded` — kept while a filter disables its toggle. Rows without a checkbox SHALL carry `aria-selected`; rows with one and the select-all row SHALL carry `aria-checked` (`true`, `false` or `mixed`) instead. `kbq-tree-node-toggle` SHALL be `aria-hidden="true"`. Rows SHALL follow changes made in code without an event.

#### Scenario: Branch and leaf

- **WHEN** the collapsed branch `src` and the leaf `docs` render
- **THEN** `src` has `aria-expanded="false"` and `docs` has no `aria-expanded`

#### Scenario: Filtering

- **WHEN** a filter keeps `src` expanded and disables its toggle
- **THEN** `src` still has `aria-expanded="true"`

#### Scenario: Switching to checkbox mode

- **WHEN** `multipleMode` is set to `checkbox` in code
- **THEN** rows drop `aria-selected` and carry `aria-checked="false"`

### Requirement: Active option focus

The active option SHALL hold real DOM focus, scrolled into view, and carry `kbq-focused`, and the tree SHALL point `aria-activedescendant` at its id; with no active option the attribute MUST be absent. Options SHALL keep `tabindex="-1"`.

#### Scenario: Arrowing down

- **WHEN** the user presses Down twice
- **THEN** the second row holds DOM focus and the tree's `aria-activedescendant` is its id

### Requirement: Tab index of the tree

The tree element SHALL have `tabindex="0"` while options are rendered and `-1` while none are. A bound `tabIndex` other than 0 SHALL be kept as the options change and after Tab; a static attribute SHALL be read as a number; a binding that turns `undefined` or `null` SHALL restore the default. A disabled tree SHALL have `tabindex="-1"`.

#### Scenario: Bound tab index

- **WHEN** `[tabIndex]="3"` is bound and every node is expanded
- **THEN** the tree element keeps `tabindex="3"`

#### Scenario: Binding back to null

- **WHEN** the binding changes to `null`
- **THEN** the tree element has `tabindex="0"`

### Requirement: Host classes

`kbq-tree-selection` SHALL carry the class `kbq-tree-selection` and, while it or an option has focus that came from the keyboard, `cdk-keyboard-focused`. Options SHALL carry `kbq-tree-option`, plus `kbq-tree-option_multiple` in multiple selection, `kbq-selected` while selected, `kbq-focused` while focused, `kbq-disabled` while disabled and `kbq-action-button-focused` while their action holds focus.

#### Scenario: Pointer focus

- **WHEN** an option is focused with the mouse
- **THEN** it carries `kbq-focused` and the tree does not carry `cdk-keyboard-focused`

#### Scenario: Keyboard focus

- **WHEN** an option is focused from the keyboard
- **THEN** the tree carries `cdk-keyboard-focused`

### Requirement: Localized select-all label

The select-all label SHALL follow the active locale's `select.selectAll` string — "Выбрать все" under the default `ru-RU`, "Select all" under `en-US` — and `[localeOverrides]` SHALL override it for one tree while keys left out keep following the locale.

#### Scenario: Default locale

- **WHEN** the select-all row renders without a locale provider
- **THEN** it reads "Выбрать все"

#### Scenario: Override for one tree

- **WHEN** a tree binds `[localeOverrides]` with its own `select.selectAll`
- **THEN** only that tree shows the overridden label

### Requirement: Reusing rows with trackBy

With a `trackBy` function, a row whose node the function reports as unchanged SHALL be reused for the new node object and re-derive its value, its level and its indentation. Without one, nodes SHALL be tracked by object identity, so a data source that rebuilds its nodes rebuilds every row.

#### Scenario: Renamed and moved node

- **WHEN** nodes tracked by `id` are emitted again with `src` renamed to `source` and `docs` moved from level 1 to level 2
- **THEN** the same option instances render them, the first now with the value `source` and the second indented by 60px
