A sidepanel is a window that slides in from the edge of the screen and appears on top of the main page content.

### When to use

A sidepanel is similar to a [modal](/components/modal). It works well when you need to display a large amount of data.

### Component structure

- Header
- Close button (×)
- Body. Can contain text, controls, and input fields
- Footer with action buttons

### How it works

By default the sidepanel appears on the right, but depending on context it can also appear on the left.

#### Modal mode (with page blocking)

When opening, the sidepanel slides in from the edge of the screen and dims the rest of the page (indicating that the dimmed area is not interactive). When closed (or when the overlay is clicked), it slides back out.

<!-- example(sidepanel-overview) -->

##### Disable close on backdrop click

The `disableClose` option in `KbqSidepanelConfig` prevents the sidepanel from being closed by clicking the backdrop or pressing Escape. This is useful when the user must explicitly confirm or dismiss the sidepanel through an action inside it, for example, to avoid losing unsaved changes.

<!-- example(sidepanel-disable-close) -->

#### Non-modal mode (without page blocking)

When opening, the sidepanel slides in from the edge of the screen without dimming the rest of the page, so all elements behind it remain interactive.

<!-- example(sidepanel-normal-mode) -->

#### Stacked panels

You can open another sidepanel from within a sidepanel. Non-modal sidepanels stack on top of each other with an offset. Regardless of how many sidepanels are open, only a single offset is shown to avoid visual noise.

Use this mode when you want to create navigation flows within a sidepanel.

Clicking the vertical area exposed by the panel underneath closes the top panel.

<!-- example(sidepanel-overlayed) -->

##### Mode comparison

| Modal                                        | Non-modal                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------ |
| Not recommended for read-only viewing        | Recommended for read-only viewing                                                    |
| Used for editing like a regular modal dialog | Used only for editing parts of a large object, without explicitly saving those parts |
| Action buttons are always required           | Action buttons are optional                                                          |

#### Focus and keyboard interaction

While the sidepanel is open, focus cycles only through elements inside the panel, including the close button and footer buttons, and does not leave the panel.

##### Focus when the sidepanel is open

When a sidepanel opens, focus moves to an element inside it. Where focus lands depends on the nature and size of the content:

- Focus is set on the first available element inside the sidepanel body, unless there are specific requirements
- If the sidepanel contains a form, focus should be placed on the first input field
- If the sidepanel contains an important irreversible action, it is better to focus on a different, less destructive element
- If the sidepanel contains only action buttons, it is helpful to focus on the button the user is most likely to click ("OK" or "Cancel", depending on the situation)
- If the sidepanel has a lot of content with a scrollbar, setting focus on the first available element may automatically scroll the content and hide its beginning. In this case, add `tabindex=-1` to a static element at the start of the content (a heading or first paragraph) and set focus on it.

##### Focus after closing the sidepanel

When the sidepanel closes, focus returns by default to the element that triggered it (though it is unlikely the user will want to reopen the same sidepanel immediately). If the trigger element no longer exists, focus returns to another element appropriate to the interaction flow.

In some situations, focus may intentionally return to a different element than the one that originally opened the sidepanel. For example, if the task performed in the sidepanel is directly connected to the next step in the workflow. Suppose a table toolbar has an "Add rows" button. Clicking it opens a sidepanel asking for the number and format of new rows. After the sidepanel closes, focus is placed on the first cell of the first new row.

##### Keyboard controls

| <div style="min-width: 100px;">Key</div>                                                   | Action                                                                                                                                     |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| <span class="docs-hot-key-button">Ctrl</span> + <span class="docs-hot-key-button">↵</span> | Perform the primary action of the sidepanel                                                                                                |
| <span class="docs-hot-key-button">Esc</span>                                               | Close the sidepanel:<br>1. If no data was changed in the sidepanel<br>2. If the focused element does not have its own handler for this key |
| <span class="docs-hot-key-button">↵</span>                                                 | Submit the form when pressing Enter in any text input                                                                                      |

### State Saving

A sidepanel can remember whether it was open, so the next visit brings it back. Pass a `stateSavingKey` in `KbqSidepanelConfig` to opt in — without one nothing is persisted, because a sidepanel lives in an overlay and the `id` it generates for itself means something different on every load.

Unlike the components that persist, a sidepanel cannot restore itself. It exists only while it is open, so at the moment the state would be read there is nothing left to read it, and what to reopen — a component class or a `TemplateRef`, together with its `data` — cannot be written to storage either. So `KbqSidepanelService` keeps the flag, and the application opens the panel again:

```ts
private readonly sidepanel = inject(KbqSidepanelService);

constructor() {
    afterNextRender(() => {
        if (this.sidepanel.wasOpen('filters')) this.openFilters();
    });
}

protected openFilters(): void {
    this.sidepanel.open(this.filters(), { stateSavingKey: 'filters', hasBackdrop: false });
}
```

<!-- example(sidepanel-state-saving) -->

What is recorded is a sidepanel closed on its own — through the close button, the backdrop, Escape, or `KbqSidepanelRef.close()`. Closing a group leaves the flag alone: `closeAll()`, and the service being destroyed, are the owner going away rather than a decision to close this panel, so a panel that was open comes back whether the page was reloaded or navigated away from. Use `clearSavedState(key)` to forget it.

Two sidepanels open at once under the same key share one entry, and closing either records the panel as closed — dev mode warns when that happens. Give each one its own key.

Consider what reopening does to the page. A modal sidepanel comes back with its backdrop and its focus trap, over a page the reader has not looked at yet; a non-modal one (`hasBackdrop: false`) blocks nothing.

State is stored in `localStorage` under the `kbq.state.` prefix, and an entry that goes 90 days without being read or written is collected (`KBQ_STATE_SAVING_TTL`). `KbqStateSavingService` reports it alongside the components that persist, and its `setEnabled(false)` turns persistence off for the whole application, this included.

### Design and animation

#### Size

The panel takes up the full height of the browser window. There is no horizontal scroll — content must fit within the panel width.

| Preset | Width         |
| ------ | ------------- |
| Small  | 400           |
| Medium | 640 (default) |
| Large  | 960           |

<!-- example(sidepanel-sizes) -->

The width is chosen by the designer and analyst based on the task. In addition to a fixed pixel width, the width can be set as a percentage of the total screen width, with defined minimum and maximum pixel values. Percentages allow the sidepanel to scale proportionally, while the limits prevent it from becoming too wide or too narrow. In specific cases a plain fixed pixel width can be used.

When choosing the sidepanel size, consider the following:

- Content size. A panel that is too wide or too narrow looks poor.
- Page grid. It looks good when the sidepanel appears proportional on the page and aligns with other blocks. Ideal sidepanel proportions: 1/4, 1/3, 1/2, 2/3, or 3/4 of the main window.
- Usage scenarios. If a non-modal panel is used to view an item from a list, it should ideally not cover the entire list — this preserves the ability to quickly switch between items. If a non-modal panel is used to organize parallel workspaces, verify that the areas do not interfere with each other or with the primary workflow.
- Consistency. The product will look cleaner and more cohesive if it does not use many sidepanels with different widths. Ideally, use one size, two at most.
