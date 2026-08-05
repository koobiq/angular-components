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

### Accessibility

`kbq-list-selection` is announced as a `listbox` and every `kbq-list-option` as an `option` carrying its own `aria-selected`. With `multiple` the list is additionally marked `aria-multiselectable`, and with `horizontal` it reports `aria-orientation="horizontal"` and moves the active option with the Left/Right arrows. The list is a single tab stop; roving focus moves between the options. A disabled list or option is reported through `aria-disabled` — the pseudo-checkbox is decorative and stays out of the accessibility tree.

A listbox needs an accessible name, so give the list one with `aria-label` or `aria-labelledby`:

```html
<kbq-list-selection aria-label="Mailboxes">
    <kbq-list-option [value]="'inbox'">Inbox</kbq-list-option>
    <kbq-list-option [value]="'starred'">Starred</kbq-list-option>
</kbq-list-selection>
```

`kbq-list` and `kbq-list-item` deliberately carry no role: they are a plain container used both for semantic lists and for purely visual grouping. Add `role="list"` / `role="listitem"` yourself when the content is a real list.
