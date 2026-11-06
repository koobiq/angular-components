# Spec Delta

## MODIFIED Requirements

### Requirement: Focus moves into the open panel

Once the panel has rendered, DOM focus SHALL move onto the active option unless that option is disabled, since a disabled option refuses focus, and then into the search field when one is projected. The tree-select host MUST NOT carry `aria-activedescendant`. While the panel is open, the tree-select SHALL report itself as focused to its form field even though DOM focus is in the panel.

#### Scenario: Focus lands on the active option

- **WHEN** the panel of a tree-select without search opens and the user presses Down
- **THEN** the active option holds DOM focus and the host has no `aria-activedescendant`

#### Scenario: Focus lands on the search field

- **WHEN** the panel of a tree-select with a projected search field opens
- **THEN** the search field holds DOM focus

#### Scenario: Host blurs while the panel is open

- **WHEN** the panel is open and the host receives a `blur` event
- **THEN** `focused()` still returns `true`

#### Scenario: Disabled active option

- **WHEN** the option made active on opening is disabled through its own `disabled` input and no search field is projected
- **THEN** DOM focus does not move onto that option

### Requirement: Active option on open

When the panel opens, the option of the first selected node that the tree control's `isDisabled` does not report SHALL become active, also when that option is disabled through its own `disabled` input or a disabled tree. When that node has no rendered option, for example because its branch is collapsed, or no such node is selected, the first enabled rendered option SHALL become active; with the select-all row rendered that is the row.

#### Scenario: Nothing selected

- **WHEN** the panel opens with no value
- **THEN** the first rendered option is active

#### Scenario: A value is selected

- **WHEN** the value names the second root node and the panel opens
- **THEN** that node's option is active

#### Scenario: First selected node disabled through its option

- **WHEN** the only selected node is disabled through its option's `disabled` input and the panel opens
- **THEN** that option is active

### Requirement: Selection mode and value type

Changing `multiple` after initialization SHALL throw "Cannot change `multiple` mode of select after initialization."; changing the multiplicity of the projected tree's `multiple` input SHALL throw the tree's own error, starting "Cannot change the multiplicity of `multiple`". Switching that input between `checkbox` and `keyboard` SHALL only change whether checkboxes render. In multiple-selection mode a truthy non-array value SHALL throw "Value must be an array in multiple-selection mode.".

#### Scenario: Toggling multiple at runtime

- **WHEN** the binding of `multiple` on the tree-select changes after the first render
- **THEN** the tree-select throws the `multiple` mode error

#### Scenario: Writing a string to a multiple tree-select

- **WHEN** the form control of a multiple tree-select is set to a string
- **THEN** the tree-select throws the array error

#### Scenario: Changing the multiplicity of the projected tree

- **WHEN** the `multiple` input of the projected `kbq-tree-selection` in a multiple tree-select changes from `checkbox` to `false` after the first render
- **THEN** the tree's multiplicity error is thrown, not the tree-select's `multiple` mode error

### Requirement: Disabled and non-selectable options

An option disabled through its own `disabled` input, the tree control's `isDisabled` or a disabled tree MUST NOT be selected by click, arrow keys, typeahead or "select all", and clicking it MUST leave the panel open. Enter and Space in a multiple tree-select do not check `disabled`, so they SHALL toggle a disabled option that opening the panel made active. An option with `selectable` set to `false` SHALL stay navigable and expandable but MUST NOT be selected by user interaction.

#### Scenario: Clicking a disabled option

- **WHEN** the user clicks a disabled option in an open single tree-select
- **THEN** the value does not change and the panel stays open

#### Scenario: Space on a disabled active option

- **WHEN** the only selected node of a multiple tree-select is disabled through its option's `disabled` input, the panel opens and the user presses Space
- **THEN** that node is deselected

### Requirement: Values are matched by the tree control

A written value SHALL select, for each value it holds, the first data node in data order whose `getValue` the tree control's `compareValues` matches with that value, strict equality by default, searching all data nodes including those in collapsed branches; later nodes with an equal value stay unselected. A value that matches no node SHALL leave nothing selected for it, while the form control keeps the value it holds.

