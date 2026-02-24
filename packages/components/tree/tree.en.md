A hierarchical list (tree) is a tree-structured catalog for working with large amounts of data.

<!-- example(tree-overview) -->

### When to use

When you need to provide the user with convenient access to a large amount of data (hundreds of items). Either the user can organize this data into a tree-structured catalog, or the data already arrives in this form from the system. If these conditions are not met, it is better to use a [regular list](/en/components/list).

### Component structure

- Name
- Item icons _(optional)_
- Additional action button for the item _(optional)_
- Expand and Collapse buttons
- Checkbox _(optional)_
- Search through items _(optional)_

<div style="margin-top: 15px;"><img src="./assets/images/tree-select/tree-select__structure.png" alt="tree-select" style="max-width: 531px"/>
</div>

### How it works

#### List with tree and text search

If a search query is entered, only the following items are shown in the tree:

- items that match the search query;
- items that are parents of items found by the search query.

Text matching the search query in the item name is highlighted in bold.

<!-- example(tree-filtering) -->

#### List with tree and filtering of selected items

<!-- example(tree-checked-filtering) -->

#### List with tree and multiple item selection

Either single or multiple selection is possible (limited at the tree level).

An item can be selected by clicking on it (in any area except the Expand/Collapse icon and the additional action button). To select multiple items with the mouse, use the Ctrl or Shift keys; to select multiple items with the keyboard, use the Space key.

Non-leaf items can be expanded and collapsed by clicking the arrow icon.

<!-- example(tree-multiple-keyboard) -->

If checkboxes are enabled in the tree list, selecting multiple items is possible by clicking the checkbox.

<!-- example(tree-multiple-checkbox) -->

#### Additional action button

Sometimes an additional action button may be present for an item.

<!-- example(tree-action-button) -->

### Multiple selection variants

There are several variants for multiple item selection. [See in examples](/en/components/tree/examples).

### Focus and keyboard navigation

| <div style="min-width: 110px;">Key</div>                                                                                                                                                             | Action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span class="docs-hot-key-button">Tab</span>                                                                                                                                                         | If focus is on the component preceding the tree in tab order → Move to the first tree row or the selected row<br />If focus is on any tree item and it has no additional actions → Move to the next component in tab order after the tree<br />If focus is on any tree item and it has additional actions → Move to the first additional action<br />If focus is on an item's additional action → Move to the next additional action (if one exists), otherwise move to the next component in tab order after the tree |
| <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">Tab</span>                                                                                                        | If focus is on any tree item → Move to the previous component in tab order before the tree<br />If focus is on the component following the tree in tab order → Move to the first tree row or the selected row                                                                                                                                                                                                                                                                                                          |
| <span class="docs-hot-key-button">→</span>                                                                                                                                                           | If focus is on a non-leaf item → Expand the nested items of that item<br />If focus is on a leaf item → Nothing happens                                                                                                                                                                                                                                                                                                                                                                                                |
| <span class="docs-hot-key-button">←</span>                                                                                                                                                           | If focus is on a non-leaf item → Collapse the nested items of that item<br />If focus is on a leaf item → Nothing happens                                                                                                                                                                                                                                                                                                                                                                                              |
| <span class="docs-hot-key-button">↵</span>                                                                                                                                                           | If focus is on a tree item → Trigger the primary action of that item<br />If focus is on a tree item with a checkbox → Nothing happens<br />If focus is on an additional action → Apply that additional action                                                                                                                                                                                                                                                                                                         |
| <span class="docs-hot-key-button">Space</span>                                                                                                                                                       | If focus is on a tree item with a checkbox → Select that tree item (and all nested items, if any)<br />If focus is on a tree item → Nothing happens<br />If focus is on an additional action → Apply that additional action                                                                                                                                                                                                                                                                                            |
| <span class="docs-hot-key-button">↑</span> <span class="docs-hot-key-button">↓</span>                                                                                                                | If focus is on a tree item → Move to the next (if it is the last item — nothing happens) / previous tree item (if it is the first item — nothing happens)                                                                                                                                                                                                                                                                                                                                                              |
| <span class="docs-hot-key-button">PgUp</span>                                                                                                                                                        | Move focus to the lowest visible item<br /><br />If the current item is the lowest visible → Scroll the tree down<br />If the current item is the last in the tree → Nothing happens                                                                                                                                                                                                                                                                                                                                   |
| <span class="docs-hot-key-button">PgDn</span>                                                                                                                                                        | Move focus to the topmost visible item<br /><br />If the current item is the topmost visible → Scroll the tree up<br />If the current item is the topmost in the tree → Nothing happens                                                                                                                                                                                                                                                                                                                                |
| <span class="docs-hot-key-button">Home</span>                                                                                                                                                        | Move focus to the first tree item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| <span class="docs-hot-key-button">End</span>                                                                                                                                                         | Move focus to the last loaded tree item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| <span class="docs-hot-key-button">Ctrl</span> + click                                                                                                                                                | Clicking tree items — multiple row selection<br />Clicking a selected item — the item is deselected                                                                                                                                                                                                                                                                                                                                                                                                                    |
| <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">↓</span> <br /><br /> <span class="docs-hot-key-button">Shift</span> + <span class="docs-hot-key-button">↑</span> | If focus is on a tree item → Multiple selection of the next / previous tree items (if the row is the first or last — nothing happens)                                                                                                                                                                                                                                                                                                                                                                                  |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">C</span>                                                                                                           | If focus is on tree items → Copy the content of the items<br />By default, item names are copied. The separator between items is a line break                                                                                                                                                                                                                                                                                                                                                                          |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">A</span>                                                                                                           | If focus is on any tree item → Select all tree items (including unloaded ones)                                                                                                                                                                                                                                                                                                                                                                                                                                         |
