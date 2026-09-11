Component designed to add collapsible side content.

<!-- example(sidebar-overview) -->

### Resizing

To let people change the width, put the sidebar inside a `kbq-splitter-panel`: the panel owns the size and the collapsed state, and the sidebar swaps its content.

<!-- example(sidebar-with-splitter) -->

### State Saving

The sidebar remembers whether it was open and the width it was closed at, and restores the state after a page reload. On by default — use `[useStateSaving]="false"` to turn it off on a specific component.

<!-- example(sidebar-state-saving) -->

Nothing is persisted while `opened` is bound — a binding there means the application decides. A sidebar that should remember its own state is left uncontrolled and toggled through `toggle()` or the `[` / `]` shortcut.

`clearSavedState()` removes what is stored.

Keys, storage and expiry work the same for every component that persists — see [Saving component state](/en/components/core/overview#saving-component-state).

### Keyboard interaction

| <div style="min-width: 110px;">Key</div>       | Action                   |
| ---------------------------------------------- | ------------------------ |
| <span class="docs-hot-key-button">&#91;</span> | Open/close left Sidebar  |
| <span class="docs-hot-key-button">&#93;</span> | Open/close right Sidebar |
