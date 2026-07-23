`kbq-timezone-select` is a timezone selection component that extends `kbq-select`. It has the same capabilities, except for multiple selection. It can work with both `kbq-timezone-option` and `kbq-option`.

`kbq-timezone-option` is a timezone list item that extends `kbq-option`. It has the same capabilities but its own display template.

<!-- example(timezone-overview) -->

### Dropdown menu size

The menu width is configured exactly as on the [select](/en/components/select), with the same attributes: by default the menu grows with its content, never gets narrower than the field or than 200 pixels, and stops at 640 pixels.

```html
<!-- Match the field exactly -->
<kbq-timezone-select panelWidth="auto" />

<!-- A fixed width; panelMinWidth is not applied to it -->
<kbq-timezone-select [panelWidth]="800" />

<!-- Let the menu grow further with its content -->
<kbq-timezone-select [panelMaxWidth]="800" />
```

### Search

<!-- example(timezone-search-overview) -->

### Custom trigger

`kbq-timezone-select-trigger` is a directive that allows you to define a custom display for the selected value.

<!-- example(timezone-trigger-overview) -->
