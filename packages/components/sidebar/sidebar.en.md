Component designed to add collapsible side content.

<!-- example(sidebar-overview) -->

### State Saving

The sidebar remembers whether it was open and how wide it was left, and restores both on the next render. This is on by default — pass `[useStateSaving]="false"` for a sidebar whose state the application owns.

Nothing is persisted while `opened` is bound. A binding there means the application decides, and restoring over it would fight that decision — so a sidebar that should remember its own state is left uncontrolled and toggled through `toggle()` or the `[` / `]` shortcut.

The width is the one the sidebar had when it was last closed, which is what it already reuses when reopening. Dragging a sidebar wider and reloading without closing it keeps the previous width, exactly as before. A sidebar whose content declares no `width` inherits it and stores nothing for it.

The storage key comes from `stateSavingKey`. Without one it is derived from where the sidebar sits in the document: the chain of tag names up to `<body>`, cut short by the first `id` on the way, which becomes the anchor. Two sidebars under the same parent are told apart by their position, so a left and a right sidebar swap keys if their order in the markup changes — give them a `stateSavingKey`, or an `id`, when that is a risk.

A sidebar rendered inside an overlay does not persist: it is not in the document when it initializes and so has no stable key. Use `clearSavedState()` to remove the persisted state.

The state is kept in `localStorage` under a `kbq.state.` prefix, and an entry that goes 90 days without being written or read is collected (`KBQ_STATE_SAVING_TTL`). To keep the state for the tab session only, provide `KbqSessionStorageStateStore`:

```ts
providers: [{ provide: KBQ_STATE_STORE, useExisting: KbqSessionStorageStateStore }];
```

A custom store — a backend, for instance — implements the `KbqStateStore` interface and is provided through the same token. Provided in the sidebar's own `providers`, the replacement is scoped to that sidebar instead of the whole application.

### Keyboard interaction

| <div style="min-width: 110px;">Key</div>       | Action                   |
| ---------------------------------------------- | ------------------------ |
| <span class="docs-hot-key-button">&#91;</span> | Open/close left Sidebar  |
| <span class="docs-hot-key-button">&#93;</span> | Open/close right Sidebar |
