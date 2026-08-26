A list shows a set of related items and lets the user select one or several of them. To pick a single
value from a closed set inside a form use [Select](/en/components/select), and for hierarchical data use
[Tree](/en/components/tree).

<!-- example(list-overview) -->

### Selection

#### Clicking

By default a click selects exactly one option: `autoSelect` clears the rest of the selection first. Set
`autoSelect="false"` to make a click toggle only the option it landed on and leave the others alone.

`noUnselectLast` keeps the list from ending up empty: `Ctrl` + click on the only selected option is
ignored. Set it to `false` to allow deselecting everything.

Both are on by default and both are turned off automatically by `multiple="checkbox"`, where a click is
expected to toggle a single row. Setting either one yourself pins it, so a later change of `multiple`
leaves your value alone.

#### Multiple selection

`multiple` takes the mode as its value. `multiple="checkbox"` renders a checkbox in every option, so the
selection is readable without focus:

<!-- example(list-multiple-checkbox) -->

`multiple="keyboard"` selects without any checkbox: a plain click still moves the selection to one
option, and the user extends it with `Ctrl` + click or `Shift` + click.

<!-- example(list-multiple-keyboard) -->

The mode is a closed set of values:

| value                                                                       | mode             |
| --------------------------------------------------------------------------- | ---------------- |
| `multiple="checkbox"`                                                       | checkbox         |
| `multiple="keyboard"`                                                       | keyboard         |
| `multiple`, `multiple="true"`, `[multiple]="true"`                          | checkbox         |
| `multiple="single"`, `multiple="false"`, `[multiple]="false"`, no attribute | single selection |

Anything else falls back to single selection and is reported in the console in dev mode.

`multiple` is a normal input, so the mode can be bound and changed at any time:

<!-- prettier-ignore -->
```html
<kbq-list-selection [multiple]="mode()" [(ngModel)]="selected">
    <kbq-list-option [value]="item">{{ item }}</kbq-list-option>
</kbq-list-selection>
```

Narrowing a list that has several options selected keeps the first selected one, drops the rest, reports the
shortened value through the form control and emits `selectionChange` for each option it deselected.

Note that this applies to `kbq-list-selection` and `kbq-tree-selection` only. On
[Select](/en/components/select) and `kbq-tree-select`, `multiple` still cannot be changed after
initialization and throws if you try.

Subscribe to `selectionChange` rather than to `selectionModel.changed`: changing the mode replaces the
selection model, and a subscription taken on the model directly is left behind on the discarded instance.

#### Matching values

The list compares the values coming from the form control with the values of its options by identity. When
the options carry objects, pass a `compareWith` function so that a value from the model is matched to its
option:

<!-- prettier-ignore -->
```html
<kbq-list-selection multiple="checkbox" [compareWith]="compareById" [(ngModel)]="selected">
    @for (item of items(); track item.id) {
        <kbq-list-option [value]="item">{{ item.name }}</kbq-list-option>
    }
</kbq-list-selection>
```

`compareWith` also decides when an option keeps its selection: replacing the objects behind `[value]` with
equal ones — an immutable update, a refetch — leaves the selection alone. Bind a stable reference: an
expression that builds a new function on every change detection pass makes the list re-match on each one.

### Grouping

<!-- example(list-groups) -->

### Horizontal list

`horizontal` lays the options out in a row and rebinds the navigation to the Left/Right arrows.

<!-- prettier-ignore -->
```html
<kbq-list-selection horizontal aria-label="Alignment">
    <kbq-list-option [value]="'left'">Left</kbq-list-option>
    <kbq-list-option [value]="'right'">Right</kbq-list-option>
</kbq-list-selection>
```

### Action button

<!-- example(list-action-button) -->

### Virtual scroll

<!-- example(list-virtual-scroll) -->

### Keyboard

The list is a single tab stop. Inside it the arrows move the active option, `Home` and `End` jump to the
ends, `PageUp` and `PageDown` move by a page, `Space` and `Enter` toggle the active option, and typing
letters jumps to the option that starts with them.

#### Selecting everything

`Ctrl`/`Cmd` + `A` selects every option that is not disabled, in multiple selection mode only. By default a
repeated press keeps them selected; `selectAllToggle` makes it deselect them instead. The batch is reported
through `onSelectAll`, which carries the options the shortcut could act on.

