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

| value                                                  | mode             |
| ------------------------------------------------------ | ---------------- |
| `multiple="checkbox"`                                  | checkbox         |
| `multiple="keyboard"`                                  | keyboard         |
| `multiple`, `multiple="true"`, `[multiple]="true"`     | checkbox         |
| no attribute, `multiple="false"`, `[multiple]="false"` | single selection |

Single selection is the default, so the way to ask for it is to leave `multiple` off entirely.
Anything else — `multiple="single"` included — falls back to single selection and is reported in the
console in dev mode.

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

#### Select all

When users often have to select every value, or to leave out just a few of them, put a row with a "Select all"
master checkbox at the top of a list with multiple selection.

In `multiple="checkbox"` mode every option can be selected at once. The feature is off by default — turn it
on with the `selectAll` attribute, and a master checkbox appears above the options.

<!-- prettier-ignore -->
```html
<kbq-list-selection multiple="checkbox" selectAll [(ngModel)]="selected">
    <kbq-list-option [value]="item">{{ item }}</kbq-list-option>
</kbq-list-selection>
```

The checkbox has three states: unchecked when nothing is selected, indeterminate when only some options are,
and checked when every option is. Clicking it while indeterminate selects the remaining options rather than
clearing the selection. The label comes from the locale (`select.selectAll`).

Disabled options are ignored — they are neither selected nor deselected, and the checkbox state reflects only
the options the user can actually toggle. A whole batch reports the new value through the form control once,
and emits `onSelectAll` with the options it could act on. `selectionChange` stays silent for a batch: it
carries a single option and has no shape a batch could take — the same contract `Ctrl`/`Cmd` + `A` has always
had.

The row takes part in keyboard navigation as the first item of the list: `Home` or the up arrow reaches it,
`Space` and `Enter` toggle it, and tabbing into a list with nothing selected lands on it rather than on the
first option. It is a command rather than a value, so it stays out of everything that acts on values —
typing letters skips it, `Ctrl`/`Cmd` + `C` copies nothing from it, and a `Shift` range cannot be anchored
on it. In a draggable list it is rendered but never picked up.

Not supported together with `multiple="keyboard"`, single selection, `horizontal`, an empty list, or a
`cdk-virtual-scroll-viewport`: the row is not rendered in any of those. Under a virtual scroller the list
only ever holds the options currently rendered, so a master checkbox built on them would report "everything
selected" after touching a fraction of the data; that combination also logs a warning in dev mode.

Read `allOptionsSelected` off a template reference (`#list="kbqListSelection"`) to render a summary of your
own next to the list.

<!-- example(list-select-all) -->

The list has no search of its own — the field in the example above is assembled next to it out of
`kbq-form-field` and `kbqInput`, and the filtering is done with the core [smart search](/en/other/search-smart).
Search and selection share a boundary: the list only ever sees the options that are rendered. While a query
hides part of them, the master checkbox acts on the matches rather than on the whole set; an option that leaves
the DOM drops its own selection; and every selection change made under a query rebuilds the value for the form
out of the visible options, so whatever was selected before the query falls out of it. Changing the query on
its own does not rewrite the value, so the selection comes back when the query is cleared with nothing toggled
under it. Keep the selection in your own model next to the list if it has to survive toggling under a query
too.

The `selectAll()` and `deselectAll()` methods are unrelated to the attribute: they are imperative commands
and act on every option, disabled ones included.

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
repeated press keeps them selected; `selectAllToggle` makes it deselect them instead. While a
[`selectAll`](#select-all) row is on screen the shortcut always toggles both ways, so it and the master
checkbox cannot disagree; in the modes that render no row it keeps its select-only default. The batch is reported through `onSelectAll`, which carries the options the shortcut could act on.

The behaviour can be replaced wholesale with the `selectAllHandler` input. It receives the keyboard event
and the list, and it has to be a function — anything else throws. Note that the handler replaces the
shortcut only: the master checkbox keeps running the built-in toggle, so with `selectAll` on you own both
paths.

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

`kbq-list-selection` is announced as a `listbox` and every `kbq-list-option` as an `option` carrying its own `aria-selected`. The "select all" row stays an `option` too — a `checkbox` is not a valid child of a listbox — and reports the batch state on `aria-checked`, including `mixed` for a partial selection; it carries no `aria-selected` of its own. With `multiple` the list is additionally marked `aria-multiselectable`, and with `horizontal` it reports `aria-orientation="horizontal"` and moves the active option with the Left/Right arrows. The list is a single tab stop; roving focus moves between the options. A disabled list or option is reported through `aria-disabled`. The built-in pseudo-checkbox is decorative and stays out of the accessibility tree; if you project your own `kbq-pseudo-checkbox` instead (`externalPseudoCheckbox`), mark it `aria-hidden="true"` too — the option's own `aria-selected` already carries the selected state.

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
