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

The content panel remembers whether it was open and how wide it was dragged, and restores both on the next render. This is on by default — pass `[useStateSaving]="false"` for a panel whose state the application owns.

<!-- example(content-panel-state-saving) -->

The two halves are owned differently, and persistence follows that:

- **`opened` is restored only while it is unbound.** It is a two-way binding, so an application that binds `[(opened)]` decides when the panel is open and the persisted value is ignored.
- **`width` is always restored.** There is no `widthChange` output — a drag never reaches the application — so `[width]` is the width the panel starts at rather than the width it currently has. The persisted width wins over it, and changing the input still resets the panel to the new value. A restored width is held inside `minWidth` and `maxWidth`, which may differ from the bounds it was saved under.

Double-clicking the resizer resets the width to the one `width` declares, and that reset is persisted — the dragged width does not come back on the next visit. A drag is written once it settles rather than on every frame.

The storage key comes from `stateSavingKey`. Without one it is derived from where the container sits in the document: the chain of tag names up to `<body>`, cut short by the first `id` on the way, which becomes the anchor. So a container inside `<section id="workspace">` persists under `#workspace/kbq-content-panel-container`, and everything above that `id` can be restructured without moving the key.

A container rendered inside an overlay does not persist: it is not in the document when it initializes and so has no stable key. Use `clearSavedState()` to remove the persisted state.

The state is kept in `localStorage` under a `kbq.state.` prefix, and an entry that goes 90 days without being written or read is collected (`KBQ_STATE_SAVING_TTL`). To keep the state for the tab session only, provide `KbqSessionStorageStateStore`:

```ts
providers: [{ provide: KBQ_STATE_STORE, useExisting: KbqSessionStorageStateStore }];
```

A custom store — a backend, for instance — implements the `KbqStateStore` interface and is provided through the same token. Provided in the container's own `providers`, the replacement is scoped to that panel instead of the whole application.

### Keyboard interaction

By default, the `ESCAPE` key closes the panel, but you can disable this behavior using the `disableCloseByEscape` attribute:

```html
<kbq-content-panel-container disableCloseByEscape>
    <kbq-content-panel>...</kbq-content-panel>
</kbq-content-panel-container>
```