#### Scenario: Custom comparison

- **WHEN** `getValue` returns the node, `compareValues` compares names and `ngModel` writes `{ name: 'rootNode_1' }`
- **THEN** `selected` is the `rootNode_1` node

#### Scenario: Node in a collapsed branch

- **WHEN** a multiple tree-select is written `['Documents', 'Tutorial']` while `Downloads` is collapsed
- **THEN** both nodes are selected and both appear as tags

#### Scenario: Falsy node value

- **WHEN** `getValue` returns `0` for a node and the form writes `0`
- **THEN** `value()` is `0` and the trigger shows that node

#### Scenario: Two nodes with one value

- **WHEN** two data nodes have the value `src` and the form writes `['src']` to a multiple tree-select
- **THEN** only the first of them in data order is selected

### Requirement: Select-all scope and state

Without a search query "select all" SHALL cover every data node, collapsed branches included; with one, the rendered nodes. It MUST leave out nodes the tree control's `isDisabled` reports and rendered options that are disabled or not `selectable`, but no other node without a rendered option. The row SHALL be unchecked, indeterminate or checked, with `aria-checked` `false`, `mixed` or `true`, by how many covered nodes are selected; with none covered, unchecked and `allOptionsSelected` `false`.

#### Scenario: Partial selection

- **WHEN** only `Tutorial` is selected
- **THEN** the row is indeterminate

#### Scenario: Disabled nodes ignored

- **WHEN** every node except a disabled `Tutorial` is selected
- **THEN** the row is checked

#### Scenario: Every node disabled

- **WHEN** every node is disabled and `Tutorial` is selected
- **THEN** the row is unchecked and `allOptionsSelected` is `false`

#### Scenario: Option inputs inside a collapsed branch

- **WHEN** the option template disables `Tutorial` through its `disabled` input, `Downloads` is collapsed and the user clicks the row
- **THEN** `Tutorial` is selected along with the other nodes

### Requirement: Select-all action

Activating the row by click, Enter or Space, including Enter while the row is active and focus is in the search field, SHALL select every covered node unless all of them are selected, in which case it SHALL deselect them. Uncovered nodes MUST NOT change. Each activation SHALL emit `selectionChange` only when a node with a rendered option changed, then `onSelectAll` with the selectable rendered options and `selected` telling whether all covered nodes are now selected.

#### Scenario: Collapsed branches

- **WHEN** a branch is collapsed and the user clicks the row
- **THEN** every node, including those in the collapsed branch, is selected

#### Scenario: Acting on search results

- **WHEN** the query `Tutorial` is active and the user clicks the row
- **THEN** the value holds `Downloads` and `Tutorial` only

#### Scenario: Second click

- **WHEN** the user clicks the row twice
- **THEN** the value is `[]` and `onSelectAll` has fired twice, with `selected` `true` and then `false`

#### Scenario: Only nodes inside collapsed branches change

- **WHEN** every rendered node is selected, the nodes inside collapsed branches are not, and the user clicks the row
- **THEN** those nodes become selected and `onSelectAll` fires, but `selectionChange` does not

### Requirement: Keys in the search field

In the search field, Up, Down, Left and Right SHALL act on the tree and refocus the field, without moving the caret; so SHALL Enter in multiple selection or with `autoSelect` off, which otherwise closes the panel and focuses the tree-select. Toggling an option in the panel SHALL refocus the field too unless the panel closes. PageUp and PageDown SHALL move the active option and focus to it; Home, End and Space SHALL stay in the field. Escape SHALL clear a query, or close the panel without one.

#### Scenario: Escape with a query

- **WHEN** the search field holds a query and the user presses Escape
- **THEN** the query is cleared and the panel stays open

#### Scenario: Escape without a query

- **WHEN** the search field is empty and the user presses Escape
- **THEN** the panel closes

#### Scenario: Enter in a single tree-select

- **WHEN** focus is in the search field of a single tree-select with `autoSelect` on, an option is active and the user presses Enter
- **THEN** the panel closes and the tree-select has focus
