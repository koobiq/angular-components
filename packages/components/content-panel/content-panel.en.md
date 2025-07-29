`KbqContentPanel` - a slide-out side panel that shifts adjacent content. Often used to implement a quick preview mode for entities from a table.

<!-- example(content-panel-overview) -->

### Opening and closing

The panel can be opened or closed using the `toggle()`, `open()` and `close()` methods.

```html
<kbq-content-panel-container #panel="kbqContentPanelContainer">
    <button (click)="panel.toggle()">toggle</button>
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```

The opened state can also be set via `opened` property, which supports two-way binding.

```html
<kbq-content-panel-container [(opened)]="opened">
    <button (click)="opened = !opened">toggle</button>
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```

### Reacting to scroll events

To react to scrolling inside the `<kbq-content-panel-container>` or `<kbq-content-panel>`, you can get `CdkScrollable` instances and subscribe to their `elementScrolled()` observable.

<!-- example(content-panel-scroll-events) -->

### Keyboard interaction

By default, the `ESCAPE` key closes the panel, but you can disable this behavior using the `disableCloseByEscape` attribute:

```html
<kbq-content-panel-container disableCloseByEscape>...</kbq-content-panel-container>
```
