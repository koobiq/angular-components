The **Clamped Text** component helps display long text neatly. When collapsed, it shows only a specified number of lines; when expanded, it reveals the full text.

<!-- example(clamped-text-overview) -->

### Number of lines

By default, text is truncated after 5 lines. The `rows` attribute controls how many lines are shown in the collapsed state:

```html
<kbq-clamped-text [rows]="3">
    In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates from
    many different sources. More sophisticated strategies are required to mitigate this type of attack; simply
    attempting to block a single source is insufficient as there are multiple sources.
</kbq-clamped-text>
```

### A single hidden line is always shown

If the hidden portion contains only one line, the component displays it immediately. The "Expand" button does not appear because the text already takes up the same height as the collapsed state with the button.

### External state control

The `isCollapsed` input lets you control the component's state from outside — for example, from route query params. It is a two-way binding, so `[(isCollapsed)]` keeps the parent in sync:

<!-- example(clamped-text-external-state) -->

`isCollapsedChange` reports **user intent only** — it fires when the toggle is operated, and never for the component's own measurement or as an echo of a value you wrote yourself. Binding it to a query parameter is therefore safe: a page load writes nothing.

### Inputs

| Name               | Type                   | Default | Description                                                                                                   |
| ------------------ | ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `rows`             | `number`               | `5`     | Lines kept in the collapsed state. The toggle appears only when the content exceeds `rows + 1` lines.         |
| `isCollapsed`      | `boolean \| undefined` | —       | Collapsed state. `undefined` means the component decides: collapsed as soon as the content overflows.         |
| `debounceTime`     | `number`               | `0`     | Milliseconds the resize observer waits before re-measuring. Higher values delay the toggle appearing on load. |
| `scrollOnCollapse` | `boolean`              | `true`  | Whether collapsing scrolls the component back into view. Set to `false` for a purely local collapse.          |

`isCollapsedChange` is the output half of the `[(isCollapsed)]` two-way binding.

### Writing a custom toggle

`kbq-clamped-text` renders its own toggle, so most consumers need nothing else. The same `kbqClampedListTrigger` directive it uses internally is exported, and it supplies the disclosure semantics itself — `role="button"`, `tabindex="0"`, `aria-expanded` and an `aria-controls` pointing at the clamped region. Do not write those attributes by hand.
