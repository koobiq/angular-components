A button group is suitable for choosing from a list of 3 to 5 items when they fit in a single row without wrapping.

<!-- example(button-toggle-overview) -->

### Disabled

A regular button and a pressed button can each be individually disabled.

<!-- example(button-toggle-disabled-partial-overview) -->

When all items are disabled or the pressed button is blocked, the entire group is styled as unavailable for interaction.

<!-- example(button-toggle-disabled-all-overview) -->

### Width alignment

By default, the size of the button group depends on its content, but there is an additional option to stretch it to the available width. Items share the available space equally, and content inside each button is centered.

<!-- example(button-toggle-alignment-overview) -->

If text does not fit within a button, it is truncated with an ellipsis. A tooltip with the full name is available on hover or focus.

Mark an icon next to the text with `kbqButtonPrefix` or `kbqButtonSuffix`: it is then laid out outside the truncated text and stays fully visible. An unmarked icon shares one box with the text, and such text is clipped without an ellipsis.

<!-- example(button-toggle-tooltip-overview) -->

### Accessibility

A single-selection group is announced as a `radiogroup` of radio buttons: it is a single tab stop, the arrow keys move focus and selection together, and `Home`/`End` jump to the ends of the group. With `multiple` the toggles become independent toggle buttons in a `group`, each with its own pressed state and its own place in the tab order.

Name the group with `aria-label` or `aria-labelledby` so that its purpose is announced along with the selected item:

```html
<kbq-button-toggle-group aria-label="Delivery method">
    <kbq-button-toggle [value]="1">By courier</kbq-button-toggle>
    <kbq-button-toggle [value]="2">By post</kbq-button-toggle>
</kbq-button-toggle-group>
```

An icon carries no accessible name of its own, so a toggle that projects nothing but icons needs one: `aria-label` and `aria-labelledby` are inputs of the toggle and are forwarded to the inner button, which is the element the name is computed for. In development builds such a toggle logs a warning until it is named.