The behaviour can be replaced wholesale with the `selectAllHandler` input. It receives the keyboard event
and the list, and it has to be a function — anything else throws.

#### Copying

`Ctrl`/`Cmd` + `C` copies the active option. Subscribe to `onCopy` to decide what lands in the clipboard:
the event carries the list, the option and the original keyboard event, and the list does nothing else.
Without a subscriber the list falls back to copying `String(value)` of the active option itself.

### Drag and drop

Set the `draggable` property on `kbq-list-selection` to let the user reorder options.

A single option can opt out with `draggable="false"` on `kbq-list-option`. It cannot be picked up by
either the pointer or the keyboard, but — unlike a disabled option — it still takes focus and can be
selected. The rest of the list keeps moving around it, so its own index can still shift.

The list does not open a gap while an option is being dragged: the surrounding options stay put, the
dragged one keeps its place as a faded row, and a line marks the position the option would land in.
No line is shown while the pointer is over the place the option already occupies — dropping it there
would change nothing.

Nothing else reacts while the drag lasts. The options stop responding to hover, because what takes the
drop is the list rather than the row under the pointer, and the cursor turns to `no-drop` whenever the
pointer leaves every list that would accept the option.

What follows the pointer is a plate carrying the option's own text — its label, and its caption on a
line of its own — cut off with an ellipsis once it reaches its maximum width. Set `dragPreview="full"`
on `kbq-list-selection` to drag a copy of the whole row instead, checkbox, icons and action button
included.

<!-- prettier-ignore -->
```html
<kbq-list-selection draggable dragPreview="full" (dropped)="dropped($event)">
    <kbq-list-option [value]="item">{{ item.name }}</kbq-list-option>
</kbq-list-selection>
```

A draggable row keeps the cursor it would have anyway — it is still a row that can be clicked and
selected, and being draggable is no reason to stop looking like one. Set `dragCursor="grab"` where the
whole row is meant to read as a handle:

<!-- prettier-ignore -->
```html
<kbq-list-selection draggable dragCursor="grab" (dropped)="dropped($event)">
    <kbq-list-option [value]="item">{{ item.name }}</kbq-list-option>
</kbq-list-selection>
```

The list never changes the data itself — it reports the move through the `dropped` event and you
apply it, usually with `moveItemInArray` from `@angular/cdk/drag-drop`. Track the options by their
identity (`track item.id`): with a positional key such as `track $index` the option at a given
position is kept and rebound to a different value, and an option drops its selection when its value
changes.

<!-- example(list-draggable) -->

An option can also be picked up by one area of the row instead of the whole of it: project an element
carrying `cdkDragHandle` into it, and only that element starts a drag. A handle always shows the grab
cursor — that is what it is for, so it needs no `dragCursor`, and the row around it keeps its own cursor
whatever the list asks for. The directive is re-exported from `KbqListModule`, so nothing else has to be
imported.

<!-- example(list-draggable-handle) -->

Options can also be moved into another list. Pass the other `kbq-list-selection` through `connectedTo`
on both lists, and apply the move with `transferArrayItem`. An option arrives in the target list
unselected unless the target's own value already contains it.

<!-- example(list-draggable-connected) -->

Options are numbered across the whole list, so a `kbq-optgroup` can be reordered through and an option
dragged past its boundary changes group. Dragging is not supported inside `cdk-virtual-scroll-viewport`,
though: the indices reported by `dropped` count only the rendered options, so applying the move to the
backing array silently affects the wrong item. That combination logs a warning in development mode.

Reordering is pointer-only: there is no keyboard equivalent, so it is out of reach for anyone who
cannot drag.

Lists connected by `id` rather than by a component reference show no drop indicator — an `id` cannot
be resolved back to the list instance that would have to draw it.

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

### Recommendations

- Give every `kbq-list-selection` an accessible name. It is announced as a listbox, and a listbox without
  a name tells a screen reader nothing about what is being chosen.
- Prefer `multiple="checkbox"` when the selection has to be readable at a glance. `multiple="keyboard"`
  keeps the rows compact but hides the state from anyone who does not know to look for the highlight.
- Reach for virtual scroll once the list is long enough to scroll for a while, but remember that dragging
  cannot be combined with it.
- Keep the option label short enough to fit on one line. A list is a picker, not a place for paragraphs —
  move the detail into a caption or a tooltip.
