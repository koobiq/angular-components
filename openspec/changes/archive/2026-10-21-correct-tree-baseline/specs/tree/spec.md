# Spec Delta

## MODIFIED Requirements

### Requirement: Node template context

A node template SHALL receive the node as its implicit value, the row's position in the rendered list when the row is created as `index`, and its depth as `level`, read then from the tree control's `getLevel` or 0 when the control has none. Neither is updated afterwards: a row keeps its `index` when rows are inserted or removed above it, and its `level` when `trackBy` reuses it for another node. The `count` member of the context MUST stay unset.

#### Scenario: Row index

- **WHEN** the template binds `let i = index` to a `data-index` attribute and five rows render
- **THEN** the rows carry `data-index` values 0 to 4 in order

#### Scenario: Rows inserted above

- **WHEN** the same template renders the five rows and the `Pictures` branch, the second row, is then expanded
- **THEN** its three children carry `data-index` 2, 3 and 4
- **AND** `Documents`, now the sixth row, still carries `data-index` 2

### Requirement: Flattening nested data

`KbqTreeFlattener` SHALL turn nested data into a flat, depth-first list, calling its transform function with each node, its depth starting at 0 and its flattened parent (`null` for a root). It SHALL read children only of nodes whose flattened form `isExpandable` reports, from an array or from the first emission of an `Observable`. Children an `Observable` emits after the list is returned are appended to its end, out of depth-first order.

#### Scenario: Depth-first order

- **WHEN** `root` holds `documents` (which holds `draft`) and `images`, followed by the root `other`
- **THEN** the flat list is `root`, `documents`, `draft`, `images`, `other` with levels 0, 1, 2, 1, 0

#### Scenario: Children from an Observable

- **WHEN** `getChildren` returns `of(children)`
- **THEN** the flat list is the same as with arrays

#### Scenario: Children emitted later

- **WHEN** `getChildren` returns an `Observable` that emits only after `flattenNodes()` has returned
- **THEN** the returned list holds none of those children
- **AND** they are appended to the end of that list once the `Observable` emits

### Requirement: Expansion through the tree control

`expand`, `collapse` and `toggle` of a tree control SHALL change one node's expanded state, which `isExpanded` SHALL report. `expandDescendants`, `collapseDescendants` and `toggleDescendants` SHALL apply to a node and its whole subtree, `expandAll` SHALL expand every node in `dataNodes`, and `collapseAll` SHALL collapse every node. Only a tree whose data source re-emits on expansion, as `KbqTreeFlatDataSource` does, SHALL follow these changes without further action.

#### Scenario: Expand and collapse

- **WHEN** one node is expanded, a second toggled and the first collapsed
- **THEN** only the second node is expanded

#### Scenario: Expanding from code

- **WHEN** the application calls `treeControl.expand()` on a rendered branch of a tree fed by a `KbqTreeFlatDataSource`
- **THEN** its children render and the row reports `aria-expanded="true"`

### Requirement: Indentation of nodes

`kbqTreeNodePadding` SHALL indent a row by `kbqTreeNodePaddingIndent` (12 by default; a number means pixels, a string keeps its units): a root row by the indent minus 2, a deeper row by its level times the indent plus the indent. A `kbq-tree-option` row that projects no toggle SHALL get 24 more so its label lines up with rows that have one; a `kbq-tree-node` row always gets the 24 more. Both corrections SHALL use the indent's units. In a right-to-left layout the padding SHALL go on the right.

#### Scenario: Default indent with toggles

- **WHEN** `kbq-tree-option` rows at levels 0, 1 and 2 each project a toggle
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

#### Scenario: Plain tree rows

- **WHEN** `kbq-tree-node` rows at levels 0 and 1 of a `kbq-tree` each project a toggle
- **THEN** their left padding is 34px and 48px

### Requirement: Toggle state

