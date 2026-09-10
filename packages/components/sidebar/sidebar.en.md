Component designed to add collapsible side content.

<!-- example(sidebar-overview) -->

### State Saving

The sidebar remembers whether it was open and the width it was closed at, and restores both on the next render. On by default — pass `[useStateSaving]="false"` where the state belongs to the application.

<!-- example(sidebar-state-saving) -->

Nothing is persisted while `opened` is bound — a binding there means the application decides. A sidebar that should remember its own state is left uncontrolled and toggled through `toggle()` or the `[` / `]` shortcut.

`clearSavedState()` removes what is stored.

Keys, storage and expiry work the same for every component that persists — see [Saving component state](/en/components/core/overview#saving-component-state).

### Keyboard interaction

| <div style="min-width: 110px;">Key</div>       | Action                   |
| ---------------------------------------------- | ------------------------ |
| <span class="docs-hot-key-button">&#91;</span> | Open/close left Sidebar  |
| <span class="docs-hot-key-button">&#93;</span> | Open/close right Sidebar |
