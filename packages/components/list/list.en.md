#### With default parameters (autoselect="true", no-unselect="true")

<!-- example(list-overview) -->

### Single mode with groups

<!-- example(list-groups) -->

### Multiple mode with checkboxes

<!-- example(list-multiple-checkbox) -->

### Multiple mode without checkboxes

<!-- example(list-multiple-keyboard) -->

### Action button

<!-- example(list-action-button) -->

### Virtual scroll

<!-- example(list-virtual-scroll) -->

### Drag and drop

Set the `draggable` property on `kbq-list-selection` to let the user reorder options.

The list does not open a gap while an option is being dragged: the surrounding options stay put, the
dragged one keeps its place as a faded row, and a line with a dot marks the position the option would
land in.

The list never changes the data itself — it reports the move through the `dropped` event and you
apply it, usually with `moveItemInArray` from `@angular/cdk/drag-drop`. Track the options by their
identity (`track item.id`): with a positional key such as `track $index` the option at a given
position is kept and rebound to a different value, and an option drops its selection when its value
changes.

<!-- example(list-draggable) -->

Options can also be moved into another list. Pass the other `kbq-list-selection` through `connectedTo`
on both lists, and apply the move with `transferArrayItem`. An option arrives in the target list
unselected unless the target's own value already contains it.

<!-- example(list-draggable-connected) -->

Dragging is not supported inside `kbq-optgroup` or `cdk-virtual-scroll-viewport`: the indices reported
by `dropped` count only the rendered options, or are relative to the group rather than to the list, so
applying the move to the backing array silently affects the wrong item. Both combinations log a warning
in development mode.

#### Keyboard

Dragging always has a keyboard equivalent, so the feature stays usable without a pointer.

| <div style="min-width: 270px;">Key</div>                                                                                               | Action                                         |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| <span class="docs-hot-key-button">Alt</span> + <span class="docs-hot-key-button">↑</span> / <span class="docs-hot-key-button">↓</span> | Move the focused option one position.          |
| <span class="docs-hot-key-button">Alt</span> + <span class="docs-hot-key-button">←</span> / <span class="docs-hot-key-button">→</span> | Move the focused option into a connected list. |

The new position is announced through a live region. Lists connected by `id` rather than by a
component reference cannot be reached with the keyboard, and they show no drop indicator — an `id`
cannot be resolved back to the list instance that would have to draw it.