A toggle SHALL be disabled while its `disabled` input is set or while a filter is active, then carry the `disabled` attribute and not toggle when clicked; it does not stop that click, which reaches the row. A `kbq-tree-node-toggle` element SHALL also carry `aria-disabled="true"`. A `kbq-tree-node-toggle` SHALL carry the `kbq-expanded` class while the node bound to its `node` input is expanded; without a `node` binding the class MUST NOT appear, though a click still toggles the row's node.

#### Scenario: Disabled toggle

- **WHEN** the toggle of `src` in a single-selection tree has `disabled` set and the user clicks it
- **THEN** `src` stays collapsed
- **AND** the click reaches the row and selects `src`

#### Scenario: Filter disables toggles

- **WHEN** a text filter is applied
- **THEN** every toggle reports itself disabled until the filter is cleared

#### Scenario: Expanded class

- **WHEN** the toggle is bound with `[node]="node"` and the user expands the node
- **THEN** the toggle element carries `kbq-expanded`

### Requirement: Text filter

`filterNodes(query)` of a `FlatTreeControl` with a non-empty query SHALL keep the nodes whose view value matches the query together with all their ancestors, in tree order, expand every kept branch, publish the query on `filterValue` a microtask later, and make a connected flat data source emit only the kept nodes. A non-empty query that matches nothing SHALL leave the tree empty. An empty query publishes the kept nodes instead, as "Expansion while filtering" states.

#### Scenario: Match below a collapsed branch

- **WHEN** the tree is filtered by `Sun`, a child of the collapsed `Pictures`
- **THEN** exactly two rows render: `Pictures` and `Sun`

#### Scenario: No match

- **WHEN** the tree is filtered by a non-empty query no node matches
- **THEN** no rows render

### Requirement: Expansion while filtering

While `filterValue` is not empty, `expand`, `collapse` and `toggle` of the tree control MUST do nothing. An empty query SHALL publish on `filterValue` the nodes the filter stages keep for it, and SHALL end the filter only when they keep none: the data source SHALL then emit the expansion state again, and the expansion in place before the first query SHALL be restored. When a stage keeps nodes, as `FilterByValues` with values does, the filter stays active on them.

#### Scenario: Clearing the filter

- **WHEN** `Pictures` is expanded, the tree is filtered by `app`, and the filter is then cleared with an empty query
- **THEN** the eight rows shown before the filter render again, `Pictures` expanded

#### Scenario: Empty query kept by a stage

- **WHEN** the stages are the text filter, `FilterByValues` set to the values of two root nodes and `FilterParentsForNodes`, and `filterNodes('')` runs
- **THEN** the filter stays active and only those two rows render

### Requirement: Default view value matching

By default a node SHALL match a non-empty query when its `getViewValue` result contains it, ignoring case, with regular-expression characters matched literally; an empty query reaches it as `null`, matching only view values containing "null". A `compareViewValues` function given to the `FlatTreeControl` constructor SHALL replace this test, getting `null` for an empty query. A node whose `value` property equals `kbqTreeSelectAllValue` SHALL always match, unless it would be the only match.

#### Scenario: Case-insensitive match

- **WHEN** the tree is filtered by `DRAFT`
- **THEN** the node `draft` is kept

#### Scenario: Select-all node

- **WHEN** a node with `value: 'selectAll'` leads the data and the query matches only `draft`
- **THEN** the result is the select-all node and `draft`
- **AND** a query that matches nothing returns an empty result

#### Scenario: Empty query

- **WHEN** the tree is filtered with an empty query and only the node `Nullable` has "null" in its view value
- **THEN** `Nullable` and its ancestors are kept and the filter stays active

### Requirement: Ctrl or Cmd click

A click with Ctrl (Windows, Linux) or Cmd (macOS) on an enabled, selectable option SHALL toggle its node; in multiple selection it SHALL keep the rest of the selection, while in single selection selecting the node replaces the one selected before. It MUST NOT deselect the only selected node while `noUnselectLast` is on.

#### Scenario: Adding and removing nodes

