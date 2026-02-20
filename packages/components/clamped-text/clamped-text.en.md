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
