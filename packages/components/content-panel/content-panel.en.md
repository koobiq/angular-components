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

### State Saving

The content panel remembers whether it was open and how wide it was dragged, and restores both on the next render. On by default — pass `[useStateSaving]="false"` where the state belongs to the application.

<!-- example(content-panel-state-saving) -->

`opened` is restored only while it is unbound: an application that binds `[(opened)]` decides when the panel is open. `width` is always restored — the input is the width the panel starts at, and the persisted one wins over it.

Double-clicking the resizer resets the width to the one `width` declares, and that reset is persisted. `clearSavedState()` removes what is stored.

Keys, storage and expiry work the same for every component that persists — see [Saving component state](/en/components/core/overview#saving-component-state).

### Keyboard interaction

By default, the `ESCAPE` key closes the panel, but you can disable this behavior using the `disableCloseByEscape` attribute:

```html
<kbq-content-panel-container disableCloseByEscape>
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```