- **WHEN** in `keyboard` mode the user Ctrl-clicks two rows and then the second of them again
- **THEN** the value holds only the first node

#### Scenario: Last selected node

- **WHEN** one node is selected, `noUnselectLast` is on and the user Ctrl-clicks it
- **THEN** it stays selected

#### Scenario: Single selection

- **WHEN** one node is selected in a single-selection tree and the user Ctrl-clicks another row
- **THEN** only the node of the clicked row is selected

### Requirement: Shift range

In multiple selection, a Shift click, or Up, Down, Home, End, PageUp or PageDown with Shift, SHALL give every enabled, selectable option from the anchor to the clicked or newly active option the anchor's state. A click or a range sets the anchor to the option it ends on; any other keyboard move, and focus leaving the tree, to the option active before. While `noUnselectLast` is on, a deselecting range MUST stop when one node is left. Without an anchor, or on it, that option SHALL toggle instead.

#### Scenario: Selecting a range

- **WHEN** the user clicks the first row and then Shift-clicks the fourth row
- **THEN** rows one to four are selected

#### Scenario: Skipping disabled rows

- **WHEN** in `keyboard` mode the user presses Down and then Shift+Down three times across a disabled `Documents` row
- **THEN** `Downloads` is selected and `Documents` is not

#### Scenario: Deselecting a range

- **WHEN** in `keyboard` mode the first three rows are selected, the unselected fourth row is the anchor, and the user Shift-clicks the first row
- **THEN** one node is left selected

#### Scenario: Shift click after an arrow key

- **WHEN** in `keyboard` mode the user clicks the first row, presses Down and then Shift-clicks the fourth row
- **THEN** the range runs from the first row and applies its unselected state, so only the second row stays selected

### Requirement: Non-selectable options

An option with `[selectable]="false"` MUST NOT be selected by a click, Space, Enter, a Shift range, keyboard navigation or the "select all" row and shortcut, and such an attempt MUST NOT emit `selectionChange`, except a Shift range made with the keyboard that ends on the option: it emits `selectionChange` with the option. It SHALL stay focusable, navigable and expandable, and code — the option's `setSelected` or a written value — SHALL still select it.

#### Scenario: Click on a non-selectable row

- **WHEN** the user clicks a row with `[selectable]="false"`
- **THEN** the value is unchanged and `selectionChange` does not emit

#### Scenario: Arrowing onto it

- **WHEN** `Pictures` is selected and the user presses Down onto a non-selectable row
- **THEN** that row becomes active and the value stays `Pictures`

#### Scenario: Selected from code

- **WHEN** `setSelected(true)` is called on a non-selectable option
- **THEN** its node becomes the value

#### Scenario: Shift and an arrow onto it

- **WHEN** in `keyboard` mode the user presses Shift+Down onto a non-selectable row
- **THEN** that row becomes active and stays unselected
- **AND** `selectionChange` emits with its option

### Requirement: Tri-state checkbox

An expandable option with `checkboxThirdState` whose toggle is not disabled SHALL show `checked` when every descendant is selected, `indeterminate` when only some are, and its own selection when none are, whether or not the branch is expanded. While its toggle is disabled, as every toggle is while a filter is active, it SHALL show only its own selection. Each change SHALL roll up to the rendered ancestors. A click on such an option SHALL toggle only its own node.

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

#### Scenario: Active filter

- **WHEN** `Sun` is selected and the tree is filtered by `Sun`
- **THEN** the `Pictures` checkbox is `unchecked`

### Requirement: Disabled tree

The tree SHALL be disabled by its `disabled` input or by its form control, whichever changed last; a `disabled` binding that turns `undefined` SHALL enable it. A disabled tree SHALL carry the `disabled` attribute and `aria-disabled="true"`, have `tabindex="-1"`, disable every option and checkbox, and ignore selecting clicks and "select all"; the toggles in its rows SHALL still expand and collapse them.

#### Scenario: Control starts disabled

