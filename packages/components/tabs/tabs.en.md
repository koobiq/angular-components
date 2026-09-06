Tabs divide content into groups and allow you to switch between them without reloading the page.

<!-- example(tabs-overview) -->

### States

#### Vertical tabs

You can place a long list of tabs vertically so all elements can be visible without scrolling. To enable the function, use the `vertical` attribute.

<!-- example(tabs-vertical) -->

You can use untitled vertical tabs. In this case, add a tooltip for icons to clarify the name of each section.

<!-- example(tabs-vertical-icons) -->

#### Underlined tabs

Use the `underlined` attribute.

<!-- example(tabs-underlined) -->

If a tab contains only an icon without a label, add the `iconOnly` attribute to the `kbqTabLabel` directive - this sets a fixed size of 32×32px for the clickable area.

#### Disabled

A disabled tab can't be selected. It doesn't have interactive states.

<!-- example(tabs-disabled) -->

#### Empty tab

To specify that a tab is empty, use the `empty` attribute. You can select such a tab, and it has interactive states.

<!-- example(tabs-empty-label) -->

Don't use empty tabs together with inactive tabs. They look similar, which may confuse users.

#### Scroll

Horizontal tabs don't wrap or shrink. If there isn't enough space, some tabs are hidden and scroll buttons appear at the edges. Tabs can also be scrolled horizontally on a touchpad, with the mouse wheel while holding Shift, or by dragging.

<!-- example(tabs-with-scroll) -->

Vertical tabs can be scrolled if they don't fit within the available height.

<!-- example(tabs-with-scroll-vertical) -->

#### Adjusting to the container width

By default, the width of horizontal tabs depends on the text inside them. If necessary, the panel with tabs can match the container width. For this, use the `kbq-stretch-tabs` attribute.

<!-- example(tabs-stretch) -->

### Customizable tab design

You can configure how tabs look according to your product design using the `kbqTabLabel` directive.

<!-- example(tabs-custom-label) -->

### Tabs and navigation

Unlike `KbqTabGroup`, `KbqTabNavBar` is used for navigation between application pages or sections (using `routerLink`).

<!-- example(tabs-nav-bar-overview) -->

### Creating tabs

Create and delete tabs like in a browser. The create button is located at the end of the list of tabs. When there is scrolling, the button moves to the right to remain visible.

<!-- example(tabs-add-tab) -->

Vertical tabs

<!-- example(tabs-add-tab-vertical) -->

### Hot keys

| <span style="min-width: 140px;">Key</span>                                                      | Action                             |
| ----------------------------------------------------------------------------------------------- | ---------------------------------- |
| <span class="docs-hot-key-button">←</span>                                                      | Move the focus to the previous tab |
| <span class="docs-hot-key-button">→</span>                                                      | Move the focus to the next tab     |
| <span class="docs-hot-key-button">Home</span>                                                   | Move the focus to the first tab    |
| <span class="docs-hot-key-button">End</span>                                                    | Move the focus to the last tab     |
| <span class="docs-hot-key-button">Space</span> / <span class="docs-hot-key-button">Enter</span> | Select the tab in focus            |

### State Saving

A tab group remembers which tab was selected and restores it on the next render. This is on by default — pass `[useStateSaving]="false"` for a group whose selection the application owns.

<!-- example(tabs-state-saving) -->

Nothing is persisted while `selectedIndex` or `activeTab` is bound: the selection belongs to whatever drives that binding, and restoring over it would fight the application.

Give the tabs a `tabId`. The selection is stored by id and by position, and the id is the only one that survives the tabs being reordered — without it the position restores a different tab, and a warning says so in dev mode. Where the saved id no longer names a tab, the position is used; where neither matches, nothing is restored and the group selects what it would have selected anyway.

`kbq-tab-nav-bar` never persists. It is the navigation variant, where the router decides which link is active, and the URL is the state worth restoring.

The storage key comes from `stateSavingKey`. Without one it is derived from where the group sits in the document: the chain of tag names up to `<body>`, cut short by the first `id` on the way, which becomes the anchor. A group inside `<section id="report">` persists under `#report/kbq-tab-group`, so everything above that `id` can be restructured without moving the key. Restructuring below it does move the key, and what was saved under the previous one is left behind until it expires — set `stateSavingKey`, or an `id`, wherever that matters.

A tab group rendered inside an overlay does not persist: it is not in the document when it initializes and so has no stable key. Use `clearSavedState()` to remove the persisted state.

The state is kept in `localStorage` under a `kbq.state.` prefix, and an entry that goes 90 days without being written or read is collected (`KBQ_STATE_SAVING_TTL`). To keep the state for the tab session only, provide `KbqSessionStorageStateStore`:

```ts
providers: [{ provide: KBQ_STATE_STORE, useExisting: KbqSessionStorageStateStore }];
```

A custom store — a backend, for instance — implements the `KbqStateStore` interface and is provided through the same token. Provided in the group's own `providers`, the replacement is scoped to that group instead of the whole application. When it is one of the browser storages, extend `KbqWebStorageStateStore` instead: it already guards against SSR, unavailable storage and unreadable payloads.

### Recommendations

Use tabs in the following cases:

- For content navigation on a page when it's vital to have quick access to separate parts.
- For additional navigation.

Don't use tabs in the following cases:

- When you can place all content on a single page or screen. There's no need to hide some of its parts under tabs.
- For selecting values in forms. Don't confuse tabs with input boxes: [radio buttons](/en/components/radio) and [button toggles](/en/components/button-toggle).
- For main navigation. Use the [Navbar](/en/components/navbar) component instead.
- When you need to change the view for the same type of data (list, tile, or table). Instead, use a [button menu](/en/components/dropdown) or [button toggle](/en/components/button-toggle).
- When there's already content in a tab. You can't use both vertical and horizontal tabs at the same time. Instead, use fewer tabs, use only one type of tab, a button toggle, or button menu.
- If there's only one tab, you don't need a panel with tabs.
- For indicating steps in the form master. Tabs have a similar appearance to steps. To make sure that there is no confusion, a designer must use different styles for these elements. It's useful to leave a comment for a developer as well. For example: Note that these are form steps, not tabs.
