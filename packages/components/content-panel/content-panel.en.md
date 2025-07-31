`KbqContentPanel` - a slide-out side panel that shifts adjacent content. Often used to implement a quick preview mode for entities from a table.

<!-- example(content-panel-overview) -->

### Grid and content-panel

<!-- example(content-panel-with-grid) -->

### Opening and closing

The panel can be opened or closed using the `toggle()`, `open()` and `close()` methods.

### Panel width

The panel width is configured using the `width`, `minWidth` and `maxWidth` attributes.

```html
<kbq-content-panel-container width="400" minWidth="300" maxWidth="500">
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```

### Keyboard interaction

By default, the `ESCAPE` key closes the panel, but you can disable this behavior using the `disableCloseByEscape` attribute:

```html
<kbq-content-panel-container disableCloseByEscape>
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```