- **WHEN** a form control created disabled is bound next to `[disabled]="false"`
- **THEN** the tree is disabled and its tab index is -1

#### Scenario: Last change wins

- **WHEN** that control is then enabled and afterwards `[disabled]` becomes `true`
- **THEN** the tree is enabled after the first change and disabled after the second

#### Scenario: Toggle in a disabled tree

- **WHEN** the tree is disabled and the user clicks the toggle of a collapsed branch
- **THEN** the branch expands and the selection stays as it was

### Requirement: Expansion is restored

With state saving on, which is the default, a tree SHALL restore before its first render the expansion persisted under its `stateSavingKey`, or under a key derived from its position in the document when the key is empty. A payload that is not an array, or an array without a single string, SHALL restore nothing; from any other array the string entries SHALL be restored and the rest ignored. Saved values that name no node SHALL expand nothing.

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

#### Scenario: Mixed payload

- **WHEN** the stored entry is `['Pictures', 1, null]` and the tree renders
- **THEN** `Pictures` is expanded

### Requirement: Focus entering the tree

When the tree element itself receives focus while options are rendered, focus SHALL move, with nothing selected, to the first enabled option; with a selection, to the option of the first node in the selection if it is rendered, otherwise to the active option, if any, otherwise to the first enabled option. When the option found is disabled it takes no focus, and focus stays on the tree element. Entering MUST NOT change the selection.

#### Scenario: Nothing selected

- **WHEN** the user tabs into a tree with no selection
- **THEN** the first row has focus and carries `kbq-focused`

#### Scenario: Selected row

- **WHEN** the second row is selected and the tree receives focus
- **THEN** the second row has focus

#### Scenario: Disabled selected row

- **WHEN** the only selected node's row is disabled and the tree receives focus
- **THEN** no row takes focus and the tree element keeps it

### Requirement: Vertical keyboard navigation

Up and Down SHALL move the active option to the previous or next enabled option, Home and End to the first and last enabled option, and PageUp and PageDown back or forward by as many options as fit in the tree's height, stopping at the ends, without wrapping; a page landing on a disabled option skips on by whole pages and MUST NOT move once past the end. Down SHALL activate the first option when none is. Non-selectable options SHALL be reachable. These keys SHALL prevent their default action.

#### Scenario: Home and End

- **WHEN** the user presses End and then Home
- **THEN** the last and then the first option becomes active

#### Scenario: Skipping a disabled row

- **WHEN** the next row is disabled and the user presses Down
- **THEN** the row after it becomes active

#### Scenario: Disabled option a page away

- **WHEN** the fifth of ten options is active, a page is three options, the eighth option is disabled and the user presses PageDown
- **THEN** the active option does not move

### Requirement: Row semantics

Every row SHALL carry `aria-level`, its depth plus one, and, when the tree control reports its node expandable, `aria-expanded` — kept while a filter disables its toggle. Rows SHALL carry `aria-selected`, except the select-all row and rows whose option's `showCheckbox` is true, which SHALL carry `aria-checked` (`true`, `false` or `mixed`) instead, whatever checkbox they project. `kbq-tree-node-toggle` SHALL be `aria-hidden="true"`. Rows SHALL follow changes made in code without an event.

#### Scenario: Branch and leaf

- **WHEN** the collapsed branch `src` and the leaf `docs` render
- **THEN** `src` has `aria-expanded="false"` and `docs` has no `aria-expanded`

#### Scenario: Filtering

- **WHEN** a filter keeps `src` expanded and disables its toggle
- **THEN** `src` still has `aria-expanded="true"`

#### Scenario: Switching to checkbox mode

- **WHEN** `multipleMode` is set to `checkbox` in code
- **THEN** rows drop `aria-selected` and carry `aria-checked="false"`

#### Scenario: Projected checkbox

- **WHEN** the rows of a single-selection tree project their own `kbq-pseudo-checkbox`
- **THEN** they carry `aria-selected` and no `aria-checked`
