### Search

The search results include matches and all of their parents:

- the tree collapses down to the matches and the path to them: the found items and the chain of their parents are visible
- the path to a match is expanded, while the items nested inside it are hidden;
- matched branches can be expanded and collapsed to view their contents;
- the matched fragment is highlighted.

<!-- example(tree-custom-filtering) -->

### Filtering with search + selected

<!-- example(tree-checked-filtering) -->

### Multiple selection variants

These behaviors are also available for [tree select](/en/components/tree-select).

#### Child subcategories

**When to use**

Used when nested items are a subset of their parents.

For example, in a hierarchical product category filter. When we search in coffee makers and toasters, we are actually searching within small kitchen appliances, which is itself a subcategory of home appliances in general.

**How it works**

The algorithm for this tree-select is the familiar 3-state checkbox behavior:

- If all N-level children are selected, their parent (N-1) becomes selected.
- If no N-level items are selected, their parent (N-1) becomes deselected.
- If some N-level items are selected and some are not, their parent (N-1) becomes selected.

**How to save to the model and select matcher**

Ideal: Display in the select matcher and save to the model the minimum set of items — N-level items if not all are selected. And one N-1 level item if all N-level items are selected.

Acceptable: When selecting an N-1 level item, save all N-level items (all children) to the model. If N+1 level items exist, save those too.

An extension of this case is the folder/group access rights scenario (variant 3).

<!-- example(tree-descendants-subcategories) -->

#### Independent items

The second tree behavior algorithm — levels that are independent of each other.

**When to use**

All items are independent of each other, simply visually grouped in a tree.

For example, in a system where users can assign tags, and these tags can be organized into folders and subfolders. Assigning a child tag to an object does not mean the folder object should also be assigned. And conversely, assigning a folder tag has no effect on assigning a child tag.

**How it works**

No checkboxes affect each other.

**How to save to the model and select matcher**

Checked checkboxes are saved.

<!-- example(tree-multiple-checkbox) -->

#### Access rights

The third tree behavior variant is an extension of the "Child subcategories" variant.

**When to use**

When you need to assign access rights to a tree of objects. Both rules apply:

1. Granting access rights to a parent object also grants rights to child items.
2. It is important to preserve the explicit selection of child items, even when parents are selected. For example, rights to `group 1.1` were granted first, then rights to group 1 were granted. If the system requires that the rights to 1.1 be preserved, this algorithm should be applied.

**How it works**

Similar to the "Child subcategories" variant, but with one restriction.
When a parent is selected, child items are not just checked — they are also disabled.
Only what is explicitly checked is saved.

In addition, if an item was selected and then its parent was selected, the siblings of that item will be selected and disabled, while the explicitly selected item remains enabled. This indicates that a specific rule is set on it.
If the checkbox on such an item is unchecked, it becomes disabled. To restore its explicit assignment, the parent's checkbox must be unchecked.

- Single non-expandable node
    - On selection:
        - Highlighted in blue; the node is not blocked.
    - On deselection:
        - If no parent is selected, simply deselected.
        - If any parent node is selected, selection and disabling occurs (becomes gray).
- Expandable node
    - On selection:
        - All child nodes that are not selected become selected and disabled (become gray).
        - If a child is already selected, nothing happens.
    - On deselection:
        - If any parent node is selected, selection and disabling occurs (becomes gray).
        - If a child node was explicitly selected and highlighted in blue, it remains untouched, while other child nodes are deselected (note that some disabled nodes may be inside nodes selected via singleSelection).
        - If N+1 level child nodes are disabled, deselection and node activation occur.
        - If an N+1 level child node is expandable, it is recursively checked.
- **Difference from "Child subcategories":** If all child nodes are selected, this does not mean the parent node is automatically selected.

**How to save to the model and select matcher**

Only explicitly checked items are saved. Disabled items are not saved.

<!-- example(tree-access-rights) -->

### Selection and marking

Clicking an item selects it and updates the information in the right panel. Clicking the checkbox marks the item, but the information in the right panel does not change.

The list can also be navigated with the keyboard. Enter selects an item and updates the text in the right panel, while Space marks it. The selected item changes along with navigation.

<!-- example(tree-select-and-mark) -->

### Selection separate from focus

When navigating the list, the selected item does not change along with the focus position. An item can be selected by clicking or pressing Enter.

<!-- example(tree-selection-separate-from-focus) -->

### Expanding a branch on click

Clicking an element expands the first level of child nodes, only leaf elements can be selected. Selection is disabled with the `selectable` attribute of `kbq-tree-option`: with `[selectable]="false"` the option remains focusable, navigable and expandable, but cannot be selected.

<!-- example(tree-toggle-on-click) -->
