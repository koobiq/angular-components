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
dragged one keeps its place as a faded row, and a line marks the position the option would land in.
No line is shown while the pointer is over the place the option already occupies — dropping it there
would change nothing.

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

### Accessibility

`kbq-list-selection` is announced as a `listbox` and every `kbq-list-option` as an `option` carrying its own `aria-selected`. With `multiple` the list is additionally marked `aria-multiselectable`, and with `horizontal` it reports `aria-orientation="horizontal"` and moves the active option with the Left/Right arrows. The list is a single tab stop; roving focus moves between the options. A disabled list or option is reported through `aria-disabled`. The built-in pseudo-checkbox is decorative and stays out of the accessibility tree; if you project your own `kbq-pseudo-checkbox` instead (`externalPseudoCheckbox`), mark it `aria-hidden="true"` too — the option's own `aria-selected` already carries the selected state.

A listbox needs an accessible name, so give the list one with `aria-label` or `aria-labelledby`:

```html
<kbq-list-selection aria-label="Mailboxes">
    <kbq-list-option [value]="'inbox'">Inbox</kbq-list-option>
    <kbq-list-option [value]="'starred'">Starred</kbq-list-option>
</kbq-list-selection>
```

`kbq-list` and `kbq-list-item` deliberately carry no role: they are a plain container used both for semantic lists and for purely visual grouping. Add `role="list"` / `role="listitem"` yourself when the content is a real list.
